import os
import sys
from sqlalchemy import text

# Add root folder to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, SessionLocal, load_env
import models
from main import seed_default_users

load_env()

def reset_database():
    print("Resetting MySQL database `finai_db` to fresh state...")
    
    tables_to_truncate = [
        "transactions",
        "support_tickets",
        "audit_logs",
        "kyc_documents",
        "merchant_settings",
        "merchants",
        "users",
    ]
    
    with engine.connect() as conn:
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        for table in tables_to_truncate:
            try:
                conn.execute(text(f"TRUNCATE TABLE `{table}`;"))
                print(f"  [OK] Cleared table: {table}")
            except Exception as e:
                print(f"  [Warning] Could not truncate `{table}`: {e}")
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        conn.commit()
        
    print("\nRe-seeding initial default accounts & demo merchant...")
    seed_default_users()
    
    db = SessionLocal()
    try:
        user_count = db.query(models.User).count()
        merchant_count = db.query(models.Merchant).count()
        txn_count = db.query(models.Transaction).count()
        print(f"\n[SUCCESS] Database is now clean & fresh:")
        print(f"  - Users: {user_count} (merchant, customercare, analyst, admin)")
        print(f"  - Merchants: {merchant_count} ('Payswiff Demo Store')")
        print(f"  - Transactions: {txn_count}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_database()
