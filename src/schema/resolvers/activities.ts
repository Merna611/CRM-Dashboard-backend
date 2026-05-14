import { ActivityType } from '@prisma/client';
import { Context, requireAuth } from '../../context';
import { pubsub, EVENTS } from '../../pubsub';

export const activityResolvers = {
  Query: {
    activities: async (_: unknown, { contactId, dealId, limit }: { contactId?: string; dealId?: string; limit?: number }, { user, prisma }: Context) => {
      requireAuth(user);
      return prisma.activity.findMany({
        where: {
          ...(contactId && { contactId }),
          ...(dealId && { dealId }),
        },
        orderBy: { createdAt: 'desc' },
        take: limit ?? 20,
      });
    },
  },

  Mutation: {
    addActivity: async (_: unknown, { input }: { input: { type: ActivityType; description: string; contactId?: string; dealId?: string } }, { user, prisma }: Context) => {
      const authUser = requireAuth(user);
      const activity = await prisma.activity.create({
        data: { ...input, userId: authUser.id },
      });
      await pubsub.publish(EVENTS.ACTIVITY_ADDED, { activityAdded: activity });
      return activity;
    },
  },

  Activity: {
    user: (parent: { userId: string }, _: unknown, { prisma }: Context) =>
      prisma.user.findUnique({ where: { id: parent.userId } }),

    contact: (parent: { contactId?: string }, _: unknown, { prisma }: Context) =>
      parent.contactId ? prisma.contact.findUnique({ where: { id: parent.contactId } }) : null,

    deal: (parent: { dealId?: string }, _: unknown, { prisma }: Context) =>
      parent.dealId ? prisma.deal.findUnique({ where: { id: parent.dealId } }) : null,
  },
};
