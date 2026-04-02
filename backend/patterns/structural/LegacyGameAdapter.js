class LegacyGameAdapter {
  static toCardDto(row) {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      genre: row.genre,
      price: row.price,
      is_free: row.is_free,
      discount_percent: row.discount_percent ?? 0,
      price_before_discount: row.price_before_discount ?? null,
      metacritic_score: row.metacritic_score,
      metacritic_label: row.metacritic_label,
      header_image: row.header_image,
      release_date: row.release_date,
      store_url: row.store_url,
      genres: row.genres || "",
      avg_rating: row.avg_rating || null,
    };
  }
}

module.exports = LegacyGameAdapter;
