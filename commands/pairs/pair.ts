import {
  Guild,
  Message,
  GuildMember,
  NewsChannel,
  TextChannel,
  PermissionOverwriteOptions
} from 'discord.js'

import loveroomManager from '../../managers/loveroom'
import * as Util from '../../utils/util'
import * as config from '../../config'

import { Pair, User } from '../../utils/db'
import { default as Command, CommandParams } from '../../structures/Command'
import { default as client, activePairOffers } from '../../main'

function resolveRoomName(member: GuildMember, targetMember: GuildMember) {
  const replacers = {
    nickname(member: GuildMember): string {
      return member.displayName
    }
  }

  let roomname = config.meta.pairroomName
  Object.entries(replacers).forEach(([name, func]) => {
    const regex = new RegExp(`{${name}\\.([12])}`, '')
    roomname = roomname.replace(new RegExp(regex.source, 'g'), m => {
      const match = m.match(regex)
      if (!match) return m

      const mem = match[1] === '1' ? member : targetMember
      return func(mem)
    })
  })

  return roomname
}

function resolveOverwrites(
  guild: Guild,
  members: [GuildMember, GuildMember]
): PermissionOverwriteOptions[] {
  const metaPerms = config.meta.permissions.loveroom

  const overwrites: PermissionOverwriteOptions[] = [
    ...metaPerms.default,
    {
      id: guild.id,
      allow: metaPerms.everyone.allow || 0,
      deny: metaPerms.everyone.deny || 0
    }
  ]
  members.forEach(m => {
    overwrites.push({
      id: m.id,
      allow: metaPerms.member.allow || 0,
      deny: metaPerms.member.deny || 0
    })
  })

  return overwrites
}

export default class PairCommand extends Command {
  get options() {
    return { name: 'пара' }
  }
  get cOptions() {
    return { guildOnly: true }
  }

  async execute(
    message: Message,
    args: string[],
    { guild, member }: CommandParams
  ) {
    const existing = await Pair.findOne(d => {
      return (d.pair || []).includes(message.author.id)
    })
    if (existing) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'У тебя уже имеется пара'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    if (activePairOffers.has(message.author.id)) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'У тебя уже есть активный запрос!'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const targetMember = await Util.resolveMember(args.join(' '))
    if (!targetMember) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Участник не найден'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    if (activePairOffers.has(targetMember.id)) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'У данного пользователя уже есть активный запрос!'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const targetPair = await Pair.findOne(d => {
      return (d.pair || []).includes(targetMember.id)
    })
    if (targetPair) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'У данного участника уже есть пара'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const userDoc = await User.getOne({ userID: message.author.id })
    if (userDoc.gold < config.meta.pairCost) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Недостаточно средств'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const confirmMsg = await message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          title: 'ПРЕДЛОЖЕНИЕ',
          description: [
            'Я жизни без тебя не представляю, хочу идти с тобой по жизненном пути. Тебя люблю, тебя я обожаю, и делаю тебе я предложения сердца и руки!',
            '',
            `${message.author} отправляет предложение стать парой ${targetMember}, мы в предвкушении новой пары...`
          ].join('\n'),
          image: {
            url:
              'https://trello-attachments.s3.amazonaws.com/5f2d182cbb42e72dbfdd927c/800x369/4c291b6172fca9677bbdf37e1562a42c/predli.gif'
          }
        }
      })
      .catch(() => {})
    if (!confirmMsg) return

    activePairOffers.add(message.author.id)
    activePairOffers.add(targetMember.id)

    const confirm = await Util.confirm(confirmMsg, targetMember.user)

    activePairOffers.delete(message.author.id)
    activePairOffers.delete(targetMember.id)

    confirmMsg.delete().catch(() => {})
    if (!confirm) return

    const room = await guild.channels
      .create(resolveRoomName(member, targetMember), {
        parent: config.ids.categories.loverooms,
        permissionOverwrites: resolveOverwrites(guild, [member, targetMember]),
        type: 'voice',
        userLimit: 2
      })
      .catch(() => {})
    if (!room) return

    userDoc.gold -= config.meta.pairCost
    userDoc.save()

    const docData = {
      roomID: room.id,
      pair: [message.author.id, targetMember.id]
    }
    Pair.insertOne(docData)

    loveroomManager.save(docData.roomID, docData)

    const channel = (client.channels.cache.get(
      config.ids.channels.text.mainChat
    ) || message.channel) as TextChannel | NewsChannel
    channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          title: 'НОВЕНЬКАЯ ПАРА ВЛЮБЛЁННЫХ',
          description: [
            `Дорогие участники сервера, я объявляю, ${message.author} и ${targetMember}, официальной парой этого сервера!`,
            '',
            'Поздравляю вас с созданием собственного любовного домика, долголетия желаю вашей любви, вам – влюбленной паре! Такого долголетия, которое согласно превратиться в вечность.'
          ].join('\n'),
          image: {
            url:
              'https://trello-attachments.s3.amazonaws.com/5f2d182cbb42e72dbfdd927c/800x369/d12729a55b4edf5dcd300f6011d074bd/novaya.gif'
          }
        }
      })
      .then(msg => msg.delete({ timeout: config.meta.msgDeletion }))
      .catch(() => {})
  }
}
