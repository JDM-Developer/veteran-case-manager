import { useEffect, useState } from 'react';
import './App.css';
import jvbgLogo from "./assets/jvbg-logo.png";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [cases, setCases] = useState([]);
  const [veteranName, setVeteranName] = useState("");
  const [claimType, setClaimType] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [editingCaseId, setEditingCaseId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token")
);


  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Unable to log in.");
      return;
    }

    localStorage.setItem("token", data.token);
    setIsLoggedIn(true);
    await fetchCases();
    setError("");
  } catch (error) {
    setError("Unable to connect to the server.");
  }
};

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!veteranName || !claimType || !status) {
      setError ("Please fill out all fields.");
      return;
    }

    const newCase = {
      veteranName,
      claimType,
      status
    };

  try {

  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/api/cases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(newCase)
  });

  

  const createdCase = await response.json();

  if (!response.ok) {
    setError(createdCase.error);
    return;
  }

  setCases([...cases, createdCase]);
  setError("");
  setVeteranName("");
  setClaimType("");
  setStatus("");

  } catch (error) {
    setError("Unable to connect to the server.")
  
  }

};

  
  const updateStatus = async (id, newStatus) => {
  try {
    const response = await fetch(`${API_URL}/api/cases/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        status: newStatus
      })
    });

    const updatedCase = await response.json();

    if (!response.ok) {
      setError(updatedCase.error || "Unable to update case.");
      return;
    }

    setCases(
      cases.map((caseItem) =>
        caseItem._id === updatedCase._id ? updatedCase : caseItem
      )
    );

    setError("");

  } catch (error) {
    setError("Unable to connect to the server.");
  }
};  

  const token = localStorage.getItem("token");
  const saveEdit = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cases/${editingCaseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      const updatedCase = await response.json();

      if (!response.ok) {
        setError(updatedCase.error || "Unable to update case.");
        return;
      }

      setCases(
        cases.map((caseItem) =>
          caseItem._id === updatedCase._id ? updatedCase : caseItem
        )
      );

      setEditingCaseId(null);
      setEditForm(null);
      setError("");

    } catch (error) {
      setError("Unable to connect to the server.");
    }
  };


const deleteCase = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/cases/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const deletedCase = await response.json();

    if (!response.ok) {
      setError(deletedCase.error || "Unable to delete case.");
      return;
    }

    setCases(
      cases.filter((caseItem) => caseItem._id !== id)
    );

    setError("");

  } catch (error) {
    setError("Unable to connect to the server.");
  }
};

const fetchCases = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/api/cases`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    setError(data.error || "Unable to load cases.");
    return;
  }

  setCases(data);
};

const handleLogout = () => {
  localStorage.removeItem("token");
  setIsLoggedIn(false);
  setCases([]);
  setError("");
};

  useEffect(() => {
    fetchCases();
  }, []);

  return (
    <div className='app-container'>
      <div className="app-header">
        <img src={jvbgLogo} alt="JVBG logo" />

        <div>
          <h1>Veteran Case Manager</h1>
          <p>Claims Management Portal</p>
        </div>
      </div>
    {!isLoggedIn && (
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>
    )}

    {isLoggedIn && (
      <form className="case-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder = "Veteran Name"
          value = {veteranName}
          onChange={(e)=> setVeteranName(e.target.value)}
          />
        <input
          type="text"
          placeholder = "Claim Type"
          value = {claimType}
          onChange={(e)=> setClaimType(e.target.value)}
          />
          <input
          type="text"
          placeholder = "Status"
          value = {status}
          onChange={(e)=> setStatus(e.target.value)}
          />

          <button type="submit">Add Case</button>
      </form>
    )}

    {isLoggedIn && (
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    )}

      {error && <p className="error-message">{error}</p>} 
      

      {cases.map((caseItem)=>(
        <div className="case-card" key={caseItem._id}>
          {editingCaseId === caseItem._id ? (
  <>
        <input
          type="text"
          value={editForm.veteranName}
          onChange={(e) =>
            setEditForm({
              ...editForm,
              veteranName: e.target.value
            })
          }
        />  

        <input
          type="text"
          value={editForm.claimType}
          onChange={(e) =>
            setEditForm({
              ...editForm,
              claimType: e.target.value
            })
          }
        />

        <input
          type="text"
          value={editForm.status}
          onChange={(e) =>
            setEditForm({
              ...editForm,
              status: e.target.value
            })
          }
        />
      </>
    ) : (
  <>
    <h2>{caseItem.veteranName}</h2>
    <p>Claim Type: {caseItem.claimType}</p>
    <p>Status: {caseItem.status}</p>
  </>
)}

          <div className="case-actions">

          <button
            onClick={() => {
              setEditingCaseId(caseItem._id);
              setEditForm({
                veteranName: caseItem.veteranName,
                claimType: caseItem.claimType,
                status: caseItem.status
              });
            }}
          >
            Edit
          </button>

          <button
            onClick={()=> updateStatus(caseItem._id, "Approved")}
          >
            Approve
          </button>

          <button
            onClick = {() => deleteCase(caseItem._id)}
          >
            Delete
          </button>

          <button onClick={saveEdit}>
            Save
          </button>

        </div>
      </div>
      ))}
    </div>
  );

  
}
export default App;