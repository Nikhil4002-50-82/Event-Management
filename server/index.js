import express from "express";
import dotenv from "dotenv";
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
dotenv.config();

const db=new Pool({
    host:process.env.host,
    user:process.env.user,
    port:5432,
    database:process.env.database,
    password:process.env.password,
});

app.post("/createTables",async(req,res)=>{
    try{
        await db.query(`create table events(
        id serial primary key,
        title text,
        dateTime timestamp,
        location text,
        capacity int
        );`)

        await db.query(`create table users(
        id serial primary key,
        name text,
        email text
        );`)

        await db.query(`create table registrations(	
        userid int,
        eventid int,
        primary key(userid,eventid),
        foreign key(userid) references users(id),
        foreign key(eventid) references events(id)
        );`);

        res.status(201).json({message:"Tables created successfully"});
    }
    catch(error){
        console.log(`error message : ${error.message}`);
        res.status(500).json({message:"Error creating tables"});
    }
});

app.post("/addUsers",async(req,res)=>{
    try{
        const {name,email}=req.body;
        if (!name || !email){
            return res.status(400).json({ error: "All fields are required" });
        }
        await db.query('insert into users(name,email) values($1,$2)',[name,email]);
        res.status(201).json({message:"Added user successfully"});
    }
    catch(error){
        console.log(`error message : ${error.message}`);
        res.status(500).json({message:"Error creating an user"});
    }
});

app.post("/addEvents", async (req, res) => {
  try {
    const { title, date, time, location, capacity } = req.body;
    if (!title || !date || !time || !location || !capacity){
      return res.status(400).json({ error: "All fields are required" });
    }
    const datetime = new Date(`${date}T${time}`);
    if (isNaN(datetime)) {
      return res.status(400).json({ error: "Invalid date or time format" });
    }
    if (capacity <= 0 || capacity > 1000) {
      return res.status(400).json({ error: "Capacity must be between 1 and 1000" });
    }

    await db.query(
      `insert into events(title, datetime, location, capacity)
       values ($1, $2, $3, $4)`,[title, datetime, location, capacity]
    );

    res.status(201).json({message: "Event created successfully"});
  } 
  catch (error){
    console.error(`error message: ${error.message}`);
    res.status(500).json({message:"Internal server error while creating an event"});
  }
});


app.listen(port,()=>{
    console.log(`Server running on port ${port}.`);
});