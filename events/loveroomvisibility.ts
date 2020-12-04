import { Event } from 'discore.js'
import { Permissions, VoiceChannel, VoiceState } from 'discord.js'

import * as Util from '../utils/util'
import { Pair } from '../utils/db'

async function unvanish(state: VoiceState) {
  const { channel, channelID, guild } = state
  if (!guild) return
  if (!channel) return
  if (!Util.verifyGuild(guild.id)) return

  const pairDoc = await Pair.findOne({ roomID: channelID })
  if (!pairDoc) return

  const everyonePerms = channel.permissionOverwrites.get(guild.id)
  if (
    everyonePerms &&
    everyonePerms.allow.has(Permissions.FLAGS.VIEW_CHANNEL)
  ) {
    return
  }
  channel.updateOverwrite(guild.id, { VIEW_CHANNEL: true }).catch(() => {})
}

async function vanish(state: VoiceState) {
  const { channelID, guild } = state
  if (!guild) return
  if (!channelID) return
  if (!Util.verifyGuild(guild.id)) return

  const channel = guild.channels.cache.get(channelID) as VoiceChannel
  if (!channel) return

  const pairDoc = await Pair.findOne({ roomID: channelID })
  if (!pairDoc) return

  if (channel.members.size > 0) return

  const everyonePerms = channel.permissionOverwrites.get(guild.id)
  if (everyonePerms && everyonePerms.deny.has(Permissions.FLAGS.VIEW_CHANNEL)) {
    return
  }
  channel.updateOverwrite(guild.id, { VIEW_CHANNEL: false }).catch(() => {})
}

export class Join extends Event {
  get options() {
    return { name: 'voiceChannelJoin' }
  }

  async run(_: VoiceState, state: VoiceState) {
    unvanish(state)
  }
}

export class Switch extends Event {
  get options() {
    return { name: 'voiceChannelSwitch' }
  }

  async run(oldState: VoiceState, newState: VoiceState) {
    unvanish(newState)
    vanish(oldState)
  }
}

export class Leave extends Event {
  get options() {
    return { name: 'voiceChannelLeave' }
  }

  async run(state: VoiceState, _: VoiceState) {
    vanish(state)
  }
}
