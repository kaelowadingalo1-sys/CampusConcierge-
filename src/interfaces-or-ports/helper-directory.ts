// Implemented by Category and Helper Administration.
export interface HelperDirectory {
  // Ids of helpers who are registered and marked available, in a fixed order.
  availableHelpers(): Promise<number[]>;
}
