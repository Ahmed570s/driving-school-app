# Easy Database Seeding Instructions 🚀

## Quick Overview
This creates **14 users total**:
- **1 Admin** (Sarah Anderson)
- **3 Instructors** (David, Lisa, James)  
- **10 Students** (including Emma Wilson & John Smith with full profiles)

## Step 1: Create Users in Supabase Auth 👥

1. Go to your **Supabase project dashboard**
2. Click **Authentication** → **Users** → **Add user**
3. Create these **14 users** with these exact emails:

### 1 Admin:
- `admin@example.com` (password: `admin`)

### 3 Instructors:
- `david.instructor@example.com` (password: `instructor`)
- `lisa.instructor@example.com` (password: `instructor`) 
- `james.instructor@example.com` (password: `instructor`)

### 10 Students:
- `emma.wilson@example.com` (password: `student`) ← **Full profile**
- `john.smith@example.com` (password: `student`) ← **Full profile**
- `alice.brown@example.com` (password: `student`)
- `robert.johnson@example.com` (password: `student`)
- `sarah.davis@example.com` (password: `student`)
- `michael.taylor@example.com` (password: `student`)
- `jessica.martinez@example.com` (password: `student`)
- `daniel.white@example.com` (password: `student`)
- `emily.anderson@example.com` (password: `student`)
- `kevin.thompson@example.com` (password: `student`)

## Step 2: Run the Seed Script 📊

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Open `docs/seed-data-working.sql`
4. **Copy the entire file** and paste it into the SQL Editor
5. Click **Run** 🎯

## Step 3: Verify It Worked ✅

The script includes verification queries at the bottom. You should see:

```
Users by Role:
- admin: 1
- instructor: 3  
- student: 10

Students by Status:
- active: 6
- completed: 1
- on_hold: 1
- dropped: 1

Featured Students:
- Emma Wilson (DS2024001): Phase 2, 24 hrs total
- John Smith (DS2024002): Phase 3, 36 hrs total
```

## What Gets Created 🎉

- **Complete user profiles** with addresses, phones, etc.
- **4 Groups** for theory classes (A, B, C, D)
- **12 Classes** (6 theory group classes + 6 practical individual lessons)
- **Class attendances** with signatures and feedback
- **Documents** for Emma and John (contracts, licenses, etc.)
- **System settings** for school configuration
- **Activity logs** for audit trail

## Test Login Credentials 🔑

After seeding, you can test with:
- **Admin**: `admin@example.com` / `admin`
- **Emma Wilson**: `emma.wilson@example.com` / `student`
- **John Smith**: `john.smith@example.com` / `student`

## Why This Works ✅

This script **uses real Supabase Auth UUIDs** instead of hardcoded ones, so it respects all foreign key constraints and works with your RLS policies.

## Next Steps 🚀

After successful seeding:
1. Generate TypeScript types: `supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts`
2. Update your backend plan to mark seeding as complete ✅
3. Test your frontend with real data!

---

**🎯 Total Time**: ~5-10 minutes to create all users and run the script 