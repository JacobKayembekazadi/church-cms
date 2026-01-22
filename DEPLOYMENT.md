# 🚀 Deployment Guide

Complete guide for deploying the New Life Embassy Church Management System to production.

## Prerequisites

Before deploying, ensure you have:
- ✅ A GitHub account
- ✅ A Vercel account (free tier works great)
- ✅ A PostgreSQL database (we recommend Neon or Supabase)
- ✅ An Anthropic API key

## Step 1: Database Setup

### Option A: Neon (Recommended - Free Tier Available)

1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project called "church-cms"
4. Copy the connection string (starts with `postgresql://`)
5. Save it for later - you'll need it for environment variables

### Option B: Supabase (Free Tier Available)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings > Database
4. Copy the connection string (Connection pooling mode)
5. Replace `[YOUR-PASSWORD]` with your database password

### Option C: Railway (Simple Hosting)

1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add a PostgreSQL database
4. Copy the connection string from Variables tab

## Step 2: Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in or create an account
3. Navigate to API Keys
4. Click "Create Key"
5. Name it "Church CMS Production"
6. Copy the key (starts with `sk-ant-api03-`)
7. **Important**: Save this key securely - you won't see it again!

## Step 3: Prepare Repository

1. **Initialize Git** (if not already done):
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit: Church Management System"
   \`\`\`

2. **Create GitHub Repository**:
   - Go to [github.com/new](https://github.com/new)
   - Name it: \`church-management-system\`
   - Set to Private (recommended for church data)
   - Don't initialize with README (we already have one)

3. **Push to GitHub**:
   \`\`\`bash
   git remote add origin https://github.com/YOUR-USERNAME/church-management-system.git
   git branch -M main
   git push -u origin main
   \`\`\`

## Step 4: Deploy to Vercel

### Via Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: \`npm run build\`
   - **Output Directory**: .next

5. **Add Environment Variables**:
   Click "Environment Variables" and add:
   
   \`\`\`
   DATABASE_URL
   Value: [Your PostgreSQL connection string from Step 1]
   
   ANTHROPIC_API_KEY
   Value: [Your Anthropic API key from Step 2]
   
   NEXT_PUBLIC_API_URL
   Value: [Leave empty - Vercel will auto-set this]
   \`\`\`

6. Click "Deploy"

### Via Vercel CLI (Alternative)

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add DATABASE_URL
vercel env add ANTHROPIC_API_KEY

# Deploy to production
vercel --prod
\`\`\`

## Step 5: Setup Database Schema

After your first deployment:

1. Go to your Vercel project dashboard
2. Navigate to "Settings" > "Environment Variables"
3. Verify DATABASE_URL is set
4. Open a terminal and run:

\`\`\`bash
# Connect to production database
DATABASE_URL="[your-production-db-url]" npm run prisma:push

# Alternatively, use Prisma Studio to verify
DATABASE_URL="[your-production-db-url]" npm run prisma:studio
\`\`\`

## Step 6: Initial Data Setup

### Create First Admin User

Since the system doesn't have public registration, you'll need to create the first admin user directly in the database:

1. Open Prisma Studio:
   \`\`\`bash
   DATABASE_URL="[your-production-db-url]" npm run prisma:studio
   \`\`\`

2. Navigate to the \`User\` model

3. Click "Add record" and fill in:
   \`\`\`
   email: pastor@newlifeembassy.org
   password: [hashed-password - see note below]
   name: Pastor [Name]
   role: ADMIN
   isActive: true
   \`\`\`

   **Note**: For production, implement proper password hashing using bcrypt. For testing, you can use a placeholder, but implement authentication before launch.

### Optional: Seed Sample Data

Create a file \`prisma/seed.ts\`:

\`\`\`typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample departments
  const evangelism = await prisma.department.create({
    data: {
      name: 'Evangelism',
      type: 'EVANGELISM',
      description: 'Outreach and evangelism ministry'
    }
  });

  const ushering = await prisma.department.create({
    data: {
      name: 'Ushering',
      type: 'USHERING',
      description: 'Welcome and ushering team'
    }
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
\`\`\`

Run the seed:
\`\`\`bash
npm run prisma:seed
\`\`\`

## Step 7: Custom Domain (Optional)

1. Go to your Vercel project
2. Navigate to "Settings" > "Domains"
3. Add your custom domain (e.g., \`cms.newlifeembassy.org\`)
4. Follow Vercel's DNS configuration instructions
5. SSL certificate is automatically provisioned

## Step 8: Post-Deployment Checklist

- [ ] Test the AI assistant chat
- [ ] Create a test member
- [ ] Create a test event
- [ ] Record test attendance
- [ ] Record test offering
- [ ] Verify all tools are working
- [ ] Check dashboard statistics
- [ ] Test on mobile device
- [ ] Verify SSL certificate is active
- [ ] Set up monitoring (Vercel Analytics included)

## Monitoring & Maintenance

### Vercel Analytics

1. Enable in project settings
2. View real-time analytics
3. Track API usage and errors

### Database Monitoring

1. **Neon**: Check dashboard for connection stats
2. **Supabase**: Use built-in monitoring tools
3. Set up alerts for high usage

### API Usage Monitoring

1. Track Anthropic API usage at [console.anthropic.com](https://console.anthropic.com)
2. Set up billing alerts
3. Monitor monthly usage

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

1. Verify DATABASE_URL is correctly set in Vercel
2. Check if database allows connections from Vercel's IP ranges
3. For Neon: Enable "Pooling" mode
4. For Supabase: Use "Connection Pooling" URL

### AI Assistant Not Responding

1. Verify ANTHROPIC_API_KEY is set correctly
2. Check API key has sufficient credits
3. Review Vercel Function logs
4. Ensure Edge runtime is enabled

### Build Failures

Common fixes:
\`\`\`bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Verify Prisma client
npm run prisma:generate
\`\`\`

## Security Best Practices

1. **Never commit .env files**
2. **Use environment variables** for all secrets
3. **Enable Vercel security headers**
4. **Implement authentication** before going live
5. **Regular database backups**
6. **Monitor error logs** regularly
7. **Keep dependencies updated**

## Scaling Considerations

As your church grows:

1. **Database**: Upgrade to paid tier for more storage
2. **Vercel**: Monitor function execution times
3. **AI Costs**: Track Claude API usage
4. **Backups**: Implement automated database backups
5. **CDN**: Use Vercel's built-in CDN for static assets

## Support

If you encounter issues:
1. Check Vercel logs: Project > Logs
2. Review database logs
3. Check Anthropic API status
4. Consult documentation
5. Open an issue on GitHub

## Costs Estimate

**Free Tier** (Getting Started):
- Vercel: Free (Hobby plan)
- Neon: Free (512 MB storage)
- Anthropic: Pay-as-you-go (~$0.03 per 1K input tokens)

**Estimated Monthly** (100 members, active usage):
- Vercel: $0 (within free limits)
- Database: $0-$10 (depends on storage)
- Anthropic AI: $10-$50 (depends on usage)

**Total**: $10-$60/month for small to medium church

---

**🎉 Congratulations!** Your church management system is now live!

Remember to test thoroughly before rolling out to your congregation.
