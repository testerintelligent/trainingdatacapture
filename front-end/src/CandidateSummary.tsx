import React, { useMemo, useState } from "react";
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
  IconButton,
  Typography,
  TextField,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { exportToExcel } from "./exportToExcel";
import type { Candidate } from "./CandidateAssessment";
import { ratingOptions, interviewStatusOptions } from "./CandidateAssessment";

interface CandidateSummaryProps {
  candidates: Candidate[];
  onEdit: (candidate: Candidate) => void;
  onDelete: (id: string) => void;
}

const tableHeaders = [
  { label: "Candidate Name", width: "6%" },
  { label: "Candidate Email ID", width: "7%" },
  { label: "Course", width: "5%" },
  { label: "Department", width: "5%" },
  { label: "Communication", width: "5%" },
  { label: "Technical Skill", width: "5%" },
  { label: "Programming Language Skill", width: "6%" },
  { label: "Database Skill", width: "5%" },
  { label: "Attitude Towards Learning", width: "6%" },
  { label: "Dev Experience", width: "5%" },
  { label: "L1 Conducted By", width: "5%" },
  { label: "L1 Conducted Date", width: "5%" },
  { label: "L1 Status", width: "4%" },
  { label: "L2 Conducted By", width: "5%" },
  { label: "L2 Conducted Date", width: "5%" },
  { label: "L2 Status", width: "4%" },
  { label: "Submitted On", width: "6%" },
  { label: "Last Updated", width: "6%" },
  { label: "Actions", width: "5%" },
];

interface CandidateFilters {
  candidateName: string;
  candidateEmail: string;
  course: string;
  department: string;
  communication: string;
  technicalSkill: string;
  programmingLanguageSkill: string;
  databaseSkill: string;
  attitudeTowardsLearning: string;
  devExperience: string;
  l1ConductedBy: string;
  l1ConductedDate: string;
  l1Status: string;
  l2ConductedBy: string;
  l2ConductedDate: string;
  l2Status: string;
  createdAt: string;
  updatedAt: string;
}

const emptyFilters: CandidateFilters = {
  candidateName: "",
  candidateEmail: "",
  course: "",
  department: "",
  communication: "",
  technicalSkill: "",
  programmingLanguageSkill: "",
  databaseSkill: "",
  attitudeTowardsLearning: "",
  devExperience: "",
  l1ConductedBy: "",
  l1ConductedDate: "",
  l1Status: "",
  l2ConductedBy: "",
  l2ConductedDate: "",
  l2Status: "",
  createdAt: "",
  updatedAt: "",
};

const bodyCellSx = {
  padding: "4px 6px",
  fontSize: "9.9px !important",
  whiteSpace: "normal !important" as const,
  overflowWrap: "anywhere" as const,
  maxWidth: "none !important",
  verticalAlign: "top" as const,
};

const filterRenderValue = (selected: any) => {
  if (selected === "") {
    return (
      <MenuItem sx={{ color: "#999", fontSize: "10.8px", fontStyle: "italic" }}>
        Filter
      </MenuItem>
    );
  }
  return selected;
};

