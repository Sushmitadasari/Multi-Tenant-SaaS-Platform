import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

const UserModal = ({ show, onHide, onSave, targetUser = null }) => {
  const [formData, setFormData] = useState({ 
    email: '', 
    fullName: '', 
    password: '', 
    role: 'user' 
  });

  useEffect(() => {
    if (targetUser) {
      setFormData({
        email: targetUser.email,
        fullName: targetUser.fullName,
        role: targetUser.role,
        password: '' // Don't show hash, leave empty unless changing
      });
    } else {
      setFormData({ email: '', fullName: '', password: '', role: 'user' });
    }
  }, [targetUser, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{targetUser ? 'Edit User' : 'Add New User'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              required
              disabled={!!targetUser} // Email usually shouldn't change
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </Form.Group>
          
          {/* Password is required only for new users */}
          <Form.Group className="mb-3">
            <Form.Label>{targetUser ? 'New Password (leave blank to keep)' : 'Password'}</Form.Label>
            <Form.Control
              type="password"
              required={!targetUser}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Role</Form.Label>
            <Form.Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="user">User</option>
              <option value="tenant_admin">Admin</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button variant="primary" type="submit">Save User</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserModal;