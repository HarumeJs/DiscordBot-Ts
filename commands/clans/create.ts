import { Message } from 'discord.js'

import Clan from '../../structures/clan/Clan'
import Command from '../../structures/Command'
import * as config from '../../config'

import { Clan as Clans, User } from '../../utils/db'

export default class CreateClanCommand extends Command {
  get options() {
    return { name: 'гильдия создать' }
  }
  get cOptions() {
    return { prefix: '/' }
  }

  async execute(message: Message, args: string[]) {
    const userDoc = await User.getOne({ userID: message.author.id })
    if (typeof userDoc.clanID === 'string') {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Вы состоите в гильдии',
            image: { url: 'https://i.imgur.com/bykHG7j.gif' }
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const name = args.join(' ')

    if (name.length < 1) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите название гильдии',
            image: { url: 'https://i.imgur.com/bykHG7j.gif' }
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    if (name.length > config.meta.clanNameLimit) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Название гильдии превышает лимит по символам',
            image: { url: 'https://i.imgur.com/bykHG7j.gif' }
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    if (userDoc.gold < config.meta.clanCost) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description:
              'У вас недостаточно средств. Кажется, придется еще немного поработать..',
            image: { url: 'https://i.imgur.com/bykHG7j.gif' }
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const existing = await Clans.findOne({ name })
    if (existing) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description:
              'Гильдия с таким названием уже существует. Мы против плагиата.',
            image: { url: 'https://i.imgur.com/bykHG7j.gif' }
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const clan = Clan.create({ name, ownerID: message.author.id })

    userDoc.gold -= config.meta.clanCost
    userDoc.clanID = clan.clanID
    userDoc.save()

    message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          description: [
            `Поздравляю тебя, ${message.author}, теперь у тебя есть собственная **гильдия.**`,
            'Теперь осталось только пригласить туда своих друзей и ты сможешь весело проводить свое время.'
          ],
          image: { url: 'https://i.imgur.com/bykHG7j.gif' }
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
