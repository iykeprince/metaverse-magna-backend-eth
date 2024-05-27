import * as app from "./app";
import { AppDataSource } from "./commons/db/data-source";

const PORT = process.env.PORT || 8000;

// io.listen(8001, {});
AppDataSource.initialize().then(() => {
  const server = app.init();
  server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
});
