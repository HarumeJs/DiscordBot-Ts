import {
  User,
  Message,
  ClientUser,
  NewsChannel,
  TextChannel,
  MessageEmbedOptions
} from 'discord.js'

import client from '../main'

import * as Util from '../utils/util'
import * as config from '../config'

const { emojis } = config.meta

export type EmbedCode = MessageEmbedOptions & { content?: string }

export default class PreviewMessage {
  public code: EmbedCode
  public message?: Message
  public returned: boolean = false

  static readonly ActionCodes = {
    RETURN: 0x0,
    GET_CODE: 0x01,
    NEW_CODE: 0x02,
    EDIT_MESSAGE: 0x04
  }

  static readonly EmojiActions = {
    null: PreviewMessage.ActionCodes.RETURN,
    [emojis.previewMsg.return]: PreviewMessage.ActionCodes.RETURN,
    [emojis.previewMsg.getCode]: PreviewMessage.ActionCodes.GET_CODE,
    [emojis.previewMsg.newCode]: PreviewMessage.ActionCodes.NEW_CODE,
    [emojis.previewMsg.editMessage]: PreviewMessage.ActionCodes.EDIT_MESSAGE
  }

  static readonly ActionDescriptions = {
    [emojis.previewMsg.return]: 'Отмена',
    [emojis.previewMsg.getCode]: 'Получить код превью',
    [emojis.previewMsg.newCode]: 'Вставить новый код сообщения',
    [emojis.previewMsg.editMessage]: 'Применить изменения'
  }

  get Actions() {
    return {
      [String(PreviewMessage.ActionCodes.RETURN)]: (message: Message) => {
        message.delete().catch(() => {})
        if (this.message) this.message.delete().catch(() => {})
        this.returned = true
      },
      [String(PreviewMessage.ActionCodes.GET_CODE)]: async (
        message: Message
      ): Promise<void> => {
        const code = { ...this.code }
        delete code.files
        delete (code.image || {}).width
        delete (code.image || {}).height
        delete (code.image || {}).proxyURL
        delete (code.image || {}).proxy_url
        delete (code.author || {}).proxyIconURL
        delete (code.author || {}).proxy_icon_url
        delete (code.footer || {}).proxyIconURL
        delete (code.footer || {}).proxy_icon_url
        delete (code.thumbnail || {}).width
        delete (code.thumbnail || {}).height
        delete (code.thumbnail || {}).proxyURL
        delete (code.thumbnail || {}).proxy_url

        const fullContent = JSON.stringify(code, null, 2).replace(
          /[_*~<`]/g,
          '\\$&'
        )
        const contents = Util.splitMessage(fullContent)
        const promises = []
        try {
          for (const content of contents) {
            const promise = message.channel.send({
              embed: {
                color: config.meta.defaultColor,
                description: content
              }
            })
            promises.push(promise)
            await promise
          }
          const messages = await Promise.all(promises)

          message.delete().catch(() => {})
          return this.ask(messages).then(() => {})
        } catch (_) {
          message
            .edit({
              embed: {
                color: config.meta.defaultColor,
                description: 'Не удалось отправить код сообщения'
              }
            })
            .catch(() => {})
        }
      },
      [String(PreviewMessage.ActionCodes.NEW_CODE)]: async (
        message: Message
      ) => {
        message.reactions.removeAll().catch(() => {})
        message.edit({
          embed: {
            color: config.meta.defaultColor,
            description: [
              'Ожидание нового кода сообщения.',
              'У вас 5 минут на отправку нового содержимого сообщение, иначе процесс будет отменен.'
            ].join('\n')
          }
        })

        const msg = await message.channel
          .awaitMessages(m => m.author.id === this.author.id, {
            max: 1,
            idle: 3e5
          })
          .then(collected => collected.first())
          .catch(() => {})

        message.delete().catch(() => {})
        if (msg) {
          const attachment = msg.attachments.first()
          const newPlainCode =
            msg.content || (await Util.getEmbedCode(attachment)) || ''
          msg.delete().catch(() => {})
          if (typeof newPlainCode === 'string') {
            try {
              const parsedCode = JSON.parse(newPlainCode)
              this.update(parsedCode)
            } catch (_) {}
          }
        }

        return this.ask()
      },
      [String(PreviewMessage.ActionCodes.EDIT_MESSAGE)]: (
        message: Message
      ): void => {
        message.delete().catch(() => {})
        if (this.message) this.message.delete().catch(() => {})
      }
    }
  }

  constructor(embed: EmbedCode, public author: User) {
    this.code = embed
  }

  get url() {
    if (!this.message) return null
    return `https://discordapp.com/channels/${
      this.message.guild ? this.message.guild.id : '@me'
    }/${this.message.channel.id}/${this.message.id}`
  }

  async ask(messages: Message[] = []) {
    return new Promise(async (resolve, reject) => {
      if (!this.message) return
      const msg = await this.message.channel.send({
        embed: {
          color: config.meta.defaultColor,
          description: [
            Object.entries(PreviewMessage.ActionDescriptions)
              .map(([emoji, desc]) => {
                return `${Util.resolveEmoji(emoji) || emoji}: ${desc}`
              })
              .join('\n'),
            '',
            `**[[Превью]](${this.url})**`
          ].join('\n')
        }
      })

      Util.getReaction(
        msg,
        Object.keys(PreviewMessage.EmojiActions).filter(Boolean),
        this.author
      )
        .then(reaction => {
          const emoji = (reaction || {}).emoji || { id: null, name: null }
          const emojiID = emoji.id || emoji.name
          const actionKey = emojiID as keyof typeof PreviewMessage.EmojiActions
          return String(PreviewMessage.EmojiActions[actionKey])
        })
        .then(actionkey => {
          const { Actions } = this
          return Actions[actionkey as keyof typeof Actions]
        })
        .then(async action => {
          if (typeof action !== 'function') return
          if (messages.length > 0) {
            const channel = messages[0].channel
            if (channel.type === 'dm') {
              for (const message of messages) {
                const clientUser = client.user as ClientUser
                const requestOptions = {
                  method: 'DELETE',
                  headers: {
                    Authorization: `${clientUser.bot ? 'Bot ' : ''}${
                      client.token
                    }`
                  }
                }
                await Util.discordRetryHandler(
                  `channels/${channel.id}/messages/${message.id}`,
                  requestOptions
                )
              }
            } else if (['text', 'news'].includes(channel.type)) {
              await channel.bulkDelete(messages).catch(() => {})
            }
          }
          resolve(action(msg))
        })
        .catch(reject)
    })
  }

  update(code: EmbedCode) {
    if (!this.message) return

    this.code = code
    const embed = { ...this.code }
    const content = embed.content
    delete embed.content
    this.message.edit(content, { embed }).catch(() => {})
  }

  send(channel: TextChannel | NewsChannel) {
    const embed = { ...this.code }
    const content = embed.content
    delete embed.content
    return channel
      .send(content, { embed })
      .then(msg => {
        this.message = msg
        return msg
      })
      .catch(() => {})
  }
}
