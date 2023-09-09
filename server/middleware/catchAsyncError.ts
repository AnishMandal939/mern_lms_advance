import { NextFunction, Request, Response } from "express";

export const CatchAsyncError = (catchAsyncErrorFunc: any) => (req: Request, res: Response, next: NextFunction) => Promise.resolve(catchAsyncErrorFunc(req, res, next)).catch(next);