// Centralized role category configuration
// Change colors here to update them throughout the entire app

export const ROLE_CATEGORIES = {
  "Town": {
    color: "#3282b8", // Blue
  },
  "Town Investigative": {
    color: "#32b892", // Bluey green
  },
  "Town Protective": {
    color: "#719fbe", // Blue Grey
  },
  "Town Killing": {
    color: "#ede918", // Yellow
  },
  "Town Negative": {
    color: "#6c5ce7", // Purple
  },
  "Werewolf": {
    color: "#ff4757", // Red
  },
  "Neutral Benign": {
    color: "#ffa502", // Orange
  },
  "Neutral Apocalypse": {
    color: "#e84118", // Dark Red
  },
  "Other": {
    color: "#a0a0a0", // Gray
  },
};

// Role to category mappings based on Roles.java
export const ROLE_CATEGORY_MAPPINGS = {
  // Town Investigative
  Seer: "Town Investigative",
  Apprentice_Seer: "Town Investigative",
  Aura_Seer: "Town Investigative",
  Ghost: "Town Investigative",
  Private_Investigator: "Town Investigative",
  Clockmaker: "Town Investigative",
  Tracker: "Town Investigative",
  Lookout: "Town Investigative",
  Empath: "Town Investigative",

  // Town Protective
  Bodyguard: "Town Protective",
  Witch: "Town Protective",
  Escort: "Town Protective",
  Trickster: "Town Protective",

  // Town Killing
  Deputy: "Town Killing",
  Vigilante: "Town Killing",
  Veteran: "Town Killing",
  Hunter: "Town Killing",

  // Town Negative
  Cupid: "Town Negative",
  Lycan: "Town Negative",
  Cursed: "Town Negative",

  // Werewolf
  Werewolf: "Werewolf",
  Sorceror: "Werewolf",
  Cubwolf: "Werewolf",
  Hexwolf: "Werewolf",
  Mistwolf: "Werewolf",
  Consort: "Werewolf",

  // Neutral Benign
  Doppelganger: "Neutral Benign",
  Tanner: "Neutral Benign",
  Executioner: "Neutral Benign",

  // Neutral Apocalypse
  Arsonist: "Neutral Apocalypse",
  Serial_Killer: "Neutral Apocalypse",
  Pestilence: "Neutral Apocalypse",
  Grave_Digger: "Neutral Apocalypse",
  Doom_sayer: "Neutral Apocalypse",

  // Town (basic role with no special ability)
  Villager: "Town",
};

// Helper function to get category color for a role
export const getRoleCategoryColor = (roleName) => {
  const category = ROLE_CATEGORY_MAPPINGS[roleName] || "Other";
  return ROLE_CATEGORIES[category]?.color || ROLE_CATEGORIES["Other"].color;
};
