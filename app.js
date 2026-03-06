// ─── SOMARS Points Tracker · app.js ──────────────────────────────────────────

// ── State ─────────────────────────────────────────────────────────────────────
let members          = [];
let selectedMemberId = null;   // member currently open in the add-points modal
let profilePageId    = null;   // member whose profile page is displayed
let currentUser      = null;   // Firebase Auth user object (null = guest)
let isApproved       = false;  // true only if user email is in Firestore "admins" collection

// ── Init ──────────────────────────────────────────────────────────────────────
function init() {
  generateStars();

  // ── Auth state listener ───────────────────────────────────────────────────
  // Firebase Auth automatically restores the session from the previous visit.
  // onAuthStateChanged fires once on page load (user or null) and again on
  // every sign-in / sign-out.
  auth.onAuthStateChanged(async user => {
    if (user) {
      // A user is signed in — check the Firestore "admins" collection to see
      // if this email is on the approved list before granting write access.
      await resolveApproval(user);
    } else {
      // No session — show login overlay (first-time or after sign-out).
      // If the overlay is already dismissed (guest mode) don't re-show it.
      if (!document.getElementById("login-overlay").dataset.dismissed) {
        showLoginOverlay();
      }
      currentUser = null;
      isApproved  = false;
      renderAuthUI();
    }
    startFirestoreListener();
  });
}

// ── Check "admins" collection ─────────────────────────────────────────────────
// The "admins" Firestore collection holds one document per approved user.
// Document ID = the user's email address (lowercase).
// If the document exists, the user is approved to add points.
//
// HOW TO ADD AN APPROVED USER:
//   1. Have them create a Firebase Auth account (Firebase Console → Authentication).
//   2. In Firestore → Collection "admins" → Add document:
//        Document ID:  their-email@example.com
//        Field:        email  (string)  their-email@example.com
//   That's it — they can now sign in and edit points.
async function resolveApproval(user) {
  currentUser = user;
  try {
    const doc = await db.collection("admins").doc(user.email.toLowerCase()).get();
    isApproved = doc.exists;
  } catch (err) {
    console.error("Could not verify approval:", err);
    isApproved = false;
  }
  // Hide login overlay since the user is authenticated
  hideLoginOverlay();
  renderAuthUI();
}

// ── Auth UI helpers ───────────────────────────────────────────────────────────
function renderAuthUI() {
  const pill    = document.getElementById("auth-pill");
  const gate    = document.getElementById("members-auth-gate");
  const addBtn  = document.getElementById("pp-add-pts-btn");

  if (currentUser && isApproved) {
    pill.innerHTML = `
      <span class="auth-user">✅ ${escHtml(currentUser.email)}</span>
      <button class="auth-signout-btn" onclick="doSignOut()">Sign out</button>`;
    if (gate)   gate.style.display   = "none";
    if (addBtn) addBtn.style.display = "inline-flex";
  } else if (currentUser && !isApproved) {
    // Signed in but NOT on the approved list
    pill.innerHTML = `
      <span class="auth-user auth-pending">⚠️ ${escHtml(currentUser.email)} — not approved</span>
      <button class="auth-signout-btn" onclick="doSignOut()">Sign out</button>`;
    if (gate)   gate.style.display   = "flex";
    if (addBtn) addBtn.style.display = "none";
  } else {
    // Guest
    pill.innerHTML = `
      <span class="auth-guest">👁 Guest (read-only)</span>
      <button class="auth-signin-btn" onclick="showLoginOverlay()">Sign in</button>`;
    if (gate)   gate.style.display   = "flex";
    if (addBtn) addBtn.style.display = "none";
  }

  // Re-render grids so lock icons appear/disappear correctly
  renderMembersGrid();
  // Refresh profile page add-points button if open
  if (profilePageId !== null) {
    const btn = document.getElementById("pp-add-pts-btn");
    if (btn) btn.style.display = isApproved ? "inline-flex" : "none";
  }
}

