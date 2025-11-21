import { Migration } from '@mikro-orm/migrations';

export class Migration20251121003454_auto_migration extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "system_audit" alter column "timestamp" type bigint using ("timestamp"::bigint);`);
    this.addSql(`alter table "system_audit" alter column "timestamp" set default 1763685294601;`);

    this.addSql(`alter table "user_account" alter column "connected_at" type bigint using ("connected_at"::bigint);`);
    this.addSql(`alter table "user_account" alter column "connected_at" set default 1763685294541;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "system_audit" alter column "timestamp" type bigint using ("timestamp"::bigint);`);
    this.addSql(`alter table "system_audit" alter column "timestamp" set default 1763685108741;`);

    this.addSql(`alter table "user_account" alter column "connected_at" type bigint using ("connected_at"::bigint);`);
    this.addSql(`alter table "user_account" alter column "connected_at" set default 1763685108684;`);
  }

}
