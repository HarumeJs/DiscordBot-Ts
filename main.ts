import { Core } from 'discore.js'

import db from './utils/db'
import Collection from './structures/Collection'

import * as Util from './utils/util'
import * as config from './config'

import { CloseData, EventData, PrivateRoomData } from './utils/types'

require('events').EventEmitter.defaultMaxListeners = 0

const client = new Core({
  db,
  ws: { intents: config.intents },
  token: config.internal.token,
  prefix: '',
  commandOptions: {
    argsSeparator: ' ',
    ignoreBots: true,
    ignoreCase: true,
    ignoreSelf: true
  }
})

export default client

export const events = new Collection<string, EventData>()
export const closes = new Collection<string, CloseData>()
export const privaterooms = new Collection<string, PrivateRoomData>()
export const activePairOffers = new Set<string>()
export const activeClanDeletions = new Set<string>()

Util.disableEvents()
Util.patchManagers()
Util.processPrefixes()
Util.fetchPrivaterooms()
