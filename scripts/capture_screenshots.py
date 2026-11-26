import os
import subprocess
import time
from pathlib import Path

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
SCREENSHOTS_DIR = Path(r"C:\Users\user\Desktop\My WorkBench\Sistem Surat Masuk\docs\screenshots")
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)

TARGETS = [
    ("01_login_screen.png", "http://localhost:3000", 2500),
    ("02_dashboard_utama.png", "http://localhost:3000/?auth=1&view=utama", 3000),
    ("03_daftar_surat.png", "http://localhost:3000/?auth=1&view=daftar", 2500),
    ("04_peti_minit.png", "http://localhost:3000/?auth=1&view=peti", 2500),
    ("05_drawer_butiran.png", "http://localhost:3000/?auth=1&view=peti&modal=drawer", 3000),
    ("06_modal_minit.png", "http://localhost:3000/?auth=1&view=peti&modal=minit", 3000),
    ("07_modal_rekod.png", "http://localhost:3000/?auth=1&view=peti&modal=rekod", 3000),
    ("08_slip_qr_a5.png", "http://localhost:3000/?auth=1&view=peti&modal=slip", 3000),
    ("09_lembaran_minit_a4.png", "http://localhost:3000/?auth=1&view=peti&modal=sheet", 3000),
    ("10_paut_surat.png", "http://localhost:3000/?auth=1&view=peti&modal=link", 3000),
    ("11_pemantauan_sla.png", "http://localhost:3000/?auth=1&view=pantau", 2500),
    ("12_analisis_laporan.png", "http://localhost:3000/?auth=1&view=analisis", 3000),
    ("13_struktur_organisasi.png", "http://localhost:3000/?auth=1&view=struktur", 2500),
    ("14_pengurusan_pengguna.png", "http://localhost:3000/?auth=1&view=pengguna", 2500),
    ("15_pengurusan_menu.png", "http://localhost:3000/?auth=1&view=pengurusan_menu", 2500),
    ("16_pengurusan_peranan.png", "http://localhost:3000/?auth=1&view=pengurusan_peranan", 2500),
    ("17_tetapan_sistem.png", "http://localhost:3000/?auth=1&view=tetapan_sistem", 2500),
]

def capture_all():
    print(f"Starting capture of {len(TARGETS)} screenshots...")
    for filename, url, budget in TARGETS:
        out_path = SCREENSHOTS_DIR / filename
        cmd = [
            EDGE_PATH,
            "--headless=new",
            "--disable-gpu",
            "--window-size=1440,900",
            f"--virtual-time-budget={budget}",
            "--run-all-compositor-stages-before-draw",
            f"--screenshot={out_path.resolve()}",
            url
        ]
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=25)
            if out_path.exists():
                size_kb = out_path.stat().st_size / 1024
                print(f"[OK] {filename} ({size_kb:.1f} KB)")
            else:
                print(f"[FAIL] {filename}: Not created")
        except Exception as e:
            print(f"[ERROR] {filename}: {e}")

if __name__ == "__main__":
    capture_all()
