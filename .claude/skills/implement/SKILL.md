---
name: implement
description: Implement phase of the RPI workflow. Executes an approved plan.md step by step, test first.
argument-hint: <spec folder, e.g. specs/001-product-catalog>
disable-model-invocation: true
---

Implement the task by executing `$ARGUMENTS/plan.md`.

Read `$ARGUMENTS/plan.md` first, and `$ARGUMENTS/research.md` for context.
Do not rely on prior context.

- Follow the plan step by step, in order. Don't improvise beyond it.
- For each step, write the failing test first and run it to see it fail,
  then write the code that makes it pass.
- After each step, run the tests or checks the plan specified and confirm
  they pass. Report the result in one or two lines before moving on.
- If reality doesn't match the plan (a file is missing, a check fails for a
  reason the plan didn't anticipate, an assumption turns out to be wrong),
  stop and flag it instead of working around it.
- Keep changes scoped to what the plan describes. Write the minimum code that
  solves the problem. Do not refactor, reformat, or "improve" adjacent code.
  Match the existing style.

When all steps are done and verified, run
`npm test && npm run lint && npm run typecheck && npm run build`, then prepare
the changes for review: summarize which files changed, what was verified, and
anything that deviated from the plan. Do not commit or push unless I ask.
