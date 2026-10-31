CREATE TABLE "klik_wa" (
	"id" serial PRIMARY KEY NOT NULL,
	"paket_id" integer,
	"tipe" varchar(20) DEFAULT 'korporat' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "paket" ADD COLUMN "galeri" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "klik_wa" ADD CONSTRAINT "klik_wa_paket_id_paket_id_fk" FOREIGN KEY ("paket_id") REFERENCES "public"."paket"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "klik_wa_created_idx" ON "klik_wa" USING btree ("created_at");