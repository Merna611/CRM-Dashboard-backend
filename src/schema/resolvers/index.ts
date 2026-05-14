import { pubsub, EVENTS } from '../../pubsub';
import { Context, requireAuth } from '../../context';
import { authResolvers } from './auth';
import { contactResolvers } from './contacts';
import { dealResolvers } from './deals';
import { activityResolvers } from './activities';
import { dashboardResolvers } from './dashboard';

const subscriptionResolvers = {
  Subscription: {
    dealMoved: {
      subscribe: (_: unknown, __: unknown, { user }: Context) => {
        requireAuth(user);
        return pubsub.asyncIterator([EVENTS.DEAL_MOVED]);
      },
    },
    contactUpdated: {
      subscribe: (_: unknown, __: unknown, { user }: Context) => {
        requireAuth(user);
        return pubsub.asyncIterator([EVENTS.CONTACT_UPDATED]);
      },
    },
    activityAdded: {
      subscribe: (_: unknown, __: unknown, { user }: Context) => {
        requireAuth(user);
        return pubsub.asyncIterator([EVENTS.ACTIVITY_ADDED]);
      },
    },
  },
};

const userResolvers = {
  Query: {
    me: (_: unknown, __: unknown, { user, prisma }: Context) =>
      user ? prisma.user.findUnique({ where: { id: user.id } }) : null,

    users: (_: unknown, __: unknown, { user, prisma }: Context) => {
      requireAuth(user);
      return prisma.user.findMany({ orderBy: { name: 'asc' } });
    },
  },
};

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...contactResolvers.Query,
    ...dealResolvers.Query,
    ...activityResolvers.Query,
    ...dashboardResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...contactResolvers.Mutation,
    ...dealResolvers.Mutation,
    ...activityResolvers.Mutation,
  },
  Subscription: subscriptionResolvers.Subscription,
  Contact: contactResolvers.Contact,
  Deal: dealResolvers.Deal,
  Activity: activityResolvers.Activity,
};
