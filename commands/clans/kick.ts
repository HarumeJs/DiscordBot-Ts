import { Message } from 'discord.js'

import Command from '../../structures/Command'
import clanManager from '../../managers/clan'

import * as Util from '../../utils/util'
import * as config from '../../config'

import { User } from '../../utils/db'

export default class ClanKickCommand extends Command {
  get options() {
    return { name: 'гильдия выгнать' }
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

    const targetMention = args[0]
    const targetMember = await Util.resolveMember(targetMention)
    if (!targetMember) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Участник не найден',
            image: { url: 'https://i.imgur.com/bykHG7j.gif' }
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const targetClanMember = clan.members.get(targetMember.id)
    if (!targetClanMember) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description:
              'Вы не можете выгнать человека, который не состоит в вашей гильдии.',
            image: { url: 'https://i.imgur.com/bykHG7j.gif' }
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    if (targetClanMember.owner) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Вы сейчас пытались выгнать лидера? Какая наглость..',
            image: { url: 'https://i.imgur.com/bykHG7j.gif' }
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    targetClanMember.kick()

    message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          description: `Вы выгнали ${targetMember} из своей гильдии. Обойдемся без нахлебников. `,
          image: { url: 'https://i.imgur.com/bykHG7j.gif' }
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
