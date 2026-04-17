require("dotenv").config();
const http = require("http");
const app = require("./app");
const { sequelize } = require("./models");
const socket = require("./socket");
const releaseSeatJob = require("./jobs/releaseSeat.job");

const server = http.createServer(app);

socket.init(server);

releaseSeatJob();

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected");

    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
    });

  } catch (error) {
    console.error("❌ Unable to connect to DB:", error);
  }
})();