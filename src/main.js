import './style.css'
import { broadcast, configure, costPerBroadcast, hasKey, DURATION, RESOLUTION } from './fal.js'
import { randomDimension, randomHue, randomSurf } from './dimensions.js'
import { store } from './store.js'

const ASPECTS = ['16:9', '9:16', '1:1', '4:3', '21:9']
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

// ------------------------------------------------------------ state
const state = {
  channels: store.getChannels().map((c) => (c.status === 'tuning' ? { ...c, status: 'dead', error: 'SIGNAL LOST (PAGE RELOADED)' } : c)),
  currentId: null,
  aspect: '16:9',
  muted: store.getMuted(),
  busy: 0,
  logs: [],
}
state.currentId = state.channels.find((c) => c.status === 'live')?.id ?? state.channels[0]?.id ?? null
configure(store.getKey())

const current = () => state.channels.find((c) => c.id === state.currentId) || null
const uid = () => Math.random().toString(36).slice(2, 9)
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]))
const persist = () => store.setChannels(state.channels.map(({ logs, ...c }) => c))

// ------------------------------------------------------------ shell
const app = document.getElementById('app')
app.innerHTML = `
  <header class="hdr">
    <span class="pg">P<b id="pageNo">100</b></span>
    <span class="ttl"><span class="dh">INTER-DIMENSIONAL TV</span></span>
    <span class="dimname" id="dimName">— — —</span>
    <span class="clk" id="clock"></span>
  </header>

  <div class="main">
    <section class="set">
      <div class="bezel">
        <div class="screen" id="screen" data-state="idle" data-aspect="16:9">
          <video id="video" playsinline loop preload="auto"></video>
          <canvas class="static" id="static"></canvas>
          <div class="scan"></div>
          <div class="vignette"></div>
          <div class="osd" id="osd"></div>
          <div class="captions" id="captions"></div>
        </div>
      </div>
      <div class="deck">
        <div class="now" id="now"></div>
        <div class="ctl">
          <button id="chUp" title="Previous channel [↑]">CH ▲</button>
          <button id="chDn" title="Next channel [↓]">CH ▼</button>
          <button id="mute" title="Sound">SOUND</button>
          <button id="cc" title="Subtitles (page 888)">888</button>
          <button id="again" title="Same dimension, new seed">NEXT EP</button>
          <button id="dl" title="Open the MP4">TAPE</button>
        </div>
      </div>
    </section>

    <aside class="guide">
      <div class="ghead"><span>PROGRAMME GUIDE</span><span id="gcount">0 CH</span></div>
      <div class="gsub"><span>${RESOLUTION} · ${DURATION}S</span><span id="fee"></span></div>
      <ol id="guide"></ol>
    </aside>
  </div>

  <footer class="remote">
    <form class="tx" id="tx">
      <label for="prompt">TRANSMIT</label>
      <textarea id="prompt" rows="1" placeholder="Describe what's on in another dimension… (Enter to send)"></textarea>
      <button class="send" id="send" type="submit">SEND ▶</button>
    </form>
    <div class="picture" id="picture">
      <span>PICTURE</span>
      ${ASPECTS.map((a) => `<button data-aspect="${a}">${a}</button>`).join('')}
      <span class="hint">↑↓ CHANGE CHANNEL · ENTER SEND · SHIFT+ENTER NEWLINE</span>
    </div>
    <div class="fastext">
      <button class="r" id="fRed">SURF <small>RANDOM CHANNEL</small></button>
      <button class="g" id="fGreen">SEND <small>TRANSMIT</small></button>
      <button class="y" id="fYellow">SET-UP <small>FAL KEY</small></button>
      <button class="b" id="fBlue">CLEAR <small>GUIDE</small></button>
    </div>
  </footer>

  <dialog id="setup">
    <form method="dialog">
      <div class="dhead"><span>P700 SET-UP</span><span>FAL.AI</span></div>
      <p>This set tunes through <b>minimax/h3-max-turbo</b> at ${RESOLUTION}, ${DURATION} seconds a broadcast. Your key is kept in this browser only and sent straight to fal.ai.</p>
      <div class="keyrow">
        <input id="keyInput" type="password" autocomplete="off" spellcheck="false" placeholder="key_id:key_secret" />
        <button type="button" class="keybtn" id="keyEye">SHOW</button>
      </div>
      <p class="rate" id="rateLine"></p>
      <div class="acts">
        <button type="button" class="bad" id="keyForget">FORGET</button>
        <button type="submit" class="ok" id="keySave">SAVE</button>
      </div>
    </form>
  </dialog>
  <div class="toast" id="toast"></div>
`

