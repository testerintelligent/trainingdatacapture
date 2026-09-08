import React, { useMemo, useState } from "react";
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
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { exportToExcel } from "./exportToExcel";
import type { Candidate } from "./CandidateAssessment";

interface SelectedCandidatesProps {
  candidates: Candidate[];
}

const tableHeaders = [
  { label: "Department" },
  { label: "Candidate ID" },
  { label: "Candidate Name" },
  { label: "L2 Status" },
];

const ROWS_PER_PAGE = 10;

function SelectedCandidates({ candidates }: SelectedCandidatesProps) {
  const [page, setPage] = useState(0);

  const selectedCandidates = useMemo(
    () =>
      candidates.filter(
        (c) => c.l1Status === "Selected" && c.l2Status === "Selected"
      ),
    [candidates]
  );

  const paginatedCandidates = useMemo(
    () =>
      selectedCandidates.slice(
        page * ROWS_PER_PAGE,
        page * ROWS_PER_PAGE + ROWS_PER_PAGE
      ),
    [selectedCandidates, page]
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
          Selected Candidates
        </Typography>
        <Button
          variant="contained"
          disableElevation
          startIcon={<DownloadIcon />}
          onClick={() =>
            exportToExcel(
              selectedCandidates.map((c) => ({
                Department: c.department,
                "Candidate ID": c.candidateId,
                "Candidate Name": c.candidateName,
                "L2 Status": c.l2Status,
              })),
              "selected_candidates.xlsx"
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
            <TableRow>
              {tableHeaders.map((header) => (
                <TableCell
                  key={header.label}
                  sx={{
                    backgroundColor: "#6846C6",
                    color: "#fff",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    position: "sticky",
                    top: 0,
                    zIndex: 3,
                  }}
                >
                  {header.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedCandidates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={tableHeaders.length}
                  align="center"
                  sx={{ backgroundColor: "#FBFAFE" }}
                >
                  {candidates.length === 0
                    ? "No candidate assessment records yet."
                    : "No candidates selected in both L1 and L2."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedCandidates.map((c) => (
                <TableRow
                  key={c._id}
                  sx={{
                    height: 44,
                    "&:not(:last-child)": {
                      borderBottom: "1px solid #EFEBF7",
                    },
                    "& > *": { paddingTop: 0, paddingBottom: 0 },
                    backgroundColor: "#FBFAFE",
                  }}
                >
                  <TableCell sx={{ padding: "0 8px" }}>
                    {c.department}
                  </TableCell>
                  <TableCell sx={{ padding: "0 8px" }}>
                    {c.candidateId}
                  </TableCell>
                  <TableCell sx={{ padding: "0 8px" }}>
                    {c.candidateName}
                  </TableCell>
                  <TableCell sx={{ padding: "0 8px" }}>
                    {c.l2Status}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={selectedCandidates.length}
        page={page}
        onPageChange={(_e, newPage) => setPage(newPage)}
        rowsPerPage={ROWS_PER_PAGE}
        rowsPerPageOptions={[ROWS_PER_PAGE]}
        sx={{ width: "100%" }}
      />
    </>
  );
}

export default SelectedCandidates;
