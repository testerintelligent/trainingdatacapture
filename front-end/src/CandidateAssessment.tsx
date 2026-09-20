import React, { useEffect, useMemo, useState } from "react";
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
  totalScore?: number;
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
  l1Score?: number;
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
  l2Score?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const ratingOptions = [0, 1, 2, 3, 4, 5];
export const interviewStatusOptions = ["Selected", "Not Selected", "On Hold"];

const PRELIMINARY_SCORE_FIELDS = [
  "writtenTestScore",
  "groupDiscussionScore",
] as const;

const L1_SCORE_FIELDS = [
  "l1Communication",
  "l1TechnicalSkill",
  "l1ProgrammingLanguageSkill",
  "l1DatabaseSkill",
  "l1AttitudeTowardsLearning",
  "l1DevExperience",
] as const;

const L2_SCORE_FIELDS = [
  "l2Communication",
  "l2TechnicalSkill",
  "l2ProgrammingLanguageSkill",
  "l2DatabaseSkill",
  "l2AttitudeTowardsLearning",
  "l2DevExperience",
] as const;

const sumFields = (
  c: Candidate,
  fields: readonly (keyof Candidate)[]
) => fields.reduce((sum, field) => sum + (Number(c[field]) || 0), 0);

export const getPreliminaryScore = (c: Candidate) =>
  sumFields(c, PRELIMINARY_SCORE_FIELDS);

export const getL1Score = (c: Candidate) => sumFields(c, L1_SCORE_FIELDS);

export const getL2Score = (c: Candidate) => sumFields(c, L2_SCORE_FIELDS);

export const getTotalScore = (c: Candidate) =>
  getPreliminaryScore(c) + getL1Score(c) + getL2Score(c);

const MAX_RATING = Math.max(...ratingOptions);
export const PRELIMINARY_MAX_SCORE =
  MAX_RATING * PRELIMINARY_SCORE_FIELDS.length;
export const L1_MAX_SCORE = MAX_RATING * L1_SCORE_FIELDS.length;
export const L2_MAX_SCORE = MAX_RATING * L2_SCORE_FIELDS.length;
export const MAX_TOTAL_SCORE =
  PRELIMINARY_MAX_SCORE + L1_MAX_SCORE + L2_MAX_SCORE;

export const emptyCandidate: Candidate = {
  candidateId: "",
  candidateName: "",
  candidateEmail: "",
  course: "",
  department: "",
  writtenTestStatus: "",
  groupDiscussionStatus: "",
  writtenTestScore: 0,
  groupDiscussionScore: 0,
  preliminaryTestsRemarks: "",
  l1ConductedBy: "",
  l1ConductedDate: "",
  l1Status: "",
  l1Remarks: "",
  l1Communication: 0,
  l1TechnicalSkill: 0,
  l1ProgrammingLanguageSkill: 0,
  l1DatabaseSkill: 0,
  l1AttitudeTowardsLearning: 0,
  l1DevExperience: 0,
  l2ConductedBy: "",
  l2ConductedDate: "",
  l2Status: "",
  l2Remarks: "",
  l2Communication: 0,
  l2TechnicalSkill: 0,
  l2ProgrammingLanguageSkill: 0,
  l2DatabaseSkill: 0,
  l2AttitudeTowardsLearning: 0,
  l2DevExperience: 0,
};

interface CandidateAssessmentProps {
  editingCandidate: Candidate | null;
  onDone: () => void;
  // Called with the latest saved record every time Save/Submit succeeds,
  // so a parent can remember it as the in-progress draft and restore it
  // if the user navigates away and back before Cancelling. `isNewRecord`
  // is true only the moment a save creates the record for the first time
  // (as opposed to updating one that already existed before this form
  // session started) — a parent can use it to know the record is still
  // an unfinalized draft safe to discard if the browser reloads.
  onSaved?: (candidate: Candidate, isNewRecord: boolean) => void;
}

