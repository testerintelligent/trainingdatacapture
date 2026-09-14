import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Paper,
  IconButton,
  Typography,
  TextField,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import { exportToExcel } from "./exportToExcel";
import type { Candidate } from "./CandidateAssessment";
import {
  ratingOptions,
  interviewStatusOptions,
  getTotalScore,
  getL1Score,
  getL2Score,
  L1_MAX_SCORE,
  L2_MAX_SCORE,
} from "./CandidateAssessment";
import { useElementHeight } from "./useElementHeight";

interface CandidateSummaryProps {
  candidates: Candidate[];
  onEdit: (candidate: Candidate) => void;
  onDelete: (id: string) => void;
}

const tableHeaders = [
  { label: "Candidate ID" },
  { label: "Candidate Name" },
  { label: "Candidate Email ID" },
  { label: "Course" },
  { label: "Department" },
  { label: "Written Test Score" },
  { label: "Group Discussion Score" },
  { label: "Total Score" },
  { label: "Written Test" },
  { label: "Group Discussion" },
  { label: "Preliminary Tests Remarks" },
  { label: "L1 Communication" },
  { label: "L1 Technical Skill" },
  { label: "L1 Programming Language Skill" },
  { label: "L1 Database Skill" },
  { label: "L1 Attitude Towards Learning" },
  { label: "L1 Dev Experience" },
  { label: `L1 Score (of ${L1_MAX_SCORE})` },
  { label: "L1 Conducted By" },
  { label: "L1 Conducted Date" },
  { label: "L1 Status" },
  { label: "L1 Remarks" },
  { label: "L2 Communication" },
  { label: "L2 Technical Skill" },
  { label: "L2 Programming Language Skill" },
  { label: "L2 Database Skill" },
  { label: "L2 Attitude Towards Learning" },
  { label: "L2 Dev Experience" },
  { label: `L2 Score (of ${L2_MAX_SCORE})` },
  { label: "L2 Conducted By" },
  { label: "L2 Conducted Date" },
  { label: "L2 Status" },
  { label: "L2 Remarks" },
  { label: "Submitted On" },
  { label: "Last Updated" },
  { label: "Actions" },
];

interface CandidateFilters {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  course: string;
  department: string;
  writtenTestScore: string;
  groupDiscussionScore: string;
  totalScore: string;
  writtenTestStatus: string;
  groupDiscussionStatus: string;
  preliminaryTestsRemarks: string;
  l1Communication: string;
  l1TechnicalSkill: string;
  l1ProgrammingLanguageSkill: string;
  l1DatabaseSkill: string;
  l1AttitudeTowardsLearning: string;
  l1DevExperience: string;
  l1Score: string;
  l1ConductedBy: string;
  l1ConductedDate: string;
  l1Status: string;
  l1Remarks: string;
  l2Communication: string;
  l2TechnicalSkill: string;
  l2ProgrammingLanguageSkill: string;
  l2DatabaseSkill: string;
  l2AttitudeTowardsLearning: string;
  l2DevExperience: string;
  l2Score: string;
  l2ConductedBy: string;
  l2ConductedDate: string;
  l2Status: string;
  l2Remarks: string;
  createdAt: string;
  updatedAt: string;
}

const emptyFilters: CandidateFilters = {
  candidateId: "",
  candidateName: "",
  candidateEmail: "",
  course: "",
  department: "",
  writtenTestScore: "",
  groupDiscussionScore: "",
  totalScore: "",
  writtenTestStatus: "",
  groupDiscussionStatus: "",
  preliminaryTestsRemarks: "",
  l1Communication: "",
  l1TechnicalSkill: "",
  l1ProgrammingLanguageSkill: "",
  l1DatabaseSkill: "",
  l1AttitudeTowardsLearning: "",
  l1DevExperience: "",
  l1Score: "",
  l1ConductedBy: "",
  l1ConductedDate: "",
  l1Status: "",
  l1Remarks: "",
  l2Communication: "",
  l2TechnicalSkill: "",
  l2ProgrammingLanguageSkill: "",
  l2DatabaseSkill: "",
  l2AttitudeTowardsLearning: "",
  l2DevExperience: "",
  l2Score: "",
  l2ConductedBy: "",
  l2ConductedDate: "",
  l2Status: "",
  l2Remarks: "",
  createdAt: "",
  updatedAt: "",
};

