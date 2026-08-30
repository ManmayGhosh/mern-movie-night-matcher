const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_POSTER = "https://image.tmdb.org/t/p/w500";
const TMDB_LOGO = "https://image.tmdb.org/t/p/w92";

/**
 * Pulls the current popular movies from TMDB, then fetches runtime/genres/
 * watch-providers for each one in a single follow-up call per movie via
 * append_to_response. Returns a deck of plain objects ready to store on a Room.
 */
async function fetchTmdbMovies(region = "US") {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB_API_KEY is not configured on the server (see server/.env.example)");
  }

  const popRes = await fetch(`${TMDB_BASE}/movie/popular?api_key=${apiKey}&page=1`);
  if (!popRes.ok) {
    if (popRes.status === 401) throw new Error("TMDB rejected the configured API key");
    throw new Error("TMDB popular-movies request failed");
  }
  const popData = await popRes.json();
  const picks = (popData.results || []).slice(0, 12);
  if (picks.length === 0) throw new Error("TMDB returned no movies");

  const detailed = await Promise.all(
    picks.map(async (m) => {
      const res = await fetch(
        `${TMDB_BASE}/movie/${m.id}?api_key=${apiKey}&append_to_response=watch/providers`
      );
      const details = await res.json();
      return { base: m, details };
    })
  );

  return detailed.map(({ base, details }) => {
    const providersByRegion = details["watch/providers"]?.results?.[region.toUpperCase()] || {};
    const providerList =
      providersByRegion.flatrate || providersByRegion.ads || providersByRegion.rent || providersByRegion.buy || [];

    return {
      tmdbId: base.id,
      title: base.title,
      year: (base.release_date || "").slice(0, 4) || "—",
      genres: (details.genres || []).slice(0, 2).map((g) => g.name),
      runtime: details.runtime || null,
      rating: base.vote_average ? Number(base.vote_average.toFixed(1)) : null,
      blurb:
        base.overview && base.overview.length > 150
          ? base.overview.slice(0, 147) + "…"
          : base.overview || "No synopsis available.",
      posterUrl: base.poster_path ? `${TMDB_POSTER}${base.poster_path}` : null,
      streaming: providerList.length
        ? providerList
            .slice(0, 4)
            .map((p) => ({ name: p.provider_name, logoUrl: p.logo_path ? `${TMDB_LOGO}${p.logo_path}` : null }))
        : [{ name: `No streaming data for ${region.toUpperCase()}` }],
    };
  });
}

module.exports = { fetchTmdbMovies };
