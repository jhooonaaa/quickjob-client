import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_ENDPOINT_URL;
  const [professionals, setProfessionals] = useState([]);
  const [clients, setClients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
   const [selectedProf, setSelectedProf] = useState(null);
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  const [overview, setOverview] = useState({
    totalProfessionals: 0,
    totalClients: 0,
    activeSubscriptions: 0,
    pendingVerifications: 0,
    totalCommission: 0,
    totalTransactions: 0,
  });
const filteredList = professionals.filter((p) => {
    if (filter === "pending") return p.verification?.overall !== "success";
    if (filter === "success") return p.verification?.overall === "success";
    if (filter === "failed") return p.verification?.overall === "failed";
    return true;
  });
  

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) navigate("/admin-login");

    // TODO: Replace with your API calls
    fetch(`${apiUrl}/admin/overview`)
      .then((res) => res.json())
      .then(setOverview);

    fetch(`${apiUrl}/admin/clients`)
      .then((res) => res.json())
      .then(setClients);

    fetch(`${apiUrl}/admin/bookings`)
      .then((res) => res.json())
      .then(setBookings);

    fetch(`${apiUrl}/admin/payouts`)
      .then((res) => res.json())
      .then(setPayouts);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/admin-login");
  };
useEffect(() => {
  const fetchProfessionals = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/professionals`);
      const list = await res.json();

      // normalize verification fields
      const enriched = await Promise.all(
        list.map(async (p) => {
          const cRes = await fetch(
            `${apiUrl}/admin/professionals/${p.id}/credentials`
          ).then((r) => r.json());

          const normalizedVerification = {
            id_photo: p.id_photo_status,        // 👈 map DB field -> UI field
            selfie: p.selfie_status,
            credentials: p.credentials_status,
            overall: p.overall_status,
          };

          return { ...p, verification: normalizedVerification, credentials: cRes };
        })
      );

      setProfessionals(enriched);
    } catch (err) {
      console.error("Fetch professionals error:", err);
    }
  };

  fetchProfessionals();
}, []);


const reviewVerification = async (userId, step, status, credentialId = null) => {
  try {
    const res = await fetch(`${apiUrl}/verification/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, step, status, credentialId }),
    });
    const data = await res.json();

    if (data.success) {
      // 1. Update in professionals list
      setProfessionals((prev) =>
        prev.map((p) => {
          if (p.id !== userId) return p;

          if (step === "credentials" && credentialId) {
            return {
              ...p,
              credentials: p.credentials.map((c) =>
                c.id === credentialId ? { ...c, status } : c
              ),
              verification: { ...p.verification, overall: data.overall },
            };
          }

          // For id_photo / selfie
          return {
            ...p,
            verification: {
              ...p.verification,
              [step]: status,
              overall: data.overall,
            },
          };
        })
      );

      // 2. Update selectedProf too
      setSelectedProf((prev) => {
        if (!prev || prev.id !== userId) return prev;

        if (step === "credentials" && credentialId) {
          return {
            ...prev,
            credentials: prev.credentials.map((c) =>
              c.id === credentialId ? { ...c, status } : c
            ),
            verification: { ...prev.verification, overall: data.overall },
          };
        }

        // For id_photo / selfie
        return {
          ...prev,
          verification: {
            ...prev.verification,
            [step]: status,
            overall: data.overall,
          },
        };
      });
    }
  } catch (err) {
    console.error("Review error:", err);
  }
};





  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-indigo-600">Admin Panel</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { key: "overview", label: "📊 Overview" },
            { key: "verification", label: "✅ Professional Verification" },
            { key: "subscriptions", label: "📅 Subscriptions" },
            { key: "clients", label: "👥 Clients" },
            { key: "bookings", label: "📌 Bookings & Transactions" },
            { key: "payments", label: "💰 Payments & Payouts" },
            { key: "notifications", label: "🔔 Notifications" },
            { key: "reports", label: "📄 Reports" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full text-left px-4 py-2 rounded-lg ${
                activeTab === tab.key
                  ? "bg-indigo-100 text-indigo-700 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* Overview / Analytics */}
        {activeTab === "overview" && (
          <section>
            <h2 className="text-2xl font-bold mb-6">📊 Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries({
                "Professionals": overview.totalProfessionals,
                "Clients": overview.totalClients,
                "Active Subscriptions": overview.activeSubscriptions,
                "Pending Verifications": overview.pendingVerifications,
                "Total Commission": `₱${overview.totalCommission}`,
                "Transactions": overview.totalTransactions,
              }).map(([label, value]) => (
                <div
                  key={label}
                  className="bg-white p-6 rounded-xl shadow text-center"
                >
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-2xl font-bold text-indigo-600">{value}</p>
                </div>
              ))}
            </div>
          </section>
        )}

       {/* Professional Verification */}
{activeTab === "verification" && (
  <section>
    {!selectedProf ? (
      // ================= LIST MODE =================
      <div>
        <h2 className="text-2xl font-bold mb-6">✅ Professional Verification</h2>

        {/* Filter Dropdown */}
        <div className="mb-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="success">Completed</option>
            <option value="failed">Rejected</option>
          </select>
        </div>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((p) => (
              <tr
                key={p.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedProf(p)}
              >
                <td className="p-2 font-semibold">{p.name}</td>
                <td className="p-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      p.verification?.overall === "success"
                        ? "bg-green-100 text-green-700"
                        : p.verification?.overall === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {p.verification?.overall || "pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
    // ================= DETAIL MODE =================
<div>
  {/* Back Button + Title */}
  <div className="mb-4 flex items-center gap-4">
    <button
      onClick={() => setSelectedProf(null)}
      className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
    >
      ← Back
    </button>
    <h3 className="text-xl font-bold">
      Verification for {selectedProf.name}
    </h3>
  </div>

  {/* Row for ID + Selfie */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    {/* ID Photo */}
    <div className="flex flex-col items-center border rounded p-4">
      <h4 className="font-medium mb-2">ID Photo</h4>
      {selectedProf.id_photo ? (
        <>
          <img
            src={`${apiUrl}${selectedProf.id_photo}`}
            alt="ID"
            className="w-40 h-40 object-cover rounded border mb-3 cursor-pointer"
            onClick={() => setPreviewImage(`${apiUrl}${selectedProf.id_photo}`)}
          />
          {selectedProf.verification?.id_photo === "success" ? (
            <span className="text-green-600 font-semibold">✅ Approved</span>
          ) : selectedProf.verification?.id_photo === "failed" ? (
            <span className="text-red-600 font-semibold">❌ Rejected</span>
          ) : (
            <div className="flex gap-2">
              <button
                className="bg-green-500 text-white px-3 py-1 rounded"
                onClick={() =>
                  reviewVerification(selectedProf.id, "id_photo", "success")
                }
              >
                Approve
              </button>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() =>
                  reviewVerification(selectedProf.id, "id_photo", "failed")
                }
              >
                Reject
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500">No ID uploaded</p>
      )}
    </div>

    {/* Selfie */}
    <div className="flex flex-col items-center border rounded p-4">
      <h4 className="font-medium mb-2">Selfie</h4>
      {selectedProf.selfie ? (
        <>
          <img
            src={`${apiUrl}${selectedProf.selfie}`}
            alt="Selfie"
            className="w-40 h-40 object-cover rounded border mb-3 cursor-pointer"
            onClick={() => setPreviewImage(`${apiUrl}${selectedProf.selfie}`)}
          />
          {selectedProf.verification?.selfie === "success" ? (
            <span className="text-green-600 font-semibold">✅ Approved</span>
          ) : selectedProf.verification?.selfie === "failed" ? (
            <span className="text-red-600 font-semibold">❌ Rejected</span>
          ) : (
            <div className="flex gap-2">
              <button
                className="bg-green-500 text-white px-3 py-1 rounded"
                onClick={() =>
                  reviewVerification(selectedProf.id, "selfie", "success")
                }
              >
                Approve
              </button>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() =>
                  reviewVerification(selectedProf.id, "selfie", "failed")
                }
              >
                Reject
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500">No selfie uploaded</p>
      )}
    </div>
  </div>

  {/* Credentials */}
  <div>
    <h4 className="font-medium mb-4">Credentials</h4>
    {selectedProf.credentials && selectedProf.credentials.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {selectedProf.credentials.map((cred) => (
          <div
            key={cred.id}
            className="flex flex-col items-center border rounded p-4"
          >
            <img
              src={`${apiUrl}${cred.file_path}`}
              alt="Credential"
              className="w-32 h-32 object-cover mb-3 rounded border cursor-pointer"
              onClick={() => setPreviewImage(`${apiUrl}${cred.file_path}`)}
            />

            {cred.status === "success" ? (
              <span className="text-green-600 font-semibold">✅ Approved</span>
            ) : cred.status === "failed" ? (
              <span className="text-red-600 font-semibold">❌ Rejected</span>
            ) : (
              <div className="flex gap-2">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded"
                  onClick={() =>
                    reviewVerification(
                      selectedProf.id,
                      "credentials",
                      "success",
                      cred.id
                    )
                  }
                >
                  Approve
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() =>
                    reviewVerification(
                      selectedProf.id,
                      "credentials",
                      "failed",
                      cred.id
                    )
                  }
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500">No credentials uploaded</p>
    )}
  </div>

  {/* ===== Modal Viewer ===== */}
  {previewImage && (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="relative bg-white p-4 rounded-lg max-w-4xl w-full">
        <button
          onClick={() => setPreviewImage(null)}
          className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
        >
          ✕
        </button>
        <img
          src={previewImage}
          alt="Preview"
          className="max-h-[80vh] mx-auto object-contain rounded"
        />
      </div>
    </div>
  )}
</div>

    )}
  </section>
)}

        {/* Subscriptions */}
        {activeTab === "subscriptions" && (
          <section>
            <h2 className="text-2xl font-bold mb-6">📅 Subscriptions</h2>
            <p className="text-gray-600">TODO: Subscription table</p>
          </section>
        )}

        {/* Clients */}
        {activeTab === "clients" && (
          <section>
            <h2 className="text-2xl font-bold mb-6">👥 Clients</h2>
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Bookings</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-2">{c.name}</td>
                    <td className="p-2">{c.email}</td>
                    <td className="p-2">{c.bookings || 0}</td>
                    <td className="p-2">
                      <button className="bg-red-500 text-white px-3 py-1 rounded">
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Bookings & Transactions */}
        {activeTab === "bookings" && (
          <section>
            <h2 className="text-2xl font-bold mb-6">📌 Bookings & Transactions</h2>
            <p className="text-gray-600">TODO: Show booking history + commission breakdown</p>
          </section>
        )}

        {/* Payments & Payouts */}
        {activeTab === "payments" && (
          <section>
            <h2 className="text-2xl font-bold mb-6">💰 Payments & Payouts</h2>
            <p className="text-gray-600">TODO: Incoming payments, payouts, approval system</p>
          </section>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <section>
            <h2 className="text-2xl font-bold mb-6">🔔 Notifications</h2>
            <p className="text-gray-600">TODO: Send alerts to professionals & clients</p>
          </section>
        )}

        {/* Reports */}
        {activeTab === "reports" && (
          <section>
            <h2 className="text-2xl font-bold mb-6">📄 Reports</h2>
            <p className="text-gray-600">TODO: Export CSV/PDF logs</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
