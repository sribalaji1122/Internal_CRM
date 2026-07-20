import { DealItemRepository } from '../repositories/DealItemRepository.js';

class DealItemServiceClass {
  async getItemsByDealId(dealId) {
    return await DealItemRepository.findByDealId(dealId);
  }

  async createDealItem(data) {
    return await DealItemRepository.create(data);
  }

  async updateDealItem(id, data) {
    return await DealItemRepository.updateById(id, data);
  }

  async deleteDealItem(id) {
    return await DealItemRepository.deleteById(id);
  }
}

export const DealItemService = new DealItemServiceClass();
