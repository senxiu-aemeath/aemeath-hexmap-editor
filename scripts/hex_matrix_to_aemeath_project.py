#!/usr/bin/env python3
"""Convert a hex-color-matrix JSON file into an Aemeath project save.

Current mapping strategy:
- each matrix cell maps to one map cell at the same col/row
- each unique hex color becomes one country
- transparent / null cells stay unassigned
- all assigned cells are land by default
- null cells can be kept as land-unassigned or converted to empty surface
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Optional


DEFAULT_WORLD_METADATA = {
    "name": "Imported Hex Matrix",
    "author": "",
    "title": "Imported Hex Matrix",
    "subtitle": "Generated from image",
    "showBranding": True,
    "showTitle": True,
    "showSubtitle": True,
    "showByline": True,
    "pageMarginTop": 28,
    "headerFontFamily": '"JetBrains Mono", "Cascadia Mono", "Fira Code", "Noto Sans Mono CJK SC", monospace',
    "titleColor": "#20150f",
    "subtitleColor": "#4e3b34",
    "bylineColor": "#7a6971",
    "titleFontSize": 68,
    "subtitleFontSize": 28,
    "bylineFontSize": 18,
    "titleSubtitleGap": 8,
    "subtitleBylineGap": 8,
}

DEFAULT_WORLD_FRAME = {
    "top": 228,
    "right": 68,
    "bottom": 68,
    "left": 68,
    "color": "#f4f0e2",
}

DEFAULT_WORLD_AXES = {
    "showTop": True,
    "showRight": True,
    "showBottom": True,
    "showLeft": True,
    "color": "#20150f",
    "fontSize": 14,
    "fontFamily": '"JetBrains Mono", "Cascadia Mono", "Fira Code", "Noto Sans Mono CJK SC", monospace',
}

DEFAULT_SUBMAP_STYLE = {
    "pageMarginTop": 18,
    "frameTop": 141,
    "frameRight": 56,
    "frameBottom": 56,
    "frameLeft": 56,
    "frameColor": "#f4f0e2",
    "titleFontSize": 30,
    "subtitleFontSize": 22,
    "bylineFontSize": 18,
    "titleSubtitleGap": 6,
    "subtitleBylineGap": 6,
}

DEFAULT_LABEL_STYLE = {
    "fontFamily": '"JetBrains Mono", "Cascadia Mono", "Fira Code", "Noto Sans Mono CJK SC", monospace',
    "fontSize": 18,
    "fontWeight": "400",
    "fontStyle": "normal",
    "letterSpacing": 0,
    "lineHeight": 1.1,
    "fill": "#f7f1da",
    "stroke": "#20150f",
    "strokeWidth": 3,
    "opacity": 1,
    "textAlign": "center",
    "textTransform": "none",
    "rotation": 0,
    "scaleWithZoom": True,
    "scaleWithCountrySize": True,
    "countrySizeScaleMin": 0.85,
    "countrySizeScaleMax": 1.25,
    "minZoom": None,
    "maxZoom": None,
    "maxWidth": None,
    "curved": False,
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert a hex-color-matrix JSON file to an Aemeath project JSON file.",
    )
    parser.add_argument("input", help="Input hex-color-matrix JSON path.")
    parser.add_argument(
        "-o",
        "--output",
        help="Output project JSON path. Defaults to <input>.aemeath-project.json",
    )
    parser.add_argument(
        "--hex-size",
        type=int,
        default=24,
        help="Hex size for the generated world grid. Default: 24",
    )
    parser.add_argument(
        "--name",
        default="Imported Hex Matrix",
        help="World name/title prefix.",
    )
    parser.add_argument(
        "--null-surface",
        choices=["land", "empty"],
        default="empty",
        help="Surface kind for null pixels. Default: empty",
    )
    return parser.parse_args()


def create_rect_hex_grid(cols: int, rows: int, hex_size: int) -> list[dict[str, Any]]:
    sqrt_3 = 3 ** 0.5
    x_step = sqrt_3 * hex_size
    y_step = 1.5 * hex_size
    cells: list[dict[str, Any]] = []
    for row in range(rows):
        for col in range(cols):
            offset_x = 0 if row % 2 == 0 else x_step / 2
            cells.append(
                {
                    "id": f"cell-{col}-{row}",
                    "q": col,
                    "r": row,
                    "centerX": col * x_step + offset_x,
                    "centerY": row * y_step,
                }
            )
    return cells


def create_surface(kind: str) -> dict[str, Any]:
    return {
        "kind": kind,
        "elevation": 0,
        "special": "none",
    }


def create_built_in_label_groups() -> dict[str, Any]:
    def assigned_group(
        group_id: str,
        name: str,
        kind: str,
        order: int,
        defaults: dict[str, Any],
        offset_y: int,
        source_name_mode: str,
    ) -> dict[str, Any]:
        return {
            "id": group_id,
            "name": name,
            "builtIn": True,
            "kind": "assigned",
            "visible": True,
            "locked": False,
            "order": order,
            "defaults": defaults,
            "assignment": {
                "kind": kind,
                "autoCreateMode": "default",
                "autoCreateDefault": False,
                "confirmOnRemove": True,
                "defaultOffsetX": 0,
                "defaultOffsetY": offset_y,
                "generatedTextPrefix": "",
                "generatedTextSuffix": "",
                "sourceNameMode": source_name_mode,
            },
        }

    return {
        "city_name": assigned_group(
            "city_name",
            "City Names",
            "city",
            0,
            {**DEFAULT_LABEL_STYLE, "fontSize": 16, "fontWeight": "600"},
            0,
            "primary",
        ),
        "city_second_name": assigned_group(
            "city_second_name",
            "City Second Names",
            "city",
            1,
            {**DEFAULT_LABEL_STYLE, "fontSize": 14, "fontWeight": "400", "fontStyle": "italic"},
            18,
            "secondary",
        ),
        "country_name": assigned_group(
            "country_name",
            "Country Names",
            "country",
            2,
            {
                **DEFAULT_LABEL_STYLE,
                "fontSize": 28,
                "fontWeight": "700",
                "letterSpacing": 1.2,
                "textTransform": "uppercase",
            },
            0,
            "primary",
        ),
        "province_name": assigned_group(
            "province_name",
            "Province Names",
            "province",
            3,
            {**DEFAULT_LABEL_STYLE, "fontSize": 22, "fontWeight": "600", "letterSpacing": 0.8},
            0,
            "primary",
        ),
        "country_icon": {
            "id": "country_icon",
            "name": "Country Icons",
            "builtIn": True,
            "kind": "assigned",
            "visible": True,
            "locked": False,
            "order": 4,
            "defaults": {
                **DEFAULT_LABEL_STYLE,
                "fontSize": 52,
                "strokeWidth": 0,
            },
            "assignment": {
                "kind": "country",
                "autoCreateMode": "default",
                "autoCreateDefault": True,
                "confirmOnRemove": True,
                "defaultOffsetX": 0,
                "defaultOffsetY": -28,
                "generatedTextPrefix": "",
                "generatedTextSuffix": "",
                "sourceNameMode": "primary",
            },
        },
        "country_second_name": assigned_group(
            "country_second_name",
            "Country Second Names",
            "country",
            5,
            {
                **DEFAULT_LABEL_STYLE,
                "fontSize": 18,
                "fontWeight": "500",
                "fontStyle": "italic",
                "letterSpacing": 0.8,
            },
            26,
            "secondary",
        ),
        "free_label": {
            "id": "free_label",
            "name": "Free Labels",
            "builtIn": True,
            "kind": "free",
            "visible": True,
            "locked": False,
            "order": 6,
            "defaults": {**DEFAULT_LABEL_STYLE, "fontSize": 20},
            "assignment": None,
        },
        "free_icon": {
            "id": "free_icon",
            "name": "Free Icons",
            "builtIn": True,
            "kind": "free",
            "visible": True,
            "locked": False,
            "order": 7,
            "defaults": {**DEFAULT_LABEL_STYLE, "fontSize": 52, "strokeWidth": 0},
            "assignment": None,
        },
    }


def create_initial_world(cols: int, rows: int, hex_size: int, name: str) -> dict[str, Any]:
    grid = {
        "cols": cols,
        "rows": rows,
        "hexSize": hex_size,
        "orientation": "pointy",
    }
    cells = create_rect_hex_grid(cols, rows, hex_size)
    return {
        "version": 1,
        "grid": grid,
        "cells": cells,
        "metadata": {
            **DEFAULT_WORLD_METADATA,
            "name": name,
            "title": name,
            "subtitle": "Generated from hex-color-matrix",
        },
        "frame": dict(DEFAULT_WORLD_FRAME),
        "axes": dict(DEFAULT_WORLD_AXES),
        "submapStyle": dict(DEFAULT_SUBMAP_STYLE),
        "countries": {},
        "governmentTypes": {
            "monarchy": {"id": "monarchy", "name": "Monarchy", "color": "#c79a34", "order": 0},
            "republic": {"id": "republic", "name": "Republic", "color": "#4b86b4", "order": 1},
            "theocracy": {"id": "theocracy", "name": "Theocracy", "color": "#9d7bd8", "order": 2},
            "steppe_horde": {"id": "steppe_horde", "name": "Steppe Horde", "color": "#8f6b3d", "order": 3},
            "tribe": {"id": "tribe", "name": "Tribe", "color": "#5a8b7a", "order": 4},
        },
        "cellSurfaces": {cell["id"]: create_surface("land") for cell in cells},
        "countryAssignments": {cell["id"]: None for cell in cells},
        "provinces": {},
        "provinceAssignments": {cell["id"]: None for cell in cells},
        "cityLevels": {
            "capital": {
                "id": "capital",
                "name": "Capital",
                "rank": 4,
                "iconKey": "capital",
                "iconScalePercent": 100,
                "order": 0,
                "uniquePerCountry": True,
                "displayInCountryInfo": True,
            },
            "province_capital": {
                "id": "province_capital",
                "name": "Province Capital",
                "rank": 3,
                "iconKey": "province_capital",
                "iconScalePercent": 100,
                "order": 1,
                "uniquePerCountry": False,
                "displayInCountryInfo": False,
            },
            "town": {
                "id": "town",
                "name": "Town",
                "rank": 2,
                "iconKey": "town",
                "iconScalePercent": 100,
                "order": 2,
                "uniquePerCountry": False,
                "displayInCountryInfo": False,
            },
            "village": {
                "id": "village",
                "name": "Village",
                "rank": 1,
                "iconKey": "village",
                "iconScalePercent": 100,
                "order": 3,
                "uniquePerCountry": False,
                "displayInCountryInfo": False,
            },
            "fallback": {
                "id": "fallback",
                "name": "Fallback",
                "rank": 0,
                "iconKey": "village",
                "iconScalePercent": 100,
                "order": 999,
                "uniquePerCountry": False,
                "displayInCountryInfo": False,
            },
        },
        "cities": {},
        "submaps": {},
        "labelGroups": create_built_in_label_groups(),
        "labels": {},
    }


def hex_color_to_rgb(hex_color: str) -> tuple[int, int, int]:
    return (
        int(hex_color[1:3], 16),
        int(hex_color[3:5], 16),
        int(hex_color[5:7], 16),
    )


def clamp_rgb_channel(value: float) -> int:
    return max(0, min(255, round(value)))


def rgb_to_hex(red: float, green: float, blue: float) -> str:
    return f"#{clamp_rgb_channel(red):02x}{clamp_rgb_channel(green):02x}{clamp_rgb_channel(blue):02x}"


def blend_rgb_colors(base: tuple[int, int, int], target: tuple[int, int, int], ratio: float) -> str:
    clamped_ratio = max(0.0, min(1.0, ratio))
    return rgb_to_hex(
        base[0] + (target[0] - base[0]) * clamped_ratio,
        base[1] + (target[1] - base[1]) * clamped_ratio,
        base[2] + (target[2] - base[2]) * clamped_ratio,
    )


def get_perceived_brightness(rgb_color: tuple[int, int, int]) -> float:
    return (rgb_color[0] * 299 + rgb_color[1] * 587 + rgb_color[2] * 114) / 1000


def derive_country_palette_from_fill(hex_color: str) -> dict[str, str]:
    base = hex_color_to_rgb(hex_color)
    brightness = get_perceived_brightness(base)
    province_lift_ratio = 0.14 if brightness > 208 else 0.2
    province_border_darken_ratio = 0.16 if brightness < 86 else 0.24
    border_darken_ratio = 0.4 if brightness < 86 else 0.5

    return {
        "borderColor": blend_rgb_colors(base, (0, 0, 0), border_darken_ratio),
        "provinceDefaultColor": blend_rgb_colors(base, (255, 255, 255), province_lift_ratio),
        "provinceBorderColor": blend_rgb_colors(base, (0, 0, 0), province_border_darken_ratio),
    }


def create_country(hex_color: str) -> dict[str, Any]:
    country_id = f"country-{hex_color[1:]}"
    palette = derive_country_palette_from_fill(hex_color)
    return {
        "id": country_id,
        "name": hex_color.upper(),
        "secondName": "",
        "iconKey": None,
        "color": hex_color,
        "borderColor": palette["borderColor"],
        "provinceDefaultColor": palette["provinceDefaultColor"],
        "provinceBorderColor": palette["provinceBorderColor"],
        "governmentTypeId": None,
        "isCityState": False,
        "description": f"Generated from color {hex_color.upper()}",
    }


def normalize_hex_color(value: Any, location: str) -> str:
    if not isinstance(value, str):
        raise ValueError(f"Invalid hex color at {location}: expected string or null.")
    trimmed = value.strip()
    if len(trimmed) == 4 and trimmed.startswith("#"):
        body = trimmed[1:]
        if all(char in "0123456789abcdefABCDEF" for char in body):
            return f"#{body[0] * 2}{body[1] * 2}{body[2] * 2}".lower()
    if len(trimmed) == 7 and trimmed.startswith("#"):
        body = trimmed[1:]
        if all(char in "0123456789abcdefABCDEF" for char in body):
            return trimmed.lower()
    raise ValueError(f"Invalid hex color at {location}: {value!r}. Expected #rgb or #rrggbb.")


def read_matrix(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if payload.get("kind") != "hex-color-matrix":
        raise ValueError("Input is not a hex-color-matrix file.")
    width = payload.get("width")
    height = payload.get("height")
    pixels = payload.get("pixels")
    if not isinstance(width, int) or not isinstance(height, int) or width <= 0 or height <= 0:
        raise ValueError("Invalid width/height in matrix file.")
    if not isinstance(pixels, list) or len(pixels) != height:
        raise ValueError("Matrix row count does not match height.")
    normalized_pixels: list[list[Optional[str]]] = []
    for row_index, row in enumerate(pixels):
        if not isinstance(row, list) or len(row) != width:
            raise ValueError("Matrix column count does not match width.")
        normalized_row: list[Optional[str]] = []
        for col_index, value in enumerate(row):
            normalized_row.append(
                None
                if value is None
                else normalize_hex_color(value, f"row {row_index}, column {col_index}")
            )
        normalized_pixels.append(normalized_row)
    payload["pixels"] = normalized_pixels
    return payload


def main() -> int:
    args = parse_args()
    input_path = Path(args.input)
    if not input_path.is_file():
        raise SystemExit(f"Input matrix not found: {input_path}")

    matrix = read_matrix(input_path)
    width = matrix["width"]
    height = matrix["height"]
    pixels = matrix["pixels"]

    world = create_initial_world(width, height, args.hex_size, args.name)
    countries_by_hex: dict[str, dict[str, Any]] = {}

    for row_index, row in enumerate(pixels):
        for col_index, maybe_hex in enumerate(row):
            cell_id = f"cell-{col_index}-{row_index}"
            if maybe_hex is None:
                if args.null_surface == "empty":
                    world["cellSurfaces"][cell_id] = create_surface("empty")
                continue

            hex_color = maybe_hex
            country = countries_by_hex.get(hex_color)
            if country is None:
                country = create_country(hex_color)
                countries_by_hex[hex_color] = country
                world["countries"][country["id"]] = country

            world["countryAssignments"][cell_id] = country["id"]
            world["cellSurfaces"][cell_id] = create_surface("land")

    project_payload = {
        "kind": "hex-map-project",
        "version": 1,
        "grid": world["grid"],
        "world": world,
        "userIcons": [],
        "activeSubmapId": None,
        "canvasViewStates": {},
    }

    output_path = (
        Path(args.output)
        if args.output
        else input_path.with_suffix(".aemeath-project.json")
    )
    output_path.write_text(json.dumps(project_payload, ensure_ascii=True, indent=2) + "\n", encoding="utf-8")
    print(
        f"Wrote project: {output_path} "
        f"({len(countries_by_hex)} countries, {width}x{height} cells)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
