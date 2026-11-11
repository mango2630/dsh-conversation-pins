# Changelog

All notable changes to this plugin are documented here.

## 0.1.2

- Prefer the currently rendered DOM when jumping to a pin; load history only when the target is not loaded.
- Scroll the conversation scroller directly, verify the target is in view, and correct an interrupted smooth scroll.
- Expand folded turns and process groups when the pin lives in collapsed content.
- Distinguish folded content from missing history in the failure notice.
- Add the hover bridge, gutter halo, `Alt + P` pin shortcut, and `Alt + Shift + P` panel shortcut.

## 0.1.1

- Keep the pin trigger visible while moving from text through the left gutter.
- Add keyboard shortcuts and locale-aware UI copy.

## 0.1.0

- Initial DSH client plugin: per-session pins, six-character labels, numbered markers, pinboard, and jump-back.
