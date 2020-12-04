import ClanMemberManager from '../managers/clan/ClanMemberManager'
import { User } from '../../utils/db'

export interface ClanMemberData {
  id: string
  tick: number
}

export interface ClanMemberOptions {
  officer?: boolean
}

export default class ClanMember {
  public id: string
  public joinTick: number

  constructor(public manager: ClanMemberManager, member: ClanMemberData) {
    this.id = member.id
    this.joinTick = 0

    this.patch(member)
  }

  readonly clan = this.manager.clan

  get owner(): boolean {
    return this.clan.ownerID === this.id
  }

  get officer(): boolean {
    return this.officerSince > -1
  }

  get officerSince(): number {
    const rawOfficer = this.clan.rawOfficers.find(o => o.id === this.id)
    if (!rawOfficer) return -1
    return rawOfficer.tick
  }

  setOfficer(officer: boolean) {
    let officers = [...this.clan.rawOfficers.map(o => ({ ...o }))]
    if (officer) officers.push({ id: this.id, tick: Date.now() })
    else officers = officers.filter(o => o.id !== this.id)

    this.clan.edit({ officers })
  }

  makeOfficer() {
    return this.setOfficer(true)
  }

  toggleOfficer() {
    return this.setOfficer(!this.officer)
  }

  unOfficer() {
    return this.setOfficer(false)
  }

  edit(data: ClanMemberOptions) {
    if ('officer' in data) this.setOfficer(Boolean(data.officer))
  }

  kick() {
    User.getOne({ userID: this.id }).then(userDoc => {
      userDoc.clanID = undefined
      userDoc.save()
    })

    this.clan.edit({
      members: [...this.manager.raw().filter(m => m.id !== this.id)],
      officers: [...this.clan.rawOfficers.filter(m => m.id !== this.id)]
    })
  }

  patch(data: ClanMemberData) {
    this.joinTick = data.tick
  }
}
