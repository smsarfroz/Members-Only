import { Pool } from "pg";
// import 'dotenv/config'

export default new Pool({
  // host: process.env.HOST, 
  // user: process.env.USER,
  // database: process.env.DATABASE,
  // password: process.env.PASSWORD,
  // port: process.env.PORT,
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});