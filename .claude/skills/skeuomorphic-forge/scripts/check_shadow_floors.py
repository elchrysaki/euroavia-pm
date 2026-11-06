#!/usr/bin/env python3
"""Non-regression guard for numeric shadow-floor contradictions in the golden file.

Two documented recurring failures came from the golden/SKILL specs holding a value
BELOW the §16 floor, so agents copied the low value:
  - §16.2: a recess/well top machined-lip rim must be >= 0.20 (else the well looks
    flat despite deep shadows -- the "#1 recurring failure").
  - §16.5: screw heads need >= 7 shadow layers (they sit ON the surface and need
    pronounced depth); the golden shipped a 5-layer stack.

This guard fails CI if any copy-source (00-golden or references/14, the dedicated
recess/well reference) drops a recess rim / screw stack below its floor, so a future
edit cannot silently reintroduce a failure mode that survived 5 manual audits.

Usage:
  python3 scripts/check_shadow_floors.py            # check copy-sources, exit 1 on failure
  python3 scripts/check_shadow_floors.py --selftest # verify the detector logic itself
"""

import re
import sys
from pathlib import Path

GOLDEN = Path(__file__).parent.parent / "references" / "00-golden-examples.md"
# references/14 is the dedicated recess/well copy-source; agents route here for
# gauges/meters/wells, so it must also carry the §16.2 machined rim. Proven by
# arm-B eval: a trough built from its old rimless 4-zone model shipped a flat top
# lip (outer 0.06 only, no inset rim) -- the same contradiction fixed in 00-golden.
REFS14 = Path(__file__).parent.parent / "references" / "14-metal-recess-wells.md"
SOURCES = (GOLDEN, REFS14)
RIM_FLOOR = 0.20
SCREW_MIN_LAYERS = 7
RECESS_RE = re.compile(r"well|display|recess", re.I)
SCREW_RE = re.compile(r"screw head", re.I)

# A top machined-lip rim layer: "(inset) 0 1px 0 rgba(255, g, b, a)".
RIM_LAYER_RE = re.compile(
    r"(?:inset\s+)?0\s+1px\s+0\s+rgba\(\s*255\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)"
)
# A box-shadow declaration value, JSX (`...`) or CSS (...;).
BOXSHADOW_RE = re.compile(r"boxShadow\s*:\s*`([^`]*)`|box-shadow\s*:\s*([^;]*);", re.I)


def block_has_rim(block: str) -> bool:
    """True if the block has a warm (g>=240) top-lip rim at alpha >= RIM_FLOOR."""
    for g, _, a in RIM_LAYER_RE.findall(block):
        if int(g) >= 240 and float(a) >= RIM_FLOOR:
            return True
    return False


def is_recess(block: str) -> bool:
    """A recess/well carries depth via multiple inset layers; a flat surface does not."""
    return block.count("inset") >= 3


def count_layers(decl: str) -> int:
    """Count comma-separated shadow layers at parenthesis depth 0."""
    depth, segs = 0, 1
    for ch in decl:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        elif ch == "," and depth == 0:
            segs += 1
    return segs


def max_boxshadow_layers(block: str) -> int:
    best = 0
    for m in BOXSHADOW_RE.finditer(block):
        decl = (m.group(1) or m.group(2) or "").strip()
        if decl:
            best = max(best, count_layers(decl))
    return best


def parse_blocks(text: str):
    """Yield (context, code) per fenced code block. context = nearest heading + the
    immediate preceding non-empty text line (enough to name the stack)."""
    lines = text.split("\n")
    heading = ""
    i, n = 0, len(lines)
    while i < n:
        line = lines[i]
        if line.startswith("#"):
            heading = line
            i += 1
            continue
        if line.strip().startswith("```"):
            label = ""
            j = i - 1
            while j >= 0:
                s = lines[j].strip()
                if s and not s.startswith("```"):
                    label = lines[j]
                    break
                j -= 1
            code = []
            i += 1
            while i < n and not lines[i].strip().startswith("```"):
                code.append(lines[i])
                i += 1
            yield (heading + " || " + label, "\n".join(code))
        i += 1


