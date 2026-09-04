import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
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
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Grid,
  Divider,
  Avatar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SchoolIcon from "@mui/icons-material/School";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import SummarizeIcon from "@mui/icons-material/Summarize";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { exportToExcel } from "./exportToExcel";
import ExecutiveDashboard from "./ExecutiveDashboard";
import CandidateAssessment, { Candidate } from "./CandidateAssessment";
import CandidateSummary from "./CandidateSummary";
import SelectedCandidates from "./SelectedCandidates";
import { useElementHeight } from "./useElementHeight";
import "./App.css";

export interface Training {
  _id?: string;
  empId: string;
  employeeName: string;
  course: string;
  startDate: string;
  endDate: string;
  status: string;
  trainerName: string;
  trainingType: string;
  percentCompleted?: number;
  projectName: string;
}

const statusOptions = ["Completed", "In Progress", "Not Started"];
const trainingTypeOptions = ["Udemy", "Coursera", "Classroom", "Virtual"];
const projectNameOptions = (
  process.env.REACT_APP_PROJECT_NAMES || "ABC,CDE,EFG,HIJ,KLM"
).split(",");
const ROWS_PER_PAGE = 10;
const COMPLETION_ROWS_PER_PAGE = 10;

function App() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [form, setForm] = useState<Training>({
    empId: "",
    employeeName: "",
    course: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    status: "Not Started",
    trainerName: "",
    trainingType: "Udemy",
    percentCompleted: 0,
    projectName: projectNameOptions[0],
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [showExecutive, setShowExecutive] = useState(false);
  const [showRecruitment, setShowRecruitment] = useState(false);
  const [showCandidateSummary, setShowCandidateSummary] = useState(false);
  const [showSelectedCandidates, setShowSelectedCandidates] = useState(false);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [trainingLabelRowRef, trainingLabelRowHeight] =
    useElementHeight<HTMLTableRowElement>();

  const fetchCandidates = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/candidates`);
    setCandidates(res.data);
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleCandidateEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setShowRecruitment(true);
    setShowCandidateSummary(false);
    setShowSelectedCandidates(false);
    setShowExecutive(false);
    setShowSummary(false);
    setShowTable(false);
    setShowForm(false);
  };

  const handleCandidateDelete = async (id: string) => {
    await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/candidates/${id}`);
    fetchCandidates();
  };

  const handleCandidateDone = () => {
    fetchCandidates();
    setEditingCandidate(null);
    setShowCandidateSummary(true);
    setShowSelectedCandidates(false);
    setShowRecruitment(false);
    setShowExecutive(false);
    setShowSummary(false);
    setShowTable(false);
    setShowForm(false);
  };

  const [filters, setFilters] = useState({
    empId: "",
    employeeName: "",
    course: "",
    trainerName: "",
    trainingType: "",
    startDate: "",
    endDate: "",
    status: "",
    percentCompleted: "",
    projectName: "",
  });

  const fetchTrainings = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/trainings`);
    setTrainings(res.data);
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleOpen = (training?: Training) => {
    if (training) {
      setForm({
        ...training,
        startDate: training.startDate.slice(0, 10),
        endDate: training.endDate.slice(0, 10),
      });
      setEditId(training._id!);
    } else {
      setForm({
        empId: "",
        employeeName: "",
        course: "",
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        status: "Not Started",
        trainerName: "",
        trainingType: "Udemy",
        percentCompleted: 0,
        projectName: projectNameOptions[0],
      });
      setEditId(null);
    }
    setShowForm(true);
    setShowTable(false);
  };

  const handleClose = () => {
    setShowForm(false);
    setShowTable(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "projectName" ? value.trim() : value,
    });
  };

  const handleSubmit = async () => {
    if (!form.trainerName.trim()) {
      alert("Trainer Name is required.");
      return;
    }
    if (editId) {
      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/trainings/${editId}`, form);
    } else {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/trainings`, form);
    }
    fetchTrainings();
    handleClose();
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/trainings/${id}`);
    fetchTrainings();
  };

  const filteredTrainings = trainings.filter((t) => {
    return (
      (!filters.empId ||
        t.empId.toLowerCase().includes(filters.empId.toLowerCase())) &&
      (!filters.employeeName ||
        t.employeeName
          .toLowerCase()
          .includes(filters.employeeName.toLowerCase())) &&
      (!filters.course ||
        t.course.toLowerCase().includes(filters.course.toLowerCase())) &&
      (!filters.trainerName ||
        t.trainerName
          .toLowerCase()
          .includes(filters.trainerName.toLowerCase())) &&
      (!filters.trainingType || t.trainingType === filters.trainingType) &&
      (!filters.startDate || t.startDate.slice(0, 10) === filters.startDate) &&
      (!filters.endDate || t.endDate.slice(0, 10) === filters.endDate) &&
      (!filters.status || t.status === filters.status) &&
      (!filters.percentCompleted ||
        String(t.percentCompleted ?? "").includes(filters.percentCompleted)) &&
      (!filters.projectName || t.projectName === filters.projectName)
    );
  });

  const [trainingsPage, setTrainingsPage] = useState(0);

  useEffect(() => {
    setTrainingsPage(0);
  }, [filters, trainings]);

  const paginatedTrainings = useMemo(
    () =>
      filteredTrainings.slice(
        trainingsPage * ROWS_PER_PAGE,
        trainingsPage * ROWS_PER_PAGE + ROWS_PER_PAGE
      ),
    [filteredTrainings, trainingsPage]
  );

  // Summary: Project Name + Course -> count of employees who completed it
  const completionSummary = useMemo(() => {
    const map = new Map<
      string,
      { projectName: string; course: string; completedCount: number }
    >();
    trainings.forEach((t) => {
      if (t.status === "Completed") {
        const key = `${t.projectName}|||${t.course}`;
        const existing = map.get(key);
        if (existing) {
          existing.completedCount += 1;
        } else {
          map.set(key, {
            projectName: t.projectName,
            course: t.course,
            completedCount: 1,
          });
        }
      }
    });
    return Array.from(map.values()).sort(
      (a, b) =>
        a.projectName.localeCompare(b.projectName) ||
        a.course.localeCompare(b.course)
    );
  }, [trainings]);

  const [completionPage, setCompletionPage] = useState(0);

  useEffect(() => {
    setCompletionPage(0);
  }, [completionSummary]);

  const paginatedCompletionSummary = useMemo(
    () =>
      completionSummary.slice(
        completionPage * COMPLETION_ROWS_PER_PAGE,
        completionPage * COMPLETION_ROWS_PER_PAGE + COMPLETION_ROWS_PER_PAGE
      ),
    [completionSummary, completionPage]
  );

  return (
    <div className="app-flex-root">
      <aside className="side-menu">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.5,
            mb: 2,
            width: "100%",
            px: "4px",
          }}
        >
          <Avatar sx={{ bgcolor: "#6846C6", width: "60%", height: "auto", aspectRatio: "1 / 1" }}>
            <WorkspacePremiumIcon sx={{ fontSize: "1.4vw" }} />
          </Avatar>
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 800,
              fontSize: "0.65rem",
              letterSpacing: "0.02em",
              textAlign: "center",
              lineHeight: 1.2,
              wordBreak: "break-word",
            }}
          >
            WorkReady
          </Typography>
        </Box>
        <Tooltip title="Add Training" placement="right">
          <IconButton
            onClick={() => {
              setShowForm(true);
              setShowTable(false);
              setShowSummary(false);
              setShowExecutive(false);
              setShowRecruitment(false);
              setShowCandidateSummary(false);
              setShowSelectedCandidates(false);
              handleOpen();
            }}
            sx={{ color: showForm ? "#4299e1" : "#fff" }}
          >
            <AddCircleIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Training Summary" placement="right">
          <IconButton
            onClick={() => {
              setShowTable(true);
              setShowForm(false);
              setShowSummary(false);
              setShowExecutive(false);
              setShowRecruitment(false);
              setShowCandidateSummary(false);
              setShowSelectedCandidates(false);
            }}
            sx={{ color: showTable ? "#4299e1" : "#fff" }}
          >
            <DashboardIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Completion Summary" placement="right">
          <IconButton
            onClick={() => {
              setShowSummary(true);
              setShowTable(false);
              setShowForm(false);
              setShowExecutive(false);
              setShowRecruitment(false);
              setShowCandidateSummary(false);
              setShowSelectedCandidates(false);
            }}
            sx={{ color: showSummary ? "#4299e1" : "#fff" }}
          >
            <AssessmentIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Executive Dashboard" placement="right">
          <IconButton
            onClick={() => {
              setShowExecutive(true);
              setShowSummary(false);
              setShowTable(false);
              setShowForm(false);
              setShowRecruitment(false);
              setShowCandidateSummary(false);
              setShowSelectedCandidates(false);
            }}
            sx={{ color: showExecutive ? "#4299e1" : "#fff" }}
          >
            <TrendingUpIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Candidate Assessment" placement="right">
          <IconButton
            onClick={() => {
              setEditingCandidate(null);
              setShowRecruitment(true);
              setShowExecutive(false);
              setShowSummary(false);
              setShowTable(false);
              setShowForm(false);
              setShowCandidateSummary(false);
              setShowSelectedCandidates(false);
            }}
            sx={{ color: showRecruitment ? "#4299e1" : "#fff" }}
          >
            <HowToRegIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Candidate Summary" placement="right">
          <IconButton
            onClick={() => {
              setShowCandidateSummary(true);
              setShowRecruitment(false);
              setShowExecutive(false);
              setShowSummary(false);
              setShowTable(false);
              setShowForm(false);
              setShowSelectedCandidates(false);
            }}
            sx={{ color: showCandidateSummary ? "#4299e1" : "#fff" }}
          >
            <SummarizeIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Selected Candidates" placement="right">
          <IconButton
            onClick={() => {
              setShowSelectedCandidates(true);
              setShowCandidateSummary(false);
              setShowRecruitment(false);
              setShowExecutive(false);
              setShowSummary(false);
              setShowTable(false);
              setShowForm(false);
            }}
            sx={{ color: showSelectedCandidates ? "#4299e1" : "#fff" }}
          >
            <CheckCircleIcon />
          </IconButton>
        </Tooltip>
      </aside>

      <main className="main-content-flex">
        <Container
          maxWidth={false} // VERY IMPORTANT
          disableGutters
          sx={{
            width: "100%",
            px: "8px", // 2px gap between left and right
          }}
        >
          {showTable && (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  width: "100%",
                  mt: 2,
                  mb: 2,
                  gap: 2,
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => exportToExcel(trainings)}
                  sx={{
                    marginRight: "4px",
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
                  maxHeight: 760, // fits 15 rows without an inner scrollbar
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow
                      ref={trainingLabelRowRef}
                      sx={{
                        "& .MuiTableCell-root": {
                          position: "sticky",
                          top: 0,
                          zIndex: 3,
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          width: "12.52%",
                          backgroundColor: "#6846C6",
                          color: "#fff",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "16px !important", // increase as needed
                        }}
                      >
                        Project Name
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "10%",
                          backgroundColor: "#6846C6",
                          color: "#fff",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "16px !important",
                        }}
                      >
                        EMP ID
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "18.97%",
                          backgroundColor: "#6846C6",
                          color: "#fff",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "16px !important",
                        }}
                      >
                        Employee Name
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "18.97%",
                          backgroundColor: "#6846C6",
                          color: "#fff",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "16px !important",
                        }}
                      >
                        Course
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "18.97%",
                          backgroundColor: "#6846C6",
                          color: "#fff",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "16px !important",
                        }}
                      >
                        Trainer Name
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "18.97%",
                          backgroundColor: "#6846C6",
                          color: "#fff",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "16px !important",
                        }}
                      >
                        Training Type
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "12.52%",
                          backgroundColor: "#6846C6",
                          color: "#fff",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "16px !important",
                        }}
                      >
                        Start Date
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "12.52%",
                          backgroundColor: "#6846C6",
                          color: "#fff",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "16px !important",
                        }}
                      >
                        End Date
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "10%",
                          backgroundColor: "#6846C6",
                          color: "#fff",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "16px !important",
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "10%",
                          backgroundColor: "#6846C6",
                          color: "#fff",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "16px !important",
                        }}
                      >
                        % Completed
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "5.46%",
                          backgroundColor: "#6846C6",
                          color: "#fff",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "16px !important",
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                    <TableRow
                      sx={{
                        "& .MuiInputBase-root": {
                          height: 32, // reduce overall height
                          fontSize: "12px", // reduce text size
                        },
                        "& .MuiSelect-select": {
                          padding: "6px 8px", // reduce inner padding
                        },
                        "& .MuiTableCell-root": {
                          position: "sticky",
                          top: trainingLabelRowHeight,
                          zIndex: 2,
                        },
                      }}
                    >
                      <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                        <TextField
                          size="small"
                          select
                          variant="outlined"
                          placeholder="Filter"
                          value={filters.projectName}
                          onChange={(e) =>
                            setFilters((f) => ({
                              ...f,
                              projectName: e.target.value,
                            }))
                          }
                          fullWidth
                          SelectProps={{
                            // display placeholder on the select field
                            displayEmpty: true, // IMPORTANT
                            renderValue: (selected: any) => {
                              if (selected === "") {
                                return (
                                  <MenuItem
                                    sx={{
                                      color: "#999",
                                      fontSize: "12px",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    Filter
                                  </MenuItem>
                                );
                              }
                              return selected;
                            },
                          }}
                        >
                          <MenuItem value="">All</MenuItem>
                          {projectNameOptions.map((option) => (
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
                          value={filters.empId}
                          onChange={(e) =>
                            setFilters((f) => ({
                              ...f,
                              empId: e.target.value,
                            }))
                          }
                          fullWidth
                        />
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                        <TextField
                          size="small"
                          variant="outlined"
                          placeholder="Filter"
                          value={filters.employeeName}
                          onChange={(e) =>
                            setFilters((f) => ({
                              ...f,
                              employeeName: e.target.value,
                            }))
                          }
                          fullWidth
                        />
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                        <TextField
                          size="small"
                          variant="outlined"
                          placeholder="Filter"
                          value={filters.course}
                          onChange={(e) =>
                            setFilters((f) => ({
                              ...f,
                              course: e.target.value,
                            }))
                          }
                          fullWidth
                        />
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                        <TextField
                          size="small"
                          variant="outlined"
                          placeholder="Filter"
                          value={filters.trainerName}
                          onChange={(e) =>
                            setFilters((f) => ({
                              ...f,
                              trainerName: e.target.value,
                            }))
                          }
                          fullWidth
                        />
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                        <TextField
                          size="small"
                          select
                          variant="outlined"
                          placeholder="Filter"
                          value={filters.trainingType}
                          onChange={(e) =>
                            setFilters((f) => ({
                              ...f,
                              trainingType: e.target.value,
                            }))
                          }
                          fullWidth
                          SelectProps={{
                            displayEmpty: true, // IMPORTANT
                            renderValue: (selected: any) => {
                              if (selected === "") {
                                return (
                                  <MenuItem
                                    sx={{
                                      color: "#999",
                                      fontSize: "12px",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    Filter
                                  </MenuItem>
                                );
                              }
                              return selected;
                            },
                          }}
                        >
                          <MenuItem value="">All</MenuItem>
                          {trainingTypeOptions.map((option) => (
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
                          value={filters.startDate}
                          onChange={(e) =>
                            setFilters((f) => ({
                              ...f,
                              startDate: e.target.value,
                            }))
                          }
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                        <TextField
                          size="small"
                          type="date"
                          variant="outlined"
                          value={filters.endDate}
                          onChange={(e) =>
                            setFilters((f) => ({
                              ...f,
                              endDate: e.target.value,
                            }))
                          }
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#c6adf7" }}>
                        <TextField
                          size="small"
                          select
                          variant="outlined"
                          value={filters.status}
                          onChange={(e) =>
                            setFilters((f) => ({
                              ...f,
                              status: e.target.value,
                            }))
                          }
                          fullWidth
                          SelectProps={{
                            displayEmpty: true, // IMPORTANT
                            renderValue: (selected: any) => {
                              if (selected === "") {
                                return (
                                  <MenuItem
                                    sx={{
                                      color: "#999",
                                      fontSize: "12px",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    Filter
                                  </MenuItem>
                                );
                              }
                              return selected;
                            },
                          }}
                        >
                          <MenuItem value="">All</MenuItem>
                          {statusOptions.map((option) => (
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
                          value={filters.percentCompleted}
                          onChange={(e) =>
                            setFilters((f) => ({
                              ...f,
                              percentCompleted: e.target.value,
                            }))
                          }
                          fullWidth
                        />
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#c6adf7" }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedTrainings.map((t) => (
                      <TableRow
                        key={t._id}
                        sx={{
                          height: 44,
                          "&:not(:last-child)": {
                            borderBottom: "1px solid #e0e0e0",
                          },
                          "& > *": { paddingTop: 0, paddingBottom: 0 },
                          backgroundColor: "#c6adf7",
                        }}
                      >
                        <TableCell sx={{ width: "12.52%", padding: "0 8px" }}>
                          {t.projectName}
                        </TableCell>
                        <TableCell sx={{ width: "10%", padding: "0 8px" }}>
                          {t.empId}
                        </TableCell>
                        <TableCell sx={{ width: "18.97%", padding: "0 8px" }}>
                          {t.employeeName}
                        </TableCell>
                        <TableCell sx={{ width: "18.97%", padding: "0 8px" }}>
                          {t.course}
                        </TableCell>
                        <TableCell sx={{ width: "18.97%", padding: "0 8px" }}>
                          {t.trainerName}
                        </TableCell>
                        <TableCell sx={{ width: "18.97%", padding: "0 8px" }}>
                          {t.trainingType}
                        </TableCell>
                        <TableCell sx={{ width: "12.52%", padding: "0 8px" }}>
                          {new Date(t.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell sx={{ width: "12.52%", padding: "0 8px" }}>
                          {new Date(t.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell
                          sx={{
                            width: "10%",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            padding: "0 8px",
                          }}
                        >
                          {t.status}
                        </TableCell>
                        <TableCell sx={{ width: "10%", padding: "0 8px" }}>
                          {typeof t.percentCompleted === "number"
                            ? `${t.percentCompleted}%`
                            : ""}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ width: "5.46%", padding: "0 8px" }}
                        >
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
                              onClick={() => {
                                setShowForm(true);
                                setShowTable(false);
                                setShowExecutive(false);
                                handleOpen(t);
                              }}
                              size="small"
                              sx={{
                                padding: "2px !important", // reduce clickable area
                              }}
                            >
                              <EditIcon sx={{ fontSize: "14px" }} />
                            </IconButton>
                            <IconButton
                              aria-label="delete"
                              onClick={() => handleDelete(t._id!)}
                              size="small"
                              sx={{
                                padding: "2px !important", // reduce clickable area
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: "14px" }} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredTrainings.length}
                page={trainingsPage}
                onPageChange={(_e, newPage) => setTrainingsPage(newPage)}
                rowsPerPage={ROWS_PER_PAGE}
                rowsPerPageOptions={[ROWS_PER_PAGE]}
              />
            </>
          )}
          {showForm && (
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
                    gap: 1,
                    px: { xs: 2.5, sm: 4 },
                    py: 1.25,
                    background: "#6846C6",
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.18)",
                      color: "#fff",
                      width: 28,
                      height: 28,
                    }}
                  >
                    <SchoolIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#fff", fontWeight: 700, lineHeight: 1.2 }}
                    >
                      {editId ? "Edit Training" : "Add Training"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.2 }}
                    >
                      {editId
                        ? "Update the details for this training record"
                        : "Fill in the details to create a new training record"}
                    </Typography>
                  </Box>
                </Box>

                {/* Fields */}
                <Box
                  sx={{
                    px: { xs: 2.5, sm: 4 },
                    py: 3,
                    overflowY: "auto",
                  }}
                >
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select
                        fullWidth
                        label="Project Name"
                        name="projectName"
                        value={form.projectName}
                        onChange={handleChange}
                        required
                      >
                        {projectNameOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="EMP ID"
                        name="empId"
                        value={form.empId}
                        onChange={handleChange}
                        required
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Employee Name"
                        name="employeeName"
                        value={form.employeeName}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Trainer Name"
                        name="trainerName"
                        value={form.trainerName}
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
                        select
                        fullWidth
                        label="Training Type"
                        name="trainingType"
                        value={form.trainingType}
                        onChange={handleChange}
                        required
                      >
                        {trainingTypeOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        name="startDate"
                        type="date"
                        value={form.startDate}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="End Date"
                        name="endDate"
                        type="date"
                        value={form.endDate}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select
                        fullWidth
                        label="Status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        required
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="% Completed"
                        name="percentCompleted"
                        type="number"
                        value={form.percentCompleted ?? ""}
                        onChange={handleChange}
                        inputProps={{ min: 0, max: 100 }}
                        required
                      />
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
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowForm(false);
                      setShowTable(true);
                      handleClose();
                    }}
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
                    {editId ? "Update Training" : "Add Training"}
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
          {showSummary && (
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
                <Typography
                  variant="h6"
                  sx={{ color: "#6846C6", fontWeight: 700 }}
                >
                  Course Completion Summary
                </Typography>
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
                      <TableCell
                        sx={{
                          width: "40%",
                          backgroundColor: "#6846C6",
                          color: "#fff",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "16px !important",
                        }}
                      >
                        Project Name
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "40%",
                          backgroundColor: "#6846C6",
                          color: "#fff",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "16px !important",
                        }}
                      >
                        Course
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "20%",
                          backgroundColor: "#6846C6",
                          color: "#fff",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "16px !important",
                        }}
                      >
                        No of Employees Completed
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {completionSummary.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          align="center"
                          sx={{ backgroundColor: "#c6adf7" }}
                        >
                          No completed training records yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedCompletionSummary.map((row) => (
                        <TableRow
                          key={`${row.projectName}-${row.course}`}
                          sx={{
                            height: 44,
                            "&:not(:last-child)": {
                              borderBottom: "1px solid #e0e0e0",
                            },
                            "& > *": { paddingTop: 0, paddingBottom: 0 },
                            backgroundColor: "#c6adf7",
                          }}
                        >
                          <TableCell sx={{ width: "40%", padding: "0 8px" }}>
                            {row.projectName}
                          </TableCell>
                          <TableCell sx={{ width: "40%", padding: "0 8px" }}>
                            {row.course}
                          </TableCell>
                          <TableCell sx={{ width: "20%", padding: "0 8px" }}>
                            {row.completedCount}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={completionSummary.length}
                page={completionPage}
                onPageChange={(_e, newPage) => setCompletionPage(newPage)}
                rowsPerPage={COMPLETION_ROWS_PER_PAGE}
                rowsPerPageOptions={[COMPLETION_ROWS_PER_PAGE]}
              />
            </>
          )}
          {showExecutive && <ExecutiveDashboard trainings={trainings} />}
          {showRecruitment && (
            <CandidateAssessment
              editingCandidate={editingCandidate}
              onDone={handleCandidateDone}
            />
          )}
          {showCandidateSummary && (
            <CandidateSummary
              candidates={candidates}
              onEdit={handleCandidateEdit}
              onDelete={handleCandidateDelete}
            />
          )}
          {showSelectedCandidates && (
            <SelectedCandidates candidates={candidates} />
          )}
        </Container>
      </main>
    </div>
  );
}

export default App;
