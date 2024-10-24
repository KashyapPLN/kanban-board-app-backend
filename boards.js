import { client } from "./index.js";
import { ObjectId } from "mongodb";
import express from 'express';
const router = express.Router();

// add a new board
router.post('/', async (req, res) => {
    try {
        const { title } = req.body;
        const board = {
            title,
            sections: []
        };
        const result = await client.db('Kanban-board-app').collection('Boards').insertOne(board);
        res.status(201).json({ boardId: result.insertedId });
    } catch (err) {
        console.log('Exception is ', err);
        res.status(500).json({ error: err.message });
    }
});

// get all boards
router.get('/', async (req, res) => {
    try {
        const boards = await client.db('Kanban-board-app').collection('Boards').find().toArray();
        res.json(boards);
    } catch (err) {
        console.log('Exception is ', err);
        res.status(500).json({ error: err.message });
    }
});

// get board  by Id
router.get('/:boardId', async (req, res) => {
    try {
        const { boardId } = req.params;
        const objectId = new ObjectId(boardId);
        const board = await client.db('Kanban-board-app').collection('Boards').findOne({ _id: objectId });
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }
        res.json(board);
    } catch (err) {
        console.log('Exception is ', err);
        res.status(500).json({ error: err.message });
    }
});

// update board by id
router.put('/:boardId', async (req, res) => {
    try {
        const { boardId } = req.params;
        const objectId = new ObjectId(boardId);
        const { title, sections } = req.body;
        const board = await client.db('Kanban-board-app').collection('Boards').findOne({ _id: objectId });
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }
        const updatedBoard = {
            title,
            sections
        };
        await client.db('Kanban-board-app').collection('Boards').updateOne({ _id: objectId }, { $set: updatedBoard });
        res.json(updatedBoard);
    } catch (err) {
        console.log('Exception is ', err);
        res.status(500).json({ error: err.message });
    }
});

// delete board by id
router.delete('/:boardId', async (req, res) => {
    try {
        const { boardId } = req.params;
        const objectId = new ObjectId(boardId);
        const board = await client.db('Kanban-board-app').collection('Boards').findOne({ _id: objectId });
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }
        await client.db('Kanban-board-app').collection('Boards').deleteOne({ _id: objectId });
        await client.db('Kanban-board-app').collection('Sections').deleteMany({ boardId: objectId });
        await client.db('Kanban-board-app').collection('Tasks').deleteMany({ boardId: objectId });

        res.json({ message: 'Board deleted successfully' });
    } catch (err) {
        console.log('Exception is ', err);
        res.status(500).json({ error: err.message });
    }
});

export const boardsRouter = router;