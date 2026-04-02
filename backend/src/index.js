import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aitest1',
  waitForConnections: true,
  connectionLimit: 10
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(64) NOT NULL UNIQUE,
      password VARCHAR(128) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  await pool.query(
    'INSERT IGNORE INTO users (username, password) VALUES (?, ?)',
    ['admin', '123456']
  );
}

app.get('/api/health', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS now');
    res.json({ ok: true, db: rows[0]?.now || null });
  } catch (error) {
    res.status(500).json({ ok: false, message: String(error.message || error) });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, message: 'username/password required' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT id, username FROM users WHERE username = ? AND password = ? LIMIT 1',
      [username, password]
    );
    if (rows.length === 0) {
      return res.status(401).json({ ok: false, message: 'invalid credentials' });
    }
    return res.json({ ok: true, user: rows[0] });
  } catch (error) {
    return res.status(500).json({ ok: false, message: String(error.message || error) });
  }
});

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`backend listening on :${port}`);
    });
  })
  .catch((err) => {
    console.error('db init failed', err);
    process.exit(1);
  });