const BODY_ROW_HEIGHT = 36;

const bodyCellSx = {
  padding: "4px 10px",
  fontSize: "11.5px !important",
  lineHeight: 1.3,
  whiteSpace: "nowrap !important" as const,
  verticalAlign: "middle" as const,
};

const filterRenderValue = (selected: any) => {
  if (selected === "") {
    return (
      <MenuItem sx={{ color: "#999", fontSize: "11.5px", fontStyle: "italic" }}>
        Filter
      </MenuItem>
    );
  }
  return selected;
};

const ROWS_PER_PAGE = 10;

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTH_ABBR[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

function CandidateSummary({ candidates, onEdit, onDelete }: CandidateSummaryProps) {
  const [filters, setFilters] = useState<CandidateFilters>(emptyFilters);
  const [labelRowRef, labelRowHeight] = useElementHeight<HTMLTableRowElement>();
  const [page, setPage] = useState(0);

  const setFilter = (field: keyof CandidateFilters) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setFilters((f) => ({ ...f, [field]: e.target.value }));

  const filteredCandidates = useMemo(() => {
    const textMatch = (value: string, filter: string) =>
      !filter || value.toLowerCase().includes(filter.toLowerCase());

    return candidates.filter(
      (c) =>
        textMatch(c.candidateId, filters.candidateId) &&
        textMatch(c.candidateName, filters.candidateName) &&
        textMatch(c.candidateEmail, filters.candidateEmail) &&
        textMatch(c.course, filters.course) &&
        textMatch(c.department, filters.department) &&
        textMatch(String(getTotalScore(c)), filters.totalScore) &&
        (!filters.writtenTestScore ||
          String(c.writtenTestScore) === filters.writtenTestScore) &&
        (!filters.groupDiscussionScore ||
          String(c.groupDiscussionScore) === filters.groupDiscussionScore) &&
        (!filters.writtenTestStatus ||
          c.writtenTestStatus === filters.writtenTestStatus) &&
        (!filters.groupDiscussionStatus ||
          c.groupDiscussionStatus === filters.groupDiscussionStatus) &&
        textMatch(
          c.preliminaryTestsRemarks ?? "",
          filters.preliminaryTestsRemarks
        ) &&
        (!filters.l1Communication ||
          String(c.l1Communication) === filters.l1Communication) &&
        (!filters.l1TechnicalSkill ||
          String(c.l1TechnicalSkill) === filters.l1TechnicalSkill) &&
        (!filters.l1ProgrammingLanguageSkill ||
          String(c.l1ProgrammingLanguageSkill) ===
            filters.l1ProgrammingLanguageSkill) &&
        (!filters.l1DatabaseSkill ||
          String(c.l1DatabaseSkill) === filters.l1DatabaseSkill) &&
        (!filters.l1AttitudeTowardsLearning ||
          String(c.l1AttitudeTowardsLearning) ===
            filters.l1AttitudeTowardsLearning) &&
        (!filters.l1DevExperience ||
          String(c.l1DevExperience) === filters.l1DevExperience) &&
        textMatch(String(getL1Score(c)), filters.l1Score) &&
        textMatch(c.l1ConductedBy, filters.l1ConductedBy) &&
        (!filters.l1ConductedDate ||
          (c.l1ConductedDate ?? "").slice(0, 10) === filters.l1ConductedDate) &&
        (!filters.l1Status || c.l1Status === filters.l1Status) &&
        textMatch(c.l1Remarks ?? "", filters.l1Remarks) &&
        (!filters.l2Communication ||
          String(c.l2Communication) === filters.l2Communication) &&
        (!filters.l2TechnicalSkill ||
          String(c.l2TechnicalSkill) === filters.l2TechnicalSkill) &&
        (!filters.l2ProgrammingLanguageSkill ||
          String(c.l2ProgrammingLanguageSkill) ===
            filters.l2ProgrammingLanguageSkill) &&
        (!filters.l2DatabaseSkill ||
          String(c.l2DatabaseSkill) === filters.l2DatabaseSkill) &&
        (!filters.l2AttitudeTowardsLearning ||
          String(c.l2AttitudeTowardsLearning) ===
            filters.l2AttitudeTowardsLearning) &&
        (!filters.l2DevExperience ||
          String(c.l2DevExperience) === filters.l2DevExperience) &&
        textMatch(String(getL2Score(c)), filters.l2Score) &&
        textMatch(c.l2ConductedBy, filters.l2ConductedBy) &&
        (!filters.l2ConductedDate ||
          (c.l2ConductedDate ?? "").slice(0, 10) === filters.l2ConductedDate) &&
        (!filters.l2Status || c.l2Status === filters.l2Status) &&
        textMatch(c.l2Remarks ?? "", filters.l2Remarks) &&
        (!filters.createdAt ||
          (c.createdAt ?? "").slice(0, 10) === filters.createdAt) &&
        (!filters.updatedAt ||
          (c.updatedAt ?? "").slice(0, 10) === filters.updatedAt)
    );
  }, [candidates, filters]);

  useEffect(() => {
    setPage(0);
  }, [filters, candidates]);

  const paginatedCandidates = useMemo(
    () =>
      filteredCandidates.slice(
        page * ROWS_PER_PAGE,
        page * ROWS_PER_PAGE + ROWS_PER_PAGE
      ),
    [filteredCandidates, page]
  );

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
          disableElevation
          startIcon={<DownloadIcon />}
          onClick={() =>
            exportToExcel(
              candidates.map((c) => ({
                ...c,
                l1Score: getL1Score(c),
                l2Score: getL2Score(c),
                totalScore: getTotalScore(c),
              })),
              "candidate_summary.xlsx"
            )
          }
          sx={{
            backgroundColor: "#F0EBFB",
            color: "#4E2FA8",
            "&:hover": { backgroundColor: "#E3D7F8" },
          }}
        >
          Export to Excel
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          width: "100%",
          maxHeight: 560,
          overflowY: "auto",
          overflowX: "auto",
          scrollbarWidth: "thin",
        }}
      >
        <Table stickyHeader sx={{ tableLayout: "auto", width: "100%" }}>
          <TableHead>
            <TableRow ref={labelRowRef}>
              {tableHeaders.map((header) => (
                <TableCell
                  key={header.label}
                  sx={{
                    backgroundColor: "#6846C6",
                    color: "#fff",
                    fontWeight: "bold",
                    whiteSpace: "nowrap !important",
                    lineHeight: 1.2,
                    padding: "8px 10px",
                    fontSize: "12px !important",
                    position: "sticky",
                    top: 0,
                    zIndex: 3,
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
                  fontSize: "11.5px",
                },
                "& .MuiSelect-select": {
                  padding: "6px 8px",
                },
                "& .MuiTableCell-root": {
                  position: "sticky",
                  top: labelRowHeight,
                  zIndex: 2,
                },
              }}
            >
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Filter"
                  value={filters.candidateId}
                  onChange={setFilter("candidateId")}
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Filter"
                  value={filters.candidateName}
                  onChange={setFilter("candidateName")}
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Filter"
                  value={filters.candidateEmail}
                  onChange={setFilter("candidateEmail")}
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Filter"
                  value={filters.course}
                  onChange={setFilter("course")}
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Filter"
                  value={filters.department}
                  onChange={setFilter("department")}
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.writtenTestScore}
                  onChange={setFilter("writtenTestScore")}
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.groupDiscussionScore}
                  onChange={setFilter("groupDiscussionScore")}
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Filter"
                  value={filters.totalScore}
                  onChange={setFilter("totalScore")}
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.writtenTestStatus}
                  onChange={setFilter("writtenTestStatus")}
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.groupDiscussionStatus}
                  onChange={setFilter("groupDiscussionStatus")}
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Filter"
                  value={filters.preliminaryTestsRemarks}
                  onChange={setFilter("preliminaryTestsRemarks")}
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.l1Communication}
                  onChange={setFilter("l1Communication")}
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.l1TechnicalSkill}
                  onChange={setFilter("l1TechnicalSkill")}
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.l1ProgrammingLanguageSkill}
                  onChange={setFilter("l1ProgrammingLanguageSkill")}
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.l1DatabaseSkill}
                  onChange={setFilter("l1DatabaseSkill")}
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.l1AttitudeTowardsLearning}
                  onChange={setFilter("l1AttitudeTowardsLearning")}
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.l1DevExperience}
                  onChange={setFilter("l1DevExperience")}
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Filter"
                  value={filters.l1Score}
                  onChange={setFilter("l1Score")}
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Filter"
                  value={filters.l1ConductedBy}
                  onChange={setFilter("l1ConductedBy")}
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Filter"
                  value={filters.l1Remarks}
                  onChange={setFilter("l1Remarks")}
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.l2Communication}
                  onChange={setFilter("l2Communication")}
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.l2TechnicalSkill}
                  onChange={setFilter("l2TechnicalSkill")}
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.l2ProgrammingLanguageSkill}
                  onChange={setFilter("l2ProgrammingLanguageSkill")}
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.l2DatabaseSkill}
                  onChange={setFilter("l2DatabaseSkill")}
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.l2AttitudeTowardsLearning}
                  onChange={setFilter("l2AttitudeTowardsLearning")}
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  select
                  variant="outlined"
                  value={filters.l2DevExperience}
                  onChange={setFilter("l2DevExperience")}
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Filter"
                  value={filters.l2Score}
                  onChange={setFilter("l2Score")}
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Filter"
                  value={filters.l2ConductedBy}
                  onChange={setFilter("l2ConductedBy")}
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Filter"
                  value={filters.l2Remarks}
                  onChange={setFilter("l2Remarks")}
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }}>
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
              <TableCell sx={{ backgroundColor: "#FBFAFE" }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCandidates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={tableHeaders.length}
                  align="center"
                  sx={{ backgroundColor: "#FBFAFE" }}
                >
                  {candidates.length === 0
                    ? "No candidate assessment records yet."
                    : "No candidate assessment records match the applied filters."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedCandidates.map((c) => (
                <TableRow
                  key={c._id}
                  sx={{
                    height: BODY_ROW_HEIGHT,
                    "&:not(:last-child)": {
                      borderBottom: "1px solid #EFEBF7",
                    },
                    backgroundColor: "#FBFAFE",
                  }}
                >
                  <TableCell sx={bodyCellSx}>{c.candidateId}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.candidateName}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.candidateEmail}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.course}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.department}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.writtenTestScore}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.groupDiscussionScore}</TableCell>
                  <TableCell sx={bodyCellSx}>{getTotalScore(c)}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.writtenTestStatus}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.groupDiscussionStatus}</TableCell>
                  <TableCell sx={bodyCellSx}>
                    {c.preliminaryTestsRemarks}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>{c.l1Communication}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.l1TechnicalSkill}</TableCell>
                  <TableCell sx={bodyCellSx}>
                    {c.l1ProgrammingLanguageSkill}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>{c.l1DatabaseSkill}</TableCell>
                  <TableCell sx={bodyCellSx}>
                    {c.l1AttitudeTowardsLearning}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>{c.l1DevExperience}</TableCell>
                  <TableCell sx={bodyCellSx}>{getL1Score(c)}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.l1ConductedBy}</TableCell>
                  <TableCell sx={bodyCellSx}>
                    {formatDate(c.l1ConductedDate)}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>{c.l1Status}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.l1Remarks}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.l2Communication}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.l2TechnicalSkill}</TableCell>
                  <TableCell sx={bodyCellSx}>
                    {c.l2ProgrammingLanguageSkill}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>{c.l2DatabaseSkill}</TableCell>
                  <TableCell sx={bodyCellSx}>
                    {c.l2AttitudeTowardsLearning}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>{c.l2DevExperience}</TableCell>
                  <TableCell sx={bodyCellSx}>{getL2Score(c)}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.l2ConductedBy}</TableCell>
                  <TableCell sx={bodyCellSx}>
                    {formatDate(c.l2ConductedDate)}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>{c.l2Status}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.l2Remarks}</TableCell>
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
      <TablePagination
        component="div"
        count={filteredCandidates.length}
        page={page}
        onPageChange={(_e, newPage) => setPage(newPage)}
        rowsPerPage={ROWS_PER_PAGE}
        rowsPerPageOptions={[ROWS_PER_PAGE]}
        sx={{ width: "100%" }}
      />
    </>
  );
}

export default CandidateSummary;
