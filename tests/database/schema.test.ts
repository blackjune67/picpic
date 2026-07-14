import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();
const migrationPath = resolve(
  repositoryRoot,
  "supabase/migrations/20260714000000_create_catalog.sql",
);
const seedPath = resolve(repositoryRoot, "supabase/seed.sql");
const configPath = resolve(repositoryRoot, "supabase/config.toml");
const typesPath = resolve(repositoryRoot, "types/database.types.ts");

const readAsset = (path: string): string =>
  existsSync(path) ? readFileSync(path, "utf8") : "";

const migration = readAsset(migrationPath);
const seed = readAsset(seedPath);
const config = readAsset(configPath);
const databaseTypes = readAsset(typesPath);

const tableNames: readonly string[] = [
  "channels",
  "series",
  "episodes",
  "restaurants",
  "regions",
  "appearances",
  "external_places",
];

describe("local Supabase catalog contract", () => {
  it("ships the local config, migration, seed, and type surface", () => {
    // Given: the repository's local database contract paths
    // When: each required artifact is inspected
    // Then: every todo 3 artifact exists
    expect(existsSync(configPath)).toBe(true);
    expect(existsSync(migrationPath)).toBe(true);
    expect(existsSync(seedPath)).toBe(true);
    expect(existsSync(typesPath)).toBe(true);
  });

  it("declares the normalized tables and foreign-key graph", () => {
    // Given: the local catalog migration
    // When: its table declarations and references are inspected
    // Then: the approved normalized model is present
    for (const tableName of tableNames) {
      expect(migration).toMatch(
        new RegExp(`create table public\\.${tableName}\\s*\\(`, "i"),
      );
    }

    expect(migration).toMatch(
      /series_channel_id_fkey[\s\S]*references public\.channels/i,
    );
    expect(migration).toMatch(
      /episodes_series_id_fkey[\s\S]*references public\.series/i,
    );
    expect(migration).toMatch(
      /appearances_episode_id_fkey[\s\S]*references public\.episodes/i,
    );
    expect(migration).toMatch(
      /appearances_restaurant_id_fkey[\s\S]*references public\.restaurants/i,
    );
    expect(migration).toMatch(
      /restaurants_region_id_fkey[\s\S]*references public\.regions/i,
    );
    expect(migration).toMatch(
      /external_places_restaurant_id_fkey[\s\S]*references public\.restaurants/i,
    );
  });

  it("declares value, status, timestamp, and relationship constraints", () => {
    // Given: the normalized catalog tables
    // When: their named constraints are inspected
    // Then: invalid domain values have database-level rejection paths
    for (const tableName of [
      "channels",
      "series",
      "episodes",
      "restaurants",
      "regions",
    ]) {
      expect(migration).toContain(`${tableName}_slug_format`);
      expect(migration).toContain(`${tableName}_status_check`);
      expect(migration).toContain(`${tableName}_timestamps_check`);
    }

    expect(migration).toContain("episodes_youtube_video_id_format");
    expect(migration).toContain("episodes_youtube_video_id_key");
    expect(migration).toContain("restaurants_coordinates_check");
    expect(migration).toContain("external_places_coordinates_check");
    expect(migration).toContain("appearances_episode_order_check");
    expect(migration).toContain("appearances_episode_order_key");
    expect(migration).toContain("appearances_status_check");
    expect(migration).toContain("appearances_timestamps_check");
    expect(migration).toContain("external_places_status_check");
    expect(migration).toContain("external_places_timestamps_check");
    expect(migration).toMatch(
      /episodes_youtube_video_id_format[\s\S]*\^\[A-Za-z0-9_-\]\{11\}\$/i,
    );
    expect(migration).toMatch(
      /restaurants_coordinates_check[\s\S]*latitude between -90 and 90[\s\S]*longitude between -180 and 180/i,
    );
    expect(migration).toMatch(
      /external_places_coordinates_check[\s\S]*latitude between -90 and 90[\s\S]*longitude between -180 and 180/i,
    );
    expect(migration).toMatch(
      /episodes_youtube_video_id_key unique \(youtube_video_id\)/i,
    );
    expect(migration).toMatch(
      /appearances_episode_order_key unique \(episode_id, appearance_order\)/i,
    );

    for (const indexName of [
      "series_channel_id_idx",
      "episodes_series_id_idx",
      "episodes_published_at_idx",
      "restaurants_region_id_idx",
      "appearances_episode_id_idx",
      "appearances_restaurant_id_idx",
      "external_places_restaurant_id_idx",
    ]) {
      expect(migration).toContain(indexName);
    }
  });

  it("keeps the seed deterministic and proves shared restaurant provenance", () => {
    // Given: the deterministic local seed
    // When: its fixture identifiers and provenance rows are inspected
    // Then: two channels can share one canonical restaurant
    expect(seed).toContain("2026-07-14 00:00:00+00");
    expect(seed).toContain("'ttg'");
    expect(seed).toContain("'future-kitchen'");
    expect(seed).toContain("'Golden Noodle'");
    expect(seed).toContain("'dQw4w9WgXcQ'");
    expect(seed).toMatch(
      /'00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000401', 1, 'verified'/i,
    );
    expect(seed).toMatch(
      /'00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000401', 1, 'verified'/i,
    );
  });

  it("keeps the hand-maintained type surface aligned with every table", () => {
    // Given: the hand-maintained replacement for CLI-generated database types
    // When: its exported public schema is inspected
    // Then: all catalog tables are represented without unsafe escapes
    expect(databaseTypes).toContain("export type Database");
    for (const tableName of tableNames) {
      expect(databaseTypes).toContain(`${tableName}: {`);
    }
    expect(databaseTypes).not.toMatch(/:\s*any\b/);
    expect(databaseTypes).not.toContain(" as ");
  });

  it("keeps the project local-only in Supabase configuration", () => {
    // Given: the local Supabase configuration
    // When: its project settings are inspected
    // Then: it names the local project without remote-link commands or URLs
    expect(config).toContain('project_id = "picpic"');
    expect(config).not.toMatch(/https?:\/\//i);
  });
});
