import { Guild, Message } from 'discord.js'

import Command from '../structures/Command'
import * as Util from '../utils/util'
import * as config from '../config'

import { User } from '../utils/db'

const repTypes = { '+1': 1, '-1': -1 }

export default class ReputationCommand extends Command {
  get options() {
    return { name: 'репутация' }
  }

  async execute(message: Message, args: string[]) {
    const authorDoc = await User.getOne({ userID: message.author.id })
    if (
      authorDoc.lastRepTick &&
      authorDoc.lastRepTick + config.meta.reputationInterval > Date.now()
    ) {
      return
    }

    const guild = message.guild as Guild
    const targetMember = await Util.resolveMember(args[0], guild)
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

    const repType = repTypes[args[1] as keyof typeof repTypes]
    if (typeof repType !== 'number') return

    const userDoc = await User.getOne({ userID: targetMember.id })
    userDoc.reputation += repType
    userDoc.save()
  }
}
