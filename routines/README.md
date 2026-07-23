# Routines

Versioned copies of the two Claude Code scheduled tasks that maintain the "Watch - Agentic Commerce & Payments" Artifact and its weekly digest email.

- `agentic-commerce-watch-refresh.SKILL.md` — daily 8am refresh of the live Artifact (adds/removes links and figures, maintains the Timeline and badge system).
- `weekly-agentic-commerce-digest-email.SKILL.md` — every Monday 8am, drafts a Gmail summary of the week's news and any site changes.

These are copies kept here for backup/versioning. The actual scheduled tasks live locally at `C:\Users\<user>\.claude\scheduled-tasks\<taskId>\SKILL.md` and only run from there — copying these files elsewhere doesn't make them run; the scheduled task itself needs to be recreated (same file content) wherever it should execute from, e.g. after a handover to a different Claude account.
