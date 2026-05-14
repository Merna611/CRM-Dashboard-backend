import { Context, requireAuth } from '../../context';

export const dashboardResolvers = {
  Query: {
    dashboardStats: async (_: unknown, __: unknown, { user, prisma }: Context) => {
      requireAuth(user);

      const [totalContacts, allDeals] = await Promise.all([
        prisma.contact.count(),
        prisma.deal.findMany({ select: { value: true, stage: true, createdAt: true } }),
      ]);

      const wonDeals = allDeals.filter(d => d.stage === 'CLOSED_WON');
      const totalRevenue = wonDeals.reduce((sum, d) => sum + d.value, 0);
      const conversionRate = allDeals.length > 0 ? (wonDeals.length / allDeals.length) * 100 : 0;

      const stageMap = new Map<string, { count: number; value: number }>();
      for (const deal of allDeals) {
        const existing = stageMap.get(deal.stage) ?? { count: 0, value: 0 };
        stageMap.set(deal.stage, { count: existing.count + 1, value: existing.value + deal.value });
      }
      const pipelineByStage = Array.from(stageMap.entries()).map(([stage, data]) => ({ stage, ...data }));

      const monthMap = new Map<string, { revenue: number; deals: number }>();
      for (const deal of wonDeals) {
        const key = deal.createdAt.toISOString().slice(0, 7);
        const existing = monthMap.get(key) ?? { revenue: 0, deals: 0 };
        monthMap.set(key, { revenue: existing.revenue + deal.value, deals: existing.deals + 1 });
      }

      const now = new Date();
      const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const key = d.toISOString().slice(0, 7);
        const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        const data = monthMap.get(key) ?? { revenue: 0, deals: 0 };
        return { month: label, ...data };
      });

      return {
        totalContacts,
        totalDeals: allDeals.length,
        totalRevenue,
        wonDeals: wonDeals.length,
        conversionRate: Math.round(conversionRate * 10) / 10,
        pipelineByStage,
        revenueByMonth,
      };
    },
  },
};