const $ = (id) => document.getElementById(id)
const el = {
  pageNo: $('pageNo'), dimName: $('dimName'), clock: $('clock'),
  screen: $('screen'), video: $('video'), static: $('static'), osd: $('osd'), captions: $('captions'),
  now: $('now'), chUp: $('chUp'), chDn: $('chDn'), mute: $('mute'), cc: $('cc'), again: $('again'), dl: $('dl'),
  guide: $('guide'), gcount: $('gcount'), fee: $('fee'),
  tx: $('tx'), prompt: $('prompt'), send: $('send'), picture: $('picture'),
  fRed: $('fRed'), fGreen: $('fGreen'), fYellow: $('fYellow'), fBlue: $('fBlue'),
  setup: $('setup'), keyInput: $('keyInput'), keyEye: $('keyEye'), keyForget: $('keyForget'), rateLine: $('rateLine'),
  toast: $('toast'),
}

// ------------------------------------------------------------ clock
function tickClock() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  el.clock.textContent = `${DAYS[d.getDay()]} ${p(d.getDate())} ${MONTHS[d.getMonth()]} ${p(d.getHours())}:${p(d.getMinutes())}/${p(d.getSeconds())}`
}
tickClock()
setInterval(tickClock, 1000)

// ------------------------------------------------------------ static
const sctx = el.static.getContext('2d', { alpha: false })
let staticOn = false
let staticTimer = 0
function drawStatic() {
  const w = 96, h = 54
  if (el.static.width !== w) { el.static.width = w; el.static.height = h }
  const img = sctx.createImageData(w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const v = (Math.random() * 255) | 0
    d[i] = d[i + 1] = d[i + 2] = v
    d[i + 3] = 255
  }
  sctx.putImageData(img, 0, 0)
}
function setStatic(on) {
  if (on === staticOn) return
  staticOn = on
  clearInterval(staticTimer)
  if (on) { drawStatic(); staticTimer = setInterval(drawStatic, 66) }
}

// ------------------------------------------------------------ OSD
function osd(rows) {
  el.osd.innerHTML = rows
    .map((r, i) => {
      if (r === null) return '<div class="spacer"></div>'
      const [cls, text] = Array.isArray(r) ? r : ['', r]
      return `<div class="row ${cls}" style="--i:${i}">${esc(text)}</div>`
    })
    .join('')
}


// ------------------------------------------------------------ render
function setHue(hex) {
  document.documentElement.style.setProperty('--hue', hex || '#00ffff')
}

function renderScreen() {
  const c = current()
  el.captions.textContent = ''
  if (!c) {
    setHue('#00ffff')
    el.screen.dataset.state = 'idle'
    el.screen.dataset.aspect = state.aspect
    setStatic(false)
    el.video.removeAttribute('src')
    el.video.load()
    el.pageNo.textContent = '100'
    el.dimName.textContent = '— — —'
    osd([
      ['inv', ' TEST CARD '],
      ['bar', ''],
      ['y', 'NO SIGNAL FROM OTHER DIMENSIONS.'],
      '',
      ['c', 'TYPE WHAT YOU WANT TO WATCH AND PRESS ENTER.'],
      ['c', 'EACH TRANSMISSION TUNES A NEW CHANNEL.'],
      '',
      hasKey() ? ['g', 'KEY LOADED. SET IS READY.'] : ['r', 'NO KEY. PRESS YELLOW (SET-UP) FIRST.'],
      null,
      ['bar', ''],
      ['', `RED SURF · GREEN SEND · YELLOW SET-UP · BLUE CLEAR`],
    ])
    return
  }

  setHue(c.hue)
  el.pageNo.textContent = String(c.page)
  el.dimName.textContent = `DIM ${c.dim}`
  el.screen.dataset.aspect = c.aspect || '16:9'

  if (c.status === 'tuning') {
    el.screen.dataset.state = 'tuning'
    setStatic(true)
    el.video.removeAttribute('src')
    const logs = (c.logs || []).slice(-6)
    osd([
      ['inv', ` TUNING · DIMENSION ${c.dim} `],
      ['bar', ''],
      ['y', c.prompt.length > 70 ? c.prompt.slice(0, 70) + '…' : c.prompt],
      '',
      ...logs.map((l) => ['g', '> ' + l]),
      ['g cursor', '> '],
      null,
      ['', `${RESOLUTION} · ${DURATION}S · ${c.aspect}${c.episode > 1 ? ` · EP ${c.episode}` : ''}`],
    ])
    return
  }

  if (c.status === 'dead') {
    el.screen.dataset.state = 'dead'
    setStatic(true)
    el.video.removeAttribute('src')
    osd([
      ['inv', ` SIGNAL LOST · ${c.dim} `],
      ['bar', ''],
      ['r', c.error || 'UNKNOWN INTERFERENCE'],
      '',
      ['y', c.prompt.length > 70 ? c.prompt.slice(0, 70) + '…' : c.prompt],
      null,
      ['c', 'PRESS NEXT EP TO RETRY THIS DIMENSION.'],
    ])
    return
  }

  // live
  el.screen.dataset.state = 'live'
  setStatic(false)
  if (el.video.getAttribute('src') !== c.url) {
    el.video.src = c.url
    el.video.load()
  }
  el.video.muted = state.muted
  el.video.play().catch(() => {})
  osd([
    ['inv', ` ${c.page} · DIM ${c.dim}${c.episode > 1 ? ` · EP ${c.episode}` : ''} `],
  ])
  setTimeout(() => { if (current()?.id === c.id && c.status === 'live') osd([]) }, 2600)
  if (state.captions && c.expandedPrompt) {
    el.captions.innerHTML = `<span>${esc(c.expandedPrompt)}</span>`
  }
}

