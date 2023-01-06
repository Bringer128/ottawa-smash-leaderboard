export default {
  name: "register",
  description: "Register your connect code to the leaderboard",
  type: 1, // CHAT_INPUT aka slash commands
  options: [
    {
      name: "connect-code",
      description: "Your Slippi connect code e.g. BRGR#785",
      type: 3, // STRING
      required: true,
    },
  ],
};
