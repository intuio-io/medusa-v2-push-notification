// src/migrations/Migration20240329000000.ts
import { Migration } from "@mikro-orm/migrations"

export class Migration20241229000000 extends Migration {
  async up(): Promise<void> {
    // Create customer_device table
    this.addSql(`
      create table if not exists "customer_device" (
        "id" text not null,
        "customer_id" text null,
        "device_id" text not null,
        "device_name" text not null,
        "device_info" jsonb not null,
        "last_used" timestamptz not null default now(),
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "customer_device_pkey" primary key ("id")
      );
    `)

    // Create device_subscription table
    this.addSql(`
      create table if not exists "device_subscription" (
        "id" text not null,
        "device_id" text not null,
        "endpoint" text not null,
        "p256dh" text not null,
        "auth" text not null,
        "is_active" boolean not null default true,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "device_subscription_pkey" primary key ("id")
      );
    `)

    // Add foreign key from customer_device to customer
    this.addSql(`
      alter table "customer_device"
      add constraint "customer_device_customer_id_foreign"
      foreign key ("customer_id")
      references "customer" ("id")
      on delete cascade;
    `)

    // Create indexes
    this.addSql(`
      create index "customer_device_customer_id_index"
      on "customer_device" ("customer_id")
      where "deleted_at" is null;
    `)

    this.addSql(`
      create index "customer_device_device_id_index"
      on "customer_device" ("device_id")
      where "deleted_at" is null;
    `)

    this.addSql(`
      create index "device_subscription_device_id_index"
      on "device_subscription" ("device_id")
      where "deleted_at" is null;
    `)

    // Add unique constraint to prevent duplicate active subscriptions
    this.addSql(`
      create unique index "device_subscription_device_id_active_unique"
      on "device_subscription" ("device_id")
      where "is_active" = true and "deleted_at" is null;
    `)
  }

  async down(): Promise<void> {
    // Drop indexes first
    this.addSql('drop index if exists "device_subscription_device_id_active_unique";')
    this.addSql('drop index if exists "device_subscription_device_id_index";')
    this.addSql('drop index if exists "customer_device_device_id_index";')
    this.addSql('drop index if exists "customer_device_customer_id_index";')

    // Drop foreign key
    this.addSql('alter table "customer_device" drop constraint if exists "customer_device_customer_id_foreign";')

    // Drop tables
    this.addSql('drop table if exists "device_subscription" cascade;')
    this.addSql('drop table if exists "customer_device" cascade;')
  }
}