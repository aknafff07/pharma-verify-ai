from PIL import Image, ImageDraw, ImageFont

# Membuat kanvas putih
img = Image.new('RGB', (400, 300), color = 'white')
d = ImageDraw.Draw(img)

# Data label
teks_label = """
=================================
RAW MATERIAL IDENTIFICATION LABEL
=================================
COMPANY      : PT Medika Nusantara
MATERIAL NAME: Paracetamol USP
MATERIAL CODE: RM-PCT-001
BATCH NUMBER : B-20260424A
MFG DATE     : 20-04-2026
EXP DATE     : 20-04-2028
QUANTITY     : 50.00 Kg
SUPPLIER     : Global Chemindo
=================================
STATUS       : QUARANTINE
=================================
"""

# Menggambar teks ke dalam gambar
d.text((20, 20), teks_label, fill="black")

# Menyimpan gambar
img.save('dummy_label_1.png')
print("Gambar dummy_label_1.png berhasil dibuat!")