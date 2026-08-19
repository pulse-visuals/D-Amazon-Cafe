import { CATEGORIES } from "./seed-data";

// Derived once at import time: product slug -> subgroup key (e.g. "coffee" / "refreshing-drinks").
// Subgroups exist only for display grouping within a category page; they are not stored in the DB.
export const SEED_SUBGROUP_BY_SLUG: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    if (!cat.subgroups) continue;
    for (const group of cat.subgroups) {
      for (const p of group.products) {
        map[p.slug] = group.key;
      }
    }
  }
  return map;
})();

export const SEED_SUBGROUP_LABELS: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    if (!cat.subgroups) continue;
    for (const group of cat.subgroups) {
      map[group.key] = group.label;
    }
  }
  return map;
})();
