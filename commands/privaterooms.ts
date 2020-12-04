import {
  Guild,
  Message,
  Permissions,
  VoiceChannel,
  PermissionOverwrites
} from 'discord.js'

import * as Util from '../utils/util'
import * as config from '../config'
import { default as Command, CommandParams } from '../structures/Command'

export class PKickCommand extends Command {
  get options() {
    return { name: 'pkick' }
  }
  get cOptions() {
    return { guildOnly: true }
  }

  async execute(message: Message, args: string[], { member }: CommandParams) {
    const channel = member.voice.channel as VoiceChannel

    if (!Util.validatePrivateroom(member, channel)) return
    const guild = message.guild as Guild

    const mentionString = args.join(' ')
    if (mentionString.length < 1) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите участника'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const targetMember = await Util.resolveMember(mentionString, guild)
    if (!targetMember) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Участник не найден'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    if (targetMember.id === member.id) return

    const sameVoice = targetMember.voice.channelID === member.voice.channelID
    if (!sameVoice) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Участник не находится в вашем голосовом канале'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    targetMember.voice.setChannel(null).catch(() => {})
  }
}

export class PBanCommand extends Command {
  get options() {
    return { name: 'pban' }
  }
  get cOptions() {
    return { guildOnly: true }
  }

  async execute(message: Message, args: string[], { member }: CommandParams) {
    const channel = member.voice.channel as VoiceChannel

    if (!Util.validatePrivateroom(member, channel)) return
    const guild = message.guild as Guild

    const mentionString = args.join(' ')
    if (mentionString.length < 1) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите участника'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const targetMember = await Util.resolveMember(mentionString, guild)
    if (!targetMember) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Участник не найден'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    if (targetMember.id === member.id) return

    const perms = channel.permissionOverwrites.get(member.id)
    const flags = Permissions.FLAGS.CONNECT

    const permsBlocked = perms && perms.deny.has(flags)
    const sameVoice = targetMember.voice.channelID === member.voice.channelID

    if (permsBlocked && !sameVoice) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Участник заблокирован в вашем голосовом канале'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    if (sameVoice) targetMember.voice.setChannel(null).catch(() => {})
    if (!permsBlocked) {
      channel
        .updateOverwrite(targetMember.id, { CONNECT: false })
        .catch(() => {})
    }
  }
}

export class PUnbanCommand extends Command {
  get options() {
    return { name: 'punban' }
  }
  get cOptions() {
    return { guildOnly: true }
  }

  async execute(message: Message, args: string[], { member }: CommandParams) {
    const channel = member.voice.channel as VoiceChannel

    if (!Util.validatePrivateroom(member, channel)) return
    const guild = message.guild as Guild

    const mentionString = args.join(' ')
    if (mentionString.length < 1) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите участника'
          }
        })
        .catch(() => {})
      return
    }

    const targetMember = await Util.resolveMember(mentionString, guild)
    if (!targetMember) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Участник не найден'
          }
        })
        .catch(() => {})
      return
    }

    if (targetMember.id === member.id) return

    const perms = channel.permissionOverwrites.get(
      targetMember.id
    ) as PermissionOverwrites
    const flags = Permissions.FLAGS.CONNECT

    const permsBlocked = perms && perms.deny.has(flags)
    if (!permsBlocked) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Участник не заблокирован в вашем голосовом канале'
          }
        })
        .catch(() => {})
      return
    }

    if (perms.allow.bitfield === 0 && (perms.deny.bitfield ^ flags) === 0) {
      channel.edit({
        permissionOverwrites: channel.permissionOverwrites
          .array()
          .filter(p => p.id !== targetMember.id)
      })
    } else {
      channel
        .updateOverwrite(targetMember.id, { CONNECT: null })
        .catch(() => {})
    }
  }
}
