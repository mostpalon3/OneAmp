# Vote Synchronization Debugging Guide

## 🎯 **Current Issue**
Users are reporting that vote states (up/down arrows) are not showing correctly per user:
- New users should see no vote indicators if they haven't voted
- Each user should only see their own vote states
- Total vote counts should be consistent across all users

## 🔧 **Enhanced Debugging Added**

### 1. **Server-Side Debugging** 
Added comprehensive logging to `/api/streams` route:
- User identification and session details
- Database vote queries and results
- Per-stream vote calculations
- User-specific vote state determination

### 2. **Frontend Debugging**
Enhanced JamPage component logging:
- API response data including user info
- Individual stream vote states
- Transformation process visibility

### 3. **Debug Endpoint**
Created `/api/debug/user` endpoint to verify:
- User session integrity
- Database user lookup
- Vote data for specific jams
- Session ID vs Database ID matching

## 🧪 **Testing Instructions**

### Step 1: Test User Authentication
1. Open browser console (F12)
2. Navigate to a jam page
3. Call debug endpoint:
```javascript
fetch('/api/debug/user?jamId=YOUR_JAM_ID')
  .then(r => r.json())
  .then(console.log)
```

### Step 2: Test Vote State Isolation
1. **User A**: Open jam in Browser/Device 1
2. **User B**: Open same jam in Incognito/Device 2
3. **User A**: Vote on a song (watch console logs)
4. **User B**: Refresh page (should NOT see User A's vote state)
5. **User B**: Vote on same song (should show User B's vote only)

### Step 3: Monitor Console Logs
Watch for these key log patterns:

**Server logs (terminal):**
```
🔍 GET /api/streams - jamId: [jamId]
🔍 Session user email: [email]
🔍 Found user: { id: [userId], email: [email] }
🔍 Found upvotes for user [userId]: [votes]
🔍 Stream [streamId]: votes=[total], userVoted=[user_state]
```

**Frontend logs (browser console):**
```
✅ Received N streams from API { userId: [userId], userEmail: [email] }
🎵 Stream [streamId]: votes=[total], userVoted=[user_state]
```

## 🔍 **What to Look For**

### ✅ **Expected Behavior:**
- Each user sees different `userId` in logs
- `userVoted` field is null for new users
- `userVoted` field only shows "up"/"down" for user's own votes
- Total `votes` count is consistent across all users

### ❌ **Problem Indicators:**
- Same `userId` appearing for different users
- `userVoted` showing other users' votes
- Vote counts changing based on who's viewing
- Session/database user ID mismatches

## 🎯 **Server Status**
✅ Development server running at: **http://localhost:3000**

## 📋 **Debugging Checklist**

- [ ] Test `/api/debug/user` endpoint for user identification
- [ ] Verify different users show different userIds in logs  
- [ ] Confirm new users see `userVoted: null` for all streams
- [ ] Test that voting only affects the voting user's `userVoted` state
- [ ] Verify total vote counts remain consistent
- [ ] Check that session IDs match database user IDs

## 📝 **Next Steps**
Based on the console logs, we can identify:
1. Whether the issue is user identification/authentication
2. Whether vote queries are returning correct data
3. Whether the frontend is correctly processing the data
4. If there are any cache/session conflicts

Run the tests and share the console logs to pinpoint the exact cause of the vote synchronization issue!
