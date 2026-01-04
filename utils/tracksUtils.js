export const formatDuration = (seconds) => {
  if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0) {
    return "";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const filterTracks = (tracks, filters = {}) => {
  if (filters === null) {
    filters = {};
  }

  const { author = "", genre = "", year = "", search = "" } = filters;

  const authors = author ? (Array.isArray(author) ? author : [author]) : [];
  const genres = genre ? (Array.isArray(genre) ? genre : [genre]) : [];
  const years = year ? (Array.isArray(year) ? year : [year]) : [];
  const searchLower = search.toLowerCase();

  return tracks.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchLower) ||
      track.author.toLowerCase().includes(searchLower);

    const matchesAuthor =
      authors.length === 0 || authors.includes(track.author);
    const matchesYear =
      years.length === 0 || years.includes(track.release_date);
    const matchesGenre =
      genres.length === 0 || track.genre.some((g) => genres.includes(g));

    return matchesSearch && matchesAuthor && matchesYear && matchesGenre;
  });
};

export const getAvailableFilters = (tracks) => {
  const authors = new Set();
  const years = new Set();
  const genres = new Set();

  tracks.forEach((track) => {
    authors.add(track.author);
    years.add(track.release_date);
    track.genre.forEach((g) => genres.add(g));
  });

  return {
    authors: Array.from(authors).sort(),
    years: Array.from(years).sort().reverse(),
    genres: Array.from(genres).sort(),
  };
};

export const updateFilters = (currentFilters, newFilters) => ({
  ...currentFilters,
  ...newFilters,
});

export const resetFilters = () => ({
  author: [],
  year: [],
  genre: [],
  search: "",
});
