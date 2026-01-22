# 🏛️ New Life Embassy Church Management System

An **AI-Powered Church Management System** built with Next.js, Anthropic Claude, and Prisma. This comprehensive platform helps churches manage members, track attendance, record finances, coordinate departments, and store documents - all enhanced with an intelligent AI assistant.

![Church CMS Dashboard](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Anthropic Claude](https://img.shields.io/badge/Claude-AI-purple?style=for-the-badge)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)

## ✨ Features

### 🤖 **AI Assistant Integration**
- **Conversational Interface**: Chat with Claude to manage all church operations naturally
- **Smart Automation**: AI handles data entry, generates reports, and provides insights
- **Contextual Help**: Get guidance on best practices for church management
- **Real-time Streaming**: Fast, responsive AI interactions with streaming responses

### 👥 **Member Management**
- Complete member profiles with contact information
- Track membership types (Visitor, Regular, Baptized, Partner, Leadership)
- Member statistics and growth analytics
- Search and filter capabilities
- Department membership tracking

### 📅 **Attendance Tracking**
- Create and manage church events (Services, Bible Study, Prayer Meetings, etc.)
- Record attendance for multiple members simultaneously
- Attendance reports and trends
- Individual member attendance history
- Event participation analytics

### 💰 **Finance Management**
- Record offerings by event and type (Tithes, Offerings, Special, Missions, Building Fund)
- Track donations from members and external donors
- General transaction recording (Income/Expenses)
- Financial summaries and reports
- Top donors tracking
- Expense reporting by category
- Giving trends and analytics

### 🏢 **Department Management**
- Create and manage church departments
- Assign members to departments with roles
- Track department activities and records
- Department meeting minutes and reports
- Department-specific analytics

### 📄 **Document Management**
- Upload and categorize church documents
- Document search by name, category, and tags
- Access control (Public/Private documents)
- Support for multiple file types (PDF, DOCX, XLSX, etc.)
- Organized by categories (Policy, Procedure, Report, Form, etc.)

### 📊 **Analytics & Reports**
- Comprehensive dashboard with key metrics
- Member growth trends
- Financial summaries and forecasts
- Attendance analytics
- Custom report generation
- Export capabilities

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **AI**: Anthropic Claude Sonnet 4 (claude-sonnet-4-20250514)
- **Database**: PostgreSQL with Prisma ORM
- **Architecture**: AI Agent system with tool calling
- **Deployment**: Vercel Edge Functions (serverless)

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.0 or higher
- **PostgreSQL** database (local or cloud)
- **Anthropic API Key** from [console.anthropic.com](https://console.anthropic.com/)
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Clone and Install

\`\`\`bash
git clone <repository-url>
cd church-cms
npm install
\`\`\`

### 2. Configure Environment Variables

Create a \`.env\` file in the root directory:

\`\`\`env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/church_cms"

# Anthropic AI
ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"

# Application
NEXT_PUBLIC_API_URL="http://localhost:3000"
\`\`\`

### 3. Setup Database

\`\`\`bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Optional: Open Prisma Studio to view database
npm run prisma:studio
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see your church management system!

## 📁 Project Structure

\`\`\`
church-cms/
├── app/
│   ├── api/
│   │   ├── chat/          # Main AI orchestration endpoint
│   │   │   └── route.ts
│   │   └── tools/         # Individual AI tool endpoints
│   │       ├── search_members/
│   │       ├── get_member_details/
│   │       ├── create_member/
│   │       ├── record_attendance/
│   │       ├── record_offering/
│   │       ├── get_dashboard_summary/
│   │       └── ... (more tools)
│   ├── page.tsx           # Main dashboard UI
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── lib/
│   ├── tools.ts           # AI tool definitions
│   └── tool-executor.ts   # Tool execution router
├── prisma/
│   └── schema.prisma      # Database schema
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
\`\`\`

## 🤖 AI Agent Architecture

The system uses an **agentic AI architecture** where Claude can:

1. **Understand** user requests in natural language
2. **Plan** which tools to use to accomplish the task
3. **Execute** multiple tools in sequence or parallel
4. **Synthesize** results into helpful responses

### Tool Categories

#### Member Tools
- \`search_members\` - Search and filter members
- \`get_member_details\` - Get complete member profile
- \`create_member\` - Add new member
- \`update_member\` - Update member information
- \`get_member_statistics\` - Membership analytics

#### Attendance Tools
- \`get_upcoming_events\` - List upcoming events
- \`create_event\` - Create new event
- \`record_attendance\` - Record member attendance
- \`get_attendance_report\` - Attendance analytics
- \`get_member_attendance_history\` - Individual history

#### Finance Tools
- \`record_offering\` - Record service offerings
- \`record_donation\` - Record donations
- \`record_transaction\` - Record income/expenses
- \`get_financial_summary\` - Financial overview
- \`get_giving_report\` - Donor analytics
- \`get_expense_report\` - Expense analysis

#### Department Tools
- \`get_departments\` - List departments
- \`create_department\` - Create new department
- \`add_department_member\` - Assign member to department
- \`get_department_members\` - List department members
- \`create_department_record\` - Record department activity

#### Document Tools
- \`search_documents\` - Find documents
- \`upload_document\` - Upload new document
- \`get_document\` - Get document details

#### Analytics Tools
- \`get_dashboard_summary\` - Complete dashboard metrics
- \`generate_custom_report\` - Custom reports

## 💬 AI Assistant Usage Examples

### Member Management
\`\`\`
You: "Search for members named John"
AI: [Uses search_members tool] Found 3 members named John...

You: "Add a new member: Sarah Williams, email sarah@email.com"
AI: [Uses create_member tool] Successfully created member Sarah Williams...
\`\`\`

### Finance Tracking
\`\`\`
You: "Record today's Sunday service offering of $5,240"
AI: [Uses record_offering tool] Recorded $5,240 in tithes and offerings...

You: "Show me our financial summary for this month"
AI: [Uses get_financial_summary tool] This month's summary:
    Income: $45,280, Expenses: $12,430, Balance: $32,850...
\`\`\`

### Attendance
\`\`\`
You: "Create a Bible study event for next Wednesday at 7 PM"
AI: [Uses create_event tool] Created Bible Study event for next Wednesday...

You: "What's our average Sunday attendance this month?"
AI: [Uses get_attendance_report tool] Average Sunday attendance: 287 members...
\`\`\`

## 🎨 UI Design

The UI features:
- **Elegant Typography**: Playfair Display serif for headings, Inter for body text
- **Sophisticated Color Palette**: Purple/gold gradient scheme with warm accents
- **Smooth Animations**: CSS animations and transitions for delightful interactions
- **Glassmorphism Effects**: Modern backdrop blur and transparency
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile
- **AI Chat Sidebar**: Slide-out assistant interface with streaming responses

## 🔐 Security Features

- User authentication and role-based access control (ADMIN, PASTOR, STAFF, DEPARTMENT_HEAD)
- Audit logging for all actions
- Data privacy controls (public/private documents)
- Anonymous donation support
- Session management
- Input validation and sanitization

## 📊 Database Schema

The system includes comprehensive models for:
- **Users** - Staff accounts with role-based permissions
- **Members** - Church member profiles
- **Events** - Services and church activities
- **Attendance** - Event attendance records
- **Transactions** - Financial transactions
- **Offerings** - Service-based offerings
- **Donations** - Member and external donations
- **Departments** - Church departments and teams
- **Documents** - File storage and management
- **Audit Logs** - Activity tracking

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - \`DATABASE_URL\`
   - \`ANTHROPIC_API_KEY\`
4. Deploy!

### Database Hosting

Recommended options:
- **Neon** - Serverless PostgreSQL (free tier available)
- **Supabase** - PostgreSQL with auth and storage
- **Railway** - Simple PostgreSQL hosting
- **AWS RDS** - Enterprise-grade PostgreSQL

## 🧪 Testing

\`\`\`bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

## 📈 Future Enhancements

Potential additions:
- [ ] SMS notifications for events
- [ ] Email campaign management
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced reporting with charts
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Volunteer scheduling
- [ ] Prayer request management
- [ ] Small group management
- [ ] Child check-in system
- [ ] Online giving portal
- [ ] Live streaming integration

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is proprietary software developed for New Life Embassy Church.

## 💡 Support

For questions or issues:
- Check the [documentation](docs/)
- Open an [issue](issues/)
- Contact the development team

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Anthropic Claude](https://www.anthropic.com/) - AI assistant
- [Prisma](https://www.prisma.io/) - Database ORM
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide Icons](https://lucide.dev/) - Icons

---

**Made with ❤️ for New Life Embassy Church**

*Empowering church administration through AI*
