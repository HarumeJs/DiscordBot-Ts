import { Guild, Message } from 'discord.js'

import Command from '../../structures/Command'
import * as config from '../../config'

export default class RolesCommand extends Command {
  get options() {
    return { name: 'роли' }
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
          title: `Количество ролей на сервере — ${guild.roles.cache
            .array()
            .length.toLocaleString('ru-RU')}`
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
