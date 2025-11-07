# TradeHub Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
│                    (Desktop/Mobile/Tablet)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    NEXT.JS 15 APP                            │
│                   (Vercel Deployment)                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              SERVER COMPONENTS                        │  │
│  │  • app/page.tsx (Homepage)                           │  │
│  │  • app/listings/[id]/page.tsx (Listing Details)     │  │
│  │  • Fetch data server-side                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              CLIENT COMPONENTS                        │  │
│  │  • app/listings/new/page.tsx (Post Form)            │  │
│  │  • Interactive forms and state                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 API ROUTES                            │  │
│  │  • GET  /api/listings (Fetch all)                   │  │
│  │  • POST /api/listings (Create new)                   │  │
│  │  • GET  /api/listings/[id] (Fetch one)              │  │
│  └──────────────────────┬───────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          │ Supabase Client
                          │ (REST API)
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    SUPABASE BACKEND                          │
│                  (Database as a Service)                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              PostgreSQL DATABASE                      │  │
│  │                                                       │  │
│  │  Table: listings                                     │  │
│  │  ├── id (UUID)                                       │  │
│  │  ├── title (TEXT)                                    │  │
│  │  ├── description (TEXT)                              │  │
│  │  ├── price (NUMERIC)                                 │  │
│  │  ├── location (TEXT)                                 │  │
│  │  ├── seller_name (TEXT)                              │  │
│  │  ├── seller_phone (TEXT)                             │  │
│  │  ├── image_url (TEXT)                                │  │
│  │  └── created_at (TIMESTAMP)                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           ROW LEVEL SECURITY (RLS)                    │  │
│  │  • SELECT: Public (anyone can read)                  │  │
│  │  • INSERT: Public (anyone can create)                │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                          │
                          │ WhatsApp API
                          │ (External)
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    WHATSAPP MESSAGING                        │
│              (Direct contact with sellers)                   │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Browse Listings (Homepage)

```
User visits homepage
    ↓
Server Component (app/page.tsx)
    ↓
Fetch from /api/listings
    ↓
API Route queries Supabase
    ↓
Supabase returns all listings (ordered by created_at DESC)
    ↓
Server renders HTML with listings
    ↓
User sees grid of ListingCard components
```

### 2. View Single Listing

```
User clicks on a listing card
    ↓
Navigate to /listings/[id]
    ↓
Server Component (app/listings/[id]/page.tsx)
    ↓
Fetch from /api/listings/[id]
    ↓
API Route queries Supabase for specific listing
    ↓
Supabase returns single listing or 404
    ↓
Server renders listing details
    ↓
User sees full listing with WhatsApp button
```

### 3. Post New Listing

```
User clicks "Post Item" button
    ↓
Navigate to /listings/new
    ↓
Client Component renders form
    ↓
User fills form and submits
    ↓
Client-side validation
    ↓
POST request to /api/listings
    ↓
API Route validates and inserts into Supabase
    ↓
Supabase returns new listing with ID
    ↓
Client redirects to /listings/[new-id]
    ↓
User sees their newly created listing
```

### 4. Contact Seller

```
User clicks "Contact Seller on WhatsApp"
    ↓
Client generates WhatsApp URL with:
  - Seller's phone number
  - Pre-filled message with listing title and price
    ↓
Opens WhatsApp in new tab/app
    ↓
User can message seller directly
```

## Component Hierarchy

