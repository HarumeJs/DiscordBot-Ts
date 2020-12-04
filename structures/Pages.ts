import { DMChannel, NewsChannel, TextChannel, Message, User } from 'discord.js'

import * as Util from '../utils/util'
import * as config from '../config'

export default class Pages {
  public page: number = 1
  public message?: Message

  constructor(public pages: any[]) {}

  switchPage(newpage: number) {
    newpage = Math.max(1, Math.min(this.pages.length, newpage))
    if (this.page === newpage) return
    this.page = newpage

    if (!this.message) return
    return this.message.edit(this.pages[this.page - 1]).catch(() => {})
  }

  prevPage() {
    return this.switchPage(this.page - 1)
  }

  nextPage() {
    return this.switchPage(this.page + 1)
  }

  awaitReaction(user: User) {
    const msg = this.message
    if (!msg) return

    const emojis = [
      config.emojis.wastebasket,
      ...config.meta.emojis.pageControl
    ]
    Util.getReactionStatic(msg, emojis, [user], 1.5e4).then(reaction => {
      if (!reaction) return
      reaction.users.remove(user.id)

      const emojiID = reaction.emoji.id || reaction.emoji.name
      const func = {
        [emojis[0]]: () => msg.delete().catch(() => {}),
        [emojis[1]]: () => {
          this.prevPage()
          this.awaitReaction(user)
        },
        [emojis[2]]: () => {
          this.nextPage()
          this.awaitReaction(user)
        }
      }[emojiID]
      if (!func) return

      func()
    })

    return emojis
  }

  send(channel: TextChannel | NewsChannel | DMChannel, user: User) {
    return channel.send(this.pages[this.page - 1]).then(async msg => {
      this.message = msg
      if (this.pages.length === 1) return msg

      const emojis = this.awaitReaction(user)
      if (!emojis) return

      try {
        for (const emoji of emojis) await Util.react(msg, emoji)
      } catch (_) {}
      return msg
    })
  }
}
