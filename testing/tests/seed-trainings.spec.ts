import { test, expect } from '@playwright/test';
import { sampleTrainings } from '../fixtures/sample-data';

// Pushes sample training records to POST /api/trainings. Requires the
// back-end to be running (see back-end/README or `npm run dev` in back-end)
// and pointed at a database you're OK writing test data into.
test.describe('Seed sample training records', () => {
  for (const training of sampleTrainings) {
    test(`creates training for ${training.employeeName} (${training.empId})`, async ({
      request,
    }) => {
      const response = await request.post('/api/trainings', {
        data: training,
      });

      expect(response.status(), await response.text()).toBe(201);

      const created = await response.json();
      expect(created).toMatchObject({
        empId: training.empId,
        employeeName: training.employeeName,
        course: training.course,
        status: training.status,
        trainerName: training.trainerName,
        trainingType: training.trainingType,
        projectName: training.projectName,
      });
      expect(created._id).toBeTruthy();

      console.log(
        `Created training ${created._id}: ${created.employeeName} - ${created.course}`
      );
    });
  }
});
