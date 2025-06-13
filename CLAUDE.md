# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChoiceCore is a minimalist game engine for narrative games with binary choices, inspired by Reigns. Games are loaded as plugins via URL parameters (e.g., `?game=eltern_simulator`). The engine features modern UI/UX with responsive design, hover previews, and smooth animations.

## Featured Game: Eltern Simulator

**Eltern Simulator** is a complete German parenting simulation game with:
- 🇩🇪 Full German language content and authentic parenting scenarios
- 🎯 4-power system: `geld` (money), `kinder_glueck` (children's happiness), `eltern_nerven` (parent's nerves), `kinder_gesundheit` (children's health)
- 📖 Complex story sequences with proper narrative flow and dependencies
- 🖱️ Advanced hover preview system showing power changes before selection
- 📱 Responsive vertical power bar layout eliminating scrolling issues
- 🎪 Multiple interconnected story arcs including morning routines, pet adventures, and birthday celebrations

## Architecture

The engine consists of 4 core modules:
- `src/main.js` - Entry point, initializes loader/engine/renderer and handles UI events
- `src/loader.js` - Loads game configuration and YAML manifests from `games/` folders
- `src/engine.js` - Core game logic (powers, boosters, deck management, story triggers, completion tracking)
- `src/renderer.js` - UI rendering with modern styling, hover previews, and responsive design

## Game Structure

Each game is a self-contained folder under `games/`:
```
games/
  eltern_simulator/
    game.yaml          # Main config (powers, entry card, file manifests)
    cards/*.yaml       # Individual cards with choices and effects
    stories/*.yaml     # Sequences of cards with triggers and dependencies
    assets/images/     # Game assets (placeholder.svg currently)
```

## Key Concepts

- **Cards**: Binary choices (left/right) with effects that modify powers. Support German text and complex scenarios.
- **Powers**: Numeric values with configurable min/max bounds (e.g., geld: 0-500, others: 0-100)
- **Stories**: Card sequences triggered by conditions (`after_cards`, `requires_story_completed`) with proper insertion logic
- **Story Completion Tracking**: Stories marked complete when final card is played, enabling complex dependencies
- **Hover Previews**: Real-time display of power changes with color-coded feedback (green/red)
- **Game Over**: Triggered when any power hits its min or max boundary
- **Deck Exclusion**: Story cards automatically excluded from main deck to prevent duplication

## Advanced Features Implemented

### Story System
- **Trigger Conditions**: Stories trigger after specific card counts or story completions
- **Insertion Windows**: Stories inject cards within configurable upcoming draw ranges
- **Completion Dependencies**: Stories can require other stories to complete first
- **Proper Sequencing**: Story cards appear in correct order and only when appropriate

### UI/UX Enhancements
- **Vertical Power Bars**: Space-efficient design eliminating need for scrolling
- **Hover Preview System**: Shows exact power changes before making choices
- **Color-Coded Feedback**: Green for positive effects, red for negative effects
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern Styling**: Gradient backgrounds, glassmorphism effects, smooth animations

### Testing Framework
- **Automated Testing**: Playwright-based browser automation for comprehensive testing
- **Story Logic Validation**: Ensures proper story triggering and completion
- **UI Interaction Testing**: Verifies hover previews and responsive design
- **Game Logic Verification**: Validates power calculations and game flow

## Development Commands

This is a static web application with no build process. Serve locally with any HTTP server:
```bash
python -m http.server 8000
# or
npx serve
```

Access games via: `http://localhost:8000?game=eltern_simulator`

**Testing**: Run automated tests with `node tests/test_game.js`

## Project Structure

```
/
├── src/              # Core engine modules
├── games/            # Game plugin folders
├── tests/            # Automated testing suite
├── docs/             # Documentation and screenshots
├── index.html        # Main entry point
├── README.md         # Project overview
├── ARCHITECTURE.md   # Technical documentation
├── CARD_GENERATION_GUIDE.md  # Game creation guide
└── CLAUDE.md         # This file
```

## Working with Eltern Simulator

The game implements sophisticated German parenting scenarios with authentic language and situations:

**Sample Story Flow:**
1. `intro` card → triggers `morgen_routine` story (after 1 card)
2. `morgen_routine` cards: `morgen_stress` → `hausaufgaben_drama`
3. Later triggers `schlangen_abenteuer` story (after 2 cards)
4. Complex birthday party sequence with multiple dependencies

**Power Management:**
- `geld`: 0-500 (money for family expenses)
- `kinder_glueck`: 0-100 (children's happiness and satisfaction)
- `eltern_nerven`: 0-100 (parent's stress and patience levels)
- `kinder_gesundheit`: 0-100 (children's physical and mental health)

## Testing Games

To test the current game:
1. Start local server: `python -m http.server 8000`
2. Open: `http://localhost:8000?game=eltern_simulator`
3. Run automated tests: `node tests/test_game.js`
4. Verify story logic with: `node tests/test_detailed.js`

## YAML Schema Notes

- All file references in `game.yaml` must be explicit manifests (no auto-discovery)
- Powers support custom min/max values: `{name: geld, min: 0, max: 500}`
- Card effects use object syntax: `{power_name: +/-value}` or `{power_name: value}`
- Story triggers support `after_cards` count and `requires_story_completed` arrays
- Story cards are automatically excluded from main deck during engine initialization
- Hover previews parse both `+15` and `15` effect formats correctly

## Creating New Games

1. Study `games/eltern_simulator/` structure and content
2. Follow [CARD_GENERATION_GUIDE.md](CARD_GENERATION_GUIDE.md) for detailed instructions
3. Use authentic language and scenarios for target audience
4. Implement proper story dependencies and narrative flow
5. Test thoroughly with automated testing suite
6. Ensure responsive design compatibility

## Important Implementation Details

- **Story Card Exclusion**: `engine.js` automatically excludes story cards from main deck using `storyCardIds` Set
- **Hover Preview Parsing**: `renderer.js` handles both `"+15"` and `"15"` effect string formats
- **Responsive Design**: Power bars use percentage-based heights with `flex-shrink: 0` for consistent sizing
- **Error Handling**: Graceful fallbacks for missing assets and malformed YAML
- **Performance**: CSS-based animations preferred over JavaScript for smooth performance