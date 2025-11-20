import { Migration } from '@mikro-orm/migrations';

export class Migration20251117214747_initial extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "org" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "name" text not null, "metadata" jsonb null, constraint "org_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_org_name" on "org" ("name");`);

    this.addSql(`create table "security_kms_key" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "org_id" uuid not null, "alias" text not null, "provider" text not null, "metadata" jsonb null, constraint "security_kms_key_pkey" primary key ("id"));`);
    this.addSql(`alter table "security_kms_key" add constraint "security_kms_key_alias_unique" unique ("alias");`);
    this.addSql(`create index "idx_kms_key_alias" on "security_kms_key" ("alias");`);
    this.addSql(`create index "idx_kms_key_org" on "security_kms_key" ("org_id");`);

    this.addSql(`create table "edge_device" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "org_id" uuid not null, "name" text not null, "protocol" text not null, "twin_state" jsonb null, "last_seen_at" timestamptz null, "metadata" jsonb null, constraint "edge_device_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_device_last_seen" on "edge_device" ("last_seen_at");`);
    this.addSql(`create index "idx_device_protocol" on "edge_device" ("protocol");`);
    this.addSql(`create index "idx_device_org" on "edge_device" ("org_id");`);

    this.addSql(`create table "edge_deployment" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "org_id" uuid not null, "environment" text not null, "region" text not null, "config" jsonb null, "status" text null, "metadata" jsonb null, constraint "edge_deployment_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_deployment_env_region" on "edge_deployment" ("environment", "region");`);
    this.addSql(`create index "idx_deployment_org" on "edge_deployment" ("org_id");`);

    this.addSql(`create table "integrations_connector" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "org_id" uuid not null, "code" text not null, "config" jsonb null, "status" text not null default 'inactive', constraint "integrations_connector_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_connector_org_code" on "integrations_connector" ("org_id", "code");`);

    this.addSql(`create table "edge_agent" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "org_id" uuid not null, "kind" text not null, "version" text not null, "status" text not null default 'offline', "last_seen_at" timestamptz null, "capabilities" jsonb null, "metadata" jsonb null, constraint "edge_agent_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_agent_last_seen" on "edge_agent" ("last_seen_at");`);
    this.addSql(`create index "idx_agent_org_status" on "edge_agent" ("org_id", "status");`);

    this.addSql(`create table "org_settings" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "org_id" uuid not null, "branding" jsonb null, "security" jsonb null, "defaults" jsonb null, "billing_prefs" jsonb null, constraint "org_settings_pkey" primary key ("id"));`);
    this.addSql(`alter table "org_settings" add constraint "org_settings_org_id_unique" unique ("org_id");`);
    this.addSql(`create index "idx_org_settings_org" on "org_settings" ("org_id");`);

    this.addSql(`create table "abac_policy" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "org_id" uuid not null, "code" text not null, "rules" jsonb not null, "version" int not null, "enabled" boolean not null default true, constraint "abac_policy_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_policy_code" on "abac_policy" ("code");`);
    this.addSql(`create index "idx_policy_org" on "abac_policy" ("org_id");`);
    this.addSql(`alter table "abac_policy" add constraint "uq_policy_org_code_version" unique ("org_id", "code", "version");`);

    this.addSql(`create table "security_secret" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "org_id" uuid not null, "kms_key_id" uuid not null, "ciphertext" bytea not null, "kms_key_alias" text null, "rotated_at" timestamptz null, constraint "security_secret_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_secret_kms_key" on "security_secret" ("kms_key_id");`);
    this.addSql(`create index "idx_secret_org" on "security_secret" ("org_id");`);

    this.addSql(`create table "integrations_connector_secret" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "org_id" uuid not null, "connector_id" uuid not null, "secret_id" uuid not null, constraint "integrations_connector_secret_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_connector_secret_secret" on "integrations_connector_secret" ("secret_id");`);
    this.addSql(`create index "idx_connector_secret_connector" on "integrations_connector_secret" ("connector_id");`);
    this.addSql(`create index "idx_connector_secret_org" on "integrations_connector_secret" ("org_id");`);
    this.addSql(`alter table "integrations_connector_secret" add constraint "uq_connector_secret_pair" unique ("connector_id", "secret_id");`);

    this.addSql(`create table "billing_usage_meter" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "org_id" uuid not null, "metric_code" text not null, "quantity" bigint not null default 0, "for_date" date not null, "dimensions" jsonb null, "dimensions_hash" text null, constraint "billing_usage_meter_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_usage_metric_hash" on "billing_usage_meter" ("dimensions_hash");`);
    this.addSql(`create index "idx_usage_org_metric_date" on "billing_usage_meter" ("org_id", "metric_code", "for_date");`);

    this.addSql(`create table "app_user" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "email" text not null, "hashed_password" text null, "display_name" text not null, "metadata" jsonb null, constraint "app_user_pkey" primary key ("id"));`);
    this.addSql(`create index "uq_user_email" on "app_user" ("email");`);

    this.addSql(`create table "system_ticket" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "ticket_id" text not null, "user_id" uuid not null, "title" text not null, "description" text not null, "category" text not null, "status" text not null default 'OPEN', "assignee_id" text null, "conversation" jsonb not null default '[]', "resolved_at" bigint null, constraint "system_ticket_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_ticket_assignee" on "system_ticket" ("assignee_id");`);
    this.addSql(`create index "idx_ticket_category" on "system_ticket" ("category");`);
    this.addSql(`create index "idx_ticket_status" on "system_ticket" ("status");`);
    this.addSql(`create index "idx_ticket_user" on "system_ticket" ("user_id");`);
    this.addSql(`create index "idx_ticket_id" on "system_ticket" ("ticket_id");`);

    this.addSql(`create table "org_member" ("id" uuid not null, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "org_id" uuid not null, "user_id" uuid not null, "attributes" jsonb null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, constraint "org_member_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_org_member_user" on "org_member" ("user_id");`);
    this.addSql(`create index "idx_org_member_org" on "org_member" ("org_id");`);
    this.addSql(`alter table "org_member" add constraint "uq_org_member_org_user" unique ("org_id", "user_id");`);

    this.addSql(`create table "system_notification" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "user_id" uuid not null, "title" text not null, "message" text not null, "read" boolean not null default false, "metadata" jsonb null, constraint "system_notification_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_notification_user_unread" on "system_notification" ("user_id", "read");`);

    this.addSql(`create table "billing_customer" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "org_id" uuid null, "user_id" uuid null, "provider" text not null, "external_id" text not null, "billing_contacts" jsonb null, "metadata" jsonb null, constraint "billing_customer_pkey" primary key ("id"), constraint ck_customer_one_side check ((org_id IS NULL) <> (user_id IS NULL)));`);
    this.addSql(`create index "idx_customer_user" on "billing_customer" ("user_id");`);
    this.addSql(`create index "idx_customer_org" on "billing_customer" ("org_id");`);
    this.addSql(`alter table "billing_customer" add constraint "uq_customer_provider_external" unique ("provider", "external_id");`);

    this.addSql(`create table "billing_invoice" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "org_id" uuid null, "user_id" uuid null, "customer_id" uuid not null, "provider" text not null, "external_id" text not null, "status" text not null, "amount" numeric(10,0) not null, "currency" text not null, "period_start" timestamptz not null, "period_end" timestamptz not null, "lines" jsonb null, constraint "billing_invoice_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_invoice_customer_created" on "billing_invoice" ("customer_id", "created_at");`);
    this.addSql(`create index "idx_invoice_user_created" on "billing_invoice" ("user_id", "created_at");`);
    this.addSql(`create index "idx_invoice_org_created" on "billing_invoice" ("org_id", "created_at");`);
    this.addSql(`alter table "billing_invoice" add constraint "uq_invoice_provider_external" unique ("provider", "external_id");`);

    this.addSql(`create table "billing_payment" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "org_id" uuid null, "user_id" uuid null, "customer_id" uuid not null, "invoice_id" uuid null, "provider" text not null, "external_id" text not null, "status" text not null, "amount" numeric(10,0) not null, "currency" text not null, "method_details" jsonb null, "metadata" jsonb null, "captured_at" timestamptz null, "refunded_at" timestamptz null, constraint "billing_payment_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_payment_invoice_created" on "billing_payment" ("invoice_id", "created_at");`);
    this.addSql(`create index "idx_payment_customer_created" on "billing_payment" ("customer_id", "created_at");`);
    this.addSql(`create index "idx_payment_user_created" on "billing_payment" ("user_id", "created_at");`);
    this.addSql(`create index "idx_payment_org_created" on "billing_payment" ("org_id", "created_at");`);
    this.addSql(`alter table "billing_payment" add constraint "uq_payment_provider_external" unique ("provider", "external_id");`);

    this.addSql(`create table "assistant_conversation" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "org_id" uuid not null, "user_id" uuid not null, "title" text null, "metadata" jsonb null, constraint "assistant_conversation_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_conversation_created" on "assistant_conversation" ("created_at");`);
    this.addSql(`create index "idx_conversation_user" on "assistant_conversation" ("user_id");`);
    this.addSql(`create index "idx_conversation_org" on "assistant_conversation" ("org_id");`);

    this.addSql(`create table "assistant_run" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "org_id" uuid not null, "conversation_id" uuid not null, "skill_code" text not null, "status" text not null, "latency_ms" real null, "started_at" timestamptz null, "finished_at" timestamptz null, constraint "assistant_run_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_run_status" on "assistant_run" ("status");`);
    this.addSql(`create index "idx_run_conversation" on "assistant_run" ("conversation_id");`);
    this.addSql(`create index "idx_run_org" on "assistant_run" ("org_id");`);

    this.addSql(`create table "assistant_run_log" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "run_id" uuid not null, "logs" jsonb not null, constraint "assistant_run_log_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_runlog_created" on "assistant_run_log" ("created_at");`);
    this.addSql(`create index "idx_runlog_run" on "assistant_run_log" ("run_id");`);

    this.addSql(`create table "assistant_message" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "conversation_id" uuid not null, "role" text not null, "content" text not null, "tool_calls" jsonb null, "attachments" jsonb null, "model" text null, constraint "assistant_message_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_message_role" on "assistant_message" ("role");`);
    this.addSql(`create index "idx_message_conversation_created" on "assistant_message" ("conversation_id", "created_at");`);
    this.addSql(`create index "idx_message_conversation" on "assistant_message" ("conversation_id");`);

    this.addSql(`create table "system_audit" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "user_id" uuid null, "org_id" uuid null, "role" text null, "action" text not null, "resource" text not null, "attributes" jsonb null, "result" text not null, "reason" text null, "feature_flag_checked" boolean not null default false, "feature_flag_name" text null, "timestamp" bigint not null default 1763416064446, constraint "system_audit_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_audit_org_time" on "system_audit" ("org_id", "timestamp");`);
    this.addSql(`create index "idx_audit_user_time" on "system_audit" ("user_id", "timestamp");`);

    this.addSql(`create table "system_api_key" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "name" text not null, "description" text null, "scopes" text not null, "hashed_secret" text not null, "org_id" uuid null, "user_id" uuid null, "last_used_at" timestamptz null, "revoked_at" timestamptz null, "reason" text null, constraint "system_api_key_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_api_key_hash" on "system_api_key" ("hashed_secret");`);
    this.addSql(`create index "idx_api_key_user" on "system_api_key" ("user_id");`);
    this.addSql(`create index "idx_api_key_org" on "system_api_key" ("org_id");`);

    this.addSql(`create table "user_account" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "user_id" uuid not null, "provider" text not null, "account_id" text not null, "display_name" text not null, "management_url" text null, "status" text null, "connected_at" bigint not null default 1763416064391, constraint "user_account_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_account_provider" on "user_account" ("provider", "account_id");`);
    this.addSql(`create index "idx_account_user" on "user_account" ("user_id");`);

    this.addSql(`create table "user_profile" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "user_id" uuid not null, "handle" text not null, "avatar_url" text null, "bio" text null, "links" jsonb null, constraint "user_profile_pkey" primary key ("id"));`);
    this.addSql(`alter table "user_profile" add constraint "user_profile_user_id_unique" unique ("user_id");`);
    this.addSql(`create index "idx_user_profile_handle" on "user_profile" ("handle");`);
    this.addSql(`alter table "user_profile" add constraint "uq_user_profile_handle" unique ("handle");`);
    this.addSql(`alter table "user_profile" add constraint "uq_user_profile_user" unique ("user_id");`);

    this.addSql(`create table "user_session" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "session_token" text not null, "expires" timestamptz not null, "user_id" uuid not null, constraint "user_session_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_session_user_expires" on "user_session" ("user_id", "expires");`);
    this.addSql(`create index "idx_session_token" on "user_session" ("session_token");`);

    this.addSql(`create table "user_settings" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "user_id" uuid not null, "notifications" jsonb null, "privacy" jsonb null, "accessibility" jsonb null, "product" jsonb null, constraint "user_settings_pkey" primary key ("id"));`);
    this.addSql(`alter table "user_settings" add constraint "user_settings_user_id_unique" unique ("user_id");`);

    this.addSql(`create table "user_verification_token" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "identifier" text not null, "user_id" uuid not null, "token" text not null, "expires" timestamptz not null, constraint "user_verification_token_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_verification_user_expires" on "user_verification_token" ("user_id", "expires");`);
    this.addSql(`create index "idx_verification_identifier_token" on "user_verification_token" ("identifier", "token");`);

    this.addSql(`create table "system_waitlist" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "email" text not null, "name" text null, "source" text null, "ref_code" text null, "cohort" text null, "status" text not null default 'pending', "invite_code" text null, "applied_at" timestamptz not null default CURRENT_TIMESTAMP, "invited_at" timestamptz null, "joined_at" timestamptz null, "metadata" jsonb null, "user_id" uuid null, constraint "system_waitlist_pkey" primary key ("id"));`);
    this.addSql(`alter table "system_waitlist" add constraint "system_waitlist_email_unique" unique ("email");`);
    this.addSql(`create index "idx_waitlist_status" on "system_waitlist" ("status");`);
    this.addSql(`create index "idx_waitlist_email" on "system_waitlist" ("email");`);

    this.addSql(`create table "assistant_webhook_subscription" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "org_id" uuid not null, "event" text not null, "target_url" text not null, "headers" jsonb null, "enabled" boolean not null default true, constraint "assistant_webhook_subscription_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_webhook_org_event" on "assistant_webhook_subscription" ("org_id", "event");`);

    this.addSql(`create table "assistant_webhook_delivery" ("id" uuid not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "org_id" uuid not null, "subscription_id" uuid not null, "status" text not null, "attempt" int not null, "response_code" int not null default 0, "idempotency_key" text not null, "error_message" text null, "response" jsonb null, "request" jsonb null, "duration_ms" real null, constraint "assistant_webhook_delivery_pkey" primary key ("id"));`);
    this.addSql(`create index "idx_webhook_delivery_subscription_created" on "assistant_webhook_delivery" ("subscription_id", "created_at");`);
    this.addSql(`create index "idx_webhook_delivery_org_created" on "assistant_webhook_delivery" ("org_id", "created_at");`);
    this.addSql(`alter table "assistant_webhook_delivery" add constraint "uq_webhook_delivery_idempotency" unique ("idempotency_key");`);

    this.addSql(`alter table "security_kms_key" add constraint "security_kms_key_org_id_foreign" foreign key ("org_id") references "org" ("id") on update cascade;`);

    this.addSql(`alter table "edge_device" add constraint "edge_device_org_id_foreign" foreign key ("org_id") references "org" ("id") on update cascade;`);

    this.addSql(`alter table "edge_deployment" add constraint "edge_deployment_org_id_foreign" foreign key ("org_id") references "org" ("id") on update cascade;`);

    this.addSql(`alter table "integrations_connector" add constraint "integrations_connector_org_id_foreign" foreign key ("org_id") references "org" ("id") on update cascade;`);

    this.addSql(`alter table "edge_agent" add constraint "edge_agent_org_id_foreign" foreign key ("org_id") references "org" ("id") on update cascade;`);

    this.addSql(`alter table "org_settings" add constraint "org_settings_org_id_foreign" foreign key ("org_id") references "org" ("id") on update cascade;`);

    this.addSql(`alter table "abac_policy" add constraint "abac_policy_org_id_foreign" foreign key ("org_id") references "org" ("id") on update cascade;`);

    this.addSql(`alter table "security_secret" add constraint "security_secret_org_id_foreign" foreign key ("org_id") references "org" ("id") on update cascade;`);
    this.addSql(`alter table "security_secret" add constraint "security_secret_kms_key_id_foreign" foreign key ("kms_key_id") references "security_kms_key" ("id") on update cascade;`);

    this.addSql(`alter table "integrations_connector_secret" add constraint "integrations_connector_secret_org_id_foreign" foreign key ("org_id") references "org" ("id") on update cascade;`);
    this.addSql(`alter table "integrations_connector_secret" add constraint "integrations_connector_secret_connector_id_foreign" foreign key ("connector_id") references "integrations_connector" ("id") on update cascade;`);
    this.addSql(`alter table "integrations_connector_secret" add constraint "integrations_connector_secret_secret_id_foreign" foreign key ("secret_id") references "security_secret" ("id") on update cascade;`);

    this.addSql(`alter table "billing_usage_meter" add constraint "billing_usage_meter_org_id_foreign" foreign key ("org_id") references "org" ("id") on update cascade;`);

    this.addSql(`alter table "system_ticket" add constraint "system_ticket_user_id_foreign" foreign key ("user_id") references "app_user" ("id") on update cascade;`);

    this.addSql(`alter table "org_member" add constraint "org_member_org_id_foreign" foreign key ("org_id") references "org" ("id") on update cascade;`);
    this.addSql(`alter table "org_member" add constraint "org_member_user_id_foreign" foreign key ("user_id") references "app_user" ("id") on update cascade;`);

    this.addSql(`alter table "system_notification" add constraint "system_notification_user_id_foreign" foreign key ("user_id") references "app_user" ("id") on update cascade;`);

    this.addSql(`alter table "billing_customer" add constraint "billing_customer_org_id_foreign" foreign key ("org_id") references "org" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "billing_customer" add constraint "billing_customer_user_id_foreign" foreign key ("user_id") references "app_user" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "billing_invoice" add constraint "billing_invoice_org_id_foreign" foreign key ("org_id") references "org" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "billing_invoice" add constraint "billing_invoice_user_id_foreign" foreign key ("user_id") references "app_user" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "billing_invoice" add constraint "billing_invoice_customer_id_foreign" foreign key ("customer_id") references "billing_customer" ("id") on update cascade;`);

    this.addSql(`alter table "billing_payment" add constraint "billing_payment_org_id_foreign" foreign key ("org_id") references "org" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "billing_payment" add constraint "billing_payment_user_id_foreign" foreign key ("user_id") references "app_user" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "billing_payment" add constraint "billing_payment_customer_id_foreign" foreign key ("customer_id") references "billing_customer" ("id") on update cascade;`);
    this.addSql(`alter table "billing_payment" add constraint "billing_payment_invoice_id_foreign" foreign key ("invoice_id") references "billing_invoice" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "assistant_conversation" add constraint "assistant_conversation_org_id_foreign" foreign key ("org_id") references "org" ("id") on update cascade;`);
    this.addSql(`alter table "assistant_conversation" add constraint "assistant_conversation_user_id_foreign" foreign key ("user_id") references "app_user" ("id") on update cascade;`);

    this.addSql(`alter table "assistant_run" add constraint "assistant_run_org_id_foreign" foreign key ("org_id") references "org" ("id") on update cascade;`);
    this.addSql(`alter table "assistant_run" add constraint "assistant_run_conversation_id_foreign" foreign key ("conversation_id") references "assistant_conversation" ("id") on update cascade;`);

    this.addSql(`alter table "assistant_run_log" add constraint "assistant_run_log_run_id_foreign" foreign key ("run_id") references "assistant_run" ("id") on update cascade;`);

    this.addSql(`alter table "assistant_message" add constraint "assistant_message_conversation_id_foreign" foreign key ("conversation_id") references "assistant_conversation" ("id") on update cascade;`);

    this.addSql(`alter table "system_audit" add constraint "system_audit_user_id_foreign" foreign key ("user_id") references "app_user" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "system_audit" add constraint "system_audit_org_id_foreign" foreign key ("org_id") references "org" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "system_api_key" add constraint "system_api_key_org_id_foreign" foreign key ("org_id") references "org" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "system_api_key" add constraint "system_api_key_user_id_foreign" foreign key ("user_id") references "app_user" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "user_account" add constraint "user_account_user_id_foreign" foreign key ("user_id") references "app_user" ("id") on update cascade;`);

    this.addSql(`alter table "user_profile" add constraint "user_profile_user_id_foreign" foreign key ("user_id") references "app_user" ("id") on update cascade;`);

    this.addSql(`alter table "user_session" add constraint "user_session_user_id_foreign" foreign key ("user_id") references "app_user" ("id") on update cascade;`);

    this.addSql(`alter table "user_settings" add constraint "user_settings_user_id_foreign" foreign key ("user_id") references "app_user" ("id") on update cascade;`);

    this.addSql(`alter table "user_verification_token" add constraint "user_verification_token_user_id_foreign" foreign key ("user_id") references "app_user" ("id") on update cascade;`);

    this.addSql(`alter table "system_waitlist" add constraint "system_waitlist_user_id_foreign" foreign key ("user_id") references "app_user" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "assistant_webhook_subscription" add constraint "assistant_webhook_subscription_org_id_foreign" foreign key ("org_id") references "org" ("id") on update cascade;`);

    this.addSql(`alter table "assistant_webhook_delivery" add constraint "assistant_webhook_delivery_org_id_foreign" foreign key ("org_id") references "org" ("id") on update cascade;`);
    this.addSql(`alter table "assistant_webhook_delivery" add constraint "assistant_webhook_delivery_subscription_id_foreign" foreign key ("subscription_id") references "assistant_webhook_subscription" ("id") on update cascade;`);
  }

}
