import React, { useState, useEffect } from 'react';
import { Container, Button, Badge, Form, Row, Col, Alert, Card, Spinner, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProjectModal from '../components/ProjectModal';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchProjects = async () => {
    try {
      let query = `/projects?limit=100`;
      if (search) query += `&search=${search}`;
      if (statusFilter) query += `&status=${statusFilter}`;

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
      const config = getAuthConfig();
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
    <div style={styles.pageWrapper}>
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .project-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
            animation: fadeInUp 0.5s ease forwards;
            height: 100%;
          }
          .project-card:hover {
            transform: translateY(-8px);
            background: rgba(255, 255, 255, 0.06);
            border-color: #0dcaf0;
            box-shadow: 0 15px 35px rgba(0,0,0,0.4);
          }
          .custom-input {
            background: rgba(0, 0, 0, 0.2) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            color: white !important;
            border-radius: 10px !important;
          }
          .custom-input:focus {
            border-color: #0dcaf0 !important;
            box-shadow: 0 0 0 0.25rem rgba(13, 202, 240, 0.25) !important;
          }
          .progress-mini {
            height: 6px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            overflow: hidden;
            margin-top: 15px;
          }
          .progress-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #0dcaf0, #007bff);
            transition: width 1s ease-in-out;
          }
          body { background-color: #0f172a; }
        `}
      </style>

      <Container className="py-5">
        <header className="d-flex justify-content-between align-items-end mb-5">
          <div>
            <h1 className="fw-bold text-white mb-1">Projects</h1>
            <p className="text-muted mb-0">Manage and track your organization's initiatives</p>
          </div>
          <Button
            variant="info"
            className="px-4 py-2 fw-bold shadow-sm"
            onClick={() => { setEditingProject(null); setShowModal(true); }}
            style={{ borderRadius: '10px' }}
          >
            + Create New Project
          </Button>
        </header>

        {error && <Alert variant="danger" className="bg-dark text-danger border-danger">{error}</Alert>}

        <Row className="mb-5 g-3">
          <Col md={4}>
            <Form.Control
              className="custom-input p-2 px-3"
              placeholder="🔍 Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Select
              className="custom-input p-2 px-3"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </Form.Select>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="info" />
          </div>
        ) : (
          <Row className="g-4">
            {projects.map((p, idx) => {
              const progress = p.taskCount > 0 ? (p.completedTaskCount / p.taskCount) * 100 : 0;
              return (
                <Col lg={4} md={6} key={p.id}>
                  <Card className="project-card text-white" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <Card.Body className="d-flex flex-column p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <Badge
                          bg={p.status === 'active' ? 'success' : 'secondary'}
                          className="px-3 py-2"
                        >
                          {p.status.toUpperCase()}
                        </Badge>
                        <div className="d-flex gap-2">
                          <Button variant="link" className="text-info p-0" onClick={() => openEditModal(p)}>
                            Edit
                          </Button>
                          <Button variant="link" className="text-danger p-0" onClick={() => handleDelete(p.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>

                      <Link to={`/projects/${p.id}`} className="text-decoration-none">
                        <h4 className="fw-bold text-white mb-2">{p.name}</h4>
                      </Link>

                      <Card.Text className="text-muted small flex-grow-1" style={{ minHeight: '40px' }}>
                        {p.description || "No description provided."}
                      </Card.Text>

                      <div className="mt-4">
                        <div className="d-flex justify-content-between small text-muted mb-1">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="progress-mini">
                          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top border-secondary border-opacity-25">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-info text-dark d-flex align-items-center justify-content-center fw-bold me-2" style={{ width: '28px', height: '28px', fontSize: '0.7rem' }}>
                            {p.createdBy?.fullName?.charAt(0) || '?'}
                          </div>
                          <span className="small text-muted">{p.createdBy?.fullName || 'Unknown'}</span>
                        </div>
                        <Badge pill bg="dark" className="border border-secondary">
                          {p.taskCount} Tasks
                        </Badge>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}

            {!loading && projects.length === 0 && (
              <Col xs={12} className="text-center py-5">
                <h5 className="text-muted">No projects match your criteria.</h5>
              </Col>
            )}
          </Row>
        )}
      </Container>

      <ProjectModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleCreateOrUpdate}
        project={editingProject}
      />
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top right, #1e293b, #0f172a)',
    paddingBottom: '80px'
  }
};

export default Projects;