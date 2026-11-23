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
  { username: 'ana', name: 'Ana' },
  { username: 'carlos', name: 'Carlos' },
  { username: 'lucia', name: 'Lucia' },
];

const demoTasks = [
  {
    title: 'Demo: Review the project backlog',
    description: 'Review open work and confirm the next priorities.',
    status: 'pending',
  },
  {
    title: 'Demo: Prepare the weekly report',
    description: 'Collect updates and summarize the team progress.',
    status: 'complete',
  },
  {
    title: 'Demo: Update the API documentation',
    description: 'Check endpoint descriptions and request examples.',
    status: 'pending',
  },
  {
    title: 'Demo: Review user feedback',
    description: 'Group feedback and note the most common requests.',
    status: 'pending',
  },
  {
    title: 'Demo: Draft the release notes',
    description: 'List the improvements included in the next release.',
    status: 'complete',
  },
  {
    title: 'Demo: Organize the sprint board',
    description: 'Move finished work and clarify remaining tasks.',
    status: 'pending',
  },
  {
    title: 'Demo: Verify task assignment flow',
    description: 'Check that tasks can be assigned to each test user.',
    status: 'complete',
  },
  {
    title: 'Demo: Review the onboarding checklist',
    description: 'Make sure the first steps are clear and up to date.',
    status: 'pending',
  },
  {
    title: 'Demo: Clean up completed work',
    description: 'Confirm completed tasks have the correct status.',
    status: 'complete',
  },
  {
    title: 'Demo: Plan next week priorities',
    description: 'Choose the key outcomes for the upcoming week.',
    status: 'pending',
  },
];
const passwordHash = await bcrypt.hash('Demo1234', 10);
const database = new Database(databasePath);

try {
  const insertUser = database.prepare(
    'INSERT OR IGNORE INTO users (username, name, password) VALUES (?, ?, ?)',
  );
  const findUser = database.prepare('SELECT id FROM users WHERE username = ?');
  const findDemoTask = database.prepare(
    'SELECT id FROM tasks WHERE user_id = ? AND title = ?',
  );
  const insertTask = database.prepare(
    'INSERT INTO tasks (title, description, status, user_id) VALUES (?, ?, ?, ?)',
  );
  const seedDemoData = database.transaction(() => {
    let insertedUsers = 0;
    let insertedTasks = 0;

    for (const { username, name } of demoUsers) {
      insertedUsers += insertUser.run(username, name, passwordHash).changes;
      const user = findUser.get(username);
      if (!user) throw new Error(`Could not find seeded user "${username}".`);

      for (const task of demoTasks) {
        if (findDemoTask.get(user.id, task.title)) continue;
        insertedTasks += insertTask.run(
          task.title,
          task.description,
          task.status,
          user.id,
        ).changes;
      }
    }

    return { insertedUsers, insertedTasks };
  });
  const { insertedUsers, insertedTasks } = seedDemoData();

  console.log(
    `Demo seed complete: added ${insertedUsers} users and ${insertedTasks} tasks. The demo set contains five users with ten tasks each. Newly created users use password Demo1234. Existing passwords were not changed.`,
  );
} finally {
  database.close();
}
