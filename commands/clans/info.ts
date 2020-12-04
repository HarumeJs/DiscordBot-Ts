import { Message, MessageEmbedOptions } from 'discord.js'

import Command from '../../structures/Command'
import clanManager from '../../managers/clan'
import * as config from '../../config'

import { User } from '../../utils/db'

export default class ClanInfoCommand extends Command {
  get options() {
    return { name: 'гильдияинфо' }
  }
  get cOptions() {
    return { prefix: '/' }
  }

  async execute(message: Message) {
    const userDoc = await User.getOne({ userID: message.author.id })
    if (typeof userDoc.clanID !== 'string') {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Вы не состоите в гильдии',
            image: { url: 'https://i.imgur.com/bykHG7j.gif' }
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const clan = clanManager.get(userDoc.clanID)
    if (!clan) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description:
              'Внутренняя ошибка: Гильдия не найдена. Обратитесь к тех. администрации сервера',
            image: { url: 'https://i.imgur.com/bykHG7j.gif' }
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const embed: MessageEmbedOptions = {
      color: clan.color || config.meta.defaultColor,
      title: clan.name,
      description: clan.description || 'Отсутствует'
    }

    if (clan.flag) embed.image = { url: clan.flag }

    message.channel.send({ embed }).catch(() => {})
  }
}
