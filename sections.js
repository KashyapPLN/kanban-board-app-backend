import { client } from "./index.js";
import { ObjectId } from "mongodb";
import express from 'express';
const router = express.Router()

// function to get all sections

router.get('/:boardId', async (req, res) => {
    try {
        const { boardId } = req.params;

        const board = await client.db('Kanban-board-app').collection('Boards').findOne({ _id: boardId });

        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }

        res.json(board.sections);
    } catch (err) {
           res.status(500).json({ error: err.message });
    }
});

// function to add a new section

router.post('/', async (req, res) => {
    try {
        const { boardId, title, id } = req.body;
        const objectId = new ObjectId(boardId);

        const board = await client.db('Kanban-board-app').collection('Boards').findOne({ _id: objectId });

        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }

        const section = {
            _id: new ObjectId(),
            title,
            id,
            tasks: []
        };

        board.sections.push(section);

        await client.db('Kanban-board-app').collection('Boards').updateOne({ _id: objectId }, { $set: { sections: board.sections } });
        res.status(201).json({ section: board.sections[board.sections.length - 1] });
    } catch (err) {
          res.status(500).json({ error: err.message });
    }
});

// function to update a section title
router.put('/:boardId/:sectionId', async (req, res) => {
    try {
        const { boardId, sectionId } = req.params;
        const { title } = req.body;
        const objectIdBoard = new ObjectId(boardId);
        const objectIdSection = new ObjectId(sectionId);

        // Find the board by its ID
        const board = await client.db('Kanban-board-app').collection('Boards').findOne({ _id: objectIdBoard });

        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }

        const sectionIndex = board.sections.findIndex(section => section._id.equals(objectIdSection));

        if (sectionIndex === -1) {
            return res.status(404).json({ error: 'Section not found' });
        }

        board.sections[sectionIndex].title = title;

        await client.db('Kanban-board-app').collection('Boards').updateOne({ _id: objectIdBoard }, { $set: { sections: board.sections } });

        res.json(board.sections[sectionIndex]);
    } catch (err) {
          res.status(500).json({ error: err.message });
    }
});
// function to update tasks in a section 

router.put('/:boardId/:sectionId/tasks', async (req, res) => {
    try {
        const { boardId, sectionId } = req.params;
        const { tasks } = req.body; // Assuming tasks is an array of tasks to update
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

        board.sections[sectionIndex].tasks = tasks;

        await client.db('Kanban-board-app').collection('Boards').updateOne(
            { _id: objectIdBoard },
            { $set: { sections: board.sections } }
        );

        res.json(board.sections);
    } catch (err) {
          res.status(500).json({ error: err.message });
    }
});

// function to delete a section 

router.delete('/:boardId/:sectionId', async (req, res) => {
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

        board.sections.splice(sectionIndex, 1);

        await client.db('Kanban-board-app').collection('Boards').updateOne({ _id: objectIdBoard }, { $set: { sections: board.sections } });

        res.json(board.sections);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export const sectionsRouter = router;