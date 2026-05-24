#!/usr/bin/env python3
"""Convert an image into a hex-color-matrix JSON file.

This script is intentionally simple:
- every output cell is one pixel in the matrix
- resizing uses nearest-neighbor, so colors stay exact
- transparent pixels become null by default

Output schema:
{
  "kind": "hex-color-matrix",
  "version": 1,
  "width": 32,
  "height": 32,
  "pixels": [["#112233", null, ...], ...],
  "palette": [{"hex": "#112233", "count": 18}, ...],
  "source": {...}
}
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path
from typing import Optional


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert an image to a hex-color-matrix JSON file.",
    )
    parser.add_argument("input", help="Input image path.")
    parser.add_argument(
        "-o",
        "--output",
        help="Output JSON path. Defaults to <input>.hex-matrix.json",
    )
    parser.add_argument(
        "--width",
        type=int,
        help="Target matrix width. If omitted, use the source width.",
    )
    parser.add_argument(
        "--height",
        type=int,
        help="Target matrix height. If omitted, use the source height.",
    )
    parser.add_argument(
        "--alpha-threshold",
        type=int,
        default=1,
        help="Alpha below this value becomes null. Default: 1",
    )
    parser.add_argument(
        "--keep-transparent-as",
        choices=["null", "hex"],
        default="null",
        help="Whether transparent pixels become null or keep their RGB hex. Default: null",
    )
    return parser.parse_args()


def require_pillow():
    try:
        from PIL import Image  # type: ignore
    except Exception:
        print(
            "This script requires Pillow. Install it with: python3 -m pip install Pillow",
            file=sys.stderr,
        )
        raise SystemExit(1)
    return Image


def rgba_to_hex(rgba: tuple[int, int, int, int], alpha_threshold: int, transparent_mode: str) -> Optional[str]:
    red, green, blue, alpha = rgba
    if alpha < alpha_threshold and transparent_mode == "null":
        return None
    return f"#{red:02x}{green:02x}{blue:02x}"


def get_nearest_resampling(Image):
    resampling = getattr(Image, "Resampling", Image)
    return resampling.NEAREST


def main() -> int:
    args = parse_args()
    image_path = Path(args.input)
    if not image_path.is_file():
        print(f"Input image not found: {image_path}", file=sys.stderr)
        return 1
    if not 0 <= args.alpha_threshold <= 255:
        print("Alpha threshold must be between 0 and 255.", file=sys.stderr)
        return 1

    Image = require_pillow()
    with Image.open(image_path) as source_image:
        image = source_image.convert("RGBA")
    original_width = image.width
    original_height = image.height

    target_width = args.width or image.width
    target_height = args.height or image.height
    if target_width <= 0 or target_height <= 0:
        print("Width and height must be positive integers.", file=sys.stderr)
        return 1

    if target_width != image.width or target_height != image.height:
        image = image.resize((target_width, target_height), get_nearest_resampling(Image))

    pixels: list[list[Optional[str]]] = []
    palette_counter: Counter[str] = Counter()

    for row in range(target_height):
        matrix_row: list[Optional[str]] = []
        for col in range(target_width):
            hex_color = rgba_to_hex(
                image.getpixel((col, row)),
                alpha_threshold=args.alpha_threshold,
                transparent_mode=args.keep_transparent_as,
            )
            matrix_row.append(hex_color)
            if hex_color is not None:
                palette_counter[hex_color] += 1
        pixels.append(matrix_row)

    payload = {
        "kind": "hex-color-matrix",
        "version": 1,
        "width": target_width,
        "height": target_height,
        "pixels": pixels,
        "palette": [
            {"hex": hex_color, "count": count}
            for hex_color, count in sorted(
                palette_counter.items(),
                key=lambda item: (-item[1], item[0]),
            )
        ],
        "source": {
            "fileName": image_path.name,
            "originalWidth": original_width,
            "originalHeight": original_height,
            "alphaThreshold": args.alpha_threshold,
            "transparentMode": args.keep_transparent_as,
        },
    }

    output_path = Path(args.output) if args.output else image_path.with_suffix(".hex-matrix.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=True, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote hex-color-matrix: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
