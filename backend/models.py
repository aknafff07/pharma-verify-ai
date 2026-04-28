from sqlalchemy import Column, Integer, String, DateTime, Float
from database import Base
import datetime

# TABEL 1: Sistem ERP Lengkap
class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    purchase_id = Column(String, unique=True, index=True) # Berubah dari po_number
    material_code = Column(String)
    material_name = Column(String)
    batch_number = Column(String)
    supplier = Column(String)
    qty_kg = Column(Float)
    unit = Column(String)
    mfg_date = Column(String)
    exp_date = Column(String)
    warehouse = Column(String) # Berubah dari warehouse_location
    status_expected = Column(String) # Menyimpan 'status' (PASS) dari CSV
    status_current = Column(String, default="PENDING") # Status operasional gudang

# TABEL 2: Audit Trail
class ScanLog(Base):
    __tablename__ = "scan_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    po_reference = Column(String)
    scanned_file_name = Column(String)
    extracted_keys_json = Column(String) 
    ai_confidence_score = Column(Float)
    final_decision = Column(String)