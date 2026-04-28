from fastapi import APIRouter, UploadFile, File, HTTPException
from services.azure_ai import analyze_document

router = APIRouter()

@router.post("/verify")
async def verify_material(document: UploadFile = File(...)):
    # 1. Baca file yang diunggah menjadi format bytes
    content = await document.read()
    
    # 2. Kirim ke Azure untuk diekstrak
    try:
        extracted_text = analyze_document(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal menghubungi Azure: {str(e)}")

    # 3. Logika Validasi MVP
    # Di versi nyata, data ini ditarik dari database relasional
    expected_batch = "B-20260424A"
    expected_material = "Paracetamol USP"

    status = "MISMATCH"
    msg = "Data tidak sesuai dengan Purchase Order."

    # Pencocokan sederhana: Apakah batch number PO ada di dalam teks dokumen?
    if expected_batch in extracted_text:
        status = "MATCH"
        msg = "Verifikasi berhasil. Batch Number sesuai standar."

    # 4. Kembalikan respons yang sama persis dengan yang diharapkan React
    return {
        "status": "success",
        "data": {
            "material_name": expected_material,
            "batch_number": expected_batch,
            "verification_result": status,
            "message": msg
        }
    }