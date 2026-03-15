import json
import math
import os
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path.cwd()
IMAGE_DIR = ROOT / "public" / "product-images"
AUDIT_PATH = ROOT / "tmp" / "product-image-audit.json"
OUTPUT_DIR = ROOT / "tmp" / "image-review"
FONT_PATH = Path(os.environ.get("IMAGE_REVIEW_FONT", r"C:\WINDOWS\Fonts\arial.ttf"))

THUMB_SIZE = (220, 220)
LABEL_HEIGHT = 64
PADDING = 18
COLUMNS = 4


def load_font(size: int):
    try:
        return ImageFont.truetype(str(FONT_PATH), size)
    except Exception:
        return ImageFont.load_default()


TITLE_FONT = load_font(26)
LABEL_FONT = load_font(16)
META_FONT = load_font(15)


def wrap_text(text: str, width: int = 24):
    return "\n".join(textwrap.wrap(text, width=width)[:3])


def paste_card(canvas: Image.Image, image_path: Path, label: str, x: int, y: int):
    draw = ImageDraw.Draw(canvas)
    card_width = THUMB_SIZE[0]
    card_height = THUMB_SIZE[1] + LABEL_HEIGHT

    draw.rounded_rectangle(
        (x, y, x + card_width, y + card_height),
        radius=12,
        fill="white",
        outline="#d5d5d5",
        width=1,
    )

    try:
        image = Image.open(image_path).convert("RGB")
        thumb = ImageOps.contain(image, THUMB_SIZE)
        image_box = Image.new("RGB", THUMB_SIZE, "white")
        offset = ((THUMB_SIZE[0] - thumb.width) // 2, (THUMB_SIZE[1] - thumb.height) // 2)
        image_box.paste(thumb, offset)
    except Exception:
        image_box = Image.new("RGB", THUMB_SIZE, "#f4d4d4")
        fallback = ImageDraw.Draw(image_box)
        fallback.text((12, 12), "Failed to load", fill="black", font=LABEL_FONT)

    canvas.paste(image_box, (x, y))
    draw.multiline_text((x + 10, y + THUMB_SIZE[1] + 8), wrap_text(label), font=LABEL_FONT, fill="#111111", spacing=2)


def make_sheet(title: str, subtitle: str, files: list[str], output_path: Path):
    rows = max(1, math.ceil(len(files) / COLUMNS))
    header_height = 88
    width = PADDING + COLUMNS * (THUMB_SIZE[0] + PADDING)
    height = header_height + PADDING + rows * (THUMB_SIZE[1] + LABEL_HEIGHT + PADDING)
    canvas = Image.new("RGB", (width, height), "#f3f1ec")
    draw = ImageDraw.Draw(canvas)

    draw.text((PADDING, 16), title, fill="#111111", font=TITLE_FONT)
    draw.text((PADDING, 50), subtitle, fill="#555555", font=META_FONT)

    for index, file_name in enumerate(files):
        row = index // COLUMNS
        col = index % COLUMNS
        x = PADDING + col * (THUMB_SIZE[0] + PADDING)
        y = header_height + row * (THUMB_SIZE[1] + LABEL_HEIGHT + PADDING)
        paste_card(canvas, IMAGE_DIR / file_name, file_name, x, y)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output_path, quality=92)


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    audit = json.loads(AUDIT_PATH.read_text(encoding="utf-8"))

    manifest = {"broken": [], "groups": []}

    broken_files = [item["file"] for item in audit.get("broken", [])]
    if broken_files:
        broken_output = OUTPUT_DIR / "broken-files.jpg"
        make_sheet(
            "Broken Images",
            f"{len(broken_files)} files flagged as blank/loading-like",
            broken_files,
            broken_output,
        )
        manifest["broken"].append(str(broken_output))

    for index, group in enumerate(audit.get("suspiciousDuplicates", [])[:12], start=1):
        files = group.get("files", [])[:12]
        categories = ", ".join(group.get("categories", [])[:6])
        output_path = OUTPUT_DIR / f"group-{index:02d}.jpg"
        make_sheet(
            f"Duplicate Group {index}",
            f"{group.get('count', 0)} files | {categories}",
            files,
            output_path,
        )
        manifest["groups"].append(
            {
                "index": index,
                "path": str(output_path),
                "count": group.get("count", 0),
                "categories": group.get("categories", []),
                "files": files,
            }
        )

    (OUTPUT_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(json.dumps({"outputDir": str(OUTPUT_DIR), "manifest": str(OUTPUT_DIR / "manifest.json")}, indent=2))


if __name__ == "__main__":
    main()
