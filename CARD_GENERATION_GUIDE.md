# Card Generation Guide for ChoiceCore Games

This guide provides comprehensive instructions for Large Language Models (LLMs) and developers to create cards for ChoiceCore games. While focused on the Eltern Simulator example, these principles apply to any narrative choice game.

## ChoiceCore Engine Overview

**ChoiceCore** is a minimalist game engine for narrative games with binary choices, inspired by Reigns. The engine features:
- 🎮 Modern responsive UI with vertical power bars
- 🖱️ Hover preview system showing power changes
- 📖 Complex story sequencing with dependencies
- 🎯 Customizable power systems and game rules
- 📱 Cross-device compatibility

## Featured Game: Eltern Simulator

**Eltern Simulator** is a German parenting simulation where players navigate parenting challenges through binary choices affecting four power systems.

## Power System (Resources)

The game tracks four powers that must stay within bounds (0-100 for most, 0-500 for money):

### 💰 **geld** (Money: 0-500)
- Represents family financial resources
- Lost through: purchases, medical expenses, activities, gifts, missed work
- Gained through: saving money, avoiding expenses, working extra, smart financial choices

### 😊 **kinder_glueck** (Kids Happiness: 0-100)  
- Represents how happy and satisfied the children are
- Increased by: fun activities, getting desires fulfilled, quality time, freedom
- Decreased by: restrictions, disappointments, conflicts, unfairness

### 🧠 **eltern_nerven** (Parent Nerves/Mental Health: 0-100)
- Represents parent stress and mental well-being
- Decreased by: difficult situations, time pressure, conflicts, constant demands
- Increased by: successful resolutions, getting help, rest, cooperation

### ❤️ **kinder_gesundheit** (Kids Health: 0-100)
- Represents physical and mental health of children
- Increased by: good choices, exercise, proper care, safety, nutrition
- Decreased by: risky behavior, poor choices, neglect, unsafe situations

## Advanced Features

### Story Sequences
The engine supports complex narrative arcs through story sequences:
- **Story Cards**: Special cards that appear in predetermined order
- **Trigger Conditions**: Stories activate based on card count or story completion
- **Dependencies**: Stories can require other stories to complete first
- **Insertion Windows**: Stories inject cards within configurable ranges

### Hover Preview System
- **Real-time Feedback**: Players see exact power changes before choosing
- **Color Coding**: Green for positive effects, red for negative effects
- **Effect Parsing**: Supports both "+15" and "15" format in YAML

### Responsive Design
- **Vertical Power Bars**: Space-efficient layout eliminating scrolling
- **Mobile-First**: Works seamlessly across all device sizes
- **Modern Styling**: Gradient backgrounds and smooth animations

## Card Structure (YAML Format)

Every card must follow this exact structure:

```yaml
id: unique_card_name
image: assets/images/placeholder.svg
description: "The scenario description in target language with quotation marks."
left:
  label: "Left choice description"
  effects:
    - power_name: +/-amount
    - power_name: +/-amount
right:
  label: "Right choice description"
  effects:
    - power_name: +/-amount
    - power_name: +/-amount
```

### Advanced Card Features

```yaml
id: advanced_card
image: assets/images/placeholder.svg
description: "Scenario description."
left:
  label: "Choice A"
  effects:
    - geld: -50
    - kinder_glueck: +20
  follow_up: next_card_id  # Trigger specific next card
  booster: power_boost_id  # Apply temporary booster
right:
  label: "Choice B"
  effects:
    - eltern_nerven: -15
    - kinder_gesundheit: +10
```

## Story Structure (YAML Format)

**🆕 FINAL ARCHITECTURE: Self-Contained Stories**

Stories now contain ALL their cards (trigger cards and follow-up cards) in a single YAML file. This provides complete separation between main deck cards and story content.

### Complete Story Definition (Recommended)

Stories define both trigger cards (added to main deck) and story cards (mixed when accepted):

