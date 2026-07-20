import { ProductVariantRepository } from '../repositories/ProductVariantRepository.js';
import { ProductVariantDTO } from '../dtos/ProductVariantDTO.js';

class ProductVariantServiceClass {
  async getVariantsByProductId(productId) {
    const list = await ProductVariantRepository.findByProductId(productId);
    return ProductVariantDTO.transformList(list);
  }

  async createVariant(data) {
    const created = await ProductVariantRepository.create(data);
    return ProductVariantDTO.transform(created);
  }

  async updateVariant(id, data) {
    const updated = await ProductVariantRepository.updateById(id, data);
    return ProductVariantDTO.transform(updated);
  }

  async deleteVariant(id) {
    return await ProductVariantRepository.deleteById(id);
  }
}

export const ProductVariantService = new ProductVariantServiceClass();