// ── Login overlay ─────────────────────────────────────────────────────────────
function showLoginOverlay() {
  const overlay = document.getElementById("login-overlay");
  overlay.style.display = "flex";
  delete overlay.dataset.dismissed;
}

function hideLoginOverlay() {
  const overlay = document.getElementById("login-overlay");
  overlay.style.display = "none";
  overlay.dataset.dismissed = "1";
}

function continueAsGuest() {
  hideLoginOverlay();
  currentUser = null;
  isApproved  = false;
  renderAuthUI();
}

// ── Sign in ───────────────────────────────────────────────────────────────────
async function doLogin() {
  const email    = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const errEl    = document.getElementById("login-error");

  if (!email || !password) {
    showLoginError("Please enter your email and password.");
    return;
  }

  try {
    errEl.style.display = "none";
    await auth.signInWithEmailAndPassword(email, password);
    // onAuthStateChanged will fire and call resolveApproval()
  } catch (err) {
    const msg = {
      "auth/user-not-found":    "No account found with that email.",
      "auth/wrong-password":    "Incorrect password.",
      "auth/invalid-email":     "Invalid email address.",
      "auth/too-many-requests": "Too many attempts — try again later.",
    }[err.code] || err.message;
    showLoginError(msg);
  }
}

// Allow pressing Enter in the password field to submit
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("login-password")
    .addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });
  document.getElementById("login-email")
    .addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });
});

function showLoginError(msg) {
  const el = document.getElementById("login-error");
  el.textContent = msg;
  el.style.display = "block";
}

// ── Sign out ──────────────────────────────────────────────────────────────────
async function doSignOut() {
  await auth.signOut();
  // onAuthStateChanged fires → shows login overlay
}

