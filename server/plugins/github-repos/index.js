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
        sql += ` AND category = $${idx++}`;
        params.push(category);
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
        (category ? ` AND category = '${category}'` : '') +
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