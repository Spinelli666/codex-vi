-- CreateTable
CREATE TABLE "tentativas_login" (
    "id" UUID NOT NULL,
    "ip" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sucesso" BOOLEAN NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tentativas_login_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tentativas_login_ip_criado_em_idx" ON "tentativas_login"("ip", "criado_em");

-- CreateIndex
CREATE INDEX "tentativas_login_email_criado_em_idx" ON "tentativas_login"("email", "criado_em");
