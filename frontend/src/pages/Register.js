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

  // Custom CSS for animations and dark glassmorphism
  const styles = `
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .register-card {
      animation: slideUp 0.8s ease-out forwards;
      background: rgba(255, 255, 255, 0.05) !important;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 20px !important;
    }
    .form-control-dark {
      background: rgba(255, 255, 255, 0.08) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      color: #fff !important;
      transition: all 0.3s ease;
    }
    .form-control-dark:focus {
      background: rgba(255, 255, 255, 0.12) !important;
      border-color: #28a745 !important;
      box-shadow: 0 0 10px rgba(40, 167, 69, 0.3) !important;
    }
    .submit-btn {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
    }
  `;

  return (
    <div style={{
      backgroundColor: '#0f172a',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      padding: '40px 0'
    }}>
      <style>{styles}</style>
      <Container className="d-flex justify-content-center">
        <Card style={{ width: '550px' }} className="p-4 shadow-lg register-card text-light">
          <div className="text-center mb-4">
            <h2 className="fw-bold" style={{ letterSpacing: '-1px' }}>Create Organization</h2>
            <p className="text-muted small">Start your SaaS journey today</p>
          </div>

          {error && <Alert variant="danger" className="py-2 text-center" style={{ borderRadius: '10px' }}>{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label className="small text-uppercase fw-bold opacity-75">Org Name</Form.Label>
                <Form.Control
                  className="form-control-dark p-2"
                  required
                  placeholder="Acme Corp"
                  onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label className="small text-uppercase fw-bold opacity-75">Subdomain</Form.Label>
                <Form.Control
                  className="form-control-dark p-2"
                  required
                  placeholder="acme"
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                />
              </Form.Group>
            </div>

            <Form.Text className="d-block mb-3 text-info small text-center opacity-75">
              URL: <span className="fw-bold">{formData.subdomain || 'your-subdomain'}</span>.saas-app.com
            </Form.Text>

            <Form.Group className="mb-3">
              <Form.Label className="small text-uppercase fw-bold opacity-75">Admin Full Name</Form.Label>
              <Form.Control
                className="form-control-dark p-2"
                required
                placeholder="John Doe"
                onChange={(e) => setFormData({ ...formData, adminFullName: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small text-uppercase fw-bold opacity-75">Admin Email</Form.Label>
              <Form.Control
                type="email"
                className="form-control-dark p-2"
                required
                placeholder="admin@company.com"
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
              />
            </Form.Group>

            <div className="row">
              <Form.Group className="mb-4 col-md-6">
                <Form.Label className="small text-uppercase fw-bold opacity-75">Password</Form.Label>
                <Form.Control
                  type="password"
                  className="form-control-dark p-2"
                  required
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-4 col-md-6">
                <Form.Label className="small text-uppercase fw-bold opacity-75">Confirm</Form.Label>
                <Form.Control
                  type="password"
                  className="form-control-dark p-2"
                  required
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </Form.Group>
            </div>

            <Button variant="success" type="submit" className="w-100 py-2 submit-btn">
              Register Organization
            </Button>
          </Form>

          <div className="mt-4 text-center">
            <span className="text-muted small">Already have an account? </span>
            <Link to="/login" className="text-success text-decoration-none fw-bold small">Login</Link>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default Register;