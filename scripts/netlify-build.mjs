import { spawnSync } from 'node:child_process';
import { resolveDatabaseEnvironment } from './database-env.mjs';

let environment;
try {
  environment = resolveDatabaseEnvironment(process.env);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const steps = [
  ['prisma', ['generate']],
  ['prisma', ['migrate', 'deploy']],
  [process.execPath, ['prisma/seed.mjs']],
  ['next', ['build']],
];

for (const [command, argumentsList] of steps) {
  const result = spawnSync(command, argumentsList, {
    env: environment,
    stdio: 'inherit',
  });

  if (result.error || result.status !== 0) {
    console.error('The Netlify build stopped because a required step failed.');
    process.exit(result.status || 1);
  }
}
