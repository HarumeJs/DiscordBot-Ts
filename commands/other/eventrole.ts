import { Message } from 'discord.js'

import * as config from '../../config'
import { default as Command, CommandParams } from '../../structures/Command'

const eventroleID = config.ids.roles.event

export default class EventroleCommand extends Command {
  get options() {
    return { name: 'ивентроль' }
  }

  execute(message: Message, _: string[], { guild, member }: CommandParams) {
    const exists = member.roles.cache.has(eventroleID)
    member.roles[exists ? 'remove' : 'add'](eventroleID).catch(() => {})

    message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          author: {
            name: message.author.tag,
            icon_url: message.author.displayAvatarURL({ dynamic: true })
          },
          title: `Ивент роль | ${guild.name}`,
          description: `Вы ${
            exists ? 'отключили' : 'включили'
          } выдачу ивент роли`
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