function CandidateAssessment({
  editingCandidate,
  onDone,
  onSaved,
}: CandidateAssessmentProps) {
  const [form, setForm] = useState<Candidate>(editingCandidate ?? emptyCandidate);
  const [savedId, setSavedId] = useState<string | null>(
    editingCandidate?._id ?? null
  );
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const editId = savedId;
  const runningScore = useMemo(() => getTotalScore(form), [form]);
  const runningL1Score = useMemo(() => getL1Score(form), [form]);
  const runningL2Score = useMemo(() => getL2Score(form), [form]);

  useEffect(() => {
    setForm(
      editingCandidate
        ? {
            ...editingCandidate,
            // Backend returns full ISO datetime strings, but the date
            // inputs below require a plain YYYY-MM-DD value to display
            // the existing value when editing a record.
            l1ConductedDate: editingCandidate.l1ConductedDate
              ? editingCandidate.l1ConductedDate.slice(0, 10)
              : "",
            l2ConductedDate: editingCandidate.l2ConductedDate
              ? editingCandidate.l2ConductedDate.slice(0, 10)
              : "",
          }
        : emptyCandidate
    );
    setSavedId(editingCandidate?._id ?? null);
    setSaveStatus("idle");
  }, [editingCandidate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const isRatingField = [
      "writtenTestScore",
      "groupDiscussionScore",
      "l1Communication",
      "l1TechnicalSkill",
      "l1ProgrammingLanguageSkill",
      "l1DatabaseSkill",
      "l1AttitudeTowardsLearning",
      "l1DevExperience",
      "l2Communication",
      "l2TechnicalSkill",
      "l2ProgrammingLanguageSkill",
      "l2DatabaseSkill",
      "l2AttitudeTowardsLearning",
      "l2DevExperience",
    ].includes(name);
    setForm({
      ...form,
      [name]: isRatingField ? Number(value) : value,
    });
    setSaveStatus((status) => (status === "saved" ? "idle" : status));
  };

  const validateBasicDetails = () => {
    if (!form.candidateId.trim()) {
      alert("Candidate ID is required.");
      return false;
    }
    if (!form.candidateName.trim()) {
      alert("Candidate Name is required.");
      return false;
    }
    if (!form.candidateEmail.trim()) {
      alert("Candidate Email ID is required.");
      return false;
    }
    if (!form.course.trim()) {
      alert("Course is required.");
      return false;
    }
    if (!form.department.trim()) {
      alert("Department is required.");
      return false;
    }
    return true;
  };

  // Saves the form to the backend without leaving the page: updates the
  // existing record if one has already been saved, otherwise creates a
  // new one and remembers its id so later saves update it in place.
  const saveCandidate = async (): Promise<boolean> => {
    if (!validateBasicDetails()) {
      return false;
    }
    setSaveStatus("saving");
    const isNewRecord = !savedId;
    try {
      const res = savedId
        ? await axios.put(
            `${process.env.REACT_APP_API_BASE_URL}/api/candidates/${savedId}`,
            form
          )
        : await axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/api/candidates`,
            form
          );
      setSavedId(res.data?._id ?? savedId ?? null);
      onSaved?.(
        res.data ?? { ...form, _id: savedId ?? undefined },
        isNewRecord
      );
      setSaveStatus("saved");
      return true;
    } catch (err) {
      setSaveStatus("idle");
      throw err;
    }
  };

  const handleSave = async () => {
    await saveCandidate();
  };

  const handleSubmit = async () => {
    const saved = await saveCandidate();
    if (saved) {
      onDone();
    }
  };

  return (
    <Box
      sx={{
        mt: 0,
        mx: "auto",
        mb: 0,
        maxWidth: "100%",
      }}
    >
      <Box
        component="form"
        sx={{
          background: "#ffffff",
          borderRadius: 3,
          boxShadow: "0 4px 24px rgba(0, 106, 113, 0.12)",
          border: "1px solid #E7E3F1",
          overflow: "hidden",
          height: "calc(113vh - 120px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            px: { xs: 2.5, sm: 4 },
            py: 1,
            background: "#6846C6",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              flexShrink: 0,
              pl: 2,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.2 }}
            >
              Total Score
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "#fff", fontWeight: 700, lineHeight: 1.2 }}
            >
              {runningScore} / {MAX_TOTAL_SCORE}
            </Typography>
          </Box>
        </Box>

        {/* Fields */}
        <Box
          sx={{
            flex: 1,
            px: { xs: 2, sm: 3 },
            py: 2,
            overflowY: "auto",
            "& .MuiInputBase-root": { fontSize: "0.85rem" },
            "& .MuiInputLabel-root": { fontSize: "0.85rem" },
            "& .MuiMenuItem-root": { fontSize: "0.85rem" },
          }}
        >
          <Grid container rowSpacing={2.5} columnSpacing={1.5}>
            <Grid size={12}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "#6846C6",
                  mt: 1,
                  mb: 1.5,
                }}
              >
                Candidate Details
              </Typography>
              <Box
                sx={{
                  backgroundColor: "transparent",
                  border: "1px solid #6846C6",
                  borderRadius: 1,
                  p: 1.5,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                    <TextField
                      size="small"
                      label="Candidate ID"
                      name="candidateId"
                      value={form.candidateId}
                      onChange={handleChange}
                      required
                      sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 0 }}
                    />
                    <TextField
                      size="small"
                      label="Candidate Name"
                      name="candidateName"
                      value={form.candidateName}
                      onChange={handleChange}
                      required
                      sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 0 }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                    <TextField
                      size="small"
                      label="Candidate Email ID"
                      name="candidateEmail"
                      type="email"
                      value={form.candidateEmail}
                      onChange={handleChange}
                      required
                      sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 0 }}
                    />
                    <TextField
                      size="small"
                      label="Course"
                      name="course"
                      value={form.course}
                      onChange={handleChange}
                      required
                      sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 0 }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                    <TextField
                      size="small"
                      label="Department"
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      required
                      sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 0 }}
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid size={12}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "#6846C6",
                  mt: 1,
                  mb: 1.5,
                }}
              >
                Preliminary Tests Status
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
                <Grid container rowSpacing={2.5} columnSpacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      select
                      fullWidth
                      label="Written Test"
                      name="writtenTestStatus"
                      value={form.writtenTestStatus}
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
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      select
                      fullWidth
                      label="Written Test Score"
                      name="writtenTestScore"
                      value={form.writtenTestScore}
                      onChange={handleChange}
                    >
                      {ratingOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      select
                      fullWidth
                      label="Group Discussion"
                      name="groupDiscussionStatus"
                      value={form.groupDiscussionStatus}
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
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      select
                      fullWidth
                      label="Group Discussion Score"
                      name="groupDiscussionScore"
                      value={form.groupDiscussionScore}
                      onChange={handleChange}
                    >
                      {ratingOptions.map((option) => (
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
                      name="preliminaryTestsRemarks"
                      value={form.preliminaryTestsRemarks}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mt: 1,
                  mb: 1.5,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: "#6846C6" }}
                >
                  L1 Interview
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: "#6846C6" }}
                >
                  L1 Score: {runningL1Score} / {L1_MAX_SCORE}
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: "transparent",
                  border: "1px solid #6846C6",
                  borderRadius: 1,
                  p: 3.5,
                }}
              >
                <Grid container rowSpacing={2.5} columnSpacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      select
                      fullWidth
                      label="Communication"
                      name="l1Communication"
                      value={form.l1Communication}
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
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      select
                      fullWidth
                      label="Technical Skill"
                      name="l1TechnicalSkill"
                      value={form.l1TechnicalSkill}
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
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      select
                      fullWidth
                      label="Programming Language Skill"
                      name="l1ProgrammingLanguageSkill"
                      value={form.l1ProgrammingLanguageSkill}
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
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      select
                      fullWidth
                      label="Database Skill"
                      name="l1DatabaseSkill"
                      value={form.l1DatabaseSkill}
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
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      select
                      fullWidth
                      label="Attitude Towards Learning New Things"
                      name="l1AttitudeTowardsLearning"
                      value={form.l1AttitudeTowardsLearning}
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
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      select
                      fullWidth
                      label="Dev Experience"
                      name="l1DevExperience"
                      value={form.l1DevExperience}
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

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="L1 Conducted By"
                      name="l1ConductedBy"
                      value={form.l1ConductedBy}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
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

                  <Grid size={12}>
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

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mt: 1,
                  mb: 1.5,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: "#6846C6" }}
                >
                  L2 Interview
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: "#6846C6" }}
                >
                  L2 Score: {runningL2Score} / {L2_MAX_SCORE}
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: "transparent",
                  border: "1px solid #6846C6",
                  borderRadius: 1,
                  p: 3.5,
                }}
              >
                <Grid container rowSpacing={2.5} columnSpacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      select
                      fullWidth
                      label="Communication"
                      name="l2Communication"
                      value={form.l2Communication}
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
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      select
                      fullWidth
                      label="Technical Skill"
                      name="l2TechnicalSkill"
                      value={form.l2TechnicalSkill}
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
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      select
                      fullWidth
                      label="Programming Language Skill"
                      name="l2ProgrammingLanguageSkill"
                      value={form.l2ProgrammingLanguageSkill}
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
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      select
                      fullWidth
                      label="Database Skill"
                      name="l2DatabaseSkill"
                      value={form.l2DatabaseSkill}
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
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      select
                      fullWidth
                      label="Attitude Towards Learning New Things"
                      name="l2AttitudeTowardsLearning"
                      value={form.l2AttitudeTowardsLearning}
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
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      select
                      fullWidth
                      label="Dev Experience"
                      name="l2DevExperience"
                      value={form.l2DevExperience}
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

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="L2 Conducted By"
                      name="l2ConductedBy"
                      value={form.l2ConductedBy}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
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
                  <Grid size={12}>
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
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            px: { xs: 2.5, sm: 4 },
            py: 2,
            background: "#F8FBFB",
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "#6B7280", minHeight: "1.25em" }}
          >
            {saveStatus === "saving" && "Saving…"}
            {saveStatus === "saved" && "All changes saved."}
          </Typography>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={onDone}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#D9D2EC",
                color: "#4A5568",
                minWidth: 200,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#6846C6",
                color: "#6846C6",
                minWidth: 200,
              }}
            >
              Save
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saveStatus === "saving"}
              variant="contained"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                background: "#6846C6",
                boxShadow: "none",
                minWidth: 200,
                "&:hover": {
                  background: "#4E2FA8",
                  boxShadow: "none",
                },
              }}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default CandidateAssessment;
