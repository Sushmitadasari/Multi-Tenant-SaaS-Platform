import React, { useState, useEffect, useContext } from 'react';
import { Container, Button, Badge, Form, Row, Col, Alert, Card, Spinner } from 'react-bootstrap';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import UserModal from '../components/UserModal';

const Users = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      if (!user?.tenantId) return;
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      let query = `/tenants/${user.tenantId}/users?limit=100`;
      if (search) query += `&search=${search}`;

      const res = await api.get(query, config);
      setUsers(res.data.data.users);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, user]);

  const handleCreateOrUpdate = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const reliableTenantId = decodedToken.tenantId;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, data, config);
      } else {
        await api.post(`/tenants/${reliableTenantId}/users`, data, config);
      }

      setShowModal(false);
      setEditingUser(null);
      fetchUsers();
      alert(editingUser ? 'User updated successfully!' : 'User created successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await api.delete(`/users/${userId}`, config);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  if (user?.role !== 'tenant_admin' && user?.role !== 'super_admin') {
    return (
      <Container className="mt-5 animate-fade-in">
        <Alert variant="danger" className="bg-dark text-danger border-danger">
          <h4 className="fw-bold">Security Alert</h4>
          <p className="mb-0">You do not have administrative privileges to access the user management module.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <style>
        {`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-user { animation: slideIn 0.4s ease forwards; }
          .user-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 15px;
            transition: all 0.3s ease;
          }
          .user-card:hover {
            background: rgba(255, 255, 255, 0.07);
            border-color: #0dcaf0;
            transform: translateY(-5px);
          }
          .avatar-circle {
            width: 50px;
            height: 50px;
            background: linear-gradient(45deg, #0dcaf0, #007bff);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #000;
            font-size: 1.2rem;
          }
          .search-bar {
            background: rgba(0, 0, 0, 0.2) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            color: white !important;
            border-radius: 12px !important;
          }
          .search-bar:focus {
             box-shadow: 0 0 0 0.25rem rgba(13, 202, 240, 0.2) !important;
             border-color: #0dcaf0 !important;
          }
          body { background-color: #0f172a; }
        `}
      </style>

      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-end mb-5">
          <div>
            <h2 className="fw-bold text-white mb-1">Team Members</h2>
            <p className="text-muted mb-0">Manage roles and permissions for your organization</p>
          </div>
          <Button
            variant="info"
            className="fw-bold px-4 shadow-sm"
            style={{ borderRadius: '10px' }}
            onClick={() => { setEditingUser(null); setShowModal(true); }}
          >
            + Add Member
          </Button>
        </div>

        <Row className="mb-4">
          <Col md={5}>
            <Form.Control
              className="search-bar py-2"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="grow" variant="info" />
          </div>
        ) : (
          <Row className="g-4">
            {users.map((u, idx) => (
              <Col lg={4} md={6} key={u.id} className="animate-user" style={{ animationDelay: `${idx * 0.05}s` }}>
                <Card className="user-card text-white h-100 shadow-lg">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-4">
                      <div className="avatar-circle me-3">
                        {u.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <h5 className="mb-0 text-truncate fw-bold">{u.full_name}</h5>
                        <small className="text-muted text-truncate d-block">{u.email}</small>
                      </div>
                    </div>

                    <div className="d-flex gap-2 mb-4">
                      <Badge bg={u.role === 'tenant_admin' ? 'secondary' : 'dark'} className="border border-info text-info px-3 py-2">
                        {u.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge bg={u.is_active ? 'success' : 'danger'} className="px-3 py-2">
                        {u.is_active ? '● Active' : '○ Inactive'}
                      </Badge>
                    </div>

                    <div className="d-flex gap-2 pt-3 border-top border-secondary border-opacity-25">
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="flex-grow-1"
                        onClick={() => { setEditingUser(u); setShowModal(true); }}
                      >
                        Edit Profile
                      </Button>
                      {u.id !== user.id && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(u.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
            {users.length === 0 && (
              <Col className="text-center py-5 text-muted">
                <h4>No team members found.</h4>
              </Col>
            )}
          </Row>
        )}

        <UserModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onSave={handleCreateOrUpdate}
          targetUser={editingUser}
        />
      </Container>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top right, #1e293b, #0f172a)',
    color: '#e2e8f0'
  }
};

export default Users;