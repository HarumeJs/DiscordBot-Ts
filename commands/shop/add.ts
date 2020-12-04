import { Message } from 'discord.js'

import Command from '../../structures/Command'
import * as config from '../../config'

import { nil, CustomEmbedData } from '../../utils/types'

export default class ShopAddCommand extends Command {
  get options() {
    return { name: 'магазин добавить' }
  }

  get cOptions() {
    return {
      suppressArgs: false,
      allowedRoles: ['739918620796125245', '740312785967251467']
    }
  }

  execute(message: Message, args: string[]) {
    const rawJson = args.join(' ')

    let json: CustomEmbedData | nil
    try {
      json = JSON.parse(rawJson)
    } catch (err) {
      message
        .reply(`Ошибка обработки: ${err}`)
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
    }
    if (!json) return

    const content = json.content || json.text || json.plainText || ''

    if (typeof json.thumbnail === 'string') {
      json.thumbnail = { url: json.thumbnail }
    }
    if (typeof json.image === 'string') {
      json.image = { url: json.image }
    }

    try {
      message.channel.send(content, { embed: json })
    } catch (err) {
      message
        .reply(`Ошибка отправки: ${err}`)
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
    }
  }
}
