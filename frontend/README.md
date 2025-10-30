# 🏓 Table Tennis Booking System - Frontend

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.js          # Axios client with auth interceptors
│   ├── components/
│   │   └── Layout.jsx         # Main layout with sidebar
│   ├── contexts/
│   │   └── AuthContext.jsx    # Authentication context
│   ├── i18n/
│   │   └── config.js          # i18next configuration
│   ├── pages/
│   │   ├── Login.jsx          # Login page
│   │   ├── Dashboard.jsx      # Admin dashboard with stats
│   │   ├── CalendarView.jsx   # FullCalendar booking view
│   │   ├── Customers.jsx      # Customer management
│   │   ├── Reports.jsx        # Reports and analytics
│   │   └── Settings.jsx       # System settings
│   ├── App.jsx                # Main app with routes
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Setup Instructions

### 1. Navigate to Frontend Directory

```bash
cd tabletennis-booking/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The frontend will start on **http://localhost:5173**

**Important:** Make sure the backend is running on port 5008 before starting the frontend!

## Features

### 🔐 Authentication
- JWT-based authentication
- Role-based access (Admin/Trainer)
- Auto-redirect on token expiration
- Secure route protection

### 📊 Dashboard (Admin Only)
- Today's bookings count
- Daily and monthly earnings
- Active subscription count
- Interactive earnings chart by table

### 📅 Calendar View
- FullCalendar integration
- Week/Day/Month views
- Color-coded bookings:
  - **Blue**: Regular booking (no trainer)
  - **Amber**: With trainer
  - **Green**: ABO holder
- Click to create/edit bookings (Admin only)
- Drag & drop support (Admin only)
- Trainers have read-only access

### 👥 Customer Management (Admin Only)
- CRUD operations for customers
- ABO subscription management
- Search functionality
- Track ABO start/end dates

### 📈 Reports
- **Monthly Report** (Admin only):
  - Total bookings and earnings
  - Earnings by table
  - ABO subscription sales
  - Download as CSV
- **Trainer Billing** (All users):
  - Hours worked per trainer
  - Earnings calculation
  - Monthly breakdown
- **ABO Report** (Admin only):
  - Active subscriptions
  - Monthly sales chart
  - Subscriber list

### ⚙️ Settings (Admin Only)
- Configure pricing matrix (8 combinations)
- Set monthly ABO rate
- Change default language
- All prices dynamically calculated

### 🌍 Multilingual Support
- English (default)
- German (Deutsch)
- Russian (Русский)
- Spanish (Español)
- Language switcher in sidebar
- All UI elements translated

## User Roles

### Admin
- Full access to all features
- Dashboard, Bookings, Customers, Trainers, Reports, Settings
- Can create, edit, delete all entities
- Download reports

### Trainer
- Calendar view (read-only)
- Trainer billing report (own data only)
- No access to customer management or settings

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool
- **React Router v6** - Routing
- **Axios** - HTTP client
- **FullCalendar** - Calendar component
- **Recharts** - Data visualization
- **i18next** - Internationalization
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Default Credentials

After backend setup, use these credentials:

**Admin:**
- Username: `admin`
- Password: `admin`

**Trainers:**
- Username: `john` / Password: `trainer123`
- Username: `maria` / Password: `trainer123`

## API Integration

The frontend communicates with the backend through `/api` endpoints:
- Vite proxy configured to forward `/api/*` to `http://localhost:5008`
- JWT token stored in localStorage
- Automatic token injection via Axios interceptors
- 401 responses trigger auto-logout

## Color Scheme

- **Primary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Danger**: Red (#ef4444)
- **Neutral**: Gray scale

## Key Components

### Layout.jsx
- Sidebar navigation
- Language switcher
- User info display
- Logout button
- Responsive design

### CalendarView.jsx
- Interactive booking calendar
- Modal for creating/editing bookings
- Double-booking prevention
- Color-coded events

### Dashboard.jsx
- Stat cards with icons
- Bar chart for earnings
- Real-time data from reports API

### Reports.jsx
- Tabbed interface
- Multiple report types
- Data visualization with Recharts
- CSV download functionality

## Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Troubleshooting

### Backend Connection Issues
- Ensure backend is running on port 5008
- Check CORS settings in backend
- Verify proxy configuration in `vite.config.js`

### Authentication Issues
- Clear localStorage: `localStorage.clear()`
- Check JWT token expiration
- Verify backend auth endpoint

### Calendar Not Loading
- Check FullCalendar CSS imports
- Verify booking data format
- Ensure date/time strings are properly formatted

## Next Steps

1. Run backend: `cd backend && python app.py`
2. Run frontend: `cd frontend && npm run dev`
3. Login with admin/admin
4. Create some customers
5. Start booking tables!

🏓 Happy table tennis booking!