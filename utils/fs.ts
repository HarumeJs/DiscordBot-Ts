import * as fs from 'fs'
import { resolve as resolvePath } from 'path'

export default class FSUtil {
  static isdir(path: string): boolean {
    if (!fs.existsSync(path)) return false

    const stat = fs.statSync(path)
    return stat.isDirectory()
  }

  static readdir(path: string): string[] {
    const files: string[] = []
    if (this.isdir(path)) files.push(...fs.readdirSync(path))

    return files
  }

  static readdirpaths(path: string): string[] {
    const paths: string[] = []

    for (const file of this.readdir(path)) {
      const localPath = resolvePath(path, file)
      if (this.isdir(localPath)) {
        const localPaths = this.readdirpaths(resolvePath(localPath))
        paths.push(...localPaths.map(p => resolvePath(path, p)))
      } else {
        paths.push(localPath)
      }
    }

    return paths
  }

  static readfile(path: string): string | null {
    if (!fs.existsSync(path)) return null

    return fs.readFileSync(path, 'utf8')
  }
}
