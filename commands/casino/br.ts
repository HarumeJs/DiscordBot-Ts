import { Message } from 'discord.js'

import Command from '../../structures/Command'

import * as Util from '../../utils/util'
import * as config from '../../config'

import { User } from '../../utils/db'

export default class BrCommand extends Command {
  execute(message: Message, args: string[]) {
    User.getOne({ userID: message.author.id }).then(userDoc => {
      const bet = parseInt(args.join('').replace(/\D/g, ''))
      if (!Number.isInteger(bet)) {
        message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              description: 'Укажите корректную ставку'
            }
          })
          .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
          .catch(() => {})
        return
      }

      const minbet = config.meta.minbrBet
      const maxbet = config.meta.maxbrBet
      if (bet < minbet) {
        message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              description: `Минимальная ставка – ${minbet.toLocaleString(
                'ru-RU'
              )}`
            }
          })
          .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
          .catch(() => {})
        return
      }
      if (bet > maxbet) {
        message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              description: `Максимальная ставка – ${maxbet.toLocaleString(
                'ru-RU'
              )}`
            }
          })
          .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
          .catch(() => {})
        return
      }

      if (userDoc.gold < bet) {
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

      const rmin = config.meta.brMinRandomres
      const rmax = config.meta.brMaxRandomres
      const randres = Math.floor(Math.random() * (rmax - rmin + 1)) + rmin

      const coef =
        (Object.entries(config.meta.brCoef)
          .sort((b, a) => Number(a[0]) - Number(b[0]))
          .find(([r]) => Number(r) < randres) || [])[1] || 0

      const winAmount = Math.floor(bet * (coef - 1))
      userDoc.gold += winAmount
      userDoc.save()

      message.channel.send({
        embed: {
          color: coef < 1 ? config.meta.brLoseColor : config.meta.brWinColor,
          author: {
            name: message.author.tag,
            icon_url: message.author.displayAvatarURL({ dynamic: true })
          },
          description: (coef < 1
            ? [
                `Выпадает **${randres}**, ты проиграл!`,
                '> не расстраивайся, повезет в следующий раз'
              ]
            : [
                `Выпадает **${randres}**, поздравляю тебя!`,
                `> ты получаешь ${Util.pluralNoun(
                  winAmount,
                  '',
                  'свои',
                  'свои'
                )} ${winAmount.toLocaleString('ru-RU')}${Util.resolveEmoji(
                  config.meta.emojis.cy
                ).trim()} ${Util.pluralNoun(
                  winAmount,
                  'чеканную монету',
                  'чеканные монеты',
                  'чеканных монет'
                )}!`
              ]
          ).join('\n')
        }
      })
    })
  }
}
