import mysql from "mysql2/promise";

const pool = process.env.DATABASE_URL
  ? mysql.createPool(process.env.DATABASE_URL)
  : (undefined as unknown as mysql.Pool);

export default pool;