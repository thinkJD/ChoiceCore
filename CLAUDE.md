# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChoiceCore is a minimalist game engine for narrative games with binary choices, inspired by Reigns. Games are loaded as plugins via URL parameters (e.g., `?game=my-cool-game`).

## Architecture

The engine consists of 4 core modules:
- `src/main.js` - Entry point, initializes loader/engine/renderer and handles UI events
- `src/loader.js` - Loads game configuration and YAML manifests from `games/` folders
- `src/engine.js` - Core game logic (powers, boosters, deck management, story triggers)
- `src/renderer.js` - UI rendering for cards, powers, and game over states

## Game Structure

Each game is a self-contained folder under `games/`:
```
games/
  game-name/
    game.yaml          # Main config (powers, entry card, file manifests)
    cards/*.yaml       # Individual cards with choices and effects
    boosters/*.yaml    # Temporary power modifiers
    stories/*.yaml     # Sequences of cards with triggers
    assets/images/     # Game assets
```

## Key Concepts

- **Cards**: Binary choices (left/right) with effects that modify powers
- **Powers**: Numeric values with min/max bounds (default 0-100)
- **Boosters**: Temporary modifiers that can change caps or effect multipliers
- **Stories**: Card sequences triggered by conditions (card count, completed stories)
- **Game Over**: Triggered when any power hits its min or max boundary

## Development Commands

This is a static web application with no build process. Serve locally with any HTTP server:
```bash
python -m http.server 8000
# or
npx serve
```

Access games via: `http://localhost:8000?game=game-name`

## Testing Games

To test a game:
1. Create game folder under `games/`
2. Define `game.yaml` with powers, entry_card, and file manifests
3. Create referenced YAML files for cards/boosters/stories
4. Load via `?game=your-game-name`

## YAML Schema Notes

- All file references in `game.yaml` must be explicit manifests (no auto-discovery)
- Powers can be strings (uses defaults) or objects with min/max values
- Card effects use object syntax: `{power_name: +/-value}`
- Booster modifiers support `power_cap` and `effect_modifier` types
- Story triggers support `after_cards` count and `requires_story_completed` arrays