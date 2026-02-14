import React, { useContext } from 'react';
import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard">SaaS Platform</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/projects">Projects</Nav.Link>
            
            {/* Role-based Links */}
            {user?.role === 'tenant_admin' && (
              <Nav.Link as={Link} to="/users">Users</Nav.Link>
            )}
            {user?.role === 'super_admin' && (
              <Nav.Link as={Link} to="/tenants">Tenants</Nav.Link>
            )}
          </Nav>
          <Nav>
            <NavDropdown title={user?.fullName || 'User'} id="basic-nav-dropdown">
              <NavDropdown.Item disabled>Role: {user?.role}</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;