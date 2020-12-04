import {
  VoiceState,
  VoiceChannel,
  PermissionOverwriteOptions
} from 'discord.js'

import * as Util from '../utils/util'
import * as config from '../config'

import { PrivateRoom } from '../utils/db'
import { PrivateRoomData } from '../utils/types'
import { default as client, privaterooms } from '../main'

const { createPrivate: createPrivateID } = config.ids.channels.voice

export interface StateUpdateData {
  channelID: string | null
  channel: VoiceChannel | null
  privateroom: PrivateRoomData | null
  isCreateroom: boolean
}

export default class PrivateRoomManager {
  static resolveName(state: VoiceState): string {
    const { member } = state
    const displayName = (member || {}).displayName || 'unknown'
    return config.meta.privateRoomName.replace(/{nickname}/g, displayName)
  }

  static resolvePerms(state: VoiceState) {
    const metaPerms = config.meta.permissions.privateroom

    const overwrites: PermissionOverwriteOptions[] = [
      ...metaPerms.default,
      {
        id: state.guild.id,
        allow: metaPerms.everyone.allow || 0,
        deny: metaPerms.everyone.deny || 0
      }
    ]
    if (state.member) {
      overwrites.push({
        id: state.member.id,
        allow: metaPerms.creator.allow || 0,
        deny: metaPerms.creator.deny || 0
      })
    }

    return overwrites
  }

  static create(state: VoiceState) {
    const { channelID, channel, guild, member } = state
    if (!member) return
    if (!channelID) return
    if (channelID !== createPrivateID) return

    if (channel) {
      channel.updateOverwrite(member.id, { CONNECT: false }).catch(() => {})

      setTimeout(() => {
        const newOverwrites = channel.permissionOverwrites.filter((_, k) => {
          return k !== member.id
        })
        channel.overwritePermissions(newOverwrites).catch(() => {})
      }, 3e4)
    }

    guild.channels
      .create(this.resolveName(state), {
        type: 'voice',
        parent: config.ids.categories.privaterooms,
        userLimit: 2,
        permissionOverwrites: this.resolvePerms(state)
      })
      .then(channel => {
        PrivateRoom.insertOne({ roomID: channel.id, ownerID: member.id })
        privaterooms.set(channel.id, { roomID: channel.id, ownerID: member.id })
        member.voice.setChannel(channel.id).catch(() => {})
      })
      .catch(() => member.voice.setChannel(null).catch(() => {}))
  }

  static clean(state: VoiceState) {
    const { channelID, member } = state
    if (!member) return
    if (!channelID) return
    if (!privaterooms.has(channelID)) return

    const channel = client.channels.cache.get(channelID) as VoiceChannel
    if (!channel) return
    if (channel.members.size > 0) return

    PrivateRoom.deleteOne({ roomID: channelID })
    privaterooms.delete(channelID)
    channel.delete().catch(() => {})
  }

  static onJoin(state: VoiceState) {
    if (!Util.verifyGuild(state.guild.id)) return
    PrivateRoomManager.create(state)
  }

  static onSwitch(oldState: VoiceState, newState: VoiceState) {
    if (!Util.verifyGuild(newState.guild.id)) return

    const member = newState.member
    if (!member) return

    const partialOlds: Partial<StateUpdateData> = {}
    partialOlds.channelID = oldState.channelID as string
    partialOlds.channel = partialOlds.channelID
      ? (client.channels.cache.get(partialOlds.channelID) as VoiceChannel)
      : null
    partialOlds.privateroom = partialOlds.channelID
      ? privaterooms.get(partialOlds.channelID)
      : null

    partialOlds.isCreateroom = Boolean(
      partialOlds.channelID && partialOlds.channelID === createPrivateID
    )

    const partialNews: Partial<StateUpdateData> = {}
    partialNews.channelID = newState.channelID as string
    partialNews.channel = partialNews.channelID
      ? (client.channels.cache.get(partialNews.channelID) as VoiceChannel)
      : null
    partialNews.privateroom = partialNews.channelID
      ? privaterooms.get(partialNews.channelID)
      : null
    partialNews.isCreateroom = Boolean(
      partialNews.channelID && partialNews.channelID === createPrivateID
    )

    const olds = partialOlds as StateUpdateData
    const news = partialNews as StateUpdateData

    const oldChannelSize = olds.channel ? olds.channel.members.size : 1

    if (olds.privateroom && news.isCreateroom && oldChannelSize < 1) {
      newState.setChannel(olds.channelID).catch(() => {})
      if (olds.privateroom.ownerID !== member.id) {
        PrivateRoom.updateOne(
          { roomID: olds.channelID },
          { ownerID: member.id }
        )
        privaterooms.set(olds.channelID as string, {
          roomID: olds.channelID as string,
          ownerID: member.id
        })
        ;(olds.channel as VoiceChannel)
          .edit({
            name: PrivateRoomManager.resolveName(newState),
            permissionOverwrites: PrivateRoomManager.resolvePerms(oldState)
          })
          .catch(() => {})
      }
      return
    }

    PrivateRoomManager.create(newState)
    PrivateRoomManager.clean(oldState)
  }

  static onLeave(state: VoiceState) {
    if (!Util.verifyGuild(state.guild.id)) return
    PrivateRoomManager.clean(state)
  }
}
