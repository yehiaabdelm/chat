ALTER TABLE "chats" DROP CONSTRAINT "chats_current_message_id_messages_id_fk";
--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "leaf_message_id" uuid;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_leaf_message_id_messages_id_fk" FOREIGN KEY ("leaf_message_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "current_message_id";