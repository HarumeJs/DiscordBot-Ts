import { Event } from 'discore.js'
import { VoiceState } from 'discord.js'

import VoiceActivityManager from '../managers/VoiceActivityManager'

export class Join extends Event {
  get options() {
    return { name: 'voiceChannelJoin' }
  }

  run(_: VoiceState, state: VoiceState) {
    VoiceActivityManager.onJoin(state)
  }
}

export class VoiceStateUpdate extends Event {
  get options() {
    return { name: 'voiceStateUpdate' }
  }

  run(oldState: VoiceState, newState: VoiceState) {
    if (!oldState.channel || !newState.channel) return

    const filteredMembers = newState.channel.members
      .array()
      .filter(m => !m.voice.mute)
    if (newState.mute || filteredMembers.length < 2) {
      filteredMembers.forEach(m => VoiceActivityManager.onLeave(m.voice))
      if (!filteredMembers.map(m => m.id).includes(oldState.id)) {
        VoiceActivityManager.onLeave(oldState)
      }
    } else {
      filteredMembers.forEach(m => VoiceActivityManager.onJoin(m.voice))
      if (!filteredMembers.map(m => m.id).includes(newState.id)) {
        VoiceActivityManager.onJoin(newState)
      }
    }
  }
}

export class Leave extends Event {
  get options() {
    return { name: 'voiceChannelLeave' }
  }

  run(state: VoiceState, _: VoiceState) {
    VoiceActivityManager.onLeave(state)
    if (state.channel) {
      const filteredMembers = state.channel.members
        .array()
        .filter(m => !m.voice.mute)
      if (filteredMembers.length < 2) {
        filteredMembers.forEach(m => VoiceActivityManager.onLeave(m.voice))
      }
    }
  }
}
