const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const Project = require('../models/Project');

// Get projects collection
const getProjectsCollection = () => {
  return getDB().collection('projects');
};

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const sanitizedData = Project.sanitize(req.body);
    const errors = Project.validate(sanitizedData);
    
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }

    const project = new Project(sanitizedData);
    const collection = getProjectsCollection();
    
    const result = await collection.insertOne(project);
    const insertedProject = await collection.findOne({ _id: result.insertedId });
    
    res.status(201).json(Project.toOutput(insertedProject));
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const { status } = req.query;
    const collection = getProjectsCollection();
    
    const filter = status ? { status } : {};
    
    const projects = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(projects.map(Project.toOutput));
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single project
exports.getProject = async (req, res) => {
  try {
    const collection = getProjectsCollection();
    
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    
    const project = await collection.findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(Project.toOutput(project));
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const collection = getProjectsCollection();
    
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    
    const sanitizedData = Project.sanitize(req.body);
    const errors = Project.validate(sanitizedData);
    
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    // Don't allow updating timestamps directly
    delete sanitizedData.createdAt;
    delete sanitizedData.completedAt;
    delete sanitizedData.abandonedAt;
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: sanitizedData },
      { returnDocument: 'after' }
    );
    
    if (!result.value) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(Project.toOutput(result.value));
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const collection = getProjectsCollection();
    
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    
    const result = await collection.deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark project as complete
exports.completeProject = async (req, res) => {
  try {
    const collection = getProjectsCollection();
    
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          status: 'completed',
          completedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    
    if (!result.value) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(Project.toOutput(result.value));
  } catch (error) {
    console.error('Error completing project:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark project as abandoned
exports.abandonProject = async (req, res) => {
  try {
    const collection = getProjectsCollection();
    
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          status: 'abandoned',
          abandonedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    
    if (!result.value) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(Project.toOutput(result.value));
  } catch (error) {
    console.error('Error abandoning project:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get projects sorted by priority
exports.getProjectsByPriority = async (req, res) => {
  try {
    const collection = getProjectsCollection();
    
    const projects = await collection
      .find({ status: 'active' })
      .sort({ intrinsicPriority: -1, createdAt: -1 })
      .toArray();
    
    res.json(projects.map(Project.toOutput));
  } catch (error) {
    console.error('Error getting projects by priority:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get project statistics
exports.getStats = async (req, res) => {
  try {
    const collection = getProjectsCollection();
    
    // Use aggregation pipeline for statistics
    const stats = await collection.aggregate([
      {
        $facet: {
          totalProjects: [{ $count: 'count' }],
          activeProjects: [
            { $match: { status: 'active' } },
            { $count: 'count' }
          ],
          completedProjects: [
            { $match: { status: 'completed' } },
            { $count: 'count' }
          ],
          abandonedProjects: [
            { $match: { status: 'abandoned' } },
            { $count: 'count' }
          ],
          recentCompletions: [
            { $match: { status: 'completed' } },
            { $sort: { completedAt: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ]).toArray();
    
    const result = stats[0];
    
    const totalProjects = result.totalProjects[0]?.count || 0;
    const activeProjects = result.activeProjects[0]?.count || 0;
    const completedProjects = result.completedProjects[0]?.count || 0;
    const abandonedProjects = result.abandonedProjects[0]?.count || 0;
    
    const completionRate = totalProjects > 0 
      ? parseFloat(((completedProjects / totalProjects) * 100).toFixed(1))
      : 0;
    
    res.json({
      totalProjects,
      activeProjects,
      completedProjects,
      abandonedProjects,
      completionRate,
      recentCompletions: result.recentCompletions.map(Project.toOutput)
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: error.message });
  }
};