# Invoice Generator - Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (Web App / Mobile App / Third-party Integration)           │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Workers                        │
│                    (Edge Runtime)                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Hono Framework (Router)                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                             │                               │
│  ┌──────────────┬───────────┴───────────┬─────────────┐    │
│  │              │                       │             │    │
│  ▼              ▼                       ▼             ▼    │
│  Auth         API Routes            Middleware    Services │
│  Middleware   Controllers           (CORS, etc)    Layer   │
│  └──────────────┴───────────┬───────────┴─────────────┘    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ SQL
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  Cloudflare D1 (SQLite)                      │
│                    + Drizzle ORM                             │
│                                                              │
│  ┌─────────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │Organizations│  │ Customers │  │ Products │  │ Configs │  │
│  └─────────────┘  └──────────┘  └──────────┘  └─────────┘  │
│                                                              │
│  ┌─────────────┐  ┌──────────┐  ┌──────────┐                │
│  │   Invoices  │  │  Items   │  │ Payments │                │
│  └─────────────┘  └──────────┘  └──────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Multi-Tenant Data Flow

```
Registration Flow:
──────────────────

User Registration Request
         │
         ▼
Create Organization Record
         │
         ▼
Create Owner User Record (linked to org)
         │
         ▼
Generate JWT Token (includes orgId)
         │
         ▼
Return Token to Client


Authenticated Request Flow:
──────────────────────────

Client Request + JWT Token
         │
         ▼
Extract orgId from Token
         │
         ▼
All DB Queries Filter by orgId
         │
         ▼
Return Organization-Isolated Data
```

## 🔐 Authentication & Authorization

```
┌─────────────────────────────────────────────────────────┐
│                   Authentication Flow                    │
└─────────────────────────────────────────────────────────┘

1. User Login
   POST /api/auth/login
   { username, password }
            │
            ▼
2. Verify Credentials
   - Hash password
   - Compare with DB
   - Check if user active
            │
            ▼
3. Generate Tokens
   - Access Token (JWT, 15min)
   - Refresh Token (JWT, 7days)
   - Include: userId, orgId, role
            │
            ▼
4. Return Tokens
   {
     accessToken: "...",
     refreshToken: "...",
     user: { id, name, role, organization }
   }

┌─────────────────────────────────────────────────────────┐
│              Protected Route Authorization               │
└─────────────────────────────────────────────────────────┘

Request with Token
Authorization: Bearer <token>
            │
            ▼
Auth Middleware
            │
            ├─ Verify JWT signature
            ├─ Check expiration
            ├─ Extract payload (userId, orgId, role)
            │
            ▼
Attach to Context
c.set('user', { id, organizationId, role })
            │
            ▼
Controller/Service
- Automatically filter by organizationId
- Check role permissions
```

## 📝 Invoice Creation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   Invoice Creation Process                   │
└─────────────────────────────────────────────────────────────┘

1. Draft Creation
   POST /api/invoices
   {
     customerId,
     invoiceType: "invoice" | "quotation",
     status: "draft",
     items: [...]
   }
            │
            ▼
2. Calculate Line Items
   For each item:
   - lineTotal = (qty × price) - discount + tax
            │
            ▼
3. Calculate Invoice Totals
   - subtotal = Σ line items
   - Get active business configs (VAT, delivery, etc.)
   - totalAmount = subtotal + configs - discounts
   - dueAmount = totalAmount
            │
            ▼
4. Save as Draft
   - Invoice record
   - Invoice items
   - Status: "draft"
            │
            ▼
5. User Can:
   ├─ Continue editing → Update draft
   ├─ Finalize → Change status to "pending"
   └─ Delete → Remove draft
            │
            ▼
6. Finalize Invoice
   POST /api/invoices/:id/finalize
   - Validate all fields
   - Generate invoice number
   - Change status: "draft" → "pending"
   - If invoice type: count towards customer account
            │
            ▼
7. Record Payment
   POST /api/invoices/:id/pay
   {
     amount,
     paymentMethod,
     paymentReference
   }
            │
            ▼
8. Update Invoice
   - Create payment record
   - paidAmount += payment.amount
   - dueAmount = totalAmount - paidAmount
   - Update status:
     • dueAmount = 0 → "paid"
     • dueAmount > 0 → "partially_paid"
     • past dueDate → "overdue"
```

## 🎨 Brand Customization Flow

```
Organization Branding:
─────────────────────

Upload Logo → Cloudflare R2/External Storage → Save URL
                                                    │
                                                    ▼
                                          Update Organization
                                          {
                                            logo: "url",
                                            primaryColor: "#...",
                                            secondaryColor: "#..."
                                          }
                                                    │
                                                    ▼
                                          Invoice Generation
                                          - Apply brand colors
                                          - Include logo
                                          - Use org info
```

## 🔄 Data Relationships

```
┌──────────────────────────────────────────────────────┐
│                Organization (Tenant)                  │
│  - id, name, logo, colors, contact info              │
└───────────────────┬──────────────────────────────────┘
                    │
      ┌─────────────┼─────────────┬─────────────┬───────────────┐
      │             │             │             │               │
      ▼             ▼             ▼             ▼               ▼
┌─────────┐   ┌──────────┐  ┌─────────┐  ┌──────────┐   ┌──────────┐
│  Users  │   │Customers │  │Products │  │ Configs  │   │ Invoices │
└─────────┘   └──────────┘  └─────────┘  └──────────┘   └────┬─────┘
                                                               │
                                                    ┌──────────┴──────────┐
                                                    │                     │
                                                    ▼                     ▼
                                              ┌───────────┐         ┌──────────┐
                                              │   Items   │         │ Payments │
                                              └───────────┘         └──────────┘
```

## 🚀 Request Lifecycle

```
1. Client Request
   ↓
