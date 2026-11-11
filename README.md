# 🎓 KaarYab Afghanistan

## Full-stack backend

This project now includes an **Express + PostgreSQL + Prisma** backend with cookie JWT authentication, USER/ADMIN access, opportunity CRUD/publication, server-side search/filtering/pagination, saved opportunities, application tracking, contact-message storage and explicit legacy-data import. The existing React UI and client-side CV builder are preserved.

**Start here:** [Backend setup, database, API and deployment guide](backend/README.md). See [implementation plan](IMPLEMENTATION_PLAN.md) and [verification report](VERIFICATION.md). The older capstone description below documents the original frontend prototype; its Local Storage and future-authentication descriptions have been superseded by the backend guide.

Quick start: from this folder run **`npm run dev`**. This starts local PostgreSQL, prepares Prisma/migrations/categories, starts the backend, then starts Next.js. Open **http://localhost:3000** and keep that one terminal open. Press **Ctrl+C** to stop. Install dependencies once with `npm install` and `npm --prefix backend install`. No PostgreSQL or Docker preinstallation is needed for the local helper. Stop older frontend/backend terminals before using this command. A configured database that was already running is reused and is not stopped by the launcher.

For separate processes only: `npm --prefix backend run db:local`, `npm run backend:dev`, and `npm run frontend:dev`. Do not combine those frontend/backend commands with `npm run dev`.

> **Opportunity Finder Platform for Afghan Youth**  
> A modern, accessible, and user-centric web platform designed to empower Afghan students, job seekers, and professionals by aggregating career and educational opportunities in one unified place.

---

## 📌 Project Overview
* **Project Name:** KaarYab Afghanistan
* **Project Type:** Final Capstone Project
* **Course Duration:** 6 Weeks / 1.5 Months
* **Target Audience:** Afghan Youth, Students, Job Seekers, Women looking for remote work, and Organizations.

---

## 📝 Project Description
**KaarYab Afghanistan** is a modern Next.js application built to bridge the gap between Afghan talent and global/local opportunities. The platform acts as a centralized hub for discovering jobs, internships, scholarships, online courses, remote work, training programs, and volunteer initiatives. 

Designed with inclusivity and performance in mind, KaarYab provides seamless navigation, multi-filter search capabilities, saved opportunities management, real-time platform analytics, and an integrated **PDF CV Builder** to help users create professional resumes directly on the site.

---


## 💡 Problem It Solves
1. **Information Fragmentation:** Opportunities in Afghanistan are scattered across disjointed social media channels, messaging groups, and isolated websites, making them hard to track.
2. **Limited Access for Women:** Women and remote job seekers often struggle to find safe, flexible, and verified online work or education opportunities.
3. **Application Barriers:** Young job seekers frequently lack proper tools or guidance to build standardized resumes (CVs) for applications.

**The Solution:** KaarYab solves these challenges by consolidating verified listings into a single, clean, mobile-responsive dashboard equipped with bookmarking, real-time deadline warnings, dynamic filtering, and a client-side resume builder.

---

## ✨ Features

### 🔍 Core Platform Features
* **Comprehensive Opportunity Listings:** Browsable feed of jobs, scholarships, internships, online courses, and remote work.
* **Smart Search & Advanced Filtering:** Filter opportunities by title, category, location, work type (Remote/On-site/Hybrid), and submission deadlines.
* **Dynamic Details Page (`/opportunities/[id]`):** Dedicated view for each opportunity with full job requirements, organization information, tags, and direct application links.
* **Save / Bookmark System:** Save preferred opportunities to local storage for quick access without requiring account creation.
* **CRUD Functionality:** Complete system to Create, Read, Update, and Delete opportunity listings.
* **Interactive Dashboard:** Real-time metrics showing total opportunities, active jobs, remote positions, scholarships, and expiring listings accompanied by analytical visual cards.
* **Dark / Light Mode:** Full dark mode support using Tailwind CSS for tailored readability.

### 🌟 Bonus & Advanced Features
* **📄 PDF CV Builder (`/cv-builder`):** A client-side dynamic resume builder allowing users to generate and download academic/professional PDF CVs.
* **⏳ Expiring Soon Indicators:** Automatic dynamic calculations highlighting opportunities nearing their deadline within 7 days.
* **🌟 Featured & Women-Centric Sections:** Dedicated spotlight sections for featured listings and remote initiatives tailored for Afghan women.

---

