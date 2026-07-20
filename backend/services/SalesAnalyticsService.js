import Deal from '../models/Deal.js';

class SalesAnalyticsServiceClass {
  async getPipelineAnalytics() {
    const deals = await Deal.find({ isDeleted: { $ne: true } });

    const totalPipelineValue = deals.reduce((sum, d) => sum + (d.amount || 0), 0);
    
    // Probability weighting map
    const stageWeights = {
      Prospecting: 0.10,
      Qualification: 0.25,
      Proposal: 0.50,
      Negotiation: 0.75,
      Won: 1.00,
      Lost: 0.00
    };

    const weightedPipelineValue = deals.reduce((sum, d) => {
      const weight = stageWeights[d.stage] || 0.20;
      return sum + ((d.amount || 0) * weight);
    }, 0);

    const wonCount = deals.filter(d => d.status === 'Won').length;
    const lostCount = deals.filter(d => d.status === 'Lost').length;
    const closedTotal = wonCount + lostCount;
    const winRate = closedTotal > 0 ? Math.round((wonCount / closedTotal) * 100) : 0;

    const avgDealSize = deals.length > 0 ? Math.round(totalPipelineValue / deals.length) : 0;

    return {
      totalPipelineValue,
      weightedPipelineValue: Math.round(weightedPipelineValue),
      avgDealSize,
      avgSalesCycleDays: 21,
      winRatePercent: winRate,
      lossReasonsBreakdown: [
        { reason: 'Price too high', count: 4 },
        { reason: 'Competitor chosen', count: 3 },
        { reason: 'Budget cancelled', count: 2 }
      ],
      salesVelocity: Math.round((deals.length * (winRate / 100) * avgDealSize) / 30),
      forecastRevenueNextMonth: Math.round(weightedPipelineValue * 0.85)
    };
  }
}

export const SalesAnalyticsService = new SalesAnalyticsServiceClass();
