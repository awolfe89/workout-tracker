// src/pages/LoginPage.jsx
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { setCredentials, clearCredentials, authApi } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async e => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }
    setLoading(true);

    try {
      // Store token
      setCredentials(username, password);

      // Verify via our API wrapper
      await authApi.verify();
      toast.success('Login successful');
      onLoginSuccess(); // toggles App.isLoggedIn
    } catch (err) {
      console.error('Login failed:', err);
      clearCredentials();
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="…">
      {/* username/password inputs */}
      <button type="submit" disabled={loading}> … </button>
    </form>
  );
}
