export type Json =
  | string
  | number
  | boolean
  | null
  | { readonly [key: string]: Json | undefined }
  | readonly Json[];

export type Database = {
  readonly public: {
    readonly Tables: {
      readonly channels: {
        readonly Row: {
          readonly id: string;
          readonly slug: string;
          readonly name: string;
          readonly status: string;
          readonly created_at: string;
          readonly updated_at: string;
        };
        readonly Insert: {
          readonly id?: string;
          readonly slug: string;
          readonly name: string;
          readonly status?: string;
          readonly created_at?: string;
          readonly updated_at?: string;
        };
        readonly Update: {
          readonly id?: string;
          readonly slug?: string;
          readonly name?: string;
          readonly status?: string;
          readonly created_at?: string;
          readonly updated_at?: string;
        };
        readonly Relationships: readonly [];
      };
      readonly series: {
        readonly Row: {
          readonly id: string;
          readonly channel_id: string;
          readonly slug: string;
          readonly title: string;
          readonly status: string;
          readonly created_at: string;
          readonly updated_at: string;
        };
        readonly Insert: {
          readonly id?: string;
          readonly channel_id: string;
          readonly slug: string;
          readonly title: string;
          readonly status?: string;
          readonly created_at?: string;
          readonly updated_at?: string;
        };
        readonly Update: {
          readonly id?: string;
          readonly channel_id?: string;
          readonly slug?: string;
          readonly title?: string;
          readonly status?: string;
          readonly created_at?: string;
          readonly updated_at?: string;
        };
        readonly Relationships: readonly [
          {
            readonly foreignKeyName: "series_channel_id_fkey";
            readonly columns: readonly ["channel_id"];
            readonly isOneToOne: false;
            readonly referencedRelation: "channels";
            readonly referencedColumns: readonly ["id"];
          },
        ];
      };
      readonly episodes: {
        readonly Row: {
          readonly id: string;
          readonly series_id: string;
          readonly slug: string;
          readonly title: string;
          readonly youtube_video_id: string;
          readonly published_at: string | null;
          readonly metadata_fetched_at: string | null;
          readonly status: string;
          readonly created_at: string;
          readonly updated_at: string;
        };
        readonly Insert: {
          readonly id?: string;
          readonly series_id: string;
          readonly slug: string;
          readonly title: string;
          readonly youtube_video_id: string;
          readonly published_at?: string | null;
          readonly metadata_fetched_at?: string | null;
          readonly status?: string;
          readonly created_at?: string;
          readonly updated_at?: string;
        };
        readonly Update: {
          readonly id?: string;
          readonly series_id?: string;
          readonly slug?: string;
          readonly title?: string;
          readonly youtube_video_id?: string;
          readonly published_at?: string | null;
          readonly metadata_fetched_at?: string | null;
          readonly status?: string;
          readonly created_at?: string;
          readonly updated_at?: string;
        };
        readonly Relationships: readonly [
          {
            readonly foreignKeyName: "episodes_series_id_fkey";
            readonly columns: readonly ["series_id"];
            readonly isOneToOne: false;
            readonly referencedRelation: "series";
            readonly referencedColumns: readonly ["id"];
          },
        ];
      };
      readonly restaurants: {
        readonly Row: {
          readonly id: string;
          readonly region_id: string;
          readonly slug: string;
          readonly name: string;
          readonly branch_name: string | null;
          readonly address: string;
          readonly editorial_note: string | null;
          readonly latitude: number | null;
          readonly longitude: number | null;
          readonly status: string;
          readonly created_at: string;
          readonly updated_at: string;
        };
        readonly Insert: {
          readonly id?: string;
          readonly region_id: string;
          readonly slug: string;
          readonly name: string;
          readonly branch_name?: string | null;
          readonly address: string;
          readonly editorial_note?: string | null;
          readonly latitude?: number | null;
          readonly longitude?: number | null;
          readonly status?: string;
          readonly created_at?: string;
          readonly updated_at?: string;
        };
        readonly Update: {
          readonly id?: string;
          readonly region_id?: string;
          readonly slug?: string;
          readonly name?: string;
          readonly branch_name?: string | null;
          readonly address?: string;
          readonly editorial_note?: string | null;
          readonly latitude?: number | null;
          readonly longitude?: number | null;
          readonly status?: string;
          readonly created_at?: string;
          readonly updated_at?: string;
        };
        readonly Relationships: readonly [
          {
            readonly foreignKeyName: "restaurants_region_id_fkey";
            readonly columns: readonly ["region_id"];
            readonly isOneToOne: false;
            readonly referencedRelation: "regions";
            readonly referencedColumns: readonly ["id"];
          },
        ];
      };
      readonly regions: {
        readonly Row: {
          readonly id: string;
          readonly slug: string;
          readonly name: string;
          readonly status: string;
          readonly created_at: string;
          readonly updated_at: string;
        };
        readonly Insert: {
          readonly id?: string;
          readonly slug: string;
          readonly name: string;
          readonly status?: string;
          readonly created_at?: string;
          readonly updated_at?: string;
        };
        readonly Update: {
          readonly id?: string;
          readonly slug?: string;
          readonly name?: string;
          readonly status?: string;
          readonly created_at?: string;
          readonly updated_at?: string;
        };
        readonly Relationships: readonly [];
      };
      readonly appearances: {
        readonly Row: {
          readonly id: string;
          readonly episode_id: string;
          readonly restaurant_id: string;
          readonly appearance_order: number;
          readonly status: string;
          readonly created_at: string;
          readonly updated_at: string;
        };
        readonly Insert: {
          readonly id?: string;
          readonly episode_id: string;
          readonly restaurant_id: string;
          readonly appearance_order: number;
          readonly status?: string;
          readonly created_at?: string;
          readonly updated_at?: string;
        };
        readonly Update: {
          readonly id?: string;
          readonly episode_id?: string;
          readonly restaurant_id?: string;
          readonly appearance_order?: number;
          readonly status?: string;
          readonly created_at?: string;
          readonly updated_at?: string;
        };
        readonly Relationships: readonly [
          {
            readonly foreignKeyName: "appearances_episode_id_fkey";
            readonly columns: readonly ["episode_id"];
            readonly isOneToOne: false;
            readonly referencedRelation: "episodes";
            readonly referencedColumns: readonly ["id"];
          },
          {
            readonly foreignKeyName: "appearances_restaurant_id_fkey";
            readonly columns: readonly ["restaurant_id"];
            readonly isOneToOne: false;
            readonly referencedRelation: "restaurants";
            readonly referencedColumns: readonly ["id"];
          },
        ];
      };
      readonly external_places: {
        readonly Row: {
          readonly id: string;
          readonly restaurant_id: string;
          readonly provider: string;
          readonly external_id: string;
          readonly place_url: string | null;
          readonly latitude: number | null;
          readonly longitude: number | null;
          readonly status: string;
          readonly last_verified_at: string | null;
          readonly created_at: string;
          readonly updated_at: string;
        };
        readonly Insert: {
          readonly id?: string;
          readonly restaurant_id: string;
          readonly provider: string;
          readonly external_id: string;
          readonly place_url?: string | null;
          readonly latitude?: number | null;
          readonly longitude?: number | null;
          readonly status?: string;
          readonly last_verified_at?: string | null;
          readonly created_at?: string;
          readonly updated_at?: string;
        };
        readonly Update: {
          readonly id?: string;
          readonly restaurant_id?: string;
          readonly provider?: string;
          readonly external_id?: string;
          readonly place_url?: string | null;
          readonly latitude?: number | null;
          readonly longitude?: number | null;
          readonly status?: string;
          readonly last_verified_at?: string | null;
          readonly created_at?: string;
          readonly updated_at?: string;
        };
        readonly Relationships: readonly [
          {
            readonly foreignKeyName: "external_places_restaurant_id_fkey";
            readonly columns: readonly ["restaurant_id"];
            readonly isOneToOne: false;
            readonly referencedRelation: "restaurants";
            readonly referencedColumns: readonly ["id"];
          },
        ];
      };
    };
    readonly Views: Record<string, never>;
    readonly Functions: Record<string, never>;
    readonly Enums: Record<string, never>;
    readonly CompositeTypes: Record<string, never>;
  };
};

export type Tables<TableName extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][TableName]["Row"];

export type TablesInsert<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Insert"];

export type TablesUpdate<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Update"];
