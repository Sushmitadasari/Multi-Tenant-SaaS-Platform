import React, { useState, useContext } from 'react';
import { Form, Button, Container, Alert, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', subdomain: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(formData.email, formData.password, formData.subdomain);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  // Custom CSS for animations and high-level dark theme
  const styles = `
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes glow {
      0% { box-shadow: 0 0 5px rgba(13, 110, 253, 0.2); }
      50% { box-shadow: 0 0 20px rgba(13, 110, 253, 0.4); }
      100% { box-shadow: 0 0 5px rgba(13, 110, 253, 0.2); }
    }
    .login-card {
      animation: slideInRight 0.7s ease-out forwards;
      background: rgba(30, 41, 59, 0.7) !important;
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      border-radius: 24px !important;
    }
    .form-control-dark {
      background: rgba(15, 23, 42, 0.6) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      color: #f8fafc !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 10px !important;
    }
    .form-control-dark:focus {
      background: rgba(15, 23, 42, 0.8) !important;
      border-color: #0d6efd !important;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15) !important;
      transform: scale(1.01);
    }
    .login-btn {
      padding: 12px !important;
      border-radius: 12px !important;
      font-weight: 600 !important;
      transition: all 0.3s ease !important;
      background: linear-gradient(45deg, #0d6efd, #0b5ed7) !important;
      border: none !important;
    }
    .login-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(13, 110, 253, 0.3);
    }
  `;

  return (
    <div style={{
      backgroundColor: '#0f172a',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      backgroundimage: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)'
    }}>
      <style>{styles}</style>
      <Container className="d-flex justify-content-center align-items-center">
        <Card style={{ width: '420px' }} className="p-4 shadow-2xl login-card text-light">
          <div className="text-center mb-4">
            <div className="mb-2" style={{ fontSize: '2rem' }}>🚀</div>
            <h2 className="fw-bold mb-1">Welcome Back</h2>
            <p className="text-muted small">Access your organization dashboard</p>
          </div>

          {error && <Alert variant="danger" className="py-2 text-center border-0" style={{ borderRadius: '12px', fontSize: '0.9rem' }}>{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold opacity-75">Tenant Subdomain</Form.Label>
              <Form.Control
                className="form-control-dark"
                type="text"
                placeholder="org-name"
                value={formData.subdomain}
                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
              />
              <Form.Text className="text-info opacity-50 small">
                Leave empty for Super Admin login
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold opacity-75">Email Address</Form.Label>
              <Form.Control
                className="form-control-dark"
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold opacity-75">Password</Form.Label>
              <Form.Control
                className="form-control-dark"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 login-btn">
              Sign In
            </Button>
          </Form>

          <div className="mt-4 text-center">
            <p className="text-muted small">
              Don't have an account? <Link to="/register" className="text-primary text-decoration-none fw-bold">Register Tenant</Link>
            </p>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default Login;