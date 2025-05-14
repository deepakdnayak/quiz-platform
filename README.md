# 📚 Quiz Platform Documentation

Welcome to the **Quiz Platform**, a modern web application designed to facilitate quiz creation, participation, and result tracking for students and instructors. Built with **Next.js**, **React**, **TypeScript**, and **Tailwind CSS**, this project integrates with a Node.js/MongoDB backend to deliver a seamless user experience. The frontend features a Dribbble-inspired UI with blue (`#2563EB`) buttons and a clean card-based layout, ensuring both functionality and aesthetics.

This document outlines the project's purpose, frontend pages, user dashboards, user types, permissions, and implementation details. Let's dive in! 🚀

## 🎯 Project Purpose

The Quiz Platform enables educational institutions to manage quizzes efficiently. Key objectives include:

- **For Students**: Participate in active quizzes, submit answers, and view results.
- **For Instructors**: Create quizzes, assign them to specific year groups, and track student performance.
- **For All Users**: Secure authentication, role-based access, and a responsive UI.

The platform supports multiple-choice quizzes with single or multiple correct answers, real-time validation, and detailed result reporting. It integrates with a backend API (`http://localhost:5000/api`) for quiz management, user authentication, and data persistence.

## 🖥️ Available Pages

The frontend, located in `src/app`, consists of the following pages, each serving a specific purpose:

| Page Path | Description | Key Features |
|-----------|-------------|--------------|
| `/auth/login` | **Login Page** | User authentication with JWT token storage in `localStorage`. Redirects to respective dashboards based on user role (Student/Instructor). |
| `/dashboard/student` | **Student Dashboard** | Displays active, upcoming, and completed quizzes. Includes average score, "Start Quiz" buttons for active quizzes, and "View Results" for completed ones. |
| `/dashboard/instructor` | **Instructor Dashboard** | Allows quiz creation and management. Lists created quizzes with options to view/edit. (Assumed based on typical requirements; implementation pending.) |
| `/quiz/[id]` | **Attempt Quiz Page** | Enables students to answer quiz questions using checkboxes for multiple selections. Includes validation, submission confirmation, and time-based access checks. |
| `/quiz/[id]/results` | **Quiz Results Page** | Shows quiz results with a table of questions, selected answers, correct answers, and scores. Displays total score and navigates back to the dashboard. |

### Page Implementation Details
- **Tech Stack**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Radix UI components (`Button`, `Card`, `Checkbox`, `AlertDialog`), `react-hook-form`, `axios`, `sonner` for toasts.
- **UI**: Consistent card-based layout with blue (`#2563EB`) buttons, responsive design, and error handling (e.g., loading states, not found messages).
- **API Integration**: Uses `src/lib/api.ts` for HTTP requests to backend endpoints (`/quizzes`, `/students/dashboard`, `/quizzes/:id/attempt`, `/quizzes/:id/results`).
- **State Management**: React hooks (`useState`, `useEffect`) and `react-hook-form` for form handling.
- **Routing**: Dynamic routes (`[id]`) for quiz-specific pages, protected by token-based authentication.

## 👥 User Types and Dashboards

The platform supports two primary user types: **Students** and **Instructors**, each with tailored dashboards.

### User Types

| User Type | Description | Dashboard Path | Key Actions |
|-----------|-------------|----------------|-------------|
| **Student** | Learners who participate in quizzes. | `/dashboard/student` | View active/upcoming/completed quizzes, start quizzes, submit answers, view results. |
| **Instructor** | Educators who create and manage quizzes. | `/dashboard/instructor` | Create quizzes, assign to year groups, view student results. (Assumed; partial implementation.) |

### Dashboard Implementation

#### Student Dashboard (`/dashboard/student`)
- **Purpose**: Central hub for students to manage quiz participation.
- **Features**:
  - **Active Quizzes**: Displays quizzes where `startTime <= now <= endTime`. Includes "Start Quiz" button linking to `/quiz/[id]`.
  - **Upcoming Quizzes**: Shows quizzes with `startTime > now`, with start/end times.
  - **Completed Quizzes**: Lists quizzes with `isScored: true`, showing scores and "View Results" linking to `/quiz/[id]/results`.
  - **Average Score**: Calculated from completed quiz scores.
- **API**: Integrates with `GET /api/students/dashboard` to fetch quiz data.
- **UI**: Card-based sections with blue buttons, responsive layout, and empty state messages (e.g., "No active quizzes").

