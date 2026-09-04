import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Grid,
  Divider,
  Avatar,
  Typography,
} from "@mui/material";
import HowToRegIcon from "@mui/icons-material/HowToReg";

export interface Candidate {
  _id?: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  course: string;
  department: string;
  communication: number;
  technicalSkill: number;
  programmingLanguageSkill: number;
  databaseSkill: number;
  attitudeTowardsLearning: number;
  devExperience: number;
  totalScore?: number;
  l1ConductedBy: string;
  l1ConductedDate: string;
  l1Status: string;
  l1Remarks: string;
  l2ConductedBy: string;
  l2ConductedDate: string;
  l2Status: string;
  l2Remarks: string;
  createdAt?: string;
  updatedAt?: string;
}

export const ratingOptions = [0, 1, 2, 3, 4, 5];
export const interviewStatusOptions = ["Selected", "Non Selected", "On Hold"];

export const emptyCandidate: Candidate = {
  candidateId: "",
  candidateName: "",
  candidateEmail: "",
  course: "",
  department: "",
  communication: 0,
  technicalSkill: 0,
  programmingLanguageSkill: 0,
  databaseSkill: 0,
  attitudeTowardsLearning: 0,
  devExperience: 0,
  l1ConductedBy: "",
  l1ConductedDate: "",
  l1Status: "",
  l1Remarks: "",
  l2ConductedBy: "",
  l2ConductedDate: "",
  l2Status: "",
  l2Remarks: "",
};

interface CandidateAssessmentProps {
  editingCandidate: Candidate | null;
  onDone: () => void;
}

