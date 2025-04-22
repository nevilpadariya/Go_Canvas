import { Grid, SelectChangeEvent } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import DashboardCard from "../../components/dashboardcardstudent";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import { useParams } from "react-router-dom";

function DashboardPage() {
  const [previousSemesterData, setPreviousSemesterData] = useState([]);
  const [currentSemesterData, setCurrentSemesterData] = useState([]);
  let { courseid } = useParams();

  const fetchCurrentSemesterData = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://alphago-fastapi-dev-dev.us-east-1.elasticbeanstalk.com/student/view_contents",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setCurrentSemesterData(response.data);
      } else {
        throw new Error("Failed to fetch current semester data");
      }
    } catch (error) {
      console.error("Error fetching current semester data:", error);
    }
  };

    const fetchPreviousSemesterData = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("No token found");
            }

            const response = await axios.get(
                "http://alphago-fastapi-dev-dev.us-east-1.elasticbeanstalk.com/student/previous_enrollment",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                // Filter the data to exclude entries with EnrollmentSemester "SPRING24"
                const filteredData = response.data.filter(
                    (enrollment: { EnrollmentSemester: string; }) => enrollment.EnrollmentSemester !== "SPRING24"
                );
                setPreviousSemesterData(filteredData);
            } else {
                throw new Error("Failed to fetch previous semester data");
            }
        } catch (error) {
            console.error("Error fetching previous semester data:", error);
        }
    };

  useEffect(() => {
    fetchCurrentSemesterData();
    fetchPreviousSemesterData();
  }, []);

  return (
    <>
      <Helmet>
        <title>Go-Canvas</title>
      </Helmet>
      <div className="wrapper">
        <div
          className="overlay"
          onClick={(e) => document.body.classList.toggle("sidebar-open")}
        ></div>
        <Header />
        <div className="main-background"></div>
        <main className="dashboard-content">
          <div className="sidebar">
            <Sidebar />
          </div>
          <div className="main-content">
            <div className="main-title">
              <h5>Dashboard</h5>
              <h6>Go-Canvas</h6>
            </div>
            <Grid container spacing={3} className="grid-sections">
              <Grid
                item
                md={12}
                lg={12}
                spacing={3}
                container
                className="grid-section-1"
              >
                {currentSemesterData.map((course, index) => (
                  <Grid
                    key={index}
                    item
                    sm={12}
                    md={4}
                    lg={4}
                    className="courses-grid"
                  >
                    <DashboardCard
                      courseid={course["Courseid"]}
                      coursename={course["Coursename"]}
                      coursedescription={course["Coursedescription"]}
                      coursesemester={course["Coursesemester"]}
                      buttondisabled={false}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <div className="dashboard-dropdown">
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  Previous Semesters
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3} className="grid-sections">
                    {previousSemesterData.map((course, index) => (
                      <Grid
                        key={index}
                        item
                        xs={12}
                        sm={4}
                        md={4}
                        lg={4}
                        className="courses-grid"
                        style={{ marginBottom: "20px" }}
                      >
                        <DashboardCard
                          courseid={course["Courseid"]}
                          coursename={course["Coursename"]}
                          coursedescription={course["Coursedescription"]}
                          coursesemester={course["EnrollmentSemester"]}
                          buttondisabled={true}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default DashboardPage;
