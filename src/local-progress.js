// Local development only: never expose un-authenticated student records in production.
// The demo gate requires localhost AND explicit local opt-in via .dev.vars.
// In school production, replace this module with authenticated, org-scoped endpoints.
const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const result = (status, data) => new Response(JSON.stringify(data), { status, headers });
const idPattern = /^demo-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const questionCount = 30;
const skillForQid = [0,0,0,0,0,1,1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,4,4,4,4,4,0,1,2,3];
const isLocal = (u) => ["localhost", "127.0.0.1"].includes(u.hostname);
const validRequestOrigin = (request, u) => request.headers.get("Origin") === u.origin;
function cleanAttempt(data) {
  if (!data || !idPattern.test(data.learnerId) || typeof data.displayName !== "string" ||
      !/^[\p{L}\p{N} ._-]{1,30}$/u.test(data.displayName.trim()) ||
      !["es","en"].includes(data.locale) || !Array.isArray(data.answers) || data.answers.length !== 20) return null;
  const seen = new Set();
  const answers = [];
  for (const entry of data.answers) {
    if (!entry || !Number.isInteger(entry.qid) || entry.qid < 0 || entry.qid >= questionCount ||
        !Number.isInteger(entry.choice) || entry.choice < 0 || entry.choice > 3 ||
        typeof entry.correct !== "boolean" || seen.has(entry.qid)) return null;
    seen.add(entry.qid);
    answers.push({ qid: entry.qid, choice: entry.choice, correct: entry.correct, skill: skillForQid[entry.qid] });
  }
  return { learnerId: data.learnerId, displayName: data.displayName.trim(), locale: data.locale, answers };
}
export async function localProgress(request, env) {
  const url = new URL(request.url);
  if (!isLocal(url) || env.LOCAL_PROGRESS_DEMO !== "true") {
    return result(404, { error: "Not found" });
  }
  if (!env.ged_math_academy_db) return result(503, { error: "D1 database binding not configured" });
  if (!validRequestOrigin(request, url)) return result(403, { error: "Origin not permitted" });
  const db = env.ged_math_academy_db;
  if (request.method === "GET") {
    const learnerId = url.searchParams.get("learnerId");
    if (!idPattern.test(learnerId || "")) return result(400, { error: "Invalid demo ID" });
    try {
      const attempt = await db.prepare("SELECT id, started_at, completed_at, correct_answers, total_answers FROM assessment_attempts WHERE learner_id = ? ORDER BY started_at DESC, rowid DESC LIMIT 1").bind(learnerId).first();
      const skills = await db.prepare("SELECT skill_id, mastery_level, last_practiced_at FROM skill_progress WHERE learner_id = ? ORDER BY skill_id").bind(learnerId).all();
      return result(200, { latestAttempt: attempt || null, skills: skills.results || [] });
    } catch { return result(503, { error: "Local database unavailable; apply migrations first" }); }
  }
  if (request.method !== "POST") return result(405, { error: "Method not allowed" });
  if ((request.headers.get("Content-Type") || "").split(";")[0] !== "application/json") return result(415, { error: "Expected JSON" });
  if (Number(request.headers.get("Content-Length") || 0) > 12000) return result(413, { error: "Request too large" });
  let raw;
  try { raw = await request.text(); if (raw.length > 12000) return result(413, { error: "Request too large" }); } catch { return result(400, { error: "Cannot read request" }); }
  let data;
  try { data = cleanAttempt(JSON.parse(raw)); } catch { return result(400, { error: "Invalid JSON" }); }
  if (!data) return result(400, { error: "Invalid demo assessment" });
  const attemptId = crypto.randomUUID();
  const total = data.answers.length;
  const correct = data.answers.filter(x => x.correct).length;
  const statements = [
    db.prepare("INSERT OR IGNORE INTO learners (id, display_name, preferred_language) VALUES (?, ?, ?)").bind(data.learnerId, data.displayName, data.locale),
    db.prepare("UPDATE learners SET display_name = ?, preferred_language = ? WHERE id = ?").bind(data.displayName, data.locale, data.learnerId),
    db.prepare("INSERT INTO assessment_attempts (id, learner_id, assessment_version, completed_at, correct_answers, total_answers) VALUES (?, ?, 'demo-v1', datetime('now'), ?, ?)").bind(attemptId, data.learnerId, correct, total)
  ];
  data.answers.forEach(a => statements.push(db.prepare("INSERT INTO assessment_responses (id, attempt_id, question_id, skill_id, selected_answer, is_correct) VALUES (?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), attemptId, String(a.qid), String(a.skill), String(a.choice), a.correct ? 1 : 0)));
  const stats = [0,1,2,3,4].map(skill => {
    const subset = data.answers.filter(a => a.skill === skill);
    const passing = subset.filter(a => a.correct).length;
    return { skill, level: subset.length && passing / subset.length >= 0.8 ? 1 : 0 };
  });
  for (const stat of stats) statements.push(db.prepare(
    "INSERT INTO skill_progress (learner_id, skill_id, mastery_level, last_practiced_at) VALUES (?, ?, ?, datetime('now')) ON CONFLICT(learner_id, skill_id) DO UPDATE SET mastery_level = excluded.mastery_level, last_practiced_at = excluded.last_practiced_at"
  ).bind(data.learnerId, String(stat.skill), stat.level));
  try {
    await db.batch(statements);
    return result(201, { saved: true, attemptId, correct, total, warning: "Local demo only; not an official GED score" });
  } catch { return result(503, { error: "Local database write failed. Check migrations and binding." }); }
}
