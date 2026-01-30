# 🎓 SJSU MSSE Canvas LMS - Complete Testing Guide

## ✅ Data Successfully Seeded!

Your Canvas LMS is now populated with realistic SJSU Master of Science in Software Engineering data.

---

## 📊 What's Been Created

### Users (11 total)
- **1 Admin**
- **4 Faculty Members**
- **6 Students**

### Courses (6 total)
1. **CMPE 272**: Enterprise Software Platforms
2. **CMPE 275**: Enterprise Application Development
3. **CMPE 255**: Data Mining
4. **CMPE 202**: Software Systems Engineering
5. **CM PE 295A**: Master's Project I
6. **CMPE 273**: Enterprise Distributed Systems

### Assignments (9 total)
- Microservices Architecture Design
- Docker Containerization Lab
- Cloud Deployment Project
- RESTful API Development
- Database Design and ORM
- Classification Algorithms
- Clustering Analysis
- Design Patterns Implementation
- Test-Driven Development

### Quizzes (4 total)
- Microservices Fundamentals Quiz
- REST API Design Quiz
- Data Mining Concepts Quiz
- Design Patterns Quiz

### Additional Data
- **18** Student Submissions (some graded, some pending)
- **6** Quiz Attempts with scores
- **4** Course Announcements
- **24** Student Enrollments

---

## 🔑 Test Credentials

### Admin Account
```
Email: admin@sjsu.edu
Password: admin123
```

### Faculty Accounts
```
Email: ben.reed@sjsu.edu
Password: faculty123
Role: Enterprise Software instructor

Email: thomas.austin@sjsu.edu
Password: faculty123
Role: Enterprise App Dev instructor

Email: robert.chun@sjsu.edu
Password: faculty123
Role: Data Mining instructor

Email: william.andreopoulos@sjsu.edu
Password: faculty123
Role: Software Systems instructor
```

### Student Accounts
```
Email: john.smith@sjsu.edu
Password: student123
Enrolled: 4 courses, grades 70-95%

Email: sarah.johnson@sjsu.edu
Password: student123
Enrolled: 4 courses, grades 70-95%

Email: michael.chen@sjsu.edu
Password: student123
Enrolled: 4 courses, grades 70-95%

Email: emily.davis@sjsu.edu
Password: student123
Enrolled: 4 courses, grades 70-95%

Email: david.martinez@sjsu.edu
Password: student123
Enrolled: 4 courses, grades 70-95%

Email: jessica.wang@sjsu.edu
Password: student123
Enrolled: 4 courses, grades 70-95%
```

---

## 🧪 Complete Workflow Testing

### Test 1: Student Dashboard & Courses  ✅

**Login:**
- Go to http://localhost:3000
- Login as: `john.smith@sjsu.edu` / `student123`

**Expected:**
- Dashboard shows 4 enrolled courses
- Courses: CMPE 272, 275, 255, 202
- Each course card clickable

**Test:**
1. Click on **CMPE 272: Enterprise Software Platforms**
2. See course details with tabs
3. View Announcements, Assignments, Quizzes

---

### Test 2: Assignment Submission ✅

**Steps:**
1. Still logged in as John Smith
2. Click **"Assignments"** in sidebar
3. See list of 9 assignments across courses
4. Filter by course (try "CMPE 272")
5. See assignments specific to that course

**Test Assignment Submission:**
1. Click **"Microservices Architecture Design"**
2. See assignment detail page
3. See submission form
4. Enter text: "My microservices design uses API Gateway pattern..."
5. Click **"Submit Assignment"**
6. See success message
7. Go back to assignments list
8. See status changed to "Submitted"

**Test Already Submitted:**
1. Click **"Docker Containerization Lab"**
2. See previous submission (created by seed script)
3. See graded status if graded
4. Can resubmit if not graded

---

### Test 3: Quiz Taking ✅

**Steps:**
1. From dashboard, click **CMPE 272** course
2. Expand **"Quizzes"** accordion
3. Click **"Microservices Fundamentals Quiz"**

**Take Quiz:**
1. See quiz interface with progress bar
2. Question 1: Multiple choice - "What is the main benefit of microservices..."
   - Select **"Independent scaling and deployment"**
3. Question 2: True/False - "Docker containers share the host OS kernel"
   - Select **"True"**
4. Click **"Submit Quiz"**
5. See instant results: "2/3 points" or similar
6. See green checkmark for correct answers

**View Previous Attempt:**
1. NavigateOMPE 275 course
2. Click "REST API Design Quiz"
3. If already attempted (from seed), see score

---

### Test 4: Grades Dashboard ✅

