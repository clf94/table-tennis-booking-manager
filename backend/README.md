# 🏓 Table Tennis Booking Management System - Backend

## Setup Instructions

### 1. Create Project Structure

```bash
mkdir tabletennis-booking
cd tabletennis-booking
mkdir backend
cd backend
mkdir routes utils
```

### 2. Create Files

Place all the provided code files in their respective locations:
- `app.py` in `backend/`
- `models.py` in `backend/`
- All route files in `backend/routes/`
- All utility files in `backend/utils/`
- `requirements.txt` in `backend/`

### 3. Install Dependencies

```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Run the Application

```bash
python app.py
```

The backend will start on **http://localhost:5008**

### 5. Default Credentials

After first run, the database will be seeded with:

**Admin Login:**
- Username: `admin`
- Password: `admin`

**Trainer Logins:**
- Username: `john` / Password: `trainer123`
- Username: `maria` / Password: `trainer123`

**Default Tables:**
- Table 1
- Table 2

**Default Trainers:**
- John Smith (hourly rate: $30)
- Maria Garcia (hourly rate: $35)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/<id>` - Get customer by ID
- `POST /api/customers` - Create customer (Admin only)
- `PUT /api/customers/<id>` - Update customer (Admin only)
- `DELETE /api/customers/<id>` - Delete customer (Admin only)

### Trainers
- `GET /api/trainers` - List all trainers
- `GET /api/trainers/<id>` - Get trainer by ID
- `POST /api/trainers` - Create trainer (Admin only)
- `PUT /api/trainers/<id>` - Update trainer (Admin only)
- `DELETE /api/trainers/<id>` - Delete trainer (Admin only)

### Tables
- `GET /api/tables` - List all tables
- `GET /api/tables/<id>` - Get table by ID
- `POST /api/tables` - Create table (Admin only)
- `PUT /api/tables/<id>` - Update table (Admin only)
- `DELETE /api/tables/<id>` - Delete table (Admin only)

### Bookings
- `GET /api/bookings` - List bookings (supports filtering)
- `GET /api/bookings/<id>` - Get booking by ID
- `POST /api/bookings` - Create booking (Admin only)
- `PUT /api/bookings/<id>` - Update booking (Admin only)
- `DELETE /api/bookings/<id>` - Delete booking (Admin only)

Query parameters for filtering:
- `start_date` - Filter by start date
- `end_date` - Filter by end date
- `table_id` - Filter by table
- `trainer_id` - Filter by trainer

### Reports
- `GET /api/reports/daily` - Daily earnings report (Admin only)
- `GET /api/reports/monthly` - Monthly earnings report (Admin only)
- `GET /api/reports/trainers` - Trainer billing report
- `GET /api/reports/abo` - ABO subscription report (Admin only)
- `GET /api/reports/customers` - Customer list report (Admin only)
- `GET /api/reports/download` - Download report as CSV/PDF (Admin only)

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings (Admin only)

## Example API Calls

### Login
```bash
curl -X POST http://localhost:5008/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}'
```

### Create Booking
```bash
curl -X POST http://localhost:5008/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "customer_id": 1,
    "trainer_id": 1,
    "table_id": 1,
    "date": "2025-11-01",
    "time": "14:00",
    "duration": 60,
    "info": "Training session"
  }'
```

### Get Daily Report
```bash
curl http://localhost:5008/api/reports/daily?date=2025-11-01 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Features Implemented

✅ JWT Authentication with role-based access (Admin/Trainer)  
✅ CRUD operations for Customers, Trainers, Tables, Bookings  
✅ Dynamic price calculation based on duration, trainer, and ABO status  
✅ Double-booking prevention  
✅ Comprehensive reporting (daily, monthly, trainer billing, ABO stats)  
✅ CSV/PDF report downloads  
✅ Settings management for pricing and language  
✅ Database seeding with default data  

## Pricing Matrix

Default pricing (can be configured in settings):

| Duration | Trainer | ABO | Price |
|----------|---------|-----|-------|
| 30 min   | No      | No  | $15   |
| 30 min   | No      | Yes | $12   |
| 30 min   | Yes     | No  | $25   |
| 30 min   | Yes     | Yes | $20   |
| 60 min   | No      | No  | $25   |
| 60 min   | No      | Yes | $20   |
| 60 min   | Yes     | No  | $45   |
| 60 min   | Yes     | Yes | $35   |

## Next Steps

The frontend React application will connect to these endpoints and provide:
- Interactive calendar view
- Dashboard with analytics
- User management interface
- Booking management
- Reports and charts
- Multilingual support (EN/DE/RU/ES)