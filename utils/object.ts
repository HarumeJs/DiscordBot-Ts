export default class ObjectUtil {
  public static isObject(o: object) {
    return typeof o === 'object' && {}.toString.call(o) === '[object Object]'
  }

  public static pathify<T extends object>(o: T): { [K: string]: T[keyof T] } {
    const toPath = (obj: { [K: string]: any }, path: string = '') => {
      const pathPrefix = `${path}${path.length > 0 ? '.' : ''}`

      const paths: { [K: string]: any } = {}
      for (const rawKey in obj) {
        const key = rawKey.replace(/\./g, '\\.')
        const val = obj[key]
        const locPath = `${pathPrefix}${key}`

        if (this.isObject(val)) Object.assign(paths, toPath(val, locPath))
        else paths[locPath] = val
      }

      return paths
    }
    return toPath(o)
  }

  public static hasPath<O extends { [K: string]: any }>(
    o: O,
    path: string
  ): boolean {
    const keyArr = path.split(/(?<!\\)\./).map(k => k.replace(/\\\./g, '.'))

    let val = o[keyArr.shift() as string]
    for (const key of keyArr) {
      if (!this.isObject(val)) return false
      else val = val[key]
    }

    return true
  }

  public static getPathValue<O extends { [K: string]: any }>(
    o: O,
    path: string
  ) {
    if (!this.hasPath(o, path)) return undefined

    const keyArr = path.split(/(?<!\\)\./).map(k => k.replace(/\\\./g, '.'))

    let val = o[keyArr.shift() as string]
    for (const key of keyArr) {
      if (this.isObject(val)) val = val[key]
      else val = undefined
    }

    return val
  }

  public static assignPathValue<O extends object, V>(
    o: O,
    path: string,
    val: V
  ) {
    const keyArr = path.split(/(?<!\\)\./).map(k => k.replace(/\\\./g, '.'))
    const lastKey = keyArr.splice(keyArr.length - 1, 1)[0]
    let obj: { [K: string]: any } = o

    for (const key of keyArr) {
      if (!this.isObject(obj[key])) obj[key] = {}
      obj = obj[key]
    }
    obj[lastKey] = val
  }

  public static unPathify<T extends object>(o: T): { [K: string]: T[keyof T] } {
    const newObj = {}
    for (const path in o) this.assignPathValue(newObj, path, o[path])
    return newObj
  }

  public static fromEntries(entries: [string, any][]) {
    const o: { [K: string]: any } = {}
    for (const entry of entries) o[entry[0]] = entry[1]
    return o
  }

  public static promiseAll(o: object) {
    const paths = this.pathify(o)
    const pathEntries = Object.entries(paths)

    return Promise.all(pathEntries.map(e => e[1])).then(vals => {
      for (const i in vals) pathEntries[i][1] = vals[i]
      return this.unPathify(this.fromEntries(pathEntries))
    })
  }
}
