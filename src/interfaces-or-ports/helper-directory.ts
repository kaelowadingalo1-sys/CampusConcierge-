// Implemented by Category and Helper Administration.
export interface HelperDirectory {
  // Helpers who may be offered an errand now, in the order they should be tried.
  eligibleHelpers(categoryId: number): Promise<number[]>;
}
