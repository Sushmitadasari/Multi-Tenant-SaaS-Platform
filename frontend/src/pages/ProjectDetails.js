import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Badge, Row, Col, ListGroup, Alert } from 'react-bootstrap';
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
  
  // Task Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // --- HELPER: Get Config with Token ---
  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const config = getAuthConfig();
      
      console.log("Fetching Project ID:", id);

      // 1. Fetch Project
      const projRes = await api.get(`/projects/${id}`, config);
      setProject(projRes.data.data.projects ? projRes.data.data.projects[0] : projRes.data.data);

      // 2. Fetch Tasks
      const taskRes = await api.get(`/projects/${id}/tasks`, config);
      setTasks(taskRes.data.data.tasks);
      
    } catch (err) {
      console.error(err);
      // Capture the exact error message from the backend
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

  const handleDeleteTask = async (taskId) => {
    if(window.confirm("Delete this task?")) {
        alert("Delete logic not implemented in this demo.");
    }
  };

  if (loading) return <Container className="mt-5">Loading...</Container>;

  // --- Error Screen ---
  if (debugError) {
    return (
        <Container className="mt-5">
            <Alert variant="danger">
                <h4>Error Loading Project</h4>
                <p><strong>Backend Message:</strong> {debugError}</p>
                <p><strong>URL Tried:</strong> /projects/{id}</p>
                <Button variant="outline-danger" onClick={() => navigate('/projects')}>Back to List</Button>
            </Alert>
        </Container>
    );
  }

  if (!project) return <Container className="mt-5">Project not found (Data is null)</Container>;

  return (
    <Container>
      <Button variant="outline-secondary" className="mb-3" onClick={() => navigate('/projects')}>
        &larr; Back to Projects
      </Button>

      <Card className="mb-4 shadow-sm border-0 bg-light">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h2>{project.name}</h2>
              <p className="text-muted">{project.description}</p>
            </div>
            <Badge bg={project.status === 'active' ? 'success' : 'secondary'}>
              {project.status}
            </Badge>
          </div>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Tasks</h4>
        <Button onClick={() => { setEditingTask(null); setShowModal(true); }}>+ Add Task</Button>
      </div>

      <Row>
        {['todo', 'in_progress', 'completed'].map(status => (
          <Col md={4} key={status}>
            <Card className="h-100">
              <Card.Header className="text-capitalize fw-bold text-center">
                {status.replace('_', ' ')}
              </Card.Header>
              <ListGroup variant="flush">
                {tasks.filter(t => t.status === status).map(task => (
                  <ListGroup.Item key={task.id} className="d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between">
                      <span className="fw-bold">{task.title}</span>
                      <Badge bg={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}>
                        {task.priority}
                      </Badge>
                    </div>
                    {task.assignedTo && (
                      <small className="text-muted">Assigned: {task.assignedTo.fullName}</small>
                    )}
                    
                    <div className="d-flex justify-content-between mt-2">
                      <Button size="sm" variant="outline-primary" onClick={() => { setEditingTask(task); setShowModal(true); }}>
                        Edit
                      </Button>
                      
                      {/* --- SMART ARROW LOGIC START --- */}
                      <div>
                        {/* LEFT ARROW (Go Back) */}
                        {status !== 'todo' && (
                          <Button 
                            size="sm" 
                            variant="light" 
                            className="me-1" 
                            // If Completed -> go back to In Progress. Else -> go back to Todo.
                            onClick={() => handleStatusChange(task.id, status === 'completed' ? 'in_progress' : 'todo')}
                          >
                            &larr;
                          </Button>
                        )}

                        {/* RIGHT ARROW (Go Forward) */}
                        {status !== 'completed' && (
                          <Button 
                            size="sm" 
                            variant="light" 
                            // If Todo -> go to In Progress. Else -> go to Completed.
                            onClick={() => handleStatusChange(task.id, status === 'todo' ? 'in_progress' : 'completed')}
                          >
                            &rarr;
                          </Button>
                        )}
                      </div>
                      {/* --- SMART ARROW LOGIC END --- */}

                    </div>
                  </ListGroup.Item>
                ))}
                {tasks.filter(t => t.status === status).length === 0 && (
                  <div className="p-3 text-center text-muted small">No tasks</div>
                )}
              </ListGroup>
            </Card>
          </Col>
        ))}
      </Row>

      <TaskModal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        onSave={handleCreateOrUpdateTask}
        task={editingTask}
      />
    </Container>
  );
};

export default ProjectDetails;