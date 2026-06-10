import sys
import os
import random
import datetime
from sqlalchemy import select

# Add root folder to sys.path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine, Base
import models
from auth import get_password_hash

# Sample data pools for realistic generation
FIRST_NAMES = [
    "Amit",
    "Priya",
    "Vikram",
    "Anjali",
    "Rohan",
    "Sneha",
    "Rahul",
    "Pooja",
    "Sandeep",
    "Neha",
    "Rajesh",
    "Divya",
    "Sanjay",
    "Kavita",
    "Aditya",
    "Sunita",
    "Manoj",
    "Ritu",
    "Suresh",
    "Deepa",
    "Arjun",
    "Kiran",
    "Vijay",
    "Meera",
    "Harish",
    "Swati",
    "Alok",
    "Komal",
    "Ramesh",
    "Aarti",
]
LAST_NAMES = [
    "Sharma",
    "Patel",
    "Singh",
    "Gupta",
    "Verma",
    "Reddy",
    "Nair",
    "Joshi",
    "Kumar",
    "Iyer",
    "Rao",
    "Dutta",
    "Mishra",
    "Goel",
    "Choudhury",
    "Tiwari",
    "Saxena",
    "Prasad",
    "Krishnan",
    "Mehta",
    "Bose",
    "Pillai",
    "Deshmukh",
    "Sen",
    "Roy",
    "Menon",
    "Bahl",
    "Malhotra",
    "Jha",
    "Nishad",
]
BUSINESS_NAMES = [
    "Apex Retailers",
    "Bharat Electronics",
    "Zeta Fashion",
    "Mumbai Grocery",
    "Delhi Spices",
    "Bangalore Tech Hub",
    "Chennai Silk Store",
    "Kolkata Book House",
    "Hyderabad Biryani Corp",
    "Pune Automobile",
    "Jaipur Handicrafts",
    "Ahmedabad Textile",
    "Indore Confectionery",
    "Lucknow Chikan Art",
    "Goa Beach Resort",
    "Kochi Marine Export",
    "Guwahati Tea Estate",
    "Srinagar Shawls",
    "Patna Sweets",
    "Bhopal Toy Hub",
]
PAYMENT_METHODS = ["UPI", "Card", "NetBanking"]
STATUSES = ["Success", "Success", "Success", "Success", "Failed", "Pending"]


def run():
    # Make sure tables exist
    print("Ensuring tables are created...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Fetch or create users and merchants
        print("Checking for existing merchants...")
        merchants = db.scalars(select(models.Merchant)).all()

        if len(merchants) < len(BUSINESS_NAMES):
            print(f"Creating {len(BUSINESS_NAMES)} synthetic merchants and their users...")
            hashed_pwd = get_password_hash("password123")

            for biz_name in BUSINESS_NAMES:
                email = f"{biz_name.lower().replace(' ', '_')}@example.com"
                # Check if user already exists
                user = db.query(models.User).filter(models.User.email == email).first()
                if not user:
                    user = models.User(email=email, hashed_password=hashed_pwd, role="merchant", is_active=True)
                    db.add(user)
                    db.commit()
                    db.refresh(user)

                # Check if merchant already exists
                merchant = db.query(models.Merchant).filter(models.Merchant.user_id == user.id).first()
                if not merchant:
                    merchant = models.Merchant(business_name=biz_name, user_id=user.id)
                    db.add(merchant)

            db.commit()
            merchants = db.scalars(select(models.Merchant)).all()
            print(f"Total merchants in database: {len(merchants)}")
        else:
            print(f"Found {len(merchants)} existing merchants. Reusing them.")

        merchant_ids = [m.id for m in merchants]

        # 2. Generate 105,000 transaction records
        total_records = 105000
        batch_size = 15000
        print(f"Generating and inserting {total_records} transaction records in batches of {batch_size}...")

        now = datetime.datetime.now(datetime.timezone.utc)

        for batch_num in range(0, total_records, batch_size):
            current_batch_size = min(batch_size, total_records - batch_num)
            txn_dicts = []

            for i in range(current_batch_size):
                global_index = batch_num + i
                ref_id = f"TXN-{global_index:07d}"

                first_name = random.choice(FIRST_NAMES)
                last_name = random.choice(LAST_NAMES)
                customer_name = f"{first_name} {last_name}"
                customer_email = f"{first_name.lower()}.{last_name.lower()}{random.randint(10, 99)}@gmail.com"

                # Distribute amounts: mostly smaller, some larger
                amount_rand = random.random()
                if amount_rand < 0.70:
                    amount = round(random.uniform(50.0, 5000.0), 2)
                elif amount_rand < 0.95:
                    amount = round(random.uniform(5000.0, 45000.0), 2)
                else:
                    amount = round(random.uniform(45000.0, 100000.0), 2)

                payment_method = random.choice(PAYMENT_METHODS)
                status = random.choice(STATUSES)

                # Distribute timestamps over the last 90 days
                created_at = now - datetime.timedelta(
                    days=random.randint(0, 90),
                    hours=random.randint(0, 23),
                    minutes=random.randint(0, 59),
                    seconds=random.randint(0, 59),
                )

                # Intentional fraud patterns
                hour = created_at.hour
                is_fraud = False
                fraud_score = 0.0

                # Pattern 1: Midnight high-amount transaction
                if (hour >= 23 or hour < 4) and amount > 50000:
                    if random.random() < 0.85:
                        is_fraud = True
                        fraud_score = round(random.uniform(0.75, 0.99), 2)
                        status = "Failed" if random.random() < 0.4 else "Success"
                    else:
                        fraud_score = round(random.uniform(0.35, 0.65), 2)

                # Pattern 2: Card anomaly high amounts
                elif payment_method == "Card" and amount > 75000:
                    if random.random() < 0.70:
                        is_fraud = True
                        fraud_score = round(random.uniform(0.70, 0.98), 2)
                    else:
                        fraud_score = round(random.uniform(0.20, 0.60), 2)

                # Pattern 3: UPI anomaly high amounts
                elif payment_method == "UPI" and amount > 90000:
                    if random.random() < 0.75:
                        is_fraud = True
                        fraud_score = round(random.uniform(0.80, 0.99), 2)
                    else:
                        fraud_score = round(random.uniform(0.15, 0.50), 2)

                # Pattern 4: Baseline fraud rate
                else:
                    if random.random() < 0.008:
                        is_fraud = True
                        fraud_score = round(random.uniform(0.60, 0.95), 2)
                    else:
                        fraud_score = round(random.uniform(0.00, 0.25), 2)

                txn_dicts.append(
                    {
                        "reference_id": ref_id,
                        "merchant_id": random.choice(merchant_ids),
                        "customer_name": customer_name,
                        "customer_email": customer_email,
                        "amount": amount,
                        "currency": "INR",
                        "status": status,
                        "payment_method": payment_method,
                        "is_fraud": is_fraud,
                        "fraud_score": fraud_score,
                        "created_at": created_at,
                    }
                )

            # Fast bulk insert
            db.bulk_insert_mappings(models.Transaction, txn_dicts)
            db.commit()
            print(
                f"Inserted batch {batch_num // batch_size + 1}/{total_records // batch_size} ({batch_num + current_batch_size} / {total_records} total)"
            )

        print("Generation completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"An error occurred: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    run()
