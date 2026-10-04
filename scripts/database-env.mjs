export function resolveDatabaseEnvironment(environment) {
  if (!environment.DATABASE_URL) {
    throw new Error('DATABASE_URL must be configured for the Builds scope and this deploy context.');
  }

  if (environment.DIRECT_URL) {
    return { ...environment };
  }

  let connection;
  try {
    connection = new URL(environment.DATABASE_URL);
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection string.');
  }

  if (
    !['postgres:', 'postgresql:'].includes(connection.protocol) ||
    !connection.hostname.endsWith('.neon.tech') ||
    !connection.hostname.startsWith('ep-')
  ) {
    throw new Error('DIRECT_URL must be configured for the Builds scope and this deploy context when not using a Neon endpoint.');
  }

  connection.hostname = connection.hostname.replace(/^([^.]+)-pooler\./, '$1.');
  connection.searchParams.delete('pgbouncer');

  return { ...environment, DIRECT_URL: connection.toString() };
}
