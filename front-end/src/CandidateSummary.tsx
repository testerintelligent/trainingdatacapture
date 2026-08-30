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
import { exportToExcel } from "./exportToExcel";
import type { Candidate } from "./CandidateAssessment";
import { ratingOptions, interviewStatusOptions } from "./CandidateAssessment";
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
  { label: "Communication" },
  { label: "Technical Skill" },
  { label: "Programming Language Skill" },
  { label: "Database Skill" },
  { label: "Attitude Towards Learning" },
  { label: "Dev Experience" },
  { label: "Total Score" },
  { label: "L1 Conducted By" },
  { label: "L1 Conducted Date" },
  { label: "L1 Status" },
  { label: "L2 Conducted By" },
  { label: "L2 Conducted Date" },
  { label: "L2 Status" },
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
  communication: string;
  technicalSkill: string;
  programmingLanguageSkill: string;
  databaseSkill: string;
  attitudeTowardsLearning: string;
  devExperience: string;
  totalScore: string;
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
  candidateId: "",
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
  totalScore: "",
  l1ConductedBy: "",
  l1ConductedDate: "",
  l1Status: "",
  l2ConductedBy: "",
  l2ConductedDate: "",
  l2Status: "",
  createdAt: "",
  updatedAt: "",
};

const BODY_ROW_HEIGHT = 32; // 50% of the app-wide default .MuiTableRow-root height (64px)

const bodyCellSx = {
  padding: "2px 8px",
  fontSize: "9.9px !important",
  lineHeight: 1.2,
  whiteSpace: "nowrap !important" as const,
  verticalAlign: "middle" as const,
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

const ROWS_PER_PAGE = 15;

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

const getTotalScore = (c: Candidate) =>
  c.communication +
  c.technicalSkill +
  c.programmingLanguageSkill +
  c.databaseSkill +
  c.attitudeTowardsLearning +
  c.devExperience;

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
        textMatch(String(getTotalScore(c)), filters.totalScore) &&
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
          onClick={() =>
            exportToExcel(
              candidates.map((c) => ({
                ...c,
                totalScore: getTotalScore(c),
              })),
              "candidate_summary.xlsx"
            )
          }
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
                    padding: "6px 10px",
                    fontSize: "10.8px !important",
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
                  fontSize: "10.8px",
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
              <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Filter"
                  value={filters.candidateId}
                  onChange={setFilter("candidateId")}
                  fullWidth
                />
              </TableCell>
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
                  value={filters.totalScore}
                  onChange={setFilter("totalScore")}
                  fullWidth
                />
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
              paginatedCandidates.map((c) => (
                <TableRow
                  key={c._id}
                  sx={{
                    height: BODY_ROW_HEIGHT,
                    "&:not(:last-child)": {
                      borderBottom: "1px solid #e0e0e0",
                    },
                    backgroundColor: "#c6adf7",
                  }}
                >
                  <TableCell sx={bodyCellSx}>{c.candidateId}</TableCell>
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
                  <TableCell sx={bodyCellSx}>{getTotalScore(c)}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.l1ConductedBy}</TableCell>
                  <TableCell sx={bodyCellSx}>
                    {formatDate(c.l1ConductedDate)}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>{c.l1Status}</TableCell>
                  <TableCell sx={bodyCellSx}>{c.l2ConductedBy}</TableCell>
                  <TableCell sx={bodyCellSx}>
                    {formatDate(c.l2ConductedDate)}
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