```yaml
id: story_name
title: "Story Title"
description: "Brief story description"
trigger:
  after_cards: 10                      # Trigger after N regular cards
  requires_story_completed: [story_a]  # Require other stories first
trigger_cards:
  # These cards are added to the main deck and can trigger the story
  - id: story_trigger_card
    image: placeholder.svg
    description: "The initial scenario that triggers the story"
    left:
      label: "Accept the challenge"
      effects:
        - power_name: +/-amount
      accept_story: story_name          # This choice accepts the story
    right:
      label: "Decline politely"
      effects:
        - power_name: +/-amount
      reject_story: story_name          # This choice rejects the story
story_cards:
  # These cards are only mixed into deck when story is accepted
  - id: story_follow_up_1
    image: placeholder.svg
    description: "A follow-up scenario"
    left:
      label: "Option A"
      effects:
        - power_name: +/-amount
    right:
      label: "Option B" 
      effects:
        - power_name: +/-amount
    probability: 0.75                   # 75% chance to appear
    mix_in_next: 15                     # Mix into next 15 cards
  - id: story_follow_up_2
    image: placeholder.svg
    description: "Another follow-up scenario"
    left:
      label: "Continue story"
      effects:
        - power_name: +/-amount
    right:
      label: "End story"
      effects:
        - power_name: +/-amount
    probability: 0.50                   # 50% chance to appear
    mix_in_next: 20                     # Mix into next 20 cards
```

### Embedded Sequential Stories

Stories with embedded cards in fixed sequence:

```yaml
id: story_name
title: "Story Title"
description: "Brief story description"
trigger:
  after_cards: 5                       # Trigger after N regular cards
  requires_story_completed: [story_a]  # Require other stories first
cards:
  - id: story_card_1
    image: placeholder.svg
    description: "First card in sequence"
    left:
      label: "Choice A"
      effects:
        - power_name: +/-amount
    right:
      label: "Choice B"
      effects:
        - power_name: +/-amount
  - id: story_card_2
    image: placeholder.svg
    description: "Second card in sequence"
    left:
      label: "Choice A"
      effects:
        - power_name: +/-amount
    right:
      label: "Choice B"
      effects:
        - power_name: +/-amount
insert_window: 3                       # Inject within next 3 draws
```

### Legacy Format (Backward Compatible)

The old format with separate card files is still supported:

```yaml
id: story_name
cards: [card1_id, card2_id, card3_id]  # References to separate card files
trigger:
  after_cards: 5                       # Trigger after N regular cards
  requires_story_completed: [story_a]  # Require other stories first
insert_window: 3                       # Inject within next 3 draws
```

### Self-Contained Story System Benefits

The final architecture provides:

- **🔒 Complete Separation**: Story cards never contaminate the main deck
- **🎯 Logical Flow**: Trigger cards appear in main deck, follow-ups only when accepted
- **🚫 No Premature Cards**: Story follow-ups never appear before story acceptance
- **🎮 Choice-Based Progression**: Accept/reject story mechanics work perfectly
- **📁 Single Source of Truth**: All story content (triggers + follow-ups) in one file
- **🎲 Probabilistic Mixing**: Story cards have individual appearance chances
- **📍 Dynamic Positioning**: Cards appear at random positions within specified ranges
- **⚖️ Balanced Gameplay**: Not all story cards appear every time
- **🔄 Varied Experiences**: Multiple playthroughs feel unique and fresh
- **🛠️ Easy Management**: Add/remove entire stories without touching main deck

**Probability Guidelines:**
- **Very Common (80-90%)**: Daily parenting situations (morning chaos, meal times)
- **Common (60-75%)**: Regular challenges (homework, bedtime, shopping requests)
- **Moderate (40-60%)**: Occasional issues (illness, social conflicts, special events)
- **Uncommon (25-40%)**: Challenging situations (behavior problems, accidents)
- **Rare (10-25%)**: Lucky breaks, unexpected positive events, major incidents

**Mix Range Guidelines:**
- **Early Game (8-15 cards)**: Immediate story continuation
- **Short Term (15-20 cards)**: Story elements within current session
- **Medium Term (20-30 cards)**: Story threads across multiple sessions
- **Long Term (30+ cards)**: Rare callbacks and long-term consequences

## Important Rules

### 1. **ID Naming & Card Classification**
- Use lowercase letters and underscores only
- Make it descriptive: `schulzeugnis_schlecht`, `geburtstag_planung`
- Must be unique across all cards and stories
- Consider namespace for story cards: `story_name_card1`

#### Deck Inventory & Classification System

**Tag each card by its total effect magnitude and rarity using filename prefixes:**

**Filename Format**: `[rarity]_[descriptive_name].yaml`

**Rarity Categories**:
- **`vc_`** = Very Common (80-90% appearance): Daily situations, minor choices
- **`c_`** = Common (60-75% appearance): Regular parenting challenges  
- **`m_`** = Moderate (40-60% appearance): Occasional complex decisions
- **`u_`** = Uncommon (25-40% appearance): Challenging or special situations
- **`r_`** = Rare (10-25% appearance): Major events, emergencies, lucky breaks