#### Instructor Dashboard (`/dashboard/instructor`)
- **Purpose**: (Assumed) Allows instructors to create and manage quizzes.
- **Features** (based on typical requirements):
  - Quiz creation form with fields for title, description, year of study, timing, and questions.
  - List of created quizzes with edit/view options.
  - (Pending full implementation; assumed to use `POST /api/quizzes`).
- **API**: (Assumed) Integrates with `/quizzes` endpoints for quiz management.
- **UI**: (Assumed) Similar card-based layout with blue buttons.

### Implementation Notes
- **Authentication**: Both dashboards require a JWT token in `localStorage`. Missing tokens redirect to `/auth/login`.
- **Role-Based Access**: Backend middleware (assumed) checks `req.user.role` to restrict access (e.g., `Student` for `/students/dashboard`).
- **Dynamic Data**: Uses `axios` to fetch data from backend APIs, with error handling via `sonner` toasts.
- **Type Safety**: `src/lib/types.ts` defines `StudentDashboard`, `QuizDetails`, `QuizAttempt`, and `QuizResults` interfaces for type-safe data handling.

## 🔒 User Permissions

Permissions are enforced via backend middleware (assumed) and frontend routing logic. The table below summarizes permissions for each user type.

| Action | Student | Instructor | Notes |
|--------|---------|------------|-------|
| **Login** | ✅ | ✅ | Requires valid credentials; stores JWT token. |
| **Access Student Dashboard** | ✅ | ❌ | Restricted to `Student` role; redirects instructors. |
| **Access Instructor Dashboard** | ❌ | ✅ | Restricted to `Instructor` role; redirects students. |
| **View Active Quizzes** | ✅ | ❌ | Students see quizzes matching their `yearOfStudy` and current time. |
| **Start Quiz** | ✅ | ❌ | Students can access `/quiz/[id]` if quiz is active (`startTime <= now <= endTime`). |
| **Submit Quiz Answers** | ✅ | ❌ | Students submit via `POST /api/quizzes/:id/attempt`. |
| **View Quiz Results** | ✅ | ❌ | Students access `/quiz/[id]/results` for completed quizzes. |
| **Create Quiz** | ❌ | ✅ | Instructors use (assumed) `/dashboard/instructor` form. |
| **Edit/Delete Quiz** | ❌ | ✅ | Instructors manage quizzes via (assumed) API endpoints. |
| **View Student Results** | ❌ | ✅ | Instructors access (assumed) analytics or results endpoints. |

### Permission Implementation
- **Backend**: 
  - Middleware (assumed in `routes/students.js`, `routes/quizzes.js`) checks `req.user.role` and `req.user.id`.
  - Example: `GET /api/students/dashboard` restricts to `Student` role, verifies `Profile` exists.
  - `Quiz` model filters by `yearOfStudy` for students, ensuring relevant quiz access.
- **Frontend**:
  - Token check in `useEffect` redirects to `/auth/login` if `localStorage.getItem('token')` is missing.
  - API errors (e.g., 401, 403) trigger toasts and redirects (e.g., to `/auth/login` or `/dashboard/student`).
- **Security**:
  - JWT tokens are included in API requests via `axios` interceptor (`src/lib/api.ts`).
  - Time-based quiz access (`startTime`, `endTime`) prevents premature or late submissions.

## 🚀 Key Features and Highlights

- **Responsive UI**: Card-based layout with Tailwind CSS, blue `#2563EB` buttons, and Radix UI components for accessibility.
- **Multiple Answer Support**: Checkboxes (`@radix-ui/react-checkbox`) allow multiple selections, with validation for at least one answer per question.
- **Real-Time Validation**: `react-hook-form` ensures all questions are answered before submission, with clear error messages.
- **Error Handling**: Robust handling for API errors (404, 401, 403), missing tokens, and invalid quiz states (e.g., not started, ended).
- **Type Safety**: TypeScript with `src/lib/types.ts` ensures consistent data structures across frontend and backend.
- **Debugging**: Console logs (`Token`, `Quiz Details API Response`, `Form Data`, `Student Dashboard API Response`) aid troubleshooting.

## 🛠️ Implementation Challenges and Solutions

