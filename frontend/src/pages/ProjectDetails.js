import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Badge, Row, Col, ListGroup, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import TaskModal from '../components/TaskModal';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugError, setDebugError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const config = getAuthConfig();
      const projRes = await api.get(`/projects/${id}`, config);
      setProject(projRes.data.data.projects ? projRes.data.data.projects[0] : projRes.data.data);

      const taskRes = await api.get(`/projects/${id}/tasks`, config);
      setTasks(taskRes.data.data.tasks);
    } catch (err) {
      const msg = err.response?.status + " " + (err.response?.data?.message || err.message);
      setDebugError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateOrUpdateTask = async (data) => {
    try {
      const config = getAuthConfig();
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, data, config);
      } else {
        await api.post(`/projects/${id}/tasks`, data, config);
      }
      setShowModal(false);
      setEditingTask(null);
      fetchData();
    } catch (err) {
      alert('Failed to save task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus }, getAuthConfig());
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return (
    <div style={styles.loaderWrapper}>
      <Spinner animation="grow" variant="info" />
    </div>
  );

  if (debugError) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" className="bg-dark text-danger border-danger">
          <h4 className="fw-bold">Error Loading Project</h4>
          <p>{debugError}</p>
          <Button variant="outline-danger" onClick={() => navigate('/projects')}>Back to List</Button>
        </Alert>
      </Container>
    );
  }

  if (!project) return <Container className="mt-5 text-white">Project not found</Container>;

  return (
    <div style={styles.pageWrapper}>
      {/* High-Level CSS Injections */}
      <style>
        {`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-in { animation: slideUp 0.5s ease forwards; }
          
          .glass-panel {
            background: rgba(255, 255, 255, 0.03) !important;
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            border-radius: 16px !important;
          }

          .kanban-column {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 20px;
            padding: 15px;
            min-height: 70vh;
          }

          .task-card {
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: grab;
            margin-bottom: 12px;
            color: #fff !important;
          }

          .task-card:hover {
            transform: scale(1.02);
            background: rgba(255, 255, 255, 0.08) !important;
            border-color: #0dcaf0 !important;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          }

          .btn-modern {
            border-radius: 10px;
            padding: 8px 20px;
            font-weight: 600;
            transition: all 0.2s;
          }

          .status-header {
            letter-spacing: 1px;
            font-size: 0.85rem;
            color: #8892b0;
            margin-bottom: 20px;
          }

          body { background-color: #0a192f; }
        `}
      </style>

      <Container className="py-4">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4 animate-in">
          <Button
            variant="link"
            className="text-info p-0 text-decoration-none"
            onClick={() => navigate('/projects')}
          >
            &larr; Back to Workspace
          </Button>
          <Button
            className="btn-modern shadow-sm"
            variant="info"
            onClick={() => { setEditingTask(null); setShowModal(true); }}
          >
            + Create Task
          </Button>
        </div>

        {/* Project Hero Card */}
        <Card className="glass-panel text-white mb-5 animate-in" style={{ animationDelay: '0.1s' }}>
          <Card.Body className="p-4">
            <Row className="align-items-center">
              <Col md={8}>
                <Badge bg="info" className="mb-2 text-dark px-3 py-2">Project Overview</Badge>
                <h1 className="fw-bold display-6">{project.name}</h1>
                <p className="text-muted mb-0">{project.description}</p>
              </Col>
              <Col md={4} className="text-md-end mt-3 mt-md-0">
                <div className="d-flex flex-column align-items-md-end">
                  <span className="text-muted small">STATUS</span>
                  <h4 className="text-capitalize text-success">{project.status}</h4>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Kanban Board */}
        <Row className="g-4 animate-in" style={{ animationDelay: '0.2s' }}>
          {['todo', 'in_progress', 'completed'].map((status, idx) => (
            <Col lg={4} key={status}>
              <div className="kanban-column">
                <div className="d-flex justify-content-between align-items-center px-2 mb-3">
                  <h6 className="status-header fw-bold text-uppercase mb-0">
                    {status.replace('_', ' ')}
                    <span className="ms-2 opacity-50">({tasks.filter(t => t.status === status).length})</span>
                  </h6>
                  <div style={{ height: '2px', flexGrow: 1, background: 'rgba(255,255,255,0.05)', margin: '0 15px' }}></div>
                </div>

                <div className="task-list">
                  {tasks.filter(t => t.status === status).map(task => (
                    <Card key={task.id} className="task-card">
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between mb-2">
                          <Badge
                            bg={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}
                            style={{ fontSize: '0.65rem' }}
                          >
                            {task.priority.toUpperCase()}
                          </Badge>
                          <small className="text-muted" style={{ fontSize: '0.7rem' }}>#{task.id.slice(-4)}</small>
                        </div>

                        <h6 className="fw-bold mb-1">{task.title}</h6>

                        {task.assignedTo && (
                          <div className="d-flex align-items-center mt-3">
                            <div className="bg-info rounded-circle me-2 d-flex align-items-center justify-content-center text-dark fw-bold" style={{ width: 22, height: 22, fontSize: '0.6rem' }}>
                              {task.assignedTo.fullName.charAt(0)}
                            </div>
                            <small className="text-muted">{task.assignedTo.fullName}</small>
                          </div>
                        )}

                        <hr className="my-3 opacity-10" />

                        <div className="d-flex justify-content-between align-items-center">
                          <Button
                            size="sm"
                            variant="link"
                            className="text-info p-0 text-decoration-none small"
                            onClick={() => { setEditingTask(task); setShowModal(true); }}
                          >
                            Details
                          </Button>

                          <div className="btn-group shadow-sm">
                            {status !== 'todo' && (
                              <Button
                                size="sm"
                                variant="dark"
                                className="border-secondary text-white px-2"
                                onClick={() => handleStatusChange(task.id, status === 'completed' ? 'in_progress' : 'todo')}
                              >
                                ❮
                              </Button>
                            )}
                            {status !== 'completed' && (
                              <Button
                                size="sm"
                                variant="dark"
                                className="border-secondary text-white px-2"
                                onClick={() => handleStatusChange(task.id, status === 'todo' ? 'in_progress' : 'completed')}
                              >
                                ❯
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}

                  {tasks.filter(t => t.status === status).length === 0 && (
                    <div className="text-center py-5 opacity-25">
                      <small className="text-white">No tasks here</small>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      <TaskModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleCreateOrUpdateTask}
        task={editingTask}
      />
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a192f 0%, #112240 100%)',
    color: '#e6f1ff',
    paddingBottom: '50px'
  },
  loaderWrapper: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#0a192f'
  }
};

export default ProjectDetails;