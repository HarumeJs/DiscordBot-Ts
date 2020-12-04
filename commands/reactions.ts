import {
  User as DiscordUser,
  Guild,
  GuildMember,
  Message,
  MessageEmbedOptions
} from 'discord.js'

import Command from '../structures/Command'
import * as Util from '../utils/util'
import * as config from '../config'

import { User } from '../utils/db'
import { default as reactions, ReactionInfo } from '../reactions'

const minPrice = config.meta.minReactionPrice
const maxPrice = config.meta.maxReactionPrice
const priceDiff = maxPrice - minPrice

function formatReplyTemplate(
  reply: string,
  author: DiscordUser,
  target?: DiscordUser
) {
  return reply
    .replace(/{author}/g, String(author))
    .replace(/{target}/g, String(target || 'Неизвестный'))
}

function reactionCommand(info: ReactionInfo) {
  return class ReactionCommand extends Command {
    get options() {
      return { name: info.name, aliases: info.aliases }
    }

    get cOptions() {
      return { guildOnly: true }
    }

    async execute(message: Message, args: string[]) {
      const guild = message.guild as Guild

      const userDoc = await User.getOne({ userID: message.author.id })
      if (userDoc.gold < maxPrice) {
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

      const targetMember = (await Util.resolveMember(
        args[0],
        guild
      )) as GuildMember
      if (!info.singleReplies && !targetMember) {
        message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              description: 'Укажите участника'
            }
          })
          .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
          .catch(() => {})
        return
      }

      let confirmMsg
      const isDouble = info.doubleReplies && targetMember
      if (isDouble) {
        if (message.author.id === targetMember.id) {
          message.channel
            .send({
              embed: {
                color: config.meta.defaultColor,
                description: 'Делай это с другими, а не с самим собой!'
              }
            })
            .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
            .catch(() => {})
          return
        }

        if (info.confirmReplies && info.confirmReplies.length > 0) {
          const confirmReplies = info.confirmReplies.length
          const confirmReplyIndex = Math.floor(Math.random() * confirmReplies)
          const confirmReplyTemplate = info.confirmReplies[confirmReplyIndex]
          const confirmReply = formatReplyTemplate(
            confirmReplyTemplate,
            message.author,
            (targetMember || {}).user
          )

          confirmMsg = await message.channel
            .send(String(targetMember), {
              embed: {
                color: config.meta.defaultColor,
                title: `Реакция: ${info.name.toLowerCase()}`,
                description: [
                  confirmReply,
                  '',
                  '**Внимательно подумай над предложением!**'
                ].join('\n'),
                footer: {
                  text: message.author.username,
                  icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: Date.now()
              }
            })
            .catch(() => {})
          if (!confirmMsg) return

          const reaction = await Util.confirm(
            confirmMsg,
            targetMember.user,
            3e5
          )
          confirmMsg.reactions.removeAll().catch(() => {})
          if (!reaction) {
            confirmMsg
              .edit('', {
                embed: {
                  color: config.meta.defaultColor,
                  title: `Реакция: ${info.name}`,
                  description: `${targetMember} проигнорировал(-а) тебя`,
                  footer: {
                    text: message.author.username,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                  },
                  timestamp: Date.now()
                }
              })
              .catch(() => {})
            return
          }
        }
      }

      const price = Math.floor(Math.random() * (priceDiff + 1)) + minPrice
      userDoc.gold -= price
      userDoc.save()

      const replies = (isDouble
        ? info.doubleReplies
        : info.singleReplies) as string[]

      const image = info.images[Math.floor(Math.random() * info.images.length)]
      const replyTemplate = replies[Math.floor(Math.random() * replies.length)]

      const reply = formatReplyTemplate(
        replyTemplate,
        message.author,
        (targetMember || {}).user
      )

      const embed: MessageEmbedOptions = {
        color: config.meta.defaultColor,
        title: `Реакция: ${info.name.toLowerCase()}`,
        description: reply,
        footer: {
          text: `${message.author.tag} • стоимость ${price.toLocaleString(
            'ru-RU'
          )} ${Util.pluralNoun(price, 'золото', 'золота', 'золота')}`,
          icon_url: message.author.displayAvatarURL({ dynamic: true })
        },
        timestamp: Date.now()
      }

      if (image) embed.image = { url: image }

      if (confirmMsg) confirmMsg.edit('', { embed }).catch(() => {})
      else message.channel.send({ embed }).catch(() => {})
    }
  }
}

const commands = reactions.map(info => reactionCommand(info))

class ReactionsCommand extends Command {
  get options() {
    return { name: 'реакции' }
  }

  execute(message: Message) {
    message.author
      .send({
        embed: {
          color: config.meta.defaultColor,
          title: '              Все доступные реакции',
          description:
            '```fix\nРеакция на одного              Реакция для двоих\n```\n```diff\n!смущаюсь — Смущаться    ╏  !погладить @user — приголубить\n!радуюсь — Радоваться    ╏  !кусь @user — укусить \n!сплю — Спать            ╏  !ласкать @user — приласкать\n!курю — Курить           ╏  !любовь @user — пристрастие\n!плачу — Плакать         ╏  !обнять @user — облапить\n!смеюсь — Смееятся       ╏  !поцеловать @user — коснуться\n!пью чай — Пить чай      ╏  !тык @user — дотронуться\n!танец — Танцевать       ╏  !ударить @user — задеть\n!грусть — Грустить       ╏  !выстрелить @user — нажать курок\n!шок — Потрясение        ╏  !лизнуть @user — облизать\n!еда - Кушать еду        ╏  !секс @user — половая активность \n!бежать — Убегать        ╏  !пощечина @user — удар\n```'
        }
      })
      .catch(() => {})
  }
}

export = [...commands, ReactionsCommand]
