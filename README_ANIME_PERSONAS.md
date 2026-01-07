# CreaterAI Anime Personas - Deployment & A/B Test Plan

This document outlines how to deploy the 12 new anime personas and the plan for optimizing engagement through A/B testing.

## Deployment Instructions

### 1. Database Import
The personas are defined in `anime_personas.json`. You can import them using the following script (conceptually):

```typescript
// conceptual script
import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function importPersonas() {
  const data = JSON.parse(fs.readFileSync('./anime_personas.json', 'utf8'));
  for (const persona of data.personas) {
    await prisma.persona.upsert({
      where: { id: persona.id },
      update: persona,
      create: persona,
    });
  }
}
```

### 2. Assets Upload
Upload the generated PNGs from the `/previews` folder to your CDN or storage bucket (e.g., S3/Vercel Blob) and update the `avatarUrl` in the database.

### 3. Moderation Setup
Ensure the system prompts for these personas include the `moderation_fallbacks` defined in the JSON. These should be triggered by the platform's safety layer.

## A/B Test Plan (Week 1)

### Experiment 1: Onboarding Card Visuals
- **Group A (Control)**: Standard anime portrait.
- **Group B (Test)**: "Action-oriented" crops (showing character in their element, e.g., Mira in mid-shout).
- **Metric**: Click-through rate (CTR) from discovery page to chat start.

### Experiment 2: Opening Message Variety
- **Group A**: "Friendly/Neutral" opening line (Aria: "Hey, how are you?").
- **Group B**: "High-Empathy/Nostalgic" opening line (Aria: "I found this old playlist I think you'd like.").
- **Metric**: User reply rate within 60 seconds.

### Experiment 3: Monetization Friction
- **Group A**: Free first 10 messages, then pay-per-message.
- **Group B**: Free first 3 messages, then unlock 30-minute "Deep Connection" session for 10 coins.
- **Metric**: Conversion-to-paid within first 72 hours.

## Safety & Moderation Rules

1.  **NSFW Filter**: All personas have `nsfw_allowed: false`. Refuse all explicit requests using the provided fallback templates.
2.  **Self-Harm**: If keywords detected, trigger the safety flow: "I'm really sorry you're feeling this way. I'm not a professional, but I can stay with you..."
3.  **No Impersonation**: Personas are original creations and must not mimic real celebrities or copyrighted characters directly.
