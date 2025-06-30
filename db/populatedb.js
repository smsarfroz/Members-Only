#! /usr/bin/env node

import { Client } from "pg";
import 'dotenv/config'

const SQL = `
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    firstname VARCHAR ( 255 ),
    lastname VARCHAR ( 255 ),
    email VARCHAR ( 255 ),
    password VARCHAR ( 255 ),
    membership_status VARCHAR (255)
);
CREATE TABLE IF NOT EXISTS messages (
    message_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    message VARCHAR ( 255 ),
    userid VARCHAR ( 255 ),
    date DATE,
    time TIMESTAMP
);
`;

async function main() {
  console.log("seeding...");
  const client = new Client({
    connectionString: `postgresql://${process.env.user}:${process.env.password}@${process.env.host}:${process.env.port}/${process.env.database}`,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("Connected to database");
    
    await client.query(SQL);
    console.log("Database schema created and populated");
  } catch (err) {
    console.error("Error during database population:", err);
    process.exit(1);
  } finally {
    await client.end();
    console.log("Database connection closed");
  }
}

main();