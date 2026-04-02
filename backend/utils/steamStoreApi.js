/**
 * Steam Store API pagalbinės funkcijos (kainos / Metacritic iš appdetails).
 * @see https://wiki.teamfortress.com/wiki/User:Wind/Steam_Web_API#appdetails
 */

function extractSteamAppId(storeUrl) {
  if (!storeUrl || typeof storeUrl !== "string") return null;
  const m = storeUrl.match(/store\.steampowered\.com\/app\/(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

function scoreToMetacriticLabel(score) {
  if (score >= 90) return "Universal Acclaim";
  if (score >= 75) return "Generally Favorable";
  if (score >= 50) return "Mixed or Average";
  if (score > 0) return "Generally Unfavorable";
  return "Unknown";
}

/**
 * Iš Steam appdetails atsako surenkame laukus DB atnaujinimui.
 * Jei kainos duomenų nėra (išskyrus nemokamus), kainos nekeičiame.
 */
function buildUpdatesFromSteamAppData(data) {
  const updates = {};

  if (data.is_free) {
    updates.price = 0;
    updates.is_free = true;
    updates.discount_percent = 0;
    updates.price_before_discount = null;
  } else if (data.price_overview && typeof data.price_overview.final === "number") {
    const po = data.price_overview;
    updates.price = Math.round((po.final / 100) * 100) / 100;
    updates.is_free = false;
    const dp = typeof po.discount_percent === "number" ? po.discount_percent : 0;
    updates.discount_percent = dp;
    if (dp > 0 && typeof po.initial === "number") {
      updates.price_before_discount = Math.round((po.initial / 100) * 100) / 100;
    } else {
      updates.price_before_discount = null;
    }
  }

  if (data.metacritic && typeof data.metacritic.score === "number") {
    updates.metacritic_score = data.metacritic.score;
    updates.metacritic_label = scoreToMetacriticLabel(data.metacritic.score);
  }

  return updates;
}

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSteamRegionList(options = {}) {
  if (options.regions && options.regions.length) return options.regions;
  const primary = (process.env.STEAM_CC || "lt").trim();
  const fallback = (process.env.STEAM_CC_FALLBACK || "lt,de,us,gb,pl,fr,es,it").split(",");
  const seen = new Set();
  const out = [];
  for (const r of [primary, ...fallback.map((s) => s.trim()).filter(Boolean)]) {
    if (r && !seen.has(r)) {
      seen.add(r);
      out.push(r);
    }
  }
  return out;
}

async function fetchSteamAppDetails(appId, options = {}) {
  const cc = options.cc || process.env.STEAM_CC || "lt";
  const l = options.l || "english";
  const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=${encodeURIComponent(cc)}&l=${encodeURIComponent(l)}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": BROWSER_UA,
      Accept: "application/json",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const entry = json[String(appId)];
  if (!entry || !entry.success) return null;
  return entry.data;
}

/**
 * Bando kelis regionus — kainai ir Metacritic.
 * Visuose regionuose surenkamas geriausias žinomas Metacritic (kad balas atsinaujintų net jei
 * viename regione jo nebuvo, o kitame — buvo). Kainai imamas pirmas radęs galiojantis variantas.
 */
async function fetchSteamAppDetailsMerged(appId, options = {}) {
  const regions = getSteamRegionList(options);
  const delayBetweenRegions = Number(process.env.STEAM_REGION_RETRY_DELAY_MS) || 120;
  const fastExit = process.env.STEAM_FAST_PRICE_SYNC === "true";

  let merged = null;
  /** @type {{ is_free: boolean, price_overview?: object } | null} */
  let priceSlice = null;
  /** @type {{ score: number, url?: string } | null} */
  let bestMetacritic = null;

  for (const cc of regions) {
    let data;
    try {
      data = await fetchSteamAppDetails(appId, { ...options, cc });
    } catch {
      await sleep(delayBetweenRegions);
      continue;
    }
    if (!data) {
      await sleep(delayBetweenRegions);
      continue;
    }

    if (!merged) merged = { ...data };
    else if ((!merged.package_groups || merged.package_groups.length === 0) && data.package_groups?.length) {
      merged.package_groups = data.package_groups;
    }

    if (data.metacritic && typeof data.metacritic.score === "number") {
      bestMetacritic = data.metacritic;
    }

    if (!priceSlice) {
      if (data.is_free) {
        priceSlice = { is_free: true, price_overview: data.price_overview };
      } else if (data.price_overview && typeof data.price_overview.final === "number") {
        priceSlice = { is_free: false, price_overview: data.price_overview };
      }
    }

    if (fastExit && priceSlice && bestMetacritic) {
      break;
    }

    await sleep(delayBetweenRegions);
  }

  if (!merged) return null;

  if (bestMetacritic) merged.metacritic = bestMetacritic;
  if (priceSlice) {
    merged.is_free = priceSlice.is_free;
    merged.price_overview = priceSlice.price_overview;
  }

  return merged;
}

module.exports = {
  extractSteamAppId,
  scoreToMetacriticLabel,
  buildUpdatesFromSteamAppData,
  fetchSteamAppDetails,
  fetchSteamAppDetailsMerged,
  getSteamRegionList,
  sleep,
};
