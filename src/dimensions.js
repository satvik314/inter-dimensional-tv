// Dimension designations in the spirit of interdimensional cable.
// Every channel you tune to gets one of these at random.

const LETTERS = 'CJKZNFTDRXQVB'
const GREEK = ['α', 'β', 'γ', 'δ', 'ζ', 'θ', 'λ', 'ξ', 'π', 'σ', 'φ', 'ψ', 'ω']
const SUFFIX = ['', '', '', 'A', 'B', 'X', 'Ω', '-PRIME', '-b', '½']

const rnd = (n) => Math.floor(Math.random() * n)
const pick = (arr) => arr[rnd(arr.length)]

export function randomDimension() {
  const style = rnd(4)
  if (style === 0) return `${pick(LETTERS)}-${100 + rnd(900)}${pick(SUFFIX)}`
  if (style === 1) return `${pick(LETTERS)}${rnd(10)}${rnd(10)}${pick(GREEK)}${rnd(10)}`
  if (style === 2) return `${pick(LETTERS)}-${rnd(10)}${rnd(10)}${rnd(10)}${pick(GREEK)}`
  return `${pick(GREEK)}${pick(GREEK)}-${rnd(100)}${pick(SUFFIX)}`
}

// Seven teletext colours. A channel keeps its colour for life.
export const TELETEXT = ['#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff', '#00ffff', '#ffffff']
export const TELETEXT_NAMES = ['RED', 'GRN', 'YEL', 'BLU', 'MAG', 'CYN', 'WHT']

export function randomHue() {
  // Avoid pure blue on black for legibility. Keep it in the palette otherwise.
  const i = [0, 1, 2, 4, 5, 6][rnd(6)]
  return { hex: TELETEXT[i], name: TELETEXT_NAMES[i] }
}

// Channel-surf presets. Original shows from dimensions that do not exist.
export const SURF = [
  'A late-night talk show hosted by a sentient houseplant interviewing a nervous toaster',
  'Weather report for a city where it rains upwards, presented by a very calm octopus in a suit',
  'Cooking show where a tiny chef prepares a full meal on the back of a sleeping cat',
  'Nature documentary about wild office chairs migrating across a desert at golden hour',
  'Infomercial for a hat that makes you invisible to pigeons, shot on 1980s videotape',
  'Local news: a moon has crashed into a swimming pool and everyone is mildly annoyed',
  'Game show where contestants guess which cloud is thinking about them',
  'Sitcom opening credits for a family of robots who run a lighthouse',
  'A dramatic soap opera scene between two very serious lobsters in a boardroom',
  'Morning aerobics class taught by a skeleton on a beach, VHS quality, upbeat',
  'Car commercial where the car is a slow, majestic snail crossing a highway at dawn',
  'Antiques show: an expert appraises a glowing cube that hums, studio lighting',
  'Kids cartoon about a bus that is afraid of roads, bright colours, hand-drawn',
  'Wildlife cam pointed at a bird feeder visited by a tiny dragon',
  'Travel show host reviewing a hotel that is inside a giant sandwich',
  'Ballet performance by construction cranes at sunset, wide cinematic shot',
  'Cooking with lava: a volcano fries an egg, extreme close-up',
  'Police procedural where the detective is a golden retriever wearing a trench coat in the rain',
  'Public access show: an old man explains how to fold a fitted sheet, sincerely, forever',
  'Sports highlight reel of competitive napping, slow motion, stadium crowd',
]

export function randomSurf() {
  return pick(SURF)
}
