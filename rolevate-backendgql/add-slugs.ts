import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

async function addSlugsToJobs() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: false,
  });

  await dataSource.initialize();

  // Get all jobs without slug
  const jobs = await dataSource.query('SELECT id, title, "createdAt" FROM job WHERE slug IS NULL');

  for (const job of jobs) {
    const timestamp = new Date(job.createdAt).getTime();
    const slugifiedTitle = job.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
    const slug = `${timestamp}-${slugifiedTitle}`;
    await dataSource.query('UPDATE job SET slug = $1 WHERE id = $2', [slug, job.id]);
    console.log(`Updated job ${job.id} with slug ${slug}`);
  }

  await dataSource.destroy();
  console.log('Slugs added to existing jobs.');
}

addSlugsToJobs().catch(console.error);