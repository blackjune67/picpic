import { z } from "zod";
import {
  editorialImportSchema,
  type EditorialImport,
  type EditorialRecord,
} from "./schema";

export type ContentValidationCode =
  | "schema_invalid"
  | "invalid_source_url"
  | "invalid_coordinates"
  | "missing_source_evidence"
  | "duplicate_slug"
  | "duplicate_appearance"
  | "future_channel_mismatch";

export type ContentValidationIssue = {
  readonly code: ContentValidationCode;
  readonly path: string;
  readonly message: string;
};

export type ContentValidationResult =
  | { readonly ok: true; readonly value: EditorialImport }
  | { readonly ok: false; readonly errors: readonly ContentValidationIssue[] };

export type EditorialSummary = {
  readonly recordCount: number;
  readonly verifiedRecordCount: number;
  readonly futureFixtureCount: number;
};

function formatPath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((result, part) => {
    if (typeof part === "number") return `${result}[${part}]`;
    const label = typeof part === "symbol" ? part.description ?? "symbol" : String(part);
    return result.length === 0 ? label : `${result}.${label}`;
  }, "");
}

function issueCode(issue: z.core.$ZodIssue): ContentValidationCode {
  const path = formatPath(issue.path);
  if (path.endsWith("sourceUrl")) return "invalid_source_url";
  if (
    path.endsWith("latitude") ||
    path.endsWith("longitude") ||
    path.endsWith("coordinates")
  ) {
    return "invalid_coordinates";
  }
  if (path.endsWith("sourceEvidence")) return "missing_source_evidence";
  return "schema_invalid";
}

function schemaIssues(error: z.ZodError): readonly ContentValidationIssue[] {
  return error.issues.map((issue) => ({
    code: issueCode(issue),
    path: formatPath(issue.path),
    message: issue.message,
  }));
}

function duplicateIssues(records: readonly EditorialRecord[]): readonly ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const seenSlugs = new Map<string, number>();
  const seenAppearances = new Map<string, number>();

  records.forEach((record, index) => {
    const previousSlugIndex = seenSlugs.get(record.slug);
    if (previousSlugIndex !== undefined) {
      issues.push({
        code: "duplicate_slug",
        path: `records[${index}].slug`,
        message: `slug already appears at records[${previousSlugIndex}].slug`,
      });
    } else {
      seenSlugs.set(record.slug, index);
    }

    const previousAppearanceIndex = seenAppearances.get(record.appearance.id);
    if (previousAppearanceIndex !== undefined) {
      issues.push({
        code: "duplicate_appearance",
        path: `records[${index}].appearance.id`,
        message: `appearance id already appears at records[${previousAppearanceIndex}].appearance.id`,
      });
    } else {
      seenAppearances.set(record.appearance.id, index);
    }

    const futureStatusMatches =
      record.verification.status === "future_channel_fixture" &&
      record.channel.status === "future_fixture";
    const activeStatusMatches =
      record.verification.status !== "future_channel_fixture" &&
      record.channel.status === "active";
    if (!futureStatusMatches && !activeStatusMatches) {
      issues.push({
        code: "future_channel_mismatch",
        path: `records[${index}]`,
        message:
          "future_channel_fixture records require a future_fixture channel and active records require an active channel",
      });
    }
  });

  return issues;
}

export function validateEditorialImport(input: unknown): ContentValidationResult {
  const parsed = editorialImportSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: [...schemaIssues(parsed.error)].sort((left, right) =>
        `${left.path}:${left.code}`.localeCompare(`${right.path}:${right.code}`),
      ),
    };
  }

  const errors = [...duplicateIssues(parsed.data.records)].sort((left, right) =>
    `${left.path}:${left.code}`.localeCompare(`${right.path}:${right.code}`),
  );
  return errors.length === 0
    ? { ok: true, value: parsed.data }
    : { ok: false, errors };
}

export function parseEditorialImport(input: unknown): EditorialImport {
  const result = validateEditorialImport(input);
  if (result.ok) return result.value;
  throw new ContentImportValidationError(result.errors);
}

export function summarizeEditorialImport(
  catalog: EditorialImport,
): EditorialSummary {
  return {
    recordCount: catalog.records.length,
    verifiedRecordCount: catalog.records.filter(
      (record) => record.verification.status === "verified",
    ).length,
    futureFixtureCount: catalog.records.filter(
      (record) => record.verification.status === "future_channel_fixture",
    ).length,
  };
}

export function formatValidationIssues(
  errors: readonly ContentValidationIssue[],
): string {
  return errors
    .map((error) => `${error.code} at ${error.path}: ${error.message}`)
    .join("\n");
}

export class ContentImportValidationError extends Error {
  readonly name = "ContentImportValidationError";

  constructor(readonly errors: readonly ContentValidationIssue[]) {
    super(formatValidationIssues(errors));
  }
}
