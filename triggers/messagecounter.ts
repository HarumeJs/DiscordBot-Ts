import { Trigger } from 'discore.js'
import { Message } from 'discord.js'

import * as Util from '../utils/util'

import { User } from '../utils/db'

export default class MessageCounter extends Trigger {
  run(message: Message) {
    if (!message.guild) return
    if (!Util.verifyMainGuild(message.guild.id)) return

    User.getOne({ userID: message.author.id }).then(doc => {
      doc.messageCount += 1

      if ((doc.lastMessageTick || 0) + 3e4 < Date.now()) {
        doc.xp += Math.floor(Math.random() * (35 - 25 + 1)) + 25
        doc.lastMsgXpTick = Date.now()
      }

      doc.save()
    })
  }
}
