import { Message } from 'discord.js'

import Command from '../structures/Command'
import * as config from '../config'

import { User } from '../utils/db'

export default class TestCommand extends Command {
  get cOptions() {
    return { suppressArgs: false }
  }

  execute(message: Message, args: string[]) {
    const status = args.join(' ')
    if (status.length > config.meta.statusLimit) {
      message.channel
        .send({
          color: config.meta.defaultColor,
          description: 'Ваш статус превышает лимит символов'
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    User.getOne({ userID: message.author.id }).then(userDoc => {
      userDoc.status = status.length < 1 ? undefined : status
      userDoc.save()

      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Статус обновлен!'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
        .catch(() => {})
    })
  }
}
