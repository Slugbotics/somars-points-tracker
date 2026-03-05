// ─── SOMARS Points Tracker · data.js ─────────────────────────────────────────

// ─── Default Member List ──────────────────────────────────────────────────────
// Each member has: id, name, points, icon (emoji or image path), bio
//
// 🖼️  TO USE A LOCAL IMAGE INSTEAD OF AN EMOJI:
//     1. Put your image file in an "images/" folder next to index.html
//        e.g.  images/member1.jpg
//     2. Change the "icon" value to the relative path:
//        icon: "images/member1.jpg"
//     The code in app.js checks whether the icon starts with "images/" (or
//     ends in .jpg/.png/.webp/.gif) and renders it as <img> instead of text.
//     Look for the comment "// 🖼️ IMAGE RENDER POINT" in app.js to see exactly
//     where the swap happens.

const DEFAULT_MEMBERS = [
  { id: 1,  name: "Crew Member 1",  points: 0, icon: "🚀", bio: "" },
  { id: 2,  name: "Crew Member 2",  points: 0, icon: "🛸", bio: "" },
  { id: 3,  name: "Crew Member 3",  points: 0, icon: "✈️", bio: "" },
  { id: 4,  name: "Crew Member 4",  points: 0, icon: "🛩️", bio: "" },
  { id: 5,  name: "Crew Member 5",  points: 0, icon: "🚁", bio: "" },
  { id: 6,  name: "Crew Member 6",  points: 0, icon: "🛰️", bio: "" },
  { id: 7,  name: "Crew Member 7",  points: 0, icon: "🌟", bio: "" },
  { id: 8,  name: "Crew Member 8",  points: 0, icon: "⭐", bio: "" },
  { id: 9,  name: "Crew Member 9",  points: 0, icon: "🌙", bio: "" },
  { id: 10, name: "Crew Member 10", points: 0, icon: "☄️", bio: "" },
  { id: 11, name: "Crew Member 11", points: 0, icon: "🪐", bio: "" },
  { id: 12, name: "Crew Member 12", points: 0, icon: "🔭", bio: "" },
  { id: 13, name: "Crew Member 13", points: 0, icon: "🛠️", bio: "" },
  { id: 14, name: "Crew Member 14", points: 0, icon: "📡", bio: "" },
  { id: 15, name: "Crew Member 15", points: 0, icon: "🎯", bio: "" },
];

// ─── Individual Member Award Tiers ───────────────────────────────────────────
// These are PER MEMBER — each person earns these based on their own points.
//
// 🖼️  TO USE A LOCAL IMAGE for an award icon:
//     Change the "icon" field to a path like "images/shirt-award.png"
//     Look for "// 🖼️ IMAGE RENDER POINT" in app.js for the render logic.

const AWARDS = [
  {
    points:    500,
    icon:      "🎖️",
    title:     "Flight Cadet",
    desc:      "Your first 500 points logged — the launchpad begins here.",
    color:     "#8B7355",
  },
  {
    points:   1000,
    icon:     "🔧",
    title:    "Wrench Pilot",
    desc:     "1,000 points — you can tell a servo from a sensor.",
    color:    "#6B8E7F",
  },
  {
    points:   2500,
    icon:     "🛩️",
    title:    "Drone Operator",
    desc:     "2,500 points — cleared for solo flight operations.",
    color:    "#4A90D9",
  },
  {
    points:   5000,
    icon:     "🚁",
    title:    "Rotary Wing Ace",
    desc:     "5,000 points — rotors spinning, altitude rising.",
    color:    "#7B68EE",
  },
  {
    points:  10000,
    icon:    "👕",  // 🖼️ swap to "images/somars-shirt.png" if you add the image
    title:   "Free SOMARS Shirt",
    desc:    "10,000 points — you've earned your wings AND the merch.",
    color:   "#E8A020",
    special: true,
  },
  {
    points:  25000,
    icon:    "🌍",
    title:   "Mission Specialist",
    desc:    "25,000 points — cross-disciplinary aerospace contributor.",
    color:   "#20C997",
  },
  {
    points:  50000,
    icon:    "🛸",
    title:   "Senior Flight Engineer",
    desc:    "50,000 points — you live and breathe avionics.",
    color:   "#FF6B6B",
  },
  {
    points:  75000,
    icon:    "🛰️",
    title:   "Orbital Technician",
    desc:    "75,000 points — your contributions orbit the club.",
    color:   "#9B59B6",
  },
  {
    points: 100000,
    icon:   "🍽️",  // 🖼️ swap to "images/nathan-dinner.png" if you add the image
    title:  "Dinner with Nathan",
    desc:   "100,000 points — the legendary reward. Dinner with the man, the myth, the pilot.",
    color:  "#E74C3C",
    special: true,
  },
  {
    points: 150000,
    icon:   "🚀",
    title:  "Chief Aerospace Officer",
    desc:   "150,000 points — you ARE the mission.",
    color:  "#F39C12",
  },
  {
    points: 250000,
    icon:   "🌌",
    title:  "Interstellar Legend",
    desc:   "250,000 points — beyond the atmosphere, beyond compare.",
    color:  "#1ABC9C",
    special: true,
  },
];

// ─── Group Milestone Rewards ──────────────────────────────────────────────────
// These are based on the COMBINED total points of ALL members together.
// Edit the points values and descriptions below to change the group rewards.
//
// 🖼️  TO USE A LOCAL IMAGE for a group reward icon:
//     Change "icon" to a path like "images/ice-cream.png"

const GROUP_MILESTONES = [
  {
    points:  100000,
    icon:    "🎉",
    title:   "Club Kickoff Party",
    desc:    "100,000 combined points — time to celebrate the launch!",
    color:   "#4A90D9",
  },
  {
    points:  250000,
    icon:    "🍕",
    title:   "Pizza Mission",
    desc:    "250,000 combined points — the crew earned a feast.",
    color:   "#E8A020",
  },
  {
    points:  500000,
    icon:    "🍦",  // 🖼️ swap to "images/ice-cream.png" if you add the image
    title:   "Ice Cream Party",
    desc:    "500,000 combined points — every crew member gets a scoop (or three).",
    color:   "#FF6B9D",
    special: true,
  },
  {
    points:  750000,
    icon:    "🛩️",
    title:   "Field Trip Flight Day",
    desc:    "750,000 combined points — a full club outing to the airfield.",
    color:   "#20C997",
  },
  {
    points: 1000000,
    icon:    "🏡",  // 🖼️ swap to "images/nathan-house.png" if you add the image
    title:   "Dinner Party at Nathan's",
    desc:    "1,000,000 combined points — the ultimate reward. The whole crew, Nathan's house.",
    color:   "#E74C3C",
    special: true,
  },
];
