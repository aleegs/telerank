import mongoose from "mongoose";
import { log } from "../lib/Helpers";

const mongoURL = "mongodb://localhost/telerank";

export default function InitializeDatabase(): Promise<void> {
  return new Promise((resolve) => {
    function connect() {
      mongoose.connect(
        mongoURL,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true,
          useFindAndModify: false,
        },
        (err) => {
          if (err) {
            log.error(`mongoose.connect failed on startup - retrying\n${err}`);
            setTimeout(connect, 3000);
          } else {
            log.info("MongoDB connected");
            mongoose.Promise = global.Promise;
            const db = mongoose.connection;
            db.on("error", (e) => log.error(e));
            resolve();
          }
        }
      );
    }

    connect();
  });
}

export function isDatabaseReady(): boolean {
  return mongoose.connection.readyState === 1;
}
