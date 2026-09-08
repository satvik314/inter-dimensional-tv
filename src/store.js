const KEY = 'idtv.falKey'
const CHANNELS = 'idtv.channels'
const MUTED = 'idtv.muted'

const safe = (fn, fallback) => {
  try {
    return fn()
  } catch {
    return fallback
  }
}

export const store = {
  getKey: () => safe(() => localStorage.getItem(KEY) || '', ''),
  setKey: (k) => safe(() => (k ? localStorage.setItem(KEY, k) : localStorage.removeItem(KEY))),
  getChannels: () => safe(() => JSON.parse(localStorage.getItem(CHANNELS) || '[]'), []),
  setChannels: (list) => safe(() => localStorage.setItem(CHANNELS, JSON.stringify(list))),
  getMuted: () => safe(() => localStorage.getItem(MUTED) !== '0', true),
  setMuted: (m) => safe(() => localStorage.setItem(MUTED, m ? '1' : '0')),
}
