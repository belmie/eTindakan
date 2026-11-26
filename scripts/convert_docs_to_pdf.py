import os
import re
import sys
import subprocess
from pathlib import Path
from markdown_it import MarkdownIt

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
DOCS_DIR = Path(r"C:\Users\user\Desktop\My WorkBench\Sistem Surat Masuk\docs")

CSS_STYLES = """
@page {
    size: A4 portrait;
    margin: 18mm 14mm 18mm 14mm;
}

@media print {
    body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
    .page-break {
        page-break-before: always;
    }
    h2 {
        page-break-before: auto;
        page-break-after: avoid;
    }
    table, figure, pre {
        page-break-inside: avoid;
    }
}

* {
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    background: #ffffff;
    line-height: 1.55;
    font-size: 9.5pt;
    margin: 0;
    padding: 0;
}

.doc-header-banner {
    border-bottom: 2px solid #0b3d5c;
    padding-bottom: 12px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.doc-header-banner .agency {
    font-size: 11pt;
    font-weight: 700;
    color: #0b3d5c;
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

.doc-header-banner .system {
    font-size: 8.5pt;
    color: #64748b;
    font-weight: 500;
}

h1 {
    font-size: 18pt;
    font-weight: 800;
    color: #0b3d5c;
    line-height: 1.25;
    margin-top: 0;
    margin-bottom: 8px;
    letter-spacing: -0.3px;
}

h2 {
    font-size: 13pt;
    font-weight: 700;
    color: #0b3d5c;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 4px;
    margin-top: 22px;
    margin-bottom: 10px;
}

h3 {
    font-size: 11pt;
    font-weight: 600;
    color: #334155;
    margin-top: 16px;
    margin-bottom: 6px;
}

h4 {
    font-size: 10pt;
    font-weight: 600;
    color: #475569;
    margin-top: 12px;
    margin-bottom: 4px;
}

p {
    margin-top: 0;
    margin-bottom: 8px;
    text-align: justify;
}

hr {
    border: none;
    border-top: 1px solid #cbd5e1;
    margin: 18px 0;
}

ul, ol {
    margin-top: 0;
    margin-bottom: 8px;
    padding-left: 22px;
}

li {
    margin-bottom: 3px;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 16px 0;
    font-size: 8pt;
    line-height: 1.4;
}

th {
    background-color: #0b3d5c;
    color: #ffffff;
    font-weight: 600;
    text-align: left;
    padding: 6px 8px;
    border: 1px solid #0b3d5c;
}

td {
    padding: 5px 8px;
    border: 1px solid #cbd5e1;
    vertical-align: top;
}

tbody tr:nth-child(even) {
    background-color: #f8fafc;
}

tbody tr:hover {
    background-color: #f1f5f9;
}

code {
    font-family: Consolas, 'Courier New', monospace;
    font-size: 8.5pt;
    background-color: #f1f5f9;
    color: #0f172a;
    padding: 1px 4px;
    border-radius: 3px;
    border: 1px solid #e2e8f0;
}

pre {
    background-color: #0f172a;
    color: #f8fafc;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 8pt;
    line-height: 1.45;
    overflow-x: auto;
    margin: 10px 0 14px 0;
}

pre code {
    background: transparent;
    color: inherit;
    padding: 0;
    border: none;
    font-size: 8pt;
}

blockquote {
    margin: 10px 0;
    padding: 8px 14px;
    background-color: #f0fdf4;
    border-left: 4px solid #16a34a;
    border-radius: 0 4px 4px 0;
    color: #166534;
    font-size: 8.5pt;
}

blockquote.note {
    background-color: #eff6ff;
    border-left-color: #2563eb;
    color: #1e40af;
}

blockquote.warning {
    background-color: #fffbeb;
    border-left-color: #d97706;
    color: #92400e;
}

img {
    max-width: 96%;
    height: auto;
    display: block;
    margin: 14px auto 4px auto;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
    page-break-inside: avoid;
}

p em {
    color: #64748b;
    font-size: 8pt;
}

.checkbox {
    font-family: monospace;
    font-weight: bold;
    color: #475569;
}

.footer-stamp {
    margin-top: 30px;
    padding-top: 10px;
    border-top: 1px solid #cbd5e1;
    font-size: 7.5pt;
    color: #64748b;
    display: flex;
    justify-content: space-between;
}
"""

