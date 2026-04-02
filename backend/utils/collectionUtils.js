function searchByTitle(items, query) {
  if (!Array.isArray(items)) throw new Error("items must be an array");
  if (!query) return items;
  const q = String(query).toLowerCase();
  return items.filter((x) => String(x.title || "").toLowerCase().includes(q));
}

function filterByGenre(items, genre) {
  if (!Array.isArray(items)) throw new Error("items must be an array");
  if (!genre) return items;
  const g = String(genre).toLowerCase();
  return items.filter((x) => String(x.genre || "").toLowerCase().includes(g));
}

function sortByScore(items, direction = "desc") {
  if (!Array.isArray(items)) throw new Error("items must be an array");
  const sign = direction === "asc" ? 1 : -1;
  return [...items].sort((a, b) => (a.metacritic_score - b.metacritic_score) * sign);
}

module.exports = {
  searchByTitle,
  filterByGenre,
  sortByScore,
};
