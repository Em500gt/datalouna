import { Request, Response, NextFunction } from 'express';

export function jsonSyntaxErrorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): Response | void {
    if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Некорректные данные в теле запроса' });
    }
    next(err);
}