function CandidateSummary({ candidates, onEdit, onDelete }: CandidateSummaryProps) {
  const [filters, setFilters] = useState<CandidateFilters>(emptyFilters);

  const setFilter = (field: keyof CandidateFilters) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setFilters((f) => ({ ...f, [field]: e.target.value }));

  const filteredCandidates = useMemo(() => {
    const textMatch = (value: string, filter: string) =>
      !filter || value.toLowerCase().includes(filter.toLowerCase());

    return candidates.filter(
      (c) =>
        textMatch(c.candidateName, filters.candidateName) &&
        textMatch(c.candidateEmail, filters.candidateEmail) &&
        textMatch(c.course, filters.course) &&
        textMatch(c.department, filters.department) &&
        (!filters.communication ||
          String(c.communication) === filters.communication) &&
        (!filters.technicalSkill ||
          String(c.technicalSkill) === filters.technicalSkill) &&
        (!filters.programmingLanguageSkill ||
          String(c.programmingLanguageSkill) ===
            filters.programmingLanguageSkill) &&
        (!filters.databaseSkill ||
          String(c.databaseSkill) === filters.databaseSkill) &&
        (!filters.attitudeTowardsLearning ||
          String(c.attitudeTowardsLearning) ===
            filters.attitudeTowardsLearning) &&
        (!filters.devExperience ||
          String(c.devExperience) === filters.devExperience) &&
        textMatch(c.l1ConductedBy, filters.l1ConductedBy) &&
        (!filters.l1ConductedDate ||
          (c.l1ConductedDate ?? "").slice(0, 10) === filters.l1ConductedDate) &&
        (!filters.l1Status || c.l1Status === filters.l1Status) &&
        textMatch(c.l2ConductedBy, filters.l2ConductedBy) &&
        (!filters.l2ConductedDate ||
          (c.l2ConductedDate ?? "").slice(0, 10) === filters.l2ConductedDate) &&
        (!filters.l2Status || c.l2Status === filters.l2Status) &&
        (!filters.createdAt ||
          (c.createdAt ?? "").slice(0, 10) === filters.createdAt) &&
        (!filters.updatedAt ||
          (c.updatedAt ?? "").slice(0, 10) === filters.updatedAt)
    );
  }, [candidates, filters]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          mt: 2,
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: "#6846C6", fontWeight: 700 }}>
          Candidate Summary
        </Typography>
        <Button
          variant="contained"
          onClick={() => exportToExcel(candidates, "candidate_summary.xlsx")}
          sx={{
            backgroundColor: "#887bab",
            "&:hover": { backgroundColor: "#746991" },
          }}
        >
          Export to Excel
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          width: "50%",
          maxHeight: 235,
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "thin",
        }}
      >
        <Table stickyHeader sx={{ tableLayout: "fixed", width: "100%" }}>
          <TableHead>
            <TableRow>
              {tableHeaders.map((header) => (
                <TableCell
                  key={header.label}
                  sx={{
                    width: header.width,
                    maxWidth: "none !important",
                    backgroundColor: "#6846C6",
                    color: "#fff",
                    fontWeight: "bold",
                    whiteSpace: "normal !important",
                    overflowWrap: "break-word",
                    lineHeight: 1.2,
                    padding: "6px 6px",
                    fontSize: "10.8px !important",
                  }}
                >
                  {header.label}
                </TableCell>
              ))}
            </TableRow>
            <TableRow
              sx={{
                "& .MuiInputBase-root": {
                  height: 32,
                  fontSize: "10.8px",
                },
                "& .MuiSelect-select": {
                  padding: "6px 8px",
                },
              }}
            >
              <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Filter"
                  value={filters.candidateName}
                  onChange={setFilter("candidateName")}
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Filter"
                  value={filters.candidateEmail}
                  onChange={setFilter("candidateEmail")}
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Filter"
                  value={filters.course}
                  onChange={setFilter("course")}
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Filter"
                  value={filters.department}
                  onChange={setFilter("department")}
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.communication}
                  onChange={setFilter("communication")}
                  fullWidth
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: filterRenderValue,
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {ratingOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </TableCell>
              <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.technicalSkill}
                  onChange={setFilter("technicalSkill")}
                  fullWidth
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: filterRenderValue,
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {ratingOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </TableCell>
              <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.programmingLanguageSkill}
                  onChange={setFilter("programmingLanguageSkill")}
                  fullWidth
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: filterRenderValue,
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {ratingOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </TableCell>
              <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.databaseSkill}
                  onChange={setFilter("databaseSkill")}
                  fullWidth
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: filterRenderValue,
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {ratingOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </TableCell>
              <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.attitudeTowardsLearning}
                  onChange={setFilter("attitudeTowardsLearning")}
                  fullWidth
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: filterRenderValue,
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {ratingOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </TableCell>
              <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.devExperience}
                  onChange={setFilter("devExperience")}
                  fullWidth
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: filterRenderValue,
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {ratingOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </TableCell>
              <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Filter"
                  value={filters.l1ConductedBy}
                  onChange={setFilter("l1ConductedBy")}
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                <TextField
                  size="small"
                  type="date"
                  variant="outlined"
                  value={filters.l1ConductedDate}
                  onChange={setFilter("l1ConductedDate")}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.l1Status}
                  onChange={setFilter("l1Status")}
                  fullWidth
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: filterRenderValue,
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {interviewStatusOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </TableCell>
              <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Filter"
                  value={filters.l2ConductedBy}
                  onChange={setFilter("l2ConductedBy")}
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                <TextField
                  size="small"
                  type="date"
                  variant="outlined"
                  value={filters.l2ConductedDate}
                  onChange={setFilter("l2ConductedDate")}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.l2Status}
                  onChange={setFilter("l2Status")}
                  fullWidth
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: filterRenderValue,
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {interviewStatusOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </TableCell>
              <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                <TextField
                  size="small"
                  type="date"
                  variant="outlined"
                  value={filters.createdAt}
                  onChange={setFilter("createdAt")}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                <TextField
                  size="small"
                  type="date"
                  variant="outlined"
                  value={filters.updatedAt}
                  onChange={setFilter("updatedAt")}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#c6adf7" }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCandidates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={tableHeaders.length}
                  align="center"
                  sx={{ backgroundColor: "#c6adf7" }}
                >
                  {candidates.length === 0
                    ? "No candidate assessment records yet."
                    : "No candidate assessment records match the applied filters."}
                </TableCell>
              </TableRow>
            ) : (
              filteredCandidates.map((c) => (
                <TableRow
                  key={c._id}
                  sx={{
                    "&:not(:last-child)": {
                      borderBottom: "1px solid #e0e0e0",
                    },
                    backgroundColor: "#c6adf7",
                  }}
                >
                  <TableCell sx={bodyCellSx}>{c.candidateName}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.candidateEmail}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.course}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.department}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.communication}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.technicalSkill}</TableCell>
                  <TableCell sx={bodyCellSx}>
                    {c.programmingLanguageSkill}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>{c.databaseSkill}</TableCell>
                  <TableCell sx={bodyCellSx}>
                    {c.attitudeTowardsLearning}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>{c.devExperience}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.l1ConductedBy}</TableCell>
                  <TableCell sx={bodyCellSx}>
                    {c.l1ConductedDate
                      ? new Date(c.l1ConductedDate).toLocaleDateString()
                      : ""}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>{c.l1Status}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.l2ConductedBy}</TableCell>
                  <TableCell sx={bodyCellSx}>
                    {c.l2ConductedDate
                      ? new Date(c.l2ConductedDate).toLocaleDateString()
                      : ""}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>{c.l2Status}</TableCell>
                  <TableCell sx={bodyCellSx}>
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    {c.updatedAt ? new Date(c.updatedAt).toLocaleString() : ""}
                  </TableCell>
                  <TableCell align="right" sx={bodyCellSx}>
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
                        onClick={() => onEdit(c)}
                        size="small"
                        sx={{ padding: "2px !important" }}
                      >
                        <EditIcon sx={{ fontSize: "14px" }} />
                      </IconButton>
                      <IconButton
                        aria-label="delete"
                        onClick={() => onDelete(c._id!)}
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

export default CandidateSummary;
