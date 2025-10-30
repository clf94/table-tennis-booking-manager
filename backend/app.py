from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db
from routes.auth_routes import auth_bp
from routes.customer_routes import customer_bp
from routes.trainer_routes import trainer_bp
from routes.booking_routes import booking_bp
from routes.report_routes import report_bp
from routes.settings_routes import settings_bp
from routes.table_routes import table_bp
from routes.user_routes import user_bp
from utils.seeder import seed_data
import os
from flask import send_from_directory

app = Flask(__name__, static_folder='dist', static_url_path='')

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tabletennis.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 hours

# Initialize extensions
db.init_app(app)
CORS(app, origins=["https://table-tennis-frontend.onrender.com"])
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(customer_bp, url_prefix='/api/customers')
app.register_blueprint(trainer_bp, url_prefix='/api/trainers')
app.register_blueprint(booking_bp, url_prefix='/api/bookings')
app.register_blueprint(report_bp, url_prefix='/api/reports')
app.register_blueprint(settings_bp, url_prefix='/api/settings')
app.register_blueprint(table_bp, url_prefix='/api/tables')
app.register_blueprint(user_bp, url_prefix='/api/users')

# serve frontend from build folder
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    root_dir = os.path.abspath(os.path.dirname(__file__))
    build_dir = os.path.join(root_dir, 'dist')

    if path != "" and os.path.exists(os.path.join(build_dir, path)):
        return send_from_directory(build_dir, path)
    else:
        return send_from_directory(build_dir, 'index.html')
        
@app.route('/health')
def health():
    return {'status': 'healthy'}, 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        seed_data()
    app.run(host='0.0.0.0', port=5008, debug=False)
