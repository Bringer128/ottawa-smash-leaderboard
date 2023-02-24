import registerCommand from "./register.js";
import showLeaderboardCommand from "./show-leaderboard.js";
import removeCommand from "./remove.js";
import { Command } from "../discord/Discord"

export default [registerCommand, showLeaderboardCommand, removeCommand] as Command[];
