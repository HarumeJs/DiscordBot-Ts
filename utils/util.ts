import fetch from 'node-fetch'

import * as chalk from 'chalk'
import * as moment from 'moment-timezone'

import {
  User as DiscordUser,
  Guild,
  Message,
  ClientUser,
  GuildMember,
  Permissions,
  VoiceChannel,
  MessageAttachment
} from 'discord.js'
import { RequestInfo, RequestInit } from 'node-fetch'

import goods from '../goods'
import client from '../main'
import emojiRegex from './emojiRegex'
import CanvasUtil from './canvas/canvas'
import Collection from '../structures/Collection'
import clanManager from '../managers/clan'
import loveroomManager from '../managers/loveroom'

import * as config from '../config'
import * as logger from '../utils/logger'

import { privaterooms } from '../main'
import { VoiceActivity } from '../managers/VoiceActivityManager'
import { ParsedFullTime, ParsedTime } from './types'
import { Clan, IUser, Pair, PrivateRoom, Temprole, Temproom, User } from './db'

export const runTick = Date.now()
export const eventStates = new Collection<string, { enabled: boolean }>()

export function getMainGuild(): Guild | undefined {
  return client.guilds.cache.get(config.ids.guilds.main)
}

export function parseTime(time: number): ParsedTime {
  const parsed: ParsedTime = {
    h: Math.floor(time / 3.6e6),
    m: Math.floor(time / 6e4) % 60,
    s: Math.ceil(time / 1e3) % 60
  }
  return parsed
}

export function parseFullTime(time: number): ParsedFullTime {
  const parsed: ParsedFullTime = {
    w: Math.floor(time / 6.048e8),
    d: Math.floor(time / 8.64e7) % 7,
    h: Math.floor(time / 3.6e6) % 24,
    m: Math.floor(time / 6e4) % 60,
    s: Math.ceil(time / 1e3) % 60
  }
  return parsed
}

export function parseFullTimeArray(time: number): string[] {
  const parsed = parseFullTime(time)
  return Object.entries(parsed).map(([k, v]) => {
    return `${v}${config.meta.timeSpelling[k as keyof ParsedFullTime]}`
  })
}

export function parseFilteredFullTimeArray(time: number): string[] {
  const parsed = parseFullTime(time)
  const res = Object.entries(parsed)
    .filter(([_, v]) => v > 0)
    .map(([k, v]) => {
      return `${v}${config.meta.timeSpelling[k as keyof ParsedFullTime]}`
    })

  return res.length === 0 ? [`0${config.meta.timeSpelling['s']}`] : res
}

export function parseFullTimeString(time: number): string {
  return parseFullTimeArray(time).join(' ')
}

export function parseFilteredFullTimeString(time: number): string {
  return parseFilteredFullTimeArray(time).join(' ')
}

export function parseTimeArray(time: number): string[] {
  const parsed = parseTime(time)
  return Object.entries(parsed).map(([k, v]) => {
    return `${v}${config.meta.timeSpelling[k as keyof ParsedFullTime]}.`
  })
}

export function parseFilteredTimeArray(time: number): string[] {
  const parsed = parseTime(time)
  const res = Object.entries(parsed)
    .filter(([_, v]) => v > 0)
    .map(([k, v]) => {
      return `${v}${config.meta.timeSpelling[k as keyof ParsedFullTime]}.`
    })

  return res.length === 0 ? [`0${config.meta.timeSpelling['s']}`] : res
}

export function parseTimeString(time: number): string {
  return parseTimeArray(time).join(' ')
}

export function parseFilteredTimeString(time: number): string {
  return parseFilteredTimeArray(time).join(' ')
}

export async function resolveMember(
  mention: string,
  guild: Guild | undefined = getMainGuild()
): Promise<GuildMember | null> {
  return new Promise(resolve => {
    if (!guild) return resolve(null)

    const targetID = resolveUserID(mention) || mention
    if (!targetID) return resolve(null)

    resolve(guild.members.fetch(targetID).catch(() => null))
  })
}

