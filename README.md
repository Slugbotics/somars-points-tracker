# SOMARS Points Tracker

Live at → **https://slugbotics.github.io/somars-points-tracker/**

A real-time points tracker for the SOMARS Aerospace & Drone Club at UC Santa Cruz.
Built with vanilla HTML/CSS/JS + Firebase Firestore + Firebase Auth. Hosted on GitHub Pages.

---

## Editing Your Profile

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
   - Do **not** change `id` or `points`

3. **Open a Pull Request** targeting `main`. An officer will review and merge it.

4. Once merged, GitHub Pages re-deploys automatically (~60 seconds).

---

## Changing Your Profile Picture

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

2. **Add it to the repo** in the `images/member_pics` folder.

3. **Update your entry** in `data.js`:

   ```js
   icon: "images/firstname-lastname.jpg"
   ```

4. **Include the image file in your Pull Request** alongside the `data.js` change.
thresholds, descriptions, icons, and special flags. Submit a PR as usual.
