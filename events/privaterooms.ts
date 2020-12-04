import { Event } from 'discore.js'
import { VoiceState } from 'discord.js'

import PrivateRoomManager from '../managers/PrivateRoomManager'

export class Create extends Event {
  get options() {
    return { name: 'voiceChannelJoin' }
  }

  run(_: VoiceState, state: VoiceState) {
    PrivateRoomManager.onJoin(state)
  }
}

export class Switch extends Event {
  get options() {
    return { name: 'voiceChannelSwitch' }
  }

  run(oldState: VoiceState, newState: VoiceState) {
    PrivateRoomManager.onSwitch(oldState, newState)
  }
}

export class Leave extends Event {
  get options() {
    return { name: 'voiceChannelLeave' }
  }

  run(state: VoiceState, _: VoiceState) {
    PrivateRoomManager.onLeave(state)
  }
}
