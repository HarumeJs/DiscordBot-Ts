import {
  VoiceState,
  VoiceChannel,
  PermissionOverwriteOptions,
  TextChannel
} from 'discord.js'

import * as Util from '../utils/util'
import * as config from '../config'

import { Event } from '../utils/db'
import { EventData } from '../utils/types'
import { default as client, events } from '../main'

const { createEvent: createEventID } = config.ids.channels.voice

export interface StateUpdateData {
  channelID: string | null
  channel: VoiceChannel | null
  close: EventData | null
  isCreateroom: boolean
}

export default class EventManager {
  static resolveName(state: VoiceState): string {
    const { member } = state
    const displayName = (member || {}).displayName || 'unknown'
    return config.meta.eventRoomName.replace(/{nickname}/g, displayName)
  }

  static resolvePerms(state: VoiceState) {
    const metaPerms = config.meta.permissions.event

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

  static async create(state: VoiceState) {
    const { channelID, channel, guild, member } = state
    if (!member) return
    if (!channelID) return
    if (channelID !== createEventID) return

    if (channel) {
      channel.updateOverwrite(member.id, { CONNECT: false }).catch(() => {})

      setTimeout(() => {
        const newOverwrites = channel.permissionOverwrites.filter((_, k) => {
          return k !== member.id
        })
        channel.overwritePermissions(newOverwrites).catch(() => {})
      }, 3e4)
    }

    const name = this.resolveName(state)
    const perms = this.resolvePerms(state)
    const [room, chat] = await Promise.all([
      guild.channels.create(name, {
        type: 'voice',
        parent: config.ids.categories.events,
        userLimit: 2,
        permissionOverwrites: perms
      }),
      guild.channels.create(name, {
        type: 'text',
        parent: config.ids.categories.events,
        permissionOverwrites: perms
      })
    ]).catch(() => {
      return []
    })

    if (!room || !chat) {
      if (room) room.delete().catch(() => {})
      if (chat) chat.delete().catch(() => {})
      member.voice.setChannel(null).catch(() => {})
      return
    }

    const closeData: EventData = {
      roomID: room.id,
      chatID: chat.id,
      ownerID: member.id
    }
    Event.insertOne(closeData)
    events.set(room.id, closeData)
    member.voice.setChannel(room.id).catch(() => {})
  }

  static clean(state: VoiceState) {
    const { channelID, member } = state
    if (!member) return
    if (!channelID) return
    if (!events.has(channelID)) return

    const channel = client.channels.cache.get(channelID) as VoiceChannel
    if (!channel) return
    if (channel.members.size > 0) return

    channel.delete().catch(() => {})
  }

  static onJoin(state: VoiceState) {
    if (!Util.verifyGuild(state.guild.id)) return
    EventManager.create(state)
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
    partialOlds.close = partialOlds.channelID
      ? events.get(partialOlds.channelID)
      : null

    partialOlds.isCreateroom = Boolean(
      partialOlds.channelID && partialOlds.channelID === createEventID
    )

    const partialNews: Partial<StateUpdateData> = {}
    partialNews.channelID = newState.channelID as string
    partialNews.channel = partialNews.channelID
      ? (client.channels.cache.get(partialNews.channelID) as VoiceChannel)
      : null
    partialNews.close = partialNews.channelID
      ? events.get(partialNews.channelID)
      : null
    partialNews.isCreateroom = Boolean(
      partialNews.channelID && partialNews.channelID === createEventID
    )

    const olds = partialOlds as StateUpdateData
    const news = partialNews as StateUpdateData

    const oldChannelSize = olds.channel ? olds.channel.members.size : 1

    if (olds.close && news.isCreateroom && oldChannelSize < 1) {
      newState.setChannel(olds.channelID).catch(() => {})
      if (olds.close.ownerID !== member.id) {
        const newData: EventData = {
          roomID: olds.close.roomID,
          chatID: olds.close.chatID,
          ownerID: member.id
        }
        Event.updateOne({ roomID: olds.channelID }, newData)
        events.set(olds.channelID as string, newData)

        const newName = EventManager.resolveName(newState)
        const newPerms = EventManager.resolvePerms(oldState)
        ;(olds.channel as VoiceChannel)
          .edit({
            name: newName,
            permissionOverwrites: newPerms
          })
          .catch(() => {})

        const chat = client.channels.cache.get(olds.close.chatID) as TextChannel
        if (chat) {
          chat
            .edit({ name: newName, permissionOverwrites: newPerms })
            .catch(() => {})
        }
      }
      return
    }

    EventManager.create(newState)
    EventManager.clean(oldState)
  }

  static onLeave(state: VoiceState) {
    if (!Util.verifyGuild(state.guild.id)) return
    EventManager.clean(state)
  }

  static onDelete(channel: TextChannel | VoiceChannel) {
    const eventData =
      events.get(channel.id) ||
      [...events.values()].find(c => c.chatID === channel.id)
    if (!eventData) return

    const room = client.channels.cache.get(eventData.roomID) as VoiceChannel
    const chat = client.channels.cache.get(eventData.chatID) as TextChannel

    if (room) room.delete().catch(() => {})
    if (chat) chat.delete().catch(() => {})

    Event.deleteOne({ roomID: eventData.roomID })
    events.delete(eventData.roomID)
  }
}
