import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { schema } from '../models/video.js';
import 'dotenv/config';

// Initialize Neon connection
const sql = neon(process.env.DATABASE_URL);

// Initialize Drizzle with schema
const db = drizzle(sql, { schema });

// Export the database connection and schema
export { db, schema };