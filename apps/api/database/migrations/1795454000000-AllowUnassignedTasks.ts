import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowUnassignedTasks1795454000000 implements MigrationInterface {
  name = 'AllowUnassignedTasks1795454000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_tasks" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "description" text, "status" varchar CHECK( "status" IN ('pending','complete') ) NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "user_id" integer, CONSTRAINT "FK_db55af84c226af9dce09487b61b" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_tasks"("id", "title", "description", "status", "created_at", "updated_at", "user_id") SELECT "id", "title", "description", "status", "created_at", "updated_at", "user_id" FROM "tasks"`,
    );
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_tasks" RENAME TO "tasks"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const rows = (await queryRunner.query(
      `SELECT COUNT(*) AS "count" FROM "tasks" WHERE "user_id" IS NULL`,
    )) as Array<{ count: number }>;
    if (Number(rows[0]?.count ?? 0) > 0) {
      throw new Error(
        'Assign all tasks before reverting AllowUnassignedTasks1795454000000.',
      );
    }

    await queryRunner.query(`ALTER TABLE "tasks" RENAME TO "temporary_tasks"`);
    await queryRunner.query(
      `CREATE TABLE "tasks" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "description" text, "status" varchar CHECK( "status" IN ('pending','complete') ) NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "user_id" integer NOT NULL, CONSTRAINT "FK_db55af84c226af9dce09487b61b" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "tasks"("id", "title", "description", "status", "created_at", "updated_at", "user_id") SELECT "id", "title", "description", "status", "created_at", "updated_at", "user_id" FROM "temporary_tasks"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_tasks"`);
  }
}
