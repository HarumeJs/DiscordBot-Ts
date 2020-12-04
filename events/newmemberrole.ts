import { Event } from 'discore.js'
import { GuildMember } from 'discord.js'

import * as Util from '../utils/util'
import * as config from '../config'

import { VerificationMessage } from '../utils/db'

export default class extends Event {
  get options() {
    return { name: 'guildMemberAdd' }
  }

  run(member: GuildMember) {
    if (member.user.bot) return
    if (!Util.verifyMainGuild(member.guild.id)) return

    member.roles.add(config.ids.roles.gender.null).catch(() => {})

    member
      .send({
        embed: {
          color: config.meta.defaultColor,
          title: '●───────❪⠀ВЕРИФИКАЦИЯ⠀❫───────●',
          description: 'Для доступа к серверу нажмите на реакцию ниже!',
          image: { url: 'https://imgur.com/auiGGZN.gif' },
          footer: {
            text: '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀Добро пожаловать на сервер ETHΣREAL'
          }
        }
      })
      .then(msg => {
        VerificationMessage.insertOne({
          userID: member.id,
          messageID: msg.id,
          channelID: msg.channel.id,
          emoji: config.emojis.verification.id
        })

        msg.react(config.emojis.verification.id).catch(() => {})
      })
      .catch(() => {})
  }
}
