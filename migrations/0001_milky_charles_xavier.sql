CREATE TABLE "brokers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"license_number" text NOT NULL,
	"experience" integer NOT NULL,
	"specialties" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"certifications" jsonb DEFAULT '[]'::jsonb,
	"languages" jsonb DEFAULT '[]'::jsonb,
	"location" text NOT NULL,
	"service_areas" jsonb DEFAULT '[]'::jsonb,
	"commission_rate" real,
	"bio" text,
	"profile_image_url" text,
	"phone" text,
	"website" text,
	"linkedin" text,
	"rating" real DEFAULT 0,
	"total_sales" integer DEFAULT 0,
	"total_reviews" integer DEFAULT 0,
	"is_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "brokers_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "brokers_license_number_unique" UNIQUE("license_number")
);
--> statement-breakpoint
ALTER TABLE "brokers" ADD CONSTRAINT "brokers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;