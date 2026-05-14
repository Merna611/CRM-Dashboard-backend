import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Context } from '../../context';

export const authResolvers = {
  Mutation: {
    register: async (_: unknown, { input }: { input: { name: string; email: string; password: string } }, { prisma }: Context) => {
      const existing = await prisma.user.findUnique({ where: { email: input.email } });
      if (existing) throw new Error('Email already registered');

      const password = await bcrypt.hash(input.password, 10);
      const user = await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(input.name)}`,
        },
      });

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
      return { token, user };
    },

    login: async (_: unknown, { email, password }: { email: string; password: string }, { prisma }: Context) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error('Invalid credentials');

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error('Invalid credentials');

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
      return { token, user };
    },
  },
};
