import { Message } from 'discord.js'

import Command from '../../structures/Command'
import * as Util from '../../utils/util'
import * as config from '../../config'

import { User, Plant } from '../../utils/db'

export default class extends Command {
  get options() {
    return { aliases: ['поднять'] }
  }

  execute(message: Message, _: string[]) {
    Plant.getData()
      .then(plants => [...plants.values()])
      .then(plants => {
        if (plants.length < 1) {
          message.channel
            .send({
              embed: {
                color: config.meta.defaultColor,
                description: 'Дропов не найдено'
              }
            })
            .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
            .catch(() => {})
          return
        }

        User.getOne({ userID: message.author.id }).then(userDoc => {
          const amount = plants.reduce((prev, plant) => plant.amount + prev, 0)
          userDoc.gold += amount
          userDoc.save()
          Plant.deleteMany({})

          message.channel
            .send({
              embed: {
                color: config.meta.defaultColor,
                description: `Вы подняли ${amount.toLocaleString('ru-RU')}${
                  Util.resolveEmoji(config.meta.emojis.cy).trim()
                }`
              }
            })
            .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
            .catch(() => {})
        })
      })
  }
}
