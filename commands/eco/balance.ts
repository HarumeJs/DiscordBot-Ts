import { Message } from 'discord.js'

import Command from '../../structures/Command'
import * as Util from '../../utils/util'
import * as config from '../../config'

import { User } from '../../utils/db'

export default class extends Command {
  get options() {
    return { name: '$' }
  }

  execute(message: Message) {
    const targetUser = message.author

    User.getOne({ userID: targetUser.id }).then(doc => {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            author: {
              name: targetUser.username,
              icon_url: targetUser.displayAvatarURL({ dynamic: true })
            },
            title: `Счёт пользователя | ${targetUser.tag}`,
            thumbnail: { url: 'https://imgur.com/wp3HNDK.gif' },
            fields: [
              {
                // name: 'Золото',
                name: '\u200B',
                value: `${doc.gold.toLocaleString('ru-RU')}${
                  Util.resolveEmoji(config.meta.emojis.cy).trim()
                }`,
                inline: true
              },
              {
                // name: 'Кристаллы',
                name: '\u200B',
                value: `${doc.crystals.toLocaleString(
                  'ru-RU'
                )}${Util.resolveEmoji(config.meta.emojis.donateCy).trim()}`,
                inline: true
              }
            ]
          }
        })
        .catch(() => {})
    })
  }
}
