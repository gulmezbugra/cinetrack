import { Router } from 'express';
import { z } from 'zod';
import * as AuthService from './auth.service';
import { authenticate, AuthRequest } from '../../middleware/authenticate';

export const authRouter = Router();

const RegisterSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRouter.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = RegisterSchema.parse(req.body);
    const result = await AuthService.register(username, email, password);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (err) { next(err); }
});

authRouter.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const profile = await AuthService.getProfile(req.userId!);
    res.json(profile);
  } catch (err) { next(err); }
});

authRouter.post('/follow/:userId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await AuthService.followUser(req.userId!, Number(req.params.userId));
    res.status(201).json({ success: true });
  } catch (err) { next(err); }
});

authRouter.delete('/follow/:userId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await AuthService.unfollowUser(req.userId!, Number(req.params.userId));
    res.json({ success: true });
  } catch (err) { next(err); }
});

authRouter.get('/users/:userId/followers', async (req, res, next) => {
  try {
    const data = await AuthService.getFollowers(Number(req.params.userId));
    res.json(data);
  } catch (err) { next(err); }
});

authRouter.get('/users/:userId/following', async (req, res, next) => {
  try {
    const data = await AuthService.getFollowing(Number(req.params.userId));
    res.json(data);
  } catch (err) { next(err); }
});
