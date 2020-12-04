import { Message } from 'discord.js'

import * as config from '../../config'

import { User } from '../../utils/db'
import { default as Command, CommandParams } from '../../structures/Command'

export default class EventroleCommand extends Command {
  get options() {
    return { name: 'игровыероли' }
  }

  execute(message: Message, _: string[], { guild, member }: CommandParams) {
    User.getOne({ userID: member.id }).then(userDoc => {
      userDoc.gameroles = !userDoc.gameroles
      userDoc.save()

      if (!userDoc.gameroles) {
        const roles = Object.values(config.ids.roles.games).filter(id => {
          return member.roles.cache.has(id)
        })
        if (roles.length > 0) member.roles.remove(roles).catch(() => {})
      }

      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            author: {
              name: message.author.tag,
              icon_url: message.author.displayAvatarURL({ dynamic: true })
            },
            title: `Игровые роли | ${guild.name}`,
            description: `Вы ${
              userDoc.gameroles ? 'включили' : 'отключили'
            } выдачу игровых ролей`
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
        .catch(() => {})
    })
  }
}
