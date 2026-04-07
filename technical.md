# Dhun — Technical Architecture

## Core Stack

Frontend:
- Next.js (web)
- Responsive system (mobile-first for dedication)

Backend:
- Node.js / Python
- Queue + async handling

Infra:
- Redis (task tracking)
- DB (Postgres / Mongo)
- Storage (S3 or CDN)

---

## External Services

- ACE 1.5 → audio generation
- Gemini → prompt generation
- Nano Banana → poster generation
- Razorpay → payments

---

## ACE API Flow

POST request:
https://api.wavespeed.ai/api/v3/wavespeed-ai/ace-step-1.5

Input:
- duration
- lyrics
- tags

Response:
- id
- status (pending/processing/completed)

Polling:
GET /predictions/{id}
GET /predictions/{id}/result

Webhook supported

---

## Generation Pipeline

1. User clicks Dedicate
2. Backend:
   - Generate prompt (Gemini)
   - Fire 3 parallel ACE requests
   - Fire poster request

3. Store:
   - task_ids
   - user_id
   - metadata

4. Poll or webhook:
   - update status
   - fetch outputs

---

## State System

Each generation object:

{
  id,
  user_id,
  prompt,
  tags,
  poster_url,
  tracks: [
    { id, status, audio_url }
  ],
  created_at,
  feedback
}

---

## Progressive Rendering

Frontend listens for:
- poster ready
- track1 ready
- track2 ready
- track3 ready

Updates UI in stages

---

## Payment System

- Coins stored in user wallet
- Deduct BEFORE generation

Edge cases:
- If fail → refund coins
- If retry → charge again

---

## Share System

Public route:
/d/{id}

Logic:
- If unpaid:
  - play 10 sec
- If paid:
  - full unlock

---

## Abuse Prevention

- Limit free coins (20)
- Require coins before generation
- Track user usage

---

## Feedback System

Capture:
- play
- skip
- replay
- purchase
- like/dislike

Store for training

---

## Storage

- Save all generations
- CDN for audio + images

---

## Mobile Handling

- Same backend
- UI adapts

---

## Future

- Realtime streaming (if ACE supports)
- Remix chains
- Ranking system