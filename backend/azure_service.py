import os
from dotenv import load_dotenv
from azure.core.credentials import AzureKeyCredential
from azure.ai.formrecognizer import DocumentAnalysisClient

load_dotenv()

endpoint = os.getenv("AZURE_ENDPOINT")
key = os.getenv("AZURE_KEY")

document_analysis_client = DocumentAnalysisClient(
    endpoint=endpoint, credential=AzureKeyCredential(key)
)

def analyze_document_with_polygon(file_bytes: bytes) -> dict:
    """
    Mengembalikan dictionary berisi 'extracted_data' (untuk UI Key-Value)
    dan 'raw_content' (seluruh teks mentah untuk keakuratan pencocokan).
    """
    poller = document_analysis_client.begin_analyze_document(
        "prebuilt-document", document=file_bytes
    )
    result = poller.result()

    extracted_data = []

    for kv_pair in result.key_value_pairs:
        if kv_pair.key and kv_pair.value:
            key_poly = [{"x": p.x, "y": p.y} for p in kv_pair.key.bounding_regions[0].polygon] if kv_pair.key.bounding_regions else []
            value_poly = [{"x": p.x, "y": p.y} for p in kv_pair.value.bounding_regions[0].polygon] if kv_pair.value.bounding_regions else []

            extracted_data.append({
                "key": kv_pair.key.content,
                "value": kv_pair.value.content,
                "confidence": kv_pair.confidence,
                "key_polygon": key_poly,
                "value_polygon": value_poly
            })

    # KITA TAMBAHKAN INI: Mengambil seluruh teks mentah yang berhasil dibaca AI
    # Meskipun AI gagal menjadikannya Key-Value, teksnya pasti ada di sini.
    return {
        "kv_data": extracted_data,
        "raw_text": result.content 
    }