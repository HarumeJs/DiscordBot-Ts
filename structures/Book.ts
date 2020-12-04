import {
  User,
  Message,
  APIMessage,
  TextChannel,
  MessageEmbed,
  MessageOptions,
  MessageReaction,
  MessageAttachment
} from 'discord.js'

import * as Util from '../utils/util'
import * as config from '../config'

export type Page =
  | MessageAttachment
  | MessageOptions
  | (MessageOptions & {
      split?: false | undefined
    })
  | MessageEmbed
  | (MessageAttachment | MessageEmbed)[]
  | APIMessage

export default class Book {
  public page: number = 1
  public idle: number
  public dispose: boolean
  public customFilter: (r: MessageReaction, user: User) => boolean
  public customActions: {
    [K: string]: {
      exec: (message: Message) => any
      position?: 'before' | 'after'
    }
  }
  public onEnd: (message: Message) => any

  constructor(
    public pages: Page[],
    options: {
      idle?: typeof Book.prototype.idle
      dispose?: typeof Book.prototype.dispose
      filter?: typeof Book.prototype.customFilter
      actions?: typeof Book.prototype.customActions
      onEnd?: typeof Book.prototype.onEnd
    } = {}
  ) {
    this.idle = options.idle || 1.5e4
    this.dispose = options.dispose || true
    this.customFilter = options.filter || (() => true)
    this.customActions = options.actions || {}
    this.onEnd = options.onEnd || (msg => msg.delete())
  }

  get beforeEmojis() {
    const customEntries = Object.entries(this.customActions)
    const before = customEntries.filter(e => e[1].position === 'before')
    return before.map(e => e[0])
  }

  get afterEmojis() {
    const customEntries = Object.entries(this.customActions)
    const after = customEntries.filter(e => e[1].position !== 'before')
    return after.map(e => e[0])
  }

  get emojis() {
    return [
      ...this.beforeEmojis,
      ...config.meta.emojis.pageControl,
      ...this.afterEmojis
    ]
  }

  get actions() {
    return {
      [config.meta.emojis.pageControl[0]]: {
        exec: (message: Message) => {
          this.page = Math.max(1, Math.min(this.pages.length, this.page - 1))
          message.edit(this.pages[this.page - 1])
        }
      },
      [config.meta.emojis.pageControl[1]]: {
        exec: (message: Message) => {
          this.page = Math.max(1, Math.min(this.pages.length, this.page + 1))
          message.edit(this.pages[this.page - 1])
        }
      },
      ...this.customActions
    }
  }

  private filter(reaction: MessageReaction, user: User): boolean {
    if (!this.customFilter(reaction, user)) return false

    const emojiID = reaction.emoji.id || reaction.emoji.name
    if (!this.emojis.includes(emojiID)) return false
    return true
  }

  public send(channel: TextChannel) {
    return channel.send(this.pages[0]).then(async msg => {
      const collector = msg.createReactionCollector(this.filter.bind(this), {
        dispose: this.dispose,
        idle: this.idle
      })
      collector.on('collect', reaction => {
        const emojiID = reaction.emoji.id || reaction.emoji.name
        if (!this.emojis.includes(emojiID)) return

        const action = this.actions[emojiID]
        action.exec(msg)
      })
      collector.on('end', this.onEnd.bind(this, msg))

      try {
        for (const emoji of this.emojis) await Util.react(msg, emoji)
      } catch (e) {
        Promise.reject(e)
      }
    })
  }
}
