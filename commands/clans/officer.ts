import { Message } from 'discord.js'

import Command from '../../structures/Command'
import clanManager from '../../managers/clan'

import * as Util from '../../utils/util'
import * as config from '../../config'

import { User } from '../../utils/db'

export default class ClanOfficerCommand extends Command {
  get options() {
    return { name: 'гильдия офицер' }
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
            description: 'Данный участник не состоит в вашей гильдии',
            image: { url: 'https://i.imgur.com/bykHG7j.gif' }
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }
    if (targetClanMember.officer) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Данный участник является офицером гильдии',
            image: { url: 'https://i.imgur.com/bykHG7j.gif' }
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    targetClanMember.makeOfficer()

    message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          description: [
            `Ого, ${targetMember} теперь офицер. Надеюсь, что это заслуженно..`,
            'В любом случае, ждем твоих успехов в "@роль гильдии"!'
          ],
          image: { url: 'https://i.imgur.com/bykHG7j.gif' }
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
