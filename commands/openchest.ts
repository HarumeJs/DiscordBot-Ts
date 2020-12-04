import { Message } from 'discord.js'

import goods from '../goods'
import Command from '../structures/Command'

import * as Util from '../utils/util'
import * as config from '../config'

import { User } from '../utils/db'

export default class OpenChest extends Command {
  get options() {
    return { name: 'open chest', aliases: ['открыть сундук'] }
  }

  execute(message: Message) {
    User.getOne({ userID: message.author.id }).then(userDoc => {
      const chest =
        userDoc.itemChests > userDoc.goldChests
          ? config.ids.chests.item
          : config.ids.chests.gold
      const chestKey =
        chest === config.ids.chests.item ? 'itemChest' : 'goldChest'
      if (userDoc[`${chestKey}s`] < 1) {
        message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              description: 'У вас нет сундуков'
            }
          })
          .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
          .catch(() => {})
        return
      }

      const chancesKey = `${chestKey}Chances` as keyof typeof config.meta
      const imagesKey = `${chestKey}Images` as keyof typeof config.meta

      const chances = config.meta[chancesKey]
      const images = config.meta[imagesKey]

      const chanceEntries = Object.entries(chances)
      const maxVal = chanceEntries.reduce((p, c) => p + c[1], 0)

      let minChance = 0
      for (let i = 0; i < chanceEntries.length; i++) {
        const entryChance = chanceEntries[i][1]
        chanceEntries[i][1] = minChance
        minChance += entryChance
      }

      const randres = Math.floor(Math.random() * (maxVal + 1))
      const res = chanceEntries.reverse().find(e => e[1] < randres)
      if (!res) return

      const reskey = res[0]
      const image = images[reskey as keyof typeof images]

      userDoc[`${chestKey}s`] -= 1

      if (chest === config.ids.chests.gold) {
        const win = Number(reskey)
        if (Number.isInteger(win)) userDoc.gold += win
      } else if (Object.values(config.ids.goods).includes(Number(reskey))) {
        userDoc.inventory = {
          ...userDoc.inventory,
          [reskey]: ((userDoc.inventory || {})[reskey] || 0) + 1
        }
      }

      userDoc.save()

      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            image: image ? { url: image } : undefined
          }
        })
        .then(msg => {
          return new Promise<Message>(resolve => {
            setTimeout(() => resolve(msg), 5e3)
          })
        })
        .then(msg => {
          return msg.edit({
            embed: {
              color: config.meta.defaultColor,
              title: '<a:heart:718612246485401727> Ты открыл(-а) сундук!',
              thumbnail: { url: 'https://imgur.com/U6eh9cg.gif' },
              description: [
                'Тебе сегодня знатно везёт.',
                `> ты выиграл(-а) ${
                  chest === config.ids.chests.item
                    ? `${Util.resolveEmoji(goods[reskey].emoji)}**${
                        goods[reskey].name || 'Неизвестно'
                      }**`
                    : `${Number(reskey).toLocaleString('ru-RU')}${
                        Util.resolveEmoji(config.meta.emojis.cy).trim()
                      }`
                }`
              ].join('\n'),
              footer: {
                text: message.author.tag,
                icon_url: message.author.displayAvatarURL({ dynamic: true })
              },
              timestamp: Date.now()
            }
          })
        })
        .catch(() => {})
    })
  }
}
