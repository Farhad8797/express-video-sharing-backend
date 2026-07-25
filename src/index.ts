import dotenv from "dotenv";
import { dbConnect } from "./db/dbConnect.js";
import { app } from "./app.js";

dotenv.config();

dbConnect()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Listening to port: ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.error(`Error connecting to database and listening to port`);
    });
