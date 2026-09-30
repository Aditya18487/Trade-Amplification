import fitz
import os

pdf_path = r'C:/Users/shubh/.gemini/antigravity/brain/0ee721fe-074f-4233-8940-f00f612a8b0c/.user_uploaded/media_1790189124096.pdf'
out_dir = r'c:/Users/shubh/Desktop/INTERNSHIP 2/Trade_Amplification/uploads/case_studies'
os.makedirs(out_dir, exist_ok=True)

doc = fitz.open(pdf_path)
print("Total pages:", len(doc))

# Page to project mapping:
# Page 11: Project 10 Workforce Operation TMS
# Page 13: Project 08 Talipam Trade
# Page 15: Project 13 Web3 NFT Marketplace with Staking & Rewards
# Page 17: Project 12 Delta Exchange Options Platform
# Page 19: Project 11 AI Customer Support Agent
# Page 21: Project 07 Botlok (placeholder)
# Page 23: Project 03 Elastic Grid Trading Dashboard
# Page 25: Project 06 Confederation
# Page 27: Project 09 Supermarket Inventory & POS System
# Page 29: Project 01 Telegram Copier Algo Trading Bot
# Page 31: Project 02 Lorentzian Classification Algo Software
# Page 33: Project 04 TradingView to MT5 Automation System
# Page 35: Project 05 MT5 Expert Advisor — Trend Following

visual_pages = {
    11: "workforce-operation-tms",
    13: "talipam-trade",
    15: "web3-nft-marketplace",
    17: "delta-exchange-options",
    19: "ai-customer-support-agent",
    21: "botlok",
    23: "elastic-grid-trading-dashboard",
    25: "confederation",
    27: "supermarket-inventory-pos",
    29: "telegram-copier-algo-bot",
    31: "lorentzian-classification-algo",
    33: "tradingview-to-mt5-automation",
    35: "mt5-trend-following-ea"
}

for page_num, proj_slug in visual_pages.items():
    page = doc[page_num - 1] # 0-indexed
    images = page.get_images()
    print(f"\nPage {page_num} ({proj_slug}): found {len(images)} images")
    
    # Also render full page at high resolution so we have perfect fallbacks/crops
    pix = page.get_pixmap(dpi=150)
    page_img_path = os.path.join(out_dir, f"page_{page_num}_{proj_slug}.png")
    pix.save(page_img_path)
    print(f"  Rendered page to {page_img_path}")
    
    # Extract biggest image on page (the screenshot)
    biggest_img = None
    biggest_size = 0
    for img in images:
        xref = img[0]
        base_image = doc.extract_image(xref)
        w = base_image["width"]
        h = base_image["height"]
        area = w * h
        print(f"  xref {xref}: {base_image['ext']}, {w}x{h}")
        # Exclude tiny icons or logos (< 100x100)
        if area > biggest_size and w > 200 and h > 150:
            biggest_size = area
            biggest_img = (xref, base_image)
            
    if biggest_img:
        xref, base_image = biggest_img
        ext = base_image["ext"]
        img_bytes = base_image["image"]
        save_path = os.path.join(out_dir, f"{proj_slug}.{ext}")
        with open(save_path, "wb") as f:
            f.write(img_bytes)
        print(f"  -> Extracted main screenshot to {save_path} ({base_image['width']}x{base_image['height']})")
    else:
        print(f"  -> No large embedded image found on page {page_num}")
