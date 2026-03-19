import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:your_password@localhost:5432/your_database',
  },
});
