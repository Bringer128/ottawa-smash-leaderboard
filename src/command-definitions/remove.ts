export default {
  name: "remove",
  description: "Remove a connect code from the leaderboard",
  type: 1, // CHAT_INPUT aka slash commands
  options: [
    {
      name: "connect-code",
      description: "The Slippi connect code to remove e.g. BRGR#785",
      type: 3, // STRING
      required: true,
    },
  ],
};
