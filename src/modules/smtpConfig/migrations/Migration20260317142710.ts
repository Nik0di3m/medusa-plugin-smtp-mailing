import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260317142710 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "smtp_config" ("id" text not null, "host" text not null default '', "port" integer not null default 587, "user" text null, "pass" text null, "from_email" text not null default '', "from_name" text null, "secure" boolean not null default false, "enabled" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "smtp_config_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_smtp_config_deleted_at" ON "smtp_config" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "smtp_config" cascade;`);
  }

}
