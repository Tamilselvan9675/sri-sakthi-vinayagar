import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE SCHEMA IF NOT EXISTS "payload";
   CREATE TYPE "payload"."_locales" AS ENUM('en', 'ta');
  CREATE TYPE "payload"."enum_users_role" AS ENUM('super_admin', 'admin', 'editor', 'finance_manager');
  CREATE TYPE "payload"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__pages_v_published_locale" AS ENUM('en', 'ta');
  CREATE TYPE "payload"."enum_festival_years_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__festival_years_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__festival_years_v_published_locale" AS ENUM('en', 'ta');
  CREATE TYPE "payload"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__events_v_published_locale" AS ENUM('en', 'ta');
  CREATE TYPE "payload"."enum_winners_prize_position" AS ENUM('1', '2', '3', 'special');
  CREATE TYPE "payload"."enum_winners_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__winners_v_version_prize_position" AS ENUM('1', '2', '3', 'special');
  CREATE TYPE "payload"."enum__winners_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__winners_v_published_locale" AS ENUM('en', 'ta');
  CREATE TYPE "payload"."enum_gallery_category" AS ENUM('first-day', 'last-day', 'games', 'vinayagar-statue');
  CREATE TYPE "payload"."enum_gallery_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__gallery_v_version_category" AS ENUM('first-day', 'last-day', 'games', 'vinayagar-statue');
  CREATE TYPE "payload"."enum__gallery_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__gallery_v_published_locale" AS ENUM('en', 'ta');
  CREATE TYPE "payload"."enum_videos_category" AS ENUM('festival', 'pooja', 'first-day', 'last-day', 'games', 'vinayagar');
  CREATE TYPE "payload"."enum_videos_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__videos_v_version_category" AS ENUM('festival', 'pooja', 'first-day', 'last-day', 'games', 'vinayagar');
  CREATE TYPE "payload"."enum__videos_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__videos_v_published_locale" AS ENUM('en', 'ta');
  CREATE TYPE "payload"."enum_expenses_type" AS ENUM('cash', 'in-kind');
  CREATE TYPE "payload"."enum_audit_logs_action" AS ENUM('create', 'update', 'delete');
  CREATE TABLE "payload"."users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "payload"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "payload"."enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar
  );
  
  CREATE TABLE "payload"."media_locales" (
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."temple_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"phone" varchar,
  	"whatsapp" varchar,
  	"email" varchar,
  	"latitude" numeric,
  	"longitude" numeric,
  	"upi_id" varchar,
  	"upi_qr_code_id" integer,
  	"logo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."temple_settings_locales" (
  	"temple_name" varchar NOT NULL,
  	"address" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."pages_blocks_image_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."pages_blocks_call_to_action" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"button_label" varchar,
  	"button_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"hero_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."pages_locales" (
  	"title" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."_pages_v_blocks_image_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."_pages_v_blocks_call_to_action" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"button_label" varchar,
  	"button_url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_hero_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_pages_v_locales" (
  	"version_title" varchar,
  	"version_heading" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."festival_years" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" numeric,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"label" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_festival_years_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."festival_years_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_festival_years_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_year" numeric,
  	"version_start_date" timestamp(3) with time zone,
  	"version_end_date" timestamp(3) with time zone,
  	"version_label" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__festival_years_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__festival_years_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_festival_years_v_locales" (
  	"version_title" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"festival_year_id" integer,
  	"legacy_id" varchar,
  	"date" timestamp(3) with time zone,
  	"time" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."events_locales" (
  	"name" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_festival_year_id" integer,
  	"version_legacy_id" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_time" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__events_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_events_v_locales" (
  	"version_name" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."winners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"festival_year_id" integer,
  	"legacy_id" varchar,
  	"winner_name" varchar,
  	"photo_id" integer,
  	"prize_position" "payload"."enum_winners_prize_position" DEFAULT '1',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_winners_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."winners_locales" (
  	"game_name" varchar,
  	"description" varchar,
  	"prize_details" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_winners_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_festival_year_id" integer,
  	"version_legacy_id" varchar,
  	"version_winner_name" varchar,
  	"version_photo_id" integer,
  	"version_prize_position" "payload"."enum__winners_v_version_prize_position" DEFAULT '1',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__winners_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__winners_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_winners_v_locales" (
  	"version_game_name" varchar,
  	"version_description" varchar,
  	"version_prize_details" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."gallery_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "payload"."gallery_photos_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."gallery" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"festival_year_id" integer,
  	"category" "payload"."enum_gallery_category",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_gallery_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."gallery_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_gallery_v_version_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_gallery_v_version_photos_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_gallery_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_festival_year_id" integer,
  	"version_category" "payload"."enum__gallery_v_version_category",
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__gallery_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__gallery_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_gallery_v_locales" (
  	"version_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."videos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"festival_year_id" integer,
  	"legacy_id" varchar,
  	"youtube_url" varchar,
  	"youtube_id" varchar,
  	"thumbnail_id" integer,
  	"category" "payload"."enum_videos_category",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_videos_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."videos_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_videos_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_festival_year_id" integer,
  	"version_legacy_id" varchar,
  	"version_youtube_url" varchar,
  	"version_youtube_id" varchar,
  	"version_thumbnail_id" integer,
  	"version_category" "payload"."enum__videos_v_version_category",
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__videos_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__videos_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_videos_v_locales" (
  	"version_title" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."donors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"festival_year_id" integer NOT NULL,
  	"legacy_id" varchar,
  	"donor_name" varchar NOT NULL,
  	"amount" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."donors_locales" (
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."expenses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"festival_year_id" integer NOT NULL,
  	"legacy_id" varchar,
  	"amount" numeric NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"responsible_person" varchar,
  	"type" "payload"."enum_expenses_type" DEFAULT 'cash' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."expenses_locales" (
  	"category" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."audit_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"action" "payload"."enum_audit_logs_action" NOT NULL,
  	"entity_type" varchar NOT NULL,
  	"entity_id" varchar NOT NULL,
  	"user_id" integer,
  	"user_email" varchar,
  	"old_value" jsonb,
  	"new_value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"temple_settings_id" integer,
  	"pages_id" integer,
  	"festival_years_id" integer,
  	"events_id" integer,
  	"winners_id" integer,
  	"gallery_id" integer,
  	"videos_id" integer,
  	"donors_id" integer,
  	"expenses_id" integer,
  	"audit_logs_id" integer
  );
  
  CREATE TABLE "payload"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."temple_settings" ADD CONSTRAINT "temple_settings_upi_qr_code_id_media_id_fk" FOREIGN KEY ("upi_qr_code_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."temple_settings" ADD CONSTRAINT "temple_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."temple_settings_locales" ADD CONSTRAINT "temple_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."temple_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_image_block" ADD CONSTRAINT "pages_blocks_image_block_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_image_block" ADD CONSTRAINT "pages_blocks_image_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_call_to_action" ADD CONSTRAINT "pages_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages" ADD CONSTRAINT "pages_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_image_block" ADD CONSTRAINT "_pages_v_blocks_image_block_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_image_block" ADD CONSTRAINT "_pages_v_blocks_image_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_call_to_action" ADD CONSTRAINT "_pages_v_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v" ADD CONSTRAINT "_pages_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."festival_years_locales" ADD CONSTRAINT "festival_years_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."festival_years"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_festival_years_v" ADD CONSTRAINT "_festival_years_v_parent_id_festival_years_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."festival_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_festival_years_v_locales" ADD CONSTRAINT "_festival_years_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_festival_years_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."events" ADD CONSTRAINT "events_festival_year_id_festival_years_id_fk" FOREIGN KEY ("festival_year_id") REFERENCES "payload"."festival_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."events_locales" ADD CONSTRAINT "events_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_events_v" ADD CONSTRAINT "_events_v_version_festival_year_id_festival_years_id_fk" FOREIGN KEY ("version_festival_year_id") REFERENCES "payload"."festival_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_events_v_locales" ADD CONSTRAINT "_events_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."winners" ADD CONSTRAINT "winners_festival_year_id_festival_years_id_fk" FOREIGN KEY ("festival_year_id") REFERENCES "payload"."festival_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."winners" ADD CONSTRAINT "winners_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."winners_locales" ADD CONSTRAINT "winners_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."winners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_winners_v" ADD CONSTRAINT "_winners_v_parent_id_winners_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."winners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_winners_v" ADD CONSTRAINT "_winners_v_version_festival_year_id_festival_years_id_fk" FOREIGN KEY ("version_festival_year_id") REFERENCES "payload"."festival_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_winners_v" ADD CONSTRAINT "_winners_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_winners_v_locales" ADD CONSTRAINT "_winners_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_winners_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."gallery_photos" ADD CONSTRAINT "gallery_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."gallery_photos" ADD CONSTRAINT "gallery_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."gallery_photos_locales" ADD CONSTRAINT "gallery_photos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."gallery_photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."gallery" ADD CONSTRAINT "gallery_festival_year_id_festival_years_id_fk" FOREIGN KEY ("festival_year_id") REFERENCES "payload"."festival_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."gallery_locales" ADD CONSTRAINT "gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_gallery_v_version_photos" ADD CONSTRAINT "_gallery_v_version_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_gallery_v_version_photos" ADD CONSTRAINT "_gallery_v_version_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_gallery_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_gallery_v_version_photos_locales" ADD CONSTRAINT "_gallery_v_version_photos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_gallery_v_version_photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_gallery_v" ADD CONSTRAINT "_gallery_v_parent_id_gallery_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."gallery"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_gallery_v" ADD CONSTRAINT "_gallery_v_version_festival_year_id_festival_years_id_fk" FOREIGN KEY ("version_festival_year_id") REFERENCES "payload"."festival_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_gallery_v_locales" ADD CONSTRAINT "_gallery_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_gallery_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."videos" ADD CONSTRAINT "videos_festival_year_id_festival_years_id_fk" FOREIGN KEY ("festival_year_id") REFERENCES "payload"."festival_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."videos" ADD CONSTRAINT "videos_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."videos_locales" ADD CONSTRAINT "videos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_videos_v" ADD CONSTRAINT "_videos_v_parent_id_videos_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_videos_v" ADD CONSTRAINT "_videos_v_version_festival_year_id_festival_years_id_fk" FOREIGN KEY ("version_festival_year_id") REFERENCES "payload"."festival_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_videos_v" ADD CONSTRAINT "_videos_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_videos_v_locales" ADD CONSTRAINT "_videos_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."donors" ADD CONSTRAINT "donors_festival_year_id_festival_years_id_fk" FOREIGN KEY ("festival_year_id") REFERENCES "payload"."festival_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."donors_locales" ADD CONSTRAINT "donors_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."donors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."expenses" ADD CONSTRAINT "expenses_festival_year_id_festival_years_id_fk" FOREIGN KEY ("festival_year_id") REFERENCES "payload"."festival_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."expenses_locales" ADD CONSTRAINT "expenses_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."expenses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_temple_settings_fk" FOREIGN KEY ("temple_settings_id") REFERENCES "payload"."temple_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_festival_years_fk" FOREIGN KEY ("festival_years_id") REFERENCES "payload"."festival_years"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "payload"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_winners_fk" FOREIGN KEY ("winners_id") REFERENCES "payload"."winners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_gallery_fk" FOREIGN KEY ("gallery_id") REFERENCES "payload"."gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "payload"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_donors_fk" FOREIGN KEY ("donors_id") REFERENCES "payload"."donors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_expenses_fk" FOREIGN KEY ("expenses_id") REFERENCES "payload"."expenses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_logs_fk" FOREIGN KEY ("audit_logs_id") REFERENCES "payload"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "payload"."users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "payload"."users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "payload"."users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "payload"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "payload"."users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "payload"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "payload"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "payload"."media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "payload"."media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "payload"."media" USING btree ("sizes_card_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "payload"."media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "payload"."media_locales" USING btree ("_parent_id");
  CREATE INDEX "temple_settings_upi_qr_code_idx" ON "payload"."temple_settings" USING btree ("upi_qr_code_id");
  CREATE INDEX "temple_settings_logo_idx" ON "payload"."temple_settings" USING btree ("logo_id");
  CREATE INDEX "temple_settings_updated_at_idx" ON "payload"."temple_settings" USING btree ("updated_at");
  CREATE INDEX "temple_settings_created_at_idx" ON "payload"."temple_settings" USING btree ("created_at");
  CREATE UNIQUE INDEX "temple_settings_locales_locale_parent_id_unique" ON "payload"."temple_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "temple_settings_locales_parent_id_idx" ON "payload"."temple_settings_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "payload"."pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "payload"."pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "payload"."pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_rich_text_locale_idx" ON "payload"."pages_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "pages_blocks_image_block_order_idx" ON "payload"."pages_blocks_image_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_block_parent_id_idx" ON "payload"."pages_blocks_image_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_block_path_idx" ON "payload"."pages_blocks_image_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_block_locale_idx" ON "payload"."pages_blocks_image_block" USING btree ("_locale");
  CREATE INDEX "pages_blocks_image_block_image_idx" ON "payload"."pages_blocks_image_block" USING btree ("image_id");
  CREATE INDEX "pages_blocks_call_to_action_order_idx" ON "payload"."pages_blocks_call_to_action" USING btree ("_order");
  CREATE INDEX "pages_blocks_call_to_action_parent_id_idx" ON "payload"."pages_blocks_call_to_action" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_call_to_action_path_idx" ON "payload"."pages_blocks_call_to_action" USING btree ("_path");
  CREATE INDEX "pages_blocks_call_to_action_locale_idx" ON "payload"."pages_blocks_call_to_action" USING btree ("_locale");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "payload"."pages" USING btree ("slug");
  CREATE INDEX "pages_hero_image_idx" ON "payload"."pages" USING btree ("hero_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "payload"."pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "payload"."pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "payload"."pages" USING btree ("_status");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "payload"."pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_locales_parent_id_idx" ON "payload"."pages_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "payload"."_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "payload"."_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "payload"."_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_rich_text_locale_idx" ON "payload"."_pages_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_image_block_order_idx" ON "payload"."_pages_v_blocks_image_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_block_parent_id_idx" ON "payload"."_pages_v_blocks_image_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_block_path_idx" ON "payload"."_pages_v_blocks_image_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_block_locale_idx" ON "payload"."_pages_v_blocks_image_block" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_image_block_image_idx" ON "payload"."_pages_v_blocks_image_block" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_call_to_action_order_idx" ON "payload"."_pages_v_blocks_call_to_action" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_call_to_action_parent_id_idx" ON "payload"."_pages_v_blocks_call_to_action" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_call_to_action_path_idx" ON "payload"."_pages_v_blocks_call_to_action" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_call_to_action_locale_idx" ON "payload"."_pages_v_blocks_call_to_action" USING btree ("_locale");
  CREATE INDEX "_pages_v_parent_idx" ON "payload"."_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "payload"."_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_hero_image_idx" ON "payload"."_pages_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "payload"."_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "payload"."_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "payload"."_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "payload"."_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "payload"."_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "payload"."_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "payload"."_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "payload"."_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "payload"."_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_locales_parent_id_idx" ON "payload"."_pages_v_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "festival_years_year_idx" ON "payload"."festival_years" USING btree ("year");
  CREATE INDEX "festival_years_updated_at_idx" ON "payload"."festival_years" USING btree ("updated_at");
  CREATE INDEX "festival_years_created_at_idx" ON "payload"."festival_years" USING btree ("created_at");
  CREATE INDEX "festival_years__status_idx" ON "payload"."festival_years" USING btree ("_status");
  CREATE UNIQUE INDEX "festival_years_locales_locale_parent_id_unique" ON "payload"."festival_years_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "festival_years_locales_parent_id_idx" ON "payload"."festival_years_locales" USING btree ("_parent_id");
  CREATE INDEX "_festival_years_v_parent_idx" ON "payload"."_festival_years_v" USING btree ("parent_id");
  CREATE INDEX "_festival_years_v_version_version_year_idx" ON "payload"."_festival_years_v" USING btree ("version_year");
  CREATE INDEX "_festival_years_v_version_version_updated_at_idx" ON "payload"."_festival_years_v" USING btree ("version_updated_at");
  CREATE INDEX "_festival_years_v_version_version_created_at_idx" ON "payload"."_festival_years_v" USING btree ("version_created_at");
  CREATE INDEX "_festival_years_v_version_version__status_idx" ON "payload"."_festival_years_v" USING btree ("version__status");
  CREATE INDEX "_festival_years_v_created_at_idx" ON "payload"."_festival_years_v" USING btree ("created_at");
  CREATE INDEX "_festival_years_v_updated_at_idx" ON "payload"."_festival_years_v" USING btree ("updated_at");
  CREATE INDEX "_festival_years_v_snapshot_idx" ON "payload"."_festival_years_v" USING btree ("snapshot");
  CREATE INDEX "_festival_years_v_published_locale_idx" ON "payload"."_festival_years_v" USING btree ("published_locale");
  CREATE INDEX "_festival_years_v_latest_idx" ON "payload"."_festival_years_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_festival_years_v_locales_locale_parent_id_unique" ON "payload"."_festival_years_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_festival_years_v_locales_parent_id_idx" ON "payload"."_festival_years_v_locales" USING btree ("_parent_id");
  CREATE INDEX "events_festival_year_idx" ON "payload"."events" USING btree ("festival_year_id");
  CREATE UNIQUE INDEX "events_legacy_id_idx" ON "payload"."events" USING btree ("legacy_id");
  CREATE INDEX "events_updated_at_idx" ON "payload"."events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "payload"."events" USING btree ("created_at");
  CREATE INDEX "events__status_idx" ON "payload"."events" USING btree ("_status");
  CREATE UNIQUE INDEX "events_locales_locale_parent_id_unique" ON "payload"."events_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "events_locales_parent_id_idx" ON "payload"."events_locales" USING btree ("_parent_id");
  CREATE INDEX "_events_v_parent_idx" ON "payload"."_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_festival_year_idx" ON "payload"."_events_v" USING btree ("version_festival_year_id");
  CREATE INDEX "_events_v_version_version_legacy_id_idx" ON "payload"."_events_v" USING btree ("version_legacy_id");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "payload"."_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "payload"."_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "payload"."_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "payload"."_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "payload"."_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_snapshot_idx" ON "payload"."_events_v" USING btree ("snapshot");
  CREATE INDEX "_events_v_published_locale_idx" ON "payload"."_events_v" USING btree ("published_locale");
  CREATE INDEX "_events_v_latest_idx" ON "payload"."_events_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_events_v_locales_locale_parent_id_unique" ON "payload"."_events_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_events_v_locales_parent_id_idx" ON "payload"."_events_v_locales" USING btree ("_parent_id");
  CREATE INDEX "winners_festival_year_idx" ON "payload"."winners" USING btree ("festival_year_id");
  CREATE UNIQUE INDEX "winners_legacy_id_idx" ON "payload"."winners" USING btree ("legacy_id");
  CREATE INDEX "winners_photo_idx" ON "payload"."winners" USING btree ("photo_id");
  CREATE INDEX "winners_updated_at_idx" ON "payload"."winners" USING btree ("updated_at");
  CREATE INDEX "winners_created_at_idx" ON "payload"."winners" USING btree ("created_at");
  CREATE INDEX "winners__status_idx" ON "payload"."winners" USING btree ("_status");
  CREATE UNIQUE INDEX "winners_locales_locale_parent_id_unique" ON "payload"."winners_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "winners_locales_parent_id_idx" ON "payload"."winners_locales" USING btree ("_parent_id");
  CREATE INDEX "_winners_v_parent_idx" ON "payload"."_winners_v" USING btree ("parent_id");
  CREATE INDEX "_winners_v_version_version_festival_year_idx" ON "payload"."_winners_v" USING btree ("version_festival_year_id");
  CREATE INDEX "_winners_v_version_version_legacy_id_idx" ON "payload"."_winners_v" USING btree ("version_legacy_id");
  CREATE INDEX "_winners_v_version_version_photo_idx" ON "payload"."_winners_v" USING btree ("version_photo_id");
  CREATE INDEX "_winners_v_version_version_updated_at_idx" ON "payload"."_winners_v" USING btree ("version_updated_at");
  CREATE INDEX "_winners_v_version_version_created_at_idx" ON "payload"."_winners_v" USING btree ("version_created_at");
  CREATE INDEX "_winners_v_version_version__status_idx" ON "payload"."_winners_v" USING btree ("version__status");
  CREATE INDEX "_winners_v_created_at_idx" ON "payload"."_winners_v" USING btree ("created_at");
  CREATE INDEX "_winners_v_updated_at_idx" ON "payload"."_winners_v" USING btree ("updated_at");
  CREATE INDEX "_winners_v_snapshot_idx" ON "payload"."_winners_v" USING btree ("snapshot");
  CREATE INDEX "_winners_v_published_locale_idx" ON "payload"."_winners_v" USING btree ("published_locale");
  CREATE INDEX "_winners_v_latest_idx" ON "payload"."_winners_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_winners_v_locales_locale_parent_id_unique" ON "payload"."_winners_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_winners_v_locales_parent_id_idx" ON "payload"."_winners_v_locales" USING btree ("_parent_id");
  CREATE INDEX "gallery_photos_order_idx" ON "payload"."gallery_photos" USING btree ("_order");
  CREATE INDEX "gallery_photos_parent_id_idx" ON "payload"."gallery_photos" USING btree ("_parent_id");
  CREATE INDEX "gallery_photos_image_idx" ON "payload"."gallery_photos" USING btree ("image_id");
  CREATE UNIQUE INDEX "gallery_photos_locales_locale_parent_id_unique" ON "payload"."gallery_photos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "gallery_photos_locales_parent_id_idx" ON "payload"."gallery_photos_locales" USING btree ("_parent_id");
  CREATE INDEX "gallery_festival_year_idx" ON "payload"."gallery" USING btree ("festival_year_id");
  CREATE INDEX "gallery_category_idx" ON "payload"."gallery" USING btree ("category");
  CREATE INDEX "gallery_updated_at_idx" ON "payload"."gallery" USING btree ("updated_at");
  CREATE INDEX "gallery_created_at_idx" ON "payload"."gallery" USING btree ("created_at");
  CREATE INDEX "gallery__status_idx" ON "payload"."gallery" USING btree ("_status");
  CREATE UNIQUE INDEX "gallery_locales_locale_parent_id_unique" ON "payload"."gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "gallery_locales_parent_id_idx" ON "payload"."gallery_locales" USING btree ("_parent_id");
  CREATE INDEX "_gallery_v_version_photos_order_idx" ON "payload"."_gallery_v_version_photos" USING btree ("_order");
  CREATE INDEX "_gallery_v_version_photos_parent_id_idx" ON "payload"."_gallery_v_version_photos" USING btree ("_parent_id");
  CREATE INDEX "_gallery_v_version_photos_image_idx" ON "payload"."_gallery_v_version_photos" USING btree ("image_id");
  CREATE UNIQUE INDEX "_gallery_v_version_photos_locales_locale_parent_id_unique" ON "payload"."_gallery_v_version_photos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_gallery_v_version_photos_locales_parent_id_idx" ON "payload"."_gallery_v_version_photos_locales" USING btree ("_parent_id");
  CREATE INDEX "_gallery_v_parent_idx" ON "payload"."_gallery_v" USING btree ("parent_id");
  CREATE INDEX "_gallery_v_version_version_festival_year_idx" ON "payload"."_gallery_v" USING btree ("version_festival_year_id");
  CREATE INDEX "_gallery_v_version_version_category_idx" ON "payload"."_gallery_v" USING btree ("version_category");
  CREATE INDEX "_gallery_v_version_version_updated_at_idx" ON "payload"."_gallery_v" USING btree ("version_updated_at");
  CREATE INDEX "_gallery_v_version_version_created_at_idx" ON "payload"."_gallery_v" USING btree ("version_created_at");
  CREATE INDEX "_gallery_v_version_version__status_idx" ON "payload"."_gallery_v" USING btree ("version__status");
  CREATE INDEX "_gallery_v_created_at_idx" ON "payload"."_gallery_v" USING btree ("created_at");
  CREATE INDEX "_gallery_v_updated_at_idx" ON "payload"."_gallery_v" USING btree ("updated_at");
  CREATE INDEX "_gallery_v_snapshot_idx" ON "payload"."_gallery_v" USING btree ("snapshot");
  CREATE INDEX "_gallery_v_published_locale_idx" ON "payload"."_gallery_v" USING btree ("published_locale");
  CREATE INDEX "_gallery_v_latest_idx" ON "payload"."_gallery_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_gallery_v_locales_locale_parent_id_unique" ON "payload"."_gallery_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_gallery_v_locales_parent_id_idx" ON "payload"."_gallery_v_locales" USING btree ("_parent_id");
  CREATE INDEX "videos_festival_year_idx" ON "payload"."videos" USING btree ("festival_year_id");
  CREATE UNIQUE INDEX "videos_legacy_id_idx" ON "payload"."videos" USING btree ("legacy_id");
  CREATE INDEX "videos_thumbnail_idx" ON "payload"."videos" USING btree ("thumbnail_id");
  CREATE INDEX "videos_category_idx" ON "payload"."videos" USING btree ("category");
  CREATE INDEX "videos_updated_at_idx" ON "payload"."videos" USING btree ("updated_at");
  CREATE INDEX "videos_created_at_idx" ON "payload"."videos" USING btree ("created_at");
  CREATE INDEX "videos__status_idx" ON "payload"."videos" USING btree ("_status");
  CREATE UNIQUE INDEX "videos_locales_locale_parent_id_unique" ON "payload"."videos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "videos_locales_parent_id_idx" ON "payload"."videos_locales" USING btree ("_parent_id");
  CREATE INDEX "_videos_v_parent_idx" ON "payload"."_videos_v" USING btree ("parent_id");
  CREATE INDEX "_videos_v_version_version_festival_year_idx" ON "payload"."_videos_v" USING btree ("version_festival_year_id");
  CREATE INDEX "_videos_v_version_version_legacy_id_idx" ON "payload"."_videos_v" USING btree ("version_legacy_id");
  CREATE INDEX "_videos_v_version_version_thumbnail_idx" ON "payload"."_videos_v" USING btree ("version_thumbnail_id");
  CREATE INDEX "_videos_v_version_version_category_idx" ON "payload"."_videos_v" USING btree ("version_category");
  CREATE INDEX "_videos_v_version_version_updated_at_idx" ON "payload"."_videos_v" USING btree ("version_updated_at");
  CREATE INDEX "_videos_v_version_version_created_at_idx" ON "payload"."_videos_v" USING btree ("version_created_at");
  CREATE INDEX "_videos_v_version_version__status_idx" ON "payload"."_videos_v" USING btree ("version__status");
  CREATE INDEX "_videos_v_created_at_idx" ON "payload"."_videos_v" USING btree ("created_at");
  CREATE INDEX "_videos_v_updated_at_idx" ON "payload"."_videos_v" USING btree ("updated_at");
  CREATE INDEX "_videos_v_snapshot_idx" ON "payload"."_videos_v" USING btree ("snapshot");
  CREATE INDEX "_videos_v_published_locale_idx" ON "payload"."_videos_v" USING btree ("published_locale");
  CREATE INDEX "_videos_v_latest_idx" ON "payload"."_videos_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_videos_v_locales_locale_parent_id_unique" ON "payload"."_videos_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_videos_v_locales_parent_id_idx" ON "payload"."_videos_v_locales" USING btree ("_parent_id");
  CREATE INDEX "donors_festival_year_idx" ON "payload"."donors" USING btree ("festival_year_id");
  CREATE UNIQUE INDEX "donors_legacy_id_idx" ON "payload"."donors" USING btree ("legacy_id");
  CREATE INDEX "donors_updated_at_idx" ON "payload"."donors" USING btree ("updated_at");
  CREATE INDEX "donors_created_at_idx" ON "payload"."donors" USING btree ("created_at");
  CREATE UNIQUE INDEX "donors_locales_locale_parent_id_unique" ON "payload"."donors_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "donors_locales_parent_id_idx" ON "payload"."donors_locales" USING btree ("_parent_id");
  CREATE INDEX "expenses_festival_year_idx" ON "payload"."expenses" USING btree ("festival_year_id");
  CREATE UNIQUE INDEX "expenses_legacy_id_idx" ON "payload"."expenses" USING btree ("legacy_id");
  CREATE INDEX "expenses_updated_at_idx" ON "payload"."expenses" USING btree ("updated_at");
  CREATE INDEX "expenses_created_at_idx" ON "payload"."expenses" USING btree ("created_at");
  CREATE UNIQUE INDEX "expenses_locales_locale_parent_id_unique" ON "payload"."expenses_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "expenses_locales_parent_id_idx" ON "payload"."expenses_locales" USING btree ("_parent_id");
  CREATE INDEX "audit_logs_entity_type_idx" ON "payload"."audit_logs" USING btree ("entity_type");
  CREATE INDEX "audit_logs_entity_id_idx" ON "payload"."audit_logs" USING btree ("entity_id");
  CREATE INDEX "audit_logs_user_idx" ON "payload"."audit_logs" USING btree ("user_id");
  CREATE INDEX "audit_logs_updated_at_idx" ON "payload"."audit_logs" USING btree ("updated_at");
  CREATE INDEX "audit_logs_created_at_idx" ON "payload"."audit_logs" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_temple_settings_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("temple_settings_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_festival_years_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("festival_years_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_winners_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("winners_id");
  CREATE INDEX "payload_locked_documents_rels_gallery_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("gallery_id");
  CREATE INDEX "payload_locked_documents_rels_videos_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("videos_id");
  CREATE INDEX "payload_locked_documents_rels_donors_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("donors_id");
  CREATE INDEX "payload_locked_documents_rels_expenses_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("expenses_id");
  CREATE INDEX "payload_locked_documents_rels_audit_logs_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("audit_logs_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload"."payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."users_sessions" CASCADE;
  DROP TABLE "payload"."users" CASCADE;
  DROP TABLE "payload"."media" CASCADE;
  DROP TABLE "payload"."media_locales" CASCADE;
  DROP TABLE "payload"."temple_settings" CASCADE;
  DROP TABLE "payload"."temple_settings_locales" CASCADE;
  DROP TABLE "payload"."pages_blocks_rich_text" CASCADE;
  DROP TABLE "payload"."pages_blocks_image_block" CASCADE;
  DROP TABLE "payload"."pages_blocks_call_to_action" CASCADE;
  DROP TABLE "payload"."pages" CASCADE;
  DROP TABLE "payload"."pages_locales" CASCADE;
  DROP TABLE "payload"."_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "payload"."_pages_v_blocks_image_block" CASCADE;
  DROP TABLE "payload"."_pages_v_blocks_call_to_action" CASCADE;
  DROP TABLE "payload"."_pages_v" CASCADE;
  DROP TABLE "payload"."_pages_v_locales" CASCADE;
  DROP TABLE "payload"."festival_years" CASCADE;
  DROP TABLE "payload"."festival_years_locales" CASCADE;
  DROP TABLE "payload"."_festival_years_v" CASCADE;
  DROP TABLE "payload"."_festival_years_v_locales" CASCADE;
  DROP TABLE "payload"."events" CASCADE;
  DROP TABLE "payload"."events_locales" CASCADE;
  DROP TABLE "payload"."_events_v" CASCADE;
  DROP TABLE "payload"."_events_v_locales" CASCADE;
  DROP TABLE "payload"."winners" CASCADE;
  DROP TABLE "payload"."winners_locales" CASCADE;
  DROP TABLE "payload"."_winners_v" CASCADE;
  DROP TABLE "payload"."_winners_v_locales" CASCADE;
  DROP TABLE "payload"."gallery_photos" CASCADE;
  DROP TABLE "payload"."gallery_photos_locales" CASCADE;
  DROP TABLE "payload"."gallery" CASCADE;
  DROP TABLE "payload"."gallery_locales" CASCADE;
  DROP TABLE "payload"."_gallery_v_version_photos" CASCADE;
  DROP TABLE "payload"."_gallery_v_version_photos_locales" CASCADE;
  DROP TABLE "payload"."_gallery_v" CASCADE;
  DROP TABLE "payload"."_gallery_v_locales" CASCADE;
  DROP TABLE "payload"."videos" CASCADE;
  DROP TABLE "payload"."videos_locales" CASCADE;
  DROP TABLE "payload"."_videos_v" CASCADE;
  DROP TABLE "payload"."_videos_v_locales" CASCADE;
  DROP TABLE "payload"."donors" CASCADE;
  DROP TABLE "payload"."donors_locales" CASCADE;
  DROP TABLE "payload"."expenses" CASCADE;
  DROP TABLE "payload"."expenses_locales" CASCADE;
  DROP TABLE "payload"."audit_logs" CASCADE;
  DROP TABLE "payload"."payload_kv" CASCADE;
  DROP TABLE "payload"."payload_locked_documents" CASCADE;
  DROP TABLE "payload"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload"."payload_preferences" CASCADE;
  DROP TABLE "payload"."payload_preferences_rels" CASCADE;
  DROP TABLE "payload"."payload_migrations" CASCADE;
  DROP TYPE "payload"."_locales";
  DROP TYPE "payload"."enum_users_role";
  DROP TYPE "payload"."enum_pages_status";
  DROP TYPE "payload"."enum__pages_v_version_status";
  DROP TYPE "payload"."enum__pages_v_published_locale";
  DROP TYPE "payload"."enum_festival_years_status";
  DROP TYPE "payload"."enum__festival_years_v_version_status";
  DROP TYPE "payload"."enum__festival_years_v_published_locale";
  DROP TYPE "payload"."enum_events_status";
  DROP TYPE "payload"."enum__events_v_version_status";
  DROP TYPE "payload"."enum__events_v_published_locale";
  DROP TYPE "payload"."enum_winners_prize_position";
  DROP TYPE "payload"."enum_winners_status";
  DROP TYPE "payload"."enum__winners_v_version_prize_position";
  DROP TYPE "payload"."enum__winners_v_version_status";
  DROP TYPE "payload"."enum__winners_v_published_locale";
  DROP TYPE "payload"."enum_gallery_category";
  DROP TYPE "payload"."enum_gallery_status";
  DROP TYPE "payload"."enum__gallery_v_version_category";
  DROP TYPE "payload"."enum__gallery_v_version_status";
  DROP TYPE "payload"."enum__gallery_v_published_locale";
  DROP TYPE "payload"."enum_videos_category";
  DROP TYPE "payload"."enum_videos_status";
  DROP TYPE "payload"."enum__videos_v_version_category";
  DROP TYPE "payload"."enum__videos_v_version_status";
  DROP TYPE "payload"."enum__videos_v_published_locale";
  DROP TYPE "payload"."enum_expenses_type";
  DROP TYPE "payload"."enum_audit_logs_action";`)
}
