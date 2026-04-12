// NOTE FOR CLAUDE:
// This is a frontend CRM already structured for a window cleaning door-knocking business.
// It currently expects API endpoints (not implemented here) at:
// - GET /api/clients
// - POST /api/leads
// - PATCH /api/clients/:id/status
//
// Your job is to:
// 1. Improve UX for speed (door knocking context)
// 2. Extend features (quotes, follow-ups, route optimization)
// 3. Keep it mobile-first
// 4. Suggest backend + automation improvements
//
// Domain: crm.holygiraffe.com

import { useState, useEffect } from "react";

export default function GiraffeCRM() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setLoading(true);
    const res = await fetch("/api/clients");
    const data = await res.json();
    setClients(data);
    setLoading(false);
  }

  async function createLead(lead) {
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });

    await loadClients();
  }

  async function updateStatus(id, status) {
    await fetch(`/api/clients/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    await loadClients();
  }

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Giraffe CRM</h1>

      <button
        onClick={() =>
          createLead({
            name: "New Lead",
            addr: "123 Test St",
            city: "RSM",
            windows: 12,
            tier: "exterior",
          })
        }
      >
        + Quick Lead
      </button>

      <div style={{ marginTop: 20 }}>
        {clients.map((c) => (
          <div
            key={c.id}
            style={{
              border: "1px solid #ddd",
              padding: 10,
              marginBottom: 10,
              cursor: "pointer",
            }}
            onClick={() => setSelected(c)}
          >
            <strong>{c.name}</strong>
            <div>{c.addr}</div>
            <div>Status: {c.status}</div>
            <div>Quote: ${c.price}</div>
          </div>
        ))}
      </div>

      {selected && (
        <div style={{ marginTop: 20, borderTop: "2px solid #000" }}>
          <h2>{selected.name}</h2>
          <p>{selected.addr}</p>

          <button onClick={() => updateStatus(selected.id, "quoted")}>
            Mark Quoted
          </button>
          <button onClick={() => updateStatus(selected.id, "scheduled")}>
            Schedule
          </button>
          <button onClick={() => updateStatus(selected.id, "completed")}>
            Complete
          </button>
          <button onClick={() => updateStatus(selected.id, "follow-up")}>
            Follow Up
          </button>
        </div>
      )}
    </div>
  );
}
