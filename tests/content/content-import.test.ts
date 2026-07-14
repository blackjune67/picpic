import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  formatValidationIssues,
  parseEditorialImport,
  upsertEditorialCatalog,
  validateEditorialImport,
  type EditorialCatalog,
} from "../../lib/content";

const catalogPath = resolve(process.cwd(), "data/import/catalog.json");
const fixturePath = (name: string): string =>
  resolve(process.cwd(), "data/import/fixtures", name);

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, "utf8")) as unknown;
}

describe("editorial content import contract", () => {
  it("accepts the source-evidenced demo catalog and exposes one future-channel fixture", async () => {
    const input = await readJson(catalogPath);

    const result = validateEditorialImport(input);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.records).toHaveLength(21);
    expect(
      result.value.records.filter(
        (record) => record.verification.status === "verified",
      ),
    ).toHaveLength(0);
    expect(
      result.value.records.filter(
        (record) => record.verification.status === "future_channel_fixture",
      ),
    ).toHaveLength(1);
  });

  it.each([
    ["malformed-url.json", "invalid_source_url"],
    ["duplicate-slug.json", "duplicate_slug"],
    ["duplicate-appearance.json", "duplicate_appearance"],
    ["missing-evidence.json", "missing_source_evidence"],
    ["bad-coordinates.json", "invalid_coordinates"],
  ] as const)("rejects %s for the named reason", async (name, code) => {
    const input = await readJson(fixturePath(name));

    const result = validateEditorialImport(input);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((error) => error.code === code)).toBe(true);
    expect(formatValidationIssues(result.errors)).toContain(code);
  });

  it("parses a valid catalog at the trust boundary", async () => {
    const input = await readJson(catalogPath);

    const parsed = parseEditorialImport(input);

    expect(parsed.records[0]?.sourceEvidence.sourceUrl).toMatch(/^https:\/\//);
  });

  it("rejects non-http source schemes", () => {
    const input = {
      records: [{
        slug: "unsafe-url",
        channel: { slug: "ttg", name: "또간집", status: "active" },
        verification: { status: "sample_unverified" },
        appearance: { id: "unsafe-url-appearance", youtubeVideoId: "dQw4w9WgXcQ", episodeTitle: "테스트", publishedAt: "2025-01-01T00:00:00.000Z", visitOrder: 1 },
        sourceEvidence: { sourceUrl: "javascript:alert(1)", checkedAt: "2026-07-13T00:00:00.000Z" },
        curatedFields: { restaurantName: "테스트", address: "서울", district: "성수동", editorialNote: "테스트", coordinates: { latitude: 37, longitude: 127 }, media: { kind: "generated", credit: "fixture" } },
      }],
    };
    const result = validateEditorialImport(input);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((error) => error.code === "invalid_source_url")).toBe(true);
  });

  it("upserts idempotently while preserving existing curated fields", async () => {
    const input = await readJson(catalogPath);
    const parsed = parseEditorialImport(input);
    const existing: EditorialCatalog = {
      ...parsed,
      records: parsed.records.map((record, index) =>
        index === 0
          ? {
              ...record,
              curatedFields: {
                ...record.curatedFields,
                editorialNote: "editor-reviewed note",
              },
            }
          : record,
      ),
    };

    const once = upsertEditorialCatalog(existing, parsed);
    const twice = upsertEditorialCatalog(once, parsed);

    expect(once).toEqual(twice);
    expect(once.records[0]?.curatedFields.editorialNote).toBe(
      "editor-reviewed note",
    );
    expect(once.records).toHaveLength(21);
  });
});
