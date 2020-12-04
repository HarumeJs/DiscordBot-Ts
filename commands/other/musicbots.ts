import { Guild, GuildMember, Message } from 'discord.js'

import Command from '../../structures/Command'
import musicbots from '../../musicbots'

import * as Util from '../../utils/util'
import * as config from '../../config'

export default class MusicbotsCommand extends Command {
  get options() {
    return { name: 'музыкальные боты' }
  }

  async execute(message: Message) {
    const guild = message.guild as Guild
    const promises = musicbots.map(i => {
      return Util.resolveMember(i.id, guild).then(m => ({ member: m, info: i }))
    })
    Promise.all(promises)
      .then(res => res.filter(r => r.member))
      .then(res => {
        message.channel.send({
          embed: {
            color: config.meta.defaultColor,
            fields: res.map(r => {
              const member = r.member as GuildMember
              const statusCode = member.voice.channelID ? 0 : 1
              return {
                name: `> ${r.info.emoji} ${member.user.username}`,
                value: [
                  `> Префикс: \`${r.info.prefix}\``,
                  `> Состояние: ${config.meta.emojis.status[statusCode]}`
                ].join('\n'),
                inline: true
              }
            })
          }
        })
      })
  }
}
