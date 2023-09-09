import {app} from './app';
import { connectDB } from './utils/db';
require("dotenv").config(); // load .env file

// create server
app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
    connectDB();
});
