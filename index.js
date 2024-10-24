import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient,ObjectId } from "mongodb";
import { boardsRouter } from './boards.js';
import { sectionsRouter } from './sections.js';
import { tasksRouter } from './tasks.js';

const app= express();
app.use(express.json());
app.use(cors());
dotenv.config();
const MONGO_URL = process.env.MONGO_URL;
const PORT =process.env.PORT;

async function createConnection() {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log("Mongo is connected");
    return client;
  }
  export const client = await createConnection();
app.get('/',function (req,res){
    res.send("Hello World");
});

app.get('/employees',async function (req,res){
    try{
        const employees= await client.db('Kanban-board-app').collection('Employees').find(req.query).toArray();
        res.send(employees);
    }catch(ex){
        console.log("Exception is " ,ex);
    }

})




app.use('/boards',boardsRouter);
app.use('/sections',sectionsRouter);
app.use('/tasks',tasksRouter);

app.listen(PORT,()=>console.log(`App Started in ${PORT}`));