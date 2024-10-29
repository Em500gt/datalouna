import dotenv from 'dotenv';
import express, { Application, NextFunction, Request, Response } from "express";
import { jsonSyntaxErrorHandler } from './middleware/errorHandler';
import database from './config/db';
import router from './router';

dotenv.config();
const app: Application = express();
app.use(express.json());
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    jsonSyntaxErrorHandler(err, req, res, next);
});
app.use('/app', router);
app.listen(process.env.PORT, async () => {
    database;
    console.log(`Server is running on port ${process.env.PORT}`)
})