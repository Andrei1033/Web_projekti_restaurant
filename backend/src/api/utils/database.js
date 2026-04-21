import mysql from 'mysql2';

// This will load variables from .env file to process.env
// it can be done also e.g. in index.js but just make sure
// that it is imported before using process.env variables
import 'dotenv/config';

console.log(process.env);

// Create the connection pool. Pool is used to improve performance
// by reusing existing connections instead of creating new
// connection for every request
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
// promise pool is asynchronous version of the pool and
// returns promises, which is used with async/await syntax
const promisePool = pool.promise();
export default promisePool;
