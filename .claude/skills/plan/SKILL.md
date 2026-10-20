---
name: plan
description: Plan phase of the RPI workflow. Turns a reviewed research.md into an ordered, test-first plan.
argument-hint: <spec folder, e.g. specs/001-product-catalog>
disable-model-invocation: true
---

Create a plan for the task described in `$ARGUMENTS/research.md`.

Re-read `$ARGUMENTS/research.md` and AGENTS.md first; do not rely on prior context.
Do not write implementation code yet. Do not modify anything except `$ARGUMENTS/plan.md`.
Your goal is a clear, reviewable plan.

- Break the task into ordered, concrete steps.
- For each step, note which files change, which unit test proves it
  (test first, per AGENTS.md), and how you'll verify it.
- State your assumptions explicitly. If there are real tradeoffs between
  approaches, or a simpler option exists, say so briefly.
- Define success criteria for the whole task (tests passing, behavior observed).
- List open questions for me. Ask before guessing.

Keep it short enough to actually be read and reviewed: one or two lines per
step, no padding, no code beyond what is needed to make a step unambiguous.

When done, stop and wait for my approval.
