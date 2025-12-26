import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as projectService from '../services/project.service';

export const createProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await projectService.createProject(req.user!.id, req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const getAllProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const projects = await projectService.getAllProjects(req.query);
    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.user!.id, req.body);
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await projectService.deleteProject(req.params.id, req.user!.id);
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const submitForApproval = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await projectService.submitForApproval(req.params.id, req.user!.id);
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const approveProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await projectService.approveProject(req.params.id);
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};


