"""
WeIN PDF Builder — Provider Negotiation + Comparison
"""
import sys, json, re
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit

W, H = A4

# Colors
NAVY   = HexColor("#1F3864")
BLUE   = HexColor("#2E75B6")
ORANGE = HexColor("#F39C12")
TEAL   = HexColor("#1A7A6E")
LGREY  = HexColor("#F2F3F4")
DGREY  = HexColor("#888888")
MGREY  = HexColor("#666666")
LBLUE  = HexColor("#D6EAF8")
LORANGE= HexColor("#FDEBD0")
DKRED  = HexColor("#922B21")

def split_top_level(text):
    """Split a contents string on ' + ' at the top level only — does not split
    inside parentheses, so '1x A (x, y) + 1x B' -> ['1x A (x, y)', '1x B']."""
    parts = []
    depth = 0
    cur = ""
    i = 0
    while i < len(text):
        ch = text[i]
        if ch == '(':
            depth += 1
            cur += ch
        elif ch == ')':
            depth -= 1
            cur += ch
        elif depth == 0 and text[i:i+3] == ' + ':
            parts.append(cur.strip())
            cur = ""
            i += 3
            continue
        else:
            cur += ch
        i += 1
    if cur.strip():
        parts.append(cur.strip())
    return parts

def _contents(o):
    """Bundle contents — derived from items[] (current node-8 schema), falling
    back to a legacy 'contents' string if present."""
    items = o.get("items")
    if items:
        return " + ".join(item.get("name", "") for item in items)
    return o.get("contents", "")

def _party_size(o):
    """Party size — current schema has no party_size field; derive from
    keywords in the title/hook, defaulting to '—' if unclear."""
    if o.get("party_size"):
        return o["party_size"]
    text = (o.get("title", "") + " " + o.get("hook", "")).lower()
    if "family" in text:
        return "Family"
    if "group" in text:
        return "Group"
    if "couple" in text:
        return "Couple"
    if "solo" in text:
        return "Solo"
    return "—"

def wrap_text(c_obj, text, x, y, max_width, font, size, color, line_height=14):
    c_obj.setFont(font, size)
    c_obj.setFillColor(color)
    lines = simpleSplit(str(text), font, size, max_width)
    for i, line in enumerate(lines):
        c_obj.drawString(x, y - i * line_height, line)
    return y - len(lines) * line_height

def page_header(c_obj, provider, page_num):
    c_obj.setFont("Helvetica-Bold", 9)
    c_obj.setFillColor(NAVY)
    c_obj.drawString(20*mm, H - 12*mm, provider)
    c_obj.setFont("Helvetica", 8)
    c_obj.setFillColor(DGREY)
    c_obj.drawRightString(W - 20*mm, H - 12*mm, f"Page {page_num}")
    c_obj.setStrokeColor(LGREY)
    c_obj.setLineWidth(0.5)
    c_obj.line(20*mm, H - 14*mm, W - 20*mm, H - 14*mm)

def comp_page_header(c_obj, provider, page_num):
    c_obj.setFillColor(NAVY)
    c_obj.rect(0, H - 20*mm, W, 20*mm, fill=1, stroke=0)
    c_obj.setFont("Helvetica-Bold", 13)
    c_obj.setFillColor(white)
    c_obj.drawCentredString(W/2, H - 12*mm, provider)
    c_obj.setFont("Helvetica", 9)
    c_obj.setFillColor(LBLUE)
    c_obj.drawCentredString(W/2, H - 17*mm, "Offer Comparison vs Competitor")
    # footer
    c_obj.setFont("Helvetica", 7.5)
    c_obj.setFillColor(DGREY)
    c_obj.drawCentredString(W/2, 8*mm, f"Confidential  ·  WeIN Offer Specialist  ·  Page {page_num}")
    c_obj.setStrokeColor(LGREY)
    c_obj.setLineWidth(0.5)
    c_obj.line(20*mm, 13*mm, W - 20*mm, 13*mm)

