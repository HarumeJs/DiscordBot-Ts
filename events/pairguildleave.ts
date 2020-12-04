import { Event } from 'discore.js'
import { GuildMember } from 'discord.js'

import loveroomManager from '../managers/loveroom'
import * as Util from '../utils/util'

export default class DeletePair extends Event {
  get options() {
    return { name: 'guildMemberRemove' }
  }

  run(member: GuildMember) {
    if (!Util.verifyMainGuild(member.guild.id)) return

    const loveroom = loveroomManager.resolve(member.id)
    if (!loveroom) return

    loveroom.delete()
  }
}
