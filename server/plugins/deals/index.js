const { createClient } = require('@supabase/supabase-js');

function register(app, pool) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  let supabase;
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }

  app.get('/api/deals', async (req, res) => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('deals')
          .select('*')
          .eq('is_active', true)
          .gt('valid_until', new Date().toISOString())
          .order('valid_until', { ascending: true });
        if (error) throw error;
        return res.json({ data });
      }

      const result = await pool.query(
        `SELECT * FROM deals WHERE is_active = true AND valid_until > NOW() ORDER BY valid_until ASC`
      );
      res.json({ data: result.rows });
    } catch (err) {
      console.error('Deals error:', err);
      res.status(500).json({ error: err.message });
    }
  });
}

module.exports = { register };