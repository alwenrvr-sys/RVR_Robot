from typing import List, Tuple
import ezdxf
from ezdxf import path

A4_WIDTH_MM = 148
A4_HEIGHT_MM = 210

Point = Tuple[float, float]


def load_dxf(file_path: str) -> List[List[Point]]:
    doc = ezdxf.readfile(file_path)
    msp = doc.modelspace()

    paths = []

    for entity in msp:
        try:
            p = path.make_path(entity)
        except Exception:
            continue

        if not p:
            continue

        poly = p.flattening(distance=0.5)
        pts = [(v.x, v.y) for v in poly]

        if len(pts) >= 2:
            paths.append(pts)

    if not paths:
        raise ValueError("No drawable geometry found in DXF")

    return paths


def scale_paths_to_a4(paths: List[List[Point]]) -> List[List[Point]]:
    xs = [x for path in paths for x, _ in path]
    ys = [y for path in paths for _, y in path]

    minx, maxx = min(xs), max(xs)
    miny, maxy = min(ys), max(ys)

    width = maxx - minx
    height = maxy - miny

    if width == 0 or height == 0:
        raise ValueError("Invalid DXF dimensions")

    scale = min(A4_WIDTH_MM / width, A4_HEIGHT_MM / height)

    scaled = []
    for path in paths:
        pts = [((x - minx) * scale, (y - miny) * scale) for x, y in path]
        scaled.append(pts)

    return scaled


def generate_draw_commands(
    paths: List[List[Point]],
    origin: Tuple[float, float]
) -> List[List[Point]]:
    ox, oy = origin
    return [[(ox + x, oy + y) for x, y in path] for path in paths]
