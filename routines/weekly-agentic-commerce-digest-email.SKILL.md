---
name: weekly-agentic-commerce-digest-email
description: Every Monday 8am: draft a Gmail email to noam.catherine@chyp.com with the latest site link, the past week's biggest agentic commerce/payments news, and any structural changes made to the site itself.
---

You maintain a weekly email digest for a watch site on agentic commerce and payments. This task runs right after the daily `agentic-commerce-watch-refresh` job (also scheduled for 8am), so the site should already reflect today's edition.

## What to do, every run
1. Read the current live site content. The canonical copy is the Claude Artifact at `https://claude.ai/code/artifact/bf805b79-fc96-4a9c-9008-4b527cc33b46` (fetch it, or read the local repo copy at `C:\Users\FU039NCE\OneDrive - Fime SAS\Documents\Veille\AgenticMonitoring\index.html` if that's faster/more reliable, but the Claude Artifact above is the source of truth). The same content, when the user has pushed it, is also live at `https://mushahime.github.io/AgenticMonitoring/`, but don't assume that copy is current, it only updates when someone manually pushes.
2. Split the digest into two parts:
   - **News**: identify the biggest, most consequential news items from roughly the last 7 days, pulling from "This Fortnight", "By major player" (if present), the Home "Key figures"/"Top of the stack", Network & Payments, Emerging Rails & Stablecoins, and Commerce. Prioritize genuinely major developments (a big funding round, a major protocol launch, a network/PSP going live with something, a notable research finding) over minor items — roughly 5-8 highlights, not an exhaustive list.
   - **Site changes**: separately note any structural/design changes made to the watch site itself in the last 7 days — new or renamed pages, new sections (e.g. a new Timeline or a page split like Emerging Rails being carved out of Network & Payments), navigation changes, or other non-routine edits. You don't have version history, so infer this from anything in the current site that reads as new-since-last-week from context (or, if you're running right after a session where such changes were made, mention them plainly). If nothing structural changed, omit this part entirely rather than inventing filler.
3. Write a short, scannable email:
   - Subject: "Agentic Commerce & Payments - Weekly Digest - [today's date]"
   - Body: one line linking to the live site (`https://claude.ai/code/artifact/bf805b79-fc96-4a9c-9008-4b527cc33b46`), then (if applicable) a short "Site changes" bulleted list, then a "This week's news" bulleted list (one line each: what happened, who, and why it matters). Plain text, no marketing fluff.
4. Create a Gmail draft (do NOT send it, there is no send capability and none should be used even if one existed) addressed to `noam.catherine@chyp.com`, with that subject and body, using the create_draft tool.
5. Finish with a one-line confirmation that the draft was created, and how many highlights (news + site changes) it contains.

If the site hasn't materially changed in the last 7 days, still create a short draft noting that, with the link, rather than skipping the week entirely.

Do not ask for confirmation before creating the draft (draft creation is safe, no send occurs). Never attempt to send the email under any circumstance, always stop at the draft stage.