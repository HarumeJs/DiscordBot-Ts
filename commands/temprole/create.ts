import { Message } from 'discord.js'

import goods from '../../goods'
import client from '../../main'

import * as Util from '../../utils/util'
import * as config from '../../config'

import { Temprole, User } from '../../utils/db'
import { default as Command, CommandParams } from '../../structures/Command'

export default class CreateTemproleCommand extends Command {
  get options() {
    return { name: 'личнаяроль создать' }
  }

  async execute(
    message: Message,
    args: string[],
    { guild, member }: CommandParams
  ) {
    const { temprole1d, temprole3d, temprole7d } = config.ids.goods
    const temproleGoods = [temprole1d, temprole3d, temprole7d]
    const existingTemprole = await Temprole.findOne(d => {
      if (typeof d.itemID !== 'number') return false
      return d.userID === message.author.id && temproleGoods.includes(d.itemID)
    })
    if (existingTemprole) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'У вас уже имеется личная роль'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const userDoc = await User.getOne({ userID: message.author.id })

    const invTemproles = temproleGoods
      .map(id => ({
        id,
        name: goods[id].name,
        emoji: goods[id].emoji,
        count: userDoc.inventory[id] || 0,
        duration: goods[id].duration
      }))
      .filter(item => item.count > 0)
    if (invTemproles.length < 1) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'В инвентаре отсутствуют личные роли!'
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
    const temproles = guild.roles.cache.get(config.ids.roles.temproles)

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

    let temprole = invTemproles[0]
    if (invTemproles.length > 1) {
      const msg = await message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: [
              'У вас имеются следующие активации в инвентаре. Выберите то, которое хотели бы использовать',
              '',
              invTemproles
                .map(item => {
                  const emoji =
                    client.emojis.cache.get(item.emoji) ||
                    client.emojis.cache.get(config.emojis.empty) ||
                    ''
                  return `${`${emoji} `.trimLeft()}${item.name}`
                })
                .join('\n')
            ].join('\n')
          }
        })
        .catch(() => {})
      if (!msg) return

      const emojis = invTemproles.map(i => i.emoji)
      const reaction = await Util.getReaction(msg, emojis, [message.author])
      msg.delete().catch(() => {})
      if (!reaction) return

      const emojiID = reaction.emoji.id || reaction.emoji.name
      const chosenitem = invTemproles.find(item => item.emoji === emojiID)
      if (!chosenitem) return

      temprole = chosenitem
    }

    userDoc.inventory = {
      ...userDoc.inventory,
      [temprole.id]: temprole.count - 1
    }
    userDoc.save()

    guild.roles
      .create({
        data: {
          color,
          name,
          hoist: false,
          mentionable: true,
          permissions: [],
          position: (temproles || {}).position
        }
      })
      .then(role => {
        member.roles.add(role.id)
        Temprole.insertOne({
          userID: member.id,
          itemID: temprole.id,
          roleID: role.id,
          endTick:
            typeof temprole.duration === 'number'
              ? Date.now() + temprole.duration
              : undefined
        })

        return message.channel.send({
          embed: {
            color: config.meta.defaultColor,
            title: `${Util.resolveEmoji(config.emojis.roles)}Поздравляю!`,
            thumbnail: { url: 'https://i.imgur.com/9clO0NV.gif' },
            description: [
              'Ты успешно создал(-а) личную роль!',
              `> <@&${role.id}>`
            ].join('\n'),
            footer: {
              text: message.author.tag,
              icon_url: guild.iconURL({ dynamic: true })
            },
            timestamp: Date.now()
          }
        })
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
