import os
import json
import glob

base_dir = r"c:\code\c2026-02-08-VungTau"
output_file = os.path.join(base_dir, "tide-app", "src", "data", "tide_data.json")

def parse_time(t):
    if not t or t == '-' or t == '':
        return None
    return t

def parse_val(v):
    if not v or v == '-' or v == '':
        return None
    try:
        return float(v)
    except:
        return None

# Find the file using glob
files = glob.glob(os.path.join(base_dir, "*.md"))
input_file = [f for f in files if "th" in f.lower() or "d" in f.lower()][0]
print(f"Found input file: {input_file}")

with open(input_file, 'r', encoding='utf-8') as f:
    lines = [l.strip() for l in f.readlines() if l.strip()]

result = []
current_month = 0

for line in lines:
    if line.startswith('Ngày,0h'):
        current_month += 1
        continue
    if line.startswith('Tháng,Ngày'):
        continue

    parts = line.split(',')
    if len(parts) < 32:
        continue
    
    is_explicit = False
    month = current_month
    day_idx = 0

    if len(parts) >= 34:
        try:
            month = int(parts[0])
            day_idx = 1
            current_month = month
        except:
            pass
    
    try:
        day = int(parts[day_idx])
    except:
        continue
        
    hours = []
    h_idx = day_idx + 1
    for h in range(24):
        try:
            hours.append(float(parts[h_idx]))
        except:
            hours.append(0.0)
        h_idx += 1
    
    max1_time = parse_time(parts[h_idx]) if h_idx < len(parts) else None
    h_idx += 1
    max1_val = parse_val(parts[h_idx]) if h_idx < len(parts) else None
    h_idx += 1
    max2_time = parse_time(parts[h_idx]) if h_idx < len(parts) else None
    h_idx += 1
    max2_val = parse_val(parts[h_idx]) if h_idx < len(parts) else None
    h_idx += 1
    min1_time = parse_time(parts[h_idx]) if h_idx < len(parts) else None
    h_idx += 1
    min1_val = parse_val(parts[h_idx]) if h_idx < len(parts) else None
    h_idx += 1
    min2_time = parse_time(parts[h_idx]) if h_idx < len(parts) else None
    h_idx += 1
    min2_val = parse_val(parts[h_idx]) if h_idx < len(parts) else None
    
    date_str = f"2026-{month:02d}-{day:02d}"
    
    high_tides = []
    if max1_time: high_tides.append({"time": max1_time, "height": max1_val})
    if max2_time: high_tides.append({"time": max2_time, "height": max2_val})
        
    low_tides = []
    if min1_time: low_tides.append({"time": min1_time, "height": min1_val})
    if min2_time: low_tides.append({"time": min2_time, "height": min2_val})

    result.append({
        "date": date_str,
        "month": month,
        "day": day,
        "hours": hours,
        "highTides": high_tides,
        "lowTides": low_tides
    })

os.makedirs(os.path.dirname(output_file), exist_ok=True)
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print(f"Successfully wrote {len(result)} records to {output_file}")
