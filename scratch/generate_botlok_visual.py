from PIL import Image, ImageDraw, ImageFont
import os

width = 1280
height = 680
img = Image.new('RGB', (width, height), color=(10, 15, 29))
draw = ImageDraw.Draw(img)

# Background subtle grid pattern
for x in range(0, width, 40):
    draw.line([(x, 0), (x, height)], fill=(16, 24, 45), width=1)
for y in range(0, height, 40):
    draw.line([(0, y), (width, y)], fill=(16, 24, 45), width=1)

# Card container
card_rect = [60, 50, width - 60, height - 50]
draw.rounded_rectangle(card_rect, radius=16, fill=(13, 19, 36), outline=(16, 185, 129), width=2)

# Top Header Bar
draw.rounded_rectangle([60, 50, width - 60, 120], radius=16, fill=(18, 27, 49))
# Window buttons
draw.ellipse([85, 78, 101, 94], fill=(239, 68, 68))
draw.ellipse([110, 78, 126, 94], fill=(234, 179, 8))
draw.ellipse([135, 78, 151, 94], fill=(34, 197, 94))

# Title
try:
    font_bold = ImageFont.truetype("arial.ttf", 22)
    font_sub = ImageFont.truetype("arial.ttf", 15)
    font_code = ImageFont.truetype("consola.ttf", 14)
    font_code_bold = ImageFont.truetype("consola.ttf", 15)
except:
    font_bold = ImageFont.load_default()
    font_sub = font_bold
    font_code = font_bold
    font_code_bold = font_bold

draw.text((180, 74), "BOTLOK // MT5 SOFTWARE EVIDENCE AUDIT & TRACING ENGINE", fill=(255, 255, 255), font=font_bold)
draw.text((950, 76), "STATUS: ACTIVE • VERIFIED", fill=(16, 185, 129), font=font_sub)

# Telemetry stats row
stats = [
    ("TOTAL SIGNALS LOGGED", "148,920"),
    ("VERIFICATION RATE", "100.00%"),
    ("AVG AUDIT LATENCY", "< 1.2ms"),
    ("TAMPER CHECKSUMS", "ZERO DRIFT")
]
stat_w = 270
for i, (title, val) in enumerate(stats):
    sx = 85 + i * (stat_w + 15)
    sy = 145
    draw.rounded_rectangle([sx, sy, sx + stat_w, sy + 75], radius=10, fill=(20, 30, 55), outline=(30, 45, 80), width=1)
    draw.text((sx + 16, sy + 14), title, fill=(148, 163, 184), font=font_sub)
    draw.text((sx + 16, sy + 38), val, fill=(16, 185, 129) if "ZERO" in val or "100" in val or "<" in val else (255, 255, 255), font=font_bold)

# Log Table
table_y = 250
draw.rounded_rectangle([85, table_y, width - 85, height - 80], radius=10, fill=(9, 14, 26), outline=(26, 38, 66), width=1)

# Table Header
headers = [
    ("SIGNAL ID", 110),
    ("TIMESTAMP", 230),
    ("SYMBOL", 360),
    ("ACTION", 460),
    ("RECEIPT HASH", 560),
    ("MT5 EXECUTION HASH", 800),
    ("AUDIT STATUS", 1040)
]
draw.line([(85, table_y + 40), (width - 85, table_y + 40)], fill=(30, 45, 80), width=1)
for h_text, hx in headers:
    draw.text((hx, table_y + 12), h_text, fill=(148, 163, 184), font=font_code_bold)

rows = [
    ("SIG-94021", "2026-09-24 00:14:02.104", "XAUUSD", "BUY 0.50", "0x8f2a419c8821", "0xe41b8992a015 [MT5 #849102]", "VERIFIED [1.1ms]"),
    ("SIG-94022", "2026-09-24 00:15:45.892", "EURUSD", "SELL 1.00", "0x3d11b94c01f2", "0x90ca5521e812 [MT5 #849103]", "VERIFIED [0.9ms]"),
    ("SIG-94023", "2026-09-24 00:17:12.331", "GBPUSD", "BUY 0.25", "0x5a77cc91e034", "SUPPRESSED [RISK THRESHOLD]", "FLAGGED & BLOCKED"),
    ("SIG-94024", "2026-09-24 00:19:00.015", "BTCUSD", "BUY 0.10", "0x2e90aa41d671", "0x77aa9812cc09 [MT5 #849104]", "VERIFIED [1.4ms]"),
    ("SIG-94025", "2026-09-24 00:22:33.419", "USDJPY", "SELL 0.80", "0x91df4482ba30", "0x66be110299aa [MT5 #849105]", "VERIFIED [0.8ms]"),
    ("SIG-94026", "2026-09-24 00:24:59.721", "XAUUSD", "SELL 0.50", "0xaa8123dd6701", "0x12bb5644fe90 [MT5 #849106]", "VERIFIED [1.2ms]"),
]

for idx, row in enumerate(rows):
    ry = table_y + 55 + idx * 45
    bg_color = (13, 20, 36) if idx % 2 == 0 else (9, 14, 26)
    draw.rectangle([86, ry - 6, width - 86, ry + 32], fill=bg_color)
    
    is_blocked = "FLAGGED" in row[6]
    status_color = (239, 68, 68) if is_blocked else (16, 185, 129)
    action_color = (34, 197, 94) if "BUY" in row[3] else (239, 68, 68)
    
    draw.text((headers[0][1], ry), row[0], fill=(203, 213, 225), font=font_code)
    draw.text((headers[1][1], ry), row[1], fill=(148, 163, 184), font=font_code)
    draw.text((headers[2][1], ry), row[2], fill=(255, 255, 255), font=font_code_bold)
    draw.text((headers[3][1], ry), row[3], fill=action_color, font=font_code_bold)
    draw.text((headers[4][1], ry), row[4], fill=(100, 116, 139), font=font_code)
    draw.text((headers[5][1], ry), row[5], fill=(203, 213, 225), font=font_code)
    draw.text((headers[6][1], ry), row[6], fill=status_color, font=font_code_bold)

out_file = r'c:/Users/shubh/Desktop/INTERNSHIP 2/Trade_Amplification/assets/case-studies/botlok.png'
img.save(out_file)
print("Saved Botlok screenshot to", out_file)
