# Markdown Content Creation Specification
*Author: vatofichor - Sebastian Mass & Gemini Antigravity*
*Date: 2026-06-14*

This document outlines the standard Markdown syntax and layout rules accepted by the **Course Explorer** compilation engine (`md2web`). Writers and content moderators must follow these standards to ensure proper visual layout, premium styling, and error-free rendering.

---

## 1. Table Syntax (Strict Validation)
Tables are validated strictly to avoid rendering plain-text delimiters as tables. For a block to render as a table:
1. **Rule 1:** The first line must begin with a pipe `|` character.
2. **Rule 2:** The second line must follow the horizontal divider pattern `|---|---|` or `|:---|:---|`. Only hyphens `-`, colons `:`, spaces, and pipes `|` are allowed on this line.
3. **Rule 3:** The parser will gather consecutive lines starting with `|` until the first line that does not begin with `|`.

### Column Alignments
Alignments can be configured using colons `:` within the divider row cells:
- **Left Align (Default):** `| --- |` or `| :--- |`
- **Center Align:** `| :---: |`
- **Right Align:** `| ---: |`

### Example
```markdown
| Lorem Text | Part of Speech | English Meaning |
| :--- | :---: | ---: |
| Epsum | Noun | Word, reason |
| Delor | Verb | I see |
| Egnus | Adjective | Good, beautiful |
```

---

## 2. Heading Levels
Use standard hashes `#` at the start of a line to represent headings. Headings are styled with premium margins and side-accent borders:
- `# Heading 1` (Used only once at the very top for the main lesson title)
- `## Heading 2` (Styled with an underline dashed separator; used for major lesson sections)
- `### Heading 3` (Styled in gold; used for subsections)
- `#### Heading 4` (Styled in retro accent red; used for sub-paragraphs/vocabulary tags)

---

## 3. Typographical Accents
- **Bold:** Wrap text in double asterisks: `**text**` (renders as `<strong>text</strong>`)
- **Italic:** Wrap text in single asterisks or underscores: `*text*` or `_text_` (renders as `<em>text</em>`)
- **Monospace Code:** Wrap in backticks: `` `code` `` (renders as `<code>code</code>`)

---

## 4. Bullet Lists
List items must start with an asterisk `*` or hyphen `-` followed by a space at the beginning of a line:
```markdown
- First item
- Second item
- Third item
```

---

## 5. Blockquotes and Callouts
Used to highlight grammatical rules, warnings, or vocabulary alerts. Use the `>` character at the beginning of the line:
```markdown
> **Rule of the Article:** In Greek, the article matches the noun it modifies in gender, number, and case.
```

---

## 6. Greek & Mathematical Symbol Injection
The engine dynamically compiles LaTeX-style math tokens into highlighted premium mathematical elements:
- Inline formulas must be wrapped in single dollar signs: `$x = y + z$` (renders as `<span class="math">x = y + z</span>`).
- Common Koine Greek character macros are expanded automatically inside the math elements:
  - `\alpha` -> `&alpha;` (α)
  - `\beta` -> `&beta;` (β)
  - `\gamma` -> `&gamma;` (γ)
  - `\delta` -> `&delta;` (δ)
  - `\epsilon` -> `&epsilon;` (ε)
  - `\zeta` -> `&zeta;` (ζ)
  - `\eta` -> `&eta;` (η)
  - `\theta` -> `&theta;` (θ)
  - `\iota` -> `&iota;` (ι)
  - `\kappa` -> `&kappa;` (κ)
  - `\lambda` -> `&lambda;` (λ)
  - `\mu` -> `&mu;` (μ)
  - `\nu` -> `&nu;` (ν)
  - `\xi` -> `&xi;` (ξ)
  - `\omicron` -> `&omicron;` (ο)
  - `\pi` -> `&pi;` (π)
  - `\rho` -> `&rho;` (ρ)
  - `\sigma` -> `&sigma;` (σ)
  - `\tau` -> `&tau;` (τ)
  - `\upsilon` -> `&upsilon;` (υ)
  - `\phi` -> `&phi;` (φ)
  - `\chi` -> `&chi;` (χ)
  - `\psi` -> `&psi;` (ψ)
  - `\omega` -> `&omega;` (ω)

---

## 7. Hyperlinks and Embedded Media
- **Links:** `[Link Text](URL)`
- **Images:** `![Alt Text](relative/path/to/image.png)` (The compiler resolves paths from the lesson subfolder automatically and adds standard drop shadows and borders)

---

# Copyright (c) 2026:
# vatofichor - Sebastian Mass     [>_<]
# & Assisted By Gemini Antigravity \|\
