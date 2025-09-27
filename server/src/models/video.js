import { pgTable, serial, varchar, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Videos table schema
export const videos = pgTable('videos', {
    id: serial('id').primaryKey(),
    publicAddress: varchar('public_address', { length: 42 }).notNull(), // Ethereum address (0x + 40 chars)
    title: varchar('title', { length: 256 }).notNull(),
    description: text('description'),
    cid: varchar('cid', { length: 128 }).notNull(), // IPFS Content Identifier
    tags: jsonb('tags').default('[]'), // JSON array of tags
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Export the schema
export const schema = {
    videos,
};