import { Message } from 'discord.js'

import clanManager from '../../managers/clan'

import * as Util from '../../utils/util'
import * as config from '../../config'

import { User } from '../../utils/db'
import { default as Command, CommandParams } from '../../structures/Command'

export default class ClanDescriptionCommand extends Command {
  get options() {
    return { name: 'гильдия создатьроль' }
  }
  get cOptions() {
    return { prefix: '/' }
  }

  async execute(message: Message, args: string[], { guild }: CommandParams) {
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

    const colorArg = args.length < 2 ? '' : args.slice(-1)[0]
    const hexColor = Util.resolveHex(colorArg)
    const color = hexColor ? parseInt(hexColor, 16) : undefined
    const name = args.slice(...(hexColor ? [0, -1] : [0])).join(' ')
    const clansrole = guild.roles.cache.get(config.ids.roles.clans)

    if (name.trim().length < 1) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите корректное название роли'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    if (!hexColor) {
      const confirmMsg = await message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Вы не указали цвет роли. Вы уверены?'
          }
        })
        .catch(() => {})
      if (!confirmMsg) return

      const confirmRes = await Util.confirm(
        confirmMsg,
        message.author,
        config.meta.temproleNoColorConfirmLimit
      )
      confirmMsg.delete().catch(() => {})
      if (!confirmRes) return
    }

    const role = await guild.roles.create({
      data: {
        color,
        name,
        hoist: false,
        mentionable: true,
        permissions: [],
        position: (clansrole || {}).position
      }
    })
    clan.edit({ roleID: role.id, color })
    
    message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          description: 'Роль гильдии создана.',
          image: { url: 'https://i.imgur.com/bykHG7j.gif' }
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