function renderDeck() {
  const c = current()
  el.now.innerHTML = c
    ? `NOW · <b>${esc(c.prompt)}</b>`
    : `NOW · <b>NOTHING. THE VOID.</b>`
  el.mute.textContent = state.muted ? 'SOUND OFF' : 'SOUND ON'
  el.mute.classList.toggle('on', !state.muted)
  el.cc.classList.toggle('on', Boolean(state.captions))
  el.again.disabled = !c
  el.dl.disabled = !(c && c.status === 'live' && c.url)
  const idx = state.channels.findIndex((x) => x.id === state.currentId)
  el.chUp.disabled = idx <= 0
  el.chDn.disabled = idx < 0 || idx >= state.channels.length - 1
}

function renderGuide() {
  el.gcount.textContent = `${state.channels.length} CH`
  const spent = state.channels.filter((c) => c.status !== 'dead').length * costPerBroadcast()
  el.fee.textContent = `LICENCE FEE ~$${spent.toFixed(2)}`
  if (!state.channels.length) {
    el.guide.innerHTML = `<li class="empty">NO CHANNELS YET.<br>PRESS <b>RED</b> TO SURF.</li>`
    return
  }
  el.guide.innerHTML = state.channels
    .map((c) => {
      const st = c.status === 'tuning' ? 'TUNING' : c.status === 'dead' ? 'LOST' : 'LIVE'
      const t = new Date(c.createdAt)
      const hm = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`
      return `<li class="${c.status}${c.id === state.currentId ? ' cur' : ''}" data-id="${c.id}" style="--c:${c.hue}">
        <span class="no">${c.page}</span>
        <span class="desc" title="${esc(c.prompt)}">${esc(c.prompt)}</span>
        <span class="meta"><span class="st">${st}</span><span>${c.dim}${c.episode > 1 ? ` EP${c.episode}` : ''}</span><span>${hm}</span></span>
      </li>`
    })
    .join('')
  el.guide.querySelector('li.cur')?.scrollIntoView({ block: 'nearest' })
}

function renderPicture() {
  for (const b of el.picture.querySelectorAll('button')) {
    b.classList.toggle('on', b.dataset.aspect === state.aspect)
  }
  if (!current()) el.screen.dataset.aspect = state.aspect
}

function renderAll() {
  renderScreen()
  renderDeck()
  renderGuide()
  renderPicture()
  el.send.disabled = false
  el.fYellow.textContent = ''
  el.fYellow.innerHTML = `SET-UP <small>${hasKey() ? 'KEY OK' : 'NO KEY'}</small>`
}

let toastTimer = 0
function toast(msg) {
  el.toast.textContent = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (el.toast.textContent = ''), 3200)
}

// ------------------------------------------------------------ actions
function nextPage() {
  return state.channels.reduce((m, c) => Math.max(m, c.page), 100) + 1
}

async function tune(prompt, { parent = null } = {}) {
  prompt = prompt.trim()
  if (!prompt) return
  if (!hasKey()) {
    toast('NO KEY. PRESS YELLOW TO SET UP.')
    openSetup()
    return
  }
  const ch = {
    id: uid(),
    page: nextPage(),
    dim: parent ? parent.dim : randomDimension(),
    hue: parent ? parent.hue : randomHue().hex,
    episode: parent ? (parent.episode || 1) + 1 : 1,
    prompt,
    aspect: parent ? parent.aspect : state.aspect,
    status: 'tuning',
    url: null,
    expandedPrompt: null,
    seed: (Math.random() * 2 ** 31) | 0,
    createdAt: Date.now(),
    logs: [],
  }
  state.channels.unshift(ch)
  state.currentId = ch.id
  state.busy++
  persist()
  renderAll()

  try {
    const res = await broadcast({
      prompt,
      aspectRatio: ch.aspect,
      seed: ch.seed,
      onLog: (line) => {
        ch.logs.push(String(line).slice(0, 80))
        if (current()?.id === ch.id) renderScreen()
      },
    })
    if (!res.url) throw new Error('BROADCAST HAD NO PICTURE')
    Object.assign(ch, { status: 'live', url: res.url, expandedPrompt: res.expandedPrompt, requestId: res.requestId, fileSize: res.fileSize })
  } catch (err) {
    ch.status = 'dead'
    ch.error = String(err?.body?.detail?.[0]?.msg || err?.body?.detail || err?.message || err).slice(0, 160)
    console.error(err)
  } finally {
    state.busy--
  }
  persist()
  if (current()?.id === ch.id) renderScreen()
  renderDeck()
  renderGuide()
}

function select(id) {
  if (!state.channels.some((c) => c.id === id)) return
  state.currentId = id
  renderScreen()
  renderDeck()
  renderGuide()
}

function step(delta) {
  const idx = state.channels.findIndex((c) => c.id === state.currentId)
  const next = state.channels[idx + delta]
  if (next) select(next.id)
}

function openSetup() {
  el.keyInput.value = store.getKey()
  el.keyInput.type = 'password'
  el.keyEye.textContent = 'SHOW'
  const promo = costPerBroadcast() < 0.1
  el.rateLine.textContent = `RATE: ~$${costPerBroadcast().toFixed(3)} PER ${DURATION}S BROADCAST${promo ? ' (LAUNCH PRICE UNTIL 14 SEP)' : ''}`
  el.setup.showModal()
}

// ------------------------------------------------------------ wiring
el.tx.addEventListener('submit', (e) => {
  e.preventDefault()
  const p = el.prompt.value
  el.prompt.value = ''
  tune(p)
})
el.prompt.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    el.tx.requestSubmit()
  }
})

el.fRed.addEventListener('click', () => {
  const p = randomSurf()
  el.prompt.value = ''
  tune(p)
})
el.fGreen.addEventListener('click', () => el.tx.requestSubmit())
el.fYellow.addEventListener('click', openSetup)
el.fBlue.addEventListener('click', () => {
  if (!state.channels.length) return
  if (!confirm('Clear the programme guide? This forgets every channel on this set.')) return
  state.channels = []
  state.currentId = null
  persist()
  renderAll()
})

el.chUp.addEventListener('click', () => step(-1))
el.chDn.addEventListener('click', () => step(1))
el.mute.addEventListener('click', () => {
  state.muted = !state.muted
  store.setMuted(state.muted)
  el.video.muted = state.muted
  if (!state.muted) el.video.play().catch(() => {})
  renderDeck()
})
el.cc.addEventListener('click', () => {
  state.captions = !state.captions
  const c = current()
  el.captions.innerHTML = state.captions && c?.expandedPrompt ? `<span>${esc(c.expandedPrompt)}</span>` : ''
  if (state.captions && c && !c.expandedPrompt) toast('NO SUBTITLES FOR THIS BROADCAST.')
  renderDeck()
})
el.again.addEventListener('click', () => {
  const c = current()
  if (c) tune(c.prompt, { parent: c })
})
el.dl.addEventListener('click', () => {
  const c = current()
  if (c?.url) window.open(c.url, '_blank', 'noopener')
})

el.guide.addEventListener('click', (e) => {
  const li = e.target.closest('li[data-id]')
  if (li) select(li.dataset.id)
})

el.picture.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-aspect]')
  if (!b) return
  state.aspect = b.dataset.aspect
  renderPicture()
})

el.keyEye.addEventListener('click', () => {
  const show = el.keyInput.type === 'password'
  el.keyInput.type = show ? 'text' : 'password'
  el.keyEye.textContent = show ? 'HIDE' : 'SHOW'
})
el.keyForget.addEventListener('click', () => {
  store.setKey('')
  configure('')
  el.setup.close()
  renderAll()
  toast('KEY FORGOTTEN.')
})
el.setup.querySelector('form').addEventListener('submit', () => {
  const k = el.keyInput.value.trim()
  store.setKey(k)
  configure(k)
  renderAll()
  toast(k ? 'KEY SAVED. SET IS READY.' : 'NO KEY ENTERED.')
})

document.addEventListener('keydown', (e) => {
  const typing = ['TEXTAREA', 'INPUT'].includes(document.activeElement?.tagName)
  if (typing || el.setup.open) return
  if (e.key === 'ArrowUp') { e.preventDefault(); step(-1) }
  else if (e.key === 'ArrowDown') { e.preventDefault(); step(1) }
  else if (e.key === '/') { e.preventDefault(); el.prompt.focus() }
})

el.video.addEventListener('error', () => {
  const c = current()
  if (c && c.status === 'live') toast('TAPE WON\'T PLAY. THE CDN LINK MAY HAVE EXPIRED.')
})

// ------------------------------------------------------------ boot
renderAll()
if (!hasKey()) setTimeout(openSetup, 400)
