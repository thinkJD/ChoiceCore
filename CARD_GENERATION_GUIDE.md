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

### Probabilistic Stories (Recommended)

Stories create dynamic narrative experiences with probabilistic card mixing:

```yaml
id: story_name
trigger:
  after_cards: 10                      # Trigger after N regular cards
  requires_story_completed: [story_a]  # Require other stories first
cards:
  - id: story_card_1
    probability: 0.75                  # 75% chance to appear
    mix_in_next: 15                    # Mix into next 15 cards
  - id: story_card_2
    probability: 0.50                  # 50% chance to appear
    mix_in_next: 20                    # Mix into next 20 cards
  - id: rare_event_card
    probability: 0.25                  # 25% chance (rare event)
    mix_in_next: 30                    # Mix into next 30 cards
```

### Legacy Sequential Stories (Backward Compatible)

```yaml
id: story_name
cards: [card1_id, card2_id, card3_id]  # Sequence of story cards
trigger:
  after_cards: 5                       # Trigger after N regular cards
  requires_story_completed: [story_a]  # Require other stories first
insert_window: 3                       # Inject within next 3 draws
```

### Probabilistic Story System Benefits

The new probabilistic system provides:

- **🎲 Replayability**: Each playthrough has different story experiences
- **🎯 Realistic Frequency**: Common events (85%) vs rare events (25%)
- **📍 Dynamic Positioning**: Cards appear at random positions within specified ranges
- **⚖️ Balanced Gameplay**: Not all story cards appear every time
- **🔄 Varied Experiences**: Multiple playthroughs feel unique and fresh

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

### 1. **ID Naming**
- Use lowercase letters and underscores only
- Make it descriptive: `schulzeugnis_schlecht`, `geburtstag_planung`
- Must be unique across all cards and stories
- Consider namespace for story cards: `story_name_card1`

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
- Total effect magnitude should be 20-60 points across all powers
- Create meaningful trade-offs between choices
- **Money Effects:**
  - Expensive choices: -50 to -300 geld
  - Normal purchases: -10 to -50 geld
  - Major financial impact: -100 to -200 geld
- **Other Powers:**
  - Small impacts: +/-5 to +/-15
  - Medium impacts: +/-20 to +/-30
  - Large impacts: +/-40 to +/-50
- **Balance Principle**: High cost should provide significant benefit

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

### Example Story Sequence
```yaml
# Story definition
id: smartphone_saga
cards: [smartphone_bitte, smartphone_vertrag, smartphone_konsequenzen]
trigger:
  after_cards: 8
insert_window: 4

# Card 1: Initial request
id: smartphone_bitte
image: assets/images/placeholder.svg
description: "Ihr 12-jähriges Kind bittet zum dritten Mal diese Woche um ein eigenes Smartphone. Alle Freunde haben schon eins."
left:
  label: "Ja, aber mit strengen Regeln"
  effects:
    - geld: -300
    - kinder_glueck: +40
    - eltern_nerven: -20
right:
  label: "Noch nicht alt genug dafür"
  effects:
    - kinder_glueck: -30
    - eltern_nerven: +10
    - kinder_gesundheit: +15

# Card 2: Responsibility discussion
id: smartphone_vertrag
image: assets/images/placeholder.svg
description: "Nach der Smartphone-Entscheidung müssen klare Regeln aufgestellt werden. Bildschirmzeit, Apps und Kostenkontrolle sind wichtige Themen."
# ... effects continue the narrative
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