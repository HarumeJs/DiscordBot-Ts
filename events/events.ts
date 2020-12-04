import { Event } from 'discore.js'
import { TextChannel, VoiceChannel, VoiceState } from 'discord.js'

import EventManager from '../managers/EventManager'

export class Create extends Event {
  get options() {
    return { name: 'voiceChannelJoin' }
  }

  run(_: VoiceState, state: VoiceState) {
    EventManager.onJoin(state)
  }
}

export class Switch extends Event {
  get options() {
    return { name: 'voiceChannelSwitch' }
  }

  run(oldState: VoiceState, newState: VoiceState) {
    EventManager.onSwitch(oldState, newState)
  }
}

export class Leave extends Event {
  get options() {
    return { name: 'voiceChannelLeave' }
  }

  run(state: VoiceState, _: VoiceState) {
    EventManager.onLeave(state)
  }
}

export class Delete extends Event {
  get options() {
    return { name: 'channelDelete' }
  }

  run(channel: TextChannel | VoiceChannel) {
    EventManager.onDelete(channel)
  }
}
