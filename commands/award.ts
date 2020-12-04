import { Message, Permissions } from 'discord.js'

import * as Util from '../utils/util'
import * as config from '../config'

import { User } from '../utils/db'
import { default as Command, CommandParams } from '../structures/Command'

export default class AwardCommand extends Command {
  get cOptions() {
    return {
      prefix: '/',
      suppressArgs: true,
      allowedPerms: Permissions.FLAGS.ADMINISTRATOR,
      allowedRoles: config.access.commands.award
    }
  }

  async execute(message: Message, args: string[], { guild }: CommandParams) {
    const sendError = (content: string) => {
      message.channel
        .send({
          embed: { color: config.meta.defaultColor, description: content }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
    }

    const targetMember = await Util.resolveMember(args[0], guild)
    if (!targetMember) {
      sendError('Участник не найден')
      return
    }

    const amount = Number(args.slice(1).join('').replace(/\D/g, ''))
    if (!Number.isInteger(amount) || amount < 1) {
      sendError('Укажите корректную сумму')
      return
    }

    let type: 'gold' | 'crystals'
    if (amount > config.meta.maxAwardGold) {
      sendError(
        `Максимальное кол-во — ${config.meta.maxAwardGold}${Util.resolveEmoji(
          config.meta.emojis.cy
        ).trim()}`
      )
      return
    }

    if (amount < config.meta.maxAwardCrystals) {
      const confirmMsg = await message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: `Сумма для выдачи: **${amount.toLocaleString(
              'ru-RU'
            )}**\nУкажите валюту, которую хотите выдать, нажав на одну из реакций ниже`
          }
        })
        .catch(() => {})
      if (!confirmMsg) return

      const reaction = await Util.getReaction(
        confirmMsg,
        [config.meta.emojis.cy, config.meta.emojis.donateCy],
        message.author
      )
      confirmMsg.delete().catch(() => {})
      if (!reaction) return

      const resEmojiID = reaction.emoji.id || reaction.emoji.name
      type = resEmojiID === config.meta.emojis.donateCy ? 'crystals' : 'gold'
    } else {
      type = 'gold'
    }

    const userDoc = await User.getOne({ userID: targetMember.id })
    userDoc[type] += amount
    userDoc.save()

    const embed = {
      color: config.meta.defaultColor,
      description: `${targetMember} выдано **${amount.toLocaleString(
        'ru-RU'
      )}${Util.resolveEmoji(
        config.meta.emojis[type === 'gold' ? 'cy' : 'donateCy']
      ).trim()}**`
    }
    message.channel
      .send({ embed })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
