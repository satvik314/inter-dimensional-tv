# Inter-Dimensional TV

A chat where every reply is a television broadcast from another dimension.

Type what you want to watch, press Enter, and the set tunes to a randomly named
dimension (C-137, J19ζ7, ΓΛ-76B…). Seven seconds of static later, the channel
goes live. Every transmission becomes a page in the programme guide, so you can
flick back through channels with the arrow keys. Press **888** for subtitles: the
prompt the model actually used, rendered as teletext captions.

The whole thing is dressed as a 1980s teletext service: seven colours, one font,
black glass, fastext buttons along the bottom.

## Stack

- [Vite](https://vite.dev) + vanilla JS, no framework
- [`@fal-ai/client`](https://www.npmjs.com/package/@fal-ai/client) talking straight to
  `minimax/h3-max-turbo/text-to-video` at 480p, 7 seconds, from the browser
- `localStorage` for the API key, the channel history and the sound setting

## Run it

```sh
npm install
npm run dev
```

Open the local URL, press **YELLOW (SET-UP)** and paste your fal.ai key. The key
never leaves your browser except to call fal.ai directly.

## Remote control

| Key / button | Does |
| --- | --- |
| Enter | Transmit (Shift+Enter for a newline) |
| ↑ / ↓ | Previous / next channel |
| Space, HOLD button, or click the screen | Pause / resume the broadcast |
| `/` | Focus the transmitter |
| RED · SURF | Tune a random channel from a list of shows that don't exist |
| GREEN · SEND | Same as Enter |
| YELLOW · SET-UP | Enter or forget the fal.ai key |
| BLUE · CLEAR | Wipe the programme guide |
| NEXT EP | Re-run the current channel's prompt with a new seed |
| 888 | Toggle subtitles (the expanded prompt) |
| TAPE | Open the MP4 in a new tab |
| PICTURE | Aspect ratio for the next transmission |

The guide's "licence fee" is a running estimate of what the broadcasts cost at
fal's 480p rate, including the launch discount until 14 September 2026.

## Build

```sh
npm run build    # static site in dist/
npm run preview
```
