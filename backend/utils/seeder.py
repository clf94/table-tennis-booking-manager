from models import db, User, Trainer, Table, Settings
import json

def seed_data():
    # Check if data already exists
    if User.query.first():
        print("Database already seeded. Skipping...")
        return
    
    print("Seeding database...")
    
    # Create Tables
    table1 = Table(name="Table 1")
    table2 = Table(name="Table 2")
    db.session.add(table1)
    db.session.add(table2)
    
    # Create Trainers
    trainer1 = Trainer(name="John Smith", email="john@tabletennis.com", hourly_rate=30.0)
    trainer2 = Trainer(name="Maria Garcia", email="maria@tabletennis.com", hourly_rate=35.0)
    db.session.add(trainer1)
    db.session.add(trainer2)
    db.session.flush()  # Get IDs for trainers
    
    # Create Admin User
    admin = User(username="admin", role="admin")
    admin.set_password("admin")
    db.session.add(admin)
    
    # Create Trainer Users
    trainer_user1 = User(username="john", role="trainer", trainer_id=trainer1.id)
    trainer_user1.set_password("trainer123")
    db.session.add(trainer_user1)
    
    trainer_user2 = User(username="maria", role="trainer", trainer_id=trainer2.id)
    trainer_user2.set_password("trainer123")
    db.session.add(trainer_user2)
    
    # Create Settings with pricing matrix
    pricing_matrix = {
        "30_no_trainer_no_abo": 15.0,
        "30_no_trainer_abo": 12.0,
        "30_trainer_no_abo": 25.0,
        "30_trainer_abo": 20.0,
        "60_no_trainer_no_abo": 25.0,
        "60_no_trainer_abo": 20.0,
        "60_trainer_no_abo": 45.0,
        "60_trainer_abo": 35.0
    }
    
    settings = Settings(
        pricing_matrix=json.dumps(pricing_matrix),
        monthly_rate=50.0,
        language='en'
    )
    db.session.add(settings)
    
    db.session.commit()
    print("Database seeded successfully!")
    print("Default admin credentials: admin / admin")
    print("Default trainer credentials: john / trainer123, maria / trainer123")