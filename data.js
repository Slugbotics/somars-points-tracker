// ─── SOMARS Points Tracker · data.js ────────────────────────────────────────
// Default member list — names can be changed via the UI (stored in localStorage)

const DEFAULT_MEMBERS = [
  { id: 1,  name: "Crew Member 1",  points: 0, icon: "🚀" },
  { id: 2,  name: "Crew Member 2",  points: 0, icon: "🛸" },
  { id: 3,  name: "Crew Member 3",  points: 0, icon: "✈️" },
  { id: 4,  name: "Crew Member 4",  points: 0, icon: "🛩️" },
  { id: 5,  name: "Crew Member 5",  points: 0, icon: "🚁" },
  { id: 6,  name: "Crew Member 6",  points: 0, icon: "🛰️" },
  { id: 7,  name: "Crew Member 7",  points: 0, icon: "🌟" },
  { id: 8,  name: "Crew Member 8",  points: 0, icon: "⭐" },
  { id: 9,  name: "Crew Member 9",  points: 0, icon: "🌙" },
  { id: 10, name: "Crew Member 10", points: 0, icon: "☄️" },
  { id: 11, name: "Crew Member 11", points: 0, icon: "🪐" },
  { id: 12, name: "Crew Member 12", points: 0, icon: "🔭" },
  { id: 13, name: "Crew Member 13", points: 0, icon: "🛠️" },
  { id: 14, name: "Crew Member 14", points: 0, icon: "📡" },
  { id: 15, name: "Crew Member 15", points: 0, icon: "🎯" },
];

// ─── Award Tiers ─────────────────────────────────────────────────────────────
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
    icon:    "👕",
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
    icon:   "🍽️",
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
