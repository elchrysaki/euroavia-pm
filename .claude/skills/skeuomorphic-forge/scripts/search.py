#!/usr/bin/env python3
"""
Skeuomorphic Forge Search — Find patterns across 19 reference files + 21 HTML assets.

Usage:
  python3 search.py "button"                    # Search all references
  python3 search.py "CRT display" -n 5          # Top 5 results
  python3 search.py "box-shadow" --file 04      # Search specific file
  python3 search.py "knob" --code-only          # Only show code blocks
  python3 search.py "rim light" --context 5     # Show 5 lines of context

Designed for Claude to call instead of reading 8671-line files manually.
"""

import argparse
import re
from collections import defaultdict
from math import log
from pathlib import Path

REFS_DIR = Path(__file__).parent.parent / "references"
ASSETS_DIR = Path(__file__).parent.parent / "assets"

# Files indexed by short name
FILE_MAP = {
    "00": "00-golden-examples.md",
    "01": "01-shadows-materials-textures.md",
    "02": "02-hardware-animation-neumorphism.md",
    "03": "03-blueprints-performance-palettes.md",
    "04": "04-community-techniques.md",
    "05": "05-physics-composition-interaction-typography.md",
    "06": "06-aging-safety-tokens-palettes.md",
    "07": "07-glass-effects.md",
    "08": "08-metal-effects.md",
    "09": "09-rim-light-effects.md",
    "10": "10-particle-effects.md",
    "11": "11-retro-industrial-patterns.md",
    "12": "12-production-components.md",
    "13": "13-3d-depth-techniques.md",
    "14": "14-metal-recess-wells.md",
    "15": "15-detailed-chassis.md",
    "16": "16-benchmark-lessons.md",
    "17": "17-context-scan-matrices.md",
    "18": "18-verification-checklist.md",
}

# HTML assets indexed separately — resolved from ASSETS_DIR
HTML_MAP = {
    "site": "agile-tech-skeuomorphic-site.html",
    "deep-screen": "codepen-deep-screen.html",
    "power-button": "power-button.html",
    "synthscore": "synthscore-analytics.html",
    "vu-meter": "tube-compressor-vu.html",
    "switch": "skeuomorphic-switch.html",
    "lcd": "lcd-db-display.html",
    "lever": "industrial-lever.html",
    "gauge": "credit-score-gauge.html",
    "alert": "autochord-alert-panel.html",
    "phosphor": "deep-screen-phosphor.html",
    "folding": "folding-header.html",
    "thermometer": "horizontal-thermometer.html",
    "rimlight": "rimlight-toggle-switch.html",
    "color-mix": "color-mix-buttons.html",
    "rocker": "rocker-3d-switch.html",
    "tiles": "tile-buttons-divs.html",
    "loading": "neumorphic-loading-circle.html",
    "progress": "neumorphic-progress-loader.html",
    "pressed": "neumorphic-pressed-buttons.html",
    "fingerprint": "fingerprint-button.html",
}


def load_file_sections(filepath: Path) -> list[dict]:
    """Parse a markdown/HTML file into sections (heading + body)."""
    if not filepath.exists():
        return []

    text = filepath.read_text(encoding="utf-8", errors="replace")
    lines = text.split("\n")
    sections = []
    current_heading = "Top"
    current_lines = []
    current_start = 1

    in_fence = False
    for i, line in enumerate(lines, 1):
        # Track fenced code blocks — never treat lines inside as headings
        if line.startswith("```"):
            in_fence = not in_fence

        # Detect headings (markdown ## or HTML comments <!-- SECTION -->)
        is_heading = False
        if not in_fence and (
            line.startswith("#")
            or re.match(r"^/\*\s*=+", line)
            or re.match(r"^\.\w+.*\{", line)
        ):
            is_heading = True

        if is_heading and current_lines:
            sections.append(
                {
                    "heading": current_heading,
                    "body": "\n".join(current_lines),
                    "start_line": current_start,
                    "end_line": i - 1,
                    "file": filepath.name,
                }
            )
            current_heading = line.strip().lstrip("#").strip()
            current_lines = [line]
            current_start = i
        else:
            current_lines.append(line)

    # Last section
    if current_lines:
        sections.append(
            {
                "heading": current_heading,
                "body": "\n".join(current_lines),
                "start_line": current_start,
                "end_line": len(lines),
                "file": filepath.name,
            }
        )

    return sections


def extract_code_blocks(text: str) -> list[str]:
    """Extract fenced code blocks from markdown."""
    return re.findall(r"```[\w]*\n(.*?)```", text, re.DOTALL)


