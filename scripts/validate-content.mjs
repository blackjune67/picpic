import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const source = await readFile(resolve(process.cwd(), "data/import/catalog.json"), "utf8");
const input = JSON.parse(source);
const records = input.records;
if (!Array.isArray(records) || records.length !== 21) {
  throw new Error("catalog must contain exactly 21 records");
}
const appearanceIds = new Set();
for (const record of records) {
  let sourceUrl;
  try {
    sourceUrl = new URL(record.sourceEvidence?.sourceUrl);
  } catch {
    sourceUrl = null;
  }
  if (sourceUrl === null || !["http:", "https:"].includes(sourceUrl.protocol)) {
    throw new Error(`invalid_source_url at records.${record.slug}`);
  }
  const { latitude, longitude } = record.curatedFields.coordinates;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error(`invalid_coordinates at records.${record.slug}`);
  }
  if (appearanceIds.has(record.appearance.id)) {
    throw new Error(`duplicate_appearance at records.${record.slug}`);
  }
  appearanceIds.add(record.appearance.id);
}
const futureFixtureCount = records.filter((record) => record.verification.status === "future_channel_fixture").length;
console.log(`Validated ${records.length} records (${futureFixtureCount} future fixture).`);