2. Cloudflare Edge (Nearest Location)
   ↓
3. Worker Runtime Initialization
   ↓
4. Middleware Chain
   ├─ CORS
   ├─ Request Logger
   ├─ Authentication (if protected)
   └─ Error Handler
   ↓
5. Route Matching (Hono Router)
   ↓
6. Controller
   ├─ Request Validation (Zod)
   ├─ Extract params/body
   └─ Call Service
   ↓
7. Service Layer
   ├─ Business Logic
   ├─ Database Operations (Drizzle)
   └─ External API Calls (if needed)
   ↓
8. Database Query (D1)
   ├─ Auto-filter by organizationId
   ├─ Execute SQL
   └─ Return results
   ↓
9. Response Formation
   ├─ Format data
   ├─ Add metadata
   └─ Status codes
   ↓
10. Return to Client
```

## 📦 Module Structure

```
src/
├── index.ts                      # Entry point
├── app.module.ts                 # App configuration
│
├── database/
│   ├── connection.ts             # D1 connection
│   ├── schemas/                  # Drizzle schemas
│   │   ├── user.schema.ts
│   │   ├── customer.schema.ts
│   │   ├── product.schema.ts
│   │   ├── business-config.schema.ts
│   │   └── invoice.schema.ts
│   └── selector.ts               # Query helpers
│
├── modules/
│   ├── app/
│   │   ├── auth/                 # Authentication
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.dto.ts
│   │   │
│   │   ├── organization/         # Organization management
│   │   │   ├── organization.controller.ts
│   │   │   ├── organization.service.ts
│   │   │   └── organization.dto.ts
│   │   │
│   │   ├── customer/             # Customer management
│   │   │   ├── customer.controller.ts
│   │   │   ├── customer.service.ts
│   │   │   └── customer.dto.ts
│   │   │
│   │   ├── product/              # Product management
│   │   │   ├── product.controller.ts
│   │   │   ├── product.service.ts
│   │   │   └── product.dto.ts
│   │   │
│   │   ├── config/               # Business config
│   │   │   ├── config.controller.ts
│   │   │   ├── config.service.ts
│   │   │   └── config.dto.ts
│   │   │
│   │   └── invoice/              # Invoice management
│   │       ├── invoice.controller.ts
│   │       ├── invoice.service.ts
│   │       ├── invoice.dto.ts
│   │       └── invoice-pdf.service.ts
│   │
│   └── shared/
│       ├── helpers/
│       │   ├── jwt.service.ts
│       │   ├── bcrypt.service.ts
│       │   └── utils.service.ts
│       └── notification/
│           └── email.service.ts
│
└── wilt/                         # Framework utilities
    ├── decorators/
    ├── middleware/
    ├── utils/
    └── interfaces/
```

## 🔒 Security Considerations

### 1. Multi-Tenant Isolation
- Every query MUST filter by `organizationId`
- Middleware extracts `organizationId` from JWT
- Services automatically scope all operations

### 2. Authentication
- Passwords hashed with bcrypt
- JWT tokens with expiration
- Refresh token rotation
- Secure headers (CORS, CSP, etc.)

### 3. Authorization
- Role-based access control (owner, admin, user)
- Resource ownership validation
- API rate limiting

### 4. Data Validation
- Zod schema validation on all inputs
- SQL injection prevention (Drizzle ORM)
- XSS prevention in outputs

## 📈 Scalability

### Cloudflare Workers Benefits
- **Global Edge Network**: Low latency worldwide
- **Automatic Scaling**: Handles traffic spikes
- **Zero Cold Starts**: Always warm
- **Pay per Request**: Cost-effective

### D1 Database
- **SQLite at Edge**: Fast local queries
- **Automatic Replication**: Global read replicas
- **Consistent Writes**: Single write location

### Optimization Strategies
1. **Caching**: Cache business configs, user sessions
2. **Indexing**: Index foreign keys and frequently queried fields
3. **Pagination**: Limit large result sets
4. **Lazy Loading**: Load related data on demand
5. **Batch Operations**: Reduce round trips

## 🧪 Testing Strategy

```
Unit Tests:
- Services (business logic)
- Utilities (helpers, formatters)
- Validators (Zod schemas)

Integration Tests:
- API endpoints
- Database operations
- Authentication flow

E2E Tests:
- Full invoice creation flow
- Payment processing
- Multi-tenant isolation
```

## 🚀 Deployment Flow

```
1. Development
   pnpm start
   (Local Cloudflare Workers)
   
2. Testing
   pnpm test
   
3. Build
   pnpm build
   
4. Deploy to Staging
   pnpm deploy:staging
   
5. Deploy to Production
   pnpm deploy
   
6. Database Migrations
   pnpm drizzle-kit push
```

## 📊 Monitoring & Logging

```
Cloudflare Analytics:
- Request count
- Error rate
- Response time
- Geographic distribution

Custom Logging:
- Error tracking
- Audit logs (who did what)
- Performance metrics
- Invoice generation logs
```

## 🔮 Future Enhancements

1. **Email Notifications**
   - Invoice sent to customer
   - Payment reminders
   - Overdue notifications

2. **PDF Generation**
   - Branded invoice PDFs
   - Download/email capability

3. **Analytics Dashboard**
   - Revenue tracking
   - Customer insights
   - Product performance

4. **Recurring Invoices**
   - Subscription billing
   - Auto-generate invoices

5. **Multi-Currency Support**
   - Currency conversion
   - Multiple payment methods

6. **API Webhooks**
   - Invoice created/paid events
   - Third-party integrations

7. **Advanced Permissions**
   - Custom roles
   - Permission sets
   - Team management

---

This architecture provides a solid foundation for a scalable, secure, multi-tenant invoice generator SaaS application! 🚀

