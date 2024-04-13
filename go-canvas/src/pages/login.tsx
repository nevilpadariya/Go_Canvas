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
import { Helmet } from "react-helmet";
import { loginlogo } from "../assets/images";
import { checkBoxChecked } from "../assets/images";
import { checkBox } from "../assets/images";
import Header from "../components/header";
import { useNavigate } from 'react-router-dom';
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

const Login: React.FC = () => {
  const [user, setUser] = useState<User>({ username: "", password: "" });
  const [error, setError] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  // ? - for navigation to another page
  const navigate = useNavigate();
  useEffect(() => {
    // Check if token exists in local storage (assuming it's saved securely after login)
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      // Optionally, you can redirect the user to a dashboard or home page
      navigate('dashboard');
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const payload = {
    username : user.username,
    password: user.password
  }
  const handleLogin = async () => {
    // TODO : replace api url 'your-api-endpoint/login' with backend provided url...
    try {
      const response = await fetch("https://dummyjson.com/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log('api response===>>',response);
      
      if (response.ok) {
        const data = await response.json();
        const token = data.token; // Assuming your API returns a token upon successful login
        localStorage.setItem("token", token); // Save token securely in local storage
        setToken(token);
        navigate('dashboard')
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("Error during login. Please try again later.");
    }
  };

  const handleLogout = () => {
    // Clear token from local storage and reset state
    localStorage.removeItem("token");
    setToken(null);
  };

  const sendAuthenticatedRequest = async () => {
    try {
      const response = await fetch("your-api-endpoint/data", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Include token in request headers
        },
      });

      if (response.ok) {
        // Handle successful response
        const data = await response.json();
        console.log("Data:", data);
      } else {
        // Handle unauthorized or other errors
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
