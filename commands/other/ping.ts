import { Message } from 'discord.js'

import client from '../../main'
import Command from '../../structures/Command'
import * as config from '../../config'

export default class PingCommand extends Command {
  get options() {
    return { name: 'пинг' }
  }

  async execute(message: Message) {
    const executionTick = Date.now()
    message.channel
      .send({
        embed: { color: config.meta.defaultColor, description: 'Проверка..' }
      })
      .then(msg => {
        return msg
          .edit({
            embed: {
              color: config.meta.defaultColor,
              author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL({ dynamic: true })
              },
              description: [
                `Пинг отправки — \`${Date.now() - executionTick}мс\``,
                `Пинг получения — \`${Math.floor(client.ws.ping).toLocaleString(
                  'ru-RU'
                )}мс\``
              ].join('\n')
            }
          })
          .then(() => msg.delete({ timeout: config.meta.msgDeletion }))
      })
      .catch(() => {})
  }
}