export function validatePrivateroom(
  member: GuildMember,
  channel: VoiceChannel
): boolean {
  if (!channel) return false
  if (!privaterooms.has(channel.id)) return false

  const permissionOverwrites = channel.permissionOverwrites.get(member.id)
  if (!permissionOverwrites) return false

  const flags = Permissions.FLAGS.MANAGE_CHANNELS
  if (!permissionOverwrites.allow.has(flags)) return false

  return true
}

export function resolveMentionUserID(mention: string = '') {
  const regex = /^<@!?(\d+)>$/
  const match = mention.match(regex)
  if (!match) return null
  return match[1]
}

export function resolveUserID(mention: string): string | null {
  if (/^\d+$/.test(mention)) return mention
  return resolveMentionUserID(mention)
}

export function filterWeekActivity(
  voiceActivity: VoiceActivity[]
): VoiceActivity[] {
  const weekMs = 6.048e8

  const va = [...voiceActivity.map(a => [...a])] as VoiceActivity[]
  const weekActivity = va.filter(a => {
    return a[1] ? a[1] > Date.now() - weekMs : true
  })
  if (weekActivity[0]) {
    weekActivity[0][0] = Math.max(weekActivity[0][0], Date.now() - weekMs)
  }

  return weekActivity
}

export function filterOutOfWeekActivity(
  voiceActivity: VoiceActivity[]
): VoiceActivity[] {
  const weekMs = 6.048e8

  const va = [...voiceActivity.map(a => [...a])].filter(a => {
    return a[0] < Date.now() - weekMs
  }) as VoiceActivity[]
  const lastActivityIndex = va.length - 1

  if (lastActivityIndex > -1) {
    va[lastActivityIndex][1] = Math.min(
      va[lastActivityIndex][1],
      Date.now() - weekMs
    )
  }

  return va
}

export function parseVoiceActivity(voiceActivity: VoiceActivity[]) {
  const va = [...voiceActivity.map(a => [...a])]
  const lastActivity = va.slice(-1)[0]
  if (lastActivity && typeof lastActivity[1] !== 'number') {
    va[va.length - 1][1] = Date.now()
  }
  return va.map(a => a[1] - a[0]).reduce((p, c) => p + c, 0)
}

export function disableEvents() {
  client.events
    .filter(e => e.name !== 'ready')
    .forEach(e => {
      eventStates.set(e._id, { enabled: e.enabled })
      e.disable()
    })
}

export function enableEvents() {
  ;[...eventStates.entries()]
    .filter(([_, info]) => info.enabled)
    .map(([id]) => client.events.get(id))
    .forEach(e => e.enable())
}

export function readyMessage() {
  const { tag } = client.user as ClientUser
  logger.log(
    chalk.cyan.bold('[BOT]'),
    'Started:',
    chalk.green(tag),
    'in',
    `${chalk.yellow(Date.now() - runTick)}ms`
  )
}

export function checkMainGuildExistance() {
  const guild = getMainGuild()
  if (!guild) {
    logger.error(
      chalk.cyan.bold('[BOT]'),
      'Main guild not found.',
      chalk.red.bold('Exiting..')
    )
    process.exit(1)
  }
}

export function fetchVoiceMembers(): Promise<void> {
  return new Promise(resolve => {
    const guild = getMainGuild()
    if (!guild) return resolve()

    const voiceMembers = guild.voiceStates.cache
      .filter(v => {
        if (!v.channel) return false
        if (v.mute) return false

        const filteredMembers = v.channel.members
          .filter(m => !m.voice.mute)
          .array()
        return Boolean(v.member && filteredMembers.length > 0)
      })
      .map(v => v.member) as GuildMember[]

    Promise.all(voiceMembers.map(m => User.getOne({ userID: m.id })))
      .then(docs => {
        const promises = []
        for (const doc of docs) {
          doc.voiceActivity = [
            ...doc.voiceActivity,
            [Date.now()]
          ] as VoiceActivity[]
          promises.push(doc.save())
        }
        return Promise.all(promises)
      })
      .then(() => resolve())
      .catch(() => resolve())
  })
}

