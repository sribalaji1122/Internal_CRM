/**
 * Reusable Mongoose Filtering Engine
 */
export class FilterEngine {
  static buildMongoQuery(queryParams = {}) {
    const filter = { isDeleted: { $ne: true } };

    if (queryParams.status) {
      filter.status = queryParams.status;
    }
    if (queryParams.category) {
      filter.category = queryParams.category;
    }
    if (queryParams.brand) {
      filter.brand = queryParams.brand;
    }
    if (queryParams.owner) {
      filter.owner = queryParams.owner;
    }
    if (queryParams.companyId) {
      filter.companyId = queryParams.companyId;
    }
    if (queryParams.tags) {
      const tagList = queryParams.tags.split(',');
      filter.tags = { $in: tagList };
    }

    // Date Range Filter
    if (queryParams.startDate || queryParams.endDate) {
      filter.createdAt = {};
      if (queryParams.startDate) {
        filter.createdAt.$gte = new Date(queryParams.startDate);
      }
      if (queryParams.endDate) {
        filter.createdAt.$lte = new Date(queryParams.endDate);
      }
    }

    return filter;
  }
}
