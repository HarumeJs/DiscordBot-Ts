import { Message } from 'discord.js'

import Command from '../../structures/Command'
import clanManager from '../../managers/clan'

import * as Util from '../../utils/util'
import * as config from '../../config'

import { User } from '../../utils/db'
import { activeClanDeletions } from '../../main'

export default class DeleteClanCommand extends Command {
  get options() {
    return { name: 'удалить гильдию' }
  }
  get cOptions() {
    return { prefix: '/' }
  }

  async execute(message: Message, _: string[]) {
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

    if (clan.ownerID !== message.author.id) {
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

    const confirmMsg = await message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          description: [
            `${message.author}, вы уверены в своем решении, господин?`,
            '',
            'Одумайтесь, пока не поздно!'
          ].join('\n')
        }
      })
      .catch(() => {})
    if (!confirmMsg) return

    activeClanDeletions.add(message.author.id)
    const confirm = await Util.confirm(confirmMsg, message.author)
    activeClanDeletions.delete(message.author.id)

    confirmMsg.delete().catch(() => {})
    if (!confirm) return

    clan.delete()

    message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          description: [
            'Ваша гильдия полностью удалена.',
            'Прошлое изменить нельзя, но можно создать прекрасное будущее.'
          ],
          image: { url: 'https://i.imgur.com/bykHG7j.gif' }
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
