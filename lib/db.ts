import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL tidak terdefinisi. Setel env var DATABASE_URL di environment."
      );
    }

    pool = mysql.createPool(process.env.DATABASE_URL);
  }

  return pool;
}

const poolProxy = {
  getConnection: async () => getPool().getConnection(),
} as unknown as mysql.Pool;

export default poolProxy;
