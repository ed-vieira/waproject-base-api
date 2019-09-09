import { MigrationInterface, QueryRunner } from 'typeorm';

export class initial1568058773045 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'CREATE TABLE "UserDevice" ("deviceId" character varying(150) NOT NULL, "userId" integer NOT NULL, "name" character varying(150) NOT NULL, "currentToken" uuid NOT NULL, "notificationToken" character varying(250), CONSTRAINT "PK_b685a08bab14bce6e408500cde0" PRIMARY KEY ("deviceId", "userId"))'
    );
    await queryRunner.query(
      'CREATE TABLE "UserSocial" ("userId" integer NOT NULL, "provider" character varying(50) NOT NULL, "ref" character varying(150) NOT NULL, CONSTRAINT "PK_e4bcd44f185abac54669821e13c" PRIMARY KEY ("userId", "provider", "ref"))'
    );
    await queryRunner.query(
      'CREATE TABLE "User" ("id" SERIAL NOT NULL, "firstName" character varying(50) NOT NULL, "lastName" character varying(50), "email" character varying(150), "password" character varying(100), "roles" text NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e" UNIQUE ("email"), CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))'
    );
    await queryRunner.query(
      'ALTER TABLE "UserDevice" ADD CONSTRAINT "FK_e69f82cf0fc44f121ee38e6810c" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('ALTER TABLE "UserDevice" DROP CONSTRAINT "FK_e69f82cf0fc44f121ee38e6810c"');
    await queryRunner.query('DROP TABLE "User"');
    await queryRunner.query('DROP TABLE "UserSocial"');
    await queryRunner.query('DROP TABLE "UserDevice"');
  }
}
