import { useEffect, useState } from 'react';
import './App.css';
import jvbgLogo from "./assets/jvbg-logo.png";


function App() {
  const [cases, setCases] = useState([]);
  const [veteranName, setVeteranName] = useState("");
  const [claimType, setClaimType] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  
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

  const response = await fetch("http://localhost:5000/api/cases", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
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
    const response = await fetch(`http://localhost:5000/api/cases/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
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


const deleteCase = async (id) => {
  try {
    const response = await fetch(`http://localhost:5000/api/cases/${id}`, {
      method: "DELETE"
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
  useEffect(() => {
    fetch("http://localhost:5000/api/cases")
    .then((response) => response.json())
    .then((data) => {
      setCases(data);
    });
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

      {error && <p className="error-message">{error}</p>} 
      

      {cases.map((caseItem)=>(
        <div className="case-card" key={caseItem._id}>
          <h2>{caseItem.veteranName}</h2>
          <p>Claim Type: {caseItem.claimType}</p>
          <p>Status: {caseItem.status}</p>

          <div className="case-actions">

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

        </div>
      </div>
      ))}
    </div>
  );

  
}
export default App;