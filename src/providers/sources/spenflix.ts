import { flags } from '@/entrypoint/utils/targets';
import { SourcererOutput, makeSourcerer } from '@/providers/base';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';

async function comboScraper(ctx: ShowScrapeContext | MovieScrapeContext): Promise<SourcererOutput> {
  const query = {
    type: ctx.media.type,
    title: ctx.media.title,
    tmdbId: ctx.media.tmdbId,
    imdbId: ctx.media.imdbId,
    ...(ctx.media.type === 'show' && {
      season: ctx.media.season.number,
      episode: ctx.media.episode.number,
    }),
    releaseYear: ctx.media.releaseYear,
  };

  return {
    embeds: [
      {
        embedId: 'spenflix-alfa',
        url: JSON.stringify(query),
      },
      {
        embedId: 'spenflix-bravo',
        url: JSON.stringify(query),
      },
      {
        embedId: 'spenflix-charlie',
        url: JSON.stringify(query),
      },
      {
        embedId: 'spenflix-delta',
        url: JSON.stringify(query),
      },
      {
        embedId: 'spenflix-echo',
        url: JSON.stringify(query),
      },
      {
        embedId: 'spenflix-foxtrot',
        url: JSON.stringify(query),
      },
      {
        embedId: 'spenflix-golf',
        url: JSON.stringify(query),
      },
      {
        embedId: 'spenflix-hotel',
        url: JSON.stringify(query),
      },
      {
        embedId: 'spenflix-india',
        url: JSON.stringify(query),
      },
      {
        embedId: 'spenflix-juliett',
        url: JSON.stringify(query),
      },
      {
        embedId: 'spenflix-kilo',
        url: JSON.stringify(query),
      },
      {
        embedId: 'spenflix-lima',
        url: JSON.stringify(query),
      },
      {
        embedId: 'spenflix-mike',
        url: JSON.stringify(query),
      },
      {
        embedId: 'spenflix-november',
        url: JSON.stringify(query),
      },
    ],
  };
}

export const spenflixScraper = makeSourcerer({
  id: 'spenflix',
  name: 'SpenFlix',
  rank: 126,
  flags: [flags.CORS_ALLOWED],
  scrapeMovie: comboScraper,
  scrapeShow: comboScraper,
});
