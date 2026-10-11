// Tiny YouTube helpers shared by the music player and the premiere screen.
// Control goes through the iframe's postMessage API (needs enablejsapi=1 in the embed URL),
// so no extra script has to load.

export const youtubeId = (url = '') => url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/)?.[1];

export const ytEmbed = (id, params = {}) =>
  `https://www.youtube.com/embed/${id}?${new URLSearchParams({ enablejsapi: '1', playsinline: '1', rel: '0', ...params })}`;

export const ytCommand = (iframe, func, args = []) =>
  iframe?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
