"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20241229000000 = void 0;
// src/migrations/Migration20240329000000.ts
const migrations_1 = require("@mikro-orm/migrations");
class Migration20241229000000 extends migrations_1.Migration {
    async up() {
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
    `);
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
    `);
        // Add foreign key from customer_device to customer
        this.addSql(`
      alter table "customer_device"
      add constraint "customer_device_customer_id_foreign"
      foreign key ("customer_id")
      references "customer" ("id")
      on delete cascade;
    `);
        // Create indexes
        this.addSql(`
      create index "customer_device_customer_id_index"
      on "customer_device" ("customer_id")
      where "deleted_at" is null;
    `);
        this.addSql(`
      create index "customer_device_device_id_index"
      on "customer_device" ("device_id")
      where "deleted_at" is null;
    `);
        this.addSql(`
      create index "device_subscription_device_id_index"
      on "device_subscription" ("device_id")
      where "deleted_at" is null;
    `);
        // Add unique constraint to prevent duplicate active subscriptions
        this.addSql(`
      create unique index "device_subscription_device_id_active_unique"
      on "device_subscription" ("device_id")
      where "is_active" = true and "deleted_at" is null;
    `);
    }
    async down() {
        // Drop indexes first
        this.addSql('drop index if exists "device_subscription_device_id_active_unique";');
        this.addSql('drop index if exists "device_subscription_device_id_index";');
        this.addSql('drop index if exists "customer_device_device_id_index";');
        this.addSql('drop index if exists "customer_device_customer_id_index";');
        // Drop foreign key
        this.addSql('alter table "customer_device" drop constraint if exists "customer_device_customer_id_foreign";');
        // Drop tables
        this.addSql('drop table if exists "device_subscription" cascade;');
        this.addSql('drop table if exists "customer_device" cascade;');
    }
}
exports.Migration20241229000000 = Migration20241229000000;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNDEyMjkwMDAwMDAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI0MTIyOTAwMDAwMC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw0Q0FBNEM7QUFDNUMsc0RBQWlEO0FBRWpELE1BQWEsdUJBQXdCLFNBQVEsc0JBQVM7SUFDcEQsS0FBSyxDQUFDLEVBQUU7UUFDTiwrQkFBK0I7UUFDL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7Ozs7Ozs7Ozs7OztLQWFYLENBQUMsQ0FBQTtRQUVGLG1DQUFtQztRQUNuQyxJQUFJLENBQUMsTUFBTSxDQUFDOzs7Ozs7Ozs7Ozs7O0tBYVgsQ0FBQyxDQUFBO1FBRUYsbURBQW1EO1FBQ25ELElBQUksQ0FBQyxNQUFNLENBQUM7Ozs7OztLQU1YLENBQUMsQ0FBQTtRQUVGLGlCQUFpQjtRQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDOzs7O0tBSVgsQ0FBQyxDQUFBO1FBRUYsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7OztLQUlYLENBQUMsQ0FBQTtRQUVGLElBQUksQ0FBQyxNQUFNLENBQUM7Ozs7S0FJWCxDQUFDLENBQUE7UUFFRixrRUFBa0U7UUFDbEUsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7OztLQUlYLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSTtRQUNSLHFCQUFxQjtRQUNyQixJQUFJLENBQUMsTUFBTSxDQUFDLHFFQUFxRSxDQUFDLENBQUE7UUFDbEYsSUFBSSxDQUFDLE1BQU0sQ0FBQyw2REFBNkQsQ0FBQyxDQUFBO1FBQzFFLElBQUksQ0FBQyxNQUFNLENBQUMseURBQXlELENBQUMsQ0FBQTtRQUN0RSxJQUFJLENBQUMsTUFBTSxDQUFDLDJEQUEyRCxDQUFDLENBQUE7UUFFeEUsbUJBQW1CO1FBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsZ0dBQWdHLENBQUMsQ0FBQTtRQUU3RyxjQUFjO1FBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxREFBcUQsQ0FBQyxDQUFBO1FBQ2xFLElBQUksQ0FBQyxNQUFNLENBQUMsaURBQWlELENBQUMsQ0FBQTtJQUNoRSxDQUFDO0NBQ0Y7QUFwRkQsMERBb0ZDIn0=