import dataSource from '../src/data-source';

async function run() {
  await dataSource.initialize();
  const res = await dataSource.query(`
    SELECT conname, pg_get_constraintdef(c.oid) as def
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'notifications' AND c.contype = 'c';
  `);
  console.log(res);
  await dataSource.destroy();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