**Examples**:
- `vc_morgen_routine.yaml` - Daily morning stress (small effects)
- `c_hausaufgaben_streit.yaml` - Homework conflicts (medium effects)
- `m_geburtstag_planung.yaml` - Birthday party planning (higher effects)
- `u_kind_krank_notfall.yaml` - Emergency medical situation (large effects)
- `r_grosseltern_geschenk.yaml` - Unexpected inheritance (major positive effects)

**Effect Distribution Guidelines**:
- **Very Common**: Should make up 30-40% of deck
- **Common**: Should make up 25-35% of deck
- **Moderate**: Should make up 15-25% of deck  
- **Uncommon**: Should make up 10-15% of deck
- **Rare**: Should make up 5-10% of deck

This classification helps ensure proper game balance and prevents too many high-impact cards from appearing early in the game.

### 2. **Image Paths**
- Use relative paths: `assets/images/placeholder.svg`
- Consistent with game's asset structure
- Plan for future image implementation

### 3. **Description Writing**
- Must be in target language (German for Eltern Simulator)
- Use quotation marks around entire description
- 1-3 sentences describing the scenario
- Create engaging, relatable situations
- Avoid exposition; focus on immediate choice

### 4. **Choice Labels**
- Concise (max 6-8 words)
- Present clear alternatives
- Use target language consistently
- Make consequences somewhat predictable
- Create meaningful dilemmas

### 5. **Effects Balance**
- **Every choice must affect at least 2 powers**
- Create meaningful trade-offs between choices
- **Balance Principle**: High cost should provide significant benefit

#### Game Balance Guidelines

**Target Game Length**: 10+ cards average (not 3-4 cards!)

**Effect Magnitude by Card Rarity**:
- **Very Common (80-90% appearance)**: 15-25 total effect points
- **Common (60-75% appearance)**: 20-35 total effect points  
- **Moderate (40-60% appearance)**: 30-45 total effect points
- **Uncommon (25-40% appearance)**: 40-55 total effect points
- **Rare (10-25% appearance)**: 50-70 total effect points

**Money Effects (0-100 range)**:
- **Small purchases**: -3 to -8 geld (candy, small toys)
- **Medium purchases**: -10 to -20 geld (clothes, activities)
- **Large purchases**: -25 to -40 geld (electronics, trips)
- **Major expenses**: -50 to -70 geld (emergency, rare events)
- **Money gains**: +5 to +25 geld (gifts, savings, bonuses)

**Other Powers (0-100 range)**:
- **Small impacts**: +/-5 to +/-15
- **Medium impacts**: +/-15 to +/-25  
- **Large impacts**: +/-25 to +/-35
- **Major impacts**: +/-35 to +/-50 (rare cards only)

**Critical Balance Rules**:
1. **Money Economy**: Include positive money effects (25-30% of cards)
2. **Power Recovery**: Each power needs both positive and negative cards
3. **Sustainable Gameplay**: Average effect per card should allow 10+ card games
4. **Escalation Control**: Limit cards that can cause immediate game over

### 6. **Realistic Scenarios for Parenting Game**
Focus on authentic parenting situations:
- **Daily Routines**: Morning stress, bedtime, meals, chores
- **School Issues**: Grades, homework, bullying, teacher conflicts
- **Social Dynamics**: Peer pressure, friendships, social media
- **Technology**: Screen time, device limits, online safety
- **Financial Decisions**: Allowance, purchases, expensive activities
- **Health & Safety**: Medical decisions, risk assessment, accidents
- **Family Relationships**: Sibling conflicts, quality time, discipline
- **Development**: Independence, responsibility, life skills

## Advanced Game Design Concepts

### Story Arc Planning
When designing story sequences:

1. **Introduction**: Set up the narrative scenario
2. **Development**: Build tension and complexity
3. **Resolution**: Provide satisfying conclusion
4. **Consequences**: Show long-term effects

Example story progression:
```
Story: "Pet Snake Adventure"
1. schlange_wunsch (child wants pet snake)
2. schlangen_begegnung (encounter with actual snake)
3. [Possible future]: schlange_verantwortung (learning responsibility)
```

### Power Interaction Design
Create cards where powers interact meaningfully:
- **Money vs. Happiness**: Expensive choices that increase joy
- **Health vs. Freedom**: Safety restrictions vs. child autonomy
- **Parent Stress vs. Child Satisfaction**: Difficult but rewarding choices
- **Short-term vs. Long-term**: Immediate gratification vs. future benefits

