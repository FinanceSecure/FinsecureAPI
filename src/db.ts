import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

export default prisma;
export const pool = new Pool({
  connectionString: process.env.DB_URL,
});
