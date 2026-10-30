import { Pool } from "pg";
import { CategoryCatalog, HelperDirectory } from "../interfaces-or-ports";

// Category and Helper Administration module: the only code that reads
// errand_category and helper (ADR-001 module ownership).
export class PgAdministration implements CategoryCatalog, HelperDirectory {
  constructor(private pool: Pool) {}

  async approvedCategoryPrice(categoryId: number): Promise<number | null> {
    const r = await this.pool.query(
      "SELECT standard_price FROM errand_category WHERE category_id=$1 AND approved", [categoryId]);
    return r.rows[0] ? r.rows[0].standard_price : null;
  }

  async availableHelpers(): Promise<number[]> {
    const r = await this.pool.query("SELECT helper_id FROM helper WHERE available ORDER BY helper_id");
    return r.rows.map(x => x.helper_id);
  }
}
