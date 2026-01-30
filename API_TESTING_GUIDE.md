# Go Canvas LMS - API Testing Guide

## 🚀 Quick Start

### Starting the Application

```bash
# Terminal 1 - Backend
cd /Users/nevilsmac/Downloads/Projects/Go_Canvas
uvicorn main:app --reload

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

**URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

---

## 📚 API Endpoints Reference

### Authentication

#### Sign Up
```bash
POST /signup
Content-Type: application/json

{
  "useremail": "student@test.com",
  "userpassword": "password123",
  "userrole": "Student",
  "userfirstname": "John",
  "userlastname": "Doe"
}
```

#### Login
```bash
POST /token
Content-Type: application/x-www-form-urlencoded

username=student@test.com&password=password123
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

---

### 📝 Assignment Endpoints

#### Get Published Assignments (Student)
```bash
GET /student/view_assignment_published?current_semester=SPRING24
Authorization: Bearer {token}
```

#### Submit Assignment
```bash
POST /submissions/
Authorization: Bearer {token}
Content-Type: multipart/form-data

assignmentid=1
submissioncontent=My answer here...
```

#### Get Student Submissions
```bash
GET /submissions/student/{student_id}
Authorization: Bearer {token}
```

---

### 🧠 Quiz Endpoints

#### Create Quiz (Faculty)
```bash
POST /quiz/create
Authorization: Bearer {faculty_token}
Content-Type: application/json

{
  "Quizname": "Python Basics",
  "Quizdescription": "Test your Python knowledge",
  "Courseid": 1,
  "questions": [
    {
      "Questiontext": "What is 2+2?",
      "Questiontype": "multiple_choice",
      "Questionpoints": 1,
      "Questionorder": 0,
      "options": [
        {"Optiontext": "3", "Iscorrect": false, "Optionorder": 0},
        {"Optiontext": "4", "Iscorrect": true, "Optionorder": 1},
        {"Optiontext": "5", "Iscorrect": false, "Optionorder": 2}
      ]
    }
  ]
}
```

#### Get Quiz Details (Student)
```bash
GET /quiz/{quiz_id}
Authorization: Bearer {student_token}
```

Response includes questions but hides correct answers.

#### Submit Quiz Attempt (Student)
```bash
POST /quiz/submit
Authorization: Bearer {student_token}
Content-Type: application/json

{
  "Quizid": 1,
  "answers": [
    {
      "Questionid": 1,
      "Selectedoptionid": 2
    },
    {
      "Questionid": 2,
      "Answertext": "Python Enhancement Proposal"
    }
  ]
}
```

Response:
```json
{
  "Attemptid": 1,
  "Quizid": 1,
  "Studentid": 5,
  "Attemptscore": 3,
  "Attemptmaxscore": 5,
  "Attemptgraded": true,
  "Attemptfeedback": null,
  "answers": [...]
}
```

#### Grade Quiz Manually (Faculty)
```bash
POST /quiz/grade
Authorization: Bearer {faculty_token}
Content-Type: application/json

{
  "Attemptid": 1,
  "answers": [
    {
      "Answerid": 3,
      "Pointsearned": 2,
      "Feedback": "Good answer!"
    }
  ],
  "Attemptfeedback": "Well done overall!"
}
```

#### Get Student's Quiz Attempts
```bash
GET /quiz/student/{quiz_id}/attempts
Authorization: Bearer {student_token}
```

#### Get All Attempts for Grading (Faculty)
```bash
GET /quiz/faculty/{quiz_id}/attempts
Authorization: Bearer {faculty_token}
```

---

### 📊 Grades Endpoints

#### View Grades (Student)
```bash
GET /student/view_grades
Authorization: Bearer {token}
```

#### View Quizzes (Student)
```bash
GET /student/view_quizzes_published?current_semester=SPRING24
Authorization: Bearer {token}
```

---

### 📁 File Upload

#### Upload File
```bash
POST /files/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file=@/path/to/file.pdf
courseid=1
uploader_id=5
uploader_role=Student
```

---

## 🧪 Testing Workflows

### Test Assignment Submission

1. **Login as Student**
   ```bash
   curl -X POST http://localhost:8000/token \
     -d "username=student@test.com&password=password123"
   ```

2. **Get Assignments**
   ```bash
   curl http://localhost:8000/student/view_assignment_published?current_semester=SPRING24 \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Submit Assignment**
   ```bash
   curl -X POST http://localhost:8000/submissions/ \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "assignmentid=1" \
     -F "submissioncontent=My submission text"
   ```

### Test Quiz System

1. **Seed Sample Quiz**
   ```bash
   python seed_sample_quiz.py
   ```

2. **Get Quiz Details**
   ```bash
   curl http://localhost:8000/quiz/1 \
     -H "Authorization: Bearer STUDENT_TOKEN"
   ```

3. **Take Quiz**
   - Navigate to http://localhost:3000
   - Login as student
   - Go to course page
   - Click on quiz
   - Answer questions
   - Submit

4. **Check Results**
   ```bash
   curl http://localhost:8000/quiz/student/1/attempts \
     -H "Authorization: Bearer STUDENT_TOKEN"
   ```

---

## 🎯 Frontend Routes

### Student Routes
- `/dashboard` - Student dashboard
- `/student/assignments` - All assignments
- `/student/assignment/:id` - Assignment detail & submission
- `/student/quiz/:id` - Take quiz
- `/student/grades` - View grades
- `/course/:id` - Course details
- `/account` - Account settings

### Faculty Routes
- `/faculty_dashboard` - Faculty dashboard
- `/faculty_course/:id` - Course management
- `/faculty_assignment` - Create assignment
- `/faculty_quiz` - Create quiz
- `/faculty_grades` - Grade assignments

### Admin Routes
- `/admin_dashboard` - Admin dashboard
- `/admin_students` - Manage students
- `/assign_course` - Assign courses

---

## 🔑 Sample Test Data

### Create Test Student
```bash
curl -X POST http://localhost:8000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "useremail": "test.student@example.com",
    "userpassword": "student123",
    "userrole": "Student",
    "userfirstname": "Test",
    "userlastname": "Student"
  }'
```

### Create Test Faculty
```bash
curl -X POST http://localhost:8000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "useremail": "test.faculty@example.com",
    "userpassword": "faculty123",
    "userrole": "Faculty",
    "userfirstname": "Test",
    "userlastname": "Faculty"
  }'
```

---

## 🐛 Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
lsof -ti:8000 | xargs kill -9
uvicorn main:app --reload
```

**Database connection error:**
- Check `.env` file for correct `DATABASE_URL`
- Ensure DigitalOcean database is accessible
- Run `python scripts/init_database.py` if tables missing

### Frontend Issues

**Port 3000 already in use:**
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

**Module not found errors:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📈 Feature Status

✅ **Completed Features:**
- Student assignment submission (text + files)
- Quiz system (all question types)
- Auto-grading for MC/TF questions
- Manual grading for essay/short answer
- Enhanced grades view
- Progress tracking
- Status badges

⏳ **Optional Enhancements:**
- Visual quiz builder (use API for now)
- Module content viewer
- Discussion forums
- Real-time notifications

---

## 📞 Quick Reference

**Run migrations:**
```bash
python scripts/init_database.py
```

**Seed sample quiz:**
```bash
python seed_sample_quiz.py
```

**Check API docs:**
- Open http://localhost:8000/docs

**Frontend dev:**
```bash
cd frontend && npm run dev
```

**Backend dev:**
```bash
uvicorn main:app --reload
```

---

*Last Updated: January 2026*
