export const typeDefs = `#graphql
  enum Role { ADMIN MANAGER MEMBER }
  enum ContactStatus { LEAD PROSPECT CUSTOMER CHURNED }
  enum DealStage { LEAD QUALIFIED PROPOSAL NEGOTIATION CLOSED_WON CLOSED_LOST }
  enum ActivityType { CALL EMAIL MEETING NOTE }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    avatar: String
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Contact {
    id: ID!
    name: String!
    email: String!
    phone: String
    company: String
    status: ContactStatus!
    tags: [String!]!
    notes: String
    assignedTo: User
    deals: [Deal!]!
    activities: [Activity!]!
    createdAt: String!
    updatedAt: String!
  }

  type Deal {
    id: ID!
    title: String!
    value: Float!
    stage: DealStage!
    probability: Int!
    expectedClose: String
    contact: Contact!
    assignedTo: User
    activities: [Activity!]!
    createdAt: String!
    updatedAt: String!
  }

  type Activity {
    id: ID!
    type: ActivityType!
    description: String!
    contact: Contact
    deal: Deal
    user: User!
    createdAt: String!
  }

  type StageCount {
    stage: DealStage!
    count: Int!
    value: Float!
  }

  type MonthlyRevenue {
    month: String!
    revenue: Float!
    deals: Int!
  }

  type DashboardStats {
    totalContacts: Int!
    totalDeals: Int!
    totalRevenue: Float!
    wonDeals: Int!
    conversionRate: Float!
    pipelineByStage: [StageCount!]!
    revenueByMonth: [MonthlyRevenue!]!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input ContactInput {
    name: String!
    email: String!
    phone: String
    company: String
    status: ContactStatus
    tags: [String!]
    notes: String
    assignedToId: ID
  }

  input DealInput {
    title: String!
    value: Float!
    stage: DealStage
    probability: Int
    expectedClose: String
    contactId: ID!
    assignedToId: ID
  }

  input ActivityInput {
    type: ActivityType!
    description: String!
    contactId: ID
    dealId: ID
  }

  type Query {
    me: User
    users: [User!]!
    contacts(search: String, status: ContactStatus, assignedToId: ID): [Contact!]!
    contact(id: ID!): Contact
    deals(stage: DealStage, assignedToId: ID): [Deal!]!
    deal(id: ID!): Deal
    dashboardStats: DashboardStats!
    activities(contactId: ID, dealId: ID, limit: Int): [Activity!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createContact(input: ContactInput!): Contact!
    updateContact(id: ID!, input: ContactInput!): Contact!
    deleteContact(id: ID!): Boolean!
    createDeal(input: DealInput!): Deal!
    updateDeal(id: ID!, input: DealInput!): Deal!
    deleteDeal(id: ID!): Boolean!
    moveDeal(id: ID!, stage: DealStage!): Deal!
    addActivity(input: ActivityInput!): Activity!
  }

  type Subscription {
    dealMoved: Deal!
    contactUpdated: Contact!
    activityAdded: Activity!
  }
`;
