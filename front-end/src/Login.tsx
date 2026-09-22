import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Fade,
  Grow,
  Avatar,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

const DEFAULT_LOGIN_ID = "demo";
const DEFAULT_PASSWORD = "1234";

interface LoginProps {
  onLogin: () => void;
}

function Login({ onLogin }: LoginProps) {
  const [loginId, setLoginId] = useState(DEFAULT_LOGIN_ID);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReset = () => {
    setLoginId(DEFAULT_LOGIN_ID);
    setPassword(DEFAULT_PASSWORD);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/login`, {
        loginId,
        password,
      });
      onLogin();
    } catch (err) {
      setLoading(false);
      setError("Invalid login ID or password.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #1B1339 0%, #6846C6 50%, #4E2FA8 100%)",
        backgroundSize: "200% 200%",
        animation: "gradientShift 12s ease infinite",
        "@keyframes gradientShift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "-10%",
          left: "-8%",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          filter: "blur(20px)",
          animation: "float1 9s ease-in-out infinite",
          "@keyframes float1": {
            "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
            "50%": { transform: "translateY(30px) translateX(20px)" },
          },
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          bottom: "-12%",
          right: "-6%",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: "rgba(179,157,219,0.18)",
          filter: "blur(20px)",
          animation: "float2 11s ease-in-out infinite",
          "@keyframes float2": {
            "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
            "50%": { transform: "translateY(-25px) translateX(-25px)" },
          },
        }}
      />

      <Grow in={mounted} timeout={500}>
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 400,
            mx: 2,
            p: { xs: 3.5, sm: 5 },
            borderRadius: 4,
            background: "rgba(255,255,255,0.97)",
            boxShadow: "0 20px 60px rgba(15, 10, 40, 0.35)",
            backdropFilter: "blur(6px)",
            position: "relative",
            zIndex: 1,
            transition: "transform 0.2s ease",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Avatar
              sx={{
                bgcolor: "#F0EBFB",
                color: "#6846C6",
                width: 56,
                height: 56,
                mb: 1.5,
              }}
            >
              <WorkspacePremiumIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1B1339" }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
              Sign in to continue
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Login ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              margin="normal"
              autoFocus
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ color: "#9B8FC7" }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "#9B8FC7" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Fade in={!!error}>
              <Typography
                variant="body2"
                sx={{ color: "#D32F2F", mt: 1, minHeight: 20, textAlign: "center" }}
              >
                {error}
              </Typography>
            </Fade>

            <Box sx={{ display: "flex", gap: 1.5, mt: error ? 1 : 3 }}>
              <Button
                type="button"
                fullWidth
                variant="outlined"
                disabled={loading}
                onClick={handleReset}
                sx={{
                  borderColor: "#D9D2EC",
                  color: "#4A5568",
                  py: 1.2,
                  transition: "all 0.2s ease",
                }}
              >
                Reset
              </Button>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !loginId || !password}
                sx={{
                  background: "#6846C6",
                  py: 1.2,
                  minHeight: 44,
                  transition: "all 0.2s ease",
                  "&:hover": { background: "#4E2FA8" },
                }}
              >
                {loading ? (
                  <CircularProgress size={22} sx={{ color: "#fff" }} />
                ) : (
                  "Submit"
                )}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Grow>
    </Box>
  );
}

export default Login;
