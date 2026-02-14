import React, { useState, useContext } from 'react';
import { Form, Button, Container, Alert, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    tenantName: '', subdomain: '', adminEmail: '', adminFullName: '', adminPassword: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.adminPassword !== formData.confirmPassword) {
      return setError("Passwords don't match");
    }
    
    const res = await register(formData);
    if (res.success) {
      alert('Registration successful! Please login.');
      navigate('/login');
    } else {
      setError(res.message);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center mt-5 mb-5">
      <Card style={{ width: '500px' }} className="p-4 shadow">
        <h2 className="text-center mb-4">Register Organization</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Organization Name</Form.Label>
            <Form.Control 
              required
              onChange={(e) => setFormData({...formData, tenantName: e.target.value})}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Subdomain</Form.Label>
            <Form.Control 
              required
              onChange={(e) => setFormData({...formData, subdomain: e.target.value})}
            />
            <Form.Text className="text-muted">Your URL will be: {formData.subdomain || 'example'}.saas-app.com</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Admin Name</Form.Label>
            <Form.Control 
              required
              onChange={(e) => setFormData({...formData, adminFullName: e.target.value})}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Admin Email</Form.Label>
            <Form.Control 
              type="email" required
              onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control 
              type="password" required
              onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control 
              type="password" required
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </Form.Group>
          <Button variant="success" type="submit" className="w-100">Register</Button>
        </Form>
        <div className="mt-3 text-center">
            Already have an account? <Link to="/login">Login</Link>
        </div>
      </Card>
    </Container>
  );
};

export default Register;