// ── Firestore real-time listener ──────────────────────────────────────────────
function startFirestoreListener() {
  showConnectionStatus("connecting");

  db.collection("members")
    .orderBy("id")
    .onSnapshot(snapshot => {
      if (snapshot.empty) {
        seedDatabase();
      } else {
        members = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
        members.forEach(m => {
          if (m.bio   === undefined) m.bio   = "";
          if (m.icon  === undefined) m.icon  = "🚀";
          if (m.name  === undefined) m.name  = `Crew Member ${m.id}`;
        });
        showConnectionStatus("live");
        renderAll();
        if (profilePageId !== null) renderProfilePage(profilePageId);
        if (selectedMemberId !== null) {
          const m = members.find(x => x.id === selectedMemberId);
          if (m) document.getElementById("modal-member-pts").textContent =
            m.points.toLocaleString() + " pts";
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

// ── Connection badge ──────────────────────────────────────────────────────────
function showConnectionStatus(state) {
  let badge = document.getElementById("conn-badge");
  if (!badge) {
    badge = document.createElement("div");
    badge.id = "conn-badge";
    badge.style.cssText = `
      position:fixed;bottom:18px;right:18px;z-index:300;
      padding:7px 14px;border-radius:20px;font-size:0.75rem;
      font-weight:700;letter-spacing:0.5px;backdrop-filter:blur(8px);
      border:1px solid;transition:all 0.4s;
    `;
    document.body.appendChild(badge);
  }
  const S = {
    connecting: { text:"📡 Connecting...",    bg:"rgba(255,180,0,.15)",  border:"#ffb400", color:"#ffb400" },
    seeding:    { text:"🌱 Setting up DB...", bg:"rgba(0,212,255,.15)",  border:"#00d4ff", color:"#00d4ff" },
    live:       { text:"🟢 Live — synced",    bg:"rgba(0,232,120,.15)",  border:"#00e878", color:"#00e878" },
    error:      { text:"⚠️ Offline (local)",  bg:"rgba(255,80,80,.15)",  border:"#ff5050", color:"#ff5050" },
  }[state];
  badge.textContent = S.text;
  badge.style.background  = S.bg;
  badge.style.borderColor = S.border;
  badge.style.color       = S.color;
  badge.style.opacity     = "1";
  if (state === "live") {
    clearTimeout(badge._t);
    badge._t = setTimeout(() => { badge.style.opacity = "0"; }, 4000);
  }
}

// ── Stars ─────────────────────────────────────────────────────────────────────
function generateStars() {
  const c = document.getElementById("stars");
  for (let i = 0; i < 180; i++) {
    const s = document.createElement("div");
    s.className = "star";
    s.style.left   = Math.random() * 100 + "vw";
    s.style.top    = Math.random() * 100 + "vh";
    const sz = Math.random() * 2.5 + 0.5;
    s.style.width  = sz + "px";
    s.style.height = sz + "px";
    s.style.animationDelay    = Math.random() * 4 + "s";
    s.style.animationDuration = (Math.random() * 3 + 2) + "s";
    c.appendChild(s);
  }
}

// ── 🖼️ IMAGE RENDER POINT ────────────────────────────────────────────────────
// Each member has an "icon" field in data.js. It can be:
//   • An emoji string  →  rendered as a <span>
//   • A file path      →  rendered as an <img> (e.g. "images/alice.jpg")
//
// To use a photo:
//   1. Add the image file to the images/ folder next to index.html
//   2. Set  icon: "images/yourphoto.jpg"  in that member's entry in data.js
//   3. Open a Pull Request — see README.md for full steps.
//
// The icon is rendered the same way EVERYWHERE the member appears:
// leaderboard, member grid, profile page, add-points modal header.
// Updating data.js once updates all instances automatically.
function renderMemberIcon(icon, cssClass = "") {
  const isImg = icon && (icon.startsWith("images/") || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(icon));
  return isImg
    ? `<img src="${escHtml(icon)}" class="member-img-icon ${cssClass}" alt="member photo"/>`
    : `<span class="${cssClass}">${icon}</span>`;
}

// ── Page routing ──────────────────────────────────────────────────────────────
function showPage(name) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("page-" + name).classList.add("active");
  // The profile page has no dedicated nav button — keep "Home Base" highlighted
  const navId = "nav-" + (name === "profile" ? "home" : name);
  const navEl = document.getElementById(navId);
  if (navEl) navEl.classList.add("active");
  renderAll();
}

// ── Render all ────────────────────────────────────────────────────────────────
function renderAll() {
  renderHomeStats();
  renderMilestoneNodes();
  renderLeaderboard();
  renderMembersGrid();
  renderAwardsFull();
  renderGroupMilestonesFull();
}

// ── Home stats ────────────────────────────────────────────────────────────────
function renderHomeStats() {
  const total  = members.reduce((s, m) => s + m.points, 0);
  const maxPts = members.length ? Math.max(...members.map(m => m.points)) : 0;
  document.getElementById("total-points").textContent    = total.toLocaleString();
  document.getElementById("active-members").textContent  = members.length;
  document.getElementById("awards-unlocked").textContent = AWARDS.filter(a => maxPts >= a.points).length;
  const next = GROUP_MILESTONES.find(a => total < a.points);
  document.getElementById("next-award-pts").textContent  = next ? next.points.toLocaleString() : "ALL DONE 🎉";
}

// ── Group milestone nodes (home page) ────────────────────────────────────────
function renderMilestoneNodes() {
  const el = document.getElementById("group-milestone-nodes");
  if (!el) return;
  const total = members.reduce((s, m) => s + m.points, 0);
  el.innerHTML = GROUP_MILESTONES.map(a => {
    const done = total >= a.points;
    const pct  = Math.min(100, total > 0 ? Math.round((total / a.points) * 100) : 0);
    return `
      <div class="milestone-node ${done ? "node-done" : ""} ${a.special ? "node-special" : ""}">
        <div class="node-icon">${renderMemberIcon(a.icon)}</div>
        <div class="node-pts" style="color:${a.color}">${a.points.toLocaleString()}</div>
        <div class="node-title">${a.title}</div>
        <div class="node-bar-wrap"><div class="node-bar" style="width:${pct}%;background:${a.color}"></div></div>
        <div class="node-pct">${done ? "✅ Unlocked!" : pct + "%"}</div>
      </div>`;
  }).join("");
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
function renderLeaderboard() {
  const sorted = [...members].sort((a, b) => b.points - a.points);
  const el = document.getElementById("leaderboard");
  el.innerHTML = sorted.map((m, i) => {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`;
    const bar   = Math.max(2, sorted[0].points > 0 ? Math.round((m.points / sorted[0].points) * 100) : 2);
    return `
      <div class="lb-row">
        <span class="lb-rank">${medal}</span>
        <span class="lb-icon">${renderMemberIcon(m.icon)}</span>
        <span class="lb-name lb-name-link" onclick="openProfilePage(${m.id})">${escHtml(m.name)}</span>
        <div class="lb-bar-wrap"><div class="lb-bar" style="width:${bar}%"></div></div>
        <span class="lb-pts">${m.points.toLocaleString()} pts</span>
      </div>`;
  }).join("");
}

// ── Add-Points members grid — sorted by points (highest first) ────────────────
function renderMembersGrid() {
  const el = document.getElementById("members-grid");
  if (!el) return;

  // Sort descending by points so highest earners appear first
  const sorted = [...members].sort((a, b) => b.points - a.points);

  el.innerHTML = sorted.map(m => {
    const award = [...AWARDS].reverse().find(a => m.points >= a.points);
    const canEdit = isApproved;
    return `
      <div class="member-card ${canEdit ? "" : "member-card-locked"}"
           onclick="${canEdit ? `openMemberModal(${m.id})` : "showLoginOverlay()"}">
        <div class="member-icon">${renderMemberIcon(m.icon, "member-icon-inner")}</div>
        <div class="member-name">${escHtml(m.name)}</div>
        <div class="member-pts">${m.points.toLocaleString()} <span>pts</span></div>
        ${award
          ? `<div class="member-rank" style="color:${award.color}">${renderMemberIcon(award.icon)} ${award.title}</div>`
          : '<div class="member-rank">🚦 No rank yet</div>'}
        <div class="member-edit-hint">${canEdit ? "Click to add points" : "🔒 Sign in to add points"}</div>
      </div>`;
  }).join("");
}

// ── Individual awards (Awards Bay tab) ───────────────────────────────────────
function renderAwardsFull() {
  const el = document.getElementById("awards-full");
  if (!el) return;
  const maxPts = members.length ? Math.max(...members.map(m => m.points)) : 0;
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
          <div class="afc-pts" style="color:${a.color}">${a.points.toLocaleString()} individual pts required</div>
          <div class="afc-desc">${a.desc}</div>
          <div class="afc-progress-wrap"><div class="afc-progress-bar" style="width:${pct}%;background:${a.color}"></div></div>
          <div class="afc-pct">${done ? "Top member has this!" : `Top member at ${pct}%`}</div>
        </div>
      </div>`;
  }).join("");
}

// ── Group milestones (Awards Bay tab) ─────────────────────────────────────────
function renderGroupMilestonesFull() {
  const el = document.getElementById("group-milestones-full");
  if (!el) return;
  const total = members.reduce((s, m) => s + m.points, 0);
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
          <div class="afc-progress-wrap"><div class="afc-progress-bar" style="width:${pct}%;background:${a.color}"></div></div>
          <div class="afc-pct">${done ? "Complete! 🎉" : `${pct}% — ${(a.points-total).toLocaleString()} pts to go`}</div>
        </div>
      </div>`;
  }).join("");
}

// ── Profile PAGE ──────────────────────────────────────────────────────────────
function openProfilePage(id) {
  profilePageId = id;
  renderProfilePage(id);
  showPage("profile");
}

function renderProfilePage(id) {
  const m = members.find(x => x.id === id);
  if (!m) return;

  // ── Header ──────────────────────────────────────────────────────────────
  // renderMemberIcon() uses the same "icon" field that is set in data.js.
  // If that field is changed to an image path (e.g. "images/alice.jpg"),
  // it automatically renders as <img> here AND everywhere else the member
  // appears (leaderboard, member grid, points modal header).
  document.getElementById("pp-icon").innerHTML = renderMemberIcon(m.icon, "pp-icon-inner");
  document.getElementById("pp-name").textContent = m.name;
  document.getElementById("pp-pts").textContent  = m.points.toLocaleString() + " pts";

  const award = [...AWARDS].reverse().find(a => m.points >= a.points);
  document.getElementById("pp-rank").innerHTML = award
    ? `<span style="color:${award.color}">${renderMemberIcon(award.icon)} ${award.title}</span>`
    : '<span style="color:#7a9ab8">🚦 No rank yet</span>';

  // ── Bio (read-only) ──────────────────────────────────────────────────────
  // To update a bio, edit the "bio" field in data.js and submit a PR.
  // See README.md → "Editing Your Profile".
  document.getElementById("pp-bio-display").textContent =
    m.bio || "No bio yet. Submit a PR on GitHub to add one — see README.md.";

  // ── "Add Points" button visibility ──────────────────────────────────────
  const addBtn = document.getElementById("pp-add-pts-btn");
  if (addBtn) addBtn.style.display = isApproved ? "inline-flex" : "none";

  // ── Personal awards progress ─────────────────────────────────────────────
  const awardsEl = document.getElementById("pp-awards");
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
          <div class="pa-bar-wrap"><div class="pa-bar" style="width:${pct}%;background:${a.color}"></div></div>
          <div class="pa-pct">${done
            ? "Unlocked!"
            : `${m.points.toLocaleString()} / ${a.points.toLocaleString()} pts (${pct}%)`}
          </div>
        </div>
      </div>`;
  }).join("");
}

// Opens the add-points modal for the currently-displayed profile page member.
// Only reachable when isApproved = true (button is hidden otherwise).
function openAddPointsForProfile() {
  if (!isApproved) return;
  if (profilePageId === null) return;
  openMemberModal(profilePageId);
}

// ── Add-Points modal ──────────────────────────────────────────────────────────
function openMemberModal(id) {
  if (!isApproved) { showLoginOverlay(); return; }
  selectedMemberId = id;
  const m = members.find(x => x.id === id);
  // renderMemberIcon — icon field from data.js; images/ path renders as <img>
  const iconHTML = renderMemberIcon(m.icon);
  document.getElementById("modal-member-icon").innerHTML = iconHTML;
  document.getElementById("modal-member-name").textContent = m.name;
  document.getElementById("modal-member-pts").textContent  = m.points.toLocaleString() + " pts";
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

// ── Add / deduct points → Firestore ──────────────────────────────────────────
async function addPoints(amount) {
  if (!isApproved) return;
  if (selectedMemberId === null) return;
  const m = members.find(x => x.id === selectedMemberId);
  const newPts = Math.max(0, m.points + amount);
  m.points = newPts;
  document.getElementById("modal-member-pts").textContent = newPts.toLocaleString() + " pts";
  flashPts();
  try {
    await db.collection("members").doc(String(selectedMemberId)).update({ points: newPts });
    localStorage.setItem("somars_members_fallback", JSON.stringify(members));
  } catch (err) {
    console.error("Failed to write points:", err);
    showConnectionStatus("error");
  }
}

function addCustomPoints() {
  if (!isApproved) return;
  const val = parseInt(document.getElementById("custom-input").value, 10);
  if (isNaN(val) || val === 0) return;
  addPoints(val);
  document.getElementById("custom-input").value = "";
}

// ── Visual feedback ───────────────────────────────────────────────────────────
function flashPts() {
  const el = document.getElementById("modal-member-pts");
  el.classList.add("flash");
  setTimeout(() => el.classList.remove("flash"), 400);
}

// ── Utility ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

document.addEventListener("DOMContentLoaded", init);
