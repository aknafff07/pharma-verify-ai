from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

import models
from database import engine, get_db, SessionLocal
from azure_service import analyze_document_with_polygon

# =====================================================
# DATABASE INIT
# =====================================================

models.Base.metadata.create_all(bind=engine)

# =====================================================
# DUMMY ERP DATASET
# =====================================================

RAW_DATA = """purchase_id,material_code,material_name,batch_number,supplier,qty_kg,unit,mfg_date,exp_date,warehouse,status
PUR-001,MAT-001,Paracetamol Powder,LOT-1001,MedChem,50,kg,2025-01-10,2027-01-10,A1,PASS
PUR-002,MAT-002,Lactose Monohydrate,LOT-1002,PharmaRaw,100,kg,2025-02-15,2027-02-15,A2,PASS
PUR-003,MAT-003,Microcrystalline Cellulose,LOT-1003,BioSupply,25,kg,2025-03-01,2027-03-01,A3,PASS
PUR-004,MAT-004,Magnesium Stearate,LOT-1004,MedChem,25,kg,2025-01-20,2027-01-20,A4,PASS
PUR-005,MAT-005,Amoxicillin API,LOT-1005,ActiveLab,40,kg,2025-04-01,2027-04-01,B1,PASS
PUR-006,MAT-006,Ibuprofen Powder,LOT-1006,MedChem,60,kg,2025-02-05,2027-02-05,B2,PASS
PUR-007,MAT-007,Gelatin Capsules,LOT-1007,CapsuTech,200,kg,2025-01-11,2027-01-11,B3,PASS
PUR-008,MAT-008,Talc Powder,LOT-1008,PharmaRaw,45,kg,2025-03-21,2027-03-21,B4,PASS
PUR-009,MAT-009,Starch USP,LOT-1009,BioSupply,90,kg,2025-02-09,2027-02-09,C1,PASS
PUR-010,MAT-010,Citric Acid,LOT-1010,FoodChem,80,kg,2025-01-30,2027-01-30,C2,PASS
PUR-011,MAT-011,Sodium Benzoate,LOT-1011,FoodChem,70,kg,2025-03-18,2027-03-18,C3,PASS
PUR-012,MAT-012,Croscarmellose Sodium,LOT-1012,PharmaRaw,55,kg,2025-02-01,2027-02-01,C4,PASS
PUR-013,MAT-013,Metformin API,LOT-1013,ActiveLab,65,kg,2025-01-17,2027-01-17,D1,PASS
PUR-014,MAT-014,Povidone K30,LOT-1014,MedChem,30,kg,2025-04-10,2027-04-10,D2,PASS
PUR-015,MAT-015,Calcium Carbonate,LOT-1015,BioSupply,110,kg,2025-03-03,2027-03-03,D3,PASS
PUR-016,MAT-016,Aspirin Powder,LOT-1016,ActiveLab,35,kg,2025-02-28,2027-02-28,D4,PASS
PUR-017,MAT-017,Vitamin C,LOT-1017,NutraCore,95,kg,2025-01-05,2027-01-05,E1,PASS
PUR-018,MAT-018,Zinc Oxide,LOT-1018,ChemAsia,50,kg,2025-03-07,2027-03-07,E2,PASS
PUR-019,MAT-019,Iron Fumarate,LOT-1019,NutraCore,60,kg,2025-04-04,2027-04-04,E3,PASS
PUR-020,MAT-020,Niacinamide,LOT-1020,ChemAsia,70,kg,2025-02-13,2027-02-13,E4,PASS"""

# =====================================================
# APP STARTUP / SHUTDOWN (MODERN LIFESPAN)
# =====================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()

    try:
        if db.query(models.PurchaseOrder).count() == 0:
            lines = RAW_DATA.strip().split("\n")[1:]

            for line in lines:
                cols = line.split(",")

                db.add(models.PurchaseOrder(
                    purchase_id=cols[0],
                    material_code=cols[1],
                    material_name=cols[2],
                    batch_number=cols[3],
                    supplier=cols[4],
                    qty_kg=float(cols[5]),
                    unit=cols[6],
                    mfg_date=cols[7],
                    exp_date=cols[8],
                    warehouse=cols[9],
                    status_expected=cols[10]
                ))

            db.commit()

    finally:
        db.close()

    print("✅ PharmaVerify API started")
    yield
    print("🛑 PharmaVerify API stopped")


