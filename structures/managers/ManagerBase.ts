import Collection from '../Collection'
import { Constructable } from '../../utils/types'

export default class ManagerBase<T, D, K = string> extends Collection<K, T> {
  constructor(public Class: Constructable<T>) {
    super()
  }

  save(id: K, data: D): T {
    const instance = new this.Class(data, this)
    this.set(id, instance)
    return instance
  }
}
