import { ContactService } from '../services/ContactService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getAllContacts = async (req, res, next) => {
  try {
    const { search, page, limit, sort } = req.query;
    const result = await ContactService.getAllContacts({
      search,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      sort
    });

    return ApiResponse.success(res, {
      message: 'Contacts fetched successfully',
      data: result.contacts,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const getContactById = async (req, res, next) => {
  try {
    const contact = await ContactService.getContactById(req.params.id);
    return ApiResponse.success(res, {
      message: 'Contact fetched successfully',
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const contact = await ContactService.createContact(req.body);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Contact created successfully',
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const contact = await ContactService.updateContact(req.params.id, req.body);
    return ApiResponse.success(res, {
      message: 'Contact updated successfully',
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    await ContactService.deleteContact(req.params.id);
    return ApiResponse.success(res, {
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteContacts = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return ApiResponse.error(res, { statusCode: 400, message: 'IDs list is required' });
    }
    for (const id of ids) {
      await ContactService.deleteContact(id);
    }
    return ApiResponse.success(res, { message: `${ids.length} Contacts deleted successfully` });
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateContacts = async (req, res, next) => {
  try {
    const { ids, owner, company } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return ApiResponse.error(res, { statusCode: 400, message: 'IDs list is required' });
    }
    const updates = {};
    if (owner) updates.owner = owner;
    if (company) updates.company = company;

    for (const id of ids) {
      await ContactService.updateContact(id, updates);
    }
    return ApiResponse.success(res, { message: `${ids.length} Contacts updated successfully` });
  } catch (error) {
    next(error);
  }
};

export const importContacts = async (req, res, next) => {
  try {
    const { contacts } = req.body;
    if (!contacts || !Array.isArray(contacts)) {
      return ApiResponse.error(res, { statusCode: 400, message: 'Contacts list is required' });
    }
    const created = [];
    for (const cData of contacts) {
      const contact = await ContactService.createContact(cData);
      created.push(contact);
    }
    return ApiResponse.success(res, { message: `${created.length} Contacts imported successfully` });
  } catch (error) {
    next(error);
  }
};