export function cleanupVoiceActivity(): Promise<void> {
  return User.getData()
    .then(data => [...data.values()])
    .then(docs => {
      const promises = []
      for (const doc of docs) {
        const lastVoiceActivity = doc.voiceActivity.slice(-1)[0]
        if (lastVoiceActivity && lastVoiceActivity.length < 2) {
          doc.voiceActivity = doc.voiceActivity.slice(0, -1)
          promises.push(doc.save())
        }
      }
      return Promise.all(promises)
    })
    .then(() => {})
}

export function openCreateroom() {
  const channel = client.channels.cache.get(
    config.ids.channels.voice.createPrivate
  ) as VoiceChannel
  if (!channel) return

  const permissionOverwrites = channel.permissionOverwrites
    .array()
    .filter(p => p.type !== 'member')

  channel.edit({ permissionOverwrites })
}

export function cleanupPrivaterooms(): Promise<void> {
  return PrivateRoom.getData().then(() => {
    for (const pr of [...privaterooms.values()]) {
      const channel = client.channels.cache.get(pr.roomID) as VoiceChannel
      if (!channel || channel.members.size < 1) {
        PrivateRoom.deleteOne({ roomID: channel.id })
        privaterooms.delete(channel.id)
        if (channel) channel.delete().catch(() => {})
      }
    }
  })
}

export function fetchPrivaterooms() {
  PrivateRoom.getData()
    .then(data => [...data.values()])
    .then(docs => {
      for (const doc of docs) {
        const { roomID, ownerID } = doc
        privaterooms.set(roomID, { roomID, ownerID })
      }
    })
}

export function verifyGuild(id: string) {
  return config.meta.allowedGuilds.includes(id)
}

export function verifyMainGuild(id: string) {
  return config.ids.guilds.main === id
}

export function confirm(
  message: Message,
  user: DiscordUser,
  time: number = 7.2e6
): Promise<boolean | null> {
  const emojis = config.meta.confirmEmojis
  ;(async () => {
    try {
      for (const emoji of emojis) await react(message, emoji)
    } catch (_) {}
  })()

  return message
    .awaitReactions(
      (r, u) => {
        return u.id === user.id && emojis.includes(r.emoji.id || r.emoji.name)
      },
      { max: 1, time, errors: ['time'] }
    )
    .then(collected => collected.first())
    .then(r => {
      if (!r) return null
      return (r.emoji.id || r.emoji.name) === emojis[0]
    })
    .catch(() => {
      message.reactions.removeAll().catch(() => {})
      return null
    })
}

export function react(message: Message, emojiID: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const emoji = client.emojis.cache.get(emojiID) || emojiID

    fetch(
      `https://discord.com/api/v7/channels/${message.channel.id}/messages/${
        message.id
      }/reactions/${encodeURIComponent(
        typeof emoji === 'string' ? emoji : `${emoji.name}:${emoji.id}`
      )}/@me`,
      { method: 'PUT', headers: { Authorization: `Bot ${client.token}` } }
    )
      .then(res => {
        if (res.headers.get('content-type') === 'application/json') {
          return res.json()
        } else {
          return { retry_after: undefined }
        }
      })
      .then(res => {
        if (typeof res.retry_after === 'number') {
          setTimeout(() => resolve(react(message, emojiID)), res.retry_after)
        } else {
          resolve(res)
        }
      })
      .catch(reject)
  })
}

export function processPrefixes() {
  client.commands.forEach(c => {
    if (typeof c.aliases === 'string') c.aliases = [c.aliases]
    const prefix = c.custom.prefix || config.internal.prefix
    c.name = `${prefix}${c.name}`
    c.aliases = c.aliases.map(a => `${prefix}${a}`)
  })
}

