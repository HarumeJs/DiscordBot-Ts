import { VoiceChannel } from 'discord.js'

import client from '../main'
import loveroomManager from '../managers/loveroom'

import { Pair } from '../utils/db'

export interface LoveroomData {
  roomID: string
  pair: string[]
}

export default class Loveroom {
  public manager = loveroomManager
  public id: string
  public pair: string[]

  constructor(loveroom: LoveroomData) {
    this.id = loveroom.roomID
    this.pair = loveroom.pair
  }

  patch() {}

  delete() {
    const room = client.channels.cache.get(this.id) as VoiceChannel
    if (room) room.delete()
    Pair.deleteOne({ roomID: this.id })
    this.manager.delete(this.id)
  }
}
