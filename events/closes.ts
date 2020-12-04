import { Event } from 'discore.js'
import { TextChannel, VoiceChannel, VoiceState } from 'discord.js'

import CloseManager from '../managers/CloseManager'

export class Create extends Event {
  get options() {
    return { name: 'voiceChannelJoin' }
  }

  run(_: VoiceState, state: VoiceState) {
    CloseManager.onJoin(state)
  }
}

export class Switch extends Event {
  get options() {
    return { name: 'voiceChannelSwitch' }
  }

  run(oldState: VoiceState, newState: VoiceState) {
    CloseManager.onSwitch(oldState, newState)
  }
}

export class Leave extends Event {
  get options() {
    return { name: 'voiceChannelLeave' }
  }

  run(state: VoiceState, _: VoiceState) {
    CloseManager.onLeave(state)
  }
}

export class Delete extends Event {
  get options() {
    return { name: 'channelDelete' }
  }

  run(channel: TextChannel | VoiceChannel) {
    CloseManager.onDelete(channel)
  }
}
