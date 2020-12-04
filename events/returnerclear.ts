import { Event } from 'discore.js'
import { GuildMember } from 'discord.js'

import * as Util from '../utils/util'
import * as config from '../config'

import { User } from '../utils/db'

export class Join extends Event {
  get options() {
    return { name: 'guildMemberAdd' }
  }

  run(member: GuildMember) {
    if (!Util.verifyMainGuild(member.guild.id)) return

    const condition = { userID: member.id }
    User.findOne(condition).then(userDoc => {
      if (!userDoc) return

      if (
        userDoc.leaveTick &&
        userDoc.leaveTick + config.meta.leaveClearInterval
      ) {
        User.deleteOne(condition)
      }
    })
  }
}

export class Leave extends Event {
  get options() {
    return { name: 'guildMemberRemove' }
  }

  run(member: GuildMember) {
    if (!Util.verifyMainGuild(member.guild.id)) return

    User.getOne({ userID: member.id }).then(userDoc => {
      userDoc.leaveTick = Date.now()
      userDoc.save()
    })
  }
}
