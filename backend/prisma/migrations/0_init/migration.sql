-- BASELINE (2026-09-22).
--
-- Database project ini awalnya dibangun dengan `prisma db push`, sehingga
-- tabel _prisma_migrations tidak pernah ada dan seluruh riwayat migrasi
-- dianggap belum diterapkan. Akibatnya `prisma migrate dev` bisa menawarkan
-- RESET (menghapus semua data), dan `prisma migrate deploy` pasti gagal
-- karena mencoba CREATE TABLE yang sudah ada.
--
-- Berkas ini menggambarkan keadaan database APA ADANYA per tanggal di atas,
-- digenerate dari schema.prisma yang sudah diverifikasi nol selisih terhadap
-- database asli. Migrasi lama diarsipkan di .backup/2026-09-22_migrasi-lama/.
--
-- Di database yang sudah ada, migrasi ini TIDAK dijalankan — ia hanya ditandai
-- sudah diterapkan lewat `prisma migrate resolve --applied 0_init`. Di database
-- kosong (mis. saat setup di komputer lain), `prisma migrate deploy` akan
-- menjalankannya untuk membangun skema dari nol.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "isFirstLogin" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "publisher_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accessibility_preferences" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "ukuranTeks" TEXT NOT NULL DEFAULT 'medium',
    "modeKontras" TEXT NOT NULL DEFAULT 'dark',
    "modeButaWarna" TEXT NOT NULL DEFAULT 'none',
    "jarakBaris" TEXT NOT NULL DEFAULT 'normal',
    "kecepatanTts" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "volumeTts" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accessibility_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_category_preferences" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_category_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "accessibility_preferences_userId_key" ON "accessibility_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_category_preferences_userId_categoryId_key" ON "user_category_preferences"("userId", "categoryId");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accessibility_preferences" ADD CONSTRAINT "accessibility_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_category_preferences" ADD CONSTRAINT "user_category_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_category_preferences" ADD CONSTRAINT "user_category_preferences_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

