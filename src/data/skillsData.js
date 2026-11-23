/**
 * Skills Data — Organized into 5 Interactive Categories
 * Authentic skill inventory without fake percentages or arbitrary rating stars.
 */

export const skillsCategories = [
  {
    id: "cs-fundamentals",
    name: "Programming & CS Fundamentals",
    description: "Core computer science principles, computational logic, and algorithmic problem solving.",
    skills: [
      { name: "C", type: "Language" },
      { name: "Java", type: "Language" },
      { name: "Python", type: "Language" },
      { name: "Data Structures & Algorithms", type: "Core CS" },
      { name: "Object-Oriented Programming", type: "Paradigm" },
      { name: "DBMS", type: "Core CS" },
      { name: "Computer Networks", type: "Core CS" }
    ]
  },
  {
    id: "frontend",
    name: "Frontend Development",
    description: "Crafting responsive, accessible, and structured modern web user interfaces.",
    skills: [
      { name: "HTML5", type: "Markup" },
      { name: "CSS3", type: "Styling" },
      { name: "JavaScript (ES6+)", type: "Language" },
      { name: "TypeScript", type: "Language" },
      { name: "React", type: "Library" },
      { name: "Vite", type: "Build Tool" },
      { name: "Tailwind CSS", type: "Framework" }
    ]
  },
  {
    id: "backend",
    name: "Backend & Databases",
    description: "Designing RESTful APIs, relational data modeling, and server-side execution layers.",
    skills: [
      { name: "Node.js", type: "Runtime" },
      { name: "Express.js", type: "Framework" },
      { name: "REST APIs", type: "Architecture" },
      { name: "FastAPI", type: "Framework" },
      { name: "PostgreSQL", type: "Database" },
      { name: "Prisma ORM", type: "Data Layer" }
    ]
  },
  {
    id: "security-ai",
    name: "Security & AI Integration",
    description: "Access control protocols, authentication mechanics, and applied machine learning services.",
    skills: [
      { name: "JWT Authentication", type: "Security" },
      { name: "Role-Based Access Control (RBAC)", type: "Security" },
      { name: "IAM Concepts", type: "Identity" },
      { name: "API Integration", type: "Architecture" },
      { name: "OCR Pipelines", type: "Applied AI" },
      { name: "AI Service Integration", type: "Applied AI" }
    ]
  },
  {
    id: "tools",
    name: "Developer Tools",
    description: "Daily engineering workflow, version management, API testing, and environment tooling.",
    skills: [
      { name: "Git", type: "Version Control" },
      { name: "GitHub", type: "Collaboration" },
      { name: "Postman", type: "API Testing" },
      { name: "npm", type: "Package Manager" },
      { name: "VS Code", type: "IDE" }
    ]
  }
];
