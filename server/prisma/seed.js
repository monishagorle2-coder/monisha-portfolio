import { prisma } from '../src/db.js';

export const initialProjects = [
  {
    id: 'mediassist-v2',
    title: 'MediAssist V2',
    subtitle: 'Healthcare Management Platform with Role-Specific Workflows & AI-Assisted Triage',
    category: 'Healthcare Management Platform',
    featured: true,
    displayOrder: 1,
    badges: ['Healthcare Tech', 'FastAPI & OCR', 'Role-Based Access Control', 'PostgreSQL'],
    shortDescription: 'A multi-role healthcare operations system designed with secure clinical workflows, document OCR processing, and human-in-the-loop doctor validation.',
    image: './assets/images/mediassist_architecture.png',
    imageCaption: 'Verified Multi-Portal Architecture: Patient Portal, Staff Role Selector (Doctor/Receptionist/Pharmacist/Lab Tech), and Protected Admin Console.',
    techStack: [
      'React',
      'TypeScript',
      'Node.js',
      'Express.js',
      'PostgreSQL',
      'Prisma ORM',
      'FastAPI',
      'JWT / RBAC',
      'Tailwind CSS'
    ],
    githubUrl: 'https://github.com/monishagorle2-coder',
    liveUrl: null,
    repoStatus: 'Repository Link (To be updated upon public release)',
    demoStatus: 'Local / Development Build',
    caseStudy: {
      problem: 'Healthcare recordkeeping and triage workflows often struggle with disorganized patient intake documentation, slow manual data re-entry from physical reports, and risks of privilege escalation between non-clinical staff and attending physicians.',
      solution: 'MediAssist V2 addresses these pain points by implementing strict role-based access control (RBAC), an automated OCR pipeline for parsing clinical report documents into structured records, and dedicated workflow dashboards tailored for patients, administrative staff, and licensed doctors.',
      architecture: 'The platform adopts a decoupled multi-service design. The React/TypeScript frontend connects to a Node.js/Express REST API gateway that enforces authentication and manages core database operations through Prisma ORM and PostgreSQL. A specialized Python/FastAPI microservice runs the OCR parsing pipeline and handles auxiliary AI integrations asynchronously.',
      keyImplementations: [
        {
          title: 'Role-Based Access Control (RBAC) & Security',
          detail: 'Implemented JSON Web Token (JWT) authentication with granular permissions dividing patient portals, staff scheduling, and medical records to guarantee patient data isolation.'
        },
        {
          title: 'Document OCR Intake Pipeline',
          detail: 'Integrated FastAPI microservices to extract structured text and key markers from scanned lab reports, reducing manual data transcription.'
        },
        {
          title: 'Mandatory Human Doctor Approval',
          detail: 'The AI and OCR subsystems function strictly as assistive data-preparation tools. All triage reviews, diagnostic interpretations, and prescription authorizations require explicit confirmation and digital sign-off from licensed human doctors. The system never provides autonomous diagnoses.'
        },
        {
          title: 'Relational Clinical Data Modeling',
          detail: 'Designed normalized schemas using PostgreSQL and Prisma ORM to maintain referential integrity across patient records, appointments, and physician notes.'
        }
      ]
    },
    sampleItems: null,
    auditMatrix: null
  },
  {
    id: 'inventory-wholesale',
    title: 'Cinematic Inventory & Wholesale Management System',
    subtitle: 'Dry-Fruits & Pickles Wholesale Operations, Stock Tracking & Automated Alert Engine',
    category: 'Inventory & Business Management',
    featured: true,
    displayOrder: 2,
    badges: ['Wholesale Operations', 'Audit Trails', 'Low-Stock Alerts', 'Prisma ORM', 'Tax Invoices'],
    shortDescription: 'A tailored inventory management application engineered for wholesale dry-fruits and pickles businesses, featuring stock movement history, automated alerts, and printable tax invoices.',
    image: null,
    imageCaption: null,
    sampleItems: [
      {
        name: 'California Grade Almonds',
        batch: 'SKU-ALM-01',
        img: './assets/images/almonds.png',
        status: 'In Stock · Threshold: 10kg'
      },
      {
        name: 'Artisanal Gongura Pickle',
        batch: 'SKU-GNG-02',
        img: './assets/images/gongura-pickle.png',
        status: 'Low-Stock Alert Triggered'
      }
    ],
    techStack: [
      'React',
      'TypeScript',
      'Node.js',
      'Express.js',
      'PostgreSQL',
      'Prisma ORM',
      'Tailwind CSS'
    ],
    githubUrl: 'https://github.com/monishagorle2-coder',
    liveUrl: null,
    repoStatus: 'Repository Link (To be updated upon public release)',
    demoStatus: 'Development Phase',
    auditMatrix: {
      implemented: [
        { feature: 'Printable Tax Invoices & PDF Receipts', status: 'Verified in OrderInvoiceModal.tsx with line items, tax calculation, and browser print-to-PDF.' },
        { feature: 'Stock Movement History', status: 'Verified Inbound, Outbound, and Adjustment transaction logging with timestamps and user notes.' },
        { feature: 'Low-Stock Trigger & Alert System', status: 'Verified automated reorder-threshold alerts with duplicate notification suppression.' },
        { feature: 'Order Fulfillment Lifecycle', status: 'Verified order status pipeline (Pending, Processing, Ready, Completed, Cancelled).' },
        { feature: 'Role-Based Access Control', status: 'Verified JWT + cookie security protecting ADMIN, MANAGER, and STAFF endpoints.' }
      ],
      planned: [
        { feature: 'Automated FIFO Lot Queue Allocation', status: 'Planned: Currently adjusts aggregate product quantity; per-lot FIFO queue planned for multi-batch expansion.' },
        { feature: 'Batch Expiry Date Monitoring', status: 'Planned: Schema currently tracks movement timestamps; item-level expiry dates scheduled in next migration.' },
        { feature: 'Cost-of-Goods & Margin Analytics', status: 'Planned: Tracks sales unitPrice and order totals; supplier procurement cost tracking in progress.' }
      ]
    },
    caseStudy: {
      problem: 'Wholesale businesses dealing in dry-fruits and specialty pickles face inventory challenges: tracking fluctuating warehouse volumes, managing customer orders across stages, and preventing unexpected stockouts without manual paper ledgers.',
      solution: 'Engineered a centralized, real-time inventory management application that logs stock-in and stock-out events, manages customer orders, triggers automated low-stock warnings, and generates printable tax invoices.',
      architecture: 'Structured around a React frontend delivering rapid data entry and visual stock analytics, backed by an Express.js REST API layer that interfaces with PostgreSQL via Prisma ORM for transaction-safe inventory adjustments.',
      technicalFlow: [
        { step: '01', name: 'Catalog & Thresholds', desc: 'SKUs registered with reorder levels, units (kg), supplier links, and sales unit prices.' },
        { step: '02', name: 'Stock Movement Ledger', desc: 'ACID-safe Inbound, Outbound, and Adjustment operations logged with timestamps and user notes.' },
        { step: '03', name: 'Automated Alert Engine', desc: 'Threshold engine detects when stock falls below reorder levels and flags actionable notifications.' },
        { step: '04', name: 'Order & Invoice Generation', desc: 'Customer orders processed through fulfillment stages with verified printable tax invoices and PDF export.' }
      ],
      keyImplementations: [
        {
          title: 'Verified Stock In/Out Ledger with Audit Trails',
          detail: 'Tracks every inbound replenishment, outbound dispatch, and inventory adjustment in PostgreSQL with timestamps, movement type, and notes.'
        },
        {
          title: 'Printable Tax Invoices & Order Receipts (Verified)',
          detail: 'Built-in OrderInvoiceModal generates professional, printable tax invoices with subtotal, tax calculation, and customer line items.'
        },
        {
          title: 'Threshold-Based Low-Stock Notification System',
          detail: 'Automated alert engine detects inventory dipping below reorder levels and triggers notifications with duplicate suppression.'
        },
        {
          title: 'Honest Project Status: Evolving Full-Stack Architecture',
          detail: 'Accurately represents verified features while transparently identifying FIFO lot allocation, batch expiry dates, and margin analytics on the development roadmap.'
        }
      ]
    }
  }
];

