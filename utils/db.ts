import { Mongo, MongoModel, Document } from 'discore.js'

import * as config from '../config'
import { VoiceActivity } from '../managers/VoiceActivityManager'

const db = new Mongo(config.internal.mongoURI)

db.addModel('users', {
  userID: { type: Mongo.Types.String, default: undefined },
  clanID: { type: Mongo.Types.String, default: undefined },
  status: { type: Mongo.Types.String, default: undefined },
  gameroles: { type: Mongo.Types.Boolean, default: true },
  reputation: { type: Mongo.Types.Number, default: 0 },
  inventory: { type: Mongo.Types.Object, default: {} },

  xp: { type: Mongo.Types.Number, default: 0 },
  lvl: { type: Mongo.Types.Number, default: 0 },
  lvlXp: { type: Mongo.Types.Number, default: 0 },

  background: { type: Mongo.Types.String, default: '0' },
  backgrounds: { type: Mongo.Types.String, default: '0' },

  goldChests: { type: Mongo.Types.Number, default: 0 },
  itemChests: { type: Mongo.Types.Number, default: 0 },
  lastChest: { type: Mongo.Types.Number, default: -1 },

  gold: { type: Mongo.Types.Number, default: 0 },
  crystals: { type: Mongo.Types.Number, default: 0 },

  messageCount: { type: Mongo.Types.Number, default: 0 },
  voiceTime: { type: Mongo.Types.Number, default: 0 },
  voiceActivity: { type: Mongo.Types.Array, default: [] },

  leaveTick: { type: Mongo.Types.Number, default: undefined },
  lastRepTick: { type: Mongo.Types.Number, default: undefined },
  lastMsgXpTick: { type: Mongo.Types.Number, default: undefined },
  lastTimelyTick: { type: Mongo.Types.Number, default: undefined }
})
db.addModel('pairs', {
  roomID: { type: Mongo.Types.String, default: undefined },
  pair: { type: Mongo.Types.Array, default: [] }
})
db.addModel('clans', {
  clanID: { type: Mongo.Types.String, default: undefined },
  officers: { type: Mongo.Types.Array, default: [] },
  members: { type: Mongo.Types.Array, default: [] },
  name: { type: Mongo.Types.String, default: undefined },
  ownerID: { type: Mongo.Types.String, default: undefined },
  description: { type: Mongo.Types.String, default: undefined },
  flag: { type: Mongo.Types.String, default: undefined },
  color: { type: Mongo.Types.Number, default: undefined },
  roleID: { type: Mongo.Types.String, default: undefined }
})
db.addModel('closes', {
  roomID: { type: Mongo.Types.String, default: undefined },
  chatID: { type: Mongo.Types.String, default: undefined },
  ownerID: { type: Mongo.Types.String, default: undefined }
})
db.addModel('events', {
  roomID: { type: Mongo.Types.String, default: undefined },
  chatID: { type: Mongo.Types.String, default: undefined },
  ownerID: { type: Mongo.Types.String, default: undefined }
})
db.addModel('privaterooms', {
  roomID: { type: Mongo.Types.String, default: undefined },
  ownerID: { type: Mongo.Types.String, default: undefined }
})
db.addModel('plants', {
  userID: { type: Mongo.Types.String, default: undefined },
  amount: { type: Mongo.Types.Number, default: undefined },
  tick: { type: Mongo.Types.Number, default: undefined }
})
db.addModel('temproles', {
  userID: { type: Mongo.Types.String, default: undefined },
  roleID: { type: Mongo.Types.String, default: undefined },
  itemID: { type: Mongo.Types.Number, default: undefined },
  endTick: { type: Mongo.Types.Number, default: undefined }
})
db.addModel('temprooms', {
  userID: { type: Mongo.Types.String, default: undefined },
  roomID: { type: Mongo.Types.String, default: undefined },
  itemID: { type: Mongo.Types.Number, default: undefined },
  slots: { type: Mongo.Types.Number, default: config.meta.temproomSlots },
  endTick: { type: Mongo.Types.Number, default: undefined }
})
db.addModel('verificationmessages', {
  userID: { type: Mongo.Types.String, default: undefined },
  messageID: { type: Mongo.Types.String, default: undefined },
  channelID: { type: Mongo.Types.String, default: undefined },
  emoji: { type: Mongo.Types.String, default: undefined }
})

export interface IUser extends Document {
  userID: string
  clanID: string | undefined
  status: string | undefined
  gameroles: boolean
  reputation: number
  inventory: { [key: string]: number }

  xp: number

  background: string
  backgrounds: string

  goldChests: number
  itemChests: number
  lastChest: number

  gold: number
  crystals: number

  messageCount: number
  voiceTime: number
  voiceActivity: VoiceActivity[]

  leaveTick: number
  lastRepTick: number
  lastMsgXpTick: number
  lastTimelyTick: number
}

export interface IPair extends Document {
  roomID: string
  pair: string[]
}

export interface IClan extends Document {
  clanID: string

  ownerID: string
  officers: { id: string; tick: number }[]
  members: { id: string; tick: number }[]

  name: string
  description: string | undefined
  flag: string | undefined
  color: number | undefined
  roleID: string | undefined
  roomID: string
  chatID: string
}

export interface IPlant extends Document {
  userID: string
  amount: number
  tick: number
}

export interface IClose extends Document {
  roomID: string
  chatID: string
  ownerID: string
}

export interface IEvent extends Document {
  roomID: string
  chatID: string
  ownerID: string
}

export interface IPrivateRoom extends Document {
  roomID: string
  ownerID: string
}

export interface ITemprole extends Document {
  userID: string
  roleID: string
  itemID: number
  endTick: number
}

export interface ITemproom extends Document {
  userID: string
  roomID: string
  itemID: number
  slots: number
  endTick: number
}

export interface IVerificationMessage extends Document {
  userID: string
  messageID: string
  channelID: string
  emoji: string
}

export const User = db.getCollection('users') as MongoModel<IUser>
export const Pair = db.getCollection('pairs') as MongoModel<IPair>
export const Clan = db.getCollection('clans') as MongoModel<IClan>
export const Plant = db.getCollection('plants') as MongoModel<IPlant>
export const Close = db.getCollection('closes') as MongoModel<IClose>
export const Event = db.getCollection('events') as MongoModel<IEvent>
export const Temprole = db.getCollection('temproles') as MongoModel<ITemprole>
export const Temproom = db.getCollection('temprooms') as MongoModel<ITemproom>
export const PrivateRoom = db.getCollection('privaterooms') as MongoModel<
  IPrivateRoom
>
export const VerificationMessage = db.getCollection(
  'verificationmessages'
) as MongoModel<IVerificationMessage>

export default db
