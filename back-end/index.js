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
  totalScore: { type: Number },
  writtenTestStatus: { type: String, enum: ['', 'Selected', 'Not Selected', 'On Hold'], default: '' },
  groupDiscussionStatus: { type: String, enum: ['', 'Selected', 'Not Selected', 'On Hold'], default: '' },
  writtenTestScore: { type: Number, enum: ratingValues, default: 0 },
  groupDiscussionScore: { type: Number, enum: ratingValues, default: 0 },
  preliminaryTestsRemarks: { type: String },
  l1ConductedBy: { type: String },
  l1ConductedDate: { type: Date },
  l1Status: { type: String, enum: ['', 'Selected', 'Not Selected', 'On Hold'], default: '' },
  l1Remarks: { type: String },
  l1Communication: { type: Number, enum: ratingValues, required: true },
  l1TechnicalSkill: { type: Number, enum: ratingValues, required: true },
  l1ProgrammingLanguageSkill: { type: Number, enum: ratingValues, required: true },
  l1DatabaseSkill: { type: Number, enum: ratingValues, required: true },
  l1AttitudeTowardsLearning: { type: Number, enum: ratingValues, required: true },
  l1DevExperience: { type: Number, enum: ratingValues, required: true },
  l1Score: { type: Number },
  l2ConductedBy: { type: String },
  l2ConductedDate: { type: Date },
  l2Status: { type: String, enum: ['', 'Selected', 'Not Selected', 'On Hold'], default: '' },
  l2Remarks: { type: String },
  l2Communication: { type: Number, enum: ratingValues, required: true },
  l2TechnicalSkill: { type: Number, enum: ratingValues, required: true },
  l2ProgrammingLanguageSkill: { type: Number, enum: ratingValues, required: true },
  l2DatabaseSkill: { type: Number, enum: ratingValues, required: true },
  l2AttitudeTowardsLearning: { type: Number, enum: ratingValues, required: true },
  l2DevExperience: { type: Number, enum: ratingValues, required: true },
  l2Score: { type: Number },
}, { timestamps: true });
const Candidate = recruitmentConnection.model('Candidate', candidateSchema);

// Login Endpoint
// No user database exists yet, so credentials are validated against a single
// configurable demo account (defaults to demo/1234, matching the front-end's
// pre-filled login form) rather than a per-user lookup.
const DEMO_LOGIN_ID = process.env.DEMO_LOGIN_ID || 'demo';
const DEMO_LOGIN_PASSWORD = process.env.DEMO_LOGIN_PASSWORD || '1234';

app.post('/api/login', async (req, res) => {
  const { loginId, password } = req.body || {};
  if (!loginId || !password) {
    return res.status(400).json({ error: 'Login ID and password are required.' });
  }
  if (loginId !== DEMO_LOGIN_ID || password !== DEMO_LOGIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid login ID or password.' });
  }
  res.json({ success: true, message: 'Login successful.' });
});

// CRUD Endpoints
app.get('/api/trainings', async (req, res) => {
  const trainings = await Training.find();
  res.json(trainings);
});

app.post('/api/trainings', async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Request body is required.' });
  }
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
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Request body is required.' });
  }
  const data = { ...req.body, startDate: new Date(req.body.startDate), endDate: new Date(req.body.endDate) };
  const training = await Training.findByIdAndUpdate(req.params.id, data, { new: true });
  res.json(training);
});

// Updates a training record by empId rather than Mongo _id. If more than one
// record exists for the employee, the first match is updated.
app.put('/api/trainings/employee/:empId', async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Request body is required.' });
  }
  const data = { ...req.body, startDate: new Date(req.body.startDate), endDate: new Date(req.body.endDate) };
  const training = await Training.findOneAndUpdate({ empId: req.params.empId }, data, { new: true });
  if (!training) {
    return res.status(404).json({ error: 'No training record found for the given empId.' });
  }
  res.json(training);
});

app.delete('/api/trainings/:id', async (req, res) => {
  await Training.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// Deletes every training record for the given empId, i.e. the employee's
// entire training history.
app.delete('/api/trainings/employee/:empId', async (req, res) => {
  const result = await Training.deleteMany({ empId: req.params.empId });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'No training record found for the given empId.' });
  }
  res.json({ deletedCount: result.deletedCount });
});

// Candidate Assessment CRUD Endpoints
app.get('/api/candidates', async (req, res) => {
  const candidates = await Candidate.find();
  res.json(candidates);
});

