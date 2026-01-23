-- CreateTable
CREATE TABLE "VerifyCode" (
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerifyCode_pkey" PRIMARY KEY ("email")
);
