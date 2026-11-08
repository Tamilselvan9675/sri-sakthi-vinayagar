import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * Finance becomes year-wise file uploads (donor-files / expense-files).
 * The previous line-item tables (donors, expenses) are left in place so no data is lost.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE "payload"."donor_files" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"festival_year_id" integer NOT NULL,
  	"prefix" varchar DEFAULT '',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric
  );
  ALTER TABLE "payload"."donor_files" ADD CONSTRAINT "donor_files_festival_year_id_festival_years_id_fk" FOREIGN KEY ("festival_year_id") REFERENCES "payload"."festival_years"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "donor_files_festival_year_idx" ON "payload"."donor_files" USING btree ("festival_year_id");
  CREATE INDEX "donor_files_updated_at_idx" ON "payload"."donor_files" USING btree ("updated_at");
  CREATE INDEX "donor_files_created_at_idx" ON "payload"."donor_files" USING btree ("created_at");
  CREATE UNIQUE INDEX "donor_files_filename_idx" ON "payload"."donor_files" USING btree ("filename");
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "donor_files_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_donor_files_fk" FOREIGN KEY ("donor_files_id") REFERENCES "payload"."donor_files"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_donor_files_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("donor_files_id");  CREATE TABLE "payload"."expense_files" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"festival_year_id" integer NOT NULL,
  	"prefix" varchar DEFAULT '',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric
  );
  ALTER TABLE "payload"."expense_files" ADD CONSTRAINT "expense_files_festival_year_id_festival_years_id_fk" FOREIGN KEY ("festival_year_id") REFERENCES "payload"."festival_years"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "expense_files_festival_year_idx" ON "payload"."expense_files" USING btree ("festival_year_id");
  CREATE INDEX "expense_files_updated_at_idx" ON "payload"."expense_files" USING btree ("updated_at");
  CREATE INDEX "expense_files_created_at_idx" ON "payload"."expense_files" USING btree ("created_at");
  CREATE UNIQUE INDEX "expense_files_filename_idx" ON "payload"."expense_files" USING btree ("filename");
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "expense_files_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_expense_files_fk" FOREIGN KEY ("expense_files_id") REFERENCES "payload"."expense_files"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_expense_files_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("expense_files_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE "payload"."donor_files" CASCADE;
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "donor_files_id";  DROP TABLE "payload"."expense_files" CASCADE;
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "expense_files_id";`)
}
