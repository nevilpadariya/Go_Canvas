import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { Helmet } from "react-helmet";
import { loginlogo } from "../assets/images";
import { checkBoxChecked } from "../assets/images";
import { checkBox } from "../assets/images";
import Header from "../components/header";
import { useNavigate } from "react-router-dom";
import { post } from "../service/Https-services";
function CheckboxDefault() {
  return <img src={checkBox} alt="checkbox" />;
}
function CheckboxChecked() {
  return <img src={checkBoxChecked} alt="checkbox" />;
}

interface User {
  username: string;
  password: string;
}

interface DecodedToken {
  useremail: string;
  userrole: string;
  userid: number;
}

const Login: React.FC = () => {
  const [user, setUser] = useState<User>({ username: "", password: "" });
  const [error, setError] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const payload = {
    username: user.username,
    password: user.password,
  };
  const handleLogin = async () => {
    try {
      const requestBody = new URLSearchParams();
      requestBody.append("grant_type", "password");
      requestBody.append("username", payload.username);
      requestBody.append("password", payload.password);
      requestBody.append("scope", "");
      requestBody.append("client_id", "string");
      requestBody.append("client_secret", "string");

      const response = await fetch("http://alphago-fastapi-dev-dev.us-east-1.elasticbeanstalk.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: requestBody,
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token;
        const payload: DecodedToken = jwtDecode(token);
        localStorage.setItem("token", token);
        setToken(token);
        const userRole = payload.userrole;
        localStorage.setItem("role", userRole);
        setToken(token);
        if (userRole === "Faculty") {
          navigate("/faculty_dashboard");
        } else if (userRole === "Student") {
          navigate("/dashboard");
        } else if (userRole === "Admin") {
          navigate("/admin_dashboard");
        } else {
          setError("Unknown user role");
        }
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.detail || "An error occurred during login.";
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred during login. Please try again later.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const sendAuthenticatedRequest = async () => {
    try {
      const response = await fetch("your-api-endpoint/data", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Data:", data);
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | Go-Canvas</title>
      </Helmet>
      <Header></Header>
      <section className="login-wrapper">
        <Card>
          <CardContent>
            <Box mt={5}>
              <Box>
                {error && (
                  <Typography variant="body1" color="error">
                    {error}
                  </Typography>
                )}
                <div className="login-banner">
                  <div className="sign-up">
                    <h6>Welcome Back !</h6>
                    <p>Please Log In to continue</p>
                  </div>
                  <div className="login-logo">
                    <img src={loginlogo} alt="company" />
                  </div>
                </div>
                <form
                  className="login-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                  }}
                >
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={user.username}
                    onChange={handleInputChange}
                    margin="normal"
                    variant="standard"
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    name="password"
                    value={user.password}
                    onChange={handleInputChange}
                    margin="normal"
                    variant="standard"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checkedIcon={<CheckboxChecked />}
                        icon={<CheckboxDefault />}
                      />
                    }
                    label="Keep me signed in"
                  />
                  <Button
                    variant="contained"
                    type="submit"
                    className="btn-primary"
                  >
                    Login
                  </Button>
                  <div style={{ textAlign: "center" }}>
                    <a href="#" className="forgot">
                      Forgot your password?
                    </a>
                  </div>
                </form>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </section>
    </>
  );
};

export default Login;
