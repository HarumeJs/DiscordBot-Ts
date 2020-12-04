import { Message } from 'discord.js'

import Command from '../../structures/Command'
import * as Util from '../../utils/util'
import * as config from '../../config'

import { User } from '../../utils/db'
import { resolveMember } from '../../utils/util'

export default class extends Command {
  get options() {
    return { name: 'give', aliases: ['передать'] }
  }

  async execute(message: Message, args: string[]) {
    const mentionString = args[0]
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

    const targetMember = await resolveMember(args[0])
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

    const amountString = args.slice(1).join('').replace(/\D/g, '')
    if (amountString.length < 1) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите кол-во золота для перевода'
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

    const promises = [message.author.id, targetMember.id].map(id => {
      return User.getOne({ userID: id })
    })
    const [authorDoc, targetDoc] = await Promise.all(promises)

    if (authorDoc.gold < amount) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Недостаточно золота на счету'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    authorDoc.gold -= amount
    targetDoc.gold += amount
    authorDoc.save()
    targetDoc.save()

    message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          title: '**Перевод средств!**',
          description: [
            `${message.author}, начисляет **${amount.toLocaleString(
              'ru-RU'
            )}**${Util.resolveEmoji(
              config.meta.emojis.cy
            ).trim()} на счет ${targetMember}`,
            'Видимо, у нас появился новый миллионер! ʕ ᵔᴥᵔ ʔ'
          ].join('\n')
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
