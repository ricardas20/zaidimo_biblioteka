const API = "/api";
let allGames = [];
let activeGenre = "all";
/** all | free | sale */
let activePriceFilter = "all";

function isGameOnSale(g) {
  return (
    !g.is_free &&
    Number(g.discount_percent || 0) > 0 &&
    g.price_before_discount != null &&
    g.price_before_discount !== ""
  );
}

function ratingClass(score) {
  if (score >= 85) return "high";
  if (score >= 70) return "medium";
  return "low";
}

function storeHref(game) {
  return game.store_url && game.store_url.trim() ? game.store_url.trim() : "#";
}

/** Kaina: jei Steam sinchronizacija davė nuolaidą — rodom seną, naują ir ženkliuką; kitu atveju tik galutinę kainą. */
function formatCardPriceHtml(game) {
  if (game.is_free) return "Nemokamai";
  const final = parseFloat(game.price);
  const dp = Number(game.discount_percent || 0);
  const rawBefore = game.price_before_discount;
  const before =
    rawBefore != null && rawBefore !== "" ? parseFloat(rawBefore) : null;
  if (dp > 0 && before != null && !Number.isNaN(before)) {
    return `<span class="price-row"><span class="price-was">€${before.toFixed(2)}</span><span class="price-now">€${final.toFixed(2)}</span><span class="discount-pill">Nuolaida ${dp}%</span></span>`;
  }
  return `€${final.toFixed(2)}`;
}

function createGameCard(game, index) {
  const card = document.createElement("article");
  card.className = "game-card";
  card.style.animationDelay = `${0.03 * index}s`;

  const badges = [];
  if (game.is_free) badges.push('<span class="card-badge free-badge">FREE</span>');
  if (game.metacritic_score >= 95) badges.push('<span class="card-badge top-badge">TOP</span>');

  const shop = storeHref(game);
  const priceLabel = formatCardPriceHtml(game);
  const hasSale = isGameOnSale(game);
  const priceClass = game.is_free
    ? "price-tag free price-store-link"
    : `price-tag price-store-link${hasSale ? " price-store-link--sale" : ""}`;
  const priceTitle = game.is_free ? "Atidaryti atsisiuntimo puslapį" : "Atidaryti parduotuvę";
  const priceEl =
    shop === "#"
      ? `<span class="${priceClass} price-store-muted" title="Parduotuvės nuoroda nepriskirta">${priceLabel}</span>`
      : `<a class="${priceClass}" href="${shop}" target="_blank" rel="noopener noreferrer" title="${priceTitle}">${priceLabel}</a>`;

  card.innerHTML = `
    <a class="card-main" href="/games/${game.slug}">
      <div class="card-image-wrapper">
        <img class="card-image" src="${game.header_image}" alt="${game.title}" loading="lazy">
        <div class="card-badges">${badges.join("")}</div>
      </div>
      <div class="card-body card-body-main">
        <h3 class="card-title">${game.title}</h3>
        <p class="card-genre">${game.genre}</p>
      </div>
    </a>
    <div class="card-body card-body-footer">
      <div class="card-footer">
        <div class="rating-wrapper">
          <div class="rating-badge ${ratingClass(game.metacritic_score)}">${game.metacritic_score}</div>
          <span class="rating-label">Metacritic</span>
        </div>
        ${priceEl}
      </div>
    </div>
  `;
  return card;
}

function getUniqueGenres(games) {
  const genres = new Set();
  games.forEach((g) => {
    g.genre.split(" / ").forEach((part) => genres.add(part.trim()));
  });
  return [...genres].sort();
}

function renderGenreFilters(games) {
  const container = document.getElementById("genre-filters");
  if (!container) return;

  const genres = getUniqueGenres(games);

  let html = '<button class="genre-pill active" data-genre="all">Visi</button>';
  genres.forEach((genre) => {
    html += `<button class="genre-pill" data-genre="${genre}">${genre}</button>`;
  });
  container.innerHTML = html;

  container.querySelectorAll(".genre-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".genre-pill").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeGenre = btn.dataset.genre;
      renderGames();
    });
  });
}

