import { Event } from 'discore.js'
import { Presence } from 'discord.js'

import * as Util from '../utils/util'
import * as config from '../config'

import { User } from '../utils/db'

export class GameRole extends Event {
  get options() {
    return { name: 'presenceUpdate' }
  }

  run(_: Presence, presence: Presence) {
    if (!presence) return

    const { guild, member } = presence
    if (!guild) return
    if (!member) return

    if (!Util.verifyMainGuild(guild.id)) return

    User.getOne({ userID: presence.userID }).then(userDoc => {
      if (!userDoc.gameroles) return

      const activity = presence.activities.find(a => {
        return a.type === 'PLAYING'
      })
      if (!activity) return

      const { games } = config.ids.roles
      const gameName = activity.name as keyof typeof games
      const roleID = games[gameName]
      if (!roleID) return
      if (member.roles.cache.has(roleID)) return

      member.roles.add(roleID).catch(() => {})
    })
  }
}
