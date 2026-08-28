# Fourth-page behind-the-frames design QA

- Source visual truth: `/var/folders/ck/gm_rnrl151q1cff3sq9wp4440000gn/T/codex-clipboard-a50240f8-0350-49c5-9b57-cfb32e7f60f2.png`
- Implementation URL: `http://127.0.0.1:4174/?build=behind-the-frames`
- Desktop viewport: 1440 × 1024 CSS px
- Mobile viewport: 390 × 844 CSS px
- State: fourth page, storyboard lightbox closed

## Visual comparison

The selected reference and the rendered fourth page were inspected together. Both use three flat horizontal filmstrips, large black breathing spaces, restrained white and muted-gold typography, clearly visible film perforations, and an opaque central title field that keeps the slogan readable without hiding the surrounding photographs.

The implementation preserves the real site storyboard assets and their aspect ratios. The previously diagonal, breathing strips were removed in favor of the selected reference's calm horizontal composition. Film rails stay outside the image interiors and the three tracks continue moving horizontally at their established alternating speeds.

## Chapter identification

- A fixed `BEHIND THE FRAMES / 分镜花絮` label now sits in the left black space between the first and second strips.
- The rejected numeric prefix `04 /` is absent.
- The label uses the existing white/gold visual language and remains subordinate to the central slogan.
- On mobile the older `AI CINEMATIC STORYBOARDS` eyebrow is hidden so the new chapter label remains clear and does not overlap.

## Responsive and interaction checks

- Desktop: the selected three-strip hierarchy, black spacing, centered title, and fixed chapter label are all visible at 1440 × 1024.
- Mobile: the label, photographs, title, and film perforations remain readable at 390 × 844 without changing the vertical-scroll model.
- The first track's transform changed over a timed browser sample, confirming continuous horizontal movement.
- Clicking a visible storyboard opened one matching lightbox; the close control removed it successfully.
- Browser console inspection returned no errors on desktop or mobile.

## Findings

- No actionable P0, P1, or P2 differences remain.
- [P3] The exact storyboard frames visible at a given moment differ from the static reference because the production tracks continuously move. This is expected behavior.

## Final result

final result: passed
