import { Button, Card, CardContent, Checkbox, FormControlLabel, TextField } from "@mui/material";
import React from "react";
import { Helmet } from "react-helmet";
import { loginlogo } from "../assets/images";
import { checkBoxChecked } from "../assets/images";
import { checkBox } from "../assets/images";
import Header from "../components/header";

function CheckboxDefault() {
    return (<img src={checkBox} alt="checkbox" />);
}
function CheckboxChecked() {
    return (<img src={checkBoxChecked} alt="checkbox" />);
}

function LoginPage() {
    return (
        <>
            <Helmet>
                <title>Login | Go-Canvas</title>
            </Helmet>
            <Header></Header>
            {/* Loginpage-Start */}
            <section className="login-wrapper">
                {/* Login-Card-Start */}
                <Card>
                    <CardContent>
                        <div className="login-banner">
                            <div className="sign-up">
                                <h6>Welcome Back !</h6>
                                <p>Please Log In to continue</p>
                            </div>
                            <div className="login-logo">
                                <img src={loginlogo} alt="company" />
                            </div>
                        </div>
                        {/* Login-Form-Start */}
                        <form className="login-form">
                            <TextField label="Email" variant="standard" />
                            <TextField label="Password" variant="standard" type="password" />
                            <FormControlLabel control={<Checkbox
                                checkedIcon={<CheckboxChecked />}
                                icon={<CheckboxDefault />}
                            />} label="Keep me signed in" />
                            <Button variant="contained" href="/dashboard" className="btn-primary">Log In</Button>
                            <div style={{ textAlign: 'center' }}>
                                <a href="#" className="forgot">Forgot your password?</a>
                            </div>
                        </form>
                        {/* Login-Form-End */}
                    </CardContent>
                </Card>
                {/* Login-Card-End */}
            </section>
            {/* Loginpage-End */}
        </>
    );
}
export default LoginPage;