import { Request, Response } from 'express';
import services from '../services/services';
import { GetItemsResponse } from '../interfaces/interface';

class Controller {
    async login(req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ message: "Введите логин и пароль" });
        }
        try {
            const result = await services.login(username, password);
            if (result.success) {
                res.status(200).json({ message: "Авторизация прошла успешно!" });
            } else {
                res.status(401).json({ message: "Неверный логин или пароль" });
            }
        } catch (error) {
            console.error("Ошибка при авторизации:", error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }

    async changePassword(req: Request, res: Response): Promise<void> {
        const { username, oldPassword, newPassword } = req.body;
        if (!username || !oldPassword || !newPassword) {
            res.status(400).json({ message: "Введите логин и пароли" });
        }
        try {
            const result = await services.changePassword(username, oldPassword, newPassword);
            if (result.success) {
                res.status(200).json({ message: "Пароль обновлен успешно!" });
            } else {
                res.status(401).json({ message: "Неверный логин или старый пароль" });
            }
        } catch (error) {
            console.error("Ошибка при обновлении пароля:", error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }

    async getItems(req: Request, res: Response): Promise<void> {
        const { app_id, currency } = req.params;
        try {
            const result: GetItemsResponse = await services.getItems(app_id, currency);
            if (result.data) {
                res.status(200).json(result);
            } else {
                res.status(500).json({ message: result.message });
            }
        } catch (error) {
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }
    async purchaseItems(req: Request, res: Response): Promise<void> {
        const userId = parseInt(req.body.userId, 10);
        const itemId = parseInt(req.body.itemId, 10);
        if (isNaN(userId) || isNaN(itemId)) {
            res.status(400).json({ message: "Некорректные данные пользователя или предмета" });
        }
        try {
            const result = await services.purchaseItems(userId, itemId);
            if (result.success) {
                res.status(200).json({ message: "Покупка успешна", balance: result.balance });
            } else {
                res.status(400).json({ message: result.message });
            }
        } catch (error) {
            console.error("Ошибка при обработке покупки:", error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }
}

export default new Controller();