# Driving School Management App

A modern web application for managing driving school operations, built with React and TypeScript.

## 🚗 Features

### Admin Dashboard
- **Student Management** - View, add, and manage student profiles
- **Instructor Management** - Handle instructor schedules and assignments
- **Group Management** - Organize students into theory groups with phase tracking
- **Calendar System** - Schedule and manage theory/practical sessions
- **Session Tracking** - Complete government curriculum with 27 sessions across 4 phases
- **Progress Monitoring** - Visual progress bars and completion tracking
- **Document Management** - Upload and manage student documents
- **Activity Logs** - Track system activities and changes

### Student Profiles
- **Comprehensive Overview** - Personal info, contact details, enrollment data
- **Session Log** - Government curriculum tracking (Theory, Practical, Observation)
- **Progress Tracking** - Auto-calculated phases and completion percentages
- **Internal Flags** - Support needs and attendance issue tracking
- **Instructor Comments** - Private notes and session feedback

### Modern UI/UX
- **Dark/Light Theme** - System preference detection with manual toggle
- **Responsive Design** - Mobile-friendly across all screen sizes
- **shadcn/ui Components** - Modern, accessible component library
- **Consistent Layout** - Professional admin dashboard structure

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: React Context
- **Date Handling**: date-fns
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd driving-school-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
src/
├── components/ui/          # Reusable UI components
├── context/               # React Context providers
├── hooks/                 # Custom React hooks
├── pages/
│   ├── admin/            # Admin dashboard pages
│   ├── instructor/       # Instructor portal
│   └── student/          # Student portal
├── lib/                  # Utilities and helpers
└── styles/               # Global styles
```

## 🎯 Usage

### Login Credentials
- **Admin**: admin@example.com / password
- **Instructor**: instructor@example.com / password  
- **Student**: student@example.com / password

### Key Workflows

1. **Managing Students**
   - Navigate to Students section
   - View student list with search/filter
   - Click student row to view full profile
   - Track session progress and completion

2. **Group Management**
   - Go to Groups section
   - Create theory groups with phase tracking
   - Assign students to appropriate groups
   - Monitor group progress and completion

3. **Session Scheduling**
   - Use Calendar section
   - Create theory/practical sessions
   - Assign instructors and students
   - Track attendance and completion

## 🌟 Key Features Detail

### Government Curriculum Support
- **Phase 1**: Prerequisites (Theory sessions)
- **Phase 2**: Guided Driving (Theory + Initial Practical)
- **Phase 3**: Semi-Guided Driving (Advanced Practical)
- **Phase 4**: Independent Driving (Final sessions + Observation)

### Smart Progress Tracking
- Auto-calculated current phase based on completed sessions
- Visual progress bars and completion percentages
- Session filtering by phase, type, and completion status

### Professional Admin Interface
- Integrated sidebar navigation
- Consistent layout across all sections
- Responsive design for mobile/tablet use

## 📄 License

This project is for educational/demonstration purposes.

---

Built with ❤️ using React, TypeScript, and modern web technologies. 