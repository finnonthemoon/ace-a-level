# Star mascot direction

The five transparent, square PNGs used by the app live in `assets/images/mascot/`. The concept sheets in this folder are visual references, not runtime assets.

The intended order is red → orange → yellow → white → blue. Expression and glow increase along the same sequence; blue has the strongest stylised flame effect. The Profile screen currently offers a temporary preview selector so the team can inspect each stage across Home, Learn, Practice and Profile. No study activity is measured yet, so the selected colour must not be presented as earned progress.

When activity tracking is implemented, derive the stage from a defined study-activity policy and keep the mascot component as the single asset source. Decide the measurement window, thresholds, and how a learner recovers from an inactive period before replacing the preview state.

UI review considered [InterfaceKit’s audit of generic AI interface patterns](https://blog.interfacekit.io/what-makes-a-website-look-ai-generated), [Apple’s UI design guidance](https://developer.apple.com/design/tips/), and [Nielsen Norman Group’s visual hierarchy principles](https://www.nngroup.com/articles/principles-visual-design/). The update prioritises product-specific labels, genuine states, fewer decorative cards, consistent type and spacing, and readable controls.
