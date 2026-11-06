# Test local D1 progress — Profesor Cristóbal

The progress API is strictly **localhost-only** and must be opted into with `LOCAL_PROGRESS_DEMO=true`. It is deliberately **unavailable on teach.j0se.me** and is **not safe for real student records** until authentication and school-level access controls are implemented.

### On Windows PowerShell

From `C:\Users\14157\ged-math-academy`:

1. Run `git pull --ff-only` to retrieve the update.
2. Create a local-only configuration file that is ignored by Git:
   `Set-Content -Path .dev.vars -Value 'LOCAL_PROGRESS_DEMO=true'`
3. Make sure you are using local D1 (your `wrangler.jsonc` has `remote: false` for its D1 binding).
4. If not already migrated: `npx.cmd wrangler d1 migrations apply ged-math-academy-db --local`.
5. Start the development server: `npx.cmd wrangler dev --local`.
6. Open `http://localhost:8787`, take the diagnostic with a made-up nickname, then press **Guardar en D1 local** (Save to local D1) on the results page.
7. Press **Ver progreso guardado** (View saved progress) to confirm the most recent record was saved.

To inspect the local D1 table in another PowerShell window:

```powershell
npx.cmd wrangler d1 execute ged-math-academy-db --local --command "SELECT id, correct_answers, total_answers, completed_at FROM assessment_attempts ORDER BY completed_at DESC LIMIT 5;"
```

The currently saved data is test data only. The endpoint uses self-claimed local demo IDs, so **it is not authenticated**. The stored correctness flags come from the browser, so they are not independently verified. No actual school records or official GED score can be derived from it.

Do not run `wrangler d1 migrations apply --remote` for this demo. Do not enable real student use before authenticated endpoints, server-side grading, and an institutional privacy review.
