import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMockKeycloak } from '../../contexts/MockKeycloakProvider';
import { MOCK_USER_PROFILES } from '../../constants/mockUsers';
import './MockLogin.css';

const MockLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useMockKeycloak();

  const [selectedPreset, setSelectedPreset] = useState<string>('approver_joanna');
  const [email, setEmail] = useState<string>('joanna.ramsey@example.com');
  const [password, setPassword] = useState<string>(''); // Not validated, just for UX
  const [isLoading, setIsLoading] = useState(false);

  // Get return URL from state or default to home
  const returnUrl = (location.state as any)?.from?.pathname || '/';

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetId = e.target.value;
    setSelectedPreset(presetId);
    const preset = MOCK_USER_PROFILES.find(u => u.id === presetId);
    if (preset) {
      setEmail(preset.email);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));

    const selectedUser = MOCK_USER_PROFILES.find(u => u.id === selectedPreset);
    if (!selectedUser) {
      console.error('No user selected');
      setIsLoading(false);
      return;
    }

    // Perform mock login
    login(selectedUser);

    // Redirect to return URL
    navigate(returnUrl, { replace: true });
  };

  return (
    <div className="mock-login-container">
      <div className="mock-login-card">
        <div className="mock-login-header">
          <h1>Advana Marketplace</h1>
          <p className="mock-login-subtitle">Mock Authentication (Development Only)</p>
        </div>

        <form className="mock-login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="preset">Select User Profile</label>
            <select
              id="preset"
              value={selectedPreset}
              onChange={handlePresetChange}
              className="form-control"
              disabled={isLoading}
            >
              <optgroup label="Approvers">
                {MOCK_USER_PROFILES.filter(u => u.roles.includes('marketplace-approver')).map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} - {user.email}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Requestors">
                {MOCK_USER_PROFILES.filter(u => u.roles.includes('marketplace-requestor')).map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} - {user.email}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="user@example.com"
              required
              disabled={isLoading}
              readOnly
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="Not validated in mock mode"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn-login"
            disabled={isLoading || !email}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mock-login-footer">
          <small>Mock authentication enabled for local development</small>
        </div>
      </div>
    </div>
  );
};

export default MockLogin;
