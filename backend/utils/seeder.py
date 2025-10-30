from models import db, User, Trainer, Table, Settings
import json

def seed_data():
    print("Seeding database...")

    # Ensure Tables exist
    if not Table.query.first():
        db.session.add_all([Table(name="Table 1"), Table(name="Table 2")])

    # Ensure Trainers exist
    if not Trainer.query.first():
        trainer1 = Trainer(name="John Smith", email="john@tabletennis.com", hourly_rate=30.0)
        trainer2 = Trainer(name="Maria Garcia", email="maria@tabletennis.com", hourly_rate=35.0)
        db.session.add_all([trainer1, trainer2])
        db.session.flush()  # get IDs

        # Ensure Trainer users exist
        if not User.query.filter_by(username="john").first():
            u1 = User(username="john", role="trainer", trainer_id=trainer1.id)
            u1.set_password("trainer123")
            db.session.add(u1)
        if not User.query.filter_by(username="maria").first():
            u2 = User(username="maria", role="trainer", trainer_id=trainer2.id)
            u2.set_password("trainer123")
            db.session.add(u2)

    # Ensure Admin user exists
    if not User.query.filter_by(username="admin").first():
        admin = User(username="admin", role="admin")
        admin.set_password("admin")
        db.session.add(admin)

    # Ensure Settings exist
    if not Settings.query.first():
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
    print("Database seeded successfully! Admin: admin / admin")
