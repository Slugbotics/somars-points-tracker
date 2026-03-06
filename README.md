# 🛸 SOMARS Points Tracker

Live at → **https://slugbotics.github.io/somars-points-tracker/**

A real-time points tracker for the SOMARS Aerospace & Drone Club at UC Santa Cruz.
Built with vanilla HTML/CSS/JS + Firebase Firestore + Firebase Auth. Hosted on GitHub Pages.

---

## 🔐 Login & Access Levels

| Role | What they can do |
|------|-----------------|
| **Guest** (no login) | View leaderboard, profiles, awards — read-only |
| **Signed-in, not approved** | Same as guest; sees "not approved" warning |
| **Approved admin** | Add / deduct points for any member |

### How to become an approved admin

1. A SOMARS officer creates a Firebase Auth account for you:
   - Go to [Firebase Console → Authentication → Users](https://console.firebase.google.com/project/somars-points-tracker/authentication/users)
   - Click **Add user** → enter your email and a password → **Add user**

2. That same officer adds you to the `admins` Firestore collection:
   - Go to [Firebase Console → Firestore → Data](https://console.firebase.google.com/project/somars-points-tracker/firestore/data)
   - Open (or create) the **`admins`** collection
   - Click **Add document**
     - **Document ID:** `your-email@example.com` (lowercase)
     - Add field: **`email`** (string) → `your-email@example.com`
   - Save

3. You can now sign in on the website and add points.

> **Note:** Having a Firebase Auth account alone is NOT enough — you also need
> the `admins` Firestore document. This two-step process means a rogue sign-up
> can never add points without explicit approval from an officer.

---

## ✏️ Editing Your Profile

Profile data (name, bio, profile picture) is stored in **`data.js`** and deployed
through Git. It is **not** editable through the website UI — this keeps the
profile data version-controlled and reviewed.

### Step-by-step guide

1. **Fork** the repository on GitHub (button in the top-right corner), or ask
   an officer to grant you direct write access.

2. **Edit `data.js`** — find your entry in `DEFAULT_MEMBERS`:

   ```js
   { id: 3, name: "Your Name", points: 0, icon: "✈️", bio: "Your bio here." },
   ```

   - `name` — your display name
   - `bio`  — one or two sentences (shown on your profile page)
   - `icon` — emoji **or** image path (see below)
   - ⚠️ Do **not** change `id` or `points`

3. **Open a Pull Request** targeting `main`. An officer will review and merge it.

4. Once merged, GitHub Pages re-deploys automatically (~60 seconds).

---

## 🖼️ Changing Your Profile Picture

Your icon appears in the **leaderboard**, **Add Points grid**, **profile page**,
and **Add Points modal**. Changing it once in `data.js` updates all four places.

### Option A — Emoji (default)

```js
icon: "🚀"
```

Any emoji works. Just type it directly.

### Option B — Local image file

1. **Prepare your photo:**
   - Square crop recommended (1:1 aspect ratio)
   - Minimum 200 × 200 px, JPG or PNG
   - File name: `firstname-lastname.jpg` (no spaces)

2. **Add it to the repo** in the `images/` folder.
   Create the folder if it doesn't exist yet.

   ```
   somars-points-tracker/
   ├── images/
   │   └── firstname-lastname.jpg   ← your file here
   ├── index.html
   ├── data.js
   └── ...
   ```

3. **Update your entry** in `data.js`:

   ```js
   icon: "images/firstname-lastname.jpg"
   ```

4. **Include the image file in your Pull Request** alongside the `data.js` change.

---

## 🔒 Firestore Security Rules

In [Firebase Console → Firestore → Rules](https://console.firebase.google.com/project/somars-points-tracker/firestore/rules),
set:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Members — anyone can read; only signed-in users can write
    match /members/{memberId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Admins — only signed-in users can read (to check approval)
    match /admins/{adminId} {
      allow read: if request.auth != null;
      allow write: if false;   // manage only via Firebase Console
    }
  }
}
```

> Without these rules the site defaults to "allow all" which is fine for
> development, but should be tightened before broad use.

---

## 🏗️ Project Structure

```
index.html          — full site HTML (all pages + modals)
style.css           — aerospace dark theme styles
app.js              — Firebase listener, auth, rendering, point logic
data.js             — member list, award tiers, group milestones  ← edit profiles here
firebase-config.js  — Firebase project credentials
images/             — member profile photos (if used)
README.md           — this file
```

---

## 🚀 Local Development

Because the site uses Firebase (loaded from CDN), just open `index.html` in a
browser — no build step needed.

```bash
# Optionally serve with a local server to avoid CORS quirks:
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

---

## 📋 Group Milestones & Award Tiers

Edit the `AWARDS` and `GROUP_MILESTONES` arrays in `data.js` to change point
thresholds, descriptions, icons, and special flags. Submit a PR as usual.
