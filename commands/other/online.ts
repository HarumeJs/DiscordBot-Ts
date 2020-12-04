import { Guild, Message } from 'discord.js'

import Command from '../../structures/Command'
import * as config from '../../config'

export default class OnlineCommand extends Command {
  get options() {
    return { name: 'онлайн' }
  }

  async execute(message: Message) {
    const guild = message.guild as Guild

    message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          author: {
            name: message.author.tag,
            icon_url: message.author.displayAvatarURL({ dynamic: true })
          },
          title: `Количество участников в голосовых каналах — ${guild.voiceStates.cache
            .array()
            .length.toLocaleString('ru-RU')}`
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
