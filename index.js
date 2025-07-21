require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Employee Training Schema
const trainingSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  course: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['Completed', 'In Progress', 'Not Started'], required: true },
  trainerName: { type: String, required: true },
  trainingType: { type: String, enum: ['Udemy', 'Coursera', 'Classroom', 'Virtual'], required: true },
  percentCompleted: { type: Number, min: 0, max: 100, default: 0 },
  projectName: { type: String, enum: process.env.PROJECT_NAMES ? process.env.PROJECT_NAMES.split(',') : ['ABC', 'CDE', 'EFG','HIJ','KLM'], required: true },
});
const Training = mongoose.model('Training', trainingSchema);

// CRUD Endpoints
app.get('/api/trainings', async (req, res) => {
  const trainings = await Training.find();
  res.json(trainings);
});

app.post('/api/trainings', async (req, res) => {
  const data = { ...req.body, startDate: new Date(req.body.startDate), endDate: new Date(req.body.endDate) };
  const training = new Training(data);
  await training.save();
  res.status(201).json(training);
});

app.put('/api/trainings/:id', async (req, res) => {
  const data = { ...req.body, startDate: new Date(req.body.startDate), endDate: new Date(req.body.endDate) };
  const training = await Training.findByIdAndUpdate(req.params.id, data, { new: true });
  res.json(training);
});

app.delete('/api/trainings/:id', async (req, res) => {
  await Training.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// Swagger API documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Employee Training API',
      version: '1.0.0',
      description: 'API for managing employee training records',
    },
    servers: [
      { url: 'http://localhost:' + (process.env.PORT || 5000) }
    ],
  },
  apis: ['./index.js'], // Path to the API docs
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Training:
 *       type: object
 *       required:
 *         - employeeName
 *         - course
 *         - startDate
 *         - endDate
 *         - status
 *         - trainerName
 *         - trainingType
 *         - projectName
 *       properties:
 *         employeeName:
 *           type: string
 *         course:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [Completed, In Progress, Not Started]
 *         trainerName:
 *           type: string
 *         trainingType:
 *           type: string
 *           enum: [Udemy, Coursera, Classroom, Virtual]
 *         percentCompleted:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         projectName:
 *           type: string
 *           enum: [ABC, CDE, EFG,HIJ,KLM]
 */

/**
 * @swagger
 * /api/trainings:
 *   get:
 *     summary: Get all training records
 *     responses:
 *       200:
 *         description: List of training records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Training'
 *   post:
 *     summary: Create a new training record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Training'
 *     responses:
 *       201:
 *         description: Training record created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Training'
 */

/**
 * @swagger
 * /api/trainings/{id}:
 *   put:
 *     summary: Update a training record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Training'
 *     responses:
 *       200:
 *         description: Training record updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Training'
 *   delete:
 *     summary: Delete a training record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Training record deleted
 */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
