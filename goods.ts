import { Guild, User as DiscordUser } from 'discord.js'

import * as Util from './utils/util'
import * as config from './config'

import { Temprole, Temproom } from './utils/db'

export interface Item {
  id: number
  name: string
  emoji: string
  price: number
  duration?: number
  activate?(
    user: DiscordUser,
    args: string[]
  ): Promise<{ ok: boolean; reason?: string }>
}

export const positionEmojis = [
  '749659635241320448',
  '749660008882372679',
  '749660111693152376',
  '749660320410239083',
  '749660509736927282',
  '749660628989378690'
]

export const goods: { [id: string]: Item } = {
  [config.ids.goods.ticket]: {
    id: config.ids.goods.ticket,
    name: 'Лотерейный билет',
    emoji: '725759916605702155',
    price: 250
  },
  [config.ids.goods.temprole1d]: {
    id: config.ids.goods.temprole1d,
    name: 'Роль на 1 день',
    emoji: '725759916110774353',
    price: 700,
    duration: 8.64e7
  },
  [config.ids.goods.temprole3d]: {
    id: config.ids.goods.temprole3d,
    name: 'Роль на 3 дня',
    emoji: '725759916647907459',
    price: 1500,
    duration: 2.592e8
  },
  [config.ids.goods.temprole7d]: {
    id: config.ids.goods.temprole7d,
    name: 'Роль на неделю',
    emoji: '725759916614352906',
    price: 2500,
    duration: 6.048e8
  },
  [config.ids.goods.hero7d]: {
    id: config.ids.goods.hero7d,
    name: 'Hero на неделю',
    emoji: '725759916265963520',
    price: 1500,
    duration: 6.048e8,
    async activate(user: DiscordUser) {
      const roleID = config.ids.roles.hero
      const existing = await Temprole.findOne({
        userID: user.id,
        itemID: this.id
      })
      if (existing) {
        return { ok: false, reason: 'У вас уже имеется данная роль' }
      }

      const guild = Util.getMainGuild() as Guild
      guild.members
        .fetch(user.id)
        .then(member => {
          member.roles.add(roleID).catch(() => {})
          Temprole.insertOne({
            userID: user.id,
            itemID: this.id,
            roleID,
            endTick: this.duration ? Date.now() + this.duration : undefined
          })
        })
        .catch(() => {})
      return { ok: true }
    }
  },
  [config.ids.goods.temproom7d]: {
    id: config.ids.goods.temproom7d,
    name: 'Канал на неделю',
    emoji: '725759916287197334',
    price: 2500,
    duration: 6.048e8,
    async activate(user: DiscordUser, args: string[] = []) {
      const existing = await Temproom.findOne({
        userID: user.id,
        itemID: this.id
      })
      if (existing) {
        return { ok: false, reason: 'У вас уже имеется личная комната' }
      }

      const name = args.join(' ')
      if (name.trim().length < 1) {
        return { ok: false, reason: 'Укажите корректное название канала' }
      }

      const guild = Util.getMainGuild() as Guild
      const categoryID = config.ids.categories.temprooms
      const configPerms = config.meta.permissions.temproom

      return guild.channels
        .create(name, {
          type: 'voice',
          parent: categoryID,
          permissionOverwrites: [
            ...configPerms.default,
            {
              id: guild.id,
              allow: configPerms.everyone.allow || 0,
              deny: configPerms.everyone.deny || 0
            },
            {
              id: user.id,
              allow: configPerms.member.allow || 0,
              deny: configPerms.member.deny || 0
            }
          ]
        })
        .then(channel => {
          Temproom.insertOne({
            userID: user.id,
            itemID: this.id,
            roomID: channel.id,
            slots: config.meta.temproomSlots,
            endTick: this.duration ? Date.now() + this.duration : undefined
          })
          return { ok: true }
        })
        .catch(() => ({ ok: false, reason: 'Ошибка создания комнаты' }))
    }
  }
}

export default goods