| Challenge | Solution |
|-----------|---------|
| **Radio buttons not selectable** | Replaced with `Checkbox` components, updated `QuizAttempt` to support `selectedOptionIds: string[]`. |
| **Incorrect quiz attempt payload** | Modified `QuizAttempt` to include `questionId`, aligned with backend (`POST /api/quizzes/:id/attempt`). |
| **Quiz results type mismatch** | Updated `QuizResults` type to match API’s `attempt` and `quiz` structure, fixed `map` error in results page. |
| **Missing active quizzes in dashboard** | Added `activeQuizzes` query in `getStudentDashboard`, updated frontend to display in priority order. |
| **API errors (e.g., 404, 401)** | Enhanced error handling with specific messages and redirects in `src/lib/api.ts` and page components. |

## 📡 Backend API Integration

The frontend integrates with the following backend endpoints (assumed at `http://localhost:5000/api`):

| Endpoint | Method | Purpose | Used By |
|----------|--------|---------|---------|
| `/auth/login` | POST | Authenticate users, return JWT token. | Login Page |
| `/students/dashboard` | GET | Fetch active, upcoming, completed quizzes, and average score. | Student Dashboard |
| `/quizzes` | POST | Create new quizzes (assumed). | Instructor Dashboard |
| `/quizzes/:id` | GET | Fetch quiz details for attempting. | Attempt Quiz Page |
| `/quizzes/:id/attempt` | POST | Submit quiz answers. | Attempt Quiz Page |
| `/quizzes/:id/results` | GET | Fetch quiz results. | Quiz Results Page |

### Example API Response
- **Student Dashboard** (`GET /api/students/dashboard`):
  ```json
  {
    "completedQuizzes": [
      {
        "quizId": "68220bd4ff53cf38ae4d8e9c",
        "title": "Sample Quiz",
        "totalScore": 3,
        "attemptDate": "2025-05-14T08:00:00.000Z"
      }
    ],
    "activeQuizzes": [
      {
        "id": "68220bd4ff53cf38ae4d8e9c",
        "title": "Active Quiz",
        "startTime": "2025-05-14T07:00:00.000Z",
        "endTime": "2025-05-14T23:59:59.000Z"
      }
    ],
    "upcomingQuizzes": [
      {
        "id": "682377b3114d7796711ecea6",
        "title": "Future Quiz",
        "startTime": "2025-05-15T00:00:00.000Z",
        "endTime": "2025-05-15T23:59:59.000Z"
      }
    ],
    "averageScore": 3
  }
  ```

## 🔧 Setup and Installation

1. **Clone Repository**:
   ```bash
   git clone <repository-url>
   cd quiz-platform
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Frontend**:
   ```bash
   npm run dev
   ```
   - Open `http://localhost:3000`.

4. **Run Backend** (assumed):
   ```bash
   cd backend
   npm install
   npm start
   ```
   - Ensure MongoDB is running at `mongodb://localhost:27017`.

5. **Environment**:
   - Frontend: Ensure `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api` in `.env.local`.
   - Backend: Configure MongoDB URI and JWT secret.

## 🧪 Testing Instructions

1. **Login**:
   - Use Student/Instructor credentials to log in at `/auth/login`.
   - Verify redirect to correct dashboard.

2. **Student Dashboard**:
   - Check active, upcoming, and completed quizzes display in order.
   - Click “Start Quiz” and “View Results”; verify navigation.
   - Test API: `curl -X GET http://localhost:5000/api/students/dashboard -H "Authorization: Bearer <token>"`.

3. **Attempt Quiz**:
   - Select multiple answers, submit, and confirm.
   - Verify redirect to `/quiz/:id/results`.
   - Test API: `curl -X POST http://localhost:5000/api/quizzes/:id/attempt ...`.

4. **Quiz Results**:
   - Verify table shows questions, answers, correct answers, and scores.
   - Test API: `curl -X GET http://localhost:5000/api/quizzes/:id/results ...`.

5. **TypeScript**:
   ```bash
   npx tsc --noEmit
   ```

## 📈 Future Enhancements

- **Quiz Timer**: Add a countdown timer on the Attempt Quiz page.
- **Progress Bar**: Show quiz completion progress.
- **Instructor Analytics**: Display student performance metrics on the Instructor Dashboard.
- **Notifications**: Alert students about upcoming quiz deadlines.
- **Accessibility**: Enhance Radix UI components for better screen reader support.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit changes (`git commit -m 'Add AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📧 Contact

For questions or feedback, reach out to the project maintainer at [devteam@quizplatform.com](deepakdnayak2004@gmail.com)

---

*Built with 💻 and ☕ by the Quiz Platform Team*  
*Last Updated: May 14, 2025*