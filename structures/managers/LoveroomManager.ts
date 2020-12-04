import ManagerBase from './ManagerBase'
import { default as Loveroom, LoveroomData } from '../Loveroom'

export default class LoveroomManager extends ManagerBase<
  Loveroom,
  LoveroomData
> {
  constructor() {
    super(Loveroom)
  }

  resolve(id: string) {
    return this.get(id) || [...this.values()].find(v => v.pair.includes(id))
  }

  create(data: LoveroomData): Loveroom {
    const existing = this.get(data.roomID)
    if (existing) return existing

    return this.save(data.roomID, data)
  }
}
