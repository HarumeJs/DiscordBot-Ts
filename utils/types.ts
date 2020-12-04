import { MessageEmbedOptions } from 'discord.js'

export type nil = null | undefined

export type NilPartial<T> = { [K in keyof T]: T[K] | nil }
export type Constructable<T> = new (...args: any[]) => T

export type CustomEmbedData = MessageEmbedOptions & {
  content?: string
  text?: string
  plainText?: string
}

export interface PrivateRoomData {
  roomID: string
  ownerID: string
}

export interface CloseData {
  roomID: string
  chatID: string
  ownerID: string
}

export interface EventData {
  roomID: string
  chatID: string
  ownerID: string
}

export interface ParsedFullTime {
  w: number
  d: number
  h: number
  m: number
  s: number
}

export interface ParsedTime {
  h: number
  m: number
  s: number
}

export interface RawClanOfficer {
  id: string
  tick: number
}

export interface RawClanMember {
  id: string
  tick: number
}
