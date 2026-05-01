# /ship — Dirt Rich feature shipping workflow

Guide the user through the full feature workflow:

## Step 1 — Feature description
Ask the user: "What are you building? Describe it in plain language."
Wait for their answer before continuing.

## Step 2 — Plan
Produce a concise implementation plan:
- Which files will change and why
- Any data model impact (does the plant/seed object shape change?)
- Any Supabase persistence impact (new keys, new tables?)
- Edge cases to watch for

Ask: "Does this plan look right? Say go to implement, or redirect me."
Wait for approval before writing any code.

## Step 3 — Implement
Make the changes. Keep edits minimal — only what the plan described.

## Step 4 — Review
Run /review on the changes. Surface any bugs, quality issues, or data shape mismatches found.

## Step 5 — Ship
If review passes, commit and push to the current branch with a clear commit message.
Report back: what changed, what file(s), and that it's pushed.
