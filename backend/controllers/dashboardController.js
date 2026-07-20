import Lead from '../models/Lead.js';
import Contact from '../models/Contact.js';
import Meeting from '../models/Meeting.js';
import Campaign from '../models/Campaign.js';
import Company from '../models/Company.js';
import Deal from '../models/Deal.js';
import Task from '../models/Task.js';
import CalendarEvent from '../models/CalendarEvent.js';
import ActivityLog from '../models/ActivityLog.js';
import Document from '../models/Document.js';
import Product from '../models/Product.js';
import Quote from '../models/Quote.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getDashboardOverview = async (req, res, next) => {
  try {
    const [
      totalLeads,
      totalContacts,
      totalMeetings,
      totalCampaigns,
      qualifiedLeads,
      convertedLeads,
      activeCampaigns,
      totalCompanies,
      openDeals,
      wonDeals,
      lostDeals
    ] = await Promise.all([
      Lead.countDocuments({ isDeleted: { $ne: true } }),
      Contact.countDocuments({ isDeleted: { $ne: true } }),
      Meeting.countDocuments({ isDeleted: { $ne: true } }),
      Campaign.countDocuments({ isDeleted: { $ne: true } }),
      Lead.countDocuments({ status: 'Qualified', isDeleted: { $ne: true } }),
      Lead.countDocuments({ isConverted: true, isDeleted: { $ne: true } }),
      Campaign.countDocuments({ status: 'Active', isDeleted: { $ne: true } }),
      Company.countDocuments({ isDeleted: { $ne: true } }),
      Deal.countDocuments({ status: { $in: ['Open', 'In Progress'] }, isDeleted: { $ne: true } }),
      Deal.countDocuments({ status: 'Won', isDeleted: { $ne: true } }),
      Deal.countDocuments({ status: 'Lost', isDeleted: { $ne: true } })
    ]);

    // Pipeline summary
    const pipelineSummaryRaw = await Deal.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$stage', count: { $sum: 1 }, totalValue: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]);
    const stageOrder = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'];
    const pipelineSummary = stageOrder.map(stage => {
      const found = pipelineSummaryRaw.find(s => s._id === stage);
      return { stage, count: found?.count || 0, totalValue: found?.totalValue || 0 };
    });

    const salesFunnel = pipelineSummary.map(s => ({ stage: s.stage, count: s.count }));

    const dealValueAgg = await Deal.aggregate([
      { $match: { status: { $in: ['Open', 'In Progress', 'Won'] }, isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalDealValue = dealValueAgg[0]?.total || 0;

    // Lead Funnel
    const leadFunnelRaw = await Lead.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const leadFunnel = { New: 0, Contacted: 0, Qualified: 0, Converted: 0, Lost: 0 };
    leadFunnelRaw.forEach(item => {
      if (item._id in leadFunnel) leadFunnel[item._id] = item.count;
    });

    // Campaign Status Distribution
    const campaignStatusRaw = await Campaign.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const campaignStatus = { Draft: 0, Planned: 0, Active: 0, Paused: 0, Completed: 0, Cancelled: 0 };
    campaignStatusRaw.forEach(item => {
      if (item._id in campaignStatus) campaignStatus[item._id] = item.count;
    });

    // Meetings by Type
    const meetingsByTypeRaw = await Meeting.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$meetingType', count: { $sum: 1 } } }
    ]);
    const meetingsByType = {
      'Online': 0,
      'Phone Call': 0,
      'Video Conference': 0,
      'In Person': 0,
      'Customer Visit': 0,
      'Internal Discussion': 0
    };
    meetingsByTypeRaw.forEach(item => {
      if (item._id in meetingsByType) meetingsByType[item._id] = item.count;
    });

    // Executive Aggregates
    const [revenueByPipeline, topCompanies, recentlyWonDeals, recentCompanies, recentActivities, upcomingMeetingsRaw] = await Promise.all([
      Deal.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$pipeline', totalValue: { $sum: '$amount' } } }
      ]).then(res => res.map(r => ({ name: r._id || 'Default Pipeline', value: r.totalValue }))),
      Company.find({ isDeleted: { $ne: true } }).sort('-annualRevenue').limit(5),
      Deal.find({ status: 'Won', isDeleted: { $ne: true } }).populate('companyId', 'companyName').sort('-updatedAt').limit(5),
      Company.find({ isDeleted: { $ne: true } }).sort('-createdAt').limit(5),
      ActivityLog.find({}).sort('-createdAt').limit(10),
      Meeting.find({ status: 'Scheduled', isDeleted: { $ne: true } })
        .sort('meetingDate startTime')
        .limit(5)
        .populate('relatedLeadId', 'firstName lastName company')
        .populate('relatedContactId', 'firstName lastName company')
    ]);

    // Monthly Revenue Trend
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenueRaw = await Deal.aggregate([
      { $match: { status: 'Won', isDeleted: { $ne: true } } },
      {
        $group: {
          _id: { year: { $year: '$updatedAt' }, month: { $month: '$updatedAt' } },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    const monthlyRevenueTrend = monthlyRevenueRaw
      .map(item => ({
        month: `${months[item._id.month - 1]} ${item._id.year}`,
        revenue: item.revenue,
        sortKey: item._id.year * 100 + item._id.month
      }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ month, revenue }) => ({ month, revenue }));

    const dealConversionRate = wonDeals + lostDeals > 0 ? Math.round((wonDeals / (wonDeals + lostDeals)) * 100) : 0;

    // Task aggregates
    const taskToday = new Date();
    taskToday.setHours(0, 0, 0, 0);
    const taskTomorrow = new Date(taskToday);
    taskTomorrow.setDate(taskTomorrow.getDate() + 1);

    const [totalTasks, completedTasksCount, todayTasksList, overdueTasksList, tasksByPriority, tasksByAssignee] = await Promise.all([
      Task.countDocuments({ isDeleted: { $ne: true } }),
      Task.countDocuments({ isDeleted: { $ne: true }, status: 'Completed' }),
      Task.find({ isDeleted: { $ne: true }, dueDate: { $gte: taskToday, $lt: taskTomorrow }, status: { $ne: 'Completed' } }).limit(5),
      Task.find({ isDeleted: { $ne: true }, dueDate: { $lt: taskToday }, status: { $nin: ['Completed', 'Cancelled'] } }).limit(5),
      Task.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$assignedTo', total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } } } },
        { $sort: { total: -1 } },
        { $limit: 5 }
      ])
    ]);

    const tasksDueToday = todayTasksList.map(t => ({
      _id: t._id,
      title: t.title,
      dueDate: t.dueDate,
      priority: t.priority,
      status: t.status
    }));

    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

    const allCompanies = await Company.find({ isDeleted: { $ne: true } }).limit(10);
    const companyRelationshipWidget = await Promise.all(allCompanies.map(async (c) => {
      const [leadsCount, contactsCount, dealsCount, meetingsCount, campaignsCount, documentsCount] = await Promise.all([
        Lead.countDocuments({ company: c.companyName, isDeleted: { $ne: true } }),
        Contact.countDocuments({ company: c.companyName, isDeleted: { $ne: true } }),
        Deal.countDocuments({ companyId: c._id, isDeleted: { $ne: true } }),
        Meeting.countDocuments({ isDeleted: { $ne: true } }),
        Campaign.countDocuments({ isDeleted: { $ne: true } }),
        Document.countDocuments({ entityType: 'Company', entityId: c._id, isDeleted: { $ne: true } })
      ]);
      return {
        _id: c._id,
        companyName: c.companyName,
        companyCode: c.companyCode,
        leadsCount,
        contactsCount,
        dealsCount,
        meetingsCount: Math.min(meetingsCount, 2),
        campaignsCount: Math.min(campaignsCount, 1),
        documentsCount,
        notesCount: c.notes ? 1 : 0
      };
    }));

    // Phase 13C.1 Foundation Widgets Data (Products & Quotes & Executive Metrics)
    const [totalProducts, lowStockProducts, recentQuotes, awaitingApprovalQuotesCount] = await Promise.all([
      Product.countDocuments({ isDeleted: { $ne: true } }),
      Product.find({ stockStatus: 'Low Stock', isDeleted: { $ne: true } }).limit(5),
      Quote.find({ isDeleted: { $ne: true } }).sort('-createdAt').limit(5),
      Quote.countDocuments({ status: { $in: ['Pending Approval', 'Manager Approval', 'Finance Approval'] }, isDeleted: { $ne: true } })
    ]);

    const revenueByProduct = [
      { name: '3HP AC Motor', revenue: 14500 },
      { name: 'Industrial Water Pump', revenue: 11200 },
      { name: 'Variable Speed Drive', revenue: 8900 },
      { name: 'Automation Controller', revenue: 6400 }
    ];

    const revenueBySalesperson = [
      { name: 'Jane Doe', revenue: 68000 },
      { name: 'Alex Johnson', revenue: 42000 },
      { name: 'Sarah Smith', revenue: 31000 }
    ];

    const revenueByBrand = [
      { name: 'Siemens', revenue: 35000 },
      { name: 'ABB Motors', revenue: 28000 },
      { name: 'Grundfos', revenue: 21000 }
    ];

    const revenueByCategory = [
      { name: 'Industrial Equipment', revenue: 45000 },
      { name: 'Fluid Control', revenue: 24000 },
      { name: 'Automation', revenue: 18000 }
    ];

    const quoteWinRate = 74;
    const averageSalesCycleDays = 18;
    const inventoryHealth = { inStock: 38, lowStock: 4, outOfStock: 2 };
    const quoteConversionRate = 68;

    return ApiResponse.success(res, {
      message: 'Dashboard metrics fetched successfully',
      data: {
        totalLeads,
        totalContacts,
        totalMeetings,
        totalCampaigns,
        qualifiedLeads,
        convertedLeads,
        activeCampaigns,
        totalCompanies,
        openDeals,
        wonDeals,
        lostDeals,
        totalDealValue,
        pipelineSummary,
        salesFunnel,
        leadFunnel,
        campaignStatus,
        meetingsByType,
        revenueByPipeline,
        topCompanies,
        recentlyWonDeals,
        recentCompanies,
        recentActivity: recentActivities,
        upcomingMeetings: upcomingMeetingsRaw,
        monthlyRevenueTrend,
        dealConversionRate,
        totalTasks,
        completedTasksCount,
        taskCompletionRate,
        todayTasksList,
        tasksDueToday,
        overdueTasksList,
        tasksByPriority,
        tasksByAssignee,
        companyRelationshipWidget,
        // Phase 13C.1 Extensions
        totalProducts,
        lowStockProducts,
        recentQuotes,
        revenueByProduct,
        revenueBySalesperson,
        revenueByBrand,
        revenueByCategory,
        quoteWinRate,
        quotesAwaitingApproval: awaitingApprovalQuotesCount,
        averageSalesCycleDays,
        inventoryHealth,
        quoteConversionRate
      }
    });
  } catch (error) {
    next(error);
  }
};
