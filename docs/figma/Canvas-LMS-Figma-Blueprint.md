# Go-Canvas -> Canvas-Style Figma Blueprint

This package is a **Figma-ready blueprint** (tokens, frame map, wireframes, and feature matrix).
I cannot generate a native `.fig` binary directly from this terminal, but you can import the provided SVG and tokens into Figma and build production-ready screens quickly.

## 1) What your project already has

Based on your repo, you already support a strong Canvas-like core:

- Student: dashboard, course details, assignments, assignment detail/submission, quiz taking, grades.
- Faculty: dashboard, course management, syllabus, assignment/quiz/announcement creation, gradebook, grading.
- Admin: dashboard, user management, course creation/assignment, student assignment, analytics.
- Platform features in backend: modules, discussions (with replies/pin/lock/grade), calendar events/sync, inbox/messages, pages, files/submissions, SpeedGrader-like endpoints.

Primary files checked:
- `apps/web/src/App.tsx`
- `apps/mobile/App.tsx`
- `alphagocanvas/api/endpoints/modules.py`
- `alphagocanvas/api/endpoints/discussions.py`
- `alphagocanvas/api/endpoints/calendar.py`
- `alphagocanvas/api/endpoints/messages.py`
- `alphagocanvas/api/endpoints/speedgrader.py`
- `alphagocanvas/api/endpoints/gradebook.py`
- `alphagocanvas/api/endpoints/pages.py`

## 2) Canvas LMS parity targets (UI + workflow)

Use these Canvas-style sections in your Figma left nav for course context:

- Home
- Modules
- Assignments
- Quizzes
- Discussions
- Grades
- Pages
- Announcements
- People
- Files
- Calendar
- Inbox

## 3) Figma file structure to create

Create one Figma file named: `Go-Canvas LMS (Canvas Style)`

### Page 00 - Cover
- `00.1 Cover` (1440 x 1024)
- `00.2 Sitemap` (1440 x 1600)

### Page 01 - Foundations
- `01.1 Colors`
- `01.2 Type`
- `01.3 Spacing + Radius`
- `01.4 Shadows + Borders`
- `01.5 Grid (Desktop + Tablet + Mobile)`

### Page 02 - Components
- `02.1 App Shell (Topbar + Left Nav)`
- `02.2 Cards`
- `02.3 Tables`
- `02.4 Form Controls`
- `02.5 Status/Banners/Toasts`
- `02.6 Discussion Thread Items`
- `02.7 Gradebook Cells`

### Page 03 - Student Web
- `03.1 Dashboard`
- `03.2 Course Home`
- `03.3 Modules`
- `03.4 Assignment List`
- `03.5 Assignment Detail + Submission`
- `03.6 Quiz Taking`
- `03.7 Discussions`
- `03.8 Grades`
- `03.9 Calendar`
- `03.10 Inbox`

### Page 04 - Faculty Web
- `04.1 Faculty Dashboard`
- `04.2 Course Home`
- `04.3 Assignment Builder`
- `04.4 Quiz Builder`
- `04.5 Discussion Management`
- `04.6 Gradebook`
- `04.7 SpeedGrader`
- `04.8 Pages Editor`

### Page 05 - Admin Web
- `05.1 Admin Dashboard`
- `05.2 User Management`
- `05.3 Course Assignment`
- `05.4 Student Enrollments`
- `05.5 Analytics`

### Page 06 - Mobile
- `06.1 Student Mobile Dashboard`
- `06.2 Course Detail`
- `06.3 Discussions`
- `06.4 Calendar`
- `06.5 Inbox`

## 4) Screen rules (for Canvas-like UX)

- Keep a persistent course nav on desktop (left rail).
- Use dense but readable data tables for Grades/People/Assignments.
- Use clear status chips: `Missing`, `Late`, `Submitted`, `Graded`, `Unpublished`.
- Treat Modules as the primary learning sequence (collapse/expand, publish state, prerequisites).
- SpeedGrader layout: student list pane + submission pane + grading pane.
- Inbox layout: conversation list pane + thread pane + composer pane.

## 5) Layout specs

- Desktop frame width: 1440.
- Content max width for dashboards: 1200.
- Nav width: 72 (icon rail) + 224 (expanded menu).
- Top bar height: 64.
- Main spacing scale: 4, 8, 12, 16, 24, 32.
- Card radius: 12.
- Table row height: 44.

## 6) How to use files in this folder

1. Import `go-canvas-wireframes.svg` into Figma (File -> Place image).
2. Use `design-tokens.tokens.json` in Tokens Studio (or map values manually).
3. Follow `canvas-feature-gap.md` to prioritize missing UI/functionality.
4. Use `hifi-student-course-modules-assignment-spec.md` for detailed build-ready specs.
5. Import `hifi-student-course-modules-assignment-wireframes.svg` for the first high-fidelity flow.

## 7) First build order (recommended)

1. Student app shell + Dashboard + Course Home + Modules.
2. Assignment detail/submission + Grades.
3. Faculty Gradebook + SpeedGrader.
4. Discussions + Inbox + Calendar.
5. Admin management screens.
