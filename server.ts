import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initSocketIO } from "./lib/socket-server";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000");

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  initSocketIO(httpServer);
  console.log("[Socket.io] Server berhasil diinisialisasi");

  httpServer.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
  });
});