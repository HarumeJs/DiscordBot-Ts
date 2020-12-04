export interface MusicBot {
  id: string
  emoji: string
  prefix: string
}

const musicbots: MusicBot[] = [
  {
    id: '614109280508968980',
    emoji: '<:music8:756754713894060094>',
    prefix: '++'
  },
  {
    id: '228537642583588864',
    emoji: '<:music7:756754714288455740>',
    prefix: '+'
  },
  {
    id: '184405311681986560',
    emoji: '<:music6:756754713948455013>',
    prefix: ';;'
  },
  {
    id: '234395307759108106',
    emoji: '<:music5:756754714250444830>',
    prefix: '-'
  },
  {
    id: '415062217596076033',
    emoji: '<:music4:756754713973882932>',
    prefix: '>>>'
  },
  {
    id: '252128902418268161',
    emoji: '<:music3:756754714166689802>',
    prefix: '>>'
  },
  {
    id: '235088799074484224',
    emoji: '<:music2:756754713730482177>',
    prefix: '>'
  },
  {
    id: '201503408652419073',
    emoji: '<:music1:756754714217152512>',
    prefix: '_'
  }
]

export default musicbots
