import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: "server/.env" });

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  connectTimeout: 8000,
};

async function ensureColumn(connection, table, column, definition) {
  const database = process.env.DB_NAME || "dwebin";
  const [rows] = await connection.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [database, table, column],
  );

  if (rows.length === 0) {
    await connection.query(
      `ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`,
    );
  }
}

export async function initDatabase() {
  const database = process.env.DB_NAME || "dwebin";
  const connection = await mysql.createConnection(dbConfig);

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\`
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci`,
    );
  } catch (error) {
    if (error.code !== "ER_DBACCESS_DENIED_ERROR") {
      throw error;
    }
  }

  await connection.query(`USE \`${database}\``);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      username VARCHAR(80) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(30) NOT NULL DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category VARCHAR(80) NOT NULL,
      title VARCHAR(160) NOT NULL,
      description TEXT NOT NULL,
      details TEXT,
      stack_json TEXT NOT NULL,
      accent VARCHAR(30) DEFAULT 'blue',
      demo_url VARCHAR(255),
      source_url VARCHAR(255),
      image_url LONGTEXT,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL,
      message TEXT NOT NULL,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS content_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type VARCHAR(40) NOT NULL,
      title VARCHAR(180) NOT NULL,
      subtitle VARCHAR(180),
      body TEXT,
      meta_json TEXT,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS settings (
      setting_key VARCHAR(80) PRIMARY KEY,
      setting_value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await ensureColumn(connection, "projects", "sort_order", "INT DEFAULT 0");
  await ensureColumn(connection, "projects", "image_url", "LONGTEXT");
  await connection.query("ALTER TABLE `projects` MODIFY COLUMN `image_url` LONGTEXT");
  await ensureColumn(connection, "messages", "sort_order", "INT DEFAULT 0");

  await connection.end();
}

export const pool = mysql.createPool({
  ...dbConfig,
  database: process.env.DB_NAME || "dwebin",
  waitForConnections: true,
  connectionLimit: 10,
});
