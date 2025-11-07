# TradeHub Setup Checklist

Use this checklist to ensure you've completed all setup steps correctly.

## ✅ Pre-Setup

- [ ] Node.js 18+ installed on your computer
- [ ] Code editor installed (VS Code recommended)
- [ ] Git installed (optional, for version control)
- [ ] Modern web browser (Chrome, Firefox, Edge)

## ✅ Step 1: Install Dependencies

- [ ] Open Command Prompt or PowerShell in project folder
- [ ] Run `npm install`
- [ ] Wait for installation to complete (may take 2-3 minutes)
- [ ] Verify no error messages appear
- [ ] Check that `node_modules` folder was created

## ✅ Step 2: Supabase Account Setup

- [ ] Go to https://supabase.com
- [ ] Sign up for free account (or sign in)
- [ ] Verify email address
- [ ] Create new organization (if first time)
- [ ] Create new project
  - [ ] Choose project name (e.g., "tradehub")
  - [ ] Set database password (save it somewhere safe)
  - [ ] Select region (Europe recommended for Nigeria)
  - [ ] Choose free tier
- [ ] Wait for project to finish setting up (~2 minutes)

## ✅ Step 3: Database Configuration

- [ ] In Supabase dashboard, click "SQL Editor" in sidebar
- [ ] Click "New Query"
- [ ] Open `database.sql` file from project
- [ ] Copy the CREATE TABLE and policies SQL
- [ ] Paste into Supabase SQL Editor
- [ ] Click "Run" button
- [ ] Verify "Success. No rows returned" message
- [ ] (Optional) Run the sample data INSERT statements
- [ ] Verify sample listings appear in Table Editor

## ✅ Step 4: Get Supabase Credentials

- [ ] In Supabase, click Settings (gear icon) in sidebar
- [ ] Click "API" under Project Settings
- [ ] Copy "Project URL" (starts with https://)
- [ ] Copy "anon public" key (long string under Project API keys)
- [ ] Keep these values handy for next step

## ✅ Step 5: Environment Variables

- [ ] In project folder, find `.env.local.example`
- [ ] Copy it and rename to `.env.local`
  - Windows: `copy .env.local.example .env.local`
  - Mac/Linux: `cp .env.local.example .env.local`
- [ ] Open `.env.local` in your code editor
- [ ] Replace `your_supabase_project_url` with your Project URL
- [ ] Replace `your_supabase_anon_key` with your anon key
- [ ] Save the file
- [ ] Verify no extra spaces or quotes around values

## ✅ Step 6: Run Development Server

- [ ] Open Command Prompt/PowerShell in project folder
- [ ] Run `npm run dev`
- [ ] Wait for "Ready" message
- [ ] Verify it says "Local: http://localhost:3000"
- [ ] Keep this terminal window open

## ✅ Step 7: Test the Application

### Homepage Test
- [ ] Open browser to http://localhost:3000
- [ ] Page loads without errors
- [ ] Header shows "TradeHub" logo
- [ ] "Post Item" button visible in header
- [ ] If sample data added: listings appear in grid
- [ ] If no data: "No listings yet" message appears

### Post Listing Test
- [ ] Click "Post Item" button
- [ ] Form appears with all fields
- [ ] Fill in test listing:
  - [ ] Title: "Test Item"
  - [ ] Description: "This is a test"
  - [ ] Price: 10000
  - [ ] Location: "Lagos"
  - [ ] Your Name: "Test User"
  - [ ] WhatsApp: "+2348012345678"
  - [ ] Image URL: (optional) paste any image URL
- [ ] Click "Post Item" button
- [ ] Loading state appears briefly
- [ ] Redirects to listing detail page
- [ ] All information displays correctly

### View Listing Test
- [ ] From homepage, click on any listing card
- [ ] Listing detail page loads
- [ ] Image displays (or placeholder if no image)
- [ ] Title, price, location, seller name visible
- [ ] Description shows full text
- [ ] "Contact Seller on WhatsApp" button visible
- [ ] Click WhatsApp button
- [ ] WhatsApp opens with pre-filled message (if WhatsApp installed)

### Responsive Design Test
- [ ] Resize browser window to mobile size
- [ ] Layout adjusts properly
- [ ] All text readable
- [ ] Buttons still clickable
- [ ] Images scale correctly

## ✅ Step 8: Verify Database

- [ ] Go back to Supabase dashboard
- [ ] Click "Table Editor" in sidebar
- [ ] Click "listings" table
- [ ] Your test listing appears in the table
- [ ] All fields populated correctly
- [ ] `created_at` timestamp is recent

## ✅ Step 9: Error Checking

- [ ] Check browser console (F12) for errors
- [ ] Check terminal for server errors
- [ ] Verify no red error messages anywhere
- [ ] Test creating multiple listings
- [ ] Verify all listings appear on homepage

## ✅ Step 10: Production Preparation (Optional)

### GitHub Setup
- [ ] Create GitHub account (if needed)
- [ ] Create new repository
- [ ] Initialize git in project: `git init`
- [ ] Add files: `git add .`
- [ ] Commit: `git commit -m "Initial commit"`
- [ ] Add remote: `git remote add origin <your-repo-url>`
- [ ] Push: `git push -u origin main`

### Vercel Deployment
- [ ] Go to https://vercel.com
- [ ] Sign up/Sign in with GitHub
- [ ] Click "New Project"
- [ ] Import your GitHub repository
- [ ] Add environment variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Visit your production URL
- [ ] Test all features in production

## 🐛 Troubleshooting Checklist

If something doesn't work, check:

- [ ] Node modules installed (`node_modules` folder exists)
- [ ] `.env.local` file exists and has correct values
- [ ] No extra spaces in environment variables
- [ ] Supabase project is active (not paused)
- [ ] Database table created successfully
- [ ] Row Level Security policies enabled
- [ ] Port 3000 not already in use
- [ ] No firewall blocking localhost
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] Development server running (terminal shows "Ready")

## 📝 Common Issues

### "Cannot find module" errors
**Solution**: Run `npm install` again

### "Failed to fetch listings" error
**Solution**: Check `.env.local` has correct Supabase credentials

### "Port 3000 already in use"
**Solution**: Stop other dev servers or use different port: `npm run dev -- -p 3001`

### WhatsApp button doesn't work
**Solution**: Make sure phone number includes country code (+234)

### Images not loading
**Solution**: Check image URL is valid and publicly accessible

### Listings not appearing
**Solution**: 
1. Check Supabase Table Editor to see if data exists
2. Check browser console for errors
3. Verify RLS policies are set correctly

## ✨ Success Criteria

Your setup is complete when:

- ✅ Homepage loads and displays listings
- ✅ You can create new listings via the form
- ✅ New listings appear on homepage immediately
- ✅ Clicking a listing shows full details
- ✅ WhatsApp button generates correct link
- ✅ No errors in browser console or terminal
- ✅ App works on both desktop and mobile views

## 🎉 Next Steps After Setup

1. **Customize**: Update colors, fonts, or layout to match your brand
2. **Test**: Create various types of listings to test edge cases
3. **Share**: Deploy to Vercel and share with friends
4. **Iterate**: Gather feedback and add new features
5. **Monitor**: Check Supabase dashboard for usage stats

## 📚 Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vercel Deployment**: https://vercel.com/docs

---

**Need Help?**
- Read SETUP.md for detailed instructions
- Check ARCHITECTURE.md to understand how it works
- Review PROJECT_SUMMARY.md for feature overview
