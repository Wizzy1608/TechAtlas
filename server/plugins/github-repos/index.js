function register(app, pool) {
    app.get('/api/resources', async (req, res) => {
    try {
      const { difficulty, source, search, domain, category, source_name, limit = 30, offset = 0 } = req.query;
      let sql = 'SELECT * FROM resources WHERE 1=1';
      let params = [];
      let idx = 1;

      if (difficulty) {
        sql += ` AND difficulty = $${idx++}`;
        params.push(difficulty);
      }
      if (domain) {
        sql += ` AND domain = $${idx++}`;
        params.push(domain);
      }
            if (category) {
        if (category.startsWith('!')) {
          sql += ` AND category != $${idx++}`;
          params.push(category.slice(1));
        } else {
          sql += ` AND category = $${idx++}`;
          params.push(category);
        }
      }
      if (source_name) {
        sql += ` AND source_name = $${idx++}`;
        params.push(source_name);
      }
      if (source) {
        sql += ` AND source_type = $${idx++}`;
        params.push(source);
      }
      if (search) {
        sql += ` AND search_vector @@ plainto_tsquery('english', $${idx++})`;
        params.push(search);
      }

      sql += ' ORDER BY collected_at DESC';
      sql += ` LIMIT $${idx++} OFFSET $${idx++}`;
      params.push(limit, offset);

      const result = await pool.query(sql, params);

            const countSql = 'SELECT COUNT(*) FROM resources WHERE 1=1' +
        (difficulty ? ` AND difficulty = '${difficulty}'` : '') +
        (domain ? ` AND domain = '${domain}'` : '') +
        (category ? ` AND category ${category.startsWith('!') ? '!=' : '='} '${category.replace('!', '')}'` : '') +
        (source_name ? ` AND source_name = '${source_name}'` : '') +
        (source ? ` AND source_type = '${source}'` : '');
      const countResult = await pool.query(countSql);

      res.json({
        data: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    } catch (err) {
      console.error('Resources error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/search', async (req, res) => {
    try {
      const { q, difficulty } = req.query;
      if (!q) return res.json({ data: [], related: [] });

      let sql = `SELECT *, ts_rank(search_vector, plainto_tsquery('english', $1)) AS rank
                 FROM resources
                 WHERE search_vector @@ plainto_tsquery('english', $1)`;
      let params = [q];
      let idx = 2;

      if (difficulty) {
        sql += ` AND difficulty = $${idx++}`;
        params.push(difficulty);
      }

      sql += ' ORDER BY rank DESC LIMIT 20';
      const exact = await pool.query(sql, params);

      let related = [];
      if (exact.rows.length > 0) {
        const matchedIds = exact.rows.map(r => `'${r.id}'`).join(',');
        const relatedResult = await pool.query(
          `SELECT * FROM resources
           WHERE id NOT IN (${matchedIds})
           AND (
             SELECT COUNT(*) FROM unnest(tags) t
             WHERE t = ANY(ARRAY(SELECT unnest(tags) FROM resources WHERE id IN (${matchedIds})))
           ) >= 2
           ORDER BY collected_at DESC LIMIT 10`
        );
        related = relatedResult.rows;
      }

      res.json({ data: exact.rows, related, total: exact.rows.length });
    } catch (err) {
      console.error('Search error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/recent', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM resources
         WHERE collected_at > NOW() - INTERVAL '7 days'
         ORDER BY collected_at DESC LIMIT 20`
      );
      res.json({ data: result.rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

module.exports = { register };