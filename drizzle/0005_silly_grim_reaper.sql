ALTER TABLE "chats" DROP CONSTRAINT "chats_root_node_id_messages_id_fk";
--> statement-breakpoint
ALTER TABLE "chats" DROP CONSTRAINT "chats_current_node_id_messages_id_fk";
--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "root_message_id" uuid;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "current_message_id" uuid;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_root_message_id_messages_id_fk" FOREIGN KEY ("root_message_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_current_message_id_messages_id_fk" FOREIGN KEY ("current_message_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "root_node_id";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "current_node_id";