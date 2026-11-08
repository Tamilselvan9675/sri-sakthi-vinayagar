import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/** Contact form submissions (Payload collection `contact-messages`). */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE "payload"."contact_messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"rating" numeric,
  	"message" varchar NOT NULL,
  	"visitor_locale" varchar,
  	"confirmation_sent" boolean DEFAULT false,
  	"notification_sent" boolean DEFAULT false,
  	"email_error" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  CREATE INDEX "contact_messages_updated_at_idx" ON "payload"."contact_messages" USING btree ("updated_at");
  CREATE INDEX "contact_messages_created_at_idx" ON "payload"."contact_messages" USING btree ("created_at");
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "contact_messages_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_messages_fk" FOREIGN KEY ("contact_messages_id") REFERENCES "payload"."contact_messages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_contact_messages_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("contact_messages_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "contact_messages_id";
  DROP TABLE "payload"."contact_messages" CASCADE;`)
}
