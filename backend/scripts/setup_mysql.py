import os
import sys
import argparse
import getpass
import pymysql

# Set UTF-8 encoding for standard output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Add root folder to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import load_env

load_env()


def test_mysql_connection(user="root", password="", host="localhost", port=3306):
    try:
        conn = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            charset="utf8mb4",
            connect_timeout=3,
        )
        conn.close()
        return True, "Connected successfully"
    except pymysql.MySQLError as e:
        return False, str(e)


def setup(user="root", password="", host="localhost", port=3306, db_name="finai_db", num_records=1000):
    # Test connection
    ok, msg = test_mysql_connection(user=user, password=password, host=host, port=port)
    if not ok:
        print(f"[ERROR] Failed to connect to MySQL on {host}:{port} with user '{user}': {msg}")
        return False

    print(f"[OK] Connected to MySQL on {host}:{port} as user '{user}'")

    print(f"\n1. Creating database schema `{db_name}` in MySQL (if not exists)...")
    conn = pymysql.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        charset="utf8mb4",
        autocommit=True,
    )
    with conn.cursor() as cursor:
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        print(f"[OK] Database `{db_name}` is ready.")
    conn.close()

    # Update .env with working MySQL DATABASE_URL
    env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
    db_url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{db_name}?charset=utf8mb4"

    lines = []
    has_db_url = False
    if os.path.exists(env_file):
        with open(env_file, "r", encoding="utf-8") as f:
            lines = f.readlines()

    new_lines = []
    for line in lines:
        if line.strip().startswith("DATABASE_URL="):
            new_lines.append(f'DATABASE_URL="{db_url}"\n')
            has_db_url = True
        else:
            new_lines.append(line)

    if not has_db_url:
        new_lines.append(f'DATABASE_URL="{db_url}"\n')

    with open(env_file, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print(f"[OK] Saved working DATABASE_URL into {env_file}")

    # Set in os.environ for current execution
    os.environ["DATABASE_URL"] = db_url

    # Import database and models now that DATABASE_URL is set
    from database import engine, Base, SessionLocal
    import models
    from main import seed_default_users

    print("\n2. Creating all database tables in MySQL...")
    Base.metadata.create_all(bind=engine)
    print("[OK] Tables created successfully:")
    for table_name in Base.metadata.tables.keys():
        print(f"   - {table_name}")

    print("\n3. Seeding default users & demo merchant...")
    seed_default_users()
    print("[OK] Default accounts verified:")
    print("   - merchant@payswiff.com     (Password: Password123!)")
    print("   - customercare@payswiff.com (Password: Password123!)")
    print("   - analyst@payswiff.com      (Password: Password123!)")
    print("   - admin@payswiff.com        (Password: Password123!)")

    print("\n4. Checking sample transactions in MySQL...")
    db = SessionLocal()
    try:
        count = db.query(models.Transaction).count()
        if count == 0:
            print("Seeding synthetic merchants and realistic transactions with ML fraud scoring...")
            from scripts.generate_data import run as run_generator

            run_generator()
        else:
            print(f"[OK] Found {count} existing transactions in `{db_name}`.")
    finally:
        db.close()

    print("\n" + "=" * 60)
    print(f"MySQL Setup Complete! Your database `{db_name}` is live.")
    print("You can now open MySQL Workbench and view all tables and live data:")
    print(f"   Host:     {host}")
    print(f"   Port:     {port}")
    print(f"   User:     {user}")
    print(f"   Database: {db_name}")
    print("=" * 60 + "\n")
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="FinAI MySQL Setup & Seeder")
    parser.add_argument("--user", default=os.getenv("DB_USER", "root"), help="MySQL username (default: root)")
    parser.add_argument("--password", default=os.getenv("DB_PASSWORD", None), help="MySQL password")
    parser.add_argument("--host", default=os.getenv("DB_HOST", "localhost"), help="MySQL host (default: localhost)")
    parser.add_argument("--port", type=int, default=int(os.getenv("DB_PORT", 3306)), help="MySQL port (default: 3306)")
    parser.add_argument("--db", default=os.getenv("DB_NAME", "finai_db"), help="Database name (default: finai_db)")
    args = parser.parse_args()

    pwd = args.password
    if pwd is None:
        # Check if set in .env or try prompt
        env_url = os.getenv("DATABASE_URL", "")
        if "mysql" in env_url:
            import re

            m = re.search(r"mysql\+pymysql://([^:]+):([^@]*)@", env_url)
            if m:
                pwd = m.group(2)

    if pwd is None:
        pwd = getpass.getpass(f"Enter MySQL password for user '{args.user}': ")

    setup(user=args.user, password=pwd, host=args.host, port=args.port, db_name=args.db)
