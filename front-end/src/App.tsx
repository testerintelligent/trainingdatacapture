import React, { useEffect, useState } from "react";
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
  TableRow,
  Paper,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddCircleIcon from "@mui/icons-material/AddCircle";
// import MenuIcon from "@mui/icons-material/Menu";
import { exportToExcel } from "./exportToExcel";
import "./App.css";
import "./responsive.css";

interface Training {
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
  const [showTable, setShowTable] = useState(true);
  const [showForm, setShowForm] = useState(false);

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
    const res = await axios.get("http://10.192.190.158:5002/api/trainings");
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
      await axios.put(`http://10.192.190.158:5002/api/trainings/${editId}`, form);
    } else {
      await axios.post("http://10.192.190.158:5002/api/trainings", form);
    }
    fetchTrainings();
    handleClose();
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`http://10.192.190.158:5002/api/trainings/${id}`);
    fetchTrainings();
  };

  // const filteredRows = trainings.filter((row) => {
  //   const search = searchText.toLowerCase();

  //   return (
  //     row.projectName?.toLowerCase().includes(search) ||
  //     row.empId?.toLowerCase().includes(search) ||
  //     row.employeeName?.toLowerCase().includes(search) ||
  //     row.course?.toLowerCase().includes(search) ||
  //     row.trainerName?.toLowerCase().includes(search) ||
  //     row.trainingType?.toLowerCase().includes(search) ||
  //     row.status?.toLowerCase().includes(search) ||
  //     row.endDate?.includes(search)
  //   );
  // });
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

  return (
    <div className="app-flex-root">
      <aside className="side-menu">
        <Tooltip title="Training Summary" placement="right">
          <IconButton
            onClick={() => {
              setShowTable(true);
              setShowForm(false);
            }}
            sx={{ color: showTable ? "#4299e1" : "#fff" }}
          >
            <DashboardIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add Training" placement="right">
          <IconButton
            onClick={() => {
              setShowForm(true);
              setShowTable(false);
              handleOpen();
            }}
            sx={{ color: showForm ? "#4299e1" : "#fff" }}
          >
            <AddCircleIcon />
          </IconButton>
        </Tooltip>
      </aside>

      <main className="main-content-flex">
        <div className="page-header">Employee Training Records</div>
        <Container
          maxWidth={false} // VERY IMPORTANT
          disableGutters
          sx={{
            width: "100%",
            px: "14px", // no side padding at any size
          }}
        >
          {showTable && (
            <>
              <Box>
                <Typography variant="h6">Employee Training Records</Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  width: "100%",
                  mb: 2,
                  gap: 2,
                }}
              >
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => exportToExcel(trainings)}
                  sx={{ marginRight: "4px" }}
                >
                  Export to Excel
                </Button>
              </Box>

              <TableContainer
                component={Paper}
                sx={{
                  maxHeight: 470, // set your desired height
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          width: "12.52%",
                          backgroundColor: "#006A71",
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
                          backgroundColor: "#006A71",
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
                          backgroundColor: "#006A71",
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
                          backgroundColor: "#006A71",
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
                          backgroundColor: "#006A71",
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
                          backgroundColor: "#006A71",
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
                          backgroundColor: "#006A71",
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
                          backgroundColor: "#006A71",
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
                          backgroundColor: "#006A71",
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
                          backgroundColor: "#006A71",
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
                          backgroundColor: "#006A71",
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
                      }}
                    >
                      <TableCell sx={{ backgroundColor: "#9ACBD0" }}>
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
                      <TableCell sx={{ backgroundColor: "#9ACBD0" }}>
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
                      <TableCell sx={{ backgroundColor: "#9ACBD0" }}>
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
                      <TableCell sx={{ backgroundColor: "#9ACBD0" }}>
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
                      <TableCell sx={{ backgroundColor: "#9ACBD0" }}>
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
                      <TableCell sx={{ backgroundColor: "#9ACBD0" }}>
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
                      <TableCell sx={{ backgroundColor: "#9ACBD0" }}>
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
                      <TableCell sx={{ backgroundColor: "#9ACBD0" }}>
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
                      <TableCell sx={{ backgroundColor: "#9ACBD0" }}>
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
                      <TableCell sx={{ backgroundColor: "#9ACBD0" }}>
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
                      <TableCell sx={{ backgroundColor: "#9ACBD0" }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTrainings.map((t) => (
                      <TableRow
                        key={t._id}
                        sx={{
                          height: 44,
                          "&:not(:last-child)": {
                            borderBottom: "1px solid #e0e0e0",
                          },
                          "& > *": { paddingTop: 0, paddingBottom: 0 },
                          backgroundColor: "#9ACBD0",
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
                              // gap: 0.5,
                            }}
                          >
                            <IconButton
                              aria-label="edit"
                              onClick={() => {
                                setShowForm(true);
                                setShowTable(false);
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
            </>
          )}
          {showForm && (
            <Box
              sx={{
                mt: 1,
                mx: { xs: 1, sm: "15%" }, // small margin on mobile, 10% on desktop
              }}
            >
              <Box>
                <Typography variant="h6">Employee Training Records</Typography>
              </Box>
              <Box
                component="form"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  mt: 4,
                  background:
                    "linear-gradient(to right,rgb(221, 227, 236),rgb(190, 168, 240),rgb(241, 177, 209) 100%)",
                  p: 1,
                  borderRadius: 2,
                  boxShadow: 2,
                  minWidth: 350,
                  alignSelf: "center",
                  maxHeight: "calc(100vh - 120px)", // adjust 120px based on header/top spacing
                  overflowY: "auto",
                  "& .MuiInputBase-root": {
                    fontSize: "10px",
                    height: "30px", // fixes vertical alignment
                  },
                  "& .MuiInputBase-input": {
                    padding: "4px 10px", // reduce inner padding
                    fontSize: "10px",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "10px",
                    transform: "translate(10px, 8px) scale(1)", // adjust vertical alignment
                  },
                  "& .MuiInputLabel-shrink": {
                    transform: "translate(10px, -6px) scale(0.75)", // float position when shrunk
                  },
                }}
              >
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  {editId ? "Edit Training" : "Add Training"}
                </Typography>
                <TextField
                  select
                  size="small"
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
                <TextField
                  label="EMP ID"
                  name="empId"
                  value={form.empId}
                  onChange={handleChange}
                  required
                  sx={{ width: "100%" }}
                />
                <TextField
                  label="Employee Name"
                  name="employeeName"
                  value={form.employeeName}
                  onChange={handleChange}
                  required
                  sx={{ width: "100%" }}
                />
                <TextField
                  label="Course"
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  required
                  sx={{ width: "100%" }}
                />
                <TextField
                  label="Trainer Name"
                  name="trainerName"
                  value={form.trainerName}
                  onChange={handleChange}
                  required
                  sx={{ width: "100%" }}
                />
                <TextField
                  select
                  label="Training Type"
                  name="trainingType"
                  value={form.trainingType}
                  onChange={handleChange}
                  required
                  sx={{ width: "100%" }}
                >
                  {trainingTypeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2, // space between the fields
                    width: "100%",
                  }}
                >
                  <TextField
                    label="Start Date"
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                    sx={{ width: "100%" }}
                  />
                  <TextField
                    label="End Date"
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                    sx={{ width: "100%" }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2, // space between the fields
                    width: "100%",
                  }}
                >
                  <TextField
                    select
                    label="Status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    required
                    sx={{ width: "100%" }}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="% Completed"
                    name="percentCompleted"
                    type="number"
                    value={form.percentCompleted ?? ""}
                    onChange={handleChange}
                    inputProps={{ min: 0, max: 100 }}
                    required
                    sx={{
                      width: "100%",
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                  }}
                >
                  <Button
                    sx={{ fontSize: "10px", fontWeight: "Medium" }}
                    onClick={() => {
                      setShowForm(false);
                      setShowTable(true);
                      handleClose();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    sx={{ fontSize: "10px", fontWeight: "Medium" }}
                    onClick={handleSubmit}
                    variant="contained"
                  >
                    {editId ? "Update" : "Add"}
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Container>
      </main>
    </div>
  );
}

export default App;
