import * as moment from 'moment-timezone'

import { GuildMember } from 'discord.js'
import { Canvas, createCanvas, Image } from 'canvas'

import client from '../../main'
import CanvasUtil from './canvas'

import * as Util from '../../utils/util'
import * as config from '../../config'

import { Pair, User } from '../db'
import clanManager from '../../managers/clan'

export default class CanvasProfile {
  constructor(member: GuildMember) {
    return CanvasUtil.images.then(async images => {
      const bg: Image = images.profile.backgrounds[0]
      const canvas = createCanvas(bg.width, bg.height)
      const ctx = canvas.getContext('2d')
      const fillText = CanvasUtil.fillText.bind(CanvasUtil, ctx)

      const [profile, pair] = await Promise.all([
        User.getOne({ userID: member.id }),
        Pair.findOne(p => (p.pair || []).includes(member.id))
      ])

      // Background
      ctx.drawImage(bg, 0, 0)

      //#region Avatar
      const avatarURL = member.user.displayAvatarURL({
        size: 256,
        format: 'png',
        dynamic: false
      })
      const avatarImage = await CanvasUtil.loadImage(avatarURL).catch(() => {})
      if (avatarImage) {
        const avatar = await CanvasProfile.makeAvatar(avatarImage)
        ctx.drawImage(avatar, 0, 0)
      }
      //#endregion

      // Static
      ctx.drawImage(images.profile.static, 0, 0)

      //#region Global
      ctx.textBaseline = 'middle'
      //#endregion

      //#region Tag
      ctx.font = '24px profile_bold, serif'
      ctx.textAlign = 'start'
      ctx.fillStyle = '#ebebeb'

      CanvasUtil.shadow(ctx, {
        blur: 8,
        color: 'rgba(0,0,0,0.4)',
        angle: 135,
        distance: 4
      })
      await fillText(member.user.tag, 168, 258, 300)
      //#endregion

      //#region Join date
      const tz = config.meta.defaultTimezone
      const joinMoment = moment(member.joinedTimestamp).tz(tz)
      const joinString = joinMoment.locale('ru-RU').format('L')

      ctx.font = '22px profile_bold, serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#e7e7e7'

      CanvasUtil.shadow(ctx)
      await fillText(joinString, 140, 65, 150)
      //#endregion

      //#region Voice Time
      const voiceActivity = Util.parseVoiceActivity(profile.voiceActivity)
      const voiceTime = profile.voiceTime + voiceActivity
      const timeString = Util.parseFilteredTimeString(voiceTime)

      ctx.font = '22px profile_bold, serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#e7e7e7'

      CanvasUtil.shadow(ctx)
      await fillText(timeString, 150, 104, 120)
      //#endregion

      //#region Pair
      if (pair) {
        const pairID = pair.pair.find(id => id !== member.id)
        const pairUser = pairID ? await client.users.fetch(pairID) : null

        if (pairUser) {
          ctx.drawImage(images.profile.dynamic.pair, 0, 0)

          ctx.font = '24px profile_bold, serif'
          ctx.textAlign = 'center'
          ctx.fillStyle = '#ebebeb'
          CanvasUtil.shadow(ctx, {
            blur: 8,
            color: 'rgba(0,0,0,0.4)',
            angle: 120,
            distance: 2
          })
          await fillText(pairUser.username, 170, 402, 140)
        }
      }
      //#endregion

      //#region Voice Position
      const profilesPromise = User.getData()
      const profiles = await profilesPromise
      const voiceIndex = await profilesPromise
        .then(data => [...data.values()])
        .then(docs => {
          return docs.map(d => {
            return {
              ...d,
              voiceTime: d.voiceTime + Util.parseVoiceActivity(d.voiceActivity)
            }
          })
        })
        .then(docs => docs.sort((b, a) => a.voiceTime - b.voiceTime))
        .then(docs => docs.findIndex(d => d.userID === member.id))
      const voicePos = voiceIndex + 1 || profiles.array().length + 1
      const voicePosString = voicePos.toLocaleString('ru-RU')

      ctx.font = '22px profile_bold, serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#e7e7e7'

      CanvasUtil.shadow(ctx)
      await fillText(voicePosString, 495, 402, 90)
      //#endregion

      //#region Level
      ctx.font = '54px profile_bold, serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#e7e7e7'

      CanvasUtil.shadow(ctx)
      await fillText('0', 523, 77, 70)
      //#endregion

      //#region Reputation
      ctx.drawImage(images.profile.dynamic.rep, 0, 0)

      ctx.font = '22px profile_bold, serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#e7e7e7'

      CanvasUtil.shadow(ctx)
      await fillText('0', 495, 348, 100)
      //#endregion

      //#region Xp
      ctx.drawImage(images.profile.dynamic.xp, 0, 0)
      //#endregion

      //#region Clan
      const clanID = profile.clanID
      if (typeof clanID === 'string') {
        const clan = clanManager.get(clanID)
        if (clan) {
          const clanIconURL = clan.flag
          if (clanIconURL) {
            const clanIconImage = await CanvasUtil.loadImage(
              clanIconURL
            ).catch(() => {})
            if (clanIconImage) {
              const clanIcon = await CanvasProfile.makeClanIcon(clanIconImage)
              ctx.drawImage(clanIcon, 0, 0)
            }
          }
          ctx.drawImage(images.profile.dynamic.clanName, 0, 0)

          ctx.font = '24px profile_extrabold, serif'
          ctx.textAlign = 'center'
          ctx.fillStyle = '#ebebeb'
    
          CanvasUtil.shadow(ctx, {
            blur: 8,
            color: 'rgba(0,0,0,0.7)',
            angle: 120,
            distance: 4
          })
          fillText(clan.name, 325, 213, 200)
        }
      }
      //#endregion

      return canvas.toBuffer()
    })
  }

  static makeAvatar(avatar: Image) {
    return new this.Avatar(avatar) as Promise<Canvas>
  }

  static makeClanIcon(icon: Image) {
    return new this.ClanIcon(icon) as Promise<Canvas>
  }

  static get ClanIcon() {
    return class CanvasClanIcon {
      constructor(icon: Image) {
        return CanvasUtil.images.then(images => {
          const overlay: Image = images.profile.overlays.clanIcon
          const canvas = createCanvas(overlay.width, overlay.height)
          const ctx = canvas.getContext('2d')

          ctx.drawImage(overlay, 0, 0)
          ctx.globalCompositeOperation = 'source-in'
          ctx.drawImage(icon, 170, 192, 40, 40)

          return canvas
        })
      }
    }
  }

  static get Avatar() {
    return class CanvasAvatar {
      constructor(avatar: Image) {
        return CanvasUtil.images.then(images => {
          const overlay: Image = images.profile.overlays.avatar
          const canvas = createCanvas(overlay.width, overlay.height)
          const ctx = canvas.getContext('2d')

          ctx.drawImage(overlay, 0, 0)
          ctx.globalCompositeOperation = 'source-in'
          ctx.drawImage(avatar, 58, 184, 100, 100)

          return canvas
        })
      }
    }
  }
}
