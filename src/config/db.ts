import postgres from "postgres";
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres({
    host: process.env.HOST_DB,
    port: parseInt(process.env.DATAPORT || '5432', 10),
    database: process.env.DATABASE,
    username: process.env.USERNAME_DB,
    password: process.env.PASSWORD_DB,
})

; (async function () {
    try {
        await sql.begin(async sql => {
            await sql` CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY, 
                username VARCHAR(255) UNIQUE NOT NULL, 
                password VARCHAR(255) NOT NULL, 
                balance DECIMAL DEFAULT 0
            );`;
            await sql` CREATE TABLE IF NOT EXISTS items (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                tradable BOOLEAN NOT NULL,
                price DECIMAL NOT NULL
            );`;
            await sql` CREATE TABLE IF NOT EXISTS purchases (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                item_id INTEGER REFERENCES items(id),
                purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`;

        });
    }
    catch (error) {
        console.log(error);
    }
})();

export default sql;