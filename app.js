const express = require("express");

const path = require("path");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initialization = async () => {
  try {
    db = await open({
      filename: dbPath,

      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Started...");
    });
  } catch (e) {
    console.log(`Db error${e.massage}`);

    process.exit(1);
  }
};

initialization();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,

    playerName: dbObject.player_name,

    jerseyNumber: dbObject.jersey_number,

    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const query = `SELECT * FROM cricket_team;`;

  let res = await db.all(query);

  response.send(
    res.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

app.post("/players/", async (request, response) => {
  try {
    const details = request.body;

    const { playerName, jerseyNumber, role } = details;

    const query = `

            INSERT INTO cricket_team (

            player_name,jersey_number,role

            )

            VALUES (

            '${playerName}',

            ${jerseyNumber},

            '${role}'

            );`;

    const res = await db.run(query);

    response.send("Player Added to Team");
  } catch (e) {
    console.log(`db error ${e.massage}`);
  }
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const query = `SELECT * FROM cricket_team WHERE player_id=${playerId};`;

  const res = await db.get(query);

  response.send(convertDbObjectToResponseObject(res));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const details = request.body;

  const { playerName, jerseyNumber, role } = details;

  const query = `

        UPDATE

            cricket_team

        SET

            player_name='${playerName}',

            jersey_number=${jerseyNumber},

            role='${role}'

        WHERE

            player_id = ${playerId};`;

  const res = await db.run(query);

  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const query = `

        DELETE FROM cricket_team

        WHERE player_id=${playerId};`;

  const res = await db.run(query);

  response.send("Player Removed");
});

module.exports = app;
