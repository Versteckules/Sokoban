import os
import math
from PIL import Image, ImageOps, ImageFilter, ImageEnhance

brain_dir = r"C:\Users\flaem\.gemini\antigravity-ide\brain\60d20dfa-5638-4172-aaca-08989c4f137a"
assets_dir = r"c:\Users\flaem\Desktop\Antigravity\Sokoban\assets"
os.makedirs(assets_dir, exist_ok=True)

# 1. PROCESS THE 5 GENERATED CRATES INTO TRANSPARENT PNGs
crate_sources = [
    (os.path.join(brain_dir, "crate_wood_1791838108888.jpg"), "crate_tier1.png"),
    (os.path.join(brain_dir, "crate_sandstone_1791838124812.jpg"), "crate_tier2.png"),
    (os.path.join(brain_dir, "crate_crystal_1791838142584.jpg"), "crate_tier3.png"),
    (os.path.join(brain_dir, "crate_iron_1791838162047.jpg"), "crate_tier4.png"),
    (os.path.join(brain_dir, "crate_obsidian_1791838179056.jpg"), "crate_tier5.png")
]

for src_path, out_name in crate_sources:
    if not os.path.exists(src_path):
        print(f"Warning: {src_path} not found!")
        continue
    
    img = Image.open(src_path).convert("RGBA")
    w, h = img.size
    
    # Threshold out dark background with smooth alpha
    data = img.getdata()
    new_data = []
    
    # We want to remove the black background smoothly
    for item in data:
        r, g, b, _ = item
        brightness = (r * 299 + g * 587 + b * 114) / 1000
        max_c = max(r, g, b)
        
        if max_c < 18:
            new_data.append((0, 0, 0, 0))
        elif max_c < 35:
            # Smooth blend
            alpha = int((max_c - 18) / 17 * 255)
            new_data.append((r, g, b, alpha))
        else:
            new_data.append((r, g, b, 255))
            
    img.putdata(new_data)
    
    # Crop to bounding box
    bbox = img.getbbox()
    if bbox:
        cropped = img.crop(bbox)
    else:
        cropped = img
        
    # Resize to standard high-res square 256x256
    # Pad to square to avoid distortion
    cw, ch = cropped.size
    max_dim = max(cw, ch)
    square_img = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
    square_img.paste(cropped, ((max_dim - cw) // 2, (max_dim - ch) // 2))
    
    final_crate = square_img.resize((256, 256), Image.Resampling.LANCZOS)
    out_path = os.path.join(assets_dir, out_name)
    final_crate.save(out_path, "PNG")
    print(f"Saved: {out_name} ({os.path.getsize(out_path)} bytes)")

# 2. CREATE TIER WALL TEXTURES
base_wall_path = os.path.join(assets_dir, "wall.jpg")
if not os.path.exists(base_wall_path):
    base_wall_path = os.path.join(brain_dir, "wall_tile_1791835801359.jpg")

base_wall = Image.open(base_wall_path).convert("RGB").resize((256, 256), Image.Resampling.LANCZOS)

# Color tinting function
def create_tinted_wall(base_img, r_mult, g_mult, b_mult, contrast=1.2, brightness=1.0):
    enh_c = ImageEnhance.Contrast(base_img).enhance(contrast)
    enh_b = ImageEnhance.Brightness(enh_c).enhance(brightness)
    
    pixels = enh_b.load()
    w, h = enh_b.size
    for y in range(h):
        for x in range(w):
            r, g, b = pixels[x, y]
            nr = min(255, int(r * r_mult))
            ng = min(255, int(g * g_mult))
            nb = min(255, int(b * b_mult))
            pixels[x, y] = (nr, ng, nb)
    return enh_b

# Tier 1: Overgrown Mossy Jungle Stone (Rich green moss in cracks)
t1_wall = create_tinted_wall(base_wall, 0.7, 1.15, 0.75, contrast=1.3, brightness=0.95)
# Add moss accents along bottom & edges
pixels_t1 = t1_wall.load()
for y in range(256):
    for x in range(256):
        if (x * 7 + y * 13) % 23 < 8:
            r, g, b = pixels_t1[x, y]
            pixels_t1[x, y] = (min(255, int(r * 0.7)), min(255, int(g * 1.35 + 20)), min(255, int(b * 0.6)))
t1_wall.save(os.path.join(assets_dir, "wall_tier1.jpg"), quality=92)

# Tier 2: Desert Sandstone (Warm sun-baked ochre / gold)
t2_wall = create_tinted_wall(base_wall, 1.35, 1.05, 0.65, contrast=1.25, brightness=1.1)
t2_wall.save(os.path.join(assets_dir, "wall_tier2.jpg"), quality=92)

# Tier 3: Dark Slate & Glowing Amethyst (Deep violet / indigo slate)
t3_wall = create_tinted_wall(base_wall, 0.9, 0.7, 1.3, contrast=1.35, brightness=0.85)
# Add sparkling crystal clusters
pixels_t3 = t3_wall.load()
for y in range(256):
    for x in range(256):
        if (x * 19 + y * 29) % 47 == 0:
            for dx in range(-2, 3):
                for dy in range(-2, 3):
                    nx, ny = (x + dx) % 256, (y + dy) % 256
                    pixels_t3[nx, ny] = (192, 132, 252)
t3_wall.save(os.path.join(assets_dir, "wall_tier3.jpg"), quality=92)

# Tier 4: Forged Iron & Steel Plates (Dark industrial metallic with blue steel sheen)
t4_wall = create_tinted_wall(base_wall, 0.75, 0.85, 1.0, contrast=1.5, brightness=0.8)
# Add iron plate border lines & corner rivets
pixels_t4 = t4_wall.load()
for i in range(256):
    pixels_t4[i, 4] = (148, 163, 184)
    pixels_t4[i, 251] = (30, 41, 59)
    pixels_t4[4, i] = (148, 163, 184)
    pixels_t4[251, i] = (30, 41, 59)
t4_wall.save(os.path.join(assets_dir, "wall_tier4.jpg"), quality=92)

# Tier 5: Black Obsidian & Molten Magma (Glossy pitch black rock with glowing lava veins)
t5_wall = create_tinted_wall(base_wall, 0.35, 0.3, 0.35, contrast=1.8, brightness=0.5)
# Draw glowing magma veins
pixels_t5 = t5_wall.load()
for i in range(256):
    # Main diagonal crack
    cy = int(i * 0.8 + 25 * math.sin(i * 0.05))
    if 0 <= cy < 256:
        for offset in [-2, -1, 0, 1, 2]:
            ny = cy + offset
            if 0 <= ny < 256:
                if offset == 0:
                    pixels_t5[i, ny] = (255, 240, 150) # Bright yellow core
                elif abs(offset) == 1:
                    pixels_t5[i, ny] = (255, 120, 20)  # Orange flame
                else:
                    pixels_t5[i, ny] = (220, 40, 10)   # Red glow
t5_wall.save(os.path.join(assets_dir, "wall_tier5.jpg"), quality=92)

print("Created all 5 tier wall textures!")

# 3. CREATE TIER FLOOR TEXTURES
base_floor_path = os.path.join(assets_dir, "floor.jpg")
if not os.path.exists(base_floor_path):
    base_floor_path = os.path.join(brain_dir, "floor_tile_1791835870343.jpg")

base_floor = Image.open(base_floor_path).convert("RGB").resize((256, 256), Image.Resampling.LANCZOS)

t1_floor = create_tinted_wall(base_floor, 0.75, 1.1, 0.8, contrast=1.2, brightness=0.85)
t1_floor.save(os.path.join(assets_dir, "floor_tier1.jpg"), quality=92)

t2_floor = create_tinted_wall(base_floor, 1.3, 1.05, 0.7, contrast=1.15, brightness=0.95)
t2_floor.save(os.path.join(assets_dir, "floor_tier2.jpg"), quality=92)

t3_floor = create_tinted_wall(base_floor, 0.85, 0.75, 1.25, contrast=1.25, brightness=0.8)
t3_floor.save(os.path.join(assets_dir, "floor_tier3.jpg"), quality=92)

t4_floor = create_tinted_wall(base_floor, 0.8, 0.85, 0.95, contrast=1.35, brightness=0.75)
t4_floor.save(os.path.join(assets_dir, "floor_tier4.jpg"), quality=92)

t5_floor = create_tinted_wall(base_floor, 0.45, 0.35, 0.35, contrast=1.6, brightness=0.6)
# Lava seams
pixels_f5 = t5_floor.load()
for i in range(256):
    pixels_f5[i, 0] = (255, 90, 20)
    pixels_f5[i, 255] = (255, 90, 20)
    pixels_f5[0, i] = (255, 90, 20)
    pixels_f5[255, i] = (255, 90, 20)
t5_floor.save(os.path.join(assets_dir, "floor_tier5.jpg"), quality=92)

print("Created all 5 tier floor textures!")

# 4. CREATE 5 CINEMATIC ATMOSPHERIC CHAMBER BACKGROUNDS (1280x720)
def generate_chamber_bg(color_theme, accent_color, particles="stars"):
    w, h = 1280, 720
    bg = Image.new("RGB", (w, h), (10, 9, 14))
    pixels = bg.load()
    
    cx, cy = w // 2, int(h * 0.4)
    max_dist = math.hypot(w // 2, h // 2)
    
    r_t, g_t, b_t = color_theme
    r_a, g_a, b_a = accent_color
    
    for y in range(h):
        for x in range(w):
            # Radial distance from chamber center
            dist = math.hypot(x - cx, y - cy)
            norm_dist = min(1.0, dist / max_dist)
            
            # Central atmospheric glow
            glow = math.exp(-dist / 380.0)
            
            # Vertical depth gradient
            v_factor = 1.0 - (y / h) * 0.45
            
            r = int((r_t * glow + r_a * (1 - norm_dist) * 0.3) * v_factor + 8)
            g = int((g_t * glow + g_a * (1 - norm_dist) * 0.3) * v_factor + 7)
            b = int((b_t * glow + b_a * (1 - norm_dist) * 0.3) * v_factor + 12)
            
            # Dark outer vignette
            vignette = 1.0 - 0.65 * (norm_dist ** 2)
            r = max(0, min(255, int(r * vignette)))
            g = max(0, min(255, int(g * vignette)))
            b = max(0, min(255, int(b * vignette)))
            
            pixels[x, y] = (r, g, b)
            
    # Add subtle atmospheric stone pillar silhouettes on left and right
    for x in range(w):
        # Pillars at 0..180 and 1100..1280
        if x < 160 or x > 1120:
            pillar_alpha = 0.55
            for y in range(h):
                pr, pg, pb = pixels[x, y]
                pixels[x, y] = (int(pr * pillar_alpha), int(pg * pillar_alpha), int(pb * pillar_alpha))
                
    # Add subtle blur
    bg = bg.filter(ImageFilter.GaussianBlur(1.5))
    return bg

bg1 = generate_chamber_bg((20, 110, 60), (34, 197, 94))   # Jungle Temple
bg2 = generate_chamber_bg((140, 90, 20), (251, 191, 36))  # Desert Pyramid
bg3 = generate_chamber_bg((90, 40, 140), (192, 132, 252)) # Amethyst Cavern
bg4 = generate_chamber_bg((120, 40, 30), (239, 68, 68))   # Iron Forge
bg5 = generate_chamber_bg((180, 40, 15), (255, 140, 0))   # Obsidian Magma Apex

bg1.save(os.path.join(assets_dir, "bg_tier1.jpg"), quality=90)
bg2.save(os.path.join(assets_dir, "bg_tier2.jpg"), quality=90)
bg3.save(os.path.join(assets_dir, "bg_tier3.jpg"), quality=90)
bg4.save(os.path.join(assets_dir, "bg_tier4.jpg"), quality=90)
bg5.save(os.path.join(assets_dir, "bg_tier5.jpg"), quality=90)

print("Created all 5 tier cinematic chamber backgrounds!")
print("ALL NEXT-LEVEL ASSETS READY!")
