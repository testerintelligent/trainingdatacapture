import React from "react";
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { exportToExcel } from "./exportToExcel";
import type { Candidate } from "./CandidateAssessment";

interface CandidateSummaryProps {
  candidates: Candidate[];
  onEdit: (candidate: Candidate) => void;
  onDelete: (id: string) => void;
}

const tableHeaders = [
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
];

function CandidateSummary({ candidates, onEdit, onDelete }: CandidateSummaryProps) {
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
          maxHeight: 470,
          overflowY: "auto",
          scrollbarWidth: "thin",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {tableHeaders.map((header) => (
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
                  colSpan={tableHeaders.length}
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
