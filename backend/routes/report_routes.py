from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt
from models import db, Booking, Customer, Trainer, Table, Settings
from datetime import datetime, timedelta
from sqlalchemy import func, extract
import csv
import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table as PDFTable
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

report_bp = Blueprint('report', __name__)

def admin_or_trainer_required():
    claims = get_jwt()
    if claims.get('role') not in ['admin', 'trainer']:
        return jsonify({'error': 'Access denied'}), 403
    return None

def admin_required():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    return None

@report_bp.route('/daily', methods=['GET'])
@jwt_required()
def daily_report():
    error = admin_required()
    if error:
        return error
    
    date_str = request.args.get('date')
    if not date_str:
        date = datetime.now().date()
    else:
        date = datetime.fromisoformat(date_str).date()
    
    bookings = Booking.query.filter_by(date=date).all()
    
    # Calculate earnings per table
    table_earnings = {}
    for booking in bookings:
        table_name = booking.table.name
        if table_name not in table_earnings:
            table_earnings[table_name] = 0
        table_earnings[table_name] += booking.price
    
    total_earnings = sum(table_earnings.values())
    
    return jsonify({
        'date': date.isoformat(),
        'total_earnings': total_earnings,
        'table_earnings': table_earnings,
        'total_bookings': len(bookings)
    }), 200

@report_bp.route('/monthly', methods=['GET'])
@jwt_required()
def monthly_report():
    error = admin_required()
    if error:
        return error
    
    year = int(request.args.get('year', datetime.now().year))
    month = int(request.args.get('month', datetime.now().month))
    
    # Get all bookings for the month
    bookings = Booking.query.filter(
        extract('year', Booking.date) == year,
        extract('month', Booking.date) == month
    ).all()
    
    # Calculate earnings per table
    table_earnings = {}
    for booking in bookings:
        table_name = booking.table.name
        if table_name not in table_earnings:
            table_earnings[table_name] = 0
        table_earnings[table_name] += booking.price
    
    total_earnings = sum(table_earnings.values())
    
    # Calculate ABO subscriptions sold this month
    settings = Settings.query.first()
    abo_customers = Customer.query.filter(
        Customer.is_abo_holder == True,
        extract('year', Customer.abo_start) == year,
        extract('month', Customer.abo_start) == month
    ).count()
    
    abo_revenue = abo_customers * (settings.monthly_rate if settings else 0)
    
    return jsonify({
        'year': year,
        'month': month,
        'total_earnings': total_earnings,
        'table_earnings': table_earnings,
        'total_bookings': len(bookings),
        'abo_subscriptions_sold': abo_customers,
        'abo_revenue': abo_revenue,
        'total_revenue': total_earnings + abo_revenue
    }), 200

@report_bp.route('/trainers', methods=['GET'])
@jwt_required()
def trainer_report():
    error = admin_or_trainer_required()
    if error:
        return error
    
    claims = get_jwt()
    trainer_id = request.args.get('trainer_id')
    year = int(request.args.get('year', datetime.now().year))
    month = int(request.args.get('month', datetime.now().month))
    
    # If trainer role, only show their own data
    if claims.get('role') == 'trainer':
        trainer_id = claims.get('trainer_id')
    
    query = Booking.query.filter(
        Booking.trainer_id.isnot(None),
        extract('year', Booking.date) == year,
        extract('month', Booking.date) == month
    )
    
    if trainer_id:
        query = query.filter_by(trainer_id=int(trainer_id))
    
    bookings = query.all()
    
    # Calculate earnings per trainer
    trainer_stats = {}
    for booking in bookings:
        trainer = booking.trainer
        if trainer.id not in trainer_stats:
            trainer_stats[trainer.id] = {
                'trainer_id': trainer.id,
                'trainer_name': trainer.name,
                'hourly_rate': trainer.hourly_rate,
                'total_hours': 0,
                'total_earnings': 0
            }
        
        hours = booking.duration / 60.0
        trainer_stats[trainer.id]['total_hours'] += hours
        trainer_stats[trainer.id]['total_earnings'] += hours * trainer.hourly_rate
    
    return jsonify({
        'year': year,
        'month': month,
        'trainers': list(trainer_stats.values())
    }), 200