### Difficulty Progression
Consider player progression through card design:
- **Early cards**: Simpler choices, lower stakes
- **Mid-game**: More complex dilemmas, higher impact
- **Advanced**: Multiple interconnected consequences

## Example Cards

### Excellent Example: Technology Conflict
```yaml
id: tablet_zeit_limit
image: assets/images/placeholder.svg
description: "Ihr Kind hat bereits 3 Stunden am Tablet gespielt und möchte 'nur noch 5 Minuten' weiterspielen. Morgen ist Schule und es sollte eigentlich schon im Bett sein."
left:
  label: "Sofort ausschalten - Regeln sind Regeln"
  effects:
    - kinder_glueck: -20
    - eltern_nerven: -15
    - kinder_gesundheit: +15
right:
  label: "Noch 10 Minuten, dann aber wirklich Schluss"
  effects:
    - kinder_glueck: +10
    - eltern_nerven: +5
    - kinder_gesundheit: -10
```

### Excellent Example: Financial Dilemma
```yaml
id: klassenfahrt_teuer
image: assets/images/placeholder.svg
description: "Die Klassenfahrt kostet 200€ pro Kind. Das ist viel Geld für die Familie, aber Ihr Kind möchte unbedingt mit den Freunden fahren und nicht ausgeschlossen sein."
left:
  label: "Klassenfahrt bezahlen - Kind soll nicht fehlen"
  effects:
    - geld: -200
    - kinder_glueck: +30
    - eltern_nerven: -10
right:
  label: "Zu teuer - alternative Aktivitäten planen"
  effects:
    - geld: -30
    - kinder_glueck: -25
    - eltern_nerven: -15
    - kinder_gesundheit: +10
```

### Example Self-Contained Story
```yaml
id: smartphone_saga
title: "Das Smartphone-Dilemma"
description: "Eine Geschichte über den ersten Smartphone-Wunsch und Verantwortung."
trigger:
  after_cards: 8
trigger_cards:
  # This card appears in the main deck and can trigger the story
  - id: smartphone_bitte
    image: placeholder.svg
    description: "Ihr 12-jähriges Kind bittet zum dritten Mal diese Woche um ein eigenes Smartphone. Alle Freunde haben schon eins."
    left:
      label: "Ja, aber mit strengen Regeln"
      effects:
        - geld: -300
        - kinder_glueck: +40
        - eltern_nerven: -20
      accept_story: smartphone_saga
    right:
      label: "Noch nicht alt genug dafür"
      effects:
        - kinder_glueck: -30
        - eltern_nerven: +10
        - kinder_gesundheit: +15
      reject_story: smartphone_saga
story_cards:
  # These cards only appear if the smartphone story is accepted
  - id: smartphone_regeln
    image: placeholder.svg
    description: "Nach der Smartphone-Entscheidung müssen klare Regeln aufgestellt werden. Bildschirmzeit, Apps und Kostenkontrolle sind wichtige Themen."
    left:
      label: "Strenge Regeln mit Kontrollen"
      effects:
        - kinder_glueck: -10
        - eltern_nerven: +15
        - kinder_gesundheit: +10
    right:
      label: "Vertrauen und Eigenverantwortung"
      effects:
        - kinder_glueck: +15
        - eltern_nerven: -10
        - kinder_gesundheit: -5
    probability: 0.80
    mix_in_next: 12
  - id: smartphone_probleme
    image: placeholder.svg
    description: "Das Smartphone führt zu Konflikten: nächtliche Nutzung, teure Apps und Ablenkung von Hausaufgaben."
    left:
      label: "Smartphone temporär einziehen"
      effects:
        - kinder_glueck: -25
        - eltern_nerven: -15
        - kinder_gesundheit: +20
    right:
      label: "Gemeinsam Lösungen finden"
      effects:
        - kinder_glueck: +10
        - eltern_nerven: -10
        - kinder_gesundheit: +5
    probability: 0.60
    mix_in_next: 20
```

## What NOT to Do

❌ **Avoid these critical mistakes:**

### Content Issues
1. **Unrealistic scenarios**: Fantasy elements, impossible situations
2. **Extreme situations**: Life-threatening emergencies, serious trauma, abuse
3. **Adult-only content**: Sexual content, violence, substance abuse
4. **Cultural insensitivity**: Stereotypes, inappropriate cultural references
5. **Wrong target audience**: Content inappropriate for family gaming

