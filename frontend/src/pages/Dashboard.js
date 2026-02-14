import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner } from 'react-bootstrap';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ projects: 0, tasks: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Projects
        const projectRes = await api.get('/projects?limit=5');
        const projects = projectRes.data.data.projects;
        const totalProjects = projectRes.data.data.total;
        
        setRecentProjects(projects);

        // Simple stats calculation
        // Note: In a real app, you'd want a dedicated /stats endpoint
        setStats({
          projects: totalProjects,
          tasks: projects.reduce((acc, curr) => acc + curr.taskCount, 0) 
        });
      } catch (error) {
        console.error("Error loading dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;

  return (
    <Container>
      <h2 className="mb-4">Welcome, {user?.fullName}</h2>
      
      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Total Projects</Card.Title>
              <h1>{stats.projects}</h1>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm">
             <Card.Body>
              <Card.Title>My Role</Card.Title>
              <h3><Badge bg="info">{user?.role}</Badge></h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
           <Card className="text-center shadow-sm">
             <Card.Body>
              <Card.Title>Organization</Card.Title>
              <h3>{user?.tenantId ? 'Active' : 'System'}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Projects Table */}
      <Card className="shadow-sm">
        <Card.Header>Recent Projects</Card.Header>
        <Card.Body>
          <Table hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Tasks</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.map(proj => (
                <tr key={proj.id}>
                  <td>{proj.name}</td>
                  <td><Badge bg={proj.status === 'active' ? 'success' : 'secondary'}>{proj.status}</Badge></td>
                  <td>{proj.taskCount}</td>
                  <td>{proj.createdBy.fullName}</td>
                </tr>
              ))}
              {recentProjects.length === 0 && <tr><td colSpan="4" className="text-center">No projects found</td></tr>}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Dashboard;