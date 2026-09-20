// Sample payloads used by the seed scripts under testing/tests. Field names
// and required-ness mirror the Mongoose schemas in back-end/index.js
// (trainingSchema / candidateSchema) — keep them in sync if those change.

export interface SampleTraining {
  empId: string;
  employeeName: string;
  course: string;
  startDate: string;
  endDate: string;
  status: 'Completed' | 'In Progress' | 'Not Started';
  trainerName: string;
  trainingType: 'Udemy' | 'Coursera' | 'Classroom' | 'Virtual';
  percentCompleted: number;
  projectName: string;
}

export const sampleTrainings: SampleTraining[] = [
  {
    empId: 'EMP-1001',
    employeeName: 'Aditi Sharma',
    course: 'React Fundamentals',
    startDate: '2026-01-05',
    endDate: '2026-02-05',
    status: 'Completed',
    trainerName: 'Rahul Verma',
    trainingType: 'Udemy',
    percentCompleted: 100,
    projectName: 'ABC',
  },
  {
    empId: 'EMP-1002',
    employeeName: 'Karan Mehta',
    course: 'Node.js Advanced',
    startDate: '2026-02-01',
    endDate: '2026-03-01',
    status: 'In Progress',
    trainerName: 'Sneha Iyer',
    trainingType: 'Coursera',
    percentCompleted: 60,
    projectName: 'CDE',
  },
  {
    empId: 'EMP-1003',
    employeeName: 'Priya Nair',
    course: 'MongoDB Essentials',
    startDate: '2026-01-15',
    endDate: '2026-02-15',
    status: 'Not Started',
    trainerName: 'Arjun Rao',
    trainingType: 'Virtual',
    percentCompleted: 0,
    projectName: 'EFG',
  },
  {
    empId: 'EMP-1004',
    employeeName: 'Zoya Khan',
    course: 'TypeScript Deep Dive',
    startDate: '2026-03-01',
    endDate: '2026-04-01',
    status: 'In Progress',
    trainerName: 'Rahul Verma',
    trainingType: 'Classroom',
    percentCompleted: 40,
    projectName: 'HIJ',
  },
  {
    empId: 'EMP-1005',
    employeeName: 'Vikram Singh',
    course: 'AWS Cloud Practitioner',
    startDate: '2026-02-10',
    endDate: '2026-03-10',
    status: 'Completed',
    trainerName: 'Sneha Iyer',
    trainingType: 'Udemy',
    percentCompleted: 100,
    projectName: 'KLM',
  },
];

// Rating fields (l1*/l2*, writtenTestScore, groupDiscussionScore) are 0-5.
export interface SampleCandidate {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  course: string;
  department: string;
  writtenTestStatus: string;
  groupDiscussionStatus: string;
  writtenTestScore: number;
  groupDiscussionScore: number;
  preliminaryTestsRemarks: string;
  l1ConductedBy: string;
  l1ConductedDate: string;
  l1Status: string;
  l1Remarks: string;
  l1Communication: number;
  l1TechnicalSkill: number;
  l1ProgrammingLanguageSkill: number;
  l1DatabaseSkill: number;
  l1AttitudeTowardsLearning: number;
  l1DevExperience: number;
  l2ConductedBy: string;
  l2ConductedDate: string;
  l2Status: string;
  l2Remarks: string;
  l2Communication: number;
  l2TechnicalSkill: number;
  l2ProgrammingLanguageSkill: number;
  l2DatabaseSkill: number;
  l2AttitudeTowardsLearning: number;
  l2DevExperience: number;
}

export const sampleCandidates: SampleCandidate[] = [
  {
    candidateId: 'CAND-2001',
    candidateName: 'Meera Joshi',
    candidateEmail: 'meera.joshi@example.com',
    course: 'Full Stack Development',
    department: 'Engineering',
    writtenTestStatus: 'Selected',
    groupDiscussionStatus: 'Selected',
    writtenTestScore: 4,
    groupDiscussionScore: 3,
    preliminaryTestsRemarks: 'Strong fundamentals, clear communicator.',
    l1ConductedBy: 'Rahul Verma',
    l1ConductedDate: '2026-01-20',
    l1Status: 'Selected',
    l1Remarks: 'Good problem-solving approach.',
    l1Communication: 4,
    l1TechnicalSkill: 4,
    l1ProgrammingLanguageSkill: 3,
    l1DatabaseSkill: 3,
    l1AttitudeTowardsLearning: 5,
    l1DevExperience: 2,
    l2ConductedBy: 'Sneha Iyer',
    l2ConductedDate: '2026-01-25',
    l2Status: 'Selected',
    l2Remarks: 'Confident in system design basics.',
    l2Communication: 5,
    l2TechnicalSkill: 4,
    l2ProgrammingLanguageSkill: 4,
    l2DatabaseSkill: 3,
    l2AttitudeTowardsLearning: 5,
    l2DevExperience: 3,
  },
  {
    candidateId: 'CAND-2002',
    candidateName: 'Rohan Kapoor',
    candidateEmail: 'rohan.kapoor@example.com',
    course: 'Data Science',
    department: 'Analytics',
    writtenTestStatus: 'Selected',
    groupDiscussionStatus: 'On Hold',
    writtenTestScore: 3,
    groupDiscussionScore: 2,
    preliminaryTestsRemarks: 'Needs more practice articulating ideas.',
    l1ConductedBy: 'Arjun Rao',
    l1ConductedDate: '2026-02-02',
    l1Status: 'Selected',
    l1Remarks: 'Solid statistics background.',
    l1Communication: 3,
    l1TechnicalSkill: 4,
    l1ProgrammingLanguageSkill: 4,
    l1DatabaseSkill: 2,
    l1AttitudeTowardsLearning: 4,
    l1DevExperience: 1,
    l2ConductedBy: 'Rahul Verma',
    l2ConductedDate: '2026-02-06',
    l2Status: 'On Hold',
    l2Remarks: 'Needs a second round on system design.',
    l2Communication: 3,
    l2TechnicalSkill: 3,
    l2ProgrammingLanguageSkill: 3,
    l2DatabaseSkill: 2,
    l2AttitudeTowardsLearning: 4,
    l2DevExperience: 1,
  },
  {
    candidateId: 'CAND-2003',
    candidateName: 'Ananya Reddy',
    candidateEmail: 'ananya.reddy@example.com',
    course: 'DevOps Engineering',
    department: 'Infrastructure',
    writtenTestStatus: 'Selected',
    groupDiscussionStatus: 'Selected',
    writtenTestScore: 5,
    groupDiscussionScore: 4,
    preliminaryTestsRemarks: 'Excellent all-round performance.',
    l1ConductedBy: 'Sneha Iyer',
    l1ConductedDate: '2026-02-10',
    l1Status: 'Selected',
    l1Remarks: 'Strong CI/CD knowledge.',
    l1Communication: 5,
    l1TechnicalSkill: 5,
    l1ProgrammingLanguageSkill: 4,
    l1DatabaseSkill: 4,
    l1AttitudeTowardsLearning: 5,
    l1DevExperience: 4,
    l2ConductedBy: 'Arjun Rao',
    l2ConductedDate: '2026-02-14',
    l2Status: 'Selected',
    l2Remarks: 'Ready for the role.',
    l2Communication: 5,
    l2TechnicalSkill: 5,
    l2ProgrammingLanguageSkill: 4,
    l2DatabaseSkill: 4,
    l2AttitudeTowardsLearning: 5,
    l2DevExperience: 4,
  },
];
