# Card Generation Guide for Eltern Simulator

This guide provides instructions for Large Language Models (LLMs) to generate cards for the Eltern Simulator game. Use this to help kids create their own parenting scenarios and game content.

## Game Overview

**Eltern Simulator** is a German parenting simulation game inspired by Reigns. Players make binary choices (left/right) that affect four power values representing parenting challenges.

## Power System (Resources)

The game tracks four powers that must stay within bounds (0-100 for most, 0-500 for money):

### 💰 **geld** (Money: 0-500)
- Represents family financial resources
- Lost through: purchases, medical expenses, activities, gifts
- Gained through: saving money, avoiding expenses, working extra

### 😊 **kinder_glueck** (Kids Happiness: 0-100)  
- Represents how happy and satisfied the children are
- Increased by: fun activities, getting desires fulfilled, quality time
- Decreased by: restrictions, disappointments, conflicts

### 🧠 **eltern_nerven** (Parent Nerves/Mental Health: 0-100)
- Represents parent stress and mental well-being
- Decreased by: difficult situations, time pressure, conflicts
- Increased by: successful resolutions, getting help, rest

### ❤️ **kinder_gesundheit** (Kids Health: 0-100)
- Represents physical and mental health of children
- Increased by: good choices, exercise, proper care
- Decreased by: risky behavior, poor choices, neglect

## Card Structure (YAML Format)

Every card must follow this exact structure:

```yaml
id: unique_card_name
image: placeholder.svg
description: "The scenario description in German quotation marks."
left:
  label: "Left choice description"
  effects:
    - geld: +/-amount
    - kinder_glueck: +/-amount
    - eltern_nerven: +/-amount
    - kinder_gesundheit: +/-amount
right:
  label: "Right choice description"
  effects:
    - geld: +/-amount
    - kinder_glueck: +/-amount
    - eltern_nerven: +/-amount
    - kinder_gesundheit: +/-amount
```

## Important Rules

### 1. **ID Naming**
- Use lowercase letters and underscores only
- Make it descriptive: `schulzeugnis_schlecht`, `geburtstag_planung`
- Must be unique across all cards

### 2. **Image**
- Always use: `image: placeholder.svg`
- Never change this line

### 3. **Description**
- Must be in German
- Use quotation marks around the entire description
- Should be 1-3 sentences describing the scenario
- Make it engaging and relatable for parents

### 4. **Choice Labels**
- Should be concise (max 6-8 words)
- Present clear alternatives
- Use German language
- Make the choice consequences somewhat predictable

### 5. **Effects Balance**
- **Every choice must affect at least 2 powers**
- Total effect magnitude should be 20-60 points across all powers
- Create meaningful trade-offs between choices
- Expensive choices: -50 to -300 geld
- Normal choices: -10 to -50 geld
- Small impacts: +/-5 to +/-15
- Medium impacts: +/-20 to +/-30
- Large impacts: +/-40 to +/-50

### 6. **Realistic Scenarios**
Focus on authentic parenting situations:
- Morning routines and time pressure
- School-related issues (grades, homework, bullying)
- Social conflicts and peer pressure
- Technology and screen time
- Money and spending decisions
- Health and safety choices
- Family time and activities
- Discipline and consequences

## Example Cards

### Good Example: Technology Conflict
```yaml
id: tablet_zeit_limit
image: placeholder.svg
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

### Good Example: Financial Decision
```yaml
id: klassenfahrt_teuer
image: placeholder.svg
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

## What NOT to Do

❌ **Avoid these mistakes:**

1. **Unrealistic scenarios**: Alien invasions, magic, fantasy elements
2. **Extreme situations**: Life-threatening emergencies, serious trauma
3. **Adult-only content**: Sexual content, violence, drugs, alcohol abuse
4. **One-sided choices**: Where one choice is obviously always better
5. **Minimal effects**: Changes less than 5 points total
6. **Unbalanced effects**: One choice changes 100+ points
7. **Missing effects**: Choices that don't affect any powers
8. **Wrong language**: English or other languages (must be German)
9. **Bad YAML**: Missing quotes, wrong indentation, syntax errors

## Age-Appropriate Content

Since kids will be creating content, ensure scenarios are:
- ✅ Family-friendly and educational
- ✅ Realistic parenting challenges
- ✅ Suitable for children to think about
- ✅ Teaching good decision-making
- ❌ No violence, inappropriate content, or scary themes

## Testing Your Card

Before submitting a card, check:
1. ✅ Valid YAML syntax (proper indentation, quotes)
2. ✅ Unique ID not used in other cards
3. ✅ German language throughout
4. ✅ Both choices affect multiple powers
5. ✅ Effect totals between 20-60 points
6. ✅ Realistic parenting scenario
7. ✅ Meaningful choice trade-offs

## Tips for Kids

When helping kids generate ideas:
- "What decisions do your parents make that are hard?"
- "When do you and your parents disagree about something?"
- "What costs money that kids want but parents worry about?"
- "What rules do parents have that kids don't always like?"
- Think about: school, friends, toys, food, bedtime, chores, screen time

Remember: Good cards create interesting dilemmas where both choices have pros and cons, just like real parenting!