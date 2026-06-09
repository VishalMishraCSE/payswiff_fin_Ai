import sys
import os
import random
import datetime

# Add root folder to sys.path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine
import models


def run():
    db = SessionLocal()
    try:
        # 1. Create a synthetic merchant
        merchant = models.Merchant(business_name="Acme Wholesale", kyc_status="verified")
        db.add(merchant)
        db.commit()
        db.refresh(merchant)

        print(f"Created Merchant: {merchant.business_name} (ID: {merchant.id})")

        # 2. Generate 100 mock transactions
        statuses = ["success", "success", "success", "failed", "pending"]
        for _ in range(100):
            amount = random.randint(100, 100000)  # cents
            status = random.choice(statuses)
            # Create higher fraud score for large midnight transactions
            fraud_score = random.randint(70, 99) if amount > 80000 else random.randint(0, 30)

            txn = models.Transaction(
                merchant_id=merchant.id,
                amount=amount,
                status=status,
                fraud_score=fraud_score,
                created_at=datetime.datetime.now(datetime.timezone.utc)
                - datetime.timedelta(days=random.randint(0, 30)),
            )
            db.add(txn)

        db.commit()
        print("Generated 100 synthetic transaction records successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    run()
