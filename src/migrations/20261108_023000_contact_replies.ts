import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/** Admin reply fields on contact messages. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload"."contact_messages" ADD COLUMN "reply_subject" varchar;
  ALTER TABLE "payload"."contact_messages" ADD COLUMN "reply_message" varchar;
  ALTER TABLE "payload"."contact_messages" ADD COLUMN "send_reply" boolean DEFAULT false;
  ALTER TABLE "payload"."contact_messages" ADD COLUMN "replied_at" timestamp(3) with time zone;
  ALTER TABLE "payload"."contact_messages" ADD COLUMN "replied_by" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload"."contact_messages" DROP COLUMN "reply_subject";
  ALTER TABLE "payload"."contact_messages" DROP COLUMN "reply_message";
  ALTER TABLE "payload"."contact_messages" DROP COLUMN "send_reply";
  ALTER TABLE "payload"."contact_messages" DROP COLUMN "replied_at";
  ALTER TABLE "payload"."contact_messages" DROP COLUMN "replied_by";`)
}
