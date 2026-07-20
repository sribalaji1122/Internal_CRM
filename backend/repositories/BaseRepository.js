export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  // Find all documents with optional filter, projection, sorting, and pagination
  async findAll({ query = {}, select = '', sort = '-createdAt', skip = 0, limit = 10, populate = [] }) {
    const finalQuery = { isDeleted: { $ne: true }, ...query };
    let reqQuery = this.model.find(finalQuery).select(select).sort(sort).skip(skip).limit(limit);

    populate.forEach(p => {
      reqQuery = reqQuery.populate(p);
    });

    return await reqQuery;
  }

  // Count documents
  async count(query = {}) {
    const finalQuery = { isDeleted: { $ne: true }, ...query };
    return await this.model.countDocuments(finalQuery);
  }

  // Find by ID
  async findById(id, populate = [], select = '') {
    let reqQuery = this.model.findOne({ _id: id, isDeleted: { $ne: true } }).select(select);
    populate.forEach(p => {
      reqQuery = reqQuery.populate(p);
    });
    return await reqQuery;
  }

  // Create new document
  async create(data) {
    return await this.model.create(data);
  }

  // Update by ID
  async updateById(id, data, options = { new: true, runValidators: true }) {
    return await this.model.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      data,
      options
    );
  }

  // Soft delete by ID
  async softDelete(id, deletedBy = 'System User') {
    return await this.model.findOneAndUpdate(
      { _id: id },
      { isDeleted: true, deletedAt: new Date(), deletedBy },
      { new: true }
    );
  }

  // Hard delete by ID
  async deleteById(id) {
    return await this.model.findOneAndDelete({ _id: id });
  }
}
