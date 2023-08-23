import app from "./app.js";
import connecToDb from "./config/database.js";

// connecting to db..
connecToDb();

// connecting to server..

app.listen(process.env.PORT,()=>{
    console.log(`server is running on port ${process.env.PORT}`);
});

