import { connectDB } from "./src/config/mongo.config.js";
import dotenv from "dotenv"
import server from "./src/socket/socket.js";

dotenv.config({
    path: "./.env"
})



connectDB()
.then(() => {
    
    server.listen(process.env.PORT, () => {
        console.log("Buyyah you done it => \n");
        console.log(`Server is running on port http://localhost:${process.env.PORT}`);
    })
})

.catch((err) => {
    
    console.log("Error => ", err)
})