export function getNounPluralForm(a: number) {
  if (a % 10 === 1 && a % 100 !== 11) {
    return 0
  } else if (a % 10 >= 2 && a % 10 <= 4 && (a % 100 < 10 || a % 100 >= 20)) {
    return 1
  }
  return 2
}

export function pluralNoun(num: number, ...forms: string[]) {
  if (forms.length === 1) throw new Error('Not enough forms')
  if (forms.length === 2) return num > 1 ? forms[1] : forms[0]
  return forms[getNounPluralForm(num)]
}

export function getReaction(
  message: Message,
  emojis: string | string[],
  users: DiscordUser | DiscordUser[],
  time: number = 7.2e6
) {
  if (!Array.isArray(users)) users = [users]
  if (!Array.isArray(emojis)) emojis = [emojis]
  ;(async () => {
    try {
      for (const emoji of emojis) await react(message, emoji)
    } catch (_) {}
  })()

  return getReactionStatic(message, emojis, users, time)
}

export function getReactionStatic(
  message: Message,
  emojis: string | string[],
  users: DiscordUser | DiscordUser[],
  time: number = 7.2e6
) {
  if (!Array.isArray(users)) users = [users]
  if (!Array.isArray(emojis)) emojis = [emojis]

  return message
    .awaitReactions(
      (r, u) => {
        if (!emojis.includes(r.emoji.id || r.emoji.name)) return false
        const ids = (users as DiscordUser[]).map(u => u.id)
        if (!ids.includes(u.id)) return false
        return true
      },
      { max: 1, time, errors: ['time'] }
    )
    .then(collected => collected.first())
    .then(r => {
      if (!r) return null
      return r
    })
    .catch(() => {
      message.reactions.removeAll().catch(() => {})
      return null
    })
}

