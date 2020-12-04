import { Message } from 'discord.js'

import Command from '../../structures/Command'
import * as Util from '../../utils/util'
import * as config from '../../config'

import { User } from '../../utils/db'

export default class extends Command {
  get options() {
    return { aliases: ['награда'] }
  }

  execute(message: Message) {
    const targetUser = message.author

    User.getOne({ userID: targetUser.id }).then(doc => {
      const now = Date.now()
      const difference = doc.lastTimelyTick + config.meta.timelyInterval - now
      if (difference > 0) {
        message.channel
          .send({
            embed: {
              color: 0x2f3136,
              title: '**Ещё не время, потерпи немного!**',
              thumbnail: { url: 'https://imgur.com/8RNzOR2.gif' },
              description: [
                `${message.author}, ты часто используешь ежедневную награду 〒﹏〒`,
                '',
                `Приходи через **${
                  Util.parseFilteredFullTimeArray(difference)[0]
                }**, чтобы получить ${Util.resolveEmoji(config.meta.emojis.cy).trim()}`
              ].join('\n')
            }
          })
          .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
          .catch(() => {})
        return
      }

      doc.gold += config.meta.timelyAmount
      doc.lastTimelyTick = now
      doc.save()

      message.channel
        .send({
          embed: {
            color: 0x2f3136,
            title: '**Начисление денег!**',
            thumbnail: { url: 'https://imgur.com/8RNzOR2.gif' },
            description: [
              `${
                message.author
              }, ежедневные бесплатные ${config.meta.timelyAmount.toLocaleString(
                'ru-RU'
              )} ${Util.resolveEmoji(config.meta.emojis.cy).trim()} золото!`,
              '',
              `Через **${
                Util.parseFilteredFullTimeArray(config.meta.timelyInterval)[0]
              }** приходи ещё, я буду ждать ヽ(♡‿♡)ノ`
            ].join('\n')
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
        .catch(() => {})
    })
  }
}