class BM25:
    """BM25 ranking for section search."""

    def __init__(self, k1=1.5, b=0.75):
        self.k1 = k1
        self.b = b
        self.corpus = []
        self.doc_lengths = []
        self.avgdl = 0
        self.idf = {}
        self.doc_freqs = defaultdict(int)
        self.N = 0

    def tokenize(self, text: str) -> list[str]:
        text = re.sub(r"[^\w\s\-.]", " ", text.lower())
        return [w for w in text.split() if len(w) > 1]

    def fit(self, documents: list[str]):
        self.corpus = [self.tokenize(doc) for doc in documents]
        self.N = len(self.corpus)
        if self.N == 0:
            return
        self.doc_lengths = [len(doc) for doc in self.corpus]
        self.avgdl = sum(self.doc_lengths) / self.N
        for doc in self.corpus:
            seen = set()
            for word in doc:
                if word not in seen:
                    self.doc_freqs[word] += 1
                    seen.add(word)
        for word, freq in self.doc_freqs.items():
            self.idf[word] = log((self.N - freq + 0.5) / (freq + 0.5) + 1)

    def score(self, query: str) -> list[tuple[int, float]]:
        tokens = self.tokenize(query)
        scores = []
        for idx, doc in enumerate(self.corpus):
            score = 0.0
            tf_map = defaultdict(int)
            for w in doc:
                tf_map[w] += 1
            for token in tokens:
                if token in self.idf:
                    tf = tf_map[token]
                    idf_val = self.idf[token]
                    num = tf * (self.k1 + 1)
                    den = tf + self.k1 * (
                        1 - self.b + self.b * self.doc_lengths[idx] / (self.avgdl or 1)
                    )
                    score += idf_val * num / den
            scores.append((idx, score))
        return sorted(scores, key=lambda x: x[1], reverse=True)


def search(
    query: str,
    file_filter: str | None = None,
    max_results: int = 3,
    code_only: bool = False,
    context_lines: int = 0,
) -> str:
    """Search across all reference files and return formatted results."""

    # Determine which files to search
    all_keys = {**FILE_MAP, **HTML_MAP}
    if file_filter:
        filt = file_filter.lower()
        # 1. Exact match first
        keys = [k for k in all_keys if k.lower() == filt]
        if not keys:
            # 2. Prefix match
            keys = [k for k in all_keys if k.lower().startswith(filt)]
        if not keys:
            return f"Error: No file matching '{file_filter}'. Available: {', '.join(sorted(all_keys.keys()))}"
        if len(keys) > 1:
            return f"Error: Ambiguous filter '{file_filter}' matches {len(keys)} files: {', '.join(sorted(keys))}. Use a more specific key."
    else:
        keys = list(all_keys.keys())

    # Load all sections
    all_sections = []
    for key in keys:
        if key in HTML_MAP:
            fpath = ASSETS_DIR / HTML_MAP[key]
        else:
            fpath = REFS_DIR / FILE_MAP[key]
        sections = load_file_sections(fpath)
        all_sections.extend(sections)

    if not all_sections:
        return "No sections found."

    # BM25 search
    documents = [f"{s['heading']} {s['body']}" for s in all_sections]
    bm25 = BM25()
    bm25.fit(documents)
    ranked = bm25.score(query)

    # Format output
    output = []
    output.append(f'## Skeuomorphic Forge Search: "{query}"')
    if file_filter:
        output.append(f"**Filtered to:** {file_filter}")

    count = 0
    iterations = 0
    max_iterations = max_results * 10  # Safety bound: don't scan entire corpus
    for idx, score in ranked:
        if score <= 0 or count >= max_results or iterations >= max_iterations:
            break
        iterations += 1

        section = all_sections[idx]

        # When code_only, skip sections that have no code blocks — backfill from next ranked result
        if code_only:
            blocks = extract_code_blocks(section["body"])
            if not blocks:
                continue
        else:
            blocks = []

        count += 1

        output.append(f"\n### Result {count} (score: {score:.2f})")
        output.append(
            f"**File:** `{section['file']}` | **Lines:** {section['start_line']}-{section['end_line']} | **Heading:** {section['heading'][:80]}"
        )

        if code_only:
            for block in blocks[:3]:
                output.append(f"```\n{block.strip()}\n```")
        elif context_lines > 0:
            # Show limited preview
            body_lines = section["body"].split("\n")
            preview = "\n".join(body_lines[: context_lines * 2])
            if len(body_lines) > context_lines * 2:
                preview += f"\n... ({len(body_lines) - context_lines * 2} more lines)"
            output.append(preview)
        else:
            # Show full section but capped at 40 lines
            body_lines = section["body"].split("\n")
            if len(body_lines) > 40:
                output.append("\n".join(body_lines[:40]))
                output.append(
                    f"\n... ({len(body_lines) - 40} more lines — use Read tool at line {section['start_line']})"
                )
            else:
                output.append(section["body"])

    if count == 0:
        output.append("\nNo results found. Try different keywords.")
        output.append(
            "Common searches: button, shadow, CRT, knob, glass, metal, rim light, LED, bezel, screw"
        )

    output.append(
        f"\n**Total sections scanned:** {len(all_sections)} across {len(keys)} files"
    )
    return "\n".join(output)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Skeuomorphic Forge Pattern Search")
    parser.add_argument(
        "query",
        help="Search query (e.g., 'button shadow', 'CRT display', 'knob gradient')",
    )
    parser.add_argument(
        "--file",
        "-f",
        help="Filter to specific file (e.g., '04', '11', 'gauge', 'phosphor')",
    )
    parser.add_argument(
        "--max-results", "-n", type=int, default=3, help="Max results (default: 3)"
    )
    parser.add_argument(
        "--code-only",
        "-c",
        action="store_true",
        help="Only show code blocks from matching sections",
    )
    parser.add_argument(
        "--context",
        type=int,
        default=0,
        help="Lines of context to show (0 = full section, capped at 40)",
    )

    args = parser.parse_args()
    result = search(
        args.query, args.file, args.max_results, args.code_only, args.context
    )
    print(result)
