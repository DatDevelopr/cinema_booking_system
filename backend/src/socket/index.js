const socketIO = require("socket.io");

let io;

module.exports = {
  init: (server) => {
    io = socketIO(server, {
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      console.log("🔌 Client connected:", socket.id);

      socket.on("join_showtime", (showtimeId) => {
        socket.join(`showtime_${showtimeId}`);
      });

      socket.on("leave_showtime", (showtimeId) => {
        socket.leave(`showtime_${showtimeId}`);
      });

      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
  },

  // ✅ THÊM CÁI NÀY
  emitSeatUpdate: (showtimeId, data) => {
    if (!io) return;
    io.to(`showtime_${showtimeId}`).emit("seat_update", data);
  },
};