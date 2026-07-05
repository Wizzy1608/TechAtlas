function register(app, pool) {
  app.get('/api/ping', (req, res) => {
    res.json({ message: 'pong', plugin: 'ping' });
  });
}

module.exports = { register };