import mysql from "mysql2/promise";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL tidak terdefinisi. Setel env var DATABASE_URL di environment."
  );
}

const pool = mysql.createPool(process.env.DATABASE_URL);

export default pool;