// Implemented by Category and Helper Administration.
// The workflow never reads those tables directly (ADR-001).
export interface CategoryCatalog {
  // Null when the category does not exist or is not approved (BR-D1).
  approvedCategoryPrice(categoryId: number): Promise<number | null>;
}
