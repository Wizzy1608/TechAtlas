function register(app, pool) {
  // Browse all resources with optional filters
  app.get('/api/resources', async (req, res) => {
    try {
      const { difficulty, source, search, limit = 30, offset = 0 } = req.query;
      let sql = 'SELECT * FROM resources WHERE 1=1';
      let params = [];
      let idx = 1;

      if (difficulty) {
        sql += ` AND difficulty = $${idx++}`;
        params.push(difficulty);
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

      const countResult = await pool.query(
        'SELECT COUNT(*) FROM resources' +
        (difficulty ? ` WHERE difficulty = '${difficulty}'` : '')
      );

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

  // Recent topics (last 7 days)
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

  // Search with related results
  app.get('/api/search', async (req, res) => {
    try {
      const { q, difficulty } = req.query;
      if (!q) return res.json({ data: [], related: [] });

      let sql = `
        SELECT *, ts_rank(search_vector, plainto_tsquery('english', $1)) AS rank
        FROM resources
        WHERE search_vector @@ plainto_tsquery('english', $1)
      `;
      let params = [q];
      let idx = 2;

      if (difficulty) {
        sql += ` AND difficulty = $${idx++}`;
        params.push(difficulty);
      }

      sql += ' ORDER BY rank DESC LIMIT 20';

      const exact = await pool.query(sql, params);

      // Related: resources sharing 2+ tags with matched results
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
}

module.exports = { register };