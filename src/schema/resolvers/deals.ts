import { DealStage } from '@prisma/client';
import { Context, requireAuth } from '../../context';
import { pubsub, EVENTS } from '../../pubsub';

export const dealResolvers = {
  Query: {
    deals: async (_: unknown, { stage, assignedToId }: { stage?: DealStage; assignedToId?: string }, { user, prisma }: Context) => {
      requireAuth(user);
      return prisma.deal.findMany({
        where: {
          ...(stage && { stage }),
          ...(assignedToId && { assignedToId }),
        },
        orderBy: { updatedAt: 'desc' },
      });
    },

    deal: async (_: unknown, { id }: { id: string }, { user, prisma }: Context) => {
      requireAuth(user);
      return prisma.deal.findUnique({ where: { id } });
    },
  },

  Mutation: {
    createDeal: async (_: unknown, { input }: { input: Record<string, unknown> }, { user, prisma }: Context) => {
      requireAuth(user);
      return prisma.deal.create({ data: input as Parameters<typeof prisma.deal.create>[0]['data'] });
    },

    updateDeal: async (_: unknown, { id, input }: { id: string; input: Record<string, unknown> }, { user, prisma }: Context) => {
      requireAuth(user);
      return prisma.deal.update({ where: { id }, data: input as Parameters<typeof prisma.deal.update>[0]['data'] });
    },

    deleteDeal: async (_: unknown, { id }: { id: string }, { user, prisma }: Context) => {
      requireAuth(user);
      await prisma.activity.deleteMany({ where: { dealId: id } });
      await prisma.deal.delete({ where: { id } });
      return true;
    },

    moveDeal: async (_: unknown, { id, stage }: { id: string; stage: DealStage }, { user, prisma }: Context) => {
      requireAuth(user);
      const stageProbability: Record<DealStage, number> = {
        LEAD: 10, QUALIFIED: 25, PROPOSAL: 50, NEGOTIATION: 75, CLOSED_WON: 100, CLOSED_LOST: 0,
      };
      const deal = await prisma.deal.update({
        where: { id },
        data: { stage, probability: stageProbability[stage] },
      });
      await pubsub.publish(EVENTS.DEAL_MOVED, { dealMoved: deal });
      return deal;
    },
  },

  Deal: {
    contact: (parent: { contactId: string }, _: unknown, { prisma }: Context) =>
      prisma.contact.findUnique({ where: { id: parent.contactId } }),

    assignedTo: (parent: { assignedToId?: string }, _: unknown, { prisma }: Context) =>
      parent.assignedToId ? prisma.user.findUnique({ where: { id: parent.assignedToId } }) : null,

    activities: (parent: { id: string }, _: unknown, { prisma }: Context) =>
      prisma.activity.findMany({ where: { dealId: parent.id }, orderBy: { createdAt: 'desc' } }),
  },
};