```
RootLayout (app/layout.tsx)
├── Header (components/Header.tsx)
│   ├── Logo/Home Link
│   └── "Post Item" Button
│
└── Main Content (children)
    │
    ├── Homepage (app/page.tsx)
    │   └── Grid of ListingCard (components/ListingCard.tsx)
    │       ├── Image (Next.js Image)
    │       ├── Title
    │       ├── Price (formatted)
    │       ├── Location
    │       └── Timestamp (relative)
    │
    ├── Single Listing (app/listings/[id]/page.tsx)
    │   ├── Back Link
    │   ├── Large Image
    │   ├── Title
    │   ├── Price
    │   ├── Seller Info
    │   ├── Description
    │   └── WhatsApp Button
    │
    └── New Listing Form (app/listings/new/page.tsx)
        ├── Title Input
        ├── Description Textarea
        ├── Price Input
        ├── Location Input
        ├── Seller Name Input
        ├── Phone Input
        ├── Image URL Input
        ├── Submit Button
        └── Cancel Button
```

## API Endpoints

### GET /api/listings
**Purpose**: Fetch all listings  
**Method**: GET  
**Response**: Array of Listing objects  
**Sorting**: created_at DESC (newest first)  
**Cache**: No cache (cache: 'no-store')

### POST /api/listings
**Purpose**: Create new listing  
**Method**: POST  
**Body**: NewListing object (without id, created_at)  
**Validation**: Required fields checked  
**Response**: Created Listing object with id  
**Status**: 201 Created on success

### GET /api/listings/[id]
**Purpose**: Fetch single listing by ID  
**Method**: GET  
**Params**: id (UUID)  
**Response**: Single Listing object  
**Status**: 404 if not found

## State Management

### Server State
- Listings data fetched on server
- No client-side state management library needed
- React Server Components handle data fetching

### Client State
- Form state in new listing page (useState)
- Loading states for async operations
- Error states for user feedback

## Styling Architecture

### Tailwind CSS Utility Classes
- Mobile-first responsive design
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Custom colors in tailwind.config.ts
- Global styles in app/globals.css

### Component Styling
- Inline Tailwind classes
- No CSS modules or styled-components
- Consistent spacing and colors

## Security Model

### No Authentication
- Intentionally public for MVP
- Anyone can view and post listings
- No user accounts or sessions

### Row Level Security (RLS)
- Enabled on Supabase
- Public SELECT policy (read)
- Public INSERT policy (write)
- No UPDATE or DELETE policies

### Input Validation
- Client-side: HTML5 validation + React state
- Server-side: API route validation
- Supabase: Database constraints (NOT NULL, types)

## Performance Optimizations

### Server-Side Rendering (SSR)
- Homepage and listing pages render on server
- Faster initial page load
- Better SEO

### Image Optimization
- Next.js Image component
- Automatic lazy loading
- Responsive images with srcset
- Remote patterns allowed in next.config.ts

### Caching Strategy
- No cache for listings (always fresh data)
- Static assets cached by CDN
- API routes use no-store cache directive

## Deployment Architecture

```
GitHub Repository
    ↓
Vercel (CI/CD)
    ↓
Build Next.js App
    ↓
Deploy to Edge Network
    ↓
Environment Variables Injected
    ↓
Production URL Live
```

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public API key
- `NEXT_PUBLIC_BASE_URL`: Production domain (optional)

## Scalability Considerations

### Current Limits
- Supabase free tier: 500MB database, 2GB bandwidth
- Vercel free tier: 100GB bandwidth, unlimited requests
- No pagination (will need for >100 listings)

### Future Scaling
- Add pagination for listings
- Implement caching with Redis
- Add CDN for images
- Database indexing on created_at
- Consider Supabase Pro for higher limits

## Error Handling

### Client-Side
- Try-catch blocks in API calls
- Error state displayed to user
- Graceful fallbacks (empty states)

### Server-Side
- API routes return proper HTTP status codes
- Error messages in JSON response
- Console logging for debugging

### Database
- Supabase handles connection pooling
- Automatic retries on transient failures
- Row Level Security prevents unauthorized access

## Monitoring & Debugging

### Development
- Next.js dev server with hot reload
- Browser DevTools for client debugging
- Console logs for server-side debugging

### Production
- Vercel Analytics (optional)
- Supabase Dashboard for database queries
- Browser console for client errors
- Vercel logs for server errors
