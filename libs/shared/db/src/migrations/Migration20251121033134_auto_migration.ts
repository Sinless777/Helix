import { Migration } from '@mikro-orm/migrations';

export class Migration20251121033134_auto_migration extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "system_audit" alter column "timestamp" type bigint using ("timestamp"::bigint);`);
    this.addSql(`alter table "system_audit" alter column "timestamp" set default 1763695893921;`);

    this.addSql(`alter table "user_account" alter column "connected_at" type bigint using ("connected_at"::bigint);`);
    this.addSql(`alter table "user_account" alter column "connected_at" set default 1763695893858;`);

    this.addSql(`alter table "user_profile" add column "first_name" text null, add column "middle_name" text null, add column "last_name" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "system_audit" alter column "timestamp" type bigint using ("timestamp"::bigint);`);
    this.addSql(`alter table "system_audit" alter column "timestamp" set default 1763685294601;`);

    this.addSql(`alter table "user_account" alter column "connected_at" type bigint using ("connected_at"::bigint);`);
    this.addSql(`alter table "user_account" alter column "connected_at" set default 1763685294541;`);

    this.addSql(`alter table "user_profile" drop column "first_name", drop column "middle_name", drop column "last_name";`);
  }

}
