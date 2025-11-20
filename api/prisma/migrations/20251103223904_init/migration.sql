-- CreateTable
CREATE TABLE "webhooks" (
    "id" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 200,
    "contentType" TEXT,
    "contentLength" INTEGER,
    "queryParams" JSONB,
    "headers" JSONB NOT NULL,
    "body" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);
