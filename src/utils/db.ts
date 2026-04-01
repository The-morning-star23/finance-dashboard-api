import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

// Initialize the SQLite database connection
const sqlite = new Database('dev.db');

// Initialize the Prisma driver adapter
const adapter = new PrismaBetterSqlite3(sqlite);

// Instantiate and export the PrismaClient (Prisma 7 requirement)
export const prisma = new PrismaClient({ adapter });
