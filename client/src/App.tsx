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
    const res = await axios.get("/api/trainings");
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
      await axios.put(`/api/trainings/${editId}`, form);
    } else {
      await axios.post("/api/trainings", form);
    }
    fetchTrainings();
    handleClose();
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`/api/trainings/${id}`);
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

  return (
    <div className="app-flex-root">
      <aside className="side-menu">
        {/* <IconButton sx={{ color: "#fff", mb: 3 }}>
          <MenuIcon />
        </IconButton> */}
        <Tooltip title="Training Summary" placement="right">
          <IconButton
            onClick={() => {
              setShowTable(true);
              setShowForm(false);
            }}
            sx={{ color: showTable ? "#4299e1" : "#fff", mb: 2 }}
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
        <Container maxWidth="md" sx={{ px: 0 }}>
          {showTable && (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  mb: 2,
                }}
              >
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => exportToExcel(trainings)}
                  sx={{ ml: 2, height: "fit-content" }}
                >
                  Export to Excel
                </Button>
              </Box>
              <TableContainer
                component={Paper}
                sx={{ width: "100%", overflowX: "auto" }}
              >
                <Table sx={{ tableLayout: "fixed", width: "100%" }}>
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
                        }}
                      >
                        % Completed
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "5.46%",
                          backgroundColor: "#006A71",
                          color: "#fff",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
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
                        >
                          <MenuItem value="">All</MenuItem>
                          {projectNameOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          variant="outlined"
                          placeholder="Filter"
                          value={filters.empId}
                          onChange={(e) =>
                            setFilters((f) => ({ ...f, empId: e.target.value }))
                          }
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
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
                      <TableCell>
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
                      <TableCell>
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
                      <TableCell>
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
                        >
                          <MenuItem value="">All</MenuItem>
                          {trainingTypeOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
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
                      <TableCell>
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
                      <TableCell>
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
                        >
                          <MenuItem value="">All</MenuItem>
                          {statusOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
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
                      <TableCell />
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
                              gap: 1,
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
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              aria-label="delete"
                              onClick={() => handleDelete(t._id!)}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
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
              component="form"
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mt: 4,
                background:
                  "linear-gradient(to right,rgb(221, 227, 236),rgb(190, 168, 240),rgb(241, 177, 209) 100%)",
                p: 3,
                borderRadius: 2,
                boxShadow: 2,
                minWidth: 350,
                alignSelf: "center",
              }}
            >
              <Typography variant="h6" gutterBottom>
                {editId ? "Edit Training" : "Add Training"}
              </Typography>
              <TextField
                select
                label="Project Name"
                name="projectName"
                value={form.projectName}
                onChange={handleChange}
                required
                sx={{ width: "100%" }}
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
                sx={{ width: "100%" }}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 2,
                }}
              >
                <Button
                  onClick={() => {
                    setShowForm(false);
                    setShowTable(true);
                    handleClose();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} variant="contained">
                  {editId ? "Update" : "Add"}
                </Button>
              </Box>
            </Box>
          )}
        </Container>
      </main>
    </div>
  );
}

export default App;
