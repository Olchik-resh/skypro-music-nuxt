export const formatDuration = (seconds) => {
  if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0) {
    return "";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const filterTracks = (tracks, filters = {}) => {
  const safeFilters = filters || {};
  const searchLower = safeFilters.search?.toLowerCase() || "";

  return tracks.filter((track) => {
    // Поиск
    const matchesSearch =
      track.title.toLowerCase().includes(searchLower) ||
      track.author.toLowerCase().includes(searchLower);

    // Автор
    const authorFilter = safeFilters.author;
    const matchesAuthor =
      !authorFilter?.length || authorFilter.includes(track.author);

    // Год
    const yearFilter = safeFilters.year;
    const matchesYear =
      !yearFilter?.length || yearFilter.includes(track.release_date);

    // Жанр
    const genreFilter = safeFilters.genre;
    const trackGenres = Array.isArray(track.genre)
      ? track.genre
      : [track.genre];
    const matchesGenre =
      !genreFilter?.length || genreFilter.some((g) => trackGenres.includes(g));

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
