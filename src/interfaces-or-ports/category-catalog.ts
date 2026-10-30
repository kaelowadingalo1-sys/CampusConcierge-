// Implemented by Category and Helper Administration.
// The workflow never reads those tables directly (ADR-001).
export interface CategoryCatalog {
  isApproved(categoryId: number): Promise<boolean>;
  standardPrice(categoryId: number): Promise<number>;
}