def check(text: str):
    """Return (recess_checked, screw_checked, failures).

    Per-rule counts are returned (not a single total) so main() can fail CLOSED when
    a rule matched ZERO stacks: a heading/keyword rename that drops the selectors
    ("well/display/recess" or "screw head") would otherwise let the guard pass
    without checking anything.
    """
    failures = []
    recess_checked = 0
    screw_checked = 0
    for context, code in parse_blocks(text):
        # A copyable recess stack has an actual box-shadow declaration; skip prose /
        # ASCII-diagram blocks that merely mention "inset" in loose annotations.
        if RECESS_RE.search(context) and is_recess(code) and BOXSHADOW_RE.search(code):
            recess_checked += 1
            if not block_has_rim(code):
                failures.append((context.strip(), f"recess rim < {RIM_FLOOR} (16.2)"))
        if SCREW_RE.search(context):
            screw_checked += 1
            layers = max_boxshadow_layers(code)
            if layers < SCREW_MIN_LAYERS:
                failures.append(
                    (
                        context.strip(),
                        f"screw stack {layers} layers, need >= {SCREW_MIN_LAYERS} (16.5)",
                    )
                )
    return recess_checked, screw_checked, failures


def selftest() -> int:
    rim_ok = "inset x,\ninset y,\ninset z,\ninset 0 1px 0 rgba(255,250,240,0.22)"
    rim_bad = "inset x,\ninset y,\ninset z,\ninset 0 1px 0 rgba(255,255,255,0.05)"
    assert block_has_rim(rim_ok), "must accept a warm rim >= 0.20"
    assert not block_has_rim(rim_bad), "must reject a faint/cold rim < 0.20"
    assert is_recess(rim_ok), "3+ inset layers is a recess"

    screw7 = (
        "boxShadow: `\n" + ",\n".join(f"a{i} rgba(0,0,0,1)" for i in range(7)) + "\n`,"
    )
    screw5 = (
        "boxShadow: `\n" + ",\n".join(f"a{i} rgba(0,0,0,1)" for i in range(5)) + "\n`,"
    )
    assert max_boxshadow_layers(screw7) == 7, "must count 7 layers"
    assert max_boxshadow_layers(screw5) == 5, "must count 5 layers"

    # A schematic/diagram block (insets in annotations, no box-shadow declaration)
    # must NOT be judged as a copyable recess stack (regression: §14.2 anatomy).
    diagram = "## Metal Recess\n```\n<- inset 0 4px rgba(0,0,0,0.9)\n<- inset 0 -1px rgba(0,0,0,0.5)\n<- inset 3px 0 rgba(0,0,0,0.5)\n```\n"
    recess_checked, screw_checked, _ = check(diagram)
    assert recess_checked == 0, (
        "a diagram block without a box-shadow decl must be skipped"
    )
    assert screw_checked == 0, "no screw section in the diagram fixture"

    # Fail-closed contract: text matching no target stack yields zero counts, which
    # main() treats as an error (the guard must not silently pass on zero matches).
    r0, s0, f0 = check("## Unrelated\n```\ncolor: red;\n```\n")
    assert (r0, s0, f0) == (0, 0, []), "irrelevant text -> zero checks, zero failures"

    print("selftest OK")
    return 0


def main() -> int:
    if "--selftest" in sys.argv:
        return selftest()
    total_recess = 0
    total_screw = 0
    all_failures = []
    for src in SOURCES:
        if not src.exists():
            print(f"::error::source file not found: {src}")
            return 1
        recess_checked, screw_checked, failures = check(
            src.read_text(encoding="utf-8", errors="replace")
        )
        total_recess += recess_checked
        total_screw += screw_checked
        all_failures += [(src.name, ctx, reason) for ctx, reason in failures]
    if all_failures:
        for name, ctx, reason in all_failures:
            print(
                f"::error::shadow floor violated ({reason}) in {name} near: {ctx[:120]}"
            )
        print(
            f"FAIL: {len(all_failures)}/{total_recess + total_screw} recess/screw stacks below a shadow floor"
        )
        return 1
    # Fail CLOSED: if a selector matched nothing, the guard is silently disabled
    # (e.g. a heading/keyword rename dropped "well/display/recess" or "screw head").
    if total_recess == 0 or total_screw == 0:
        print(
            f"::error::guard matched no target stacks (recess={total_recess}, "
            f"screw={total_screw}); selectors likely broke -- failing closed"
        )
        return 1
    print(
        f"OK: {total_recess + total_screw} stacks across {len(SOURCES)} sources all meet "
        f"their shadow floor (recess={total_recess}, screw={total_screw})"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
