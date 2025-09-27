import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/models/video.js',
    out: './migrations',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});