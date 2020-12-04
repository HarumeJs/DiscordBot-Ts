import {
  Message,
  MessageEmbedOptions,
  Permissions,
  TextChannel
} from 'discord.js'

import client from '../main'
import Command from '../structures/Command'
import PreviewMessage from '../structures/PreviewMessage'
import * as config from '../config'

export default class EditCommand extends Command {
  get cOptions() {
    return {
      suppressArgs: true,
      allowedPerms: Permissions.FLAGS.ADMINISTRATOR
    }
  }

  async execute(message: Message, args: string[]) {
    const sendError = (content: any) => {
      message.channel
        .send(content)
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
    }

    const messageLink = args[0] || ''

    const regex = /https:\/\/(canary\.)?discord(?:app)?\.com\/channels\/\d+\/(?<channel>\d+)\/(?<message>\d+)/
    const linkMatch = messageLink.match(regex)
    if (!linkMatch) {
      sendError({
        embed: {
          color: config.meta.defaultColor,
          description: 'Укажите корректную ссылку к сообщению'
        }
      })
      return
    }

    const groups = linkMatch.groups as { [key: string]: string }
    const channel = client.channels.cache.get(groups.channel)
    if (!channel) {
      sendError({
        embed: {
          color: config.meta.defaultColor,
          description: 'Канал не найден'
        }
      })
      return
    }

    if (!('messages' in channel)) {
      sendError({
        embed: {
          color: config.meta.defaultColor,
          description: 'Укажите корректную ссылку к сообщению'
        }
      })
      return
    }

    const textChannel = channel as TextChannel
    const msg = await textChannel.messages.fetch(groups.message).catch(() => {})
    if (!msg) {
      sendError({
        embed: {
          color: config.meta.defaultColor,
          description: 'Сообщение не найдено'
        }
      })
      return
    }

    const msgEmbed: { [key: string]: any } = msg.embeds[0] || {}
    delete msgEmbed.type
    if (msgEmbed.author) delete msgEmbed.author.proxy_icon_url
    if (msgEmbed.footer) delete msgEmbed.footer.proxy_icon_url
    if (msgEmbed.image) {
      delete msgEmbed.image.width
      delete msgEmbed.image.height
      delete msgEmbed.image.proxy_url
    }
    if (msgEmbed.thumbnail) {
      delete msgEmbed.thumbnail.width
      delete msgEmbed.thumbnail.height
      delete msgEmbed.thumbnail.proxy_url
    }

    const embedCode: MessageEmbedOptions & { content?: string } = {
      content: msg.content || '',

      ...(msg.embeds[0] || {}),
      author: msgEmbed.author || undefined,
      thumbnail: msgEmbed.thumbnail || undefined,
      image: msgEmbed.image || undefined,
      video: msgEmbed.video || undefined,
      footer: msgEmbed.footer || undefined,
      timestamp: msgEmbed.timestamp || undefined
    }

    const previewMsg = new PreviewMessage(embedCode, message.author)
    if (!(await previewMsg.send(message.channel as TextChannel))) {
      sendError({
        embed: {
          color: config.meta.defaultColor,
          description: 'Не удалось отобразить превью'
        }
      })
      return
    }

    await previewMsg.ask()
    if (previewMsg.returned) return

    const embed = { ...previewMsg.code }
    const content = embed.content || ''
    delete embed.content
    msg.edit(content, { embed }).catch(() => {})
  }
}
