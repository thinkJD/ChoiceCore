REIGNS-STYLE GAME ENGINE — ARCHITECTURE DOCUMENT
================================================

Overview
--------

This is a static, client-only game engine inspired by the Reigns series. Games are loaded
as plugins, each in its own folder, fully self-contained. The engine is written with 
human and AI collaboration in mind: configuration is YAML-based, logic is modular, and 
code generation should be predictable.

Goals:
- Run entirely in the browser with modern UI/UX
- Load game via URL param (?game=game_name)
- Accept GitHub PRs with new games
- Real-time visual feedback and interactive elements
- Future-proof for save games, UI editors, and modding

Core Concepts
-------------

- Cards:
  - Two binary choices (left/right)
  - Optional image (referenced by relative URL)
  - Description text
  - Choice-based effects: adjust powers, trigger follow-ups, apply boosters
  - Can be part of a story sequence
  - Support hover previews showing power change effects

- Powers:
  - Numeric values with per-power bounds (default 0–100 if not specified in game.yaml)
  - Game over when out of bounds (using configured bounds, unless modified)
  - Boosters can temporarily override caps
  - Visual representation with vertical progress bars
  - Real-time preview of changes on hover

- Boosters:
  - Active for N rounds
  - Can:
    - Modify caps (e.g. raise money max to 200)
    - Modify effects (e.g. halve losses)
    - Affect specific powers or global logic

- Stories:
  - Sequence of cards that tell a narrative
  - Triggered by card count, flags, or prior completions
  - Injected into deck with configurable insertion windows
  - Support completion tracking and dependencies
  - Excluded from main deck to prevent duplication

Plugin Structure
----------------

Each game is a folder under `/games/`. Example:

  /games/
    eltern_simulator/
      game.yaml
      cards/
        *.yaml
      boosters/
        *.yaml (optional)
      stories/
        *.yaml
      assets/
        images/
          *.png

`game.yaml` defines:
--------------------

  name: "Eltern Simulator"
  entry_card: intro
  powers:
    - name: geld
      min: 0
      max: 500
    - name: kinder_glueck
      min: 0
      max: 100
    - name: eltern_nerven
      min: 0
      max: 100
    - name: kinder_gesundheit
      min: 0
      max: 100
  load:
    cards:
      - "cards/intro.yaml"
      - "cards/krank_kind.yaml"
      # ... other cards
    stories:
      - "stories/morgen_routine.yaml"
      - "stories/schlangen_abenteuer.yaml"
      # ... other stories
  assets:
    base_path: "assets/images/"

Game Engine Flow
----------------

1. Parse URL param (?game=...)
2. Fetch /games/{game}/game.yaml
3. Load all referenced YAML files
4. Construct:
   - Powers with visual representations
   - Initial draw stack (excluding story cards)
   - Story triggers and tracking
   - Booster registry
5. Begin game loop with entry_card
6. At each step:
   - Render current card with hover preview system
   - Apply choice effects with visual feedback
   - Update power displays with smooth animations
   - Trigger story sequences based on conditions
   - Check game over conditions

UI/UX Features
--------------

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Vertical Power Bars**: Space-efficient layout eliminating scrolling
- **Hover Previews**: Real-time display of power changes before selection
- **Color-coded Feedback**: Green for positive changes, red for negative
- **Smooth Animations**: Power bar transitions and visual state changes
- **Modern Styling**: Gradient backgrounds and glassmorphism effects

Story System Architecture
-------------------------

Stories are complex narrative sequences with the following features:

- **Trigger Conditions**: `after_cards`, `requires_story_completed`
- **Insertion Logic**: Cards injected with configurable `insert_window`
- **Completion Tracking**: Stories marked complete when final card is played
- **Dependency System**: Stories can require other stories to complete first
- **Deck Exclusion**: Story cards excluded from main deck to prevent duplication

Example story trigger flow:
1. Player completes N cards
2. Engine checks story trigger conditions
3. Story cards injected into upcoming draws
4. Story marked as triggered
5. When story's final card is played, marked as completed

YAML Object Examples
--------------------

CARD:

  id: krank_kind
  image: assets/images/placeholder.svg
  description: "Dein Kind ist krank und möchte zu Hause bleiben."
  left:
    label: "Zu Hause lassen"
    effects:
      - geld: -50  # Lost work day
      - kinder_glueck: +15
      - kinder_gesundheit: +10
  right:
    label: "Trotzdem zur Schule"
    effects:
      - eltern_nerven: -20
      - kinder_gesundheit: -15
      - kinder_glueck: -10

STORY:

  id: morgen_routine
  cards: [morgen_stress, hausaufgaben_drama]
  trigger:
    after_cards: 1
  insert_window: 3

POWER VISUALIZATION:

The power system uses vertical bars with percentage-based heights:
- Visual feedback with smooth CSS transitions
- Hover previews showing calculated changes
- Color-coded indicators (green/red) for positive/negative effects
- Responsive design adapting to screen size

Technical Implementation
------------------------

### File Structure:
```
src/
  main.js       # Entry point and game initialization
  engine.js     # Core game logic and state management
  loader.js     # YAML loading and parsing
  renderer.js   # UI rendering and visual effects

tests/
  *.js          # Automated testing suite

docs/
  images/       # Documentation screenshots

games/
  */            # Individual game folders
```

### Key Components:

**Engine (engine.js):**
- Power management with bounds checking
- Story trigger and completion tracking
- Deck management with story card exclusion
- Booster application and duration tracking

**Renderer (renderer.js):**
- Dynamic UI generation with modern styling
- Hover preview system with real-time calculations
- Power bar animations and visual feedback
- Responsive layout management

**Loader (loader.js):**
- YAML parsing and validation
- Asset path resolution
- Error handling for missing files

Development Notes
-----------------

- Everything is static, fetched via browser
- All YAML is parsed and resolved on load
- Assets are referenced by relative path from base defined in `game.yaml`
- Story cards are automatically excluded from main deck during initialization
- Hover previews parse effect strings (including "+/-" notation) for display
- Modern CSS features used for glassmorphism and smooth animations

Testing Framework
-----------------

Automated testing using Playwright for:
- Game logic verification
- Story sequence validation
- Power calculation accuracy
- UI interaction testing
- Responsive design verification

Run tests: `node tests/test_game.js`

Planned Features (Future Iterations)
------------------------------------

- Save/load system (via localStorage)
- In-browser editor for card/game creation
- Game selector UI with game previews
- Hot-reload of YAML during development
- More complex card conditions (flag logic, card history)
- Multiple endings with narrative tracking
- Animation effects for card transitions
- Multi-language support framework
- Advanced statistics and analytics

Contribution Model
------------------

- Each game is a standalone folder
- PRs can add new games under `/games/`
- Use comprehensive Card Generation Guide for new games
- Automated testing validates game logic
- Modern UI/UX standards maintained across games
- Documentation and examples provided for common patterns

Performance Considerations
--------------------------

- Lazy loading of game assets
- Efficient YAML parsing and caching
- Minimal DOM manipulation for smooth animations
- CSS-based animations over JavaScript where possible
- Responsive design patterns for cross-device compatibility