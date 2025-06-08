# ChoiceCore

**ChoiceCore** is a minimalist game engine for building narrative games with binary choices — think *Reigns*, but config-driven and plugin-friendly.

Write your story in YAML. Drop it in a folder. The engine takes care of the rest.

> Build games that spiral into chaos... one choice at a time.

---

## 🔧 What It Is

- A client-only static web engine
- Loads self-contained games (cards, stories, assets) via URL param
- Powers, cards, boosters, and stories are all defined in YAML
- Designed to be developer-friendly and PR-ready

---

## 🧩 Plugin-Based Design

A game is just a folder:

```
games/
  my-cool-game/
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
```

You load it like this:

```
/index.html?game=my-cool-game
```

The engine will:
- Parse `game.yaml`
- Load all related content
- Start the game loop with your defined entry card

---

## ✍️ Define Your Game in YAML

### Example card

```yaml
id: mysterious_stranger
image: assets/images/stranger.png
description: "A hooded figure offers you a deal."
left:
  label: "Accept"
  effects:
    - gold: -10
    - power: +5
right:
  label: "Refuse"
  effects:
    - power: -3
follow_up: cursed_path
```

### Example booster

```yaml
id: adrenaline_rush
description: "Temporarily boosts all power caps to 150."
modifiers:
  - power_cap:
      power: "*"
      value: 150
duration: 3
```

---

## 🚧 Roadmap

- [x] Load games from plugin folders
- [x] YAML-defined cards, powers, boosters, stories
- [ ] Local save/load system
- [ ] Story tracking (flags, conditions)
- [ ] In-browser game editor
- [ ] Game gallery / selector UI
- [ ] GitHub PR support for new games

---

## 🤝 Contributing

Want to build your own game? Fork this repo and add your game folder under `games/`.

Pull requests are welcome — especially for new games. Add your name to your game metadata and we’ll shout you out (or blame you) accordingly.

---

## 🌀 Why?

Because sometimes you just want to make bad choices... fast.  
And because YAML is easier to write than code when your kingdom is falling apart.
