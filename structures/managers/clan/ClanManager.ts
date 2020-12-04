import ManagerBase from '../ManagerBase'
import { default as Clan, ClanData } from '../../clan/Clan'

export default class ClanManager extends ManagerBase<Clan, ClanData> {
  constructor() {
    super(Clan)
  }

  create(data: ClanData): Clan {
    const existing = this.get(data.clanID)
    if (existing) {
      existing.patch(data)
      return existing
    }

    return this.save(data.clanID, data)
  }
}
