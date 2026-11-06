# GED Math Academy — Profesor Cristóbal

Independent bilingual GED Math learning prototype.

## Website
Target: **https://teach.j0se.me** (requires Cloudflare Pages deployment and custom domain setup).

## Included
- Spanish / English student interface.
- 20-question adaptive diagnostic using an introductory 30-question bank across basic operations, fractions and percentages, algebra, geometry, graphs and data.
- Per-topic analysis and personalized study priorities.
- Guided practice with **Profesor Cristóbal** (scripted teaching demo, **not yet connected to a live AI model**).
- Local classroom demonstration and CSV export.

## Limitations and safeguarding
- No server-side authentication, cloud database, secure multi-student school administration, or real AI service yet.
- Student data is stored only in **browser localStorage**. Use nicknames and test data only. Do not collect actual identifiable student records for school use.
- The short assessment does **not** generate an official GED score or validated readiness prediction.
- Not affiliated with GED Testing Service.

## Deploy with Cloudflare Pages
1. Cloudflare dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Select GitHub repository **J0seAlvarez/ged-math-academy**.
3. Framework: **None**. Production branch: **main**. Build command: **empty**. Output directory: **.**.
4. Deploy and test the Pages development URL.
5. Cloudflare Pages project → **Custom domains** → add **teach.j0se.me**. If zone j0se.me is in the same Cloudflare account, Cloudflare can usually set up its DNS automatically.
6. Confirm HTTPS loads the site. Do not change the main j0se.me domain.

## Next phases
1. Independently review/expand the math item bank with GED instructors.
2. Secure student login, school roles, and segregated progress history.
3. Server-side live AI teacher with deterministic answer checking and adaptive teaching.
4. Lesson mastery tests, realistic GED-style practice, accessibility and privacy controls.

Math exam references: https://www.ged.com/about-test/test-subjects/math.html

Cloudflare Pages: https://developers.cloudflare.com/pages/get-started/git-integration/
