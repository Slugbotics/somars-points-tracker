// ─── SOMARS Points Tracker · app.js ──────────────────────────────────────────

// ── State ─────────────────────────────────────────────────────────────────────
let members = [];
let selectedMemberId = null;   // used by the edit/points modal
let profileMemberId  = null;   // used by the profile modal

// ── Init ──────────────────────────────────────────────────────────────────────
function init() {
  generateStars();
  showConnectionStatus("connecting");

  // Real-time listener — every connected client updates instantly
  db.collection("members")
    .orderBy("id")
    .onSnapshot(snapshot => {
      if (snapshot.empty) {
        seedDatabase();
      } else {
        members = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
        // Ensure bio field exists for legacy docs that predate the bio feature
        members.forEach(m => { if (m.bio === undefined) m.bio = ""; });
        showConnectionStatus("live");
        renderAll();
        // If a profile modal is open, refresh it too
        if (profileMemberId !== null) {
          const m = members.find(x => x.id === profileMemberId);
          if (m) refreshProfileModal(m);
        }
        // If edit modal is open, refresh pts
        if (selectedMemberId !== null) {
          const m = members.find(x => x.id === selectedMemberId);
          if (m) document.getElementById("modal-member-pts").textContent = m.points.toLocaleString() + " pts";
        }
      }
    }, err => {
      console.error("Firestore error:", err);
      showConnectionStatus("error");
      const saved = localStorage.getItem("somars_members_fallback");
      if (saved) members = JSON.parse(saved);
      renderAll();
    });
}

// ── Seed DB on first launch ───────────────────────────────────────────────────
async function seedDatabase() {
  showConnectionStatus("seeding");
  const batch = db.batch();
  DEFAULT_MEMBERS.forEach(m => {
    const ref = db.collection("members").doc(String(m.id));
    batch.set(ref, m);
  });
  await batch.commit();
}

