import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation error', details: err.flatten() });
  }
  if (err instanceof Error) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
  return res.status(500).json({ error: 'Unexpected error' });
}
