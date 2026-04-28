import os
from dotenv import load_dotenv
from azure.core.credentials import AzureKeyCredential
from azure.ai.formrecognizer import DocumentAnalysisClient

# Muat variabel dari file .env
load_dotenv()

endpoint = os.getenv("AZURE_ENDPOINT")
key = os.getenv("AZURE_KEY")

# Inisialisasi Klien Azure
document_analysis_client = DocumentAnalysisClient(
    endpoint=endpoint, credential=AzureKeyCredential(key)
)

def analyze_document(file_content: bytes) -> str:
    """
    Fungsi untuk mengirim file ke Azure dan mengekstrak teks menggunakan prebuilt-document.
    Proses polling (menunggu hasil) ditangani otomatis oleh SDK.
    """
    print("Mengirim dokumen ke Azure AI...")
    
    poller = document_analysis_client.begin_analyze_document(
        "prebuilt-document", document=file_content
    )
    
    # .result() akan menahan eksekusi (menunggu) sampai Azure selesai memproses
    result = poller.result()
    print("Ekstraksi selesai!")
    
    # Untuk MVP, kita kembalikan seluruh teks mentah (content) untuk dicocokkan
    return result.content