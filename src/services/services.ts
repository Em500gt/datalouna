import sql from '../config/db';
import axios from 'axios';
import bcrypt from 'bcrypt';
import client from '../config/redisClient';
import { Item, GetItemsResponse, ItemWithPrices } from '../interfaces/interface';

class Service {

    async login(username: string, password: string): Promise<{ success: boolean }> {
        try {
            const result = await sql`SELECT password FROM users WHERE username = ${username}`;
            if (result.length === 0) {
                return { success: false }
            }
            const isPasswordValid = await bcrypt.compare(password, result[0].password);
            return { success: isPasswordValid };
        }
        catch (error) {
            return { success: false };
        }
    }

    async changePassword(username: string, oldPass: string, newPass: string): Promise<{ success: boolean }> {
        try {
            const result = await sql`SELECT password FROM users WHERE username = ${username}`;
            if (result.length === 0) {
                return { success: false }
            }
            const isOpdPasswordValid = await bcrypt.compare(oldPass, result[0].password);
            if (!isOpdPasswordValid) {
                return { success: false }
            }
            const hashedNewPassword = await bcrypt.hash(newPass, parseInt(process.env.SALT as string, 10));
            await sql`UPDATE users SET password = ${hashedNewPassword} WHERE username = ${username}`;
            if (result.length === 0) {
                return { success: false };
            }
            return { success: true };
        }
        catch (error) {
            return { success: false };
        }
    }

    async getItems(app_id: string = '730', currency: string = 'EUR'): Promise<GetItemsResponse> {
        const cache = await client.get(`items:${app_id}:${currency}`);
        if (cache) {
            return { message: "Значения извлеченные из кэша", data: JSON.parse(cache) };
        }
        try {
            const responseTrueTradable = await axios.get('https://api.skinport.com/v1/items', {
                params: { app_id, currency, tradable: 0 }
            });
            const responseFalseTradable = await axios.get('https://api.skinport.com/v1/items', {
                params: { app_id, currency, tradable: 1 }
            });
            const trueTradableItems = responseTrueTradable.data.reduce((acc: { [key: string]: number }, item: Item) => {
                acc[item.market_hash_name] = item.min_price;
                return acc;
            }, {});
            const falseTradableItems = responseFalseTradable.data.reduce((acc: { [key: string]: number }, item: Item) => {
                acc[item.market_hash_name] = item.min_price;
                return acc;
            }, {});
            const itemsWithPrices: ItemWithPrices[] = Object.keys(trueTradableItems).map(name => ({
                market_hash_name: name,
                min_price_tradable: trueTradableItems[name],
                min_price_non_tradable: falseTradableItems[name] || null,
            }));
            client.set(`items:${app_id}:${currency}`, JSON.stringify(itemsWithPrices), { EX: 300 });
            return { message: "Значения успешно получены", data: itemsWithPrices };
        } catch (error) {
            console.error("Ошибка:", error);
            return { message: "Не удалось получить элементы из-за ошибки" };
        }
    }

    async purchaseItems(userId: number, itemId: number): Promise<{ success: boolean; balance?: number; message?: string }> {
        return await sql.begin(async sql => {
            const [user] = await sql`SELECT balance FROM users WHERE id = ${userId}`;
            const [item] = await sql`SELECT price FROM items WHERE id = ${itemId}`;
            if (!user || !item) {
                return { success: false, message: "Пользователь или предмет не найдены" };
            }
            if (user.balance < item.price) {
                return { success: false, message: "Недостаточно средств" };
            }
            const newBalance = user.balance - item.price;
            await sql`UPDATE users SET balance = ${newBalance} WHERE id = ${userId}`;
            await sql`INSERT INTO purchases (user_id, item_id) VALUES (${userId}, ${itemId})`;
            return { success: true, balance: newBalance };
        });
    }
}

export default new Service();