function renderStats(games) {
  const bar = document.getElementById("stats-bar");
  if (!bar) return;

  const total = games.length;
  const avgScore = Math.round(games.reduce((s, g) => s + g.metacritic_score, 0) / total);
  const freeCount = games.filter((g) => g.is_free).length;
  const topCount = games.filter((g) => g.metacritic_score >= 90).length;

  bar.innerHTML = `
    <div class="stat-item"><span class="stat-num">${total}</span><span class="stat-label">Žaidimų</span></div>
    <div class="stat-item"><span class="stat-num">${avgScore}</span><span class="stat-label">Vid. balas</span></div>
    <div class="stat-item"><span class="stat-num">${freeCount}</span><span class="stat-label">Nemokami</span></div>
    <div class="stat-item"><span class="stat-num">${topCount}</span><span class="stat-label">Top (90+)</span></div>
  `;
}

function getFilteredSortedGames() {
  const search = document.getElementById("search-input")?.value.toLowerCase() || "";
  const sort = document.getElementById("sort-select")?.value || "score-desc";

  let filtered = allGames.filter((g) => {
    const matchSearch = g.title.toLowerCase().includes(search) || g.genre.toLowerCase().includes(search);
    const matchGenre = activeGenre === "all" || g.genre.includes(activeGenre);
    const matchPrice =
      activePriceFilter === "all"
        ? true
        : activePriceFilter === "free"
          ? Boolean(g.is_free)
          : activePriceFilter === "sale"
            ? isGameOnSale(g)
            : true;
    return matchSearch && matchGenre && matchPrice;
  });

  const [field, dir] = sort.split("-");
  filtered.sort((a, b) => {
    let va, vb;
    if (field === "score") { va = a.metacritic_score; vb = b.metacritic_score; }
    else if (field === "price") { va = parseFloat(a.price); vb = parseFloat(b.price); }
    else if (field === "title") { va = a.title.toLowerCase(); vb = b.title.toLowerCase(); }
    else if (field === "date") { va = a.release_date || ""; vb = b.release_date || ""; }
    if (va < vb) return dir === "asc" ? -1 : 1;
    if (va > vb) return dir === "asc" ? 1 : -1;
    return 0;
  });

  return filtered;
}

function renderGames() {
  const grid = document.getElementById("games-grid");
  if (!grid) return;

  const games = getFilteredSortedGames();
  grid.innerHTML = "";

  if (games.length === 0) {
    grid.innerHTML = '<p class="no-results">Žaidimų nerasta pagal pasirinktus filtrus.</p>';
  } else {
    games.forEach((game, i) => grid.appendChild(createGameCard(game, i)));
  }

  const info = document.getElementById("results-info");
  if (info) {
    info.textContent = `Rodoma žaidimų: ${games.length} iš ${allGames.length}`;
  }
}

async function loadGames() {
  const grid = document.getElementById("games-grid");
  if (!grid) return;

  try {
    const res = await fetch(`${API}/games`);
    allGames = await res.json();

    renderStats(allGames);
    renderGenreFilters(allGames);
    renderGames();
  } catch (err) {
    grid.innerHTML = '<p class="no-results">Nepavyko užkrauti žaidimų. Patikrink ar serveris veikia.</p>';
  }
}

document.getElementById("search-input")?.addEventListener("input", renderGames);
document.getElementById("sort-select")?.addEventListener("change", renderGames);

(function setupHeaderPriceFilters() {
  const container = document.getElementById("header-price-filters");
  if (!container) return;
  container.querySelectorAll(".header-filter-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".header-filter-pill").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activePriceFilter = btn.dataset.priceFilter || "all";
      renderGames();
    });
  });
})();

const topBtn = document.getElementById("back-to-top");
if (topBtn) {
  window.addEventListener("scroll", () => {
    topBtn.classList.toggle("visible", window.scrollY > 400);
  });
  topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

loadGames();

/** Po Steam sinchronizacijos serveryje DB kainos pasikeičia vėliau — periodiškai atnaujiname sąrašą. */
const PRICE_REFRESH_MS = 30000;
setTimeout(loadGames, 8000);
setInterval(loadGames, PRICE_REFRESH_MS);
