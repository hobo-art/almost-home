-- CreateTable
CREATE TABLE "AnonymousSession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 100,
    "migratedToId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnonymousSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "credits" INTEGER NOT NULL DEFAULT 0,
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "anonSessionId" TEXT,
    "currentNodeId" TEXT NOT NULL DEFAULT 'the-call',
    "stateFlags" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "choiceId" TEXT,
    "creditSpent" INTEGER NOT NULL DEFAULT 0,
    "narrative" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "anonSessionId" TEXT,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "stripePaymentId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnonymousSession_sessionToken_key" ON "AnonymousSession"("sessionToken");

-- CreateIndex
CREATE INDEX "AnonymousSession_expiresAt_idx" ON "AnonymousSession"("expiresAt");

-- CreateIndex
CREATE INDEX "AnonymousSession_sessionToken_idx" ON "AnonymousSession"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "GameSession_userId_idx" ON "GameSession"("userId");

-- CreateIndex
CREATE INDEX "GameSession_anonSessionId_idx" ON "GameSession"("anonSessionId");

-- CreateIndex
CREATE INDEX "StoryEvent_sessionId_idx" ON "StoryEvent"("sessionId");

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_idx" ON "CreditTransaction"("userId");

-- CreateIndex
CREATE INDEX "CreditTransaction_anonSessionId_idx" ON "CreditTransaction"("anonSessionId");

-- AddForeignKey
ALTER TABLE "AnonymousSession" ADD CONSTRAINT "AnonymousSession_migratedToId_fkey" FOREIGN KEY ("migratedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_anonSessionId_fkey" FOREIGN KEY ("anonSessionId") REFERENCES "AnonymousSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryEvent" ADD CONSTRAINT "StoryEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
