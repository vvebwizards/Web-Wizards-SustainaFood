// src/data/quizData.ts
export interface QuizItem {
  question: string;
  options: string[];
  answer: string; // "A" | "B" | "C" | "D"
}

// An array of levels; each level is an array of 3 questions
export const quizData: QuizItem[][] = [
  // Level 1
  [
    {
      question: "What percentage of global food is wasted annually?",
      options: ["A. 10%", "B. 25%", "C. 33%", "D. 50%"],
      answer: "C",
    },
    {
      question: "Which of these reduces home food waste?",
      options: [
        "A. Overbuying groceries",
        "B. Freezing leftovers",
        "C. Plating extra food",
        "D. Ignoring expiration dates",
      ],
      answer: "B",
    },
    {
      question: "Which label means “best before”?",
      options: ["A. Use-by", "B. Packed-on", "C. Best before", "D. Sell by"],
      answer: "C",
    },
  ],

  // Level 2
  [
    {
      question: "Which is the largest contributor to food waste?",
      options: ["A. Agriculture losses", "B. Retail stores", "C. Household waste", "D. Restaurants"],
      answer: "A",
    },
    {
      question: "What can you compost at home?",
      options: ["A. Plastic wrappers", "B. Eggshells", "C. Cheese rinds", "D. Metal cans"],
      answer: "B",
    },
    {
      question: "How long can you store cooked rice in the fridge?",
      options: ["A. 1–2 days", "B. 4–5 days", "C. 1 week", "D. 2 weeks"],
      answer: "A",
    },
  ],

  // Level 3
  [
    {
      question: "Which packaging helps keep produce fresh longer?",
      options: [
        "A. Airtight plastic bags",
        "B. Bare on shelf",
        "C. Damp paper towel wrap",
        "D. Stored upside-down",
      ],
      answer: "C",
    },
    {
      question: "Best way to thaw frozen meat?",
      options: [
        "A. Countertop at room temp",
        "B. Cold water bath",
        "C. Directly in skillet",
        "D. Hot water soak",
      ],
      answer: "B",
    },
    {
      question: "What’s a zero-waste grocery choice?",
      options: ["A. Bulk bins", "B. Pre-packaged salad", "C. Single-use produce bags", "D. Individually wrapped fruit"],
      answer: "A",
    },
  ],

  // Level 4
  [
    {
      question: "Which of these is NOT a food preservative method?",
      options: ["A. Pickling", "B. Canning", "C. Fermentation", "D. Flash freezing"],
      answer: "D",
    },
    {
      question: "What is “ugly produce” campaigns?",
      options: [
        "A. Selling imperfect fruits",
        "B. Marketing premium cherry-picked produce",
        "C. Banning misshapen vegetables",
        "D. Discouraging farmers' markets",
      ],
      answer: "A",
    },
    {
      question: "Which nutrient degrades fastest in stored vegetables?",
      options: ["A. Vitamin A", "B. Protein", "C. Fat", "D. Carbohydrate"],
      answer: "A",
    },
  ],

  // Level 5
  [
    {
      question: "Which country pioneered nationwide food-waste laws?",
      options: ["A. France", "B. USA", "C. Japan", "D. Canada"],
      answer: "A",
    },
    {
      question: "Which app helps you share surplus food locally?",
      options: ["A. FoodSaver", "B. Too Good To Go", "C. FastFood", "D. QuickMeal"],
      answer: "B",
    },
    {
      question: "What’s the average water footprint per kilogram of beef?",
      options: ["A. 500 L", "B. 1,000 L", "C. 15,000 L", "D. 100,000 L"],
      answer: "C",
    },
  ],
];
