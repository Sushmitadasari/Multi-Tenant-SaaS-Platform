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
        const projectRes = await api.get('/projects?limit=5');
        const projects = projectRes.data.data.projects;
        const totalProjects = projectRes.data.data.total;

        setRecentProjects(projects);
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

  if (loading) return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Spinner animation="grow" variant="info" />
    </Container>
  );

  return (
    <div style={styles.dashboardWrapper}>
      {/* Internal CSS for Animations and Custom Dark Theme */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .glass-card {
            background: rgba(255, 255, 255, 0.05) !important;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            color: #fff !important;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .glass-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.3);
            border-color: rgba(0, 255, 255, 0.3) !important;
          }
          .custom-table {
            color: #e0e0e0 !important;
          }
          .custom-table thead th {
            border-bottom: 2px solid rgba(255, 255, 255, 0.1) !important;
            color: #0dcaf0;
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 1px;
          }
          .custom-table td {
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
            padding: 1.2rem 0.75rem !important;
          }
          body {
            background-color: #0f172a; /* Deep Slate Blue/Black */
          }
        `}
      </style>

      <Container className="py-5">
        <header className="mb-5 animate-fade-in">
          <h2 className="fw-bold text-white">
            Welcome back, <span style={{ color: '#0dcaf0' }}>{user?.fullName}</span>
          </h2>
          <p className="text-muted">Here is what's happening with your projects today.</p>
        </header>

        {/* Statistics Cards */}
        <Row className="mb-5">
          {[
            { title: 'Total Projects', value: stats.projects, sub: 'Active initiatives' },
            { title: 'My Role', value: user?.role, isBadge: true, sub: 'System Permissions' },
            { title: 'Organization', value: user?.tenantId ? 'Active' : 'System', sub: 'Workspace Status' }
          ].map((item, idx) => (
            <Col md={4} key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
              <Card className="glass-card shadow-lg mb-3">
                <Card.Body className="p-4">
                  <h6 className="text-uppercase text-info mb-3" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                    {item.title}
                  </h6>
                  <div className="d-flex align-items-baseline">
                    {item.isBadge ? (
                      <h3 className="mb-0"><Badge bg="info" className="px-3 py-2">{item.value}</Badge></h3>
                    ) : (
                      <h1 className="mb-0 fw-bold">{item.value}</h1>
                    )}
                  </div>
                  <small className="text-muted mt-2 d-block">{item.sub}</small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Recent Projects Table */}
        <Card className="glass-card shadow-lg animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Card.Header className="bg-transparent border-0 pt-4 px-4">
            <h5 className="mb-0 fw-bold">Recent Projects</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table responsive hover className="custom-table mb-0">
              <thead>
                <tr>
                  <th className="px-4">Project Name</th>
                  <th>Status</th>
                  <th>Tasks</th>
                  <th>Lead</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((proj, idx) => (
                  <tr key={proj.id}>
                    <td className="px-4 fw-bold">{proj.name}</td>
                    <td>
                      <Badge
                        bg={proj.status === 'active' ? 'success' : 'secondary'}
                        className="rounded-pill px-3"
                        style={{ fontSize: '0.7rem' }}
                      >
                        {proj.status}
                      </Badge>
                    </td>
                    <td>
                      <span className="text-info">{proj.taskCount}</span>
                      <span className="text-muted small ms-1">units</span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-info text-dark d-flex justify-content-center align-items-center me-2" style={{ width: 24, height: 24, fontSize: '0.7rem', fontWeight: 700 }}>
                          {proj.createdBy.fullName.charAt(0)}
                        </div>
                        {proj.createdBy.fullName}
                      </div>
                    </td>
                  </tr>
                ))}
                {recentProjects.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-5 text-muted">
                      No projects found in this workspace.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

const styles = {
  dashboardWrapper: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top right, #1e293b, #0f172a)',
    color: '#fff',
    fontFamily: "'Inter', sans-serif"
  }
};

export default Dashboard;