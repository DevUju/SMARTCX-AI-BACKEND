import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1760000000000 implements MigrationInterface {
  name = 'InitSchema1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('super_admin', 'admin', 'agent')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."channels_type_enum" AS ENUM('whatsapp', 'instagram', 'email')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."customers_channel_enum" AS ENUM('whatsapp', 'instagram', 'email')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."customers_status_enum" AS ENUM('new', 'returning', 'vip')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."issues_channeltype_enum" AS ENUM('whatsapp', 'instagram', 'email')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."issues_sentimentlabel_enum" AS ENUM('positive', 'neutral', 'frustrated', 'angry')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."issues_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."issues_status_enum" AS ENUM('new', 'pending', 'converted', 'closed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tickets_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tickets_status_enum" AS ENUM('open', 'pending', 'escalated', 'resolved')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."messages_sendertype_enum" AS ENUM('customer', 'agent', 'ai_bot')`,
    );

    await queryRunner.query(`
      CREATE TABLE "businesses" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "businessName" character varying(180) NOT NULL,
        "ownerName" character varying(150) NOT NULL,
        "email" character varying(180) NOT NULL,
        "phone" character varying(20) NOT NULL,
        "category" character varying(100) NOT NULL,
        "passwordHash" character varying(255) NOT NULL,
        "logoUrl" character varying(255),
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_businesses_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_businesses_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "businessId" uuid NOT NULL,
        "firstName" character varying(100) NOT NULL,
        "lastName" character varying(100) NOT NULL,
        "email" character varying(180) NOT NULL,
        "passwordHash" character varying(255) NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'agent',
        "isOnline" boolean NOT NULL DEFAULT false,
        "lastSeenAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "channels" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "businessId" uuid NOT NULL,
        "type" "public"."channels_type_enum" NOT NULL,
        "credentials" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "isConnected" boolean NOT NULL DEFAULT false,
        "connectedAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_channels_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "businessId" uuid NOT NULL,
        "name" character varying(160) NOT NULL,
        "phone" character varying(20),
        "email" character varying(180),
        "channel" "public"."customers_channel_enum" NOT NULL,
        "totalSpent" numeric(12,2) NOT NULL DEFAULT 0,
        "location" character varying(120),
        "status" "public"."customers_status_enum" NOT NULL DEFAULT 'new',
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_customers_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "issues" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "businessId" uuid NOT NULL,
        "customerId" uuid NOT NULL,
        "channelType" "public"."issues_channeltype_enum" NOT NULL,
        "messagePreview" text NOT NULL,
        "rawMessages" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "sentimentScore" double precision NOT NULL DEFAULT 0,
        "sentimentLabel" "public"."issues_sentimentlabel_enum" NOT NULL DEFAULT 'neutral',
        "category" character varying(120) NOT NULL,
        "priority" "public"."issues_priority_enum" NOT NULL DEFAULT 'medium',
        "status" "public"."issues_status_enum" NOT NULL DEFAULT 'new',
        "aiAnalysisSummary" text NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_issues_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tickets" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "businessId" uuid NOT NULL,
        "issueId" uuid NOT NULL,
        "customerId" uuid NOT NULL,
        "ticketNumber" character varying(40) NOT NULL,
        "title" character varying(180) NOT NULL,
        "category" character varying(120) NOT NULL,
        "priority" "public"."tickets_priority_enum" NOT NULL DEFAULT 'medium',
        "status" "public"."tickets_status_enum" NOT NULL DEFAULT 'open',
        "assignedAgentId" uuid,
        "aiDraftSummary" text NOT NULL,
        "aiInsightSummary" text NOT NULL,
        "internalNotes" text[] NOT NULL DEFAULT '{}'::text[],
        "resolvedAt" TIMESTAMPTZ,
        "resolutionSummary" text,
        "sentimentShiftStart" character varying(80),
        "sentimentShiftEnd" character varying(80),
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tickets_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tickets_ticket_number" UNIQUE ("ticketNumber")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "ticketId" uuid NOT NULL,
        "senderId" character varying(64) NOT NULL,
        "senderType" "public"."messages_sendertype_enum" NOT NULL,
        "content" text NOT NULL,
        "attachmentUrl" character varying(255),
        "isInternalNote" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_messages_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "businessId" uuid NOT NULL,
        "actorId" uuid,
        "action" character varying(160) NOT NULL,
        "entityType" character varying(120) NOT NULL,
        "entityId" character varying(120) NOT NULL,
        "beforeData" jsonb,
        "afterData" jsonb,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_business_email" ON "users" ("businessId", "email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_customers_business_email" ON "customers" ("businessId", "email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_customers_business_phone" ON "customers" ("businessId", "phone")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_issues_business_status_priority" ON "issues" ("businessId", "status", "priority")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tickets_business_status_priority" ON "tickets" ("businessId", "status", "priority")`,
    );

    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_users_business" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "channels" ADD CONSTRAINT "FK_channels_business" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD CONSTRAINT "FK_customers_business" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "issues" ADD CONSTRAINT "FK_issues_business" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "issues" ADD CONSTRAINT "FK_issues_customer" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD CONSTRAINT "FK_tickets_business" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD CONSTRAINT "FK_tickets_issue" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD CONSTRAINT "FK_tickets_customer" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD CONSTRAINT "FK_tickets_assigned_agent" FOREIGN KEY ("assignedAgentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_messages_ticket" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_audit_logs_business" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_audit_logs_actor" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_audit_logs_actor"`);
    await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_audit_logs_business"`);
    await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_ticket"`);
    await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_tickets_assigned_agent"`);
    await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_tickets_customer"`);
    await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_tickets_issue"`);
    await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_tickets_business"`);
    await queryRunner.query(`ALTER TABLE "issues" DROP CONSTRAINT "FK_issues_customer"`);
    await queryRunner.query(`ALTER TABLE "issues" DROP CONSTRAINT "FK_issues_business"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_customers_business"`);
    await queryRunner.query(`ALTER TABLE "channels" DROP CONSTRAINT "FK_channels_business"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_business"`);

    await queryRunner.query(`DROP INDEX "public"."IDX_tickets_business_status_priority"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_issues_business_status_priority"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_customers_business_phone"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_customers_business_email"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_business_email"`);

    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP TABLE "tickets"`);
    await queryRunner.query(`DROP TABLE "issues"`);
    await queryRunner.query(`DROP TABLE "customers"`);
    await queryRunner.query(`DROP TABLE "channels"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "businesses"`);

    await queryRunner.query(`DROP TYPE "public"."messages_sendertype_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tickets_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tickets_priority_enum"`);
    await queryRunner.query(`DROP TYPE "public"."issues_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."issues_priority_enum"`);
    await queryRunner.query(`DROP TYPE "public"."issues_sentimentlabel_enum"`);
    await queryRunner.query(`DROP TYPE "public"."issues_channeltype_enum"`);
    await queryRunner.query(`DROP TYPE "public"."customers_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."customers_channel_enum"`);
    await queryRunner.query(`DROP TYPE "public"."channels_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}