CREATE TABLE "parent_child_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" varchar NOT NULL,
	"student_id" varchar NOT NULL,
	"teacher_id" varchar NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "max_teacher_accounts" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_by_school_admin_id" varchar;