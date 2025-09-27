CREATE TABLE "videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_address" varchar(42) NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text,
	"cid" varchar(128) NOT NULL,
	"tags" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
