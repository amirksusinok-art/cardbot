import fs from 'fs';
import path from 'path';
import pg from 'pg';
import Database from 'better-sqlite3';

export interface DbInterface {
  query(sql: string, params?: any[]): Promise<any[]>;
  get(sql: string, params?: any[]): Promise<any | null>;
  run(sql: string, params?: any[]): Promise<{ changes: number }>;
}

let dbInstance: DbInterface | null = null;

export async function getDb(): Promise<DbInterface> {
  if (dbInstance) return dbInstance;

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    console.log('[DB] Connecting to PostgreSQL (Render Postgres)...');
    // Ensure BIGINT (int8) is parsed as JavaScript Number
    pg.types.setTypeParser(20, (val: string) => parseInt(val, 10));

    const pool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });

    dbInstance = {
      async query(sql: string, params: any[] = []) {
        // Convert ? placeholders to $1, $2, ... for Postgres
        let pIndex = 1;
        const pgSql = sql.replace(/\?/g, () => `$${pIndex++}`);
        const res = await pool.query(pgSql, params);
        return res.rows;
      },
      async get(sql: string, params: any[] = []) {
        let pIndex = 1;
        const pgSql = sql.replace(/\?/g, () => `$${pIndex++}`);
        const res = await pool.query(pgSql, params);
        return res.rows[0] || null;
      },
      async run(sql: string, params: any[] = []) {
        let pIndex = 1;
        const pgSql = sql.replace(/\?/g, () => `$${pIndex++}`);
        const res = await pool.query(pgSql, params);
        return { changes: res.rowCount || 0 };
      }
    };
  } else {
    console.log('[DB] Using local SQLite database...');
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'cardbot.db');
    const sqlite = new Database(dbPath);

    dbInstance = {
      async query(sql: string, params: any[] = []) {
        const stmt = sqlite.prepare(sql);
        return stmt.all(...params);
      },
      async get(sql: string, params: any[] = []) {
        const stmt = sqlite.prepare(sql);
        const res = stmt.get(...params);
        return res || null;
      },
      async run(sql: string, params: any[] = []) {
        const stmt = sqlite.prepare(sql);
        const res = stmt.run(...params);
        return { changes: res.changes };
      }
    };
  }

  await initSchema(dbInstance);
  return dbInstance;
}

async function initSchema(db: DbInterface) {
  // Create tables
  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      telegram_id BIGINT PRIMARY KEY,
      username TEXT,
      first_name TEXT,
      photo_url TEXT,
      coins INTEGER DEFAULT 1500,
      free_mint_available_at BIGINT DEFAULT 0,
      equipped_holder TEXT DEFAULT NULL,
      equipped_frame TEXT DEFAULT NULL,
      equipped_effect TEXT DEFAULT NULL,
      equipped_bg TEXT DEFAULT NULL,
      card_of_day_id TEXT DEFAULT NULL,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL
    );
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      card_number TEXT NOT NULL,
      collection_code TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      bank TEXT NOT NULL,
      material TEXT NOT NULL,
      category TEXT NOT NULL,
      score INTEGER NOT NULL,
      is_favorite INTEGER DEFAULT 0,
      is_bomzh INTEGER DEFAULT 0,
      created_at BIGINT NOT NULL
    );
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      task_key TEXT NOT NULL,
      title TEXT NOT NULL,
      reward_coins INTEGER NOT NULL,
      progress INTEGER DEFAULT 0,
      target INTEGER NOT NULL,
      is_claimed INTEGER DEFAULT 0,
      task_date TEXT NOT NULL
    );
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS albums (
      id TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      album_key TEXT NOT NULL,
      is_claimed INTEGER DEFAULT 0,
      claimed_at BIGINT
    );
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS user_cosmetics (
      id TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      item_key TEXT NOT NULL,
      acquired_at BIGINT NOT NULL
    );
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      type TEXT NOT NULL,
      amount_coins INTEGER DEFAULT 0,
      amount_stars INTEGER DEFAULT 0,
      telegram_payment_id TEXT,
      description TEXT NOT NULL,
      created_at BIGINT NOT NULL
    );
  `);

  console.log('[DB] Schema verified successfully.');
}
