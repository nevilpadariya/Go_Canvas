# High-Fidelity Flow Spec

Flow: Student Course Home -> Modules -> Assignment Detail

Related implementation paths:
- `/Users/nevilsmac/Downloads/Projects/Go_Canvas/apps/web/src/pages/student/course.tsx`
- `/Users/nevilsmac/Downloads/Projects/Go_Canvas/apps/web/src/pages/student/assignments.tsx`
- `/Users/nevilsmac/Downloads/Projects/Go_Canvas/apps/web/src/pages/student/assignment-detail.tsx`
- `/Users/nevilsmac/Downloads/Projects/Go_Canvas/apps/web/src/components/SubmissionForm.tsx`
- `/Users/nevilsmac/Downloads/Projects/Go_Canvas/alphagocanvas/api/endpoints/modules.py`

## 1) Figma page and frame naming

Create a Figma page:
- `07.1 HiFi - Student Course + Modules + Assignment`

Create these desktop frames (1440 x 1024):
1. `S01 Course Home Default`
2. `S02 Course Home Loading`
3. `S03 Modules Expanded`
4. `S04 Modules Locked State`
5. `S05 Assignment Detail - Not Submitted`
6. `S06 Assignment Detail - Submitting`
7. `S07 Assignment Detail - Submitted Awaiting Grade`
8. `S08 Assignment Detail - Graded`
9. `S09 Error State`

Create these mobile frames (390 x 844):
1. `M01 Course Overview`
2. `M02 Modules`
3. `M03 Assignment Detail`
4. `M04 Submission Success`

## 2) App shell spec

Desktop shell:
- Top bar: 64h, sticky.
- Icon rail: 72w.
- Course nav: 224w.
- Main content: 1144w container with 32px page padding.

Course nav order:
- Home
- Modules
- Assignments
- Quizzes
- Discussions
- Grades
- Pages
- Calendar
- Inbox

Active state:
- Background: brand 500
- Text: inverse

Inactive state:
- Text: secondary
- Hover: surface elevated

## 3) Tokens to use (from tokens file)

Source:
- `/Users/nevilsmac/Downloads/Projects/Go_Canvas/docs/figma/design-tokens.tokens.json`

Apply:
- Surface/background: `color.surface.background`
- Cards: `color.surface.card`
- Borders: `color.border.subtle`
- Primary action: `color.brand.500`
- Success: `color.state.success`
- Warning: `color.state.warning`
- Danger: `color.state.danger`
- Body font: `font.family.body`
- Main radius: `radius.lg`

## 4) Screen content and states

## `S01 Course Home Default`

Header section:
- H1: `Course Details`
- Subtitle: dynamic `Coursename`
- Course card with:
  - `Coursename`
  - `Coursedescription`
  - Semester chip

Accordion blocks:
- Announcements table
- Quizzes table
- Assignments table
- Grades table

Right rail (new Canvas-like widget):
- `To-Do` card with 3 upcoming items
- `Upcoming` card with date chips

## `S02 Course Home Loading`

- Same shell as S01.
- Replace tables/cards with skeleton rows.
- Use 3 skeleton cards + 6 skeleton rows.

## `S03 Modules Expanded`

Main area:
- Module group card per week/unit
- Group header fields:
  - Modulename
  - Moduledescription
  - Published badge
  - Completion count

Module item row fields:
- Itemtype icon (assignment/quiz/page/file/link/header)
- Itemname
- Meta: unlock date or prerequisite summary
- Status chip:
  - `Available`
  - `Locked`
  - `Completed`

CTA behavior:
- Assignment item click -> `S05`
- Locked item click -> inline tooltip (no navigation)

## `S04 Modules Locked State`

- Same as S03, but show mixed lock states.
- Lock reason variants:
  - `Unlocks on <date>`
  - `Complete <item name> first`
- Disabled style:
  - 55% opacity
  - no hover elevation

## `S05 Assignment Detail - Not Submitted`

Top:
- Back button: `Back to Assignments`
- Title with assignment icon
- Course name metadata

Body:
- Description panel
- Submission panel:
  - Textarea
  - File upload drop zone
  - Submit button
- Required validation callout if both text and file empty.

## `S06 Assignment Detail - Submitting`

- Submit button in loading state with spinner label: `Submitting...`
- File upload disabled
- Form inputs disabled

## `S07 Assignment Detail - Submitted Awaiting Grade`

- Blue info alert:
  - Submitted datetime
  - Copy: `Your submission is awaiting grading. You can resubmit to update your work.`
- Show submitted file card preview.
- Keep form visible for resubmission.

## `S08 Assignment Detail - Graded`

- Green graded badge in header.
- Grade panel:
  - Score
  - Feedback block
  - Graded timestamp
- Submission form still visible (resubmission policy decision pending; design with disabled default and a `Resubmit` secondary button).

## `S09 Error State`

Two variants:
1. Assignment missing.
2. API/network failure.

UI:
- Destructive alert panel.
- Primary button: `Back to Assignments`.
- Secondary button: `Retry`.

## 5) API binding map for prototype notes

Course home:
- GET `/student/view_contents`
- GET `/student/view_assignment_published?current_semester=<SEM>`
- GET `/student/view_quizzes_published?current_semester=<SEM>`
- GET `/student/view_announcements_published?current_semester=<SEM>`
- GET `/student/view_grades`

Modules:
- GET `/modules/course/{courseid}`

Assignment detail/submission:
- GET `/student/view_assignment_published?current_semester=<SEM>`
- GET `/submissions/student/{studentId}`
- POST `/submissions/` (multipart)

## 6) Component inventory (build as Figma components)

- `Shell/Topbar`
- `Shell/CourseNav Item` (default/hover/active)
- `Card/Course Summary`
- `Card/Module`
- `Row/Module Item` (available/locked/completed)
- `Table/Content Row`
- `Badge/Status` (graded/submitted/missing/late/locked)
- `Alert/Info`
- `Alert/Success`
- `Alert/Error`
- `Form/File Upload`
- `Form/Submission Textarea`
- `Button/Primary`
- `Button/Secondary`
- `Button/Ghost`
- `Skeleton/Card`
- `Skeleton/Row`

## 7) Prototype link plan in Figma

Set click interactions:
- S01 `Modules` nav -> S03
- S03 unlocked assignment row -> S05
- S03 locked row -> open tooltip overlay on same frame
- S05 submit -> S06 (after delay 800ms -> S07)
- S07 mock faculty grading action (hotspot) -> S08
- Any network error icon/button -> S09
- S09 retry -> previous frame

Animation:
- Use `Smart Animate` 200ms ease-out for nav and state changes.
- Use `Dissolve` 150ms for alerts.

## 8) Accessibility and QA notes

- Minimum tap targets: 40x40 desktop, 44x44 mobile.
- Contrast for body text >= 4.5:1.
- Keyboard tab order: nav -> content filters -> primary action.
- Focus ring token: brand 500, 2px.
- Error copy must be actionable and short.

## 9) Delivery checklist for your frontend build

- [ ] Build modules page route and map to `/modules/course/{courseid}`.
- [ ] Add module locked/available/completed chips.
- [ ] Keep assignment submission UX aligned with existing `SubmissionForm` behavior.
- [ ] Add loading and error states for all student course data requests.
- [ ] Add responsive breakpoints for 1440, 1024, 768, 390.
