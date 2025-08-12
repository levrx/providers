/* eslint-disable no-console */
import crypto from 'crypto';

import { flags } from '@/entrypoint/utils/targets';
import { NotFoundError } from '@/utils/errors';
// import { createM3U8ProxyUrl } from '@/utils/proxy';

import { EmbedOutput, makeEmbed } from '../base';

const SPENFLIX_SERVERS = [
  'alfa',
  'bravo',
  'charlie',
  'delta',
  'echo',
  'foxtrot',
  'golf',
  'hotel',
  'india',
  'juliett',
  'kilo',
  'lima',
  'mike',
  'november',
];

const baseUrl = 'servers.spencerdevs.xyz';
const headers = {
  referer: 'https://spencerdevs.xyz/',
  origin: 'https://spencerdevs.xyz',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
};

const eD = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const e_ = (() => {
  const map: Record<string, string> = {};
  for (let t = 0; t < eD.length; t++) {
    map[t.toString(2).padStart(8, '0')] = eD[t];
  }
  return map;
})();

function decodeSnoopdog(binaryStr: string): string {
  const base64Str = binaryStr
    .trim()
    .split(/\s+/)
    .map((b) => e_[b] || '')
    .join('');

  const buf = Buffer.from(base64Str, 'base64');

  const password = buf.subarray(0, 32);
  const pbkdf2Salt = buf.subarray(32, 48);
  const iv = buf.subarray(48, 64);
  const ciphertext = buf.subarray(64);

  const key = crypto.pbkdf2Sync(password, pbkdf2Salt, 100000, 32, 'sha512');

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(ciphertext, undefined, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function makeSpenFlixEmbed(id: string, rank: number = 100) {
  const serverIndex = SPENFLIX_SERVERS.indexOf(id) + 1;

  return makeEmbed({
    id: `spenflix-${id}`,
    name: `SpenFlix ${id.charAt(0).toUpperCase() + id.slice(1)}`,
    rank,
    async scrape(ctx): Promise<EmbedOutput> {
      const query = JSON.parse(ctx.url);
      const { type, tmdbId, season, episode } = query;

      let url = `https://${baseUrl}`;

      if (type === 'movie') {
        url += `/${serverIndex}/m/${tmdbId}`;
      } else if (type === 'show') {
        url += `/${serverIndex}/t/${tmdbId}/${season}/${episode}`; /1/t/119051/1/1
      } else {
        throw new NotFoundError('Unsupported media type');
      }

      const res = await ctx.proxiedFetcher(url, { headers });
      console.log(res);

      let playlistUrl: string | null = null;
      if (res && res.snoopdog) {
        try {
          playlistUrl = decodeSnoopdog(res.snoopdog);
          console.log('Decoded snoopdog URL:', playlistUrl);
        } catch (err) {
          console.error('Failed to decode snoopdog:', err);
          // fall back to m3u8 if present
          playlistUrl = res.m3u8 || null;
        }
      } else {
        playlistUrl = res?.m3u8 || null;
      }

      ctx.progress(100);

      return {
        stream: [
          {
            id: 'primary',
            type: 'hls',
            playlist: playlistUrl || '',
            headers,
            flags: [flags.CORS_ALLOWED],
            captions: [],
          },
        ],
      };
    },
  });
}

export const spenflixEmbeds = SPENFLIX_SERVERS.map((server, i) => makeSpenFlixEmbed(server, 250 - i));
