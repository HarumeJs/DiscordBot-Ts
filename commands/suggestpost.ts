import { Message, MessageEmbed, TextChannel } from 'discord.js'

import client from '../main'
import Command from '../structures/Command'

import * as config from '../config'

export default class extends Command {
  get options() {
    return { name: 'предложить новость' }
  }

  async execute(message: Message, args: string[]) {
    if (message.channel.type !== 'dm') return

    const typeArg = args.shift() || ''
    const typeKey = typeArg.toLowerCase() as keyof typeof config.postTypes
    const channelType = config.postTypes[typeKey]
    if (!channelType) return

    const channelID = config.postChannels[channelType]
    if (!channelID) return

    const channel = client.channels.cache.get(channelID) as TextChannel
    if (!channel) return

    let url: string | null = args.join(' ')
    if (url.length < 1) url = null

    const attachment = message.attachments.first()
    if (!url && !attachment) return

    url = (attachment || { url }).url
    if (typeof url !== 'string') return

    const filename = `image.${url.endsWith('.gif') ? 'gif' : 'png'}`

    const embed = new MessageEmbed({
      files: [{ attachment: url, name: filename }],
      color: 0x2f3136,
      author: {
        name: message.author.username,
        icon_url: message.author.displayAvatarURL({ dynamic: true })
      },
      image: { url: `attachment://${filename}` }
    })

    const msg = await channel.send(embed).catch(() => {})
    if (!msg) return

    message.author
      .send('Ваш пост отправлен на проверку модерации!')
      .catch(() => {})

    // ImgRequest.insertMany([{ msgID: msg.id, channelID: channelID.channelID }])

    await msg.react('698596668769173645').catch(() => {})
    msg.react('698590387002146816').catch(() => {})
  }
}
