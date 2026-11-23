import { execFileSync } from 'node:child_process';

const name = process.argv
  .slice(2)
  .find((argument) => argument !== '--')
  ?.trim();

if (!name || !/^[A-Za-z][A-Za-z0-9_-]*$/.test(name)) {
  console.error('Provide a migration name using letters, numbers, _ or -.');
  console.error(
    'Example: pnpm --filter api migration:create -- CreateUsersTable',
  );
  process.exit(1);
}

try {
  execFileSync(
    'typeorm-ts-node-esm',
    ['migration:create', `./database/migrations/${name}`],
    { stdio: 'inherit' },
  );
} catch {
  process.exit(1);
}
