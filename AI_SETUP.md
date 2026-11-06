# Live AI teacher setup (pilot)

**Status:** safe-by-default: the API refuses requests until you configure its secrets and enable the pilot.

This project has a Cloudflare Worker at `src/worker.js` with a static assets folder at `public/`. The worker serves `/api/tutor` on the same domain as the website, so no API key is exposed to the browser.

## Deploy

1. Cloudflare Workers & Pages → `ged-math-academy` → **Settings → Build**.
2. Confirm Git integration points to `J0seAlvarez/ged-math-academy` (`main` branch).
3. Configure the Worker build/deploy to use the repository's **wrangler.jsonc** (with `npx wrangler deploy` if it requires a command); the assets folder is `./public`. Check the Cloudflare build logs and confirm the website still loads on `teach.j0se.me`.
4. Under **Settings → Variables and Secrets**, create two **encrypted Secrets**:
   - `OPENAI_API_KEY`: your OpenAI API project key.
   - `TUTOR_ACCESS_CODE`: a unique long random code (at least 12 characters) to share *only* with trusted pilot testers. Do not place it in GitHub.
5. Set the Worker **variable** `TUTOR_ENABLED` to `true` (it is deliberately omitted from `wrangler.jsonc` so the pilot starts disabled). Keep the pilot disabled until the secrets and rate limiting are ready. On future deployments, confirm Cloudflare retains that variable and the two secrets.
6. Set a small OpenAI project budget and configure Cloudflare rate-limiting/WAF rules for `/api/tutor` before public testing. A shared pilot code is a short-term gate, **not user authentication, account-based quotas, or a substitute for server-side abuse prevention**.
7. Open `teach.j0se.me` and use **Hablar con Cristóbal**. Enter the temporary pilot access code, select a math topic and ask a question.

Do **not** upload a key to a chat, publish it in a commit, or put it in HTML or JavaScript browser assets.

## Privacy and educational limitations

The browser demo uses localStorage for nicknames and assessment results. The chat history is kept in browser memory while the page is open. The backend transmits the recent messages to OpenAI with `store:false` and does not attach the student's nickname, but this does **not** replace an institutional privacy review. Do not enter real student records, private personal information, or use the classroom demo with enrolled students.

The existing 20-question assessment is an introductory diagnostic, not a validated readiness prediction or official GED score. Tutor responses can make mistakes: use independent math checks for tests, grades, and mastery decisions.

## Routes and configuration

- `GET /`: static browser application
- `POST /api/tutor`: secured pilot tutor request, JSON `{topic:0..4,locale:"es"|"en",messages:[{role:"user",content:"..."}]}`
- Request header: `X-Tutor-Code`

For the production school version, replace the pilot code with authenticated individual accounts, per-student quotas, classroom isolation, and verified scoring. See [Cloudflare Workers static assets](https://developers.cloudflare.com/workers/static-assets/binding/) and [Cloudflare secrets](https://developers.cloudflare.com/workers/configuration/secrets/).