## 🛠️ Technologies Used

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-v7-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-Validation-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![React PDF](https://img.shields.io/badge/@react--pdf/renderer-v4-red?style=for-the-badge)
![Recharts](https://img.shields.io/badge/Recharts-v2-22B5BF?style=for-the-badge)
![Lucide React](https://img.shields.io/badge/Lucide%20React-Icons-F54E00?style=for-the-badge)
![Context API](https://img.shields.io/badge/Context%20API-React-61DAFB?style=for-the-badge&logo=react)
![LocalStorage](https://img.shields.io/badge/LocalStorage-Web%20API-E34F26?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Vercel-Deployment-black?style=for-the-badge&logo=vercel)

---

## 🚀 How to Run Locally

Follow these steps to set up and run the project locally on your computer:

### 1. Prerequisites
Make sure you have **Node.js** (v18.0.0 or higher) and **Git** installed.

### 2. Clone the Repository
```bash
git clone [https://github.com/Zahranazari607/kaaryab-afghanistan.git](https://github.com/Zahranazari607/kaaryab-afghanistan.git)
cd kaaryab-afghanistan

```

### 3. Install Dependencies

```bash
npm install

```

### 4. Run the Development Server

```bash
npm run dev

```

### 5. Open in Browser

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🖼️ Screenshots

| Page | Light Mode | Dark Mode |
| :--- | :---: | :---: |
| **Home Page** | ![Home Light](./public/screenshots/Home%20page-light%20mode.png) | ![Home Dark](./public/screenshots/Home%20page-Dark%20mode.png) |
| **Opportunities Page** | ![Opportunities Light](./public/screenshots/Opportunities%20page-light%20mode.png) | ![Opportunities Dark](./public/screenshots/Opportunities%20page-Dark%20mode.png) |
| **Dashboard** | ![Dashboard Light](./public/screenshots/Dashboard%20page%20-light%20mode.png) | ![Dashboard Dark](./public/screenshots/Dashboard%20page%20-Dark%20mode.png) |
| **CV Builder** | ![CV Builder Light](./public/screenshots/CV%20builder%20page-light%20mode.png) | ![CV Builder Dark](./public/screenshots/CV%20builder%20page-Dark%20mode.png) |
| **Post Opportunity** | ![Post Opportunity Light](./public/screenshots/Post%20opportunities%20page-light%20mode.png) | ![Post Opportunity Dark](./public/screenshots/Post%20opportunities%20page-Dark%20mode.png) |
| **Saved Opportunities** | ![Saved Light](./public/screenshots/Saved%20page-light%20mode.png) | ![Saved Dark](./public/screenshots/Saved%20page-Dark%20mode.png) |
| **About Page** | ![About Light](./public/screenshots/About%20page-light%20mode.png) | ![About Dark](./public/screenshots/About%20page-Dark%20mode.png) |
| **Contact Page** | ![Contact Light](./public/screenshots/Contact%20page-light%20mode.png) | ![Contact Dark](./public/screenshots/Contact%20page-Dark%20mode.png) |

---

## 🔗 Live Demo Link

* **Live Demo:** https://kaaryab-afghanistan-omega.vercel.app/

---

## 💻 GitHub Link

* **GitHub Repository:** https://github.com/Zahranazari607/kaaryab-afghanistan.git

---

## 🔮 Future Improvements

* [ ] **Multi-Language Support:** Full localization in English, Dari (دری), and Pashto (پښتو).
* [ ] **Authentication System:** User accounts for job seekers and verified organizational profiles via NextAuth/Clerk.
* [ ] **Email Notifications:** Automated email alerts for saved searches and new matching listings.
* [ ] **Admin Approval Workflow:** Moderation dashboard for reviewing newly submitted user opportunities before public publication.
* [ ] **Application Tracking:** Built-in portal for users to track application statuses (Applied, Interviewing, Offered).

---

## 🎤 My Final Presentation

**KaarYab Afghanistan** project:

1. **What Problem It Solves:** Resolves opportunity fragmentation across social media, overcomes access barriers for Afghan women via verified remote work/study options, and removes application hurdles with a built-in resume builder.
2. **Who the Users Are:** Afghan youth, university students, job seekers, professionals seeking remote global work, and educational or non-profit organizations posting vacancies.
3. **Main Features:** Comprehensive listing feed with multi-criteria search/filtering, full CRUD and analytical metrics dashboard, dynamic saved/bookmarking system, dark/light theme toggle, and an inline PDF CV Builder.
4. **Technologies Used:** Next.js (App Router), React 19, Tailwind CSS v4, Recharts for data visualization, React Hook Form with Zod validation, and `@react-pdf/renderer` for PDF creation.
5. **Demo of the Website:** Live demonstration showing homepage navigation, filtering opportunities, adding a new listing via the form, viewing analytics on the dashboard, and building/downloading a CV.
6. **Challenges Faced:**
* Managing asynchronous parameters in Next.js dynamic routing (`use(params)`).
* Syncing state seamlessly between LocalStorage and dynamic React Context without hydration errors.
* Managing responsive layouts across complex components like Recharts and client-side PDF renderers.


7. **What You Learned:** Deep understanding of Next.js App Router structure, client-side state management patterns, schema validation with Zod, accessible UI design, and responsive styling with Tailwind CSS v4.
8. **Future Improvements:** Backend integration with authentication (NextAuth), multi-language internationalization (English/Dari/Pashto), automated email alerts, and application status tracking.

**In Summary:** KaarYab Afghanistan addresses opportunity fragmentation and access barriers for Afghan youth, students, and remote job seekers by providing a verified centralized platform. Designed for individual job seekers and organizations alike, the web application features multi-criteria search filters, a bookmarking system, dark mode toggle, dynamic analytics dashboards, and an inline PDF CV Builder. The system is engineered using Next.js (App Router), React 19, Tailwind CSS v4, Recharts, and @react-pdf/renderer for client-side document generation. A live presentation highlights seamless navigation, listing creation, analytics tracking, and instant resume downloading in action. Overcoming major technical hurdles—such as Next.js dynamic routing parameter handling, state hydration synchronization with LocalStorage, and complex PDF rendering layouts—enhanced expertise in modern full-stack development, schema validation with Zod, and responsive accessible UI patterns. Moving forward, the platform aims to integrate NextAuth authentication, multi-language Dari and Pashto support, automated email alerts, and a comprehensive application tracking system.

---
  **Built with 🩷 for the bright future of Afghan youth.**
