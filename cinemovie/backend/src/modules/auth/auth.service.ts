import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES = '7d';

export async function register(username: string, email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { username, email, passwordHash },
    select: { user_id: true, username: true, email: true, join_date: true },
  });
  const token = jwt.sign({ userId: user.user_id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  return { user, token };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');
  const token = jwt.sign({ userId: user.user_id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, token };
}

export async function getProfile(userId: number) {
  return prisma.user.findUniqueOrThrow({
    where: { user_id: userId },
    select: {
      user_id: true, username: true, email: true,
      country: true, join_date: true, role: true,
      _count: {
        select: {
          followers: true,
          following: true,
          watchlistItems: true,
          reviews: true,
        }
      },
    },
  });
}

export async function followUser(followerId: number, followeeId: number) {
  if (followerId === followeeId) throw new Error('Cannot follow yourself');
  return prisma.follow.create({ data: { followerId, followeeId } });
}

export async function unfollowUser(followerId: number, followeeId: number) {
  return prisma.follow.delete({
    where: { followerId_followeeId: { followerId, followeeId } }
  });
}

export async function getFollowers(userId: number) {
  return prisma.follow.findMany({
    where: { followeeId: userId },
    include: { follower: { select: { user_id: true, username: true } } },
  });
}

export async function getFollowing(userId: number) {
  return prisma.follow.findMany({
    where: { followerId: userId },
    include: { followee: { select: { user_id: true, username: true } } },
  });
}