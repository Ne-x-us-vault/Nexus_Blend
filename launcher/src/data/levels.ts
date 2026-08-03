import type { Level } from "../types";

export const LEVELS: Level[] = [
  {
    id: "office",
    number: 1,
    location: "Office",
    title: "Build a Desk",
    difficulty: "Beginner",
    story:
      "A new hire is joining the office team and needs a desk. Model a clean, minimal desk from primitive shapes — once you're done, your model will be sent straight into the game world.",
    requirements: ["Blender 3.6 or later", "NexusBlend bridge installed"],
    objectives: [
      "Shape the desk top from a box",
      "Add four identical legs",
      "Center the model at the world origin",
      "Name the object 'Desk'",
    ],
    constraints: ["Keep everything a single mesh", "Real-world scale in meters", "No imported assets"],
    estimatedMinutes: 30,
    unlocked: true,
    completion: 0,
  },
  {
    id: "kitchen",
    number: 2,
    location: "Kitchen",
    title: "Build a Chair",
    difficulty: "Intermediate",
    story:
      "The kitchen cafe is short on seating. Design a sturdy chair that fits the room's warm style, with proper proportions and clean topology.",
    requirements: ["Blender 3.6 or later", "NexusBlend bridge installed", "Complete Level 1"],
    objectives: [
      "Model the seat and backrest",
      "Add four legs with support rails",
      "Keep the profile symmetric",
      "Match the room's scale",
    ],
    constraints: ["Single mesh object", "Under 2,000 triangles", "Real-world scale in meters"],
    estimatedMinutes: 45,
    unlocked: false,
    completion: 0,
  },
  {
    id: "workshop",
    number: 3,
    location: "Workshop",
    title: "Build a Toolbox",
    difficulty: "Advanced",
    story:
      "The workshop foreman needs a durable toolbox to round out the collection. This is your final challenge — bring together everything you've learned.",
    requirements: ["Blender 3.6 or later", "NexusBlend bridge installed", "Complete Level 2"],
    objectives: [
      "Model a rounded box with a lid",
      "Add a handle",
      "Include a latch detail",
      "Keep the design modular",
    ],
    constraints: ["Single mesh object", "Under 5,000 triangles", "No overlapping geometry"],
    estimatedMinutes: 60,
    unlocked: false,
    completion: 0,
  },
];

export const COURSE_PROGRESS = LEVELS.reduce((sum, level) => sum + level.completion, 0) / LEVELS.length;