export async function seedProjects() {
  console.log('🌱 Starting idempotent project seeding to Neon PostgreSQL...');

  const results = [];
  for (const proj of initialProjects) {
    const upserted = await prisma.project.upsert({
      where: { id: proj.id },
      update: {
        title: proj.title,
        subtitle: proj.subtitle,
        category: proj.category,
        featured: proj.featured,
        displayOrder: proj.displayOrder,
        shortDescription: proj.shortDescription,
        badges: proj.badges,
        techStack: proj.techStack,
        image: proj.image,
        imageCaption: proj.imageCaption,
        githubUrl: proj.githubUrl,
        liveUrl: proj.liveUrl,
        repoStatus: proj.repoStatus,
        demoStatus: proj.demoStatus,
        caseStudy: proj.caseStudy,
        sampleItems: proj.sampleItems,
        auditMatrix: proj.auditMatrix
      },
      create: {
        id: proj.id,
        title: proj.title,
        subtitle: proj.subtitle,
        category: proj.category,
        featured: proj.featured,
        displayOrder: proj.displayOrder,
        shortDescription: proj.shortDescription,
        badges: proj.badges,
        techStack: proj.techStack,
        image: proj.image,
        imageCaption: proj.imageCaption,
        githubUrl: proj.githubUrl,
        liveUrl: proj.liveUrl,
        repoStatus: proj.repoStatus,
        demoStatus: proj.demoStatus,
        caseStudy: proj.caseStudy,
        sampleItems: proj.sampleItems,
        auditMatrix: proj.auditMatrix
      }
    });

    console.log(`   ✔ Upserted project: "${upserted.title}" (ID: ${upserted.id})`);
    results.push(upserted);
  }

  const count = await prisma.project.count();
  console.log(`🎉 Seeding complete. Total projects in Neon PostgreSQL: ${count}`);
  return results;
}

// Execute directly if run as main script
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedProjects()
    .catch((e) => {
      console.error('❌ Seeding failed:', e);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
