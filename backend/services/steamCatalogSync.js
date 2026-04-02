const GameRepository = require("../repositories/GameRepository");
const {
  extractSteamAppId,
  buildUpdatesFromSteamAppData,
  fetchSteamAppDetailsMerged,
} = require("../utils/steamStoreApi");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Vienkartinis visų Steam žaidimų sinchronizavimas su parduotuvės API.
 */
async function syncSteamCatalogOnce(pool, options = {}) {
  const delayMs = options.delayBetweenGamesMs ?? 350;
  const gameRepo = new GameRepository(pool);
  const rows = await gameRepo.listSlugsWithStoreUrl();
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const appId = extractSteamAppId(row.store_url);
    if (!appId) {
      skipped += 1;
      console.log(`[Steam sync] Praleista (nėra Steam app nuorodos): ${row.slug}`);
      continue;
    }

    try {
      const data = await fetchSteamAppDetailsMerged(appId, options);
      if (!data) {
        console.warn(`[Steam sync] Tuščias atsakas: ${row.slug} (appid=${appId})`);
        skipped += 1;
        continue;
      }

      const updates = buildUpdatesFromSteamAppData(data);
      if (Object.keys(updates).length === 0) {
        console.log(`[Steam sync] Nėra atnaujinamų laukų: ${row.slug}`);
        skipped += 1;
        continue;
      }

      const affected = await gameRepo.updateSteamSyncFields(row.slug, updates);
      if (affected) {
        updated += 1;
        console.log(`[Steam sync] Atnaujinta ${row.slug}:`, updates);
      }
    } catch (err) {
      console.error(`[Steam sync] Klaida ${row.slug}:`, err.message);
    }

    await sleep(delayMs);
  }

  console.log(`[Steam sync] Baigta. Atnaujinta: ${updated}, praleista / be pakeitimų: ${skipped}`);
  return { updated, skipped };
}

function scheduleSteamCatalogSync(pool, options = {}) {
  const enabled = process.env.STEAM_SYNC_ENABLED !== "false";
  if (!enabled) {
    console.log("[Steam sync] Išjungta (STEAM_SYNC_ENABLED=false)");
    return () => {};
  }

  const intervalMs =
    Number(process.env.STEAM_SYNC_INTERVAL_MS) ||
    options.intervalMs ||
    6 * 60 * 60 * 1000;

  const runOnStart = process.env.STEAM_SYNC_ON_START !== "false";

  let timer = null;

  const run = () => {
    syncSteamCatalogOnce(pool, options).catch((e) =>
      console.error("[Steam sync] Nepavyko:", e.message)
    );
  };

  if (runOnStart) {
    setTimeout(run, Number(process.env.STEAM_SYNC_START_DELAY_MS) || 2500);
  }

  timer = setInterval(run, intervalMs);

  return () => {
    if (timer) clearInterval(timer);
  };
}

module.exports = { syncSteamCatalogOnce, scheduleSteamCatalogSync };
