import { ClientUser, Guild } from 'discord.js'

import ID from '../ID'
import client from '../../main'
import clanManager from '../../managers/clan'
import ClanMemberManager from '../managers/clan/ClanMemberManager'

import * as Util from '../../utils/util'

import { RequestInit } from 'node-fetch'
import { IClan, Clan as Clans, User } from '../../utils/db'
import { RawClanOfficer, RawClanMember } from '../../utils/types'

export interface ClanOptions {
  name: string
  ownerID: string
}

export interface ClanUpdatables {
  ownerID: string
  description: string
  flag: string
  color: number
  roleID: string
  officers: RawClanOfficer[]
  members: RawClanMember[]
}

export interface ClanData {
  clanID: string

  ownerID: string
  officers: RawClanOfficer[]
  members: RawClanMember[]

  name: string
  description: string | undefined
  flag: string | undefined
  color: number | undefined
  roleID: string | undefined
}

export default class Clan {
  public manager = clanManager
  public id: string
  public roleID: string | undefined
  public ownerID: string
  public name: string
  public flag: string | undefined
  public color: number | undefined
  public members: ClanMemberManager
  public description: string | undefined
  public rawOfficers: RawClanOfficer[]

  readonly create = Clan.create

  constructor(clan: ClanData) {
    this.id = clan.clanID
    this.name = clan.name
    this.roleID = clan.roleID
    this.ownerID = clan.ownerID
    this.members = new ClanMemberManager(this, clan.members)
    this.rawOfficers = []

    this.patch(clan)
  }

  get owner() {
    return this.members.get(this.ownerID)
  }

  get officers() {
    return this.members.filter(m => m.officer)
  }

  public patch(data: Partial<ClanUpdatables>) {
    if ('ownerID' in data) this.ownerID = data.ownerID as string
    if ('flag' in data) this.flag = data.flag
    if ('color' in data) this.color = data.color
    if ('description' in data) this.description = data.description
    if ('officers' in data) this.rawOfficers = data.officers || []
    if ('members' in data) this.members.patch(data.members || [])
  }

  public edit(data: Partial<ClanOptions & Partial<ClanUpdatables>>) {
    const guild = Util.getMainGuild() as Guild
    const clientUser = client.user as ClientUser

    if ('color' in data && !('roleID' in data)) {
      if (this.roleID) {
        const requestUrl = `guilds/${guild.id}/roles/${this.roleID}`
        const requestOptions: RequestInit = {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
            authorization: `${clientUser.bot ? 'Bot ' : ''}${client.token}`
          },
          body: JSON.stringify({ color: data.color })
        }

        Util.discordRetryHandler(requestUrl, requestOptions).catch(() => {})
      }
    }

    if ('roleID' in data) {
      if (data.roleID === 'string') {
        const requestOptions: RequestInit = {
          method: 'PUT',
          headers: {
            authorization: `${clientUser.bot ? 'Bot ' : ''}${client.token}`
          }
        }

        const functions = [...this.members.values()].map(m => {
          const requestUrl = `guilds/${guild.id}/members/${m.id}/roles/${data.roleID}`
          return Util.discordRetryHandler.bind(Util, requestUrl, requestOptions)
        })

        if (this.roleID !== data.roleID) {
          const requestOptions: RequestInit = {
            method: 'DELETE',
            headers: {
              authorization: `${clientUser.bot ? 'Bot ' : ''}${client.token}`
            }
          }

          const promises = [...this.members.values()].map(m => {
            const requestUrl = `guilds/${guild.id}/members/${m.id}/roles/${data.roleID}`
            return Util.discordRetryHandler(requestUrl, requestOptions)
          })

          Promise.all(promises).then(() => {
            return Promise.all(functions.map(f => f().catch(() => {})))
          })
        }
      } else if (data.roleID === null) {
        const guild = Util.getMainGuild() as Guild
        const clientUser = client.user as ClientUser
        const promises = [...this.members.values()].map(m => {
          return Util.discordRetryHandler(
            `guilds/${guild.id}/members/${m.id}/roles/${this.roleID}`,
            {
              method: 'DELETE',
              headers: {
                authorization: `${clientUser.bot ? 'Bot ' : ''}${client.token}`
              }
            }
          ).catch(() => {})
        })
        Promise.all(promises)
      }
    }
    return Clan.update(this.id, data)
  }

  public delete() {
    return Clan.delete(this.id)
  }

  private static async update(
    id: string,
    data: Partial<ClanOptions & Partial<ClanUpdatables>>
  ): Promise<IClan | null> {
    const res = await Clans.updateOne({ clanID: id }, data)
    return res || null
  }

  static create(options: ClanOptions & Partial<ClanUpdatables>): ClanData {
    const id = new ID()

    const clanID = id.id
    const { name, ownerID } = options

    const clanData: ClanData = {
      clanID,
      name,
      ownerID,
      description: options.description,
      flag: options.flag,
      color: options.color,
      roleID: options.roleID,
      officers: options.officers || [],
      members: options.members || [{ id: ownerID, tick: id.timestamp() }]
    }

    User.getOne({ userID: ownerID }).then(userDoc => {
      userDoc.clanID = clanID
      userDoc.save()
    })
    Clans.insertOne(clanData)
    return clanData
  }

  static delete(id: string) {
    User.updateMany({ clanID: id }, { clanID: undefined })
    Clans.deleteOne({ clanID: id })
    clanManager.delete(id)
  }
}