function CandidateAssessment({ editingCandidate, onDone }: CandidateAssessmentProps) {
  const [form, setForm] = useState<Candidate>(editingCandidate ?? emptyCandidate);
  const editId = editingCandidate?._id ?? null;

  useEffect(() => {
    setForm(editingCandidate ?? emptyCandidate);
  }, [editingCandidate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const isRatingField = [
      "communication",
      "technicalSkill",
      "programmingLanguageSkill",
      "databaseSkill",
      "attitudeTowardsLearning",
      "devExperience",
    ].includes(name);
    setForm({
      ...form,
      [name]: isRatingField ? Number(value) : value,
    });
  };

  const handleSubmit = async () => {
    if (!form.candidateId.trim()) {
      alert("Candidate ID is required.");
      return;
    }
    if (!form.candidateName.trim()) {
      alert("Candidate Name is required.");
      return;
    }
    if (!form.candidateEmail.trim()) {
      alert("Candidate Email ID is required.");
      return;
    }
    if (editId) {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/candidates/${editId}`,
        form
      );
    } else {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/candidates`,
        form
      );
    }
    onDone();
  };

  return (
    <Box
      sx={{
        mt: 4,
        mx: "auto",
        mb: 4,
        maxWidth: "100%",
      }}
    >
      <Box
        component="form"
        sx={{
          background: "#ffffff",
          borderRadius: 3,
          boxShadow: "0 4px 24px rgba(0, 106, 113, 0.12)",
          border: "1px solid #E5EEEF",
          overflow: "hidden",
          maxHeight: "calc(100vh - 120px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: { xs: 2.5, sm: 4 },
            py: 2.5,
            background: "#6846C6",
          }}
        >
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.18)",
              color: "#fff",
              width: 40,
              height: 40,
            }}
          >
            <HowToRegIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ color: "#fff", fontWeight: 700, lineHeight: 1.2 }}
            >
              {editId ? "Edit Candidate Assessment" : "Add Candidate Assessment"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.85)" }}
            >
              {editId
                ? "Update the details for this candidate"
                : "Fill in the details to create a new candidate assessment"}
            </Typography>
          </Box>
        </Box>

        {/* Fields */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            overflowY: "auto",
            "& .MuiInputBase-root": { fontSize: "0.85rem" },
            "& .MuiInputLabel-root": { fontSize: "0.85rem" },
            "& .MuiMenuItem-root": { fontSize: "0.85rem" },
          }}
        >
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                size="small"
                fullWidth
                label="Candidate ID"
                name="candidateId"
                value={form.candidateId}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                size="small"
                fullWidth
                label="Candidate Name"
                name="candidateName"
                value={form.candidateName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                size="small"
                fullWidth
                label="Candidate Email ID"
                name="candidateEmail"
                type="email"
                value={form.candidateEmail}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                size="small"
                fullWidth
                label="Course"
                name="course"
                value={form.course}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                size="small"
                fullWidth
                label="Department"
                name="department"
                value={form.department}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                size="small"
                select
                fullWidth
                label="Communication"
                name="communication"
                value={form.communication}
                onChange={handleChange}
                required
              >
                {ratingOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                size="small"
                select
                fullWidth
                label="Technical Skill"
                name="technicalSkill"
                value={form.technicalSkill}
                onChange={handleChange}
                required
              >
                {ratingOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                size="small"
                select
                fullWidth
                label="Programming Language Skill"
                name="programmingLanguageSkill"
                value={form.programmingLanguageSkill}
                onChange={handleChange}
                required
              >
                {ratingOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                size="small"
                select
                fullWidth
                label="Database Skill"
                name="databaseSkill"
                value={form.databaseSkill}
                onChange={handleChange}
                required
              >
                {ratingOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                size="small"
                select
                fullWidth
                label="Attitude Towards Learning New Things"
                name="attitudeTowardsLearning"
                value={form.attitudeTowardsLearning}
                onChange={handleChange}
                required
              >
                {ratingOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                size="small"
                select
                fullWidth
                label="Dev Experience"
                name="devExperience"
                value={form.devExperience}
                onChange={handleChange}
                required
              >
                {ratingOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={12}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "#6846C6",
                  mt: 1,
                  mb: 0.5,
                }}
              >
                L1 Interview
              </Typography>
            </Grid>
            <Grid size={12}>
              <Box
                sx={{
                  backgroundColor: "transparent",
                  border: "1px solid #6846C6",
                  borderRadius: 1,
                  p: 1.5,
                }}
              >
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="L1 Conducted By"
                      name="l1ConductedBy"
                      value={form.l1ConductedBy}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="L1 Conducted Date"
                      name="l1ConductedDate"
                      type="date"
                      value={form.l1ConductedDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      size="small"
                      select
                      fullWidth
                      label="L1 Status"
                      name="l1Status"
                      value={form.l1Status}
                      onChange={handleChange}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {interviewStatusOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Remarks"
                      name="l1Remarks"
                      value={form.l1Remarks}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid size={12}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "#6846C6",
                  mt: 1,
                  mb: 0.5,
                }}
              >
                L2 Interview
              </Typography>
            </Grid>
            <Grid size={12}>
              <Box
                sx={{
                  backgroundColor: "transparent",
                  border: "1px solid #6846C6",
                  borderRadius: 1,
                  p: 1.5,
                }}
              >
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="L2 Conducted By"
                      name="l2ConductedBy"
                      value={form.l2ConductedBy}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="L2 Conducted Date"
                      name="l2ConductedDate"
                      type="date"
                      value={form.l2ConductedDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      size="small"
                      select
                      fullWidth
                      label="L2 Status"
                      name="l2Status"
                      value={form.l2Status}
                      onChange={handleChange}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {interviewStatusOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Remarks"
                      name="l2Remarks"
                      value={form.l2Remarks}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
            px: { xs: 2.5, sm: 4 },
            py: 2,
            background: "#F8FBFB",
          }}
        >
          {editId && (
            <Button
              variant="outlined"
              onClick={onDone}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#CBD5E0",
                color: "#4A5568",
                minWidth: 300,
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              background: "#887bab",
              boxShadow: "none",
              minWidth: 300,
              "&:hover": {
                background: "#746991",
                boxShadow: "none",
              },
            }}
          >
            {editId ? "Update Candidate" : "Add Candidate"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default CandidateAssessment;
