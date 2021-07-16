const express = require("express");

const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

module.exports = app;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server up and running");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjToResponsiveObj = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayerDetails = `select * from cricket_team`;
  const getDetails = await db.all(getPlayerDetails);
  response.send(
    getDetails.map((eachPlayer) => convertDbObjToResponsiveObj(eachPlayer))
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    select * from cricket_team where
    player_id = ${playerId};`;
  const player = await db.get(getPlayer);
  response.send(player);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO cricket_team ( player_name, jersey_number, role )
    VALUES (
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    );`;
  await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const updatedPlayerDetails = request.body;
  const { playerName, jerseyNumber, role } = updatedPlayerDetails;
  const updateQuery = `
    update cricket_team 
    set player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    where player_id = ${playerId};`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    delete from cricket_team where player_id = ${playerId};
    `;
  await db.run(deleteQuery);
  response.send("Player Removed");
});
