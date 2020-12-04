import { Guild, Message } from 'discord.js'

import Command from '../../structures/Command'
import * as Util from '../../utils/util'
import * as config from '../../config'

import { Temproom, User } from '../../utils/db'

export default class DeleteTemproomCommand extends Command {
  get options() {
    return { name: 'личнаякомната изменить' }
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

    const price = config.meta.temproomNamePrice

    const userDoc = await User.getOne({ userID: message.author.id })
    if (userDoc.gold < price) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Недостаточно средств'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const name = args.join(' ')
    if (name.trim().length < 1) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите корректное название'
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
            `С вашего счета будет снято ${price.toLocaleString('ru-RU')}${
              Util.resolveEmoji(config.meta.emojis.cy).trim()
            }`,
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
      config.meta.temproomNameConfirmLimit
    )
    confirmMsg.delete().catch(() => {})
    if (!confirmRes) return

    userDoc.gold -= price
    userDoc.save()

    const room = guild.channels.cache.get(roomDoc.roomID)
    if (room) room.edit({ name }).catch(() => {})

    message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          description: 'Вы изменили название личной комнаты.'
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
