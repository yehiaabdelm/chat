ALTER TABLE "endpoints" DROP CONSTRAINT "endpoints_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "models" DROP CONSTRAINT "models_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "endpoints" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "models" DROP COLUMN "user_id";