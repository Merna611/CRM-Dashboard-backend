import { ContactStatus } from '@prisma/client';
import { Context, requireAuth } from '../../context';
import { pubsub, EVENTS } from '../../pubsub';

export const contactResolvers = {
  Query: {
    contacts: async (_: unknown, { search, status, assignedToId }: { search?: string; status?: ContactStatus; assignedToId?: string }, { user, prisma }: Context) => {
      requireAuth(user);
      return prisma.contact.findMany({
        where: {
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { company: { contains: search, mode: 'insensitive' } },
            ],
          }),
          ...(status && { status }),
          ...(assignedToId && { assignedToId }),
        },
        orderBy: { updatedAt: 'desc' },
      });
    },

    contact: async (_: unknown, { id }: { id: string }, { user, prisma }: Context) => {
      requireAuth(user);
      return prisma.contact.findUnique({ where: { id } });
    },
  },

  Mutation: {
    createContact: async (_: unknown, { input }: { input: Record<string, unknown> }, { user, prisma }: Context) => {
      requireAuth(user);
      const contact = await prisma.contact.create({ data: input as Parameters<typeof prisma.contact.create>[0]['data'] });
      await pubsub.publish(EVENTS.CONTACT_UPDATED, { contactUpdated: contact });
      return contact;
    },

    updateContact: async (_: unknown, { id, input }: { id: string; input: Record<string, unknown> }, { user, prisma }: Context) => {
      requireAuth(user);
      const contact = await prisma.contact.update({ where: { id }, data: input as Parameters<typeof prisma.contact.update>[0]['data'] });
      await pubsub.publish(EVENTS.CONTACT_UPDATED, { contactUpdated: contact });
      return contact;
    },

    deleteContact: async (_: unknown, { id }: { id: string }, { user, prisma }: Context) => {
      requireAuth(user);
      await prisma.activity.deleteMany({ where: { contactId: id } });
      await prisma.deal.deleteMany({ where: { contactId: id } });
      await prisma.contact.delete({ where: { id } });
      return true;
    },
  },

  Contact: {
    assignedTo: (parent: { assignedToId?: string }, _: unknown, { prisma }: Context) =>
      parent.assignedToId ? prisma.user.findUnique({ where: { id: parent.assignedToId } }) : null,

    deals: (parent: { id: string }, _: unknown, { prisma }: Context) =>
      prisma.deal.findMany({ where: { contactId: parent.id }, orderBy: { updatedAt: 'desc' } }),

    activities: (parent: { id: string }, _: unknown, { prisma }: Context) =>
      prisma.activity.findMany({ where: { contactId: parent.id }, orderBy: { createdAt: 'desc' }, take: 10 }),
  },
};
