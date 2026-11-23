import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

/**
 * Format project database model to include both standard REST properties
 * and existing UI compatibility fields (e.g. architectureImage, links object).
 */
function formatProjectResponse(project) {
  if (!project) return null;

  return {
    id: project.id,
    title: project.title,
    subtitle: project.subtitle,
    category: project.category,
    featured: project.featured,
    displayOrder: project.displayOrder,
    shortDescription: project.shortDescription,
    badges: project.badges,
    techStack: project.techStack,
    image: project.image,
    architectureImage: project.image, // UI compatibility alias
    imageCaption: project.imageCaption,
    architectureImageCaption: project.imageCaption, // UI compatibility alias
    githubUrl: project.githubUrl,
    liveUrl: project.liveUrl,
    repoStatus: project.repoStatus,
    demoStatus: project.demoStatus,
    links: {
      github: project.githubUrl,
      repoStatus: project.repoStatus,
      demoStatus: project.demoStatus
    },
    caseStudy: project.caseStudy,
    sampleItems: project.sampleItems,
    auditMatrix: project.auditMatrix,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
}

/**
 * GET /api/projects
 * Retrieves all portfolio projects ordered by displayOrder ascending.
 */
router.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { displayOrder: 'asc' }
    });

    return res.status(200).json({
      status: 'success',
      count: projects.length,
      data: projects.map(formatProjectResponse)
    });
  } catch (error) {
    console.error('Error fetching projects from PostgreSQL:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve projects. Please try again later.'
    });
  }
});

/**
 * GET /api/projects/:id
 * Retrieves a single project by its unique ID/slug.
 */
router.get('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid project ID parameter'
      });
    }

    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: `Project with ID '${id}' not found`
      });
    }

    return res.status(200).json({
      status: 'success',
      data: formatProjectResponse(project)
    });
  } catch (error) {
    console.error(`Error fetching project ${req.params.id}:`, error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve project details. Please try again later.'
    });
  }
});

export default router;
