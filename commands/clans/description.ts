import { Message } from 'discord.js'

import Command from '../../structures/Command'
import clanManager from '../../managers/clan'
import * as config from '../../config'

import { User } from '../../utils/db'

export default class ClanDescriptionCommand extends Command {
  get options() {
    return { name: 'гильдия описание' }
  }
  get cOptions() {
    return { prefix: '/' }
  }

  async execute(message: Message, args: string[]) {
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

    if (message.author.id !== clan.ownerID) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Вы не являетесь владельцем гильдии',
            image: { url: 'https://i.imgur.com/bykHG7j.gif' }
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const desc = args.join(' ')

    if (desc.length > config.meta.clanDescLimit) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Описание гильдии превышает лимит по символам',
            image: { url: 'https://i.imgur.com/bykHG7j.gif' }
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    clan.edit({ description: desc })

    message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          description: 'Описание гильдии изменено. Посмотрим, что же там..',
          image: { url: 'https://i.imgur.com/bykHG7j.gif' }
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
