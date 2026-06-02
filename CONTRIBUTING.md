# Contributing to caseclosed

Two of us push to this repo independently from our own machines. To avoid
clobbering each other's work, **nobody pushes directly to `master`.** All
changes land through Pull Requests. `master` is protected on GitHub, so a
direct `git push` to it will be rejected.

## Day-to-day workflow

1. **Sync first.** Start every piece of work from an up-to-date `master`:

   ```bash
   git checkout master
   git pull --rebase
   ```

2. **Branch.** Create a short-lived branch named `<your-name>/<what>`:

   ```bash
   git checkout -b karan/fix-cart-total
   ```

   Use a prefix so it's obvious whose branch it is:

   - `karan/...`, `<collaborator>/...`
   - or by type: `feat/...`, `fix/...`, `chore/...`

3. **Commit and push the branch:**

   ```bash
   git push -u origin karan/fix-cart-total
   ```

4. **Open a PR** into `master`:

   ```bash
   gh pr create --fill
   ```

5. **Merge.** Once CI/checks (if any) pass, merge it. A review approval is
   **not required** — so you're never blocked waiting on the other person —
   but feel free to request one when a change is worth a second pair of eyes.
   Squash-merge is preferred to keep history clean:

   ```bash
   gh pr merge --squash --delete-branch
   ```

6. **Re-sync** your local `master` afterward:

   ```bash
   git checkout master && git pull --rebase
   ```

## Rules enforced by GitHub

- Direct pushes to `master` are blocked — PR only.
- `master` cannot be deleted.
- No force-pushes to `master` (no history rewrites).

## Keeping a long-running branch fresh

If `master` moves while your branch is open, rebase on top of it rather than
merging master back in:

```bash
git fetch origin
git rebase origin/master
git push --force-with-lease
```

## Secrets

`.env.local` (Shopify Storefront + Admin tokens) is git-ignored and must
**never** be committed. If you add a new env var, document it in the PR
description so the other person can add it to their own `.env.local`.
