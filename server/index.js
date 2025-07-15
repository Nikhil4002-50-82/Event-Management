import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";
import {Pool} from "pg";

const app=express();
const port=5000;

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(morgan("dev"));

const db=new Pool({
    host:process.env.host,
    user:process.env.user,
    port:"5432",
    database:process.env.database,
    password:process.env.password,
});

app.listen(port,()=>{
    console.log(`Server running on port ${port}.`);
});