// ── Connection status badge ───────────────────────────────────────────────────
function showConnectionStatus(state) {
  let badge = document.getElementById("conn-badge");
  if (!badge) {
    badge = document.createElement("div");
    badge.id = "conn-badge";
    badge.style.cssText = `
      position:fixed; bottom:18px; right:18px; z-index:300;
      padding:7px 14px; border-radius:20px; font-size:0.75rem;
      font-weight:700; letter-spacing:0.5px; backdrop-filter:blur(8px);
      border:1px solid; transition: all 0.4s;
    `;
    document.body.appendChild(badge);
  }
  const states = {
    connecting: { text: "📡 Connecting...",    bg: "rgba(255,180,0,0.15)",  border: "#ffb400", color: "#ffb400" },
    seeding:    { text: "🌱 Setting up DB...", bg: "rgba(0,212,255,0.15)",  border: "#00d4ff", color: "#00d4ff" },
    live:       { text: "🟢 Live — synced",    bg: "rgba(0,232,120,0.15)",  border: "#00e878", color: "#00e878" },
    error:      { text: "⚠️ Offline (local)",  bg: "rgba(255,80,80,0.15)",  border: "#ff5050", color: "#ff5050" },
  };
  const s = states[state];
  badge.textContent       = s.text;
  badge.style.background  = s.bg;
  badge.style.borderColor = s.border;
  badge.style.color       = s.color;
  badge.style.opacity     = "1";
  if (state === "live") {
    clearTimeout(badge._hideTimer);
    badge._hideTimer = setTimeout(() => { badge.style.opacity = "0"; }, 4000);
  }
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

// ── 🖼️ IMAGE RENDER POINT ────────────────────────────────────────────────────
// This helper decides whether to render an emoji or an <img> tag.
// If a member's "icon" field is a file path (e.g. "images/alice.jpg"),
// it renders as an image. Otherwise it renders as plain text (emoji).
// To swap: change the "icon" in data.js to your image path.
function renderMemberIcon(icon, cssClass = "") {
  const isImage = icon && (
    icon.startsWith("images/") ||
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(icon)
  );
  if (isImage) {
    return `<img src="${escHtml(icon)}" class="member-img-icon ${cssClass}" alt="member photo" />`;
  }
  return `<span class="${cssClass}">${icon}</span>`;
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
  renderGroupMilestonesPreview();
  renderAwardsPreview();
  renderMembersGrid();
  renderGroupMilestonesFull();
  renderAwardsFull();
}

// ── Home stats ────────────────────────────────────────────────────────────────
function renderHomeStats() {
  const total = members.reduce((s, m) => s + m.points, 0);
  document.getElementById("total-points").textContent = total.toLocaleString();
  document.getElementById("active-members").textContent = members.length;

  // Awards unlocked = how many individual tiers at least ONE member has reached
  const maxPts = members.length ? Math.max(...members.map(m => m.points)) : 0;
  const unlocked = AWARDS.filter(a => maxPts >= a.points).length;
  document.getElementById("awards-unlocked").textContent = unlocked;

  // Next group milestone
  const next = GROUP_MILESTONES.find(a => total < a.points);
  document.getElementById("next-award-pts").textContent = next
    ? next.points.toLocaleString()
    : "ALL DONE 🎉";
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
function renderLeaderboard() {
  const sorted = [...members].sort((a, b) => b.points - a.points);
  const el = document.getElementById("leaderboard");
  el.innerHTML = sorted.map((m, i) => {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`;
    const bar = Math.max(2, sorted[0].points > 0
      ? Math.round((m.points / sorted[0].points) * 100) : 2);
    return `
      <div class="lb-row" onclick="openProfileModal(${m.id})">
        <span class="lb-rank">${medal}</span>
        <span class="lb-icon">${renderMemberIcon(m.icon)}</span>
        <span class="lb-name">${escHtml(m.name)}</span>
        <div class="lb-bar-wrap"><div class="lb-bar" style="width:${bar}%"></div></div>
        <span class="lb-pts">${m.points.toLocaleString()} pts</span>
      </div>`;
  }).join("");
}

// ── Group milestones preview (home page) ──────────────────────────────────────
function renderGroupMilestonesPreview() {
  const total = members.reduce((s, m) => s + m.points, 0);
  const el = document.getElementById("group-milestones-preview");
  if (!el) return;
  el.innerHTML = GROUP_MILESTONES.map(a => {
    const done = total >= a.points;
    const pct  = Math.min(100, total > 0 ? Math.round((total / a.points) * 100) : 0);
    return `
      <div class="award-card ${done ? "award-done" : ""} ${a.special ? "award-special" : ""}">
        <div class="award-icon">${renderMemberIcon(a.icon)}</div>
        <div class="award-pts" style="color:${a.color}">${a.points.toLocaleString()} pts</div>
        <div class="award-title">${a.title}</div>
        <div class="award-mini-bar-wrap"><div class="award-mini-bar" style="width:${pct}%;background:${a.color}"></div></div>
        ${done ? '<div class="award-badge">✅ UNLOCKED</div>' : `<div class="award-pct-text">${pct}%</div>`}
      </div>`;
  }).join("");
}

// ── Individual awards preview (home page) ─────────────────────────────────────
function renderAwardsPreview() {
  const el = document.getElementById("awards-preview");
  if (!el) return;
  // Show the first 6 tiers as a preview
  el.innerHTML = AWARDS.slice(0, 6).map(a => {
    const maxPts = members.length ? Math.max(...members.map(m => m.points)) : 0;
    const done = maxPts >= a.points;
    return `
      <div class="award-card ${done ? "award-done" : ""} ${a.special ? "award-special" : ""}">
        <div class="award-icon">${renderMemberIcon(a.icon)}</div>
        <div class="award-pts" style="color:${a.color}">${a.points.toLocaleString()} pts</div>
        <div class="award-title">${a.title}</div>
        ${done ? '<div class="award-badge">✅ Someone has this</div>' : ""}
      </div>`;
  }).join("");
}

// ── Members grid ──────────────────────────────────────────────────────────────
function renderMembersGrid() {
  const el = document.getElementById("members-grid");
  el.innerHTML = members.map(m => {
    const award = [...AWARDS].reverse().find(a => m.points >= a.points);
    return `
      <div class="member-card" onclick="openProfileModal(${m.id})">
        <div class="member-icon">
          <!-- 🖼️ IMAGE RENDER POINT: renderMemberIcon() handles emoji vs image -->
          ${renderMemberIcon(m.icon, "member-icon-inner")}
        </div>
        <div class="member-name">${escHtml(m.name)}</div>
        <div class="member-pts">${m.points.toLocaleString()} <span>pts</span></div>
        ${award
          ? `<div class="member-rank" style="color:${award.color}">${renderMemberIcon(award.icon)} ${award.title}</div>`
          : '<div class="member-rank">🚦 No rank yet</div>'}
        ${m.bio ? `<div class="member-bio-snippet">${escHtml(m.bio.substring(0, 60))}${m.bio.length > 60 ? "…" : ""}</div>` : ""}
        <div class="member-edit-hint">Click to view profile</div>
      </div>`;
  }).join("");
}

// ── Group milestones full page ────────────────────────────────────────────────
function renderGroupMilestonesFull() {
  const total = members.reduce((s, m) => s + m.points, 0);
  const el = document.getElementById("group-milestones-full");
  if (!el) return;
  el.innerHTML = GROUP_MILESTONES.map(a => {
    const done = total >= a.points;
    const pct  = Math.min(100, total > 0 ? Math.round((total / a.points) * 100) : 0);
    return `
      <div class="award-full-card ${done ? "award-done" : ""} ${a.special ? "award-special" : ""}">
        <div class="afc-left"><div class="afc-icon">${renderMemberIcon(a.icon)}</div></div>
        <div class="afc-body">
          <div class="afc-title">${a.title}
            ${a.special ? '<span class="special-badge">⭐ SPECIAL</span>' : ""}
            ${done ? '<span class="unlocked-badge">✅ UNLOCKED</span>' : ""}
          </div>
          <div class="afc-pts" style="color:${a.color}">${a.points.toLocaleString()} combined points required</div>
          <div class="afc-desc">${a.desc}</div>
          <div class="afc-progress-wrap">
            <div class="afc-progress-bar" style="width:${pct}%; background:${a.color}"></div>
          </div>
          <div class="afc-pct">${done ? "Complete! 🎉" : `${pct}% — ${(a.points - total).toLocaleString()} pts to go`}</div>
        </div>
      </div>`;
  }).join("");
}

// ── Individual awards full page ───────────────────────────────────────────────
function renderAwardsFull() {
  const maxPts = members.length ? Math.max(...members.map(m => m.points)) : 0;
  const el = document.getElementById("awards-full");
  if (!el) return;
  el.innerHTML = AWARDS.map(a => {
    const done = maxPts >= a.points;
    const pct  = Math.min(100, maxPts > 0 ? Math.round((maxPts / a.points) * 100) : 0);
    return `
      <div class="award-full-card ${done ? "award-done" : ""} ${a.special ? "award-special" : ""}">
        <div class="afc-left"><div class="afc-icon">${renderMemberIcon(a.icon)}</div></div>
        <div class="afc-body">
          <div class="afc-title">${a.title}
            ${a.special ? '<span class="special-badge">⭐ SPECIAL</span>' : ""}
            ${done ? '<span class="unlocked-badge">✅ Someone has this</span>' : ""}
          </div>
          <div class="afc-pts" style="color:${a.color}">${a.points.toLocaleString()} individual points required</div>
          <div class="afc-desc">${a.desc}</div>
          <div class="afc-progress-wrap">
            <div class="afc-progress-bar" style="width:${pct}%; background:${a.color}"></div>
          </div>
          <div class="afc-pct">${done ? "Top member has this!" : `Top member at ${pct}%`}</div>
        </div>
      </div>`;
  }).join("");
}

// ── Profile modal ─────────────────────────────────────────────────────────────
function openProfileModal(id) {
  profileMemberId = id;
  const m = members.find(x => x.id === id);
  refreshProfileModal(m);
  document.getElementById("profile-modal").classList.add("open");
}

function refreshProfileModal(m) {
  // Icon — 🖼️ IMAGE RENDER POINT: renderMemberIcon handles emoji vs image path
  document.getElementById("profile-icon").innerHTML = renderMemberIcon(m.icon, "profile-icon-img");
  document.getElementById("profile-name").textContent = m.name;
  document.getElementById("profile-pts").textContent  = m.points.toLocaleString() + " pts";

  // Current rank badge
  const award = [...AWARDS].reverse().find(a => m.points >= a.points);
  const rankEl = document.getElementById("profile-rank-badge");
  rankEl.innerHTML = award
    ? `<span style="color:${award.color}">${renderMemberIcon(award.icon)} ${award.title}</span>`
    : '<span style="color:#7a9ab8">🚦 No rank yet</span>';

  // Bio
  const bioEl = document.getElementById("profile-bio");
  bioEl.textContent = m.bio || "No bio yet — click ⚡ Add / Edit Points to add one.";

  // Awards progress list for this individual member
  const awardsEl = document.getElementById("profile-awards");
  awardsEl.innerHTML = AWARDS.map(a => {
    const done = m.points >= a.points;
    const pct  = Math.min(100, m.points > 0 ? Math.round((m.points / a.points) * 100) : 0);
    return `
      <div class="profile-award-row ${done ? "done" : ""}">
        <span class="pa-icon">${renderMemberIcon(a.icon)}</span>
        <div class="pa-body">
          <div class="pa-title" style="color:${a.color}">${a.title}
            ${done ? '<span class="unlocked-badge">✅</span>' : ""}
            ${a.special ? '<span class="special-badge">⭐</span>' : ""}
          </div>
          <div class="pa-bar-wrap">
            <div class="pa-bar" style="width:${pct}%;background:${a.color}"></div>
          </div>
          <div class="pa-pct">${done ? "Unlocked!" : `${m.points.toLocaleString()} / ${a.points.toLocaleString()} pts (${pct}%)`}</div>
        </div>
      </div>`;
  }).join("");
}

function closeProfileModal(e) {
  if (e.target.id === "profile-modal") closeProfileModalDirect();
}

function closeProfileModalDirect() {
  document.getElementById("profile-modal").classList.remove("open");
  profileMemberId = null;
}

// Opens the edit/points modal from within the profile modal
function openEditModal() {
  if (profileMemberId === null) return;
  closeProfileModalDirect();
  openMemberModal(profileMemberId);
}

// ── Edit / Points modal ───────────────────────────────────────────────────────
function openMemberModal(id) {
  selectedMemberId = id;
  const m = members.find(x => x.id === id);
  document.getElementById("modal-member-icon").textContent = m.icon;
  document.getElementById("modal-member-name").textContent = m.name;
  document.getElementById("modal-member-pts").textContent  = m.points.toLocaleString() + " pts";
  document.getElementById("name-input").value  = m.name;
  document.getElementById("bio-input").value   = m.bio || "";
  document.getElementById("custom-input").value = "";
  document.getElementById("modal").classList.add("open");
}

function closeModal(e) {
  if (e.target.id === "modal") closeModalDirect();
}

function closeModalDirect() {
  document.getElementById("modal").classList.remove("open");
  selectedMemberId = null;
}

// ── Add points → Firestore ────────────────────────────────────────────────────
async function addPoints(amount) {
  if (selectedMemberId === null) return;
  const m = members.find(x => x.id === selectedMemberId);
  const newPoints = Math.max(0, m.points + amount);

  // Optimistic local update so the modal feels instant
  m.points = newPoints;
  document.getElementById("modal-member-pts").textContent = newPoints.toLocaleString() + " pts";
  flashPts();

  try {
    await db.collection("members").doc(String(selectedMemberId)).update({ points: newPoints });
    localStorage.setItem("somars_members_fallback", JSON.stringify(members));
  } catch (err) {
    console.error("Failed to write points:", err);
    showConnectionStatus("error");
  }
}

function addCustomPoints() {
  const val = parseInt(document.getElementById("custom-input").value, 10);
  if (isNaN(val) || val === 0) return;
  addPoints(val);
  document.getElementById("custom-input").value = "";
}

// ── Save name → Firestore ─────────────────────────────────────────────────────
async function saveName() {
  const val = document.getElementById("name-input").value.trim();
  if (!val || selectedMemberId === null) return;
  const m = members.find(x => x.id === selectedMemberId);
  m.name = val;
  document.getElementById("modal-member-name").textContent = val;
  try {
    await db.collection("members").doc(String(selectedMemberId)).update({ name: val });
  } catch (err) {
    console.error("Failed to save name:", err);
    showConnectionStatus("error");
  }
}

// ── Save bio → Firestore ──────────────────────────────────────────────────────
async function saveBio() {
  const val = document.getElementById("bio-input").value.trim();
  if (selectedMemberId === null) return;
  const m = members.find(x => x.id === selectedMemberId);
  m.bio = val;
  try {
    await db.collection("members").doc(String(selectedMemberId)).update({ bio: val });
  } catch (err) {
    console.error("Failed to save bio:", err);
    showConnectionStatus("error");
  }
}

// ── Visual feedback ───────────────────────────────────────────────────────────
function flashPts() {
  const pts = document.getElementById("modal-member-pts");
  pts.classList.add("flash");
  setTimeout(() => pts.classList.remove("flash"), 400);
}

// ── Utility ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", init);
