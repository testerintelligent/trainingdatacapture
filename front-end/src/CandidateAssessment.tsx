import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  IconButton,
  Grid,
  Divider,
  Avatar,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HowToRegIcon from "@mui/icons-material/HowToReg";

export interface Candidate {
  _id?: string;
  candidateName: string;
  candidateEmail: string;
  course: string;
  department: string;
  communication: number;
  technicalSkill: number;
  programmingLanguageSkill: number;
  databaseSkill: number;
  attitudeTowardsLearning: number;
}

const ratingOptions = [1, 2, 3, 4, 5];

const emptyCandidate: Candidate = {
  candidateName: "",
  candidateEmail: "",
  course: "",
  department: "",
  communication: 1,
  technicalSkill: 1,
  programmingLanguageSkill: 1,
  databaseSkill: 1,
  attitudeTowardsLearning: 1,
};

function CandidateAssessment() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [form, setForm] = useState<Candidate>(emptyCandidate);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchCandidates = async () => {
    const res = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/api/candidates`
    );
    setCandidates(res.data);
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

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
    ].includes(name);
    setForm({
      ...form,
      [name]: isRatingField ? Number(value) : value,
    });
  };

  const handleEdit = (candidate: Candidate) => {
    setForm(candidate);
    setEditId(candidate._id!);
  };

  const resetForm = () => {
    setForm(emptyCandidate);
    setEditId(null);
  };

  const handleSubmit = async () => {
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
    fetchCandidates();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await axios.delete(
      `${process.env.REACT_APP_API_BASE_URL}/api/candidates/${id}`
    );
    fetchCandidates();
  };

  return (
    <>
      <Box
        sx={{
          mt: 4,
          mx: "auto",
          mb: 4,
          maxWidth: { xs: "100%", md: "68%" },
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
              px: { xs: 2.5, sm: 4 },
              py: 3,
            }}
          >
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Candidate Name"
                  name="candidateName"
                  value={form.candidateName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
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
                  fullWidth
                  label="Department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
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

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
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

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
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
                onClick={resetForm}
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

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 470,
          overflowY: "auto",
          scrollbarWidth: "thin",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {[
                "Candidate Name",
                "Candidate Email ID",
                "Course",
                "Department",
                "Communication",
                "Technical Skill",
                "Programming Language Skill",
                "Database Skill",
                "Attitude Towards Learning",
                "Actions",
              ].map((header) => (
                <TableCell
                  key={header}
                  sx={{
                    backgroundColor: "#6846C6",
                    color: "#fff",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontSize: "16px !important",
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  align="center"
                  sx={{ backgroundColor: "#c6adf7" }}
                >
                  No candidate assessment records yet.
                </TableCell>
              </TableRow>
            ) : (
              candidates.map((c) => (
                <TableRow
                  key={c._id}
                  sx={{
                    height: 44,
                    "&:not(:last-child)": {
                      borderBottom: "1px solid #e0e0e0",
                    },
                    "& > *": { paddingTop: 0, paddingBottom: 0 },
                    backgroundColor: "#c6adf7",
                  }}
                >
                  <TableCell sx={{ padding: "0 8px" }}>
                    {c.candidateName}
                  </TableCell>
                  <TableCell sx={{ padding: "0 8px" }}>
                    {c.candidateEmail}
                  </TableCell>
                  <TableCell sx={{ padding: "0 8px" }}>{c.course}</TableCell>
                  <TableCell sx={{ padding: "0 8px" }}>
                    {c.department}
                  </TableCell>
                  <TableCell sx={{ padding: "0 8px" }}>
                    {c.communication}
                  </TableCell>
                  <TableCell sx={{ padding: "0 8px" }}>
                    {c.technicalSkill}
                  </TableCell>
                  <TableCell sx={{ padding: "0 8px" }}>
                    {c.programmingLanguageSkill}
                  </TableCell>
                  <TableCell sx={{ padding: "0 8px" }}>
                    {c.databaseSkill}
                  </TableCell>
                  <TableCell sx={{ padding: "0 8px" }}>
                    {c.attitudeTowardsLearning}
                  </TableCell>
                  <TableCell align="right" sx={{ padding: "0 8px" }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        alignItems: "center",
                      }}
                    >
                      <IconButton
                        aria-label="edit"
                        onClick={() => handleEdit(c)}
                        size="small"
                        sx={{ padding: "2px !important" }}
                      >
                        <EditIcon sx={{ fontSize: "14px" }} />
                      </IconButton>
                      <IconButton
                        aria-label="delete"
                        onClick={() => handleDelete(c._id!)}
                        size="small"
                        sx={{ padding: "2px !important" }}
                      >
                        <DeleteIcon sx={{ fontSize: "14px" }} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default CandidateAssessment;
