
import React from "react";
import { Helmet } from "react-helmet";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import DashboardCard from "../components/dashboardcard";
import { orderscard, profitIcon, selectDropdown } from "../assets/images";


function DropdownArrow() {
    return (
        <img className="dropdown-icon" src={selectDropdown} alt="downarrow" />
    );
}

function DashboardPage() {

    const [number, setNumber] = React.useState('');
    const handleChange = (event: SelectChangeEvent) => {
        setNumber(event.target.value as string);
    };
    return (
        <>
            <Helmet>
                <title>Go-Canvas</title>
            </Helmet>
            {/* Dashboardpage-Start */}
            <div className="wrapper">
                <div className="overlay" onClick={e => document.body.classList.toggle('sidebar-open')}></div>
                <div className="search-overlay" onClick={e => document.body.classList.toggle('search-open')}></div>
                <Header></Header>
                <div className="main-background"></div>
                <main className="dashnoard-content">
                    <div className="sidebar">
                        <Sidebar></Sidebar>
                    </div>
                    <div className="main-content">
                        <div className="main-title">
                            <h5>Dashboard</h5>
                            <h6>Go-Canvas</h6>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'Center', alignItems: 'Center', height: '4vh' }}></div>
                        <p> Current Courses </p>

                        <Grid container spacing={3} className="grid-sections">
                            <Grid item md={12} lg={12} spacing={3} container className="grid-section-1">
                                {/* Dashboardpage-Two-Cards-Start */}

                                <Grid item sm={3} md={3} lg={3} className="order-grid">
                                                           
                                    {/* <DashboardCard></DashboardCard> */}

                                    <div style={{ display: 'flex', justifyContent: 'Center', alignItems: 'Center', height: '4vh' }}></div>
                                    <Card sx={{ maxWidth: 300 }}>
                                        <CardActionArea>
                                            <CardMedia
                                                component="img"
                                                height="100"
                                                image="/static/images/cards/contemplative-reptile.jpg"
                                                alt="green iguana"
                                            />
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="div">
                                                    Course 1
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Data Mining
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                        <CardActions>
                                            <Button size="small" color="primary">
                                                255
                                            </Button>
                                        </CardActions>
                                    </Card>    

                                    <div style={{ display: 'flex', justifyContent: 'Center', alignItems: 'Center', height: '4vh' }}></div>
                                    <Card sx={{ maxWidth: 300 }}>
                                        <CardActionArea>
                                            <CardMedia
                                                component="img"
                                                height="100"
                                                image="/static/images/cards/contemplative-reptile.jpg"
                                                alt="green iguana"
                                            />
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="div">
                                                    Course 4
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    GWAR
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                        <CardActions>
                                            <Button size="small" color="primary">
                                                295
                                            </Button>
                                        </CardActions>
                                    </Card>                    

                                    
                                </Grid>

                                <Grid item sm={3} md={3} lg={3} className="order-grid">
                                    
                                <div style={{ display: 'flex', justifyContent: 'Right', alignItems: 'right', height: '4vh' }}></div>
                                    <Card sx={{ maxWidth: 300 }}>
                                        <CardActionArea>
                                            <CardMedia
                                                component="img"
                                                height="100"
                                                image="/static/images/cards/contemplative-reptile.jpg"
                                                alt="green iguana"
                                            />
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="div">
                                                    Course 2
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Software systems
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                        <CardActions>
                                            <Button size="small" color="primary">
                                                202
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>

                                <Grid item sm={3} md={3} lg={3} className="order-grid">
                                    
                                <div style={{ display: 'flex', justifyContent: 'Center', alignItems: 'Center', height: '4vh' }}></div>
                                    <Card sx={{ maxWidth: 300 }}>
                                        <CardActionArea>
                                            <CardMedia
                                                component="img"
                                                height="100"
                                                image="/static/images/cards/contemplative-reptile.jpg"
                                                alt="green iguana"
                                            />
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="div">
                                                    Course 3
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Machine Learning
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                        <CardActions>
                                            <Button size="small" color="primary">
                                                257
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid> 

                            </Grid>
                        </Grid>

                        <div style={{ display: 'flex', justifyContent: 'Center', alignItems: 'Center', height: '4vh' }}></div>
                        <p> Previous Courses </p>

                        <Grid container spacing={3} className="grid-sections">
                            <Grid item md={12} lg={12} spacing={3} container className="grid-section-1">
                                <Grid item sm={3} md={3} lg={3} className="order-grid">

                                <div style={{ display: 'flex', justifyContent: 'Center', alignItems: 'Center', height: '4vh' }}></div>
                                    <Card sx={{ maxWidth: 300 }}>
                                        <CardActionArea>
                                            <CardMedia
                                                component="img"
                                                height="100"
                                                image="/static/images/cards/contemplative-reptile.jpg"
                                                alt="green iguana"
                                            />
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="div">
                                                    Course 1
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Enterprise Software 
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                        <CardActions>
                                            <Button size="small" color="primary">
                                                272
                                            </Button>
                                        </CardActions>
                                    </Card>
                                    
                                </Grid>

                                <Grid item sm={3} md={3} lg={3} className="order-grid">

                                <div style={{ display: 'flex', justifyContent: 'Center', alignItems: 'Center', height: '4vh' }}></div>
                                    <Card sx={{ maxWidth: 300 }}>
                                        <CardActionArea>
                                            <CardMedia
                                                component="img"
                                                height="100"
                                                image="/static/images/cards/contemplative-reptile.jpg"
                                                alt="green iguana"
                                            />
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="div">
                                                    Course 2
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Cloud Technologies
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                        <CardActions>
                                            <Button size="small" color="primary">
                                                281
                                            </Button>
                                        </CardActions>
                                    </Card>
                                    
                                </Grid>

                                <Grid item sm={3} md={3} lg={3} className="order-grid">

                                <div style={{ display: 'flex', justifyContent: 'Center', alignItems: 'Center', height: '4vh' }}></div>
                                    <Card sx={{ maxWidth: 300 }}>
                                        <CardActionArea>
                                            <CardMedia
                                                component="img"
                                                height="100"
                                                image="/static/images/cards/contemplative-reptile.jpg"
                                                alt="green iguana"
                                            />
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="div">
                                                    Course 3
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Deep Learning 
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                        <CardActions>
                                            <Button size="small" color="primary">
                                                258
                                            </Button>
                                        </CardActions>
                                    </Card>
                                    
                                </Grid>

                            </Grid>
                        </Grid>
                    </div>
                </main>
            </div>
            {/* Dashboardpage-End */}
        </>
    );
}

export default DashboardPage;