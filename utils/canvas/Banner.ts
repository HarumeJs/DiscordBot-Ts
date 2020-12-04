import { Guild } from 'discord.js'
import { createCanvas, Image } from 'canvas'

import CanvasUtil from './canvas'
import { getMainGuild } from '../util'

export default class CanvasBanner {
  constructor() {
    return CanvasUtil.images.then(images => {
      const guild = getMainGuild() as Guild
      const voiceSize = guild.voiceStates.cache
        .array()
        .filter(v => Boolean(v.channelID)).length
      const memberCount = guild.memberCount

      const bg: Image = images.banner.background
      const canvas = createCanvas(bg.width, bg.height)
      const ctx = canvas.getContext('2d')

      ctx.drawImage(bg, 0, 0)

      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      ctx.font = '40px banner'
      ctx.fillText(voiceSize.toLocaleString('ru-RU'), 65, 510, 90)

      ctx.font = '44px banner'
      ctx.fillText(memberCount.toLocaleString('ru-RU'), 855, 500, 180)

      return canvas.toBuffer()
    })
  }
}
