import type { EditorialCatalog, EditorialRecord } from "./schema";

function mergeRecord(
  incoming: EditorialRecord,
  existing: EditorialRecord | undefined,
): EditorialRecord {
  if (existing === undefined) return incoming;
  return {
    ...incoming,
    curatedFields: existing.curatedFields,
  };
}

export function upsertEditorialCatalog(
  existing: EditorialCatalog | null,
  incoming: EditorialCatalog,
): EditorialCatalog {
  const recordsBySlug = new Map<string, EditorialRecord>();
  existing?.records.forEach((record) => recordsBySlug.set(record.slug, record));
  incoming.records.forEach((record) => {
    recordsBySlug.set(record.slug, mergeRecord(record, recordsBySlug.get(record.slug)));
  });

  return {
    ...incoming,
    records: [...recordsBySlug.values()],
  };
}
