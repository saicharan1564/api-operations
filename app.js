const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
let initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjToResponse = (object) => {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
    jerseyNumber: object.jersey_number,
    role: object.role,
  };
};

//API-1

app.get("/players/", async (request, response) => {
  const getPlayersArray = `
  SELECT
   *
    FROM 
    cricket_team 
    ORDER BY 
    player_id;`;
  const getAllPlayers = await db.all(getPlayersArray);
  response.send(
    getAllPlayers.map((eachObj) => convertDbObjToResponse(eachObj))
  );
});

//API-2

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const createNewPlayerQuery = `INSERT INTO cricket_team (player_name,jersey_number,role) 
    VALUES ('${playerName}',${jerseyNumber},'${role}');`;
  let dbResponse = await db.run(createNewPlayerQuery);
  let playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//API-3

app.get("/players/:playerId/", async (request, response) => {
  const playerDetails = request.body;
  const { playerId } = request.params;
  const getPlayersArray = `SELECT * FROM cricket_team WHERE player_id=${playerId}`;
  const dbResponse = await db.get(getPlayersArray);
  response.send(convertDbObjToResponse(dbResponse));
});

//API-4

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `UPDATE cricket_team SET player_name = '${playerName}',
    jersey_number = ${jerseyNumber},role='${role}'`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API-5

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const removePlayerQuery = `
    DELETE 
    FROM
        cricket_team
    WHERE
        player_id=${playerId};`;
  await db.run(removePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