@report_bp.route('/abo', methods=['GET'])
@jwt_required()
def abo_report():
    error = admin_required()
    if error:
        return error
    
    # Get active ABO holders
    today = datetime.now().date()
    active_abos = Customer.query.filter(
        Customer.is_abo_holder == True,
        Customer.abo_end >= today
    ).all()
    
    # Get ABO holders by month
    year = int(request.args.get('year', datetime.now().year))
    
    monthly_abo_sales = []
    for month in range(1, 13):
        count = Customer.query.filter(
            Customer.is_abo_holder == True,
            extract('year', Customer.abo_start) == year,
            extract('month', Customer.abo_start) == month
        ).count()
        monthly_abo_sales.append({'month': month, 'count': count})
    
    settings = Settings.query.first()
    monthly_rate = settings.monthly_rate if settings else 0
    
    return jsonify({
        'active_abo_count': len(active_abos),
        'active_abos': [{
            'id': c.id,
            'name': c.name,
            'abo_start': c.abo_start.isoformat() if c.abo_start else None,
            'abo_end': c.abo_end.isoformat() if c.abo_end else None
        } for c in active_abos],
        'monthly_rate': monthly_rate,
        'year': year,
        'monthly_sales': monthly_abo_sales
    }), 200

@report_bp.route('/customers', methods=['GET'])
@jwt_required()
def customer_report():
    error = admin_required()
    if error:
        return error
    
    customers = Customer.query.all()
    
    customer_list = []
    for customer in customers:
        # Get booking count
        booking_count = Booking.query.filter_by(customer_id=customer.id).count()
        
        customer_list.append({
            'id': customer.id,
            'name': customer.name,
            'contact': customer.contact,
            'is_abo_holder': customer.is_abo_holder,
            'booking_count': booking_count
        })
    
    return jsonify({
        'total_customers': len(customers),
        'customers': customer_list
    }), 200

@report_bp.route('/download', methods=['GET'])
@jwt_required()
def download_report():
    error = admin_required()
    if error:
        return error
    
    report_type = request.args.get('type', 'daily')
    format_type = request.args.get('format', 'csv')
    
    # Get report data based on type
    if report_type == 'daily':
        date_str = request.args.get('date', datetime.now().date().isoformat())
        date = datetime.fromisoformat(date_str).date()
        bookings = Booking.query.filter_by(date=date).all()
        
        if format_type == 'csv':
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(['Date', 'Customer', 'Table', 'Trainer', 'Duration', 'Price'])
            
            for b in bookings:
                writer.writerow([
                    b.date.isoformat(),
                    b.customer.name,
                    b.table.name,
                    b.trainer.name if b.trainer else 'None',
                    f"{b.duration} min",
                    f"${b.price:.2f}"
                ])
            
            output.seek(0)
            return send_file(
                io.BytesIO(output.getvalue().encode()),
                mimetype='text/csv',
                as_attachment=True,
                download_name=f'daily_report_{date}.csv'
            )
    
    elif report_type == 'monthly':
        year = int(request.args.get('year', datetime.now().year))
        month = int(request.args.get('month', datetime.now().month))
        
        bookings = Booking.query.filter(
            extract('year', Booking.date) == year,
            extract('month', Booking.date) == month
        ).all()
        
        if format_type == 'csv':
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(['Date', 'Customer', 'Table', 'Trainer', 'Duration', 'Price'])
            
            for b in bookings:
                writer.writerow([
                    b.date.isoformat(),
                    b.customer.name,
                    b.table.name,
                    b.trainer.name if b.trainer else 'None',
                    f"{b.duration} min",
                    f"${b.price:.2f}"
                ])
            
            output.seek(0)
            return send_file(
                io.BytesIO(output.getvalue().encode()),
                mimetype='text/csv',
                as_attachment=True,
                download_name=f'monthly_report_{year}_{month}.csv'
            )
    
    return jsonify({'error': 'Invalid report type or format'}), 400