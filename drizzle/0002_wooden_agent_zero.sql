ALTER TABLE "pemesanan" ADD COLUMN "tipe" varchar(20) DEFAULT 'family' NOT NULL;--> statement-breakpoint
ALTER TABLE "pemesanan" ADD COLUMN "perusahaan" varchar(255);--> statement-breakpoint
ALTER TABLE "pemesanan" ADD COLUMN "sumber" varchar(20) DEFAULT 'web' NOT NULL;