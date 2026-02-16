# Canvas Feature Gap Matrix for Go-Canvas

This maps current Go-Canvas coverage to Canvas-style experience targets.

## Legend
- `Implemented`: backend + at least one UI present.
- `Partial`: backend exists but web UI is incomplete or lighter than Canvas.
- `Missing`: not found in current web flow.

| Area | Go-Canvas status | Evidence in repo | Canvas-style parity target |
|---|---|---|---|
| Authentication, roles | Implemented | `apps/web/src/App.tsx`, `alphagocanvas/api/endpoints/authentication.py` | Keep role-based entry + polished onboarding |
| Student dashboard & course cards | Implemented | `apps/web/src/pages/student/dashboard.tsx` | Add to-do/feed widgets, course nicknames/colors |
| Course home summary | Implemented | `apps/web/src/pages/student/course.tsx` | Add syllabus snapshots, upcoming deadlines, module progress |
| Assignments list/detail/submission | Implemented | `apps/web/src/pages/student/assignments.tsx`, `assignment-detail.tsx`, `alphagocanvas/api/endpoints/files.py` | Add rubrics, richer submission history, late/missing policies |
| Quizzes (take + submit) | Implemented | `take-quiz.tsx`, `alphagocanvas/api/endpoints/quiz.py` | Add timer behavior, question flags, moderation views |
| Gradebook (faculty) | Implemented | `apps/web/src/pages/faculty/facultygradebook.tsx`, `alphagocanvas/api/endpoints/gradebook.py` | Add filters/sort presets, column policies, export actions |
| SpeedGrader-style grading | Partial | `alphagocanvas/api/endpoints/speedgrader.py` (API exists) | Build dedicated web UI with submission preview + comments pane |
| Discussions | Partial | `alphagocanvas/api/endpoints/discussions.py`; mobile UI in `apps/mobile/src/screens/DiscussionsScreen.tsx` | Build full web discussion UI with threading and moderation controls |
| Modules | Partial | `alphagocanvas/api/endpoints/modules.py` | Build drag/reorder module UI and student module progression page |
| Calendar | Partial | `alphagocanvas/api/endpoints/calendar.py`; mobile UI in `CalendarScreen.tsx` | Build month/week web calendar + agenda and event detail drawers |
| Inbox / messaging | Partial | `alphagocanvas/api/endpoints/messages.py`; mobile UI in `MessagesScreen.tsx` | Build web split-pane inbox with compose/search/filters |
| Pages (course wiki/pages) | Partial | `alphagocanvas/api/endpoints/pages.py` | Build pages list + rich editor + version history UI |
| Announcements | Implemented | `apps/web/src/pages/faculty/faculyannouncement.tsx` | Add audience targeting, schedule, pin controls |
| Admin users/courses/assignments | Implemented | `apps/web/src/pages/admin/*.tsx`, `alphagocanvas/api/endpoints/admin.py` | Add bulk actions, audit trails, better analytics visuals |

## Priority roadmap for frontend parity

1. Build web **Modules** screen and make it the default course learning flow.
2. Build web **Discussions** screen (thread view + reply composer + grading badges).
3. Build web **Inbox** screen (conversation list + thread + composer).
4. Build web **Calendar** screen with synced assignment/quiz events.
5. Build web **SpeedGrader** page for faculty grading workflow.
6. Build web **Pages** editor/list to support rich course content.

## Canvas references used (official docs + release notes)

- Canvas Student Guide (dashboard, courses, assignments, quizzes, discussions, calendar, inbox):
  - https://community.canvaslms.com/t5/Student-Guide/ct-p/student
- Canvas Instructor Guide (gradebook, SpeedGrader, modules, discussions, pages, course setup):
  - https://community.canvaslms.com/t5/Instructor-Guide/ct-p/instructor
- Canvas release notes pages reviewed:
  - January 17, 2026: https://community.canvaslms.com/t5/Canvas-Releases-January-17/gh-p/640366
  - February 21, 2026: https://community.canvaslms.com/t5/Canvas-Releases-February-21/gh-p/663348

As of **February 16, 2026**, the February 21 release notes are listed but the date is still upcoming.