# ─────────────────────────────────────────────────────────────────
# FILE 1 — PROVIDER NEGOTIATION PDF
# ─────────────────────────────────────────────────────────────────
def build_provider_pdf(data, output_path):
    provider   = data["provider"]
    tagline    = data.get("tagline", "")
    selected   = [o for o in data["offers"] if o.get("status","Selected") == "Selected"][:15]
    selected   = sorted(selected, key=lambda o: o.get("promo_egp") or o.get("price_discounted_egp", 0))  # always ascending by promo price
    commission = data.get("commission", 0.15)
    def _disc_dec(o):
        d = o.get("discount_pct", 0)
        return d / 100 if d > 1 else d  # normalize: stored as 28 or 0.28
    def _reg(o):
        return o.get("regular_egp") or o.get("price_original_egp", 0)
    def _promo(o):
        return o.get("promo_egp") or o.get("price_discounted_egp", 0)
    avg_disc   = sum(_disc_dec(o) for o in selected) / len(selected) if selected else 0
    highest    = max((_reg(o) for o in selected), default=0)
    top_disc   = max((_disc_dec(o) for o in selected), default=0)

    c = canvas.Canvas(str(output_path), pagesize=A4)

    # ── COVER PAGE ──────────────────────────────────────────────
    # Navy hero box
    c.setFillColor(NAVY)
    c.rect(20*mm, H - 80*mm, W - 40*mm, 55*mm, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 32)
    c.setFillColor(white)
    c.drawCentredString(W/2, H - 52*mm, provider)
    c.setFont("Helvetica", 11)
    c.setFillColor(LBLUE)
    c.drawCentredString(W/2, H - 62*mm, tagline)

    # KPI table
    kpi_y = H - 110*mm
    kpis = [
        ("Selected Offers", str(len(selected)), "Active offer set"),
        ("Average Discount", f"{avg_disc:.0%}", "Avg across all offers"),
        ("Highest Ticket", f"EGP {highest:,.0f}", "Highest regular price"),
        ("Top Discount", f"{top_disc:.0%}", "Strongest headline"),
    ]
    cell_w = (W - 40*mm) / 4
    for i, (label, value, sub) in enumerate(kpis):
        x = 20*mm + i * cell_w
        c.setStrokeColor(LGREY)
        c.setLineWidth(1)
        c.rect(x, kpi_y - 22*mm, cell_w, 22*mm, fill=0, stroke=1)
        c.setFont("Helvetica", 8)
        c.setFillColor(DGREY)
        c.drawCentredString(x + cell_w/2, kpi_y - 5*mm, label)
        c.setFont("Helvetica-Bold", 16)
        c.setFillColor(NAVY)
        c.drawCentredString(x + cell_w/2, kpi_y - 13*mm, value)
        c.setFont("Helvetica", 7)
        c.setFillColor(DGREY)
        c.drawCentredString(x + cell_w/2, kpi_y - 20*mm, sub)

    # Selected offers intro
    y = kpi_y - 35*mm
    c.setFont("Helvetica-Bold", 13)
    c.setFillColor(BLUE)
    c.drawString(20*mm, y, "Selected Offers")
    y -= 8*mm
    c.setFont("Helvetica", 9)
    c.setFillColor(DGREY)
    c.drawString(20*mm, y, f"The following {len(selected)} offers have been prepared for negotiation. Each offer is presented on a dedicated page for easy review.")

    # Header
    page_header(c, provider, 1)
    c.showPage()

    # ── OFFER PAGES ─────────────────────────────────────────────
    for idx, offer in enumerate(selected, start=1):
        disc_raw  = offer.get("discount_pct", 0)
        disc      = disc_raw / 100 if disc_raw > 1 else disc_raw  # normalize
        regular   = offer.get("regular_egp") or offer.get("price_original_egp", 0)
        promo     = offer.get("promo_egp") or offer.get("price_discounted_egp", 0)
        title_raw = offer.get("title", "")
        # Strip redundant discount suffix (badge already shows it)
        title     = re.sub(r'\s*·?\s*\d+%\s*off(?:\s*@[^·]+)?$', '', title_raw, flags=re.IGNORECASE).strip()
        bundle    = offer.get("bundle_type", offer.get("offer_type", "Bundle"))
        contents  = _contents(offer)
        terms     = offer.get("terms", "")
        if isinstance(terms, list):
            terms = ", ".join(str(t) for t in terms)

        page_header(c, provider, idx + 1)

        # Offer X of N
        c.setFont("Helvetica", 8)
        c.setFillColor(DGREY)
        c.drawRightString(W - 20*mm, H - 22*mm, f"Offer {idx} of {len(selected)}")

        # Title bar — badge at right, title clipped to available width
        title_y  = H - 30*mm
        badge_x  = W - 38*mm
        title_max_w = badge_x - 24*mm  # from 22mm left pad to badge start − 2mm gap

        c.setFillColor(LBLUE)
        c.rect(20*mm, title_y - 8*mm, W - 40*mm - 20*mm, 12*mm, fill=1, stroke=0)

        # Auto-shrink font until title fits on one line
        title_font_size = 11
        while title_font_size >= 7:
            if simpleSplit(title, "Helvetica-Bold", title_font_size, title_max_w).__len__() == 1:
                break
            title_font_size -= 0.5
        c.setFont("Helvetica-Bold", title_font_size)
        c.setFillColor(BLUE)
        # Truncate with ellipsis if still too long at minimum size
        display_title = title
        if len(simpleSplit(title, "Helvetica-Bold", title_font_size, title_max_w)) > 1:
            words = title.split()
            while words and len(simpleSplit(" ".join(words) + "…", "Helvetica-Bold", title_font_size, title_max_w)) > 1:
                words.pop()
            display_title = " ".join(words) + "…"
        c.drawString(22*mm, title_y - 3*mm, display_title)

        # Discount badge
        c.setFillColor(ORANGE)
        c.rect(badge_x, title_y - 8*mm, 18*mm, 12*mm, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 11)
        c.setFillColor(white)
        c.drawCentredString(badge_x + 9*mm, title_y - 3*mm, f"{disc:.0%}")

        # Price row — 2 columns only
        price_y = title_y - 22*mm
        c.setStrokeColor(LGREY)
        c.setLineWidth(0.5)
        c.rect(20*mm, price_y - 18*mm, (W-40*mm)/2, 22*mm, fill=0, stroke=1)
        c.rect(20*mm + (W-40*mm)/2, price_y - 18*mm, (W-40*mm)/2, 22*mm, fill=0, stroke=1)

        col1_x = 20*mm + (W-40*mm)/4
        col2_x = 20*mm + 3*(W-40*mm)/4

        c.setFont("Helvetica", 8)
        c.setFillColor(DGREY)
        c.drawCentredString(col1_x, price_y - 4*mm, "Regular Price")
        c.drawCentredString(col2_x, price_y - 4*mm, "Promo Price")

        c.setFont("Helvetica-Bold", 18)
        c.setFillColor(NAVY)
        c.drawCentredString(col1_x, price_y - 13*mm, f"EGP {regular:,.0f}")
        c.setFillColor(BLUE)
        c.drawCentredString(col2_x, price_y - 13*mm, f"EGP {promo:,.0f}")

        # Bundle type label
        btype_y = price_y - 28*mm
        c.setFillColor(TEAL)
        c.rect(20*mm, btype_y - 6*mm, W - 40*mm, 9*mm, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(white)
        c.drawString(23*mm, btype_y - 2*mm, bundle)

        CONTENT_LINE_H = 5*mm
        SUB_LINE_H     = 4.2*mm
        TERMS_LINE_H   = 5.5*mm
        SECTION_HEAD_H = 4.5*mm
        SECTION_GAP    = 7*mm
        PAD_TOP        = 5*mm
        PAD_BOTTOM     = 6*mm

        # ── Pre-pass: wrap Contents + Terms text so we can size the card ──
        # content_items: list of (kind, [wrapped lines], line_height)
        # kind: "header" (bold section label), "body" (top-level item bullet),
        #       "sub" (indented sub-item from a parenthetical list)
        content_items = []
        for line in contents.split("\n"):
            line = line.strip()
            if not line: continue
            # Strip price annotations like (190 LE), (600 LE), (120), (60 LE) etc.
            line = re.sub(r'\s*\(\d+(?:\s*LE)?\)', '', line)
            line = line.strip().rstrip('/')
            line = line.strip()
            if not line: continue
            # Section headers (SHARED:, PER PERSON:, etc.) — bold, no bullet
            is_header = not line.startswith("•") and line.endswith(":")
            if is_header:
                wrapped = simpleSplit(line, "Helvetica-Bold", 8.5, W - 50*mm)
                content_items.append(("header", wrapped, CONTENT_LINE_H))
                continue

            line = line.lstrip("•").strip()
            # Split into top-level items on " + ", respecting parentheses
            for part in split_top_level(line):
                m = re.match(r'^(.*?)\s*\(([^()]*)\)\s*$', part)
                if m:
                    main = m.group(1).strip()
                    subs = [s.strip() for s in m.group(2).split(",") if s.strip()]
                else:
                    main, subs = part, []
                wrapped_main = simpleSplit("• " + main, "Helvetica", 9, W - 50*mm)
                content_items.append(("body", wrapped_main, CONTENT_LINE_H))
                for sub in subs:
                    wrapped_sub = simpleSplit("‒ " + sub, "Helvetica", 8, W - 58*mm)
                    content_items.append(("sub", wrapped_sub, SUB_LINE_H))

        terms_items = []  # list of [wrapped lines] per term part
        if isinstance(terms, list):
            terms = " · ".join(str(t) for t in terms)
        for part in terms.replace("·", "\n").split("\n"):
            part = part.strip()
            if not part: continue
            wrapped = simpleSplit("• " + part, "Helvetica", 9, W - 50*mm)
            terms_items.append(wrapped)

        content_h = sum(len(w) * lh for _, w, lh in content_items)
        n_terms_lines = sum(len(w) for w in terms_items)

        card_h = (PAD_TOP
                  + SECTION_HEAD_H + content_h
                  + SECTION_GAP
                  + SECTION_HEAD_H + n_terms_lines * TERMS_LINE_H
                  + PAD_BOTTOM)

        card_top = btype_y - 6*mm - 2*mm  # small gap below the teal bundle bar
        c.setFillColor(LGREY)
        c.setStrokeColor(HexColor("#D5D8DC"))
        c.setLineWidth(0.6)
        c.roundRect(20*mm, card_top - card_h, W - 40*mm, card_h, 2*mm, fill=1, stroke=1)

        # Contents
        cont_y = card_top - PAD_TOP - 3.5*mm
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(NAVY)
        c.drawString(23*mm, cont_y, "Offer Contents")
        cont_y -= SECTION_HEAD_H
        last_line_h = SECTION_HEAD_H
        for kind, wrapped, lh in content_items:
            if kind == "header":
                c.setFont("Helvetica-Bold", 8.5)
                c.setFillColor(NAVY)
                x = 23*mm
            elif kind == "sub":
                c.setFont("Helvetica", 8)
                c.setFillColor(MGREY)
                x = 30*mm
            else:
                c.setFont("Helvetica", 9)
                c.setFillColor(black)
                x = 26*mm
            for l in wrapped:
                c.drawString(x, cont_y, l)
                cont_y -= lh
            last_line_h = lh

        # Terms
        terms_y = cont_y - SECTION_GAP + last_line_h
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(NAVY)
        c.drawString(23*mm, terms_y, "Terms / Conditions")
        terms_y -= SECTION_HEAD_H
        c.setFont("Helvetica", 9)
        c.setFillColor(MGREY)
        for wrapped in terms_items:
            for wline in wrapped:
                c.drawString(26*mm, terms_y, wline)
                terms_y -= TERMS_LINE_H

        c.showPage()

    c.save()
    print(f"DONE: {Path(output_path).name}")


# ─────────────────────────────────────────────────────────────────
# FILE 2 — COMPARISON PDF
# ─────────────────────────────────────────────────────────────────
VERTICAL_FLOORS = {
    "dining":              35,
    "food & beverage":     35,
    "food":                35,
    "restaurant":          35,
    "fun & activities":    35,
    "activities":          35,
    "entertainment":       35,
    "health & beauty":     25,
    "beauty":              25,
    "wellness":            25,
    "hotels":              20,
    "hotel":               20,
    "aqua park":           20,
    "aquapark":            20,
}

def _parse_waf_max(waffarha_adj):
    """Extract max waffarha discount % from the waffarha_adj string."""
    if not waffarha_adj:
        return None
    m = re.search(r'max\s+discount\s+([\d.]+)%', str(waffarha_adj), re.IGNORECASE)
    if m:
        return float(m.group(1))
    m = re.search(r'([\d.]+)%\s*[→\-]', str(waffarha_adj))
    if m:
        return float(m.group(1))
    return None

def _competitor_floor(data):
    """Return competitor discount % from waffarha_benchmark, waffarha_adj, or vertical floor."""
    # 1. Structured benchmark field (preferred)
    bench = data.get("waffarha_benchmark") or {}
    if isinstance(bench, dict):
        v = bench.get("competitor_max_discount")
        if v:
            v = float(v)
            return v if v > 1 else v * 100
    # 2. Parse from waffarha_adj string
    waf_max = _parse_waf_max(data.get("waffarha_adj", ""))
    if waf_max is not None:
        return waf_max
    # 3. Vertical floor fallback
    vertical = (data.get("vertical") or "").lower().strip()
    for key, floor in VERTICAL_FLOORS.items():
        if key in vertical:
            return floor
    return 30  # safe default

def _derive_comparisons(data, selected):
    """Build comparison rows from offer fields when no 'comparisons' key exists."""
    cdp = _competitor_floor(data)   # competitor discount %
    comp_label = "WAFFARHA" if (data.get("waffarha_benchmark") or data.get("waffarha_adj")) else "COMPETITOR"
    rows = []
    for o in selected:
        our_disc_raw = o.get("discount_pct", 0)
        our_disc_pct = our_disc_raw if our_disc_raw > 1 else our_disc_raw * 100
        reg   = o.get("regular_egp") or o.get("price_original_egp", 0)
        promo = o.get("promo_egp")   or o.get("price_discounted_egp", 0)
        # competitor's deal price = same regular price at their (lower) discount
        comp_deal = round(reg * (1 - cdp / 100)) if reg else 0
        title = re.sub(r'\s*·?\s*\d+%\s*off(?:\s*@[^·]+)?$', '',
                       o.get("title", ""), flags=re.IGNORECASE).strip()
        items = [item.get("name","") for item in (o.get("items") or [])[:3] if item.get("name")]
        party = o.get("party_size") or _party_size(o)
        tier  = o.get("tier", "")
        section = f"{party} — {tier}" if tier else party
        gap = our_disc_pct - cdp
        gap_label = f"+{gap:.0f}% vs {comp_label.title()}"
        why_win   = (f"WeIN at {our_disc_pct:.0f}% vs {comp_label.title()} {cdp:.0f}% — "
                     f"{gap:.0f}% stronger deal with curated bundle")
        rows.append({
            "section":       section,
            "gap":           gap_label,
            "our_title":     title,
            "our_disc":      f"{our_disc_pct:.0f}%",
            "our_reg":       f"EGP {reg:,.0f}"    if reg   else "",
            "our_promo_str": f"EGP {promo:,.0f}"  if promo else "",
            "our_items":     items,
            "comp_disc":     f"{cdp:.0f}%",
            # Competitor regular = same item at same base price; promo = their deal
            "comp_reg":      f"EGP {reg:,.0f}"      if reg      else "",
            "comp_promo_str":f"EGP {comp_deal:,.0f}" if comp_deal else "",
            "comp_items":    [],
            "comp_label":    comp_label,
            "why_win":       why_win,
        })
    return rows

def build_comparison_pdf(data, output_path):
    provider   = data["provider"]
    selected   = [o for o in data["offers"] if o.get("status","Selected") == "Selected"][:15]
    comps      = data.get("comparisons") or []
    if not comps:
        comps = _derive_comparisons(data, selected)
    if comps and not data.get("avg_gap"):
        gap_vals = []
        for c in comps:
            try: gap_vals.append(float(re.search(r'[+-]?\d+', c.get("gap","")).group()))
            except: pass
        avg_gap = f"+{sum(gap_vals)/len(gap_vals):.0f}%" if gap_vals else "+6%"
    else:
        avg_gap = data.get("avg_gap", "+6%")

    c = canvas.Canvas(str(output_path), pagesize=A4)
    page_num   = 1

    # KPI bar — first page only
    def draw_kpi_bar(c_obj, y):
        kpis = [
            ("Selected Offers", str(len(selected))),
            ("Avg Gap vs Market", avg_gap),
            ("Max Discount", f"{max((o.get('discount_pct',0) if o.get('discount_pct',0)>1 else o.get('discount_pct',0)*100 for o in selected),default=0):.0f}%"),
            ("Couple Formats", str(data.get("couple_formats", len([o for o in selected if _party_size(o)=='Couple'])))),
            ("At Target", f"{len(selected)}/{len(selected)}"),
            ("Category", data.get("category_short") or data.get("vertical") or "—"),
        ]
        cw = (W - 40*mm) / 6
        for i, (label, val) in enumerate(kpis):
            x = 20*mm + i * cw
            c_obj.setStrokeColor(LGREY)
            c_obj.setLineWidth(0.8)
            c_obj.rect(x, y - 16*mm, cw, 16*mm, fill=0, stroke=1)
            c_obj.setFont("Helvetica", 7)
            c_obj.setFillColor(DGREY)
            c_obj.drawCentredString(x + cw/2, y - 4*mm, label)
            c_obj.setFont("Helvetica-Bold", 12)
            c_obj.setFillColor(NAVY)
            c_obj.drawCentredString(x + cw/2, y - 11*mm, val)
        return y - 22*mm

    def draw_comparison(c_obj, comp, y):
        # Accept BOTH schemas: my build schema (our_title/comp_reg/why_win)
        # and the Cowork schema (our_offer/comp_regular/why_we_win)
        def fmt_egp(v):
            if v is None or v == "": return ""
            if isinstance(v, (int, float)): return f"EGP {v:,.0f}"
            return str(v)

        section   = comp.get("section") or comp.get("our_offer", "")
        gap_label = comp.get("gap", "+5% above market")
        our_title = comp.get("our_title") or comp.get("our_offer", "")
        our_disc  = comp.get("our_disc", "")
        our_reg   = comp.get("our_reg") or fmt_egp(comp.get("our_regular", ""))
        our_promo = comp.get("our_promo_str") or fmt_egp(comp.get("our_promo", ""))
        our_items = comp.get("our_items", [])
        comp_disc = comp.get("comp_disc", "")
        comp_reg  = comp.get("comp_reg") or fmt_egp(comp.get("comp_regular", ""))
        comp_promo= comp.get("comp_promo_str") or fmt_egp(comp.get("comp_promo", ""))
        comp_items= comp.get("comp_items", [])
        why_win   = comp.get("why_win") or comp.get("why_we_win", "")

        needed = 75*mm
        if y - needed < 25*mm:
            return None  # needs new page

        # Section header
        c_obj.setFillColor(LBLUE)
        c_obj.rect(20*mm, y - 7*mm, W - 40*mm - 30*mm, 9*mm, fill=1, stroke=0)
        c_obj.setFont("Helvetica-Bold", 9)
        c_obj.setFillColor(BLUE)
        c_obj.drawString(22*mm, y - 3*mm, section)

        # Gap badge
        c_obj.setFillColor(TEAL)
        c_obj.rect(W - 58*mm, y - 7*mm, 38*mm, 9*mm, fill=1, stroke=0)
        c_obj.setFont("Helvetica-Bold", 8)
        c_obj.setFillColor(white)
        c_obj.drawCentredString(W - 39*mm, y - 3*mm, gap_label)

        y -= 11*mm
        half = (W - 40*mm) / 2

        # Our offer header
        c_obj.setFillColor(TEAL)
        c_obj.rect(20*mm, y - 7*mm, half, 9*mm, fill=1, stroke=0)
        c_obj.setFont("Helvetica-Bold", 8)
        c_obj.setFillColor(white)
        c_obj.drawString(22*mm, y - 3*mm, f"OUR OFFER — {our_title} — {our_disc} OFF")

        # Competitor header — label adapts to the source found
        comp_label = comp.get("comp_label", "COMPETITOR")
        c_obj.setFillColor(ORANGE)
        c_obj.rect(20*mm + half, y - 7*mm, half, 9*mm, fill=1, stroke=0)
        c_obj.drawCentredString(20*mm + half + half/2, y - 3*mm, comp_label)

        y -= 11*mm

        # Discount %s
        c_obj.setFont("Helvetica-Bold", 22)
        c_obj.setFillColor(NAVY)
        c_obj.drawCentredString(20*mm + half/2, y - 8*mm, f"{our_disc} OFF")
        c_obj.setFillColor(ORANGE)
        c_obj.drawCentredString(20*mm + half + half/2, y - 8*mm, f"{comp_disc} OFF")
        y -= 14*mm

        # Prices — 2 col each side
        c_obj.setFont("Helvetica", 8)
        c_obj.setFillColor(NAVY)
        c_obj.drawString(22*mm, y, f"Regular: {our_reg}")
        c_obj.drawString(22*mm, y - 5*mm, f"Promo: {our_promo}")
        c_obj.setFillColor(HexColor("#935116"))
        c_obj.drawString(22*mm + half, y, f"Regular: {comp_reg}")
        c_obj.drawString(22*mm + half, y - 5*mm, f"Promo: {comp_promo}")
        y -= 12*mm

        # Items
        start_y = y
        c_obj.setFont("Helvetica", 8)
        c_obj.setFillColor(black)
        oy = start_y
        for item in our_items:
            c_obj.drawString(22*mm, oy, f"• {item}")
            oy -= 5*mm

        cy = start_y
        c_obj.setFillColor(HexColor("#935116"))
        for item in comp_items:
            c_obj.drawString(22*mm + half, cy, f"• {item}")
            cy -= 5*mm

        y = min(oy, cy) - 4*mm

        # WHY WE WIN banner
        c_obj.setFillColor(TEAL)
        lines = simpleSplit(f"WHY WE WIN: {why_win}", "Helvetica", 8, W - 46*mm)
        banner_h = max(10*mm, len(lines) * 5*mm + 4*mm)
        c_obj.rect(20*mm, y - banner_h, W - 40*mm, banner_h, fill=1, stroke=0)
        c_obj.setFont("Helvetica", 8)
        c_obj.setFillColor(white)
        for i, line in enumerate(lines):
            c_obj.drawString(22*mm, y - 5*mm - i*5*mm, line)
        y -= banner_h + 6*mm

        return y

    # Build pages
    comp_page_header(c, provider, page_num)
    y = H - 26*mm
    y = draw_kpi_bar(c, y)
    y -= 4*mm

    for comp in comps:
        result = draw_comparison(c, comp, y)
        if result is None:
            c.showPage()
            page_num += 1
            comp_page_header(c, provider, page_num)
            y = H - 26*mm
            y = draw_comparison(c, comp, y)
        else:
            y = result
        if y < 25*mm:
            c.showPage()
            page_num += 1
            comp_page_header(c, provider, page_num)
            y = H - 26*mm

    c.save()
    print(f"DONE: {Path(output_path).name}")


def run(json_path, output_dir, mode="both"):
    """
    mode = 'both'        → rebuild provider PDF + comparison PDF (new provider / re-send)
    mode = 'comparison'  → rebuild ONLY the comparison PDF (internal — safe for adjustments)
    mode = 'provider'    → rebuild ONLY the provider negotiation PDF (re-send only)
    """
    output_dir = Path(output_dir)
    with open(json_path, encoding="utf-8") as f:
        data = json.load(f)

    provider = data["provider"]

    def next_v(name, ext):
        v = 1
        while (output_dir / f"{provider} - {name} - Claude v{v}.{ext}").exists():
            v += 1
        return v

    if mode in ("both", "provider"):
        v1 = next_v("Provider Negotiation Offers", "pdf")
        build_provider_pdf(data, output_dir / f"{provider} - Provider Negotiation Offers - Claude v{v1}.pdf")
        print(f"DONE: Provider Negotiation PDF v{v1}")

    if mode in ("both", "comparison"):
        v2 = next_v("Offer Comparison vs Competitor", "pdf")
        build_comparison_pdf(data, output_dir / f"{provider} - Offer Comparison vs Competitor - Claude v{v2}.pdf")
        print(f"DONE: Comparison PDF v{v2}")

    if mode == "comparison":
        print("ADJUST MODE: Comparison PDF rebuilt (internal). Provider PDF unchanged.")

    # ── Best-effort Telegram notify on full build / re-send ──────────────────
    # Sends a "ready" message + both PDFs. Silently skips if no token is set;
    # never breaks the build.
    if mode == "both":
        try:
            sys.path.insert(0, str(Path(__file__).resolve().parent))
            import send_telegram
            if send_telegram.token_available():
                send_telegram.notify(provider, str(output_dir))
            else:
                print("NOTE: Telegram token not configured — skipping notify. "
                      "Set TELEGRAM_BOT_TOKEN or create _Templates/.telegram_token to enable.")
        except Exception as e:
            print(f"NOTE: Telegram notify skipped ({e})")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python build_pdfs.py <json_path> <output_dir> [mode]")
        print("  mode: both (default) | comparison | provider")
        sys.exit(1)
    m = sys.argv[3] if len(sys.argv) > 3 else "both"
    run(sys.argv[1], sys.argv[2], m)