// Empty date-input strings ('') would fail Mongoose's Date cast, so normalize
// blank L1/L2 conducted dates to null before writing to the database.
// l1Score, l2Score and totalScore are always recomputed server-side from the
// rating fields rather than trusting whatever (if anything) the client sends.
const sumFields = (body, fields) =>
  fields.reduce((sum, field) => sum + (Number(body[field]) || 0), 0);

const L1_SCORE_FIELDS = [
  'l1Communication',
  'l1TechnicalSkill',
  'l1ProgrammingLanguageSkill',
  'l1DatabaseSkill',
  'l1AttitudeTowardsLearning',
  'l1DevExperience',
];
const L2_SCORE_FIELDS = [
  'l2Communication',
  'l2TechnicalSkill',
  'l2ProgrammingLanguageSkill',
  'l2DatabaseSkill',
  'l2AttitudeTowardsLearning',
  'l2DevExperience',
];

const normalizeCandidateData = (body = {}) => {
  const l1Score = sumFields(body, L1_SCORE_FIELDS);
  const l2Score = sumFields(body, L2_SCORE_FIELDS);
  const preliminaryScore = sumFields(body, ['writtenTestScore', 'groupDiscussionScore']);
  return {
    ...body,
    l1ConductedDate: body.l1ConductedDate || null,
    l2ConductedDate: body.l2ConductedDate || null,
    l1Score,
    l2Score,
    totalScore: preliminaryScore + l1Score + l2Score,
  };
};

app.post('/api/candidates', async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Request body is required.' });
  }
  const candidate = new Candidate(normalizeCandidateData(req.body));
  await candidate.save();
  res.status(201).json(candidate);
});

app.put('/api/candidates/:id', async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Request body is required.' });
  }
  const candidate = await Candidate.findByIdAndUpdate(req.params.id, normalizeCandidateData(req.body), { new: true });
  res.json(candidate);
});

app.delete('/api/candidates/:id', async (req, res) => {
  await Candidate.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// Gets candidate assessment records for a specific candidate by candidateId.
app.get('/api/candidates/candidate/:candidateId', async (req, res) => {
  const candidates = await Candidate.find({ candidateId: req.params.candidateId });
  res.json(candidates);
});

// Updates a candidate assessment record by candidateId rather than Mongo _id.
// If more than one record exists for the candidate, the first match is updated.
app.put('/api/candidates/candidate/:candidateId', async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Request body is required.' });
  }
  const candidate = await Candidate.findOneAndUpdate(
    { candidateId: req.params.candidateId },
    normalizeCandidateData(req.body),
    { new: true }
  );
  if (!candidate) {
    return res.status(404).json({ error: 'No candidate record found for the given candidateId.' });
  }
  res.json(candidate);
});

