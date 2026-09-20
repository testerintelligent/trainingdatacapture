import { test, expect } from '@playwright/test';
import { sampleCandidates } from '../fixtures/sample-data';

// Pushes sample candidate assessment records to POST /api/candidates.
// Requires the back-end to be running and pointed at a database you're OK
// writing test data into — this hits the *recruitment* connection
// (RECRUITMENT_MONGODB_URI), see back-end/index.js.
test.describe('Seed sample candidate records', () => {
  for (const candidate of sampleCandidates) {
    test(`creates candidate ${candidate.candidateName} (${candidate.candidateId})`, async ({
      request,
    }) => {
      const response = await request.post('/api/candidates', {
        data: candidate,
      });

      expect(response.status(), await response.text()).toBe(201);

      const created = await response.json();
      expect(created).toMatchObject({
        candidateId: candidate.candidateId,
        candidateName: candidate.candidateName,
        candidateEmail: candidate.candidateEmail,
        course: candidate.course,
        department: candidate.department,
      });
      expect(created._id).toBeTruthy();

      // totalScore/l1Score/l2Score are computed server-side (see
      // normalizeCandidateData in back-end/index.js) — sanity-check they
      // came back rather than pinning exact numbers here.
      expect(typeof created.l1Score).toBe('number');
      expect(typeof created.l2Score).toBe('number');
      expect(typeof created.totalScore).toBe('number');

      console.log(
        `Created candidate ${created._id}: ${created.candidateName} ` +
          `(l1Score=${created.l1Score}, l2Score=${created.l2Score}, totalScore=${created.totalScore})`
      );
    });
  }
});
