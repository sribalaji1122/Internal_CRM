import { CompanyRepository } from '../repositories/CompanyRepository.js';
import { CompanyDTO } from '../dtos/CompanyDTO.js';
import { WorkflowEngine } from '../workflows/workflowEngine.js';
import { ACTIVITY_TYPES } from '../constants/activityTypes.js';

class CompanyServiceClass {
  async getAllCompanies({ search, industry, tier, status, page = 1, limit = 10, sort = '-createdAt' }) {
    const query = {};
    if (industry && industry !== 'ALL') query.industry = industry;
    if (tier && tier !== 'ALL') query.tier = tier;
    if (status && status !== 'ALL') query.status = status;

    let companies;
    let total;

    if (search) {
      companies = await CompanyRepository.searchCompanies(search, query);
      total = companies.length;
    } else {
      const skip = (page - 1) * limit;
      companies = await CompanyRepository.findAll({ query, sort, skip, limit });
      total = await CompanyRepository.count(query);
    }

    return {
      companies: CompanyDTO.transformMany(companies),
      pagination: {
        totalRecords: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        recordsPerPage: limit
      }
    };
  }

  async getCompanyById(id) {
    const company = await CompanyRepository.findById(id);
    if (!company) throw new Error(`Company not found with ID: ${id}`);
    return CompanyDTO.transform(company);
  }

  async createCompany(data) {
    const company = await CompanyRepository.create(data);

    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.COMPANY_CREATED, {
      entityType: 'Company',
      entityId: company._id,
      description: `Company "${company.companyName}" profile created.`,
      notificationTitle: 'New Company Added'
    });

    return CompanyDTO.transform(company);
  }

  async updateCompany(id, data) {
    const company = await CompanyRepository.updateById(id, data);
    if (!company) throw new Error(`Company not found with ID: ${id}`);

    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.COMPANY_UPDATED, {
      entityType: 'Company',
      entityId: company._id,
      description: `Company "${company.companyName}" details updated.`
    });

    return CompanyDTO.transform(company);
  }

  async deleteCompany(id, user = 'System User') {
    const company = await CompanyRepository.softDelete(id, user);
    if (!company) throw new Error(`Company not found with ID: ${id}`);

    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.COMPANY_DELETED, {
      entityType: 'Company',
      entityId: id,
      description: `Company ID ${id} was deleted.`
    });

    return true;
  }
}

export const CompanyService = new CompanyServiceClass();
