import { Guild, Message, Permissions } from 'discord.js'

import Command from '../../structures/Command'
import * as Util from '../../utils/util'
import * as config from '../../config'

import { Temproom } from '../../utils/db'

export default class TemproomGivekeyCommand extends Command {
  get options() {
    return { name: 'выдать ключ' }
  }

  async execute(message: Message, args: string[]) {
    const guild = message.guild as Guild

    const roomDoc = await Temproom.findOne({ userID: message.author.id })
    if (!roomDoc) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Личная комната не найдена'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const targetMember = await Util.resolveMember(args[0], guild)
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

    const room = guild.channels.cache.get(roomDoc.roomID)
    if (room) {
      const flags = Permissions.FLAGS.CONNECT

      const targetPerms = room.permissionOverwrites.get(targetMember.id) || {
        allow: { bitfield: 0 },
        deny: { bitfield: 0 }
      }
      if (targetPerms.allow.bitfield & flags) {
        message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              description: 'У участника уже имеется ключ к вашей комнате'
            }
          })
          .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
          .catch(() => {})
        return
      }

      const keycount = room.permissionOverwrites.array().filter(o => {
        return (
          o.type === 'member' &&
          o.id !== roomDoc.userID &&
          (o.allow.bitfield & flags) > 0
        )
      }).length
      if (keycount >= roomDoc.slots) {
        message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              description: 'Вы превысили ограничение по слотам'
            }
          })
          .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
          .catch(() => {})
        return
      }

      room.updateOverwrite(targetMember.id, { CONNECT: true }).catch(() => {})

      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: `Вы дали доступ к личной комнате ${targetMember}.`
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
        .catch(() => {})
    }
  }
}
