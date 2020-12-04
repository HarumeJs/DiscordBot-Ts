import { Guild, Message } from 'discord.js'

import Command from '../../structures/Command'
import * as Util from '../../utils/util'
import * as config from '../../config'

import { Temprole } from '../../utils/db'

export default class DeleteTemproleCommand extends Command {
  get options() {
    return { name: 'личнаяроль удалить' }
  }

  async execute(message: Message) {
    const guild = message.guild as Guild

    const { temprole1d, temprole3d, temprole7d } = config.ids.goods
    const temproleGoods = [temprole1d, temprole3d, temprole7d]
    const roleDoc = await Temprole.findOne(d => {
      if (typeof d.itemID !== 'number') return false
      return d.userID === message.author.id && temproleGoods.includes(d.itemID)
    })
    if (!roleDoc) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Личная роль не найдена'
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
            `Удаление личной роли <@&${roleDoc.roleID}>`,
            '',
            'Подтвердите свое действие'
          ].join('\n')
        }
      })
      .catch(() => {})
    if (!confirmMsg) return

    const confirmRes = await Util.confirm(
      confirmMsg,
      message.author,
      config.meta.temproleDeleteConfirmLimit
    )
    confirmMsg.delete().catch(() => {})
    if (!confirmRes) return

    Temprole.deleteOne({ roleID: roleDoc.roleID })

    const role = guild.roles.cache.get(roleDoc.roleID)
    if (role) role.delete().catch(() => {})
  }
}
