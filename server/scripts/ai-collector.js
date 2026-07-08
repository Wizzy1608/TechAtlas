require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('../db/pool');
const { runCollector } = require('../collectors');
const { run: collectCerts } = require('../collectors/cert-collector');

async function main() {
  await runCollector();
  await collectCerts();
  await pool.end();
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});