export function resolveHex(hex: string): string | null {
  const match = hex.match(/^#((?:[0-f]{3}){1,2})$/)
  if (!match) return null

  hex = match[1]
  return hex.length === 3
    ? hex
        .split('')
        .map(c => c.repeat(2))
        .join('')
    : hex
}

export function checkTemps() {
  const interval = config.meta.checkInterval
  checkTemproles(interval)
  checkTemprooms(interval)
  setTimeout(() => checkTemps(), interval)
}

export function checkTemprooms(interval: number) {
  Temproom.getData()
    .then(data => [...data.values()])
    .then(docs => {
      return docs.filter(d => d.endTick && d.endTick - Date.now() < interval)
    })
    .then(docs => {
      const guild = getMainGuild() as Guild
      for (const doc of docs) {
        const until = doc.endTick - Date.now()
        setTimeout(() => {
          const channel = guild.channels.cache.get(doc.roomID)
          if (channel) channel.delete().catch(() => {})
          Temproom.deleteOne({ roomID: doc.roomID })
        }, until)
      }
    })
}

export function checkTemproles(interval: number) {
  Temprole.filter(d => d.endTick && d.endTick - Date.now() < interval)
    .then(data => [...data.values()])
    .then(docs => {
      const guild = getMainGuild() as Guild
      for (const doc of docs) {
        const until = doc.endTick - Date.now()
        setTimeout(() => {
          const { temprole1d, temprole3d, temprole7d } = config.ids.goods
          if ([temprole1d, temprole3d, temprole7d].includes(doc.itemID)) {
            const role = guild.roles.cache.get(doc.roleID)
            if (role) role.delete().catch(() => {})
          } else {
            guild.members
              .fetch(doc.userID)
              .then(member => member.roles.remove(doc.roleID).catch(() => {}))
              .catch(() => {})
          }
          Temprole.deleteOne({ roleID: doc.roleID })
        }, until)
      }
    })
}

export function repeat<T>(e: T, count: number): T[] {
  const arr: T[] = []
  for (let i = 0; i < count; i++) arr.push(e)
  return arr
}

export async function genActivationsMsg(user: DiscordUser) {
  const [temproleData, temproomData] = await Promise.all([
    Temprole.filter({ userID: user.id }),
    Temproom.filter({ userID: user.id })
  ])

  const temproleDocs = [...temproleData.values()].map(doc => ({
    ...doc,
    mention: `<@&${doc.roleID}>`
  }))
  const temproomDocs = [...temproomData.values()].map(doc => ({
    ...doc,
    mention: `<#${doc.roomID}>`
  }))

  const docs = [...temproleDocs, ...temproomDocs]

  return {
    embed: {
      color: config.meta.defaultColor,
      author: {
        name: user.tag,
        icon_url: user.displayAvatarURL({ dynamic: true })
      },
      title: 'Инвентарь пользователя',
      description: [
        'Предмет / Дата окончания',
        docs.length < 1
          ? 'Пусто'
          : docs
              .map(doc => ({
                id: doc.itemID,
                emoji:
                  client.emojis.cache.get(goods[doc.itemID]?.emoji) ||
                  client.emojis.cache.get(config.emojis.empty) ||
                  '',
                mention: doc.mention,
                endDate: doc.endTick
                  ? moment(doc.endTick)
                      .tz(config.meta.defaultTimezone)
                      .locale('ru-RU')
                      .format('lll')
                  : undefined
              }))
              .map(item => {
                return `${`${item.emoji} `.trimLeft()}${item.mention} [ **${
                  item.endDate || 'Неизвестно'
                }** ]`
              })
              .join('\n')
      ].join('\n')
    }
  }
}

export async function genInventoryMsg(user: DiscordUser) {
  const userDoc = await User.getOne({ userID: user.id })
  const inv = Object.entries(userDoc.inventory)

  return {
    embed: {
      color: config.meta.defaultColor,
      author: {
        name: user.tag,
        icon_url: user.displayAvatarURL({ dynamic: true })
      },
      title: 'Инвентарь пользователя',
      description:
        inv.length < 1
          ? 'Пусто'
          : inv
              .map(([id, count]) => ({
                id,
                name: goods[id].name,
                emoji:
                  client.emojis.cache.get(goods[id].emoji) ||
                  client.emojis.cache.get(config.emojis.empty) ||
                  '',
                count
              }))
              .filter(item => item.count > 0)
              .map(item => {
                return repeat(
                  `${`${item.emoji} `.trimLeft()}${item.name}`,
                  item.count
                ).join('\n')
              })
              .join('\n')
    }
  }
}

export function splitMessage(
  text: string,
  { maxLength = 2000, char = '\n', prepend = '', append = '' } = {}
) {
  if (Array.isArray(text)) text = text.join('\n')
  if (text.length <= maxLength) return [text]
  const splitText = text.split(char)
  if (splitText.some(chunk => chunk.length > maxLength)) {
    throw new RangeError('SPLIT_MAX_LEN')
  }
  const messages = []
  let msg = ''
  for (const chunk of splitText) {
    if (msg && (msg + char + chunk + append).length > maxLength) {
      messages.push(msg + append)
      msg = prepend
    }
    msg += (msg && msg !== prepend ? char : '') + chunk
  }
  return messages.concat(msg).filter(m => m)
}

export function discordRetryHandler(
  input: RequestInfo,
  init?: RequestInit | undefined,
  tries: number = 0
): Promise<void> {
  return new Promise((resolve, reject) => {
    fetch(`https://discord.com/api/v8/${input}`, init)
      .then(res => {
        if (res.headers.get('content-type') === 'application/json') {
          return res.json()
        } else {
          return { retry_after: undefined }
        }
      })
      .then(res => {
        if (typeof res.retry_after === 'number') {
          if (tries + 1 > 1) return reject(new Error('Too many tries'))
          setTimeout(
            () => resolve(discordRetryHandler(input, init, tries + 1)),
            res.retry_after
          )
        } else {
          resolve(res)
        }
      })
      .catch(reject)
  })
}

export function resolveEmoji(emojiID: string) {
  if (emojiRegex.test(emojiID)) return emojiID

  const emoji =
    client.emojis.cache.get(emojiID) ||
    client.emojis.cache.get(config.emojis.empty) ||
    ''
  return `${emoji} `.trimLeft()
}

export function patchManagers() {
  Clan.getData().then(clans => {
    clans.forEach(clan => clanManager.save(clan.clanID, clan))
  })

  Pair.getData().then(pairs => {
    pairs.forEach(pair => {
      loveroomManager.save(pair.roomID, pair)
    })
  })
}

export function getReputationRank(reputation: number): string {
  const entries = Object.entries(config.repRanks).map(([k, v]) => [
    Number(k),
    v
  ])
  const positiveEntries = entries
    .filter(([r]) => r > 0)
    .sort((b, a) => (a[0] as number) - (b[0] as number))
  const negativeEntries = entries
    .filter(([r]) => r < 0)
    .sort((a, b) => (a[0] as number) - (b[0] as number))

  const positiveEntry = positiveEntries.find(([r]) => r <= reputation)
  const negativeEntry = negativeEntries.find(([r]) => r >= reputation)

  return (positiveEntry ||
    negativeEntry || [0, config.repRanks['0']])[1] as string
}

export async function calculateActivityRewards(
  member: GuildMember,
  doc: IUser
) {
  const lastActivityTime = parseVoiceActivity(doc.voiceActivity.slice(0, -1))
  const activityTime = parseVoiceActivity([doc.voiceActivity.slice(-1)[0]])

  doc.gold +=
    Math.floor((activityTime + (lastActivityTime % 3e5)) / 3e5) *
    (config.meta.goldDoublerRoles.some(id => member.roles.cache.has(id))
      ? 2
      : 1)
  doc.xp += Math.floor(
    ((activityTime + (lastActivityTime % 3e5)) / 3e5) *
      (Math.random() * (15 - 5 + 1) + 5)
  )

  const receivedChestCount = Math.floor(
    (activityTime + (lastActivityTime % 4.32e7)) / 4.32e7
  )
  for (let i = 0; i < receivedChestCount; i++) {
    if (doc.lastChest === config.ids.chests.item) {
      doc.goldChests += 1
      doc.lastChest = config.ids.chests.gold
    } else {
      doc.itemChests += 1
      doc.lastChest = config.ids.chests.item
    }
  }
}

export function getEmbedCode(attachment?: MessageAttachment) {
  if (!attachment) return null
  if (!attachment.attachment) return null

  const url = (attachment.attachment || { toString() {} }).toString() || ''
  const regex = /^https:\/\/cdn\.discordapp\.com\/attachments\/\d+\/\d+\/.+\.txt/

  if (!regex.test(url)) return null

  return fetch(url).then(res => res.text())
}

export async function setBanner() {
  const banner = await CanvasUtil.makeBanner()

  const guild = getMainGuild() as Guild
  const clientUser = client.user as ClientUser

  discordRetryHandler(`guilds/${guild.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      banner: `data:image/jpg;base64,${banner.toString('base64')}`
    }),
    headers: {
      authorization: `${clientUser.bot ? 'Bot ' : ''}${client.token}`,
      'content-type': 'application/json'
    }
  })
    .then(() => setTimeout(() => setBanner(), 6e4))
    .catch(() => {})
}

export function setStatus() {
  const guild = getMainGuild() as Guild
  const clientUser = client.user as ClientUser
  clientUser
    .setActivity({
      name: `на ${guild.memberCount.toLocaleString('ru-RU')} участников`,
      type: 'WATCHING'
    })
    .catch(() => {})
}
