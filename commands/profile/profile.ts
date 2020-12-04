import { Message } from 'discord.js'

import Command from '../../structures/Command'
import CanvasUtil from '../../utils/canvas/canvas'

import * as Util from '../../utils/util'

import { CommandParams } from '../../structures/Command'

export default class extends Command {
  get options() {
    return { name: 'профиль' }
  }

  async execute(message: Message, args: string[], { member }: CommandParams) {
    const targetMember = (await Util.resolveMember(args[0])) || member

    CanvasUtil.makeProfile(targetMember).then(profile => {
      message.channel
        .send({ files: [{ attachment: profile, name: 'profile.png' }] })
        .catch(console.error)
        .catch(() => {})
    })
  }
}
