import React, { useState, useEffect } from 'react';
import { Container, Button, Table, Badge, Form, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProjectModal from '../components/ProjectModal';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // --- HELPER: Get Config with Token ---
  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchProjects = async () => {
    try {
      let query = `/projects?limit=100`;
      if (search) query += `&search=${search}`;
      if (statusFilter) query += `&status=${statusFilter}`;
      
      // Use Manual Config
      const res = await api.get(query, getAuthConfig());
      setProjects(res.data.data.projects);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter]);

  const handleCreateOrUpdate = async (data) => {
    try {
      const config = getAuthConfig(); // Get Token
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, data, config);
      } else {
        await api.post('/projects', data, config);
      }
      setShowModal(false);
      setEditingProject(null);
      fetchProjects(); 
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This will delete all tasks in this project.')) {
      try {
        await api.delete(`/projects/${id}`, getAuthConfig());
        fetchProjects();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const openEditModal = (proj) => {
    setEditingProject(proj);
    setShowModal(true);
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Projects</h2>
        <Button onClick={() => { setEditingProject(null); setShowModal(true); }}>
          + New Project
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-3">
        <Col md={4}>
          <Form.Control 
            placeholder="Search projects..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </Form.Select>
        </Col>
      </Row>

      {loading ? <p>Loading...</p> : (
        <Table hover responsive className="shadow-sm bg-white">
          <thead className="bg-light">
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Tasks</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id}>
                <td>
                  <Link to={`/projects/${p.id}`} className="text-decoration-none fw-bold">
                    {p.name}
                  </Link>
                  <div className="text-muted small">{p.description}</div>
                </td>
                <td>
                  <Badge bg={p.status === 'active' ? 'success' : 'secondary'}>{p.status}</Badge>
                </td>
                <td>{p.taskCount} ({p.completedTaskCount} done)</td>
                <td>{p.createdBy?.fullName || 'Unknown'}</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2" onClick={() => openEditModal(p)}>Edit</Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(p.id)}>Delete</Button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && <tr><td colSpan="5" className="text-center">No projects found</td></tr>}
          </tbody>
        </Table>
      )}

      <ProjectModal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        onSave={handleCreateOrUpdate}
        project={editingProject}
      />
    </Container>
  );
};

export default Projects;