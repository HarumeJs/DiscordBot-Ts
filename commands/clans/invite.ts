import { Message } from 'discord.js'

import Command from '../../structures/Command'
import * as Util from '../../utils/util'
import * as config from '../../config'

import { User, Clan as Clans } from '../../utils/db'

export default class ClanInviteCommand extends Command {
  get options() {
    return { name: 'гильдия пригласить' }
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

    const clanDoc = await Clans.findOne({ clanID: userDoc.clanID })
    if (!clanDoc) {
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

    if (message.author.id !== clanDoc.ownerID) {
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

    const targetDoc = await User.getOne({ userID: targetMember.id })
    if (typeof targetDoc.clanID === 'string') {
      if (targetDoc.clanID === userDoc.clanID) {
        message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              description: `${targetMember} уже состоит в вашей гильдии. Вы что-то напутали..`,
              image: { url: 'https://i.imgur.com/bykHG7j.gif' }
            }
          })
          .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
          .catch(() => {})
        return
      }
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: `${targetMember} уже состоит в гильдии. Не судьба..`,
            image: { url: 'https://i.imgur.com/bykHG7j.gif' }
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          description: `Вы отправили приглашение ${targetMember}, осталось только дождаться ответа.`,
          image: { url: 'https://i.imgur.com/bykHG7j.gif' }
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
