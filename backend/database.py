import os
import re
from urllib.parse import urlparse
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


def load_env():
    # Load .env file manually to avoid dependency on python-dotenv
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if "=" in line and not line.startswith("#"):
                    k, v = line.split("=", 1)
                    os.environ[k.strip()] = v.strip().strip('"').strip("'")


load_env()

# Default to MySQL for local development; fallback options supported
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    db_user = os.getenv("DB_USER", "root")
    db_pass = os.getenv("DB_PASSWORD", "root")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "3306")
    db_name = os.getenv("DB_NAME", "finai_db")
    DATABASE_URL = f"mysql+pymysql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}?charset=utf8mb4"

# Handle standard postgres:// vs postgresql:// protocol mismatch for SQLAlchemy
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)


def ensure_mysql_database_exists(db_url: str):
    """
    If targeting MySQL, connects to the server and creates the database schema
    if it does not already exist.
    """
    try:
        # Match standard mysql connection strings: mysql+pymysql://user:pass@host:port/dbname
        if "mysql" in db_url:
            parsed = urlparse(db_url)
            db_name = parsed.path.lstrip("/")
            if "?" in db_name:
                db_name = db_name.split("?")[0]

            if db_name:
                # Build root connection URL without specific db
                netloc = parsed.netloc
                server_url = f"{parsed.scheme}://{netloc}/?charset=utf8mb4"
                temp_engine = create_engine(server_url, isolation_level="AUTOCOMMIT")
                with temp_engine.connect() as conn:
                    conn.execute(
                        text(
                            f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
                        )
                    )
                temp_engine.dispose()
    except Exception as e:
        print(f"[Database Init Warning] Could not auto-create database: {e}")


if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
elif "mysql" in DATABASE_URL:
    ensure_mysql_database_exists(DATABASE_URL)
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=3600,
        pool_size=10,
        max_overflow=20,
    )
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
