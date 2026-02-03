const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const quotes = [
  {
    id: "quote-001",
    text: "Small steps every day add up to big results.",
    author: "Unknown",
    category: "Productivity",
    isActive: true,
  },
  {
    id: "quote-002",
    text: "Focus on progress, not perfection.",
    author: "Unknown",
    category: "Mindset",
    isActive: true,
  },
  {
    id: "quote-003",
    text: "Discipline is choosing what you want most over what you want now.",
    author: "Unknown",
    category: "Discipline",
    isActive: true,
  },
  {
    id: "quote-004",
    text: "One task at a time is how you win the day.",
    author: "Unknown",
    category: "Focus",
    isActive: true,
  },
  {
    id: "quote-005",
    text: "Your future is created by what you do today, not tomorrow.",
    author: "Unknown",
    category: "Motivation",
    isActive: true,
  },
  {
    id: "quote-006",
    text: "Bugs are just test cases you haven't written yet.",
    author: "Unknown",
    category: "Software Engineering",
    isActive: true,
  },
  {
    id: "quote-007",
    text: "Read the docs before you debug for hours.",
    author: "Unknown",
    category: "Study Tips",
    isActive: true,
  },
  {
    id: "quote-008",
    text: "Good algorithms save more time than faster hardware.",
    author: "Unknown",
    category: "Algorithms",
    isActive: true,
  },
  {
    id: "quote-009",
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
    category: "Software Engineering",
    isActive: true,
  },
  {
    id: "quote-010",
    text: "A clear problem statement is half of the solution.",
    author: "Unknown",
    category: "Problem Solving",
    isActive: true,
  },
  {
    id: "quote-011",
    text: "Notes today prevent panic before exams tomorrow.",
    author: "Unknown",
    category: "Study Tips",
    isActive: true,
  },
  {
    id: "quote-012",
    text: "Ship small commits and your future self will thank you.",
    author: "Unknown",
    category: "Version Control",
    isActive: true,
  },
  {
    id: "quote-013",
    text: "Complexity is a debt; pay it down early.",
    author: "Unknown",
    category: "Software Engineering",
    isActive: true,
  },
  {
    id: "quote-014",
    text: "Practice makes patterns visible.",
    author: "Unknown",
    category: "Data Structures",
    isActive: true,
  },
  {
    id: "quote-015",
    text: "Tests are lecture notes for your code.",
    author: "Unknown",
    category: "Testing",
    isActive: true,
  },
  {
    id: "quote-016",
    text: "Design before code: your architecture is your map.",
    author: "Unknown",
    category: "System Design",
    isActive: true,
  },
  {
    id: "quote-017",
    text: "A good README is a gift to your teammates and your GPA.",
    author: "Unknown",
    category: "Collaboration",
    isActive: true,
  },
  {
    id: "quote-018",
    text: "Refactor a little every day, like brushing your teeth.",
    author: "Unknown",
    category: "Code Quality",
    isActive: true,
  },
  {
    id: "quote-019",
    text: "Think in Big-O, write in small steps.",
    author: "Unknown",
    category: "Algorithms",
    isActive: true,
  },
  {
    id: "quote-020",
    text: "Debug with a hypothesis, not a hunch.",
    author: "Unknown",
    category: "Debugging",
    isActive: true,
  },
  {
    id: "quote-021",
    text: "Build projects that teach you, not just impress others.",
    author: "Unknown",
    category: "Portfolio",
    isActive: true,
  },
  {
    id: "quote-022",
    text: "Version control is time travel for students.",
    author: "Unknown",
    category: "Version Control",
    isActive: true,
  },
  {
    id: "quote-023",
    text: "Break big assignments into tickets and finish faster.",
    author: "Unknown",
    category: "Productivity",
    isActive: true,
  },
  {
    id: "quote-024",
    text: "Study the edge cases; that's where the marks are.",
    author: "Unknown",
    category: "Study Tips",
    isActive: true,
  },
  {
    id: "quote-025",
    text: "Readable code is the best documentation for your future self.",
    author: "Unknown",
    category: "Code Quality",
    isActive: true,
  },
  {
    id: "quote-026",
    text: "You don't fail a lab, you find a better experiment.",
    author: "Unknown",
    category: "Mindset",
    isActive: true,
  },
  {
    id: "quote-027",
    text: "Choose data structures like you choose tools: by the job.",
    author: "Unknown",
    category: "Data Structures",
    isActive: true,
  },
  {
    id: "quote-028",
    text: "A simple design is a scalable design.",
    author: "Unknown",
    category: "System Design",
    isActive: true,
  },
  {
    id: "quote-029",
    text: "Work on one feature until it's done, then commit.",
    author: "Unknown",
    category: "Version Control",
    isActive: true,
  },
  {
    id: "quote-030",
    text: "Your IDE is powerful, but your understanding is stronger.",
    author: "Unknown",
    category: "Mindset",
    isActive: true,
  },
];

const buildDailyMood = (id, date, mood, energy) => ({
  id,
  date,
  mood,
  energy,
});

const dailyMoods = (() => {
  const today = new Date();
  const day = (offset) => {
    const d = new Date(today);
    d.setDate(today.getDate() - offset);
    d.setHours(9, 0, 0, 0);
    return d;
  };

  return [
    buildDailyMood("mood-001", day(0), "Happy", 7),
    buildDailyMood("mood-002", day(1), "Neutral", 5),
    buildDailyMood("mood-003", day(2), "VeryHappy", 8),
    buildDailyMood("mood-004", day(3), "Stressed", 4),
    buildDailyMood("mood-005", day(4), "Happy", 6),
    buildDailyMood("mood-006", day(5), "Neutral", 5),
    buildDailyMood("mood-007", day(6), "Sad", 3),
    buildDailyMood("mood-008", day(7), "Happy", 7),
    buildDailyMood("mood-009", day(8), "VeryHappy", 8),
    buildDailyMood("mood-010", day(9), "Neutral", 5),
    buildDailyMood("mood-011", day(10), "Stressed", 4),
    buildDailyMood("mood-012", day(11), "Happy", 6),
    buildDailyMood("mood-013", day(12), "Neutral", 5),
    buildDailyMood("mood-014", day(13), "Happy", 7),
  ];
})();

async function main() {
  const existingQuotes = await prisma.quote.count();
  if (existingQuotes === 0) {
    await prisma.quote.createMany({ data: quotes });
  }

  const existingDailyMoods = await prisma.dailyMood.count();
  if (existingDailyMoods === 0) {
    await prisma.dailyMood.createMany({ data: dailyMoods });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