def preprocess_markdown(text: str) -> str:
    # Convert alert blockquotes
    lines = text.split("\n")
    new_lines = []
    in_quote = False
    quote_type = ""
    
    for line in lines:
        if line.startswith("> [!NOTE]"):
            new_lines.append('<blockquote class="note"><strong>NOTA PENTING:</strong> ' + line[9:].strip())
            in_quote = True
            quote_type = "note"
            continue
        elif line.startswith("> [!TIP]"):
            new_lines.append('<blockquote class="tip"><strong>PETUA & TIP:</strong> ' + line[8:].strip())
            in_quote = True
            quote_type = "tip"
            continue
        elif line.startswith("> [!WARNING]"):
            new_lines.append('<blockquote class="warning"><strong>PERINGATAN:</strong> ' + line[12:].strip())
            in_quote = True
            quote_type = "warning"
            continue
        elif in_quote:
            if line.startswith("> "):
                new_lines.append(line[2:])
                continue
            elif line.startswith(">"):
                new_lines.append(line[1:])
                continue
            else:
                new_lines.append("</blockquote>")
                in_quote = False
        
        # Replace checkboxes
        line = line.replace("[ ]", '<span class="checkbox">&#9634;</span>')
        line = line.replace("[x]", '<span class="checkbox">&#9632;</span>')
        line = line.replace("[X]", '<span class="checkbox">&#9632;</span>')
        new_lines.append(line)
        
    if in_quote:
        new_lines.append("</blockquote>")
        
    return "\n".join(new_lines)

def convert_md_to_html(md_path: Path) -> Path:
    raw_md = md_path.read_text(encoding="utf-8")
    processed_md = preprocess_markdown(raw_md)
    
    md_parser = MarkdownIt().enable("table")
    body_html = md_parser.render(processed_md)
    
    doc_title = md_path.stem.replace("_", " ").title()
    
    full_html = f"""<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <title>{doc_title} - STSM MAINS</title>
    <style>
        {CSS_STYLES}
    </style>
</head>
<body>
    <div class="doc-header-banner">
        <div class="agency">Majlis Agama Islam Negeri Sembilan (MAINS)</div>
        <div class="system">Sistem Tindakan Surat Masuk (STSM) &bull; Dokumentasi Rasmi</div>
    </div>
    <div class="content-body">
        {body_html}
    </div>
    <div class="footer-stamp">
        <div>MAJLIS AGAMA ISLAM NEGERI SEMBILAN &copy; 2026</div>
        <div>Dokumen Rasmi STSM &bull; Dicetak pada 21 November 2026</div>
    </div>
</body>
</html>
"""
    html_path = md_path.with_suffix(".html")
    html_path.write_text(full_html, encoding="utf-8")
    return html_path

def convert_html_to_pdf(html_path: Path, pdf_path: Path):
    cmd = [
        EDGE_PATH,
        "--headless=new",
        "--disable-gpu",
        "--run-all-compositor-stages-before-draw",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path.resolve()}",
        str(html_path.resolve())
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if pdf_path.exists():
            size_kb = pdf_path.stat().st_size / 1024
            print(f"Successfully generated {pdf_path.name} ({size_kb:.1f} KB)")
        else:
            print(f"PDF file not found after conversion: {pdf_path.name}. Edge stdout: {res.stdout}, stderr: {res.stderr}")
    except Exception as e:
        print(f"Error running Edge for {html_path.name}: {e}")

def main():
    target_files = [
        DOCS_DIR / "USER_REQUIREMENTS_SPECIFICATION.md",
        DOCS_DIR / "USER_MANUAL.md",
        DOCS_DIR / "UAT_TEST_SCRIPT.md"
    ]
    
    for md_file in target_files:
        if not md_file.exists():
            print(f"File not found: {md_file}")
            continue
        print(f"\nProcessing {md_file.name}...")
        html_file = convert_md_to_html(md_file)
        pdf_file = md_file.with_suffix(".pdf")
        convert_html_to_pdf(html_file, pdf_file)

if __name__ == "__main__":
    main()
