// ─── SOMARS Points Tracker · app.js ─────────────────────────────────────────

// ── State ─────────────────────────────────────────────────────────────────────
let members = [];
let selectedMemberId = null;

// ── Init ──────────────────────────────────────────────────────────────────────
function init() {
  const saved = localStorage.getItem("somars_members");
  members = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_MEMBERS));
  generateStars();
  renderAll();
}

function save() {
  localStorage.setItem("somars_members", JSON.stringify(members));
}

// ── Stars background ──────────────────────────────────────────────────────────
function generateStars() {
  const container = document.getElementById("stars");
  for (let i = 0; i < 180; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.left   = Math.random() * 100 + "vw";
    star.style.top    = Math.random() * 100 + "vh";
    const size = Math.random() * 2.5 + 0.5;
    star.style.width  = size + "px";
    star.style.height = size + "px";
    star.style.animationDelay    = Math.random() * 4 + "s";
    star.style.animationDuration = (Math.random() * 3 + 2) + "s";
    container.appendChild(star);
  }
}

// ── Page routing ──────────────────────────────────────────────────────────────
function showPage(name) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("page-" + name).classList.add("active");
  document.getElementById("nav-" + name).classList.add("active");
  renderAll();
}

// ── Render all ────────────────────────────────────────────────────────────────
function renderAll() {
  renderHomeStats();
  renderLeaderboard();
  renderAwardsPreview();
  renderMembersGrid();
  renderAwardsFull();
}

// ── Home stats ────────────────────────────────────────────────────────────────
function renderHomeStats() {
  const total = members.reduce((s, m) => s + m.points, 0);
  document.getElementById("total-points").textContent = total.toLocaleString();
  document.getElementById("active-members").textContent = members.length;

  // awards unlocked = number of award tiers that ANY member has hit individually
  // (alternatively: total points vs tiers — let's use total)
  const unlocked = AWARDS.filter(a => total >= a.points).length;
  document.getElementById("awards-unlocked").textContent = unlocked;

  const next = AWARDS.find(a => total < a.points);
  document.getElementById("next-award-pts").textContent = next
    ? next.points.toLocaleString()
    : "MAX ✅";
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
function renderLeaderboard() {
  const sorted = [...members].sort((a, b) => b.points - a.points);
  const el = document.getElementById("leaderboard");
  el.innerHTML = sorted.map((m, i) => {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`;
    const bar = Math.max(2, members.length > 0 && sorted[0].points > 0
      ? Math.round((m.points / sorted[0].points) * 100) : 2);
    return `
      <div class="lb-row" onclick="openMemberModal(${m.id})">
        <span class="lb-rank">${medal}</span>
        <span class="lb-icon">${m.icon}</span>
        <span class="lb-name">${escHtml(m.name)}</span>
        <div class="lb-bar-wrap"><div class="lb-bar" style="width:${bar}%"></div></div>
        <span class="lb-pts">${m.points.toLocaleString()} pts</span>
      </div>`;
  }).join("");
}

// ── Awards preview (home) ─────────────────────────────────────────────────────
function renderAwardsPreview() {
  const total = members.reduce((s, m) => s + m.points, 0);
  const el = document.getElementById("awards-preview");
  el.innerHTML = AWARDS.slice(0, 6).map(a => {
    const done = total >= a.points;
    return `
      <div class="award-card ${done ? "award-done" : ""} ${a.special ? "award-special" : ""}">
        <div class="award-icon">${a.icon}</div>
        <div class="award-pts" style="color:${a.color}">${a.points.toLocaleString()} pts</div>
        <div class="award-title">${a.title}</div>
        ${done ? '<div class="award-badge">✅ UNLOCKED</div>' : ""}
      </div>`;
  }).join("");
}

// ── Members grid ──────────────────────────────────────────────────────────────
function renderMembersGrid() {
  const el = document.getElementById("members-grid");
  el.innerHTML = members.map(m => {
    const award = [...AWARDS].reverse().find(a => m.points >= a.points);
    return `
      <div class="member-card" onclick="openMemberModal(${m.id})">
        <div class="member-icon">${m.icon}</div>
        <div class="member-name">${escHtml(m.name)}</div>
        <div class="member-pts">${m.points.toLocaleString()} <span>pts</span></div>
        ${award ? `<div class="member-rank" style="color:${award.color}">${award.icon} ${award.title}</div>` : '<div class="member-rank">🚦 No rank yet</div>'}
        <div class="member-edit-hint">Click to add points</div>
      </div>`;
  }).join("");
}

// ── Awards full page ──────────────────────────────────────────────────────────
function renderAwardsFull() {
  const total = members.reduce((s, m) => s + m.points, 0);
  const el = document.getElementById("awards-full");
  el.innerHTML = AWARDS.map(a => {
    const done = total >= a.points;
    const pct  = Math.min(100, total > 0 ? Math.round((total / a.points) * 100) : 0);
    return `
      <div class="award-full-card ${done ? "award-done" : ""} ${a.special ? "award-special" : ""}">
        <div class="afc-left">
          <div class="afc-icon">${a.icon}</div>
        </div>
        <div class="afc-body">
          <div class="afc-title">${a.title}
            ${a.special ? '<span class="special-badge">⭐ SPECIAL</span>' : ""}
            ${done ? '<span class="unlocked-badge">✅ UNLOCKED</span>' : ""}
          </div>
          <div class="afc-pts" style="color:${a.color}">${a.points.toLocaleString()} collective points required</div>
          <div class="afc-desc">${a.desc}</div>
          <div class="afc-progress-wrap">
            <div class="afc-progress-bar" style="width:${pct}%; background:${a.color}"></div>
          </div>
          <div class="afc-pct">${done ? "Complete!" : pct + "% there"}</div>
        </div>
      </div>`;
  }).join("");
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function openMemberModal(id) {
  selectedMemberId = id;
  const m = members.find(x => x.id === id);
  document.getElementById("modal-member-icon").textContent = m.icon;
  document.getElementById("modal-member-name").textContent = m.name;
  document.getElementById("modal-member-pts").textContent  = m.points.toLocaleString() + " pts";
  document.getElementById("name-input").value = m.name;
  document.getElementById("custom-input").value = "";
  document.getElementById("modal").classList.add("open");
}

function closeModal(e) {
  if (e.target.id === "modal") closeModalDirect();
}

function closeModalDirect() {
  document.getElementById("modal").classList.remove("open");
  selectedMemberId = null;
  renderAll();
}

function addPoints(amount) {
  if (selectedMemberId === null) return;
  const m = members.find(x => x.id === selectedMemberId);
  m.points = Math.max(0, m.points + amount);
  save();
  document.getElementById("modal-member-pts").textContent = m.points.toLocaleString() + " pts";
  flashBtn();
}

function addCustomPoints() {
  const val = parseInt(document.getElementById("custom-input").value, 10);
  if (isNaN(val) || val === 0) return;
  addPoints(val);
  document.getElementById("custom-input").value = "";
}

function saveName() {
  const val = document.getElementById("name-input").value.trim();
  if (!val) return;
  const m = members.find(x => x.id === selectedMemberId);
  m.name = val;
  save();
  document.getElementById("modal-member-name").textContent = val;
}

function flashBtn() {
  // small visual feedback
  const pts = document.getElementById("modal-member-pts");
  pts.classList.add("flash");
  setTimeout(() => pts.classList.remove("flash"), 400);
}

// ── Utility ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", init);
