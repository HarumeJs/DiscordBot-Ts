import { Guild, Message } from 'discord.js'

import Command from '../../structures/Command'
import * as Util from '../../utils/util'
import * as config from '../../config'

import { Temproom } from '../../utils/db'

export default class TemproomKickCommand extends Command {
  get options() {
    return { name: 'личнаякомната кикнуть' }
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

    if (targetMember.voice.channelID !== roomDoc.roomID) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Участник не находится в вашей личной комнате'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    targetMember.voice.setChannel(null).catch(() => {})

    message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          description: `Вы временно исключаете ${targetMember} от голосового канала вашей личной комнаты. `
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