# =====================================================
# FASTAPI APP
# =====================================================

app = FastAPI(
    title="PharmaVerify Pro API",
    version="2026.1",
    lifespan=lifespan
)

# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # demo/hackathon mode
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# ROUTES
# =====================================================

@app.get("/")
def root():
    return {"message": "PharmaVerify API Running"}


@app.get("/api/pos")
def get_purchase_orders(db: Session = Depends(get_db)):
    return db.query(models.PurchaseOrder).all()


@app.get("/api/logs")
def get_audit_logs(db: Session = Depends(get_db)):
    return (
        db.query(models.ScanLog)
        .order_by(models.ScanLog.timestamp.desc())
        .limit(15)
        .all()
    )


@app.post("/api/pos/create")
def create_purchase_order(
    po_number: str = Form(...),
    material_name: str = Form(...),
    expected_batch: str = Form(...),
    db: Session = Depends(get_db)
):
    existing = (
        db.query(models.PurchaseOrder)
        .filter(models.PurchaseOrder.purchase_id == po_number)
        .first()
    )

    if existing:
        raise HTTPException(400, "Nomor PO sudah terdaftar.")

    new_po = models.PurchaseOrder(
        purchase_id=po_number,
        material_name=material_name,
        batch_number=expected_batch,
        qty_kg=0.0,
        status_current="PENDING"
    )

    db.add(new_po)
    db.commit()

    return {"message": "PO berhasil ditambahkan."}


@app.post("/api/verify")
async def verify_document(
    po_number: str = Form(...),
    document: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    po = (
        db.query(models.PurchaseOrder)
        .filter(models.PurchaseOrder.purchase_id == po_number)
        .first()
    )

    if not po:
        raise HTTPException(404, "PO tidak ditemukan.")

    content = await document.read()

    try:
        # Jalankan blocking Azure call di threadpool
        azure_result = await run_in_threadpool(
            analyze_document_with_polygon,
            content
        )

        extracted_data = azure_result["kv_data"]
        all_text = azure_result["raw_text"].lower()

    except Exception as e:
        raise HTTPException(500, f"Azure AI Error: {str(e)}")

    verification = {
        "PO Number": po.purchase_id.lower() in all_text,
        "Material": po.material_name.split()[0].lower() in all_text if po.material_name else False,
        "Batch No": po.batch_number.lower() in all_text if po.batch_number else False,
        "Supplier": po.supplier.split()[0].lower() in all_text if po.supplier else False,
        "Quantity": str(int(po.qty_kg)) in all_text if po.qty_kg else False,
        "Expiry Date": po.exp_date.split("-")[0] in all_text if po.exp_date else False,
    }

    failed = [k for k, v in verification.items() if not v]

    if failed:
        recommendation = "MISMATCH"
        reason = f"Tidak cocok pada: {', '.join(failed)}"
    else:
        recommendation = "MATCH"
        reason = "Semua parameter cocok"

    confidence = 0.0
    if extracted_data:
        confidence = sum(
            item["confidence"] for item in extracted_data
        ) / len(extracted_data)

    return {
        "po_reference": po.purchase_id,
        "ai_recommendation": recommendation,
        "decision_reason": reason,
        "ai_confidence": confidence,
        "verification_details": verification,
        "extracted_data": extracted_data
    }


@app.post("/api/decision")
def human_decision(
    po_number: str = Form(...),
    decision: str = Form(...),
    filename: str = Form(...),
    confidence: float = Form(...),
    extracted_json: str = Form(...),
    db: Session = Depends(get_db)
):
    po = (
        db.query(models.PurchaseOrder)
        .filter(models.PurchaseOrder.purchase_id == po_number)
        .first()
    )

    if po:
        po.status_current = (
            "RECEIVED"
            if decision == "ACCEPTED"
            else "QUARANTINED"
        )

    log = models.ScanLog(
        po_reference=po_number,
        scanned_file_name=filename,
        ai_confidence_score=confidence,
        extracted_keys_json=extracted_json[:500],
        final_decision=decision
    )

    db.add(log)
    db.commit()

    return {
        "status": "success",
        "message": "Keputusan berhasil disimpan."
    }