**Steps:**
1. Click **"Grades"** in sidebar
2. See comprehensive grades page

**Verify:**
- **GPA displayed** (calculated from 70-95% grades)
- **4 stat cards:** Overall GPA, Courses, Assignments, Average
- **Course list** with letter grades (A, B, C)
- **Progress bars** showing assignment completion
- **Assignment breakdown** per course
- **Color-coded grades:**
  - Green for A (90+)
  - Blue for B (80-89)
  - Yellow for C (70-79)

**Test Semester Filter:**
1. Click semester dropdown
2. Select "SPRING26"
3. See filtered results

---

### Test 5: Course Detail View ✅

**Steps:**
1. Go to dashboard
2. Click **CMPE 255: Data Mining**

**Verify Tabs:**
- **Announcements:** See "Data Mining Tools Setup" announcement
- **Quizzes:** See "Data Mining Concepts Quiz"
- **Assignments:** See "Classification Algorithms", "Clustering Analysis"
- **Grades:** See current grade for this course

**Interact:**
1. Click assignment row → Goes to assignment detail
2. Click quiz row → Goes to quiz taking page

---

### Test 6: Faculty View (Grading) 🎯

**Login:**
- Logout from student account
- Login as: `ben.reed@sjsu.edu` / `faculty123`

**Expected:**
- Faculty dashboard (different from student)
- Can see enrolled courses where they teach

**Grade Submissions:**
1. Navigate to speedgrader or faculty tools
2. View student submissions
3. Provide grades and feedback

_(Note: Faculty UI may be simpler - focus is on student features)_

---

### Test 7: Multiple Students Workflow ✅

**Test Different Student Accounts:**

1. **Sarah Johnson** (`sarah.johnson@sjsu.edu`)
   - Login
   - See her grades (different from John)
   - Take a quiz she hasn't attempted
   - Submit an assignment

2. **Michael Chen** (`michael.chen@sjsu.edu`)
   - Login
   - View his specific enrollment
   - Check grades dashboard
   - Verify data is per-student

---

## 🎯 Features to Validate

### Assignment System
- ✅ List all assignments
- ✅ Filter by course
- ✅ Filter by status (Not Submitted, Submitted, Graded)
- ✅ Click to view details
- ✅ Submit text content
- ✅ Upload files (optional)
- ✅ View submission status badge
- ✅ See grades when graded
- ✅ See faculty feedback
- ✅ Resubmit before grading

### Quiz System
- ✅ View quiz list in course
- ✅ Click to take quiz
- ✅ See progress bar
- ✅ Answer multiple choice questions
- ✅ Answer true/false questions
- ✅ Answer short answer/essay questions
- ✅ Submit quiz
- ✅ See instant results (MC/TF auto-graded)
- ✅ See "awaiting grading" for essays
- ✅ View previous attempts
- ✅ See detailed scoring

### Grades Dashboard
- ✅ Calculate GPA (4.0 scale)
- ✅ Show stat cards
- ✅ List all course grades
- ✅ Letter grade display
- ✅ Color coding
- ✅ Progress bars
- ✅ Assignment breakdown per course
- ✅ Filter by semester
- ✅ Show completion percentage

### Navigation
- ✅ Sidebar with Dashboard, Assignments, Grades, Account
- ✅ Clickable course cards
- ✅ Clickable assignment rows
- ✅ Clickable quiz rows
- ✅ Breadcrumb navigation
- ✅ Back buttons

### Data Integrity
- ✅ Each student sees only their data
- ✅ Grades are student-specific
- ✅ Submissions tracked per student
- ✅ Quiz attempts recorded correctly
- ✅ Enrollments respected

---

## 📱 UI/UX Testing

### Visual Elements
- ✅ Status badges (color-coded)
- ✅ Progress bars
- ✅ Cards with shadows
- ✅ Responsive layout
- ✅ Icons (assignments, quizzes, grades)
- ✅ Hover effects
- ✅ Loading states

### Interactions
- ✅ Form submissions
- ✅ Dropdown filters
- ✅ Accordions (expand/collapse)
- ✅ Radio buttons (quiz questions)
- ✅ Text areas (essay answers)
- ✅ File uploads
- ✅ Clickable rows/cards

---

## 🔍 Advanced Testing

### Edge Cases

1. **No Submissions Test:**
   - Login as new student
   - See "Not Submitted" status
   - Submit first assignment
   - Verify status change

2. **Multiple Quiz Attempts:**
   - Take same quiz twice
   - Compare scores
   - See attempt history

