import fetch from 'node-fetch'
import * as path from 'path'

import { GuildMember } from 'discord.js'
import { readFileSync } from 'fs'
import { Image, registerFont, CanvasRenderingContext2D } from 'canvas'
import {
  measureText,
  fillTextWithTwemoji,
  strokeTextWithTwemoji
} from 'node-canvas-with-twemoji'

import fs from '../fs'
import ObjectUtil from '../object'
import emojiRegex from '../emojiRegex'
import CanvasBanner from './Banner'
import CanvasProfile from './Profile'

const fonts = [
  { path: './assets/banner/font.ttf', family: 'banner' },
  { path: './assets/profile/font.ttf', family: 'profile' },
  { path: './assets/profile/font_bold.ttf', family: 'profile_bold' },
  { path: './assets/profile/font_black.ttf', family: 'profile_black' },
  { path: './assets/profile/font_extrabold.ttf', family: 'profile_extrabold' }
]

fonts.forEach(font => {
  registerFont(path.resolve(process.cwd(), font.path), { family: font.family })
})

class CanvasUtil {
  private static imagePaths = {
    banner: { background: './assets/banner/background.png' },
    profile: {
      static: './assets/profile/static.png',
      dynamic: {
        xp: './assets/profile/dynamic/xp.png',
        rep: './assets/profile/dynamic/rep.png',
        pair: './assets/profile/dynamic/pair.png',
        repLow: './assets/profile/dynamic/rep_low.png',
        clanName: './assets/profile/dynamic/clan_name.png',
        clanIcon: './assets/profile/dynamic/clan_icon.png'
      },
      overlays: {
        avatar: './assets/profile/overlays/avatar.png',
        clanIcon: './assets/profile/overlays/clan_icon.png'
      },
      backgrounds: fs
        .readdir('./assets/profile/backgrounds')
        .map(f => `./assets/profile/backgrounds/${f}`)
    }
  }

  private static _images = {
    banner: {
      background: CanvasUtil.loadImage(CanvasUtil.imagePaths.banner.background)
    },
    profile: {
      static: CanvasUtil.loadImage(CanvasUtil.imagePaths.profile.static),
      dynamic: {
        xp: CanvasUtil.loadImage(CanvasUtil.imagePaths.profile.dynamic.xp),
        rep: CanvasUtil.loadImage(CanvasUtil.imagePaths.profile.dynamic.rep),
        pair: CanvasUtil.loadImage(CanvasUtil.imagePaths.profile.dynamic.pair),
        repLow: CanvasUtil.loadImage(
          CanvasUtil.imagePaths.profile.dynamic.repLow
        ),
        clanName: CanvasUtil.loadImage(
          CanvasUtil.imagePaths.profile.dynamic.clanName
        ),
        clanIcon: CanvasUtil.loadImage(
          CanvasUtil.imagePaths.profile.dynamic.clanIcon
        )
      },
      overlays: {
        avatar: CanvasUtil.loadImage(
          CanvasUtil.imagePaths.profile.overlays.avatar
        )
      },
      backgrounds: Promise.all(
        CanvasUtil.imagePaths.profile.backgrounds.map(p => {
          return CanvasUtil.loadImage(p)
        })
      )
    }
  }

  public static images = ObjectUtil.promiseAll(CanvasUtil._images)

  public static readImage(src: string) {
    return readFileSync(path.join(process.cwd(), src))
  }

  public static loadImage(src: string | Buffer): Promise<Image> {
    return new Promise(async (resolve, reject) => {
      if (typeof src === 'string') {
        if (src.startsWith('http')) {
          src = await fetch(src).then(res => res.buffer())
        } else {
          src = this.readImage(src)
        }
      }

      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = e => reject(e)
      img.src = src
    })
  }

  public static parseFont(font: string) {
    const match = font.match(/^(\d+)px\s(.+)$/)
    if (!match) return null

    return {
      size: Number(match[1]),
      family: match[2]
    }
  }

  public static font(font: { size: number; family: string }) {
    return `${font.size}px ${font.family}`
  }

  public static fillText(
    ctx: CanvasRenderingContext2D,
    text: string,
    w: number,
    h: number,
    maxWidth?: number
  ) {
    return new Promise(resolve => {
      if (maxWidth) {
        let font = this.parseFont(ctx.font)
        if (font) {
          let measure = this.measureText(ctx, text)

          while (measure.width > maxWidth) {
            font.size -= 1
            ctx.font = this.font(font)
            measure = this.measureText(ctx, text)
          }
        }
      }

      if (emojiRegex.test(text)) resolve(fillTextWithTwemoji(ctx, text, w, h))
      else resolve(ctx.fillText(text, w, h))
    })
  }

  public static strokeText(
    ctx: CanvasRenderingContext2D,
    text: string,
    w: number,
    h: number
  ) {
    return strokeTextWithTwemoji(ctx, text, w, h)
  }

  public static measureText(ctx: CanvasRenderingContext2D, text: string) {
    return measureText(ctx, text)
  }

  public static shadow(
    ctx: CanvasRenderingContext2D,
    options: {
      blur?: number
      color?: string
      distance?: number
      angle?: number
    } = {}
  ) {
    const blur = options.blur || 0
    const color = options.color || '#000'
    const angle = (options.angle || 0) - 90
    const distance = options.distance || 0

    const x = Math.sin(Math.PI * (angle / 180)) * distance
    const y = Math.cos(Math.PI * (angle / 180)) * distance

    ctx.shadowBlur = blur / 4
    ctx.shadowColor = color
    ctx.shadowOffsetX = x
    ctx.shadowOffsetY = y
  }

  public static makeBanner() {
    return new CanvasBanner() as Promise<Buffer>
  }

  public static makeProfile(member: GuildMember) {
    return new CanvasProfile(member) as Promise<Buffer>
  }
}

export default CanvasUtil
