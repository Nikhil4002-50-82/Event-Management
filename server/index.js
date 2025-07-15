import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";

const app=express();
const port=5000;

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(morgan("dev"));

app.listen(port,()=>{
    console.log(`Server running on port ${port}.`);
});