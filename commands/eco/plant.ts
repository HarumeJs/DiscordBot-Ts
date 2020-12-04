import { Message } from 'discord.js'

import Command from '../../structures/Command'
import * as Util from '../../utils/util'
import * as config from '../../config'

import { User, Plant } from '../../utils/db'

export default class extends Command {
  get options() {
    return { aliases: ['выкинуть'] }
  }

  execute(message: Message, args: string[]) {
    const amountString = args.join('').replace(/\D/g, '')
    if (amountString.length < 1) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите кол-во золота'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const amount = parseInt(amountString)
    if (!Number.isFinite(amount)) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите корректное кол-во золота для перевода'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    User.getOne({ userID: message.author.id }).then(userDoc => {
      if (userDoc.gold < amount) {
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

      Plant.insertOne({ userID: message.author.id, amount, tick: Date.now() })

      userDoc.gold -= amount
      userDoc.save()

      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: `Вы выкинули ${amount.toLocaleString('ru-RU')}${
              Util.resolveEmoji(config.meta.emojis.cy).trim()
            }`
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
        .catch(() => {})
    })
  }
}
