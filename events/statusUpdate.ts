import { Event } from 'discore.js'

import * as Util from '../utils/util'

export class MemberAdd extends Event {
  get options() {
    return { name: 'guildMemberAdd' }
  }

  run() {
    Util.setStatus()
  }
}

export class MemberRemove extends Event {
  get options() {
    return { name: 'guildMemberRemove' }
  }

  run() {
    Util.setStatus()
  }
}
