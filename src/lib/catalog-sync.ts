/**
 * Hook for future WhatsApp Business / Meta Commerce catalog sync.
 * Actions mark metaSyncStatus = PENDING and call these in after().
 */

export interface CatalogSyncProvider {
  upsertProduct(productId: string): Promise<void>;
  deactivateProduct(productId: string): Promise<void>;
  upsertCategory(categoryId: string): Promise<void>;
}

class NoopCatalogSyncProvider implements CatalogSyncProvider {
  async upsertProduct(_productId: string): Promise<void> {
    // Phase 2: Meta Graph API items_batch
  }

  async deactivateProduct(_productId: string): Promise<void> {
    // Phase 2
  }

  async upsertCategory(_categoryId: string): Promise<void> {
    // Phase 2
  }
}

export const catalogSync: CatalogSyncProvider = new NoopCatalogSyncProvider();
