require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(cors());
app.use(express.json());


const path = require('path');
const environment = process.env.NODE_ENV || 'development';

require('dotenv').config({
  path: path.resolve(__dirname, `.env.${environment}`)
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB - trainingData'));

// Separate MongoDB connection for the recruitment database
const recruitmentConnection = mongoose.createConnection(process.env.RECRUITMENT_MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
recruitmentConnection.on('error', console.error.bind(console, 'MongoDB connection error (recruitment):'));
recruitmentConnection.once('open', () => console.log('Connected to MongoDB - recruitment'));

// Employee Training Schema
const trainingSchema = new mongoose.Schema({
  empId: { type: String, required: true },
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

// Candidate Assessment Schema (stored in the recruitment database)
const ratingValues = [0, 1, 2, 3, 4, 5];
const candidateSchema = new mongoose.Schema({
  candidateId: { type: String, required: true },
  candidateName: { type: String, required: true },
  candidateEmail: { type: String, required: true },
  course: { type: String, required: true },
  department: { type: String, required: true },
  communication: { type: Number, enum: ratingValues, required: true },
  technicalSkill: { type: Number, enum: ratingValues, required: true },
  programmingLanguageSkill: { type: Number, enum: ratingValues, required: true },
  databaseSkill: { type: Number, enum: ratingValues, required: true },
  attitudeTowardsLearning: { type: Number, enum: ratingValues, required: true },
  devExperience: { type: Number, enum: ratingValues, required: true },
  totalScore: { type: Number },
  l1ConductedBy: { type: String },
  l1ConductedDate: { type: Date },
  l1Status: { type: String, enum: ['', 'Selected', 'Non Selected', 'On Hold'], default: '' },
  l2ConductedBy: { type: String },
  l2ConductedDate: { type: Date },
  l2Status: { type: String, enum: ['', 'Selected', 'Non Selected', 'On Hold'], default: '' },
}, { timestamps: true });
const Candidate = recruitmentConnection.model('Candidate', candidateSchema);

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

app.get('/api/trainings/employee/:empId', async (req, res) => {
  const trainings = await Training.find({ empId: req.params.empId });
  res.json(trainings);
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

// Candidate Assessment CRUD Endpoints
app.get('/api/candidates', async (req, res) => {
  const candidates = await Candidate.find();
  res.json(candidates);
});

// Empty date-input strings ('') would fail Mongoose's Date cast, so normalize
// blank L1/L2 conducted dates to null before writing to the database.
// totalScore is always recomputed server-side from the rating fields rather
// than trusting whatever (if anything) the client sends.
const normalizeCandidateData = (body) => ({
  ...body,
  l1ConductedDate: body.l1ConductedDate || null,
  l2ConductedDate: body.l2ConductedDate || null,
  totalScore:
    Number(body.communication) +
    Number(body.technicalSkill) +
    Number(body.programmingLanguageSkill) +
    Number(body.databaseSkill) +
    Number(body.attitudeTowardsLearning) +
    Number(body.devExperience),
});

app.post('/api/candidates', async (req, res) => {
  const candidate = new Candidate(normalizeCandidateData(req.body));
  await candidate.save();
  res.status(201).json(candidate);
});

app.put('/api/candidates/:id', async (req, res) => {
  const candidate = await Candidate.findByIdAndUpdate(req.params.id, normalizeCandidateData(req.body), { new: true });
  res.json(candidate);
});

app.delete('/api/candidates/:id', async (req, res) => {
  await Candidate.findByIdAndDelete(req.params.id);
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
      { url: `${process.env.REACT_APP_API_BASE_URL || 'http://localhost'}:${process.env.PORT || 5002}` }
    ],
    tags: [
      { name: 'Trainings', description: 'Operations related to employee training records' },
      { name: 'Candidates', description: 'Operations related to candidate assessment records' }
    ]
  },
  apis: ['./index.js'], // Path to the API docs
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Ensure the projectName enum in the swagger spec reflects the runtime environment
const projectNames = process.env.PROJECT_NAMES ? process.env.PROJECT_NAMES.split(',').map(s => s.trim()) : ['ABC', 'CDE', 'EFG', 'HIJ', 'KLM'];
if (swaggerSpec) {
  swaggerSpec.components = swaggerSpec.components || {};
  swaggerSpec.components.schemas = swaggerSpec.components.schemas || {};
  // If Training schema exists from JSDoc, update its projectName enum, otherwise create the property
  if (swaggerSpec.components.schemas.Training && swaggerSpec.components.schemas.Training.properties && swaggerSpec.components.schemas.Training.properties.projectName) {
    swaggerSpec.components.schemas.Training.properties.projectName.enum = projectNames;
  } else {
    swaggerSpec.components.schemas.Training = swaggerSpec.components.schemas.Training || { type: 'object', properties: {} };
    swaggerSpec.components.schemas.Training.properties = swaggerSpec.components.schemas.Training.properties || {};
    swaggerSpec.components.schemas.Training.properties.projectName = { type: 'string', enum: projectNames };
  }
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Training:
 *       type: object
 *       required:
 *         - empId
 *         - employeeName
 *         - course
 *         - startDate
 *         - endDate
 *         - status
 *         - trainerName
 *         - trainingType
 *         - projectName
 *       properties:
 *         empId:
 *           type: string
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
 *     tags: [Trainings]
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
 *     tags: [Trainings]
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
 * /api/trainings/employee/{empId}:
 *   get:
 *     summary: Get training records for a specific employee by empId
 *     tags: [Trainings]
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of training records for the employee
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Training'
 */

/**
 * @swagger
 * /api/trainings/{id}:
 *   put:
 *     summary: Update a training record
 *     tags: [Trainings]
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
 *     tags: [Trainings]
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

/**
 * @swagger
 * components:
 *   schemas:
 *     Candidate:
 *       type: object
 *       required:
 *         - candidateId
 *         - candidateName
 *         - candidateEmail
 *         - course
 *         - department
 *         - communication
 *         - technicalSkill
 *         - programmingLanguageSkill
 *         - databaseSkill
 *         - attitudeTowardsLearning
 *         - devExperience
 *       properties:
 *         candidateId:
 *           type: string
 *         candidateName:
 *           type: string
 *         candidateEmail:
 *           type: string
 *         course:
 *           type: string
 *         department:
 *           type: string
 *         communication:
 *           type: number
 *           enum: [0, 1, 2, 3, 4, 5]
 *         technicalSkill:
 *           type: number
 *           enum: [0, 1, 2, 3, 4, 5]
 *         programmingLanguageSkill:
 *           type: number
 *           enum: [0, 1, 2, 3, 4, 5]
 *         databaseSkill:
 *           type: number
 *           enum: [0, 1, 2, 3, 4, 5]
 *         attitudeTowardsLearning:
 *           type: number
 *           enum: [0, 1, 2, 3, 4, 5]
 *         devExperience:
 *           type: number
 *           enum: [0, 1, 2, 3, 4, 5]
 *         totalScore:
 *           type: number
 *           readOnly: true
 *           description: Sum of communication, technicalSkill, programmingLanguageSkill, databaseSkill, attitudeTowardsLearning and devExperience. Computed server-side; any client-supplied value is ignored.
 *         l1ConductedBy:
 *           type: string
 *         l1ConductedDate:
 *           type: string
 *           format: date
 *         l1Status:
 *           type: string
 *           enum: ['', Selected, Non Selected, On Hold]
 *         l2ConductedBy:
 *           type: string
 *         l2ConductedDate:
 *           type: string
 *           format: date
 *         l2Status:
 *           type: string
 *           enum: ['', Selected, Non Selected, On Hold]
 */

/**
 * @swagger
 * /api/candidates:
 *   get:
 *     summary: Get all candidate assessment records
 *     tags: [Candidates]
 *     responses:
 *       200:
 *         description: List of candidate assessment records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Candidate'
 *   post:
 *     summary: Create a new candidate assessment record
 *     tags: [Candidates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Candidate'
 *     responses:
 *       201:
 *         description: Candidate assessment record created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 */

/**
 * @swagger
 * /api/candidates/{id}:
 *   put:
 *     summary: Update a candidate assessment record
 *     tags: [Candidates]
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
 *             $ref: '#/components/schemas/Candidate'
 *     responses:
 *       200:
 *         description: Candidate assessment record updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 *   delete:
 *     summary: Delete a candidate assessment record
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Candidate assessment record deleted
 */

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
