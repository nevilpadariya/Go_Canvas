# Canvas Learning Management System

## About the Team

### Team Members:

1. Pratikkumar Dalsukhbhai Korat
2. Shashi Kumar Singarapu
3. Nevil Padariya
4. Nagaraj Gireppa Kanni

### Areas of Contribution:

1. Nevil Padariya: Focused on frontend development with React MUI, including UI design and implementation.
2. Nagaraj Gireppa Kanni: Worked on Frontend development, Implementataion and Creating UI wireframes.
3. Pratikkumar Dalsukhbhai Korat: Responsible for backend development and deployment, Creating API's, covering authentication and deployment strategies.
4. Shashi Kumar Singarapu: Worked on Database Creation, queries and implementing indexing strategies for efficient data retrieval using Myslq, AWS and Documention of API's. 

## UI Wireframes -> Go-Canvas
[https://www.figma.com/file/YeRAU2TDYUcUvqpBdOmFFx/UI---Wireframe-Alpha-Go?type=design&node-id=0%3A1&mode=design&t=IBOU1Y8PltWXyWAd-1](https://www.figma.com/file/YeRAU2TDYUcUvqpBdOmFFx/UI---Wireframe-Alpha-Go?type=design&node-id=0-1&mode=design&t=H65ORFQV0xlpQwzf-0)    

## Project Scrum Report
[https://docs.google.com/document/d/10ToOWhSg49ZHoCxhmghXeouYv78NDbrlml-84_T0pdA/edit?usp=sharing](https://docs.google.com/document/d/10ToOWhSg49ZHoCxhmghXeouYv78NDbrlml-84_T0pdA/edit?usp=sharing)

## Project Sprint Task Board
[https://docs.google.com/spreadsheets/d/1dOhTIWpXqigDmyuhcH56Akir58COccCX45SJSRqHV84/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1dOhTIWpXqigDmyuhcH56Akir58COccCX45SJSRqHV84/edit?usp=sharing)

## Backend Application
* Python - FastAPI
### How to run backend application
  1. Install dependencies
     > !pip install -r requirements.txt

  2. Run the application using following command
     > uvicorn main:app --reload

  3. Check Documentation
     > go to http://127.0.0.1:8000/docs after running the application

## Project Technologies Stack:

* Backend -> Python, FastAPI
* Database -> PostgreSQL
* Frontend -> React, TypeScript, Tailwind CSS, Radix UI
* Wireframes -> Figma
* Deployment -> DigitalOcean (Backend & Database) & Vercel (Frontend)

## ✨ Key Features

### For Students
- ✅ **Assignment Submission** - Submit text answers and file uploads
- ✅ **Quiz System** - Take quizzes with instant auto-grading for MC/TF questions
- ✅ **Grades Dashboard** - View GPA, course grades, and assignment breakdown
- ✅ **Course Management** - Browse enrolled courses and materials
- ✅ **Progress Tracking** - Monitor submission status and quiz performance

### For Faculty
- ✅ **Assignment Creation** - Create assignments with descriptions
- ✅ **Quiz Builder** - Design quizzes via API with multiple question types
- ✅ **Auto-Grading** - Automatic grading for objective questions
- ✅ **Manual Grading** - Grade essay and short answer questions
- ✅ **Speedgrader** - Efficiently grade student submissions

### For Admins
- ✅ **User Management** - Manage students, faculty, and courses
- ✅ **Course Assignment** - Assign students and faculty to courses
- ✅ **System Monitoring** - Track overall platform usage

## 📚 Documentation

- **[API Testing Guide](./API_TESTING_GUIDE.md)** - Complete API reference and testing workflows
- **[Quick Start Guide](./.gemini/antigravity/brain/0a6b5719-80f3-45c6-8b7d-ce8863cdf8b6/quick_start_guide.md)** - Setup and run the application
- **[Implementation Walkthrough](./.gemini/antigravity/brain/0a6b5719-80f3-45c6-8b7d-ce8863cdf8b6/walkthrough.md)** - Detailed feature documentation
- **[Task Tracker](./.gemini/antigravity/brain/0a6b5719-80f3-45c6-8b7d-ce8863cdf8b6/task.md)** - Development progress tracking

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL database

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Go_Canvas
   ```

2. **Backend Setup**
   ```bash
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your database credentials
   python scripts/init_database.py
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Run the application**
   ```bash
   # Terminal 1 - Backend
   uvicorn main:app --reload
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Seed Sample Data
```bash
# Create sample quiz for testing
python seed_sample_quiz.py
```

## Deployment Instructions

### Recommended: DigitalOcean (GitHub Student Developer Pack) 🎓

**Best for students with GitHub Student Developer Pack ($200 credit for 1 year)**

For complete step-by-step instructions, see [.do/deploy.md](.do/deploy.md)

**Quick Start:**
1. Claim your [GitHub Student Developer Pack](https://education.github.com/pack)
2. Get $200 DigitalOcean credit (covers ~10 months)
3. Deploy using App Spec:
   ```bash
   # Update .do/app.yaml with your GitHub repo
   # Then upload to DigitalOcean App Platform
   ```
4. DigitalOcean automatically provisions:
   - Managed PostgreSQL database
   - FastAPI backend with Docker
   - SSL certificates
   - Auto-deployment from GitHub

**Cost:** ~$20/month (Database $15 + App Platform $5)

**Features:**
- ✅ No DNS issues (managed database)
- ✅ SSL connections included
- ✅ Automatic deployments from GitHub
- ✅ Built-in monitoring and logs
- ✅ Easy scaling

---

### Alternative: Backend Deployment on Render

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click on "New+" and select "Blueprint"
4. Connect your GitHub repository
5. Configure the Web Service:
   - Environment: Docker
   - Branch: main (or your preferred branch)
   - Set the following environment variables:
     - SECRET_KEY (generate a new secure key)
     - DATABASE_URL
     - CORS_ORIGINS (add your Vercel frontend URL)
6. Click "Create Blueprint" to deploy

Alternatively, you can manually deploy:
1. Click "New+" and select "Web Service"
2. Connect your GitHub repository
3. Select "Docker" as the environment
4. Configure the settings and environment variables
5. Deploy

### Frontend Deployment on Vercel

1. Push your frontend code to GitHub (make sure it has the vercel.json file)
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - Framework Preset: Create React App
   - Root Directory: frontend (if you're deploying from the main repository)
   - Environment Variables:
     - REACT_APP_API_URL (your Render backend URL)
6. Click "Deploy"

Once deployed:
- Backend API will be available at https://your-app-name.onrender.com
- Frontend will be available at https://your-app-name.vercel.app

## Security Best Practices

### Environment Variables
- Never commit `.env` files to version control
- Always use `.env.example` as a template for required environment variables
- Generate a strong, unique SECRET_KEY for production

### Database Security
- Use strong, unique passwords for database access
- Restrict database user permissions to only what is necessary
- Set up proper network security for database access

### Deployment Security
- Configure SSL/TLS for all production traffic
- Use secure headers in your FastAPI application
- Regularly update dependencies to patch security vulnerabilities

### Deployment on Render
1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Select "Docker" as the environment
4. Set up the required environment variables in the Render dashboard
5. Deploy your application

Remember to set these environment variables in your Render dashboard:
- SECRET_KEY (generate a new secure key for production)
- DATABASE_URL (use your production database connection string)
