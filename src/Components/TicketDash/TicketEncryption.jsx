import React, { useState } from "react";
import { encryptTicketId, decryptTicketId } from "@/_helper/encryption";
import "./TicketEncryption.css";

const TicketEncryption = () => {
  const [ticketId, setTicketId] = useState("");
  const [encryptedId, setEncryptedId] = useState("");
  const [decryptedId, setDecryptedId] = useState("");
  const [message, setMessage] = useState("");

  const handleEncrypt = () => {
    if (!ticketId.trim()) {
      setMessage({ text: "Please enter a Ticket ID", type: "error" });
      return;
    }

    const encrypted = encryptTicketId(ticketId);
    setEncryptedId(encrypted);
    setMessage({ text: "Ticket ID encrypted successfully!", type: "success" });
    console.log("Original:", ticketId);
    console.log("Encrypted:", encrypted);
  };

  const handleDecrypt = () => {
    if (!encryptedId.trim()) {
      setMessage({ text: "Please enter an encrypted ID", type: "error" });
      return;
    }

    const decrypted = decryptTicketId(encryptedId);
    setDecryptedId(decrypted);
    setMessage({ text: "Ticket ID decrypted successfully!", type: "success" });
    console.log("Encrypted:", encryptedId);
    console.log("Decrypted:", decrypted);
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setMessage({ text: `${field} copied to clipboard!`, type: "success" });
  };

  const resetForm = () => {
    setTicketId("");
    setEncryptedId("");
    setDecryptedId("");
    setMessage("");
  };

  return (
    <div className="ticket-encryption-container">
      <div className="encryption-card">
        <h2>Ticket ID Encryption & Decryption</h2>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="encryption-grid">
          {/* Encryption Section */}
          <div className="encryption-section">
            <h3>Encrypt Ticket ID</h3>
            <div className="form-group">
              <label>Enter Ticket ID</label>
              <input
                type="text"
                placeholder="e.g., TKT-001 or 507f1f77bcf86cd799439011"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                className="form-control"
              />
            </div>
            <button onClick={handleEncrypt} className="btn btn-primary">
              Encrypt
            </button>

            {encryptedId && (
              <div className="result-box">
                <label>Encrypted ID:</label>
                <div className="result-display">
                  <span>{encryptedId}</span>
                  <button
                    onClick={() =>
                      handleCopy(encryptedId, "Encrypted ID")
                    }
                    className="btn-copy"
                    title="Copy to clipboard">
                    📋
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Decryption Section */}
          <div className="encryption-section">
            <h3>Decrypt Ticket ID</h3>
            <div className="form-group">
              <label>Enter Encrypted ID</label>
              <input
                type="text"
                placeholder="Paste encrypted ID here"
                value={encryptedId}
                onChange={(e) => setEncryptedId(e.target.value)}
                className="form-control"
              />
            </div>
            <button onClick={handleDecrypt} className="btn btn-primary">
              Decrypt
            </button>

            {decryptedId && (
              <div className="result-box">
                <label>Decrypted ID:</label>
                <div className="result-display">
                  <span>{decryptedId}</span>
                  <button
                    onClick={() =>
                      handleCopy(decryptedId, "Decrypted ID")
                    }
                    className="btn-copy"
                    title="Copy to clipboard">
                    📋
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="button-group">
          <button onClick={resetForm} className="btn btn-secondary">
            Reset All
          </button>
        </div>

        {/* Info Section */}
        <div className="info-section">
          <h4>How it works:</h4>
          <ul>
            <li>Enter your Ticket ID in the left section to encrypt it</li>
            <li>The encrypted ID can be used for secure transmission</li>
            <li>Paste the encrypted ID in the right section to decrypt it</li>
            <li>Click the copy button to quickly copy results</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TicketEncryption;
