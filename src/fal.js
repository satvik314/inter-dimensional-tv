import { createFalClient } from '@fal-ai/client'

export const MODEL = 'minimax/h3-max-turbo/text-to-video'
export const DURATION = 7
export const RESOLUTION = '480P'

let client = null
let currentKey = ''

export function configure(key) {
  currentKey = (key || '').trim()
  client = currentKey
    ? createFalClient({ credentials: currentKey, suppressLocalCredentialsWarning: true })
    : null
  return Boolean(client)
}

export function hasKey() {
  return Boolean(client)
}

/**
 * Tune to a dimension: submit the prompt and wait for the broadcast.
 * onLog receives every human-readable status line as it happens.
 */
export async function broadcast({ prompt, aspectRatio = '16:9', seed, onLog }) {
  if (!client) throw new Error('NO KEY. Press YELLOW to set up.')

  const input = {
    prompt,
    duration: DURATION,
    resolution: RESOLUTION,
    aspect_ratio: aspectRatio,
    prompt_expansion_mode: 'balanced',
    enable_safety_checker: true,
  }
  if (Number.isInteger(seed)) input.seed = seed

  const result = await client.subscribe(MODEL, {
    input,
    logs: true,
    pollInterval: 800,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_QUEUE') {
        onLog?.(`IN QUEUE · POSITION ${update.queue_position ?? '?'}`)
      } else if (update.status === 'IN_PROGRESS') {
        for (const l of update.logs || []) onLog?.(l.message)
      }
    },
  })

  const data = result.data || {}
  return {
    requestId: result.requestId,
    url: data.video?.url,
    fileSize: data.video?.file_size,
    expandedPrompt: data.expanded_prompt || null,
    timings: data.timings || null,
  }
}

// Promotional pricing until 14 Sep 2026, then standard rate. USD per second at 480p.
export function costPerBroadcast(now = new Date()) {
  const promoEnds = Date.UTC(2026, 8, 15)
  const perSecond = now.getTime() < promoEnds ? 0.00625 : 0.025
  return perSecond * DURATION
}
