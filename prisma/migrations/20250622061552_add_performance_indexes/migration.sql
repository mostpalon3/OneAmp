-- CreateIndex
CREATE INDEX "currentStream_userId_idx" ON "CurrentStream"("userId");

-- CreateIndex
CREATE INDEX "currentStream_streamId_idx" ON "CurrentStream"("streamId");

-- CreateIndex
CREATE INDEX "downvotes_streamId_idx" ON "Downvote"("streamId");

-- CreateIndex
CREATE INDEX "downvotes_userId_idx" ON "Downvote"("userId");

-- CreateIndex
CREATE INDEX "downvotes_streamId_userId_idx" ON "Downvote"("streamId", "userId");

-- CreateIndex
CREATE INDEX "streams_userId_played_idx" ON "Stream"("userId", "played");

-- CreateIndex
CREATE INDEX "streams_played_createdAt_idx" ON "Stream"("played", "createdAt");

-- CreateIndex
CREATE INDEX "streams_userId_active_idx" ON "Stream"("userId", "active");

-- CreateIndex
CREATE INDEX "streams_userId_played_createdAt_idx" ON "Stream"("userId", "played", "createdAt");

-- CreateIndex
CREATE INDEX "streams_type_idx" ON "Stream"("type");

-- CreateIndex
CREATE INDEX "streams_extractedId_idx" ON "Stream"("extractedId");

-- CreateIndex
CREATE INDEX "upvotes_streamId_idx" ON "Upvote"("streamId");

-- CreateIndex
CREATE INDEX "upvotes_userId_idx" ON "Upvote"("userId");

-- CreateIndex
CREATE INDEX "upvotes_streamId_userId_idx" ON "Upvote"("streamId", "userId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "users_provider_idx" ON "User"("provider");
