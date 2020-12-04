import { VoiceState } from 'discord.js'

import * as Util from '../utils/util'
import { User } from '../utils/db'

export type VoiceActivity = [number, number]

export default class VoiceActivityManager {
  static onJoin(state: VoiceState) {
    const { member, guild } = state

    if (!member) return
    if (!Util.verifyGuild(guild.id)) return

    User.getOne({ userID: member.id }).then(userDoc => {
      const lastActivity = userDoc.voiceActivity.slice(-1)[0]
      if (lastActivity && lastActivity.length < 2) return
      userDoc.voiceActivity = [
        ...userDoc.voiceActivity,
        [Date.now()]
      ] as VoiceActivity[]
      userDoc.save()
    })
  }

  static onLeave(state: VoiceState) {
    const { member, guild } = state

    if (!member) return
    if (!Util.verifyGuild(guild.id)) return

    User.getOne({ userID: member.id }).then(userDoc => {
      const lastActivityIndex = userDoc.voiceActivity.length - 1
      const lastVoiceActivity = userDoc.voiceActivity[lastActivityIndex]
      if (!lastVoiceActivity || lastVoiceActivity.length > 1) return

      if (Date.now() - lastVoiceActivity[0] < 1e3) {
        userDoc.voiceActivity = userDoc.voiceActivity.slice(0, -1)
      } else {
        userDoc.voiceActivity[lastActivityIndex].push(Date.now())

        const outOfWeekActivity = Util.filterOutOfWeekActivity(
          userDoc.voiceActivity
        )
        const outOfWeekTime = Util.parseVoiceActivity(outOfWeekActivity)
        if (outOfWeekTime >= 1e3) {
          userDoc.voiceActivity = Util.filterWeekActivity(userDoc.voiceActivity)
          userDoc.voiceTime += outOfWeekTime
        }

        Util.calculateActivityRewards(member, userDoc)
      }
      userDoc.save()
    })
  }
}
