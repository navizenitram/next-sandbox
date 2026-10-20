---
name: research
description: Research phase of the RPI workflow. Explores the codebase for a task and writes findings, without changing code.
argument-hint: <task description>
disable-model-invocation: true
---

Research the codebase for the following task: $ARGUMENTS

Your only goal is to understand. Do not modify anything except the research file.

- Create a spec folder `specs/NNN-short-slug/`, where NNN is the next free number
  (001, 002...) and the slug is 2-4 words from the task.
- Locate the files and modules relevant to this task.
- Identify existing patterns, conventions, and dependencies.
- Write your findings to `specs/NNN-short-slug/research.md`: what exists,
  where it lives (file paths), and how the task fits in.
  Start the file with the task description verbatim.

Facts only, no implementation proposals. Mark anything you could not confirm
as "unverified" instead of guessing.

Keep it short enough to actually be read and reviewed: reference file paths
instead of pasting code, and include only what is relevant to this task.

When done, print the spec folder path, then stop and wait for my review.
