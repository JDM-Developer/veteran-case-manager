import { useEffect, useState } from 'react';
import './App.css';
import jvbgLogo from './assets/jvbg-logo.png';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [cases, setCases] = useState([]);
  const [veteranName, setVeteranName] = useState('');
  const [claimType, setClaimType] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [editingCaseId, setEditingCaseId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Unable to log in.');
        return;
      }

      localStorage.setItem('token', data.token);
      setIsLoggedIn(true);
      await fetchCases();
      setError('');
    } catch {
      setError('Unable to connect to the server.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!veteranName || !claimType || !status) {
      setError('Please fill out all fields.');
      return;
    }

    const newCase = { veteranName, claimType, status };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCase),
      });
      const createdCase = await response.json();

      if (!response.ok) {
        setError(createdCase.error);
        return;
      }

      setCases([...cases, createdCase]);
      setError('');
      setVeteranName('');
      setClaimType('');
      setStatus('');
    } catch {
      setError('Unable to connect to the server.');
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/cases/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const updatedCase = await response.json();

      if (!response.ok) {
        setError(updatedCase.error || 'Unable to update case.');
        return;
      }

      setCases(cases.map((caseItem) =>
        caseItem._id === updatedCase._id ? updatedCase : caseItem,
      ));
      setError('');
    } catch {
      setError('Unable to connect to the server.');
    }
  };

  const token = localStorage.getItem('token');
  const saveEdit = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cases/${editingCaseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      const updatedCase = await response.json();

      if (!response.ok) {
        setError(updatedCase.error || 'Unable to update case.');
        return;
      }

      setCases(cases.map((caseItem) =>
        caseItem._id === updatedCase._id ? updatedCase : caseItem,
      ));
      setEditingCaseId(null);
      setEditForm(null);
      setError('');
    } catch {
      setError('Unable to connect to the server.');
    }
  };

  const deleteCase = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/cases/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const deletedCase = await response.json();

      if (!response.ok) {
        setError(deletedCase.error || 'Unable to delete case.');
        return;
      }

      setCases(cases.filter((caseItem) => caseItem._id !== id));
      setError('');
    } catch {
      setError('Unable to connect to the server.');
    }
  };

  const fetchCases = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/cases`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Unable to load cases.');
      return;
    }

    setCases(data);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setCases([]);
    setError('');
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const getStatusClass = (caseStatus) => {
    const normalizedStatus = caseStatus?.toLowerCase().replace(/\s+/g, '-');
    return `status-badge status-${normalizedStatus || 'default'}`;
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-content">
          <div className="brand-block">
            <img src={jvbgLogo} alt="JVBG Veteran Case Manager" />
            <div className="brand-divider" aria-hidden="true" />
            <div className="brand-copy">
              <p className="brand-eyebrow">Claims Management Portal</p>
              <h1>Veteran Case Manager</h1>
            </div>
          </div>
          {isLoggedIn && (
            <button className="button button-header" type="button" onClick={handleLogout}>
              Log out
            </button>
          )}
        </div>
      </header>

      <main className={isLoggedIn ? 'main-content' : 'login-layout'}>
        {!isLoggedIn && (
          <section className="login-card" aria-labelledby="login-title">
            <div className="login-card-header">
              <p className="section-eyebrow">Secure access</p>
              <h2 id="login-title">Welcome back</h2>
              <p>Sign in to access veteran claims and case-management tools.</p>
            </div>
            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-field">
                <label htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@organization.com"
                  autoComplete="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <button className="button button-primary button-full" type="submit">
                Sign in
              </button>
            </form>
            {error && <p className="error-message" role="alert">{error}</p>}
            <p className="login-security-note">Authorized personnel only. Your session is protected.</p>
          </section>
        )}

        {isLoggedIn && (
          <>
            <section className="page-heading">
              <div>
                <p className="section-eyebrow">Case operations</p>
                <h2>Claims dashboard</h2>
                <p>Review, update, and manage veteran claim records.</p>
              </div>
              <div className="case-summary" aria-label={`${cases.length} total cases`}>
                <span>{cases.length}</span>
                <p>{cases.length === 1 ? 'Active case' : 'Active cases'}</p>
              </div>
            </section>

            <section className="panel add-case-panel" aria-labelledby="add-case-title">
              <div className="panel-heading">
                <div>
                  <p className="section-eyebrow">New record</p>
                  <h3 id="add-case-title">Add a veteran case</h3>
                </div>
                <p>Enter the core claim information to create a case.</p>
              </div>
              <form className="case-form" onSubmit={handleSubmit}>
                <div className="form-field">
                  <label htmlFor="veteran-name">Veteran name</label>
                  <input id="veteran-name" type="text" placeholder="Full name" value={veteranName} onChange={(e) => setVeteranName(e.target.value)} />
                </div>
                <div className="form-field">
                  <label htmlFor="claim-type">Claim type</label>
                  <input id="claim-type" type="text" placeholder="e.g. New claim" value={claimType} onChange={(e) => setClaimType(e.target.value)} />
                </div>
                <div className="form-field">
                  <label htmlFor="case-status">Status</label>
                  <input id="case-status" type="text" placeholder="e.g. Pending" value={status} onChange={(e) => setStatus(e.target.value)} />
                </div>
                <button className="button button-primary add-case-button" type="submit">Add case</button>
              </form>
            </section>

            {error && <p className="error-message dashboard-error" role="alert">{error}</p>}

            <section className="case-list-section" aria-labelledby="case-list-title">
              <div className="list-heading">
                <div>
                  <p className="section-eyebrow">Case directory</p>
                  <h3 id="case-list-title">Veteran cases</h3>
                </div>
                <p>{cases.length} total</p>
              </div>
              <div className="case-list">
                {cases.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-icon" aria-hidden="true">VC</div>
                    <h4>No cases to display</h4>
                    <p>Newly added veteran cases will appear here.</p>
                  </div>
                )}

                {cases.map((caseItem) => {
                  const isEditing = editingCaseId === caseItem._id;
                  return (
                    <article className={`case-card${isEditing ? ' is-editing' : ''}`} key={caseItem._id}>
                      <div className="case-card-content">
                        {isEditing ? (
                          <div className="edit-form" aria-label={`Edit ${caseItem.veteranName}`}>
                            <div className="form-field">
                              <label htmlFor={`edit-name-${caseItem._id}`}>Veteran name</label>
                              <input id={`edit-name-${caseItem._id}`} type="text" value={editForm.veteranName} onChange={(e) => setEditForm({ ...editForm, veteranName: e.target.value })} />
                            </div>
                            <div className="form-field">
                              <label htmlFor={`edit-claim-${caseItem._id}`}>Claim type</label>
                              <input id={`edit-claim-${caseItem._id}`} type="text" value={editForm.claimType} onChange={(e) => setEditForm({ ...editForm, claimType: e.target.value })} />
                            </div>
                            <div className="form-field">
                              <label htmlFor={`edit-status-${caseItem._id}`}>Status</label>
                              <input id={`edit-status-${caseItem._id}`} type="text" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} />
                            </div>
                          </div>
                        ) : (
                          <div className="case-details">
                            <div className="case-identity">
                              <div className="case-avatar" aria-hidden="true">{caseItem.veteranName?.charAt(0).toUpperCase() || 'V'}</div>
                              <div>
                                <p className="case-label">Veteran</p>
                                <h4>{caseItem.veteranName}</h4>
                              </div>
                            </div>
                            <div className="case-metadata">
                              <div>
                                <p className="case-label">Claim type</p>
                                <p className="case-value">{caseItem.claimType}</p>
                              </div>
                              <div>
                                <p className="case-label">Current status</p>
                                <span className={getStatusClass(caseItem.status)}>{caseItem.status}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="case-actions">
                        {!isEditing && (
                          <button
                            className="button button-secondary"
                            type="button"
                            onClick={() => {
                              setEditingCaseId(caseItem._id);
                              setEditForm({ veteranName: caseItem.veteranName, claimType: caseItem.claimType, status: caseItem.status });
                            }}
                          >
                            Edit
                          </button>
                        )}
                        <button className="button button-success" type="button" onClick={() => updateStatus(caseItem._id, 'Approved')}>Approve</button>
                        <button className="button button-danger" type="button" onClick={() => deleteCase(caseItem._id)}>Delete</button>
                        {isEditing && (
                          <button className="button button-primary" type="button" onClick={saveEdit}>Save changes</button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>JVBG Veteran Case Manager</p>
        <span>Claims Management Portal</span>
      </footer>
    </div>
  );
}

export default App;
