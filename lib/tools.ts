// AI Agent Tool Definitions for Church Management System
import { Tool } from '@anthropic-ai/sdk/resources/messages';

export const churchManagementTools: Tool[] = [
  // ==================== MEMBER MANAGEMENT ====================
  {
    name: "search_members",
    description: "Search church members by name, email, phone, or membership status. Use for finding member information, checking membership status, or getting member lists.",
    input_schema: {
      type: "object",
      properties: {
        query: { 
          type: "string", 
          description: "Search term (name, email, or phone)" 
        },
        status: {
          type: "string",
          enum: ["ACTIVE", "INACTIVE", "TRANSFERRED", "ALL"],
          description: "Filter by membership status (default: ALL)"
        },
        membershipType: {
          type: "string",
          enum: ["VISITOR", "REGULAR", "BAPTIZED", "PARTNER", "LEADERSHIP", "ALL"],
          description: "Filter by membership type (default: ALL)"
        },
        limit: { 
          type: "number", 
          description: "Maximum results to return (default: 10)" 
        }
      }
    }
  },
  {
    name: "get_member_details",
    description: "Get complete profile information for a specific member including contact details, membership info, attendance history, and giving records.",
    input_schema: {
      type: "object",
      properties: {
        memberId: { 
          type: "string", 
          description: "Member ID" 
        }
      },
      required: ["memberId"]
    }
  },
  {
    name: "create_member",
    description: "Create a new member profile with contact information and membership details.",
    input_schema: {
      type: "object",
      properties: {
        firstName: { type: "string", description: "First name" },
        lastName: { type: "string", description: "Last name" },
        email: { type: "string", description: "Email address" },
        phone: { type: "string", description: "Phone number" },
        dateOfBirth: { type: "string", description: "Date of birth (ISO format)" },
        gender: { type: "string", enum: ["MALE", "FEMALE", "OTHER"] },
        address: { type: "string", description: "Street address" },
        city: { type: "string" },
        state: { type: "string" },
        zipCode: { type: "string" },
        membershipType: { 
          type: "string", 
          enum: ["VISITOR", "REGULAR", "BAPTIZED", "PARTNER", "LEADERSHIP"],
          description: "Type of membership (default: REGULAR)"
        },
        emergencyContact: { type: "string" },
        emergencyPhone: { type: "string" },
        notes: { type: "string" }
      },
      required: ["firstName", "lastName"]
    }
  },
  {
    name: "update_member",
    description: "Update an existing member's profile information.",
    input_schema: {
      type: "object",
      properties: {
        memberId: { type: "string", description: "Member ID to update" },
        updates: {
          type: "object",
          description: "Fields to update (only include fields that need updating)"
        }
      },
      required: ["memberId", "updates"]
    }
  },
  {
    name: "get_member_statistics",
    description: "Get statistical overview of church membership including total members, new members this month, membership breakdown by type, age demographics, etc.",
    input_schema: {
      type: "object",
      properties: {
        period: {
          type: "string",
          enum: ["week", "month", "quarter", "year", "all_time"],
          description: "Time period for statistics (default: month)"
        }
      }
    }
  },

  // ==================== ATTENDANCE MANAGEMENT ====================
  {
    name: "get_upcoming_events",
    description: "Get list of upcoming church events and services.",
    input_schema: {
      type: "object",
      properties: {
        days: { 
          type: "number", 
          description: "Number of days ahead to look (default: 30)" 
        },
        eventType: {
          type: "string",
          enum: ["SUNDAY_SERVICE", "MIDWEEK_SERVICE", "PRAYER_MEETING", "BIBLE_STUDY", "YOUTH_SERVICE", "CHILDREN_SERVICE", "SPECIAL_EVENT", "ALL"],
          description: "Filter by event type (default: ALL)"
        }
      }
    }
  },
  {
    name: "create_event",
    description: "Create a new church event or service.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Event name" },
        type: {
          type: "string",
          enum: ["SUNDAY_SERVICE", "MIDWEEK_SERVICE", "PRAYER_MEETING", "BIBLE_STUDY", "YOUTH_SERVICE", "CHILDREN_SERVICE", "SPECIAL_EVENT", "CONFERENCE", "RETREAT", "OUTREACH", "OTHER"]
        },
        date: { type: "string", description: "Event date (ISO format)" },
        startTime: { type: "string", description: "Start time (HH:MM format)" },
        endTime: { type: "string", description: "End time (HH:MM format)" },
        location: { type: "string" },
        description: { type: "string" }
      },
      required: ["name", "type", "date"]
    }
  },
  {
    name: "record_attendance",
    description: "Record attendance for a member at an event. Can record multiple members at once.",
    input_schema: {
      type: "object",
      properties: {
        eventId: { type: "string", description: "Event ID" },
        memberIds: { 
          type: "array", 
          items: { type: "string" },
          description: "Array of member IDs who attended" 
        },
        notes: { type: "string", description: "Optional notes about attendance" }
      },
      required: ["eventId", "memberIds"]
    }
  },
  {
    name: "get_attendance_report",
    description: "Get attendance statistics and reports for events. Shows attendance trends, most active members, and event participation rates.",
    input_schema: {
      type: "object",
      properties: {
        eventId: { 
          type: "string", 
          description: "Specific event ID (optional - leave empty for overall stats)" 
        },
        startDate: { type: "string", description: "Start date for report (ISO format)" },
        endDate: { type: "string", description: "End date for report (ISO format)" },
        groupBy: {
          type: "string",
          enum: ["event", "member", "date", "event_type"],
          description: "How to group the attendance data"
        }
      }
    }
  },
  {
    name: "get_member_attendance_history",
    description: "Get attendance history for a specific member showing all events they attended.",
    input_schema: {
      type: "object",
      properties: {
        memberId: { type: "string", description: "Member ID" },
        startDate: { type: "string", description: "Start date (ISO format)" },
        endDate: { type: "string", description: "End date (ISO format)" },
        limit: { type: "number", description: "Max records to return (default: 50)" }
      },
      required: ["memberId"]
    }
  },

  // ==================== FINANCE MANAGEMENT ====================
  {
    name: "record_offering",
    description: "Record offerings collected during a church service or event.",
    input_schema: {
      type: "object",
      properties: {
        eventId: { type: "string", description: "Event ID where offering was collected" },
        offeringType: {
          type: "string",
          enum: ["TITHES", "OFFERINGS", "SPECIAL_OFFERING", "MISSIONS", "BUILDING_FUND", "OTHER"]
        },
        amount: { type: "number", description: "Total amount collected" },
        currency: { type: "string", description: "Currency code (default: USD)" },
        notes: { type: "string" }
      },
      required: ["eventId", "offeringType", "amount"]
    }
  },
  {
    name: "record_donation",
    description: "Record a donation from a member or external donor.",
    input_schema: {
      type: "object",
      properties: {
        memberId: { type: "string", description: "Member ID (optional if anonymous)" },
        donorName: { type: "string", description: "Name if not a member" },
        amount: { type: "number", description: "Donation amount" },
        currency: { type: "string", description: "Currency code (default: USD)" },
        purpose: { type: "string", description: "Purpose of donation" },
        method: {
          type: "string",
          enum: ["CASH", "CHECK", "CREDIT_CARD", "BANK_TRANSFER", "MOBILE_MONEY", "ONLINE", "OTHER"]
        },
        reference: { type: "string", description: "Transaction reference number" },
        isAnonymous: { type: "boolean", description: "Whether donor wants to remain anonymous" },
        date: { type: "string", description: "Date of donation (ISO format)" },
        notes: { type: "string" }
      },
      required: ["amount", "method"]
    }
  },
  {
    name: "record_transaction",
    description: "Record a general financial transaction (income or expense).",
    input_schema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["INCOME", "EXPENSE"],
          description: "Transaction type"
        },
        category: { 
          type: "string", 
          description: "Category (e.g., 'Utilities', 'Salaries', 'Offerings', 'Rent')" 
        },
        amount: { type: "number", description: "Transaction amount" },
        description: { type: "string", description: "Transaction description" },
        reference: { type: "string", description: "Reference number or invoice ID" },
        date: { type: "string", description: "Transaction date (ISO format)" }
      },
      required: ["type", "category", "amount", "description"]
    }
  },
  {
    name: "get_financial_summary",
    description: "Get financial summary including total income, expenses, offerings, donations, and balance for a specified period.",
    input_schema: {
      type: "object",
      properties: {
        startDate: { type: "string", description: "Start date (ISO format)" },
        endDate: { type: "string", description: "End date (ISO format)" },
        groupBy: {
          type: "string",
          enum: ["day", "week", "month", "quarter", "year"],
          description: "How to group the financial data"
        }
      },
      required: ["startDate", "endDate"]
    }
  },
  {
    name: "get_giving_report",
    description: "Get detailed giving report showing top donors, giving trends, and category breakdowns.",
    input_schema: {
      type: "object",
      properties: {
        startDate: { type: "string", description: "Start date (ISO format)" },
        endDate: { type: "string", description: "End date (ISO format)" },
        memberId: { type: "string", description: "Specific member ID (optional)" },
        includeAnonymous: { 
          type: "boolean", 
          description: "Include anonymous donations in totals (default: true)" 
        }
      },
      required: ["startDate", "endDate"]
    }
  },
  {
    name: "get_expense_report",
    description: "Get expense report showing spending by category, trends, and budget compliance.",
    input_schema: {
      type: "object",
      properties: {
        startDate: { type: "string", description: "Start date (ISO format)" },
        endDate: { type: "string", description: "End date (ISO format)" },
        category: { type: "string", description: "Filter by specific category (optional)" }
      },
      required: ["startDate", "endDate"]
    }
  },

  // ==================== DEPARTMENT MANAGEMENT ====================
  {
    name: "get_departments",
    description: "Get list of all church departments with their details.",
    input_schema: {
      type: "object",
      properties: {
        isActive: { 
          type: "boolean", 
          description: "Filter by active status (leave empty for all)" 
        },
        type: {
          type: "string",
          enum: ["ADMINISTRATION", "EVANGELISM", "USHERING", "MEDIA", "WORSHIP", "CHILDREN", "YOUTH", "PRAYER", "WELFARE", "SECURITY", "FINANCE", "OTHER", "ALL"],
          description: "Filter by department type"
        }
      }
    }
  },
  {
    name: "create_department",
    description: "Create a new church department.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Department name" },
        description: { type: "string", description: "Department description" },
        type: {
          type: "string",
          enum: ["ADMINISTRATION", "EVANGELISM", "USHERING", "MEDIA", "WORSHIP", "CHILDREN", "YOUTH", "PRAYER", "WELFARE", "SECURITY", "FINANCE", "OTHER"]
        },
        headId: { type: "string", description: "Member ID of department head" }
      },
      required: ["name", "type"]
    }
  },
  {
    name: "add_department_member",
    description: "Add a member to a department with specified role.",
    input_schema: {
      type: "object",
      properties: {
        departmentId: { type: "string", description: "Department ID" },
        memberId: { type: "string", description: "Member ID to add" },
        role: { type: "string", description: "Role in department (e.g., 'Head', 'Assistant', 'Member')" }
      },
      required: ["departmentId", "memberId"]
    }
  },
  {
    name: "get_department_members",
    description: "Get all members of a specific department.",
    input_schema: {
      type: "object",
      properties: {
        departmentId: { type: "string", description: "Department ID" },
        isActive: { type: "boolean", description: "Filter by active status" }
      },
      required: ["departmentId"]
    }
  },
  {
    name: "create_department_record",
    description: "Create a record or note for a department (meeting minutes, activity reports, plans, etc.).",
    input_schema: {
      type: "object",
      properties: {
        departmentId: { type: "string", description: "Department ID" },
        title: { type: "string", description: "Record title" },
        description: { type: "string", description: "Detailed description" },
        recordType: { 
          type: "string", 
          description: "Type of record (e.g., 'Meeting Minutes', 'Activity Report', 'Plan')" 
        },
        data: { 
          type: "object", 
          description: "Additional structured data (optional)" 
        }
      },
      required: ["departmentId", "title", "recordType"]
    }
  },
  {
    name: "get_department_records",
    description: "Get records for a department.",
    input_schema: {
      type: "object",
      properties: {
        departmentId: { type: "string", description: "Department ID" },
        recordType: { type: "string", description: "Filter by record type" },
        limit: { type: "number", description: "Max records to return (default: 20)" }
      },
      required: ["departmentId"]
    }
  },

  // ==================== DOCUMENT MANAGEMENT ====================
  {
    name: "search_documents",
    description: "Search church documents by name, category, or tags.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search term" },
        category: {
          type: "string",
          enum: ["POLICY", "PROCEDURE", "REPORT", "FORM", "MINUTES", "PRESENTATION", "FINANCIAL", "LEGAL", "OTHER", "ALL"],
          description: "Filter by document category"
        },
        isPublic: { type: "boolean", description: "Filter by public/private status" },
        limit: { type: "number", description: "Max results (default: 10)" }
      }
    }
  },
  {
    name: "upload_document",
    description: "Upload a new document to the system.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Document name" },
        description: { type: "string", description: "Document description" },
        fileUrl: { type: "string", description: "URL where file is stored" },
        fileType: { type: "string", description: "File type (e.g., 'pdf', 'docx', 'xlsx')" },
        fileSize: { type: "number", description: "File size in bytes" },
        category: {
          type: "string",
          enum: ["POLICY", "PROCEDURE", "REPORT", "FORM", "MINUTES", "PRESENTATION", "FINANCIAL", "LEGAL", "OTHER"]
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tags for categorization"
        },
        isPublic: { 
          type: "boolean", 
          description: "Whether document is publicly accessible" 
        }
      },
      required: ["name", "fileUrl", "fileType", "fileSize", "category"]
    }
  },
  {
    name: "get_document",
    description: "Get details of a specific document including download link.",
    input_schema: {
      type: "object",
      properties: {
        documentId: { type: "string", description: "Document ID" }
      },
      required: ["documentId"]
    }
  },

  // ==================== USER & ACCESS MANAGEMENT ====================
  {
    name: "get_staff_users",
    description: "Get list of staff users who have access to the system.",
    input_schema: {
      type: "object",
      properties: {
        role: {
          type: "string",
          enum: ["ADMIN", "PASTOR", "STAFF", "DEPARTMENT_HEAD", "ALL"],
          description: "Filter by user role"
        },
        isActive: { type: "boolean", description: "Filter by active status" }
      }
    }
  },
  {
    name: "create_staff_user",
    description: "Create a new staff user account with system access.",
    input_schema: {
      type: "object",
      properties: {
        email: { type: "string", description: "Email address (used for login)" },
        password: { type: "string", description: "Initial password" },
        name: { type: "string", description: "Full name" },
        role: {
          type: "string",
          enum: ["ADMIN", "PASTOR", "STAFF", "DEPARTMENT_HEAD"],
          description: "User role determining permissions"
        }
      },
      required: ["email", "password", "name", "role"]
    }
  },

  // ==================== ANALYTICS & REPORTS ====================
  {
    name: "get_dashboard_summary",
    description: "Get comprehensive dashboard summary with key metrics: total members, recent attendance, financial overview, upcoming events, and growth trends.",
    input_schema: {
      type: "object",
      properties: {
        period: {
          type: "string",
          enum: ["week", "month", "quarter", "year"],
          description: "Time period for metrics (default: month)"
        }
      }
    }
  },
  {
    name: "generate_custom_report",
    description: "Generate a custom report combining multiple data sources. Useful for board meetings, annual reports, or specific analysis requests.",
    input_schema: {
      type: "object",
      properties: {
        reportType: {
          type: "string",
          enum: ["membership_growth", "financial_summary", "attendance_trends", "giving_analysis", "department_activity", "comprehensive"],
          description: "Type of report to generate"
        },
        startDate: { type: "string", description: "Start date (ISO format)" },
        endDate: { type: "string", description: "End date (ISO format)" },
        format: {
          type: "string",
          enum: ["json", "summary"],
          description: "Output format (default: summary)"
        }
      },
      required: ["reportType", "startDate", "endDate"]
    }
  }
];

// System prompt for the church management AI assistant
export const systemPrompt = `You are an AI assistant for the New Life Embassy Church Management System. You help church administrators, pastors, and staff manage:

- Member profiles and information
- Attendance tracking for services and events  
- Financial records (offerings, donations, expenses)
- Department management and coordination
- Document storage and retrieval
- User access and permissions

When users ask questions or request actions:
1. Use the appropriate tools to access and manage church data
2. Provide clear, helpful responses with relevant details
3. Suggest related actions that might be useful
4. Maintain appropriate confidentiality and data privacy
5. For financial matters, always be accurate and professional

For data entry tasks, confirm the details before executing. For queries, provide comprehensive but concise information. Always be respectful of the church context and sensitive information.

When generating reports or summaries, present data in a clear, organized format that's easy to understand for church leadership.`;
