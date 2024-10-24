import { client } from "./index.js";
import { ObjectId } from "mongodb";
import express from 'express';
const router = express.Router();

// add new task
router.post('/:boardId/:sectionId', async (req, res) => {
    try {
        const { boardId, sectionId } = req.params;
        const { name, dueDate, assignee, description, id } = req.body;
        const objectIdBoard = new ObjectId(boardId);
        const objectIdSection = new ObjectId(sectionId);
        const board = await client.db('Kanban-board-app').collection('Boards').findOne({ _id: objectIdBoard });
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }
        const sectionIndex = board.sections.findIndex(section => section._id.equals(objectIdSection));

        if (sectionIndex === -1) {
            return res.status(404).json({ error: 'Section not found' });
        }
        const task = {
            _id: new ObjectId(),
            name,
            dueDate,
            assignee,
            description,
            id
        };
        board.sections[sectionIndex].tasks.push(task);
        await client.db('Kanban-board-app').collection('Boards').updateOne(
            { _id: objectIdBoard, 'sections._id': objectIdSection },
            { $push: { 'sections.$.tasks': task } }
        );
        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// get all tasks function
router.get('/:boardId/:sectionId', async (req, res) => {
    try {
        const { boardId, sectionId } = req.params;
        const objectIdBoard = new ObjectId(boardId);
        const objectIdSection = new ObjectId(sectionId);

        const board = await client.db('Kanban-board-app').collection('Boards').findOne({ _id: objectIdBoard });

        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }
        const sectionIndex = board.sections.findIndex(section => section._id.equals(objectIdSection));
        if (sectionIndex === -1) {
            return res.status(404).json({ error: 'Section not found' });
        }
        const section = board.sections[sectionIndex];
        if (!section) {
            return res.status(404).json({ error: 'Section not found' });
        }
        res.json(section.tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// update task
router.put('/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const { name, dueDate, assignee } = req.body;
        const task = await client.db('Kanban-board-app').collection('Tasks').findOne({ _id: new ObjectId(taskId) });
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        const updatedTask = {
            name,
            dueDate,
            assignee
        };
        await client.db('Kanban-board-app').collection('Tasks').updateOne({ _id: new ObjectId(taskId) }, { $set: updatedTask });
        res.json(updatedTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// delete a task
router.delete('/:boardId/:sectionId/:taskId', async (req, res) => {
    try {
        const { boardId, sectionId, taskId } = req.params;
        const objectIdBoard = new ObjectId(boardId);
        const objectIdSection = new ObjectId(sectionId);
        const board = await client.db('Kanban-board-app').collection('Boards').findOne({ _id: objectIdBoard });

        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }
        const sectionIndex = board.sections.findIndex(section => section._id.equals(objectIdSection));
        if (sectionIndex === -1) {
            return res.status(404).json({ error: 'Section not found' });
        }
        const section = board.sections[sectionIndex];
        const taskIndex = section.tasks.findIndex(task => {
            return task._id.toString() === taskId;
        });
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Task not found' });
        }
        section.tasks.splice(taskIndex, 1);
        await client.db('Kanban-board-app').collection('Boards').updateOne(
            { _id: objectIdBoard },
            { $set: { sections: board.sections } }
        );
        res.json(board.sections);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


export const tasksRouter = router;