const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at https://localhost:3000");
    });
  } catch (e) {
    console.log(`Error message : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getPlayersList = `
      SELECT 
        player_id AS playerId,
        player_name as playerName
      FROM 
        player_details;`;
  const playersArrays = await db.all(getPlayersList);
  response.send(playersArrays);
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersList = `
      SELECT 
        player_id AS playerId,
        player_name as playerName
      FROM 
        player_details
      WHERE 
        player_id = ${playerId};`;
  const playerArray = await db.get(getPlayersList);
  response.send(playerArray);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updatePlayerName = `
    UPDATE
      player_details
    SET 
      player_name = '${playerName}'
    WHERE 
      player_id = ${playerId};`;
  await db.run(updatePlayerName);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetailsQuery = `
    SELECT
      match_id AS matchId,
      match,
      year
    FROM 
      match_details
    WHERE 
      match_id = ${matchId}`;
  const matchDetails = await db.get(getMatchDetailsQuery);
  response.send(matchDetails);
});

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchDetails = `
    SELECT 
      match_id AS matchId,
      match,
      year
    FROM 
      player_match_score NATURAL JOIN match_details
    WHERE 
      player_id = ${playerId};`;
  const playerMatchDetails = await db.all(getPlayerMatchDetails);
  response.send(playerMatchDetails);
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayersMatchQuery = `
    SELECT 
      player_match_id AS playerId,
      player_name AS playerName
    FROM 
      player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id
    WHERE 
      match_id = ${matchId}`;
  const playerMatchDetails = await db.all(getPlayersMatchQuery);
  response.send(playerMatchDetails);
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersScores = `
    SELECT
      player_details.player_id AS playerId,
      player_details.player_name AS playerName,
      SUM(player_match_score.score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes
      
    FROM 
      player_details INNER JOIN player_match_score ON player_match.player_id= player_match_score.player_id
    WHERE 
      player_Details.player_id = ${playerId};`;
  const playerScores = await db.get(getPlayersScores);
  response.send(playerScores);
});
module.exports = app;
