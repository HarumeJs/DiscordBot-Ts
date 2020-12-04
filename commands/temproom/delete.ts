import { Guild, Message } from 'discord.js'

import Command from '../../structures/Command'
import * as Util from '../../utils/util'
import * as config from '../../config'

import { Temproom } from '../../utils/db'

export default class DeleteTemproomCommand extends Command {
  get options() {
    return { name: 'личнаякомната удалить' }
  }

  async execute(message: Message) {
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

    const confirmMsg = await message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          description: [
            `Удаление личной комнаты <#${roomDoc.roomID}>`,
            '',
            'Подтвердите свое действие'
          ].join('\n')
        }
      })
      .catch(() => {})
    if (!confirmMsg) return

    const confirmRes = await Util.confirm(
      confirmMsg,
      message.author,
      config.meta.temproomDeleteConfirmLimit
    )
    confirmMsg.delete().catch(() => {})
    if (!confirmRes) return

    Temproom.deleteOne({ roomID: roomDoc.roomID })

    const room = guild.channels.cache.get(roomDoc.roomID)
    if (room) room.delete().catch(() => {})
  }
}
