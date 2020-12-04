import fetch from 'node-fetch'

import { Event } from 'discore.js'
import { ClientUser, Guild, TextChannel } from 'discord.js'

import client from '../main'

import * as Util from '../utils/util'
import * as config from '../config'

import { VerificationMessage } from '../utils/db'

export default class extends Event {
  get options() {
    return { name: 'raw' }
  }

  async run(packet: { [key: string]: any }) {
    if (!packet) return
    if (!packet.d) return
    if (packet.t !== 'MESSAGE_REACTION_ADD') return

    const clientUser = client.user as ClientUser
    if (packet.d.user_id === clientUser.id) return

    let verification: {
      userID: string | undefined
      messageID: string | undefined
      channelID: string | undefined
      emoji: string | undefined
    } = (await VerificationMessage.findOne({
      messageID: packet.d.message_id
    }).catch(() => {})) || {
      userID: undefined,
      messageID: undefined,
      channelID: undefined,
      emoji: undefined
    }
    if (verification.messageID !== packet.d.message_id) {
      verification.emoji = config.emojis.verification.id
      verification.messageID = config.ids.messages.verification
    }

    const emoji = packet.d.emoji || {}
    const emojiID = emoji.id || emoji.name
    if (verification.emoji !== emojiID) return

    const guild = Util.getMainGuild() as Guild
    const member = await guild.members.fetch(packet.d.user_id)
    if (!member) return
    if (!member.roles.cache.has(config.ids.roles.gender.null)) return

    await member.roles.remove(config.ids.roles.gender.null).catch(() => {})
    member.roles.add('730204767426707467').catch(() => {})

    const dmVerification =
      verification.userID !== packet.d.user_id
        ? await VerificationMessage.findOne({
            userID: packet.d.user_id
          }).catch(() => {})
        : verification

    if (dmVerification && dmVerification.channelID) {
      const url = `https://discord.com/api/v8/channels/${dmVerification.channelID}/messages/${dmVerification.messageID}`
      fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `${clientUser.bot ? 'Bot ' : ''}${client.token}`
        }
      }).catch(() => {})
    }

    VerificationMessage.deleteMany({ userID: packet.d.user_id }).catch(() => {})

    const channel = this.client.channels.cache.get(
      config.meta.welcomeChannelID
    ) as TextChannel
    if (!channel) return

    channel
      .send(String(member), {
        embed: {
          color: 0x2f3136,
          title:
            '╸                          Добро пожаловать                          ╺',
          description:
            'Мы очень рады, что ты заглянул именно к нам, в данный сервер вложена частичка души и любви каждого из создателей и мы надеемся, что вам у нас понравится!',
          image: { url: 'https://imgur.com/pfCUNBI.gif' }
        }
      })
      .then(msg => msg.delete({ timeout: 3e4 }))
      .catch(() => {})
  }
}
