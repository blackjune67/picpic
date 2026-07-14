import { z } from "zod";

export const contentSlugSchema = z.string().regex(/^[a-z0-9-]+$/);

export const coordinatesSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
});

export const mediaAttributionSchema = z.object({
  kind: z.enum(["generated", "licensed"]),
  credit: z.string().min(1),
});

const httpUrlSchema = z.string().url().refine((value) => {
  try {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}, "sourceUrl must use http or https");

export const sourceEvidenceSchema = z.object({
  sourceUrl: httpUrlSchema,
  checkedAt: z.iso.datetime(),
});

const channelSchema = z.object({
  slug: contentSlugSchema,
  name: z.string().min(1),
  status: z.enum(["active", "future_fixture"]),
});

const verificationSchema = z.object({
  status: z.enum(["verified", "sample_unverified", "future_channel_fixture"]),
});

const appearanceSchema = z.object({
  id: contentSlugSchema,
  youtubeVideoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
  episodeTitle: z.string().min(1),
  publishedAt: z.iso.datetime(),
  visitOrder: z.number().int().positive(),
});

const curatedFieldsSchema = z.object({
  restaurantName: z.string().min(1),
  address: z.string().min(1),
  district: z.string().min(1),
  editorialNote: z.string().min(1),
  coordinates: coordinatesSchema,
  media: mediaAttributionSchema,
});

export const editorialRecordSchema = z.object({
  slug: contentSlugSchema,
  channel: channelSchema,
  verification: verificationSchema,
  appearance: appearanceSchema,
  sourceEvidence: sourceEvidenceSchema,
  curatedFields: curatedFieldsSchema,
});

export const editorialImportSchema = z.object({
  records: z.array(editorialRecordSchema).min(1),
});

export const EditorialImportSchema = editorialImportSchema;

export type Coordinates = z.infer<typeof coordinatesSchema>;
export type MediaAttribution = z.infer<typeof mediaAttributionSchema>;
export type SourceEvidence = z.infer<typeof sourceEvidenceSchema>;
export type EditorialRecord = z.infer<typeof editorialRecordSchema>;
export type EditorialImport = z.infer<typeof editorialImportSchema>;
export type EditorialCatalog = EditorialImport;
