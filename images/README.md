# 🖼️ Member Profile Images

Place member profile photos in this folder.

## Instructions

1. Add your photo here — name it `firstname-lastname.jpg` (e.g. `alex-chen.jpg`)
2. Recommended: **square crop**, minimum **200×200 px**, JPG or PNG
3. In `data.js`, find your entry and change the `icon` field:
   ```js
   { id: 3, name: "Alex Chen", icon: "images/alex-chen.jpg", ... }
   ```
4. Open a Pull Request on GitHub — see the main `README.md` for instructions

## How images render

Your photo will automatically appear at the correct size in:
- **Home leaderboard** — 36×36 px circle
- **Profile page header** — 80×80 px circle  
- **Add Points modal** — 48×48 px circle

If you leave `icon` as an emoji (e.g. `"🚀"`), that emoji is used everywhere instead.
