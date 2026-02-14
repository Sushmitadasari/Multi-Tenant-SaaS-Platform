import React, { useState, useEffect, useContext } from 'react';
import { Container, Button, Table, Badge, Form, Row, Col, Alert } from 'react-bootstrap';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import UserModal from '../components/UserModal';

const Users = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search State
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      if (!user?.tenantId) return;
      
      // Get token for fetch as well, just in case
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      let query = `/tenants/${user.tenantId}/users?limit=100`;
      if (search) query += `&search=${search}`;
      
      // Note: If your api utility doesn't attach token automatically, 
      // you might need to add 'config' here too: await api.get(query, config);
      const res = await api.get(query);
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

  // --- REPLACE THIS ENTIRE FUNCTION ---
  const handleCreateOrUpdate = async (data) => {
    try {
      // 1. Get the token
      const token = localStorage.getItem('token');
      
      // 2. FORCE extract the Tenant ID from the token (Bypassing AuthContext)
      // This decodes the "middle part" of the JWT token
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const reliableTenantId = decodedToken.tenantId;

      console.log("FIXED ID:", reliableTenantId); // This will print '5' (or similar)

      // 3. Configure Headers
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, data, config);
      } else {
        // 4. Use the reliableTenantId in the URL
        await api.post(`/tenants/${reliableTenantId}/users`, data, config);
      }
      
      setShowModal(false);
      setEditingUser(null);
      fetchUsers(); 
      alert(editingUser ? 'User updated successfully!' : 'User created successfully!');
      
    } catch (err) {
      console.error(err);
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
      return <Container className="mt-5"><Alert variant="danger">Access Denied</Alert></Container>;
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Team Members</h2>
        <Button onClick={() => { setEditingUser(null); setShowModal(true); }}>
          + Add User
        </Button>
      </div>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Control 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
      </Row>

      {loading ? <p>Loading...</p> : (
        <Table hover responsive className="shadow-sm bg-white">
          <thead className="bg-light">
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>
                    <Badge bg={u.role === 'tenant_admin' ? 'purple' : 'info'}>
                        {u.role}
                    </Badge>
                </td>
                <td>
                    <Badge bg={u.is_active ? 'success' : 'secondary'}>
                        {u.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2" onClick={() => { setEditingUser(u); setShowModal(true); }}>Edit</Button>
                  {u.id !== user.id && (
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(u.id)}>Delete</Button>
                  )}
                </td>
              </tr>
            ))}
             {users.length === 0 && <tr><td colSpan="5" className="text-center">No users found</td></tr>}
          </tbody>
        </Table>
      )}

      <UserModal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        onSave={handleCreateOrUpdate}
        targetUser={editingUser}
      />
    </Container>
  );
};

export default Users;