import { Message } from 'discord.js'

import * as Util from '../../utils/util'
import * as config from '../../config'

import { default as Command, CommandParams } from '../../structures/Command'

export default class AvatarCommand extends Command {
  get options() {
    return { name: 'аватар' }
  }

  async execute(
    message: Message,
    args: string[],
    { guild, member }: CommandParams
  ) {
    const targetMember = (await Util.resolveMember(args[0], guild)) || member
    if (!targetMember) return

    message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          image: {
            url: targetMember.user.displayAvatarURL({
              size: 2048,
              dynamic: true
            })
          }
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
