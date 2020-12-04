export default class Collection<K, V> extends Map<K, V> {
  clear() {
    const deletedKeys = []
    for (const key of [...this.keys()]) {
      this.delete(key)
      deletedKeys.push(key)
    }
    return deletedKeys
  }

  filter(
    func: (val: V, key: K, col: Collection<K, V>) => boolean
  ): Collection<K, V> {
    const col = new Collection<K, V>()
    for (const [key, val] of this.entries()) {
      if (func(val, key, this)) col.set(key, val)
    }
    return col
  }
}