// Deletes every candidate assessment record for the given candidateId.
app.delete('/api/candidates/candidate/:candidateId', async (req, res) => {
  const result = await Candidate.deleteMany({ candidateId: req.params.candidateId });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'No candidate record found for the given candidateId.' });
  }
  res.json({ deletedCount: result.deletedCount });
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
      { name: 'Auth', description: 'Login and authentication' },
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
 *     LoginRequest:
 *       type: object
 *       required:
 *         - loginId
 *         - password
 *       properties:
 *         loginId:
 *           type: string
 *           example: demo
 *         password:
 *           type: string
 *           format: password
 *           example: '1234'
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Login successful.
 */

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Log in with the demo credentials
 *     description: Validates loginId/password against the demo account (default login ID "demo", password "1234", configurable via the DEMO_LOGIN_ID/DEMO_LOGIN_PASSWORD environment variables). No session or token is issued; the front-end treats a 200 response as authenticated.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Login ID and/or password missing from the request body
 *       401:
 *         description: Invalid login ID or password
 */

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
 *   put:
 *     summary: Update a training record by empId (updates the first matching record if more than one exists)
 *     tags: [Trainings]
 *     parameters:
 *       - in: path
 *         name: empId
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
 *       404:
 *         description: No training record found for the given empId
 *   delete:
 *     summary: Delete all training records for an employee by empId
 *     description: Deletes every training record matching that empId, i.e. the employee's entire training history.
 *     tags: [Trainings]
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Training records deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deletedCount:
 *                   type: number
 *       404:
 *         description: No training record found for the given empId
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
 *         - l1Communication
 *         - l1TechnicalSkill
 *         - l1ProgrammingLanguageSkill
 *         - l1DatabaseSkill
 *         - l1AttitudeTowardsLearning
 *         - l1DevExperience
 *         - l2Communication
 *         - l2TechnicalSkill
 *         - l2ProgrammingLanguageSkill
 *         - l2DatabaseSkill
 *         - l2AttitudeTowardsLearning
 *         - l2DevExperience
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
 *         totalScore:
 *           type: number
 *           readOnly: true
 *           description: preliminaryScore (writtenTestScore + groupDiscussionScore) + l1Score + l2Score. Computed server-side; any client-supplied value is ignored.
 *         writtenTestStatus:
 *           type: string
 *           enum: ['', Selected, Not Selected, On Hold]
 *         groupDiscussionStatus:
 *           type: string
 *           enum: ['', Selected, Not Selected, On Hold]
 *         writtenTestScore:
 *           type: number
 *           enum: [0, 1, 2, 3, 4, 5]
 *         groupDiscussionScore:
 *           type: number
 *           enum: [0, 1, 2, 3, 4, 5]
 *         preliminaryTestsRemarks:
 *           type: string
 *         l1ConductedBy:
 *           type: string
 *         l1ConductedDate:
 *           type: string
 *           format: date
 *         l1Status:
 *           type: string
 *           enum: ['', Selected, Not Selected, On Hold]
 *         l1Remarks:
 *           type: string
 *         l1Communication:
 *           type: number
 *           enum: [0, 1, 2, 3, 4, 5]
 *         l1TechnicalSkill:
 *           type: number
 *           enum: [0, 1, 2, 3, 4, 5]
 *         l1ProgrammingLanguageSkill:
 *           type: number
 *           enum: [0, 1, 2, 3, 4, 5]
 *         l1DatabaseSkill:
 *           type: number
 *           enum: [0, 1, 2, 3, 4, 5]
 *         l1AttitudeTowardsLearning:
 *           type: number
 *           enum: [0, 1, 2, 3, 4, 5]
 *         l1DevExperience:
 *           type: number
 *           enum: [0, 1, 2, 3, 4, 5]
 *         l1Score:
 *           type: number
 *           readOnly: true
 *           description: Sum of l1Communication, l1TechnicalSkill, l1ProgrammingLanguageSkill, l1DatabaseSkill, l1AttitudeTowardsLearning and l1DevExperience. Computed server-side; any client-supplied value is ignored.
 *         l2ConductedBy:
 *           type: string
 *         l2ConductedDate:
 *           type: string
 *           format: date
 *         l2Status:
 *           type: string
 *           enum: ['', Selected, Not Selected, On Hold]
 *         l2Remarks:
 *           type: string
 *         l2Communication:
 *           type: number
 *           enum: [0, 1, 2, 3, 4, 5]
 *         l2TechnicalSkill:
 *           type: number
 *           enum: [0, 1, 2, 3, 4, 5]
 *         l2ProgrammingLanguageSkill:
 *           type: number
 *           enum: [0, 1, 2, 3, 4, 5]
 *         l2DatabaseSkill:
 *           type: number
 *           enum: [0, 1, 2, 3, 4, 5]
 *         l2AttitudeTowardsLearning:
 *           type: number
 *           enum: [0, 1, 2, 3, 4, 5]
 *         l2DevExperience:
 *           type: number
 *           enum: [0, 1, 2, 3, 4, 5]
 *         l2Score:
 *           type: number
 *           readOnly: true
 *           description: Sum of l2Communication, l2TechnicalSkill, l2ProgrammingLanguageSkill, l2DatabaseSkill, l2AttitudeTowardsLearning and l2DevExperience. Computed server-side; any client-supplied value is ignored.
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
 * /api/candidates/candidate/{candidateId}:
 *   get:
 *     summary: Get candidate assessment records for a specific candidate by candidateId
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of candidate assessment records for the candidate
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Candidate'
 *   put:
 *     summary: Update a candidate assessment record by candidateId (updates the first matching record if more than one exists)
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: candidateId
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
 *       404:
 *         description: No candidate record found for the given candidateId
 *   delete:
 *     summary: Delete all candidate assessment records for a candidate by candidateId
 *     description: Deletes every candidate assessment record matching that candidateId.
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Candidate assessment records deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deletedCount:
 *                   type: number
 *       404:
 *         description: No candidate record found for the given candidateId
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

// Central error handler. Express 5 forwards any error thrown/rejected by an
// async route handler here automatically, so route handlers don't need their
// own try/catch. Without this, an unhandled error (e.g. a Mongoose
// ValidationError from a missing required field) falls through to Express's
// default handler, which returns a bare "Internal Server Error" HTML page
// with no indication of what actually went wrong.
app.use((err, req, res, next) => {
  console.error(`Error handling ${req.method} ${req.originalUrl}:`, err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed.',
      details: Object.fromEntries(
        Object.entries(err.errors).map(([field, e]) => [field, e.message])
      ),
    });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid value for field "${err.path}".` });
  }

  res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
