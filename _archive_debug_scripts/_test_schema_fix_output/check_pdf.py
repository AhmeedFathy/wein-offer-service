from pypdf import PdfReader
r = PdfReader("Soho House Cairo - Provider Negotiation Offers - Claude v1.pdf")
print("Pages:", len(r.pages))
for i, page in enumerate(r.pages):
    text = page.extract_text()
    if "Classic Caesar Salad" in text or "Tiramisu" in text or "Offer Contents" in text:
        print(f"--- Page {i} ---")
        print(text[:1500])
