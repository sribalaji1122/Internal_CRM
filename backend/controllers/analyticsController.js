import { SalesKpiService } from '../services/SalesKpiService.js';
import { SalesAnalyticsService } from '../services/SalesAnalyticsService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getAnalyticsKpis = async (req, res, next) => {
  try {
    const [kpis, analytics] = await Promise.all([
      SalesKpiService.calculateSalesKpis(),
      SalesAnalyticsService.getPipelineAnalytics()
    ]);

    return ApiResponse.success(res, {
      data: {
        ...kpis,
        ...analytics
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getRoleDashboard = async (req, res, next) => {
  try {
    const role = req.params.role || 'CEO';

    const roleMetrics = {
      CEO: {
        roleName: 'CEO Executive Overview',
        kpis: [
          { title: 'Total Revenue', value: '$265,000', change: '+18.4%', trend: 'up' },
          { title: 'Gross Profit', value: '$184,000', change: '+14.2%', trend: 'up' },
          { title: 'Pipeline Value', value: '$420,000', change: '+22.0%', trend: 'up' },
          { title: 'Win Rate', value: '74%', change: '+5.1%', trend: 'up' }
        ],
        primaryChart: {
          title: 'Monthly Revenue vs Forecast',
          type: 'area',
          data: [
            { label: 'Jan', value: 24000, forecast: 22000 },
            { label: 'Feb', value: 32000, forecast: 30000 },
            { label: 'Mar', value: 28000, forecast: 32000 },
            { label: 'Apr', value: 45000, forecast: 40000 },
            { label: 'May', value: 52000, forecast: 48000 },
            { label: 'Jun', value: 68000, forecast: 60000 }
          ]
        }
      },
      'Sales Manager': {
        roleName: 'Sales Team Performance',
        kpis: [
          { title: 'Deals Won', value: '15 Deals', change: '+3 this week', trend: 'up' },
          { title: 'Avg Sales Cycle', value: '18 Days', change: '-2 days', trend: 'up' },
          { title: 'Quotes Pending Approval', value: '3 Quotes', change: 'Action Req.', trend: 'neutral' },
          { title: 'Sales Velocity', value: '$14,200/day', change: '+12%', trend: 'up' }
        ],
        primaryChart: {
          title: 'Revenue by Sales Rep',
          type: 'bar',
          data: [
            { label: 'Jane Doe', value: 68000 },
            { label: 'Alex Johnson', value: 42000 },
            { label: 'Sarah Smith', value: 31000 }
          ]
        }
      },
      'Inventory Manager': {
        roleName: 'Inventory & Warehouse Operations',
        kpis: [
          { title: 'Inventory Valuation', value: '$345,000', change: 'Balanced', trend: 'neutral' },
          { title: 'Low Stock Items', value: '4 Items', change: 'Reorder Req.', trend: 'down' },
          { title: 'Out of Stock Items', value: '2 Items', change: 'Critical', trend: 'down' },
          { title: 'Inventory Turnover', value: '4.2x', change: '+0.4x', trend: 'up' }
        ],
        primaryChart: {
          title: 'Stock Balances by Category',
          type: 'donut',
          data: [
            { label: 'Industrial Motors', value: 145 },
            { label: 'Fluid Control', value: 82 },
            { label: 'Automation', value: 64 }
          ]
        }
      },
      Finance: {
        roleName: 'Commercial & Financial Control',
        kpis: [
          { title: 'Profit Margin %', value: '34.5%', change: '+2.1%', trend: 'up' },
          { title: 'Total Tax Collected', value: '$47,700', change: 'Compliant', trend: 'neutral' },
          { title: 'Quotes Awaiting Finance Approval', value: '1 Quote', change: '$50k+ Tier', trend: 'neutral' },
          { title: 'Average Order Value', value: '$29,800', change: '+8.4%', trend: 'up' }
        ],
        primaryChart: {
          title: 'Revenue & Tax Breakdown',
          type: 'stacked',
          data: [
            { label: 'Q1', revenue: 84000, tax: 15120 },
            { label: 'Q2', revenue: 165000, tax: 29700 }
          ]
        }
      },
      Support: {
        roleName: 'Customer Success & Support',
        kpis: [
          { title: 'Active Accounts', value: '48 Companies', change: '+6', trend: 'up' },
          { title: 'Avg Response Time', value: '3.5 Hours', change: '-1.2 hrs', trend: 'up' },
          { title: 'Customer Satisfaction', value: '98.2%', change: '+1.4%', trend: 'up' },
          { title: 'Retention Rate', value: '96%', change: 'Stable', trend: 'neutral' }
        ],
        primaryChart: {
          title: 'Customer Growth & Tickets',
          type: 'line',
          data: [
            { label: 'Jan', value: 38 },
            { label: 'Feb', value: 41 },
            { label: 'Mar', value: 44 },
            { label: 'Apr', value: 48 }
          ]
        }
      }
    };

    return ApiResponse.success(res, {
      data: roleMetrics[role] || roleMetrics.CEO
    });
  } catch (err) {
    next(err);
  }
};

export const getForecasts = async (req, res, next) => {
  try {
    return ApiResponse.success(res, {
      data: {
        revenueForecastNextQuarter: 320000,
        salesForecastNextQuarter: 42,
        inventoryDepletionDays: 45,
        pipelineWinForecast: 285000,
        forecastConfidenceScore: '89%'
      }
    });
  } catch (err) {
    next(err);
  }
};
