export interface ReactionInfo {
  name: string
  aliases: string[]
  images: string[]
  confirmReplies?: string[]
  singleReplies?: string[]
  doubleReplies?: string[]
}

const reactions: ReactionInfo[] = [
  {
    name: 'смущаюсь',
    aliases: [],
    images: [
      'https://i.imgur.com/EOtyiOh.gif',
      'https://i.imgur.com/PcgrSRb.gif',
      'https://i.imgur.com/reAxr14.gif',
      'https://i.imgur.com/hQQbOF4.gif'
    ],
    singleReplies: ['Смотрите, как мило! {author} засмущался! (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧']
  },
  {
    name: 'радуюсь',
    aliases: [],
    images: [
      'https://i.imgur.com/8d1H8d5.gif',
      'https://i.imgur.com/AWIhslB.gif',
      'https://i.imgur.com/EHDnahd.gif',
      'https://i.imgur.com/386bEmm.gif',
      'https://i.imgur.com/HR52KOJ.gif',
      'https://i.imgur.com/LfbU7tD.gif'
    ],
    singleReplies: ['{author} радуется. Может присоединимся?']
  },
  {
    name: 'сплю',
    aliases: [],
    images: [
      'https://i.imgur.com/81uG8d5.gif',
      'https://i.imgur.com/SUYyAXi.gif',
      'https://i.imgur.com/3gLUvjp.gif',
      'https://i.imgur.com/57DOnNe.gif',
      'https://i.imgur.com/21epRKV.gif'
    ],
    singleReplies: [
      'Котёнок {author} уснул. Давайте будем потише в чате... (~˘▾˘)~'
    ]
  },
  {
    name: 'курю',
    aliases: [],
    images: [
      'https://i.imgur.com/d5TjR9k.gif',
      'https://i.imgur.com/Fls6S4l.gif',
      'https://i.imgur.com/ShAkYmB.gif',
      'https://i.imgur.com/d5HCbSG.gif',
      'https://i.imgur.com/sRA2SFn.gif',
      'https://i.imgur.com/q2MC4Dl.gif',
      'https://i.imgur.com/UimfJ4P.gif'
    ],
    singleReplies: ['{author} закурил... Может не стоит? ノ(º _ ºノ)']
  },
  {
    name: 'плачу',
    aliases: [],
    images: [
      'https://i.imgur.com/ChX0zuv.gif',
      'https://i.imgur.com/AQUoCqR.gif',
      'https://i.imgur.com/JqwOUEc.gif',
      'https://i.imgur.com/i47yOWc.gif'
    ],
    singleReplies: ['Э-э-эй! {author} плачет. Нужно скорее его обнять!']
  },
  {
    name: 'смеюсь',
    aliases: [],
    images: [
      'https://i.imgur.com/UAympEm.gif',
      'https://i.imgur.com/U6iac8Y.gif',
      'https://i.imgur.com/pPyvbcL.gif',
      'https://i.imgur.com/iqxGnXv.gif',
      'https://i.imgur.com/0fxAS48.gif',
      'https://i.imgur.com/l0fdeut.gif',
      'https://i.imgur.com/n4bqCIW.gif',
      'https://i.imgur.com/zv0tKLF.gif'
    ],
    singleReplies: ['Ха-ха~ @ {author} смеётся.']
  },
  {
    name: 'пью чай',
    aliases: [],
    images: [
      'https://i.imgur.com/dmIzgiu.gif',
      'https://i.imgur.com/QGi79Fs.gif',
      'https://i.imgur.com/FrJ9Ndm.gif',
      'https://i.imgur.com/Nw70ERF.gif',
      'https://i.imgur.com/QTbKYxH.gif',
      'https://i.imgur.com/z5mkYmk.gif'
    ],
    singleReplies: ['Присоединяйтесь к чаепитию с {author}. (｡◕‿◕｡)']
  },
  {
    name: 'танец',
    aliases: [],
    images: [
      'https://i.imgur.com/yu3kDUo.gif',
      'https://i.imgur.com/NL0apZh.gif',
      'https://i.imgur.com/5jSg6oX.gif',
      'https://i.imgur.com/S3e3igm.gif'
    ],
    singleReplies: ['Смотрите, как красиво танцует {author}!']
  },
  {
    name: 'грусть',
    aliases: [],
    images: [
      'https://i.imgur.com/1YQWpVw.gif',
      'https://i.imgur.com/Uz9poZe.gif',
      'https://i.imgur.com/O6Ag9Al.gif',
      'https://i.imgur.com/01y8uq9.gif'
    ],
    singleReplies: [
      'Солнышко {author} загрустило... Кому-то срочно нужно поднять настроение!'
    ]
  },
  {
    name: 'шок',
    aliases: [],
    images: [
      'https://i.imgur.com/FD7RJ6O.gif',
      'https://i.imgur.com/Rxuvkp5.gif',
      'https://i.imgur.com/kwYTbUa.gif',
      'https://i.imgur.com/bAuGiPv.gif',
      'https://i.imgur.com/NWGK2cM.gif',
      'https://i.imgur.com/QM488bN.gif'
    ],
    singleReplies: ['Звезда {author} в шоке.']
  },
  {
    name: 'еда',
    aliases: [],
    images: [
      'https://i.imgur.com/JNpSE0a.gif',
      'https://i.imgur.com/GMv6e4R.gif',
      'https://i.imgur.com/qj7Usu1.gif',
      'https://i.imgur.com/BKkPWN3.gif',
      'https://i.imgur.com/RTwOSSw.gif'
    ],
    singleReplies: ['М~м~ {author} ест. А поделиться? /(т-т)\\']
  },
  {
    name: 'бежать',
    aliases: [],
    images: [
      'https://i.imgur.com/utB7Y3b.gif',
      'https://i.imgur.com/56zaBNi.gif',
      'https://i.imgur.com/ZCeGtBg.gif',
      'https://i.imgur.com/esBiUR5.gif',
      'https://i.imgur.com/8IK85kQ.gif',
      'https://i.imgur.com/RBHRULc.gif',
      'https://i.imgur.com/IU5IIoz.gif',
      'https://i.imgur.com/opzued9.gif',
      'https://i.imgur.com/zRfQMHq.gif'
    ],
    singleReplies: [
      'Смотри куда бежишь, {author}! Там может быть стена... (¬_¬)'
    ]
  },
  {
    name: 'погладить',
    aliases: [],
    images: [
      'https://i.imgur.com/KRmGyir.gif',
      'https://i.imgur.com/etHhs73.gif',
      'https://i.imgur.com/T23Qv2V.gif'
    ],
    doubleReplies: [
      '{author} гладит {target} по головке! Наверное это приятно... (⌒ω⌒)'
    ]
  },
  {
    name: 'кусь',
    aliases: [],
    images: [
      'https://i.imgur.com/jSqYhns.gif',
      'https://i.imgur.com/lrthhlp.gif',
      'https://i.imgur.com/k5jgu1Y.gif',
      'https://i.imgur.com/Bn0SfIb.gif',
      'https://i.imgur.com/Bdf5EKT.gif',
      'https://i.imgur.com/LmquT01.gif',
      'https://i.imgur.com/gD9COkC.gif'
    ],
    doubleReplies: ['{author} делает кусь {target}. Это так мило! (≧▽≦)']
  },
  {
    name: 'ласкать',
    aliases: [],
    images: [
      'https://i.imgur.com/ATPGZPb.gif',
      'https://i.imgur.com/Zyo1FGv.gif',
      'https://i.imgur.com/II0nANG.gif',
      'https://i.imgur.com/8b7RXcy.gif',
      'https://i.imgur.com/mZkMY1M.gif',
      'https://i.imgur.com/N19h2aa.gif',
      'https://i.imgur.com/LZzvpzl.gif'
    ],
    doubleReplies: [
      'Смотрите! {author} ласкает {target}. Что же будет дальше? (´ ▽ `).｡ｏ♡'
    ]
  },
  {
    name: 'любовь',
    aliases: [],
    confirmReplies: ['{author} признается в любви'],
    images: [
      'https://i.imgur.com/UrvHl1H.gif',
      'https://i.imgur.com/RU8fsS3.gif',
      'https://i.imgur.com/tUear5r.gif'
    ],
    doubleReplies: [
      'Ого~ {author} признался в любви {target}? Так мило! (´｡• ᵕ •｡`)'
    ]
  },
  {
    name: 'обнять',
    aliases: [],
    confirmReplies: ['{author} хочет тебя обнять'],
    images: [
      'https://i.imgur.com/HZ423Nr.gif',
      'https://i.imgur.com/RWTBzWm.gif',
      'https://i.imgur.com/LSFissS.gif',
      'https://i.imgur.com/edYHVXC.gif',
      'https://i.imgur.com/vAKa8OK.gif',
      'https://i.imgur.com/O6qhsfp.gif',
      'https://i.imgur.com/7jf6ihH.gif',
      'https://i.imgur.com/aHudUj9.gif',
      'https://i.imgur.com/xJlv3OX.gif'
    ],
    doubleReplies: [
      'Котики {author} и {target} обнимаются. Может они не просто друзья? (･ω<)☆'
    ]
  },
  {
    name: 'поцеловать',
    aliases: [],
    confirmReplies: ['{author} хочет тебя поцеловать'],
    images: [
      'https://i.imgur.com/Ui0Gy9z.gif',
      'https://i.imgur.com/Tj0rUWc.gif',
      'https://i.imgur.com/pKwOitS.gif',
      'https://i.imgur.com/x2gEP9W.gif',
      'https://i.imgur.com/fSCM7Wu.gif'
    ],
    doubleReplies: [
      '{author} страстно целует {target}. У них любовь? ヽ(ﾟ〇ﾟ)ヽ'
    ]
  },
  {
    name: 'тык',
    aliases: [],
    images: [
      'https://i.imgur.com/yag3ZYn.gif',
      'https://i.imgur.com/ymqGwDg.gif',
      'https://i.imgur.com/JuUar1G.gif'
    ],
    doubleReplies: ['{author} тыкает {target}. Зачем? (⌒▽⌒)']
  },
  {
    name: 'ударить',
    aliases: [],
    images: [
      'https://i.imgur.com/Xor7pki.gif',
      'https://i.imgur.com/qIMz7xc.gif',
      'https://i.imgur.com/NdRJ7nN.gif',
      'https://i.imgur.com/17hFjiL.gif',
      'https://i.imgur.com/nYqKJnU.gif',
      'https://i.imgur.com/cTQINZE.gif',
      'https://i.imgur.com/0mWRFPi.gif',
      'https://i.imgur.com/o2daWIB.gif',
      'https://i.imgur.com/OnJ6QgW.gif',
      'https://i.imgur.com/bfv3riv.gif'
    ],
    doubleReplies: ['Вызывайте скорую! {author} ударил {target}. (*｀0´)']
  },
  {
    name: 'выстрелить',
    aliases: [],
    images: [
      'https://i.imgur.com/nvmZcGn.gif',
      'https://i.imgur.com/A1vkivG.gif',
      'https://i.imgur.com/eBWsqbE.gif'
    ],
    doubleReplies: [
      '{author} выстрелил в {target}. Я надеюсь, что не насмерть... ヘ(>_<ヘ)'
    ]
  },
  {
    name: 'лизнуть',
    aliases: [],
    images: [
      'https://i.imgur.com/SoNfzBt.gif',
      'https://i.imgur.com/Vilc4qr.gif',
      'https://i.imgur.com/psNxCtP.gif'
    ],
    doubleReplies: [
      'Ничего себе! {author} лижет {target}. Кто-то считает, что это мороженое... ╰(▔∀▔)╯'
    ]
  },
  {
    name: 'секс',
    aliases: [],
    confirmReplies: ['{author} хочет с тобой пошалить'],
    images: [
      'https://i.imgur.com/FavMk2j.gif',
      'https://i.imgur.com/4KAT0Y1.gif',
      'https://i.imgur.com/wajydQy.gif',
      'https://i.imgur.com/8IvXhGE.gif'
    ],
    doubleReplies: [
      '{author} хочет пошалить с {target}. Вы же продолжите не в общем чате? ʕ•ᴥ•ʔ'
    ]
  },
  {
    name: 'пощечина',
    aliases: [],
    images: [
      'https://i.imgur.com/yWrUflv.gif',
      'https://i.imgur.com/3NUKgII.gif',
      'https://i.imgur.com/539oUEr.gif',
      'https://i.imgur.com/CLTysXv.gif'
    ],
    doubleReplies: [
      '{author} дал ляпаса {target}. Между ними что-то случилось!? (ಠ_ಠ)'
    ]
  }
]

export default reactions
