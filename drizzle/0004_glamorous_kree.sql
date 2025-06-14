ALTER TABLE "vendors" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "root_node_id" uuid;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_root_node_id_messages_id_fk" FOREIGN KEY ("root_node_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_name_unique" UNIQUE("name");