3. **Grade Calculation:**
   - Check GPA calculation matches grades
   - Verify percentage to letter grade conversion:
     - 90-100% = A (4.0)
     - 80-89% = B (3.0)
     - 70-79% = C (2.0)

4. **Filter Testing:**
   - Assignment filter by course
   - Assignment filter by status
   - Grade filter by semester
   - Verify results update

---

## 📊 Expected Data Per Student

### John Smith (john.smith@sjsu.edu)
- **Courses:** 4 (CMPE 272, 275, 255, 202)
- **Assignments Available:** 9
- **Assignments Submitted:** 3 (from seed)
- **Quizzes Available:** 4
- **Quiz Attempts:** 1 (from seed)
- **Grade Range:** 70-95%

### All Students
- Each enrolled in 4 courses
- Grades range from 70% to 95%
- Some have submissions (first 3 students)
- Some have quiz attempts (first 3 students)

---

## 🎬 Quick Test Script

### 5-Minute Smoke Test:
```
1. Login: john.smith@sjsu.edu / student123
2. Dashboard → Click CMPE 272
3. See announcements, assignments, quizzes
4. Sidebar → Click Assignments
5. Filter by "CMPE 272"
6. Click "Microservices Architecture Design"
7. Submit: "Test submission"
8. Sidebar → Click Grades
9. See GPA, courses, assignment breakdown
10. Click course → Take quiz
11. Answer questions → Submit
12. See instant results ✅
```

### 15-Minute Full Test:
```
1-5. Same as smoke test
6. Test all assignment filters
7. Submit assignment with file upload
8. Take all 4 quizzes
9. Check grades dashboard thoroughly
10. Test semester filter
11. Navigate between courses
12. View announcements per course
13. Check submission status changes
14. Logout and login as different student
15. Verify different data ✅
```

---

## 🐛 Troubleshooting

### Issue: Can't see courses
**Solution:** Make sure you're logged in as a student account with enrollments

### Issue: No assignments showing
**Solution:** Click "Assignments" in sidebar, not from course page

### Issue: Quiz submission fails
**Solution:** Answer ALL questions before submitting

### Issue: Grades not showing
**Solution:** Grades are only shown after faculty grades the submission

### Issue: Can't filter assignments
**Solution:** Make sure there are assignments for that filter criteria

---

## 🎓 SJSU MSSE Course Details

### CMPE 272: Enterprise Software Platforms
- **Instructor:** Dr. Ben Reed
- **Assignments:** 3 (Microservices Design, Docker Lab, Cloud Deployment)
- **Quiz:** Microservices Fundamentals
- **Focus:** Distributed systems, containers, cloud

### CMPE 275: Enterprise Application Development
- **Instructor:** Dr. Thomas Austin
- **Assignments:** 2 (RESTful API, Database Design)
- **Quiz:** REST API Design
- **Focus:** Enterprise apps, APIs, databases

### CMPE 255: Data Mining
- **Instructor:** Dr. Robert Chun
- **Assignments:** 2 (Classification, Clustering)
- **Quiz:** Data Mining Concepts
- **Focus:** Machine learning algorithms

### CMPE 202: Software Systems Engineering
- **Instructor:** Dr. William Andreopoulos
- **Assignments:** 2 (Design Patterns, TDD)
- **Quiz:** Design Patterns
- **Focus:** Software engineering practices

---

## ✅ Success Criteria

Your LMS is working correctly if:

1. ✅ Students can login and see their specific data
2. ✅ Dashboard displays enrolled courses
3. ✅ Assignments can be submitted and tracked
4. ✅ Quizzes can be taken with instant auto-grading
5. ✅ Grades dashboard shows GPA and breakdowns
6. ✅ Navigation works smoothly
7. ✅ Filters update results correctly
8. ✅ Status badges reflect current state
9. ✅ Each student has isolated data
10. ✅ UI is responsive and polished

---

## 🚀 Next Steps

1. **Test Everything:** Follow the test scripts above
2. **Faculty Features:** Login as faculty to test grading
3. **Admin Panel:** Login as admin to manage system
4. **Custom Data:** Add your own courses, assignments, quizzes
5. **Deploy:** Ready for production when testing pass

---

## 📞 Quick Reference

**Frontend:** http://localhost:3000  
**Backend:** http://localhost:8000  
**API Docs:** http://localhost:8000/docs

**Test Student:** john.smith@sjsu.edu / student123  
**Test Faculty:** ben.reed@sjsu.edu / faculty123  
**Test Admin:** admin@sjsu.edu / admin123

**Seed Command:** `python seed_sjsu_msse_data.py`

---

*Ready to test your complete SJSU MSSE Canvas LMS!* 🎉
