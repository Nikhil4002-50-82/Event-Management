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

//This endpoint creates 3 tables ,that is users ,events and registrations respectively.
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

        res.status(201).json({message:"Tables created successfully"})
    }
    catch(error){
        console.log(`error message : ${error.message}`)
        res.status(500).json({message:"Error creating tables"})
    }
});

//This endpoint adds users to the users table.
app.post("/createUsers",async(req,res)=>{
    try{
        const {name,email}=req.body
        if (!name || !email){
            return res.status(400).json({ error: "All fields are required" })
        }
        await db.query('insert into users(name,email) values($1,$2)',[name,email])
        res.status(201).json({message:"Added user successfully"})
    }
    catch(error){
        console.log(`error message : ${error.message}`)
        res.status(500).json({message:"Error creating an user"})
    }
});

//This endpoint adds the event to the events table.
app.post("/createEvents",async(req,res)=>{
  try {
    const { title,date,time,location,capacity } = req.body
    if (!title || !date || !time || !location || !capacity){
      return res.status(400).json({message:"All fields are required"})
    }
    const datetime = new Date(`${date}T${time}`);
    if (isNaN(datetime)) {
      return res.status(400).json({message:"Invalid format of either date or time"})
    }
    if (capacity <= 0 || capacity > 1000) {
      return res.status(400).json({message: "Capacity must be less than 1000"})
    }
    await db.query(
      `insert into events(title, datetime, location, capacity)
       values ($1, $2, $3, $4)`,[title, datetime, location, capacity]
    )

    res.status(201).json({message:"Event created successfully"})
  } 
  catch (error){
    console.error(`error message: ${error.message}`)
    res.status(500).json({message:"Internal server error while creating an event"})
  }
});

//This endpoint registers an event for a particular user ,where the id of the event must be passed as a parameter in the endpoint. 
app.post("/registerEvent/:id",async(req, res)=>{
  const { userId } = req.body
  const eventId = req.params.id
  try {
    const event = await db.query("select * from events where id = $1",[eventId])
    if(event.rows.length === 0){
      return res.status(404).json({message:"Event not found"})
    }
    const check = await db.query(
      "select * from registrations where userid = $1 and eventid = $2",
      [userId, eventId]
    )
    if(check.rows.length > 0){
      return res.status(400).json({message:"User already registered"})
    }
    await db.query("insert into registrations(userid, eventid) values($1, $2)",[userId,eventId])

    res.status(201).json({message:"User registered to event"})
  }
  catch(error){
    console.log(`error message : ${error.message}`)
    res.status(500).json({message:error.message})
  }
});

//This endpoint retrives event details along with its registered users.
app.get("/event/:id",async(req,res)=>{
  const eventId = req.params.id
  try {
    const eventRes = await db.query("select * from events where id = $1",[eventId])
    if(eventRes.rows.length === 0){
      return res.status(404).json({message:"Event not found"})
    }
    const regUsers = await db.query(
      `select users.id, users.name, users.email
       from registrations
       join users on registrations.userid = users.id
       where registrations.eventid = $1`,
      [eventId]
    )

    res.json({...eventRes.rows[0], registrations: regUsers.rows})
  }
  catch(error){
    console.log(`error message : ${error.message}`)
    res.status(500).json({message:error.message})
  }
});

//This endpoint displays the upcoming events.
app.get("/upcomingEvents",async(req,res)=> {
  try {
    const result = await db.query(`
      select * from events
      where datetime > CURRENT_TIMESTAMP
      order by datetime asc
    `)

    res.json(result.rows)
  }
  catch (error) {
    console.log(`error message : ${error.message}`)
    res.status(500).json({message: error.message})
  }
});

//This endpoint cancels an event for a particular user whose id must be mentioned as a parameter in the endpoint.
app.delete("/cancelEvent/:id",async(req,res)=>{
  const {userId} = req.body
  const eventId = req.params.id
  try {
    const result = await db.query(
      "delete from registrations where userid = $1 and eventid = $2",
      [userId, eventId]
    )
    if(result.rowCount === 0){
      return res.status(400).json({message: "User was not registered for this event"})
    }

    res.json({message:"Registration cancelled"})
  }
  catch (error) {
    console.log(`error message : ${error.message}`)
    res.status(500).json({ error: error.message })
  }
});

//This endpoint displays the stats of a particular event whose id must be mentioned as a parameter in the endpoint.
app.get("/eventStats/:id",async(req, res)=>{
  const eventId = req.params.id
  try {
    const eventRes = await db.query("select * from events where id = $1", [eventId]);
    if(eventRes.rows.length === 0){
      return res.status(404).json({message:"Event not found"})
    }
    const capacity = eventRes.rows[0].capacity
    const regRes = await db.query("select count(*) from registrations where eventid = $1", [eventId])
    const registered = parseInt(regRes.rows[0].count)
    const remaining = capacity - registered

    res.json({
      totalRegistrations: registered,
      remainingCapacity: remaining,
      capacityUsed: ((registered / capacity) * 100).toFixed(2) + "%",
    })
  }
  catch(error){
    console.log(`error message : ${error.message}`)
    res.status(500).json({message:error.message})
  }
});

app.listen(port,()=>{
    console.log(`Server running on port ${port}.`);
});