### Game Design Issues
1. **One-sided choices**: Where one choice is obviously always better
2. **No-win situations**: Both choices purely negative without purpose
3. **Minimal effects**: Changes less than 10 points total
4. **Unbalanced effects**: Single choice changes 80+ points
5. **Missing effects**: Choices that don't affect any powers
6. **Power violations**: Effects that could push beyond min/max bounds

### Technical Issues
1. **Bad YAML syntax**: Missing quotes, wrong indentation, invalid structure
2. **Wrong language**: Content not matching target language
3. **Duplicate IDs**: Reusing card or story identifiers
4. **Missing required fields**: Incomplete card structure
5. **Asset path errors**: Incorrect image references

## Quality Assurance Checklist

Before submitting content, verify:

### Technical Validation
- [ ] ✅ Valid YAML syntax (proper indentation, quotes)
- [ ] ✅ Unique ID not used in other cards/stories
- [ ] ✅ Required fields present (id, image, description, left, right)
- [ ] ✅ Correct asset path format
- [ ] ✅ Effects use proper power names

### Content Quality
- [ ] ✅ Target language used throughout
- [ ] ✅ Both choices affect multiple powers (minimum 2)
- [ ] ✅ Effect totals between 20-60 points per choice
- [ ] ✅ Realistic, age-appropriate scenario
- [ ] ✅ Meaningful choice trade-offs
- [ ] ✅ Engaging, relatable narrative

### Game Balance
- [ ] ✅ Effects won't cause immediate game over
- [ ] ✅ Choices present genuine dilemma
- [ ] ✅ Power changes make thematic sense
- [ ] ✅ Scenario fits overall game tone
- [ ] ✅ Complexity appropriate for target audience

## Testing and Validation

### Game Balance Testing
Use the Monte Carlo simulation tools to validate game balance:
```bash
# Run simulation analysis
cd tools
node monte_carlo_simulation.js eltern_simulator 2000 analysis.json

# Generate visualization  
node trajectory_visualizer.js analysis.json report.html

# Extended analysis (1 hour)
node run_extended_analysis.js eltern_simulator 60
```

**Target Metrics**:
- **Average game length**: 8-12 cards (not 3-4!)
- **Game over distribution**: No single reason >40% 
- **Power balance**: All powers should cause game over ~20-30% each
- **Money sustainability**: Positive money effects in 25-30% of cards

### Automated Testing
The engine includes comprehensive testing:
```bash
node tests/test_game.js       # Full game logic validation
node tests/test_detailed.js   # Story sequence verification
```

### Manual Testing
1. Load game: `http://localhost:8000?game=your_game`
2. Play through multiple scenarios
3. Verify hover previews show correct values
4. Test on different device sizes
5. Confirm story triggers work properly

### Community Feedback
- Playtest with target audience
- Gather feedback on choice difficulty
- Verify cultural appropriateness
- Check language quality and clarity

## Advanced Topics

### Creating New Game Themes
To create games beyond parenting simulation:

1. **Define Power System**: 3-5 interconnected resources
2. **Choose Setting**: Historical, fantasy, modern, etc.
3. **Identify Core Conflicts**: Central tensions driving choices
4. **Plan Story Arcs**: Multi-card narratives with progression
5. **Balance Mechanics**: Ensure engaging risk/reward

### Multi-Language Support
For international games:
- Consistent tone and cultural adaptation
- Regional scenario variations
- Appropriate cultural references
- Language-specific power naming

### Accessibility Considerations
- Clear, simple language
- Logical choice progression
- Consistent visual design
- Screen reader compatibility

## Tips for Collaborative Creation

### Working with Kids
When helping children generate content ideas:
- "What decisions do your parents make that seem hard?"
- "When do you and your parents disagree about something?"
- "What costs money that kids want but parents worry about?"
- "What rules do parents have that kids don't always understand?"
- Focus areas: school, friends, toys, food, bedtime, chores, screen time

### Working with Educators
- Align with learning objectives
- Include real-world skills
- Promote critical thinking
- Age-appropriate complexity
- Cultural sensitivity

### Community Guidelines
- Family-friendly content standards
- Collaborative review process
- Regular content quality audits
- Clear attribution for contributors
- Ongoing balance adjustments

## Future Enhancements

The engine supports extensibility for:
- **Save/Load Systems**: Persistent game progress
- **Achievement Systems**: Goal-based progression
- **Dynamic Difficulty**: Adaptive challenge levels
- **Multiplayer Features**: Collaborative decision-making
- **Analytics**: Player behavior insights

Remember: Great cards create meaningful dilemmas where both choices have clear pros and cons, reflecting the complexity of real-world decision-making!