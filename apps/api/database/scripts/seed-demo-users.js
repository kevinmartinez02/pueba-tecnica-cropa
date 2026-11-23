import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcrypt';
import Database from 'better-sqlite3';
import { config } from 'dotenv';

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
config({ path: resolve(apiRoot, '.env') });

const databasePath = resolve(
  apiRoot,
  process.env.DATABASE_PATH ?? 'data/app.sqlite',
);
mkdirSync(dirname(databasePath), { recursive: true });

const demoUsers = [
  { username: 'maria', name: 'Maria' },
  { username: 'john', name: 'John' },
];
const passwordHash = await bcrypt.hash('Demo1234', 10);
const database = new Database(databasePath);

try {
  const insertUser = database.prepare(
    'INSERT OR IGNORE INTO users (username, name, password) VALUES (?, ?, ?)',
  );
  const insertDemoUsers = database.transaction(() =>
    demoUsers.map(({ username, name }) =>
      insertUser.run(username, name, passwordHash),
    ),
  );
  const results = insertDemoUsers();
  const insertedCount = results.reduce(
    (count, result) => count + result.changes,
    0,
  );

  console.log(
    insertedCount
      ? `Created ${insertedCount} demo users. Username: maria or john. Password: Demo1234.`
      : 'Demo users already exist; their passwords were not changed.',
  );
} finally {
  database.close();
}
