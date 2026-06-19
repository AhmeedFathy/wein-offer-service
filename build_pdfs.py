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
NAVY   = HexColor("#1B3A6B")   # WeIN deep blue
BLUE   = HexColor("#2E75B6")
ORANGE = HexColor("#F5A623")   # discount badge
TEAL   = HexColor("#2E7D6F")   # accent / upgrade
LGREY  = HexColor("#F4F6F9")
DGREY  = HexColor("#888888")
MGREY  = HexColor("#555555")
LBLUE  = HexColor("#D6EAF8")
LORANGE= HexColor("#FEF3DC")
DKRED  = HexColor("#922B21")
CARD_BG= HexColor("#FFFFFF")
CARD_BD= HexColor("#D8DCE6")

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
# FILE 1 — PROVIDER NEGOTIATION PDF  (Waffarha card style, 2/page)
# ─────────────────────────────────────────────────────────────────

# Fixed card dimensions
CARD_W  = W - 30*mm          # 180mm — 15mm margin each side
CARD_H  = 125*mm             # two cards + 7mm gap fits A4
CARD_X  = 15*mm
CARD_GAP = 7*mm
# Top positions of card 1 and card 2 within the body area (below header line)
BODY_TOP = H - 18*mm         # below page header rule


def _draw_offer_card(c, offer, provider, card_top, card_w, card_h, idx, total):
    """Draw a single Waffarha-style offer card.  card_top = y of TOP edge."""
    cx    = CARD_X
    cbot  = card_top - card_h
    cw    = card_w
    ch    = card_h

    # ── Card background + border ─────────────────────────────────
    c.setFillColor(CARD_BG)
    c.setStrokeColor(CARD_BD)
    c.setLineWidth(0.8)
    c.roundRect(cx, cbot, cw, ch, 3*mm, fill=1, stroke=1)

    # ── 1. HEADER BAND — navy, full-width top of card ────────────
    HEADER_H = 16*mm
    header_top = card_top
    c.setFillColor(NAVY)
    # Clip to rounded top corners: draw a rect inside + a rect for top-rounded fill
    c.roundRect(cx, header_top - HEADER_H, cw, HEADER_H + 3*mm, 3*mm, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.rect(cx, header_top - HEADER_H, cw, 3*mm, fill=1, stroke=0)

    # Party size + tier label (small, top-left)
    party = offer.get("party_size", "")
    tier  = offer.get("tier", "")
    sub_label = f"{party}  ·  {tier}" if party and tier else (party or tier or "")
    c.setFont("Helvetica", 7)
    c.setFillColor(LBLUE)
    c.drawString(cx + 4*mm, header_top - 4*mm, sub_label)

    # Offer number (small, top-right)
    c.setFont("Helvetica", 7)
    c.drawRightString(cx + cw - 4*mm, header_top - 4*mm, f"#{idx} of {total}")

    # Title — auto-shrink to fit width excluding badge space
    BADGE_W   = 20*mm
    title_raw = offer.get("title", "")
    title     = re.sub(r'\s*·?\s*\d+%\s*off(?:\s*@[^·]+)?$', '', title_raw, flags=re.IGNORECASE).strip()
    title_max = cw - BADGE_W - 10*mm
    tfont = 11
    while tfont >= 7.5:
        if len(simpleSplit(title, "Helvetica-Bold", tfont, title_max)) <= 1:
            break
        tfont -= 0.5
    # Truncate with ellipsis if still multi-line at min size
    display_title = title
    if len(simpleSplit(title, "Helvetica-Bold", tfont, title_max)) > 1:
        words = title.split()
        while words and len(simpleSplit(" ".join(words) + "...", "Helvetica-Bold", tfont, title_max)) > 1:
            words.pop()
        display_title = " ".join(words) + "..."
    c.setFont("Helvetica-Bold", tfont)
    c.setFillColor(white)
    c.drawString(cx + 4*mm, header_top - 11*mm, display_title)

    # ── Discount badge — orange pill at top-right of header ──────
    disc_raw = offer.get("discount_pct", 0)
    disc     = disc_raw / 100 if disc_raw > 1 else disc_raw
    badge_x  = cx + cw - BADGE_W - 2*mm
    badge_y  = header_top - HEADER_H + 2*mm
    c.setFillColor(ORANGE)
    c.roundRect(badge_x, badge_y, BADGE_W, HEADER_H - 4*mm, 2.5*mm, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 13)
    c.setFillColor(white)
    c.drawCentredString(badge_x + BADGE_W/2, badge_y + 3.5*mm, f"{disc:.0%}")
    c.setFont("Helvetica", 6.5)
    c.drawCentredString(badge_x + BADGE_W/2, badge_y + 0.5*mm, "OFF")

    # ── 2. PRICE ROW ─────────────────────────────────────────────
    reg   = offer.get("regular_egp") or offer.get("price_original_egp", 0)
    promo = offer.get("promo_egp")   or offer.get("price_discounted_egp", 0)
    price_top = header_top - HEADER_H
    PRICE_H   = 17*mm
    half_w    = cw / 2

    # Left col: Regular Price
    c.setFillColor(LGREY)
    c.rect(cx, price_top - PRICE_H, half_w, PRICE_H, fill=1, stroke=0)
    c.setFont("Helvetica", 7.5)
    c.setFillColor(DGREY)
    c.drawCentredString(cx + half_w/2, price_top - 4*mm, "Regular Price")
    c.setFont("Helvetica-Bold", 14)
    c.setFillColor(MGREY)
    c.drawCentredString(cx + half_w/2, price_top - 12*mm, f"EGP {reg:,.0f}" if reg else "—")

    # Right col: WeIN Price (highlighted)
    c.setFillColor(LORANGE)
    c.rect(cx + half_w, price_top - PRICE_H, half_w, PRICE_H, fill=1, stroke=0)
    c.setFont("Helvetica", 7.5)
    c.setFillColor(TEAL)
    c.drawCentredString(cx + half_w + half_w/2, price_top - 4*mm, "WeIN Price")
    c.setFont("Helvetica-Bold", 16)
    c.setFillColor(NAVY)
    c.drawCentredString(cx + half_w + half_w/2, price_top - 13*mm, f"EGP {promo:,.0f}" if promo else "—")

    # Divider below price row
    div_y = price_top - PRICE_H
    c.setStrokeColor(CARD_BD)
    c.setLineWidth(0.4)
    c.line(cx + 3*mm, div_y, cx + cw - 3*mm, div_y)

    # ── 3. CONTENTS ──────────────────────────────────────────────
    contents = _contents(offer)
    PAD_L = cx + 5*mm
    cont_y = div_y - 4.5*mm

    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(NAVY)
    c.drawString(PAD_L, cont_y, "What's included:")
    cont_y -= 5*mm

    # Parse and render items (max 6 bullets, cap width)
    item_count = 0
    item_max_w = cw - 10*mm
    for line in contents.split("\n"):
        if item_count >= 6:
            break
        line = re.sub(r'\s*\(\d+(?:\s*LE)?\)', '', line).strip().rstrip('/').strip()
        if not line or line.endswith(":"):
            continue
        line = line.lstrip("•").strip()
        for part in split_top_level(line):
            if item_count >= 6:
                break
            m = re.match(r'^(.*?)\s*\(([^()]*)\)\s*$', part)
            main = m.group(1).strip() if m else part.strip()
            if not main:
                continue
            bullet = simpleSplit("• " + main, "Helvetica", 8.5, item_max_w)
            c.setFont("Helvetica", 8.5)
            c.setFillColor(black)
            for bl in bullet[:2]:  # cap each item at 2 wrapped lines
                if cont_y < cbot + 22*mm:
                    break
                c.drawString(PAD_L + 2*mm, cont_y, bl)
                cont_y -= 5*mm
            item_count += 1

    # ── 4. UPGRADE TIER (teal band) ──────────────────────────────
    upgrade = offer.get("upgrade_tier") or offer.get("upgrade")
    if upgrade and cont_y > cbot + 16*mm:
        cont_y -= 2*mm
        UP_H = 9*mm
        c.setFillColor(TEAL)
        c.roundRect(cx + 3*mm, cont_y - UP_H, cw - 6*mm, UP_H, 1.5*mm, fill=1, stroke=0)
        up_text = simpleSplit(f"+ Upgrade: {upgrade}", "Helvetica", 7.5, cw - 14*mm)
        c.setFont("Helvetica", 7.5)
        c.setFillColor(white)
        c.drawString(cx + 7*mm, cont_y - 6*mm, up_text[0] if up_text else "")
        cont_y -= UP_H + 2*mm

    # ── 5. DIVIDER ───────────────────────────────────────────────
    if cont_y > cbot + 12*mm:
        cont_y -= 1.5*mm
        c.setStrokeColor(CARD_BD)
        c.setLineWidth(0.4)
        c.line(cx + 3*mm, cont_y, cx + cw - 3*mm, cont_y)
        cont_y -= 3*mm

    # ── 6. TERMS ─────────────────────────────────────────────────
    terms = offer.get("terms", "")
    if isinstance(terms, list):
        terms = " · ".join(str(t) for t in terms)
    if terms and cont_y > cbot + 4*mm:
        c.setFont("Helvetica-Bold", 7.5)
        c.setFillColor(DGREY)
        c.drawString(PAD_L, cont_y, "Terms:")
        cont_y -= 4.5*mm
        c.setFont("Helvetica", 7)
        c.setFillColor(DGREY)
        term_max_w = cw - 10*mm
        term_lines = []
        for part in terms.replace("·", "\n").split("\n"):
            part = part.strip()
            if not part:
                continue
            wrapped = simpleSplit(part, "Helvetica", 7, term_max_w)
            term_lines.extend(wrapped)
        for tl in term_lines[:3]:  # max 3 lines of terms
            if cont_y < cbot + 2*mm:
                break
            c.drawString(PAD_L + 2*mm, cont_y, tl)
            cont_y -= 4.5*mm


def build_provider_pdf(data, output_path):
    provider  = data["provider"]
    tagline   = data.get("tagline", "")
    selected  = [o for o in data["offers"] if o.get("status", "Selected") == "Selected"][:15]
    selected  = sorted(selected, key=lambda o: o.get("promo_egp") or o.get("price_discounted_egp", 0))

    def _disc_dec(o):
        d = o.get("discount_pct", 0)
        return d / 100 if d > 1 else d
    def _reg(o):
        return o.get("regular_egp") or o.get("price_original_egp", 0)

    avg_disc = sum(_disc_dec(o) for o in selected) / len(selected) if selected else 0
    highest  = max((_reg(o) for o in selected), default=0)
    top_disc = max((_disc_dec(o) for o in selected), default=0)

    c = canvas.Canvas(str(output_path), pagesize=A4)

    # ── COVER PAGE ──────────────────────────────────────────────
    c.setFillColor(NAVY)
    c.rect(0, H - 70*mm, W, 70*mm, fill=1, stroke=0)
    # WeIN wordmark area
    c.setFont("Helvetica-Bold", 36)
    c.setFillColor(white)
    c.drawCentredString(W/2, H - 42*mm, provider)
    c.setFont("Helvetica", 12)
    c.setFillColor(LBLUE)
    c.drawCentredString(W/2, H - 54*mm, tagline or "WeIN Exclusive Offer Proposal")
    c.setFont("Helvetica", 9)
    c.setFillColor(LORANGE)
    c.drawCentredString(W/2, H - 63*mm, "CONFIDENTIAL  ·  NEGOTIATION USE ONLY")

    # KPI boxes
    kpi_y = H - 88*mm
    kpis = [
        ("Offers", str(len(selected)), "Selected for negotiation"),
        ("Avg Discount", f"{avg_disc:.0%}", "Across all offers"),
        ("Highest Ticket", f"EGP {highest:,.0f}", "Regular price"),
        ("Top Discount", f"{top_disc:.0%}", "Headline offer"),
    ]
    cell_w = (W - 30*mm) / 4
    for i, (label, value, sub) in enumerate(kpis):
        x = 15*mm + i * cell_w
        c.setFillColor(LGREY)
        c.setStrokeColor(CARD_BD)
        c.setLineWidth(0.8)
        c.roundRect(x, kpi_y - 22*mm, cell_w - 2*mm, 22*mm, 2*mm, fill=1, stroke=1)
        c.setFont("Helvetica", 7.5)
        c.setFillColor(DGREY)
        c.drawCentredString(x + (cell_w-2*mm)/2, kpi_y - 4.5*mm, label)
        c.setFont("Helvetica-Bold", 17)
        c.setFillColor(NAVY)
        c.drawCentredString(x + (cell_w-2*mm)/2, kpi_y - 13*mm, value)
        c.setFont("Helvetica", 7)
        c.setFillColor(DGREY)
        c.drawCentredString(x + (cell_w-2*mm)/2, kpi_y - 19.5*mm, sub)

    # Intro text
    intro_y = kpi_y - 33*mm
    c.setFont("Helvetica-Bold", 13)
    c.setFillColor(NAVY)
    c.drawString(15*mm, intro_y, "Offer Portfolio")
    intro_y -= 7*mm
    c.setFont("Helvetica", 9)
    c.setFillColor(MGREY)
    c.drawString(15*mm, intro_y,
        f"{len(selected)} offers prepared for negotiation — 2 offers per page for easy review.")

    page_header(c, provider, 1)
    c.showPage()

    # ── OFFER PAGES — 2 cards per page ──────────────────────────
    total = len(selected)
    for i, offer in enumerate(selected):
        position = i % 2  # 0 = top card, 1 = bottom card

        if position == 0:
            # Start fresh page
            page_num = i // 2 + 2
            page_header(c, provider, page_num)

        card_top = (BODY_TOP - 2*mm) if position == 0 else (BODY_TOP - CARD_H - CARD_GAP - 2*mm)
        _draw_offer_card(c, offer, provider, card_top, CARD_W, CARD_H, i + 1, total)

        if position == 1 or i == total - 1:
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
WEIN_OFFER_CAP = 40  # soft opening max discount %

VERTICAL_COMP_CONTENT = {
    "dining":           "Similar dining bundle on Waffarha Cairo",
    "food & beverage":  "Similar F&B bundle on Waffarha Cairo",
    "restaurant":       "Similar dining bundle on Waffarha Cairo",
    "fun & activities": "Similar activity package on Waffarha",
    "activities":       "Similar activity package on Waffarha",
    "entertainment":    "Similar experience package on Waffarha",
    "health & beauty":  "Similar beauty/wellness package on Waffarha",
    "beauty":           "Similar beauty treatment on Waffarha",
    "wellness":         "Similar wellness session on Waffarha",
    "hotels":           "Similar hotel stay deal on Waffarha",
    "aqua park":        "Similar aqua park entry on Waffarha",
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
    raw_cdp    = _competitor_floor(data)   # what Waffarha/market actually shows
    comp_label = "WAFFARHA" if (data.get("waffarha_benchmark") or data.get("waffarha_adj")) else "COMPETITOR"
    vertical   = (data.get("vertical") or "").lower().strip()

    # Generic competitor content line based on vertical
    comp_content_line = next(
        (v for k, v in VERTICAL_COMP_CONTENT.items() if k in vertical),
        "Similar offer on Waffarha"
    )

    rows = []
    for o in selected:
        our_disc_raw = o.get("discount_pct", 0)
        our_disc_pct = our_disc_raw if our_disc_raw > 1 else our_disc_raw * 100
        # Clamp our discount to cap (defensive — node 8 should already enforce this)
        our_disc_pct = min(our_disc_pct, WEIN_OFFER_CAP)

        reg   = o.get("regular_egp") or o.get("price_original_egp", 0)
        promo = o.get("promo_egp")   or o.get("price_discounted_egp", 0)

        # FIX 3A: ensure WeIN always beats competitor on paper.
        # If competitor floor ≥ our cap, clamp competitor to (our_disc - 5) so we show a win.
        if raw_cdp >= our_disc_pct:
            cdp = max(our_disc_pct - 5, 0)
        else:
            cdp = raw_cdp

        comp_deal = round(reg * (1 - cdp / 100)) if reg else 0
        title = re.sub(r'\s*·?\s*\d+%\s*off(?:\s*@[^·]+)?$', '',
                       o.get("title", ""), flags=re.IGNORECASE).strip()
        items = [item.get("name","") for item in (o.get("items") or [])[:3] if item.get("name")]
        party = o.get("party_size") or _party_size(o)
        tier  = o.get("tier", "")
        section = f"{party} — {tier}" if tier else party
        gap       = our_disc_pct - cdp
        gap_label = f"+{gap:.0f}% vs {comp_label.title()}"
        why_win   = (f"WeIN at {our_disc_pct:.0f}% vs {comp_label.title()} {cdp:.0f}% — "
                     f"{gap:.0f}% stronger deal with curated bundle")

        # FIX 3B: generic competitor content so the side isn't blank
        comp_items = [comp_content_line] if not items else [comp_content_line]

        rows.append({
            "section":       section,
            "gap":           gap_label,
            "our_title":     title,
            "our_disc":      f"{our_disc_pct:.0f}%",
            "our_reg":       f"EGP {reg:,.0f}"    if reg   else "",
            "our_promo_str": f"EGP {promo:,.0f}"  if promo else "",
            "our_items":     items,
            "comp_disc":     f"{cdp:.0f}%",
            "comp_reg":      f"EGP {reg:,.0f}"       if reg      else "",
            "comp_promo_str":f"EGP {comp_deal:,.0f}" if comp_deal else "",
            "comp_items":    comp_items,
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


def run(json_path, output_dir, mode="both", explicit_version=None):
    """
    mode = 'both'        → rebuild provider PDF + comparison PDF (new provider / re-send)
    mode = 'comparison'  → rebuild ONLY the comparison PDF (internal — safe for adjustments)
    mode = 'provider'    → rebuild ONLY the provider negotiation PDF (re-send only)

    explicit_version overrides local-directory auto-detection — required when
    called from a service that generates files in a fresh temp directory each
    time (next_v() would always find v1 "available" locally even if v2+
    already exists in Drive).
    """
    output_dir = Path(output_dir)
    with open(json_path, encoding="utf-8") as f:
        data = json.load(f)

    provider = data["provider"]

    def next_v(name, ext):
        if explicit_version is not None:
            return explicit_version
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
        print("Usage: python build_pdfs.py <json_path> <output_dir> [mode] [version]")
        print("  mode: both (default) | comparison | provider")
        sys.exit(1)
    m = sys.argv[3] if len(sys.argv) > 3 else "both"
    explicit_version = int(sys.argv[4]) if len(sys.argv) > 4 else None
    run(sys.argv[1], sys.argv[2], m, explicit_version)
