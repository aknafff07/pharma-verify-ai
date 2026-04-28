from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Kita menggunakan SQLite karena ringan, cepat, dan tidak perlu instalasi server terpisah.
# Parameter check_same_thread=False diperlukan oleh FastAPI agar tidak terjadi error bentrok antar-request.
SQLALCHEMY_DATABASE_URL = "sqlite:///./pharma.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Fungsi ini akan dipanggil setiap kali ada request (misal: upload dokumen) 
# untuk membuka koneksi ke database, lalu menutupnya kembali setelah selesai.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()