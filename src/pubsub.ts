import { PubSub } from 'graphql-subscriptions';

export const pubsub = new PubSub();

export const EVENTS = {
  DEAL_MOVED: 'DEAL_MOVED',
  CONTACT_UPDATED: 'CONTACT_UPDATED',
  ACTIVITY_ADDED: 'ACTIVITY_ADDED',
} as const;
