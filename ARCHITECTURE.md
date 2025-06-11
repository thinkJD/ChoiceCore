REIGNS-STYLE GAME ENGINE — ARCHITECTURE DOCUMENT
================================================

Overview
--------

This is a static, client-only game engine inspired by the Reigns series. Games are loaded
as plugins, each in its own folder, fully self-contained. The engine is written with 
human and AI collaboration in mind: configuration is YAML-based, logic is modular, and 
code generation should be predictable.

Goals:
- Run entirely in the browser
- Load game via URL param (?game=game_name)
- Accept GitHub PRs with new games
- Future-proof for save games, UI editors, and modding

Core Concepts
-------------

- Cards:
  - Two binary choices (left/right)
  - Optional image (referenced by relative URL)
  - Description text
  - Choice-based effects: adjust powers, trigger follow-ups, apply boosters
  - Can be part of a story

+ Powers:
+  - Numeric values with per-power bounds (default 0–100 if not specified in game.yaml)
+  - Game over when out of bounds (using configured bounds, unless modified)
+  - Boosters can temporarily override cap

- Boosters:
  - Active for N rounds
  - Can:
    - Modify caps (e.g. raise money max to 200)
    - Modify effects (e.g. halve losses)
    - Affect specific powers or global logic

- Stories:
  - Sequence of cards
  - Triggered by card count, flags, or prior completions
  - Injected into next N draws when activated

Plugin Structure
----------------

Each game is a folder under `/games/`. Example:

  /games/
    pirate_adventure/
      game.yaml
      cards/
        *.yaml
      boosters/
        *.yaml
      stories/
        *.yaml
      assets/
        images/
          *.png

`game.yaml` defines:
--------------------

  name: "Pirate Adventure"
  entry_card: intro_card
  powers:
    # Each power can be defined as a string (name) or an object with name, min, and max values.
    - name: morale
      min: 0
      max: 100
    - name: gold
      min: 0
      max: 100
    - name: hull
      min: 0
      max: 100
  load:
    # Each entry must be an explicit list of YAML files (manifest) maintained by the game author.
    cards:
      - "cards/intro_card.yaml"
      - "cards/blacksmith_offer.yaml"
      - "cards/..."
    boosters:
      - "boosters/golden_chalice.yaml"
      - "boosters/..."
    stories:
      - "stories/royal_wedding.yaml"
      - "stories/..."
  assets:
    base_path: "assets/images/"

Game Engine Flow
----------------

1. Parse URL param (?game=...)
2. Fetch /games/{game}/game.yaml
3. Load all referenced YAML files
4. Construct:
   - Powers
   - Initial draw stack
   - Story triggers
   - Booster registry
5. Begin game loop with entry_card
6. At each step:
   - Render current card
   - Apply choice effects
   - Modify powers
   - Trigger any stories/boosters
   - Check game over

YAML Object Examples
--------------------

CARD:

  id: blacksmith_offer
  image: assets/images/blacksmith.png
  description: "A blacksmith offers to improve your sword for gold."
  left:
    label: "Accept"
    effects:
      - gold: -10
      - morale: +5
    follow_up: enhanced_blade
  right:
    label: "Decline"
    effects:
      - morale: -3
  tags: ["economy", "blacksmith"]

BOOSTER:

  id: golden_chalice
  name: "Golden Chalice"
  description: "Raises gold cap to 200 and reduces all gold loss by 50%."
  modifiers:
    - power_cap:
        power: gold
        value: 200
    - effect_modifier:
        power: gold
        type: loss
        multiplier: 0.5
  duration: 5

STORY:

  id: royal_wedding
  title: "Royal Wedding"
  description: "A chain of events around an arranged marriage."
  trigger:
    after_cards: 20
    requires_story_completed: [northern_invasion]
  cards:
    - wedding_invitation
    - marriage_negotiation
    - ceremony_drama
  insert_window: 5

Development Notes
-----------------

- Everything is static, fetched via browser
- All YAML is parsed and resolved on load
- Assets are referenced by relative path from base defined in `game.yaml`
- Save/load, state visualization, modding, and editor support are future goals

Planned Features (Future Iterations)
------------------------------------

- Save/load system (likely via localStorage)
- In-browser editor for card/game creation
- Game selector UI
- Hot-reload of YAML during development
- More complex card conditions (flag logic, card history, etc.)
- Multiple endings
- Tags and filters
- Modding support

Contribution Model
------------------

- Each game is a standalone folder
- PRs can add new games under `/games/`
- Linting/validation should be added for YAML schema compatibility
- Game metadata can be added for versioning later
