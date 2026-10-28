CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "kategori" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"ikon" varchar(255) DEFAULT 'water' NOT NULL,
	"warna_bg" varchar(255) DEFAULT '#dcf0e2' NOT NULL,
	"warna_ikon" varchar(255) DEFAULT '#2f9e58' NOT NULL,
	"urutan" integer DEFAULT 0 NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kategori_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "paket" (
	"id" serial PRIMARY KEY NOT NULL,
	"kategori_id" integer NOT NULL,
	"nama" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"harga_mulai" bigint NOT NULL,
	"satuan_harga" varchar(50) DEFAULT 'Orang' NOT NULL,
	"lokasi" varchar(255) DEFAULT 'Sentul, Bogor' NOT NULL,
	"deskripsi" text,
	"foto" text,
	"ikon" varchar(255),
	"durasi" varchar(255),
	"medan" varchar(255),
	"min_peserta" integer DEFAULT 1 NOT NULL,
	"termasuk" jsonb,
	"aktif" boolean DEFAULT true NOT NULL,
	"urutan" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "paket_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "pemesanan" (
	"id" serial PRIMARY KEY NOT NULL,
	"kode" varchar(255) NOT NULL,
	"paket_id" integer NOT NULL,
	"nama" varchar(255) NOT NULL,
	"whatsapp" varchar(255) NOT NULL,
	"tanggal_kunjungan" date NOT NULL,
	"jumlah" integer NOT NULL,
	"catatan" text,
	"estimasi_total" bigint NOT NULL,
	"harga_final" bigint,
	"status" varchar(20) DEFAULT 'baru' NOT NULL,
	"tanggal_konfirmasi" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pemesanan_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "pengaturan" (
	"id" serial PRIMARY KEY NOT NULL,
	"kunci" varchar(255) NOT NULL,
	"nilai" text,
	"tipe" varchar(50) DEFAULT 'text' NOT NULL,
	"label" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pengaturan_kunci_unique" UNIQUE("kunci")
);
--> statement-breakpoint
ALTER TABLE "paket" ADD CONSTRAINT "paket_kategori_id_kategori_id_fk" FOREIGN KEY ("kategori_id") REFERENCES "public"."kategori"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pemesanan" ADD CONSTRAINT "pemesanan_paket_id_paket_id_fk" FOREIGN KEY ("paket_id") REFERENCES "public"."paket"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "paket_kategori_aktif_idx" ON "paket" USING btree ("kategori_id","aktif");--> statement-breakpoint
CREATE INDEX "pemesanan_status_created_idx" ON "pemesanan" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "pemesanan_paket_status_idx" ON "pemesanan" USING btree ("paket_id","status");