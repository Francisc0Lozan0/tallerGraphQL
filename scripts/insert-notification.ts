import dataSource from '../src/data-source';
import { Notification } from '../src/modules/notifications/entities/notification.entity';

async function run() {
  await dataSource.initialize();

  const id = '000000000000000000000001';
  const userId = 'fff60b5c0ad33ae244aa3f12';
  const type = 'system';
  const title = 'Prueba de notificación';
  const message = 'Esta es una notificación de prueba insertada manualmente.';
  const metadata = { source: 'manual-test' };

  await dataSource.query(
    `INSERT INTO notifications (id, user_id, type, title, message, metadata, is_read, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7, now(), now())`,
    [id, userId, type, title, message, JSON.stringify(metadata), false],
  );

  console.log('Inserted notification:', id);
  await dataSource.destroy();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
