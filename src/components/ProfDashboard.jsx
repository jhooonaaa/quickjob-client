import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  MessageSquare, Bell, MoreVertical, TrendingUp, X, Camera, CheckCircle,
  MapPin,
  Star,
  User,
  Clock,
} from "lucide-react";

function ProfDashboard() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_ENDPOINT_URL;
  const [activeTab, setActiveTab] = useState("profile");
   const [showAboutModal, setShowAboutModal] = useState(false);
  const [user, setUser] = useState(null);
  const [clientRequests, setClientRequests] = useState([]);
const [requestFilter, setRequestFilter] = useState("all");
  const [availabilityMode, setAvailabilityMode] = useState("weekly");
  const [messageFilter, setMessageFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [ratings, setRatings] = useState([]);
 const [credentials, setCredentials] = useState([]);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deleteId, setDeleteId] = useState(null);
const [deleteMessage, setDeleteMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
const [newService, setNewService] = useState({ name: "", description: "", rate: "" });
const [showEditModal, setShowEditModal] = useState(false);
const [showPaymentModal, setShowPaymentModal] = useState(false);
const [showBioModal, setShowBioModal] = useState(false);
const [bioInput, setBioInput] = useState("");
const [notifications, setNotifications] = useState([]);
const [showNotifications, setShowNotifications] = useState(false);
const notifRef = useRef(null);
const [openMenuId, setOpenMenuId] = useState(null);
const [showUploadModal, setShowUploadModal] = useState(false);
const [uploadFile, setUploadFile] = useState(null);
const [credName, setCredName] = useState("");
const [transactions, setTransactions] = useState([]);
const [bankInfo, setBankInfo] = useState({
  payoutMethod: "",
  bankName: "",
  accountNumber: "",
  accountName: "",
});
const fetchNotifications = async () => {
  try {
    const res = await fetch(`${apiUrl}/notifications/${user.id}`);
    const data = await res.json();

    // Make sure backend returns an array like:
    // [{ id, message, time, read, targetTab }]
    if (Array.isArray(data)) {
      setNotifications(data);
    } else {
      console.error("Invalid notifications format:", data);
    }
  } catch (err) {
    console.error("Fetch notifications error:", err);
  }
};

const markAllAsRead = async () => {
  try {
    const res = await fetch(`${apiUrl}/notifications/read-all`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const data = await res.json();
    if (data.success) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    }
  } catch (err) {
    console.error("Mark all as read error:", err);
  }
};

useEffect(() => {
  const handleClickOutside = (event) => {
    if (notifRef.current && !notifRef.current.contains(event.target)) {
      setShowNotifications(false); // close dropdown
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);


  const handleNotificationClick = async (id, targetTab) => {
  try {
    // update frontend immediately
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    // update in DB
    await fetch(`${apiUrl}/notifications/read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    // go to the right sidebar tab
    if (targetTab) setActiveTab(targetTab);

    // close dropdown
    setShowNotifications(false);
  } catch (err) {
    console.error("Mark notification as read error:", err);
  }
};
const deleteNotification = async (notifId) => {
  try {
    const res = await fetch(`${apiUrl}/notifications/${notifId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    }
  } catch (err) {
    console.error("Delete notification error:", err);
  }
};


  // Earnings
  const [earnings, setEarnings] = useState({
    totalIncome: 0,
    thisMonth: 0,
    lastMonth: 0,
    monthlyData: [],  // safe default so .length works
  });

  // Analytics
  const [analytics, setAnalytics] = useState({
    profileViews: 0,
    totalBookings: 0,
    repeatClients: 0,
    responseRate: 0,
  });

  // Scheduler / Appointments
  const [schedulerData, setSchedulerData] = useState({
    weeklyStats: { totalSlots: 0, bookedSlots: 0, availableSlots: 0, utilizationRate: 0 },
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
    upcomingAppointments: [],
  });


  const [profileData, setProfileData] = useState({
  profilePicture: null,
  coverPhoto: null,
  bio: "",
  address: "",
  home: "",       
  contact: "",   
  socialLinks: [],
  services: [],
  portfolio: [],
  credentials: [],
});


 const [messagesData, setMessagesData] = useState({
  conversations: [],
  messageHistory: {},
});


  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [verificationSteps, setVerificationSteps] = useState([
    { label: "Email Verification", status: "pending" },
    { label: "ID Photo Verification", status: "pending" },
    { label: "Selfie Verification", status: "pending" },
    { label: "Professional Credentials", status: "pending" },
  ]);

  // Fetch all client requests for this professional
const fetchClientRequests = async () => {
  try {
    const res = await fetch(`${apiUrl}/requests/${user.id}`);
    const data = await res.json();
    setClientRequests(data); // backend returns array of requests
  } catch (err) {
    console.error("Client requests error:", err);
  }
};

// Update request status
const updateRequestStatus = async (requestId, status) => {
  try {
    const res = await fetch(`${apiUrl}/requests/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, status }),
    });
    const data = await res.json();
    if (data.success) {
      setClientRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status } : r))
      );
    }
  } catch (err) {
    console.error("Update request error:", err);
  }
};

// Filtering logic
const getFilteredRequests = () => {
  if (requestFilter === "all") return clientRequests;
  return clientRequests.filter((req) => req.status === requestFilter);
};

// Helpers for UI colors
const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "text-yellow-500 bg-yellow-100";
    case "confirmed":
      return "text-green-500 bg-green-100";
    case "declined":
      return "text-red-500 bg-red-100";
    case "completed":
      return "text-blue-500 bg-blue-100";
    default:
      return "text-gray-500 bg-gray-100";
  }
};

const getUrgencyColor = (urgency) => {
  switch (urgency) {
    case "high":
      return "text-red-500 font-semibold";
    case "low":
      return "text-green-500";
    default:
      return "text-gray-500";
  }
};




  // Fetch Earnings
const fetchEarnings = async () => {
  try {
    const res = await fetch(`${apiUrl}/earnings/${user.id}`);
    const data = await res.json();
    setEarnings({
      totalIncome: data.totalIncome,
      thisMonth: data.thisMonth,
      lastMonth: data.lastMonth,
      monthlyData: data.monthlyData || []
    });
  } catch (err) {
    console.error("Fetch earnings error:", err);
  }
};


  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${apiUrl}/analytics/${user.id}`);
      const data = await res.json();
      setAnalytics(data); // expects { profileViews, totalBookings, repeatClients, responseRate }
    } catch (err) {
      console.error("Analytics error:", err);
    }
  };


  // Fetch schedule
  const fetchSchedule = async () => {
    try {
      const res = await fetch(`${apiUrl}/schedule/${user.id}`);
      const data = await res.json();
      setSchedulerData(data); // expects { weeklyStats, availability, upcomingAppointments }
    } catch (err) {
      console.error("Schedule error:", err);
    }
  };

  // Save updated availability
  const saveSchedule = async () => {
    try {
      await fetch(`${apiUrl}/schedule/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          availability: schedulerData.availability,
        }),
      });
    } catch (err) {
      console.error("Save schedule error:", err);
    }
  };

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${apiUrl}/appointments/${user.id}`);
      const data = await res.json();
      setSchedulerData((prev) => ({
        ...prev,
        upcomingAppointments: data,
      }));
    } catch (err) {
      console.error("Appointments error:", err);
    }
  };

  // Add new appointment
  const addAppointment = async (appointment) => {
    try {
      const res = await fetch(`${apiUrl}/appointments/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...appointment }),
      });
      const data = await res.json();
      if (data.success) {
        setSchedulerData((prev) => ({
          ...prev,
          upcomingAppointments: [...prev.upcomingAppointments, appointment],
        }));
      }
    } catch (err) {
      console.error("Add appointment error:", err);
    }
  };


  // ---------------- AUTH ----------------
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  // ---------------- PROFILE ----------------
 const fetchProfile = async () => {
  try {
    const res = await fetch(`${apiUrl}/profiles/${user.id}`);
    const data = await res.json();

    setProfileData({
      ...data,
      profilePicture: data.profile_picture, // already full URL
      coverPhoto: data.cover_photo,         // already full URL
      socialLinks: data.social_links || [], // map snake_case → camelCase
    });
  } catch (err) {
    console.error("Fetch profile error:", err);
  }
};

const saveProfile = async () => {
  try {
    const payload = {
      userId: user.id,
      bio: profileData.bio || "",
      address: profileData.address || "",
      home: profileData.home || "",
      contact: profileData.contact || "",
      socialLinks: profileData.socialLinks || [],
    };

    const res = await fetch(`${apiUrl}/profile/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      setProfileData((prev) => ({
        ...prev,
        ...payload, // ✅ update only about me fields
      }));
      setShowAboutModal(false); // ✅ close modal
    } else {
      alert("Failed to save profile");
    }
  } catch (err) {
    console.error("Save profile error:", err);
  }
};

// function for saving bio
const handleSaveBio = async () => {
  try {
    const res = await fetch(`${apiUrl}/profiles/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio: bioInput }),
    });
    const data = await res.json();
    if (data.success) {
      setProfileData((prev) => ({ ...prev, bio: bioInput }));
      setShowBioModal(false);
    }
  } catch (err) {
    console.error("Update bio error:", err);
  }
};

const handleDeleteCredential = async (id) => {
  try {
    const res = await fetch(`${apiUrl}/credentials/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (data.success) {
      setCredentials((prev) => prev.filter((cred) => cred.id !== id));
      setDeleteMessage("✅ Deleted successfully");

      // Refetch verification to update badge
      fetchVerification();

      setTimeout(() => {
        setDeleteMessage("");
        setDeleteId(null);
      }, 3000);
    } else {
      setDeleteMessage("❌ Failed to delete");
      setTimeout(() => {
        setDeleteMessage("");
        setDeleteId(null);
      }, 3000);
    }
  } catch (err) {
    console.error("Delete credential error:", err);
    setDeleteMessage("⚠️ Error deleting");
    setTimeout(() => {
      setDeleteMessage("");
      setDeleteId(null);
    }, 3000);
  }
};


  // ---------------- FILE UPLOAD ----------------
 const handleFileUpload = async (type, file) => { 
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", user.id);

  try {
    const res = await fetch(`${apiUrl}/upload/${type}`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data.success) {
      await fetchProfile(); // 🔥 reload fresh profile data
    }
  } catch (err) {
    console.error("Upload error:", err);
  }
};


  // ---------------- SERVICES ----------------
  // Fetch services on load
useEffect(() => {
  if (!user?.id) return;

  const fetchServices = async () => {
    const res = await fetch(`${apiUrl}/services/${user.id}`);
    const data = await res.json();
    if (data.success) {
      setProfileData((prev) => ({
        ...prev,
        services: data.services || [],
      }));
    }
  };

  fetchServices();
}, [user?.id]);


const addService = async () => {
  try {
    const payload = {
      userId: user.id,
      name: newService.name,
      description: newService.description,
      rate: newService.rate,
    };

    const res = await fetch(`${apiUrl}/services/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      // fetch updated list from DB
      const res2 = await fetch(`${apiUrl}/services/${user.id}`);
      const servicesData = await res2.json();

      setProfileData((prev) => ({
        ...prev,
        services: servicesData.services,
      }));

      setNewService({ name: "", description: "", rate: "" });
      setShowAddModal(false);
    } else {
      alert("Failed to save service");
    }
  } catch (err) {
    console.error("Save service error:", err);
  }
};
// ✅ Delete service immediately
const deleteService = async (id) => {
  try {
    const res = await fetch(`${apiUrl}/services/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (data.success) {
      setProfileData((prev) => ({
        ...prev,
        services: prev.services.filter((s) => s.id !== id), // remove from state
      }));
    }
  } catch (err) {
    console.error("Delete service error:", err);
  }
};

// ✅ Update only current services
const updateService = async () => {
  try {
    for (const service of profileData.services) {
      // update only if it has an ID
      if (service.id) {
        await fetch(`${apiUrl}/services/${service.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(service),
        });
      }
    }
    setShowEditModal(false); // close modal after saving
  } catch (err) {
    console.error("Update service error:", err);
  }
};




  // ---------------- MESSAGES ----------------
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${apiUrl}/messages/${user.id}`);
      const data = await res.json();
      setMessagesData(data);
    } catch (err) {
      console.error("Messages error:", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage || !selectedMessage) return;
    try {
      const res = await fetch(`${apiUrl}/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: user.id,
          to: selectedMessage.clientId,
          message: newMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessagesData((prev) => ({
          ...prev,
          messageHistory: {
            ...prev.messageHistory,
            [selectedMessage.id]: [
              ...(prev.messageHistory[selectedMessage.id] || []),
              { sender: "professional", message: newMessage, timestamp: Date.now() },
            ],
          },
        }));
        setNewMessage("");
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const getFilteredMessages = () => {
  const conversations = messagesData?.conversations || [];
  switch (messageFilter) {
    case "unread":
      return conversations.filter((m) => m.unread);
    case "active":
      return conversations.filter((m) => m.status === "active");
    case "archived":
      return conversations.filter((m) => m.status === "archived");
    default:
      return conversations;
  }
};


  // ---------------- VERIFICATION ----------------
 const fetchVerification = async () => {
  try {
    const res = await fetch(`${apiUrl}/verification/${user.id}`);
    const data = await res.json();

    setVerificationSteps([
      { label: "Email Verification", status: data.email },
      { label: "ID Photo Verification", status: data.idPhoto },
      { label: "Selfie Verification", status: data.selfie },
      { label: "Professional Credentials", status: data.credentials },
    ]);
    setVerificationStatus(data.overall || "pending");
  } catch (err) {
    console.error("Verification error:", err);
  }
};
  const allStepsComplete = verificationSteps.every((step) => step.status === "success");

const fetchCredentials = async () => {
  try {
    const res = await fetch(`${apiUrl}/credentials/${user.id}`);
    const data = await res.json();
    setCredentials(data);
  } catch (err) {
    console.error("Fetch credentials error:", err);
  }
};


// Upload credential
const handleCredentialUpload = async () => {
  if (!uploadFile) return;
  const formData = new FormData();
  formData.append("file", uploadFile);
  formData.append("userId", user.id);
  formData.append("name", credName);

  try {
    const res = await fetch(`${apiUrl}/credentials/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data.success) {
      setCredentials((prev) => [data.credential, ...prev]); // prepend so it shows first
      setUploadFile(null);
      setCredName("");
      setShowUploadModal(false); // close modal
    }
  } catch (err) {
    console.error("Credential upload error:", err);
  }
};


// Fetch ratings
const fetchRatings = async () => {
  try {
    const res = await fetch(`${apiUrl}/ratings/${user.id}`);
    const data = await res.json();
    setRatings(data); // expects [{stars, comment, client_name, created_at}]
  } catch (err) {
    console.error("Ratings error:", err);
  }
};

// Fetch professional's bank info
const fetchBankInfo = async () => {
  try {
    const res = await fetch(`${apiUrl}/bank/${user.id}`);
    const data = await res.json();
    if (data) setBankInfo(data);
  } catch (err) {
    console.error("Fetch bank info error:", err);
  }
};

// Save professional’s bank info
const saveBankInfo = async () => {
  try {
    const res = await fetch(`${apiUrl}/bank/${user.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bankInfo),
    });
    const data = await res.json();
    if (data.success) alert("Bank info saved successfully!");
  } catch (err) {
    console.error("Save bank info error:", err);
  }
};


// Fetch Transactions
const fetchTransactions = async () => {
  try {
    const res = await fetch(`${apiUrl}/payments/${user.id}`);
    const data = await res.json();

    if (Array.isArray(data)) {
      setTransactions(data);
    } else {
      console.error("Invalid data from server:", data);
      setTransactions([]); // prevent crash
    }
  } catch (err) {
    console.error("Fetch transactions error:", err);
    setTransactions([]);
  }
};




// ---------------- INITIAL FETCH ----------------
useEffect(() => {
  if (user) {
    fetchClientRequests();
    fetchEarnings();
    fetchAnalytics();
    fetchSchedule();
    fetchAppointments();
    fetchProfile();
    fetchMessages();
    fetchVerification();
    fetchCredentials();
    fetchBankInfo();
fetchTransactions();
fetchNotifications();



    // init verification row in db
    fetch(`${apiUrl}/verification/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
  }
}, [user]);


  if (!user) return null;

  return (
     <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center relative">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-stone-800">QuickJob Pro</h1>
          <span className="text-sm text-gray-600">Welcome, {user.name}</span>
        </div>

       <div className="flex items-center gap-4 relative" ref={notifRef}>
  {/* 🔔 Notification Bell */}
  <button
    onClick={() => setShowNotifications(!showNotifications)}
    className="relative p-2 hover:bg-gray-100 rounded-full"
  >
    <Bell className="w-6 h-6 text-stone-700" />
    {notifications.some((n) => !n.read) && (
      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
    )}
  </button>

  {/* Dropdown */}
  {showNotifications && (
  <div className="absolute right-20 top-14 w-80 bg-white shadow-lg rounded-lg border z-50">
    <div className="flex justify-between items-center p-3 border-b">
      <span className="font-semibold">Notifications</span>
      {notifications.some((n) => !n.read) && (
        <button
          onClick={markAllAsRead}
          className="text-xs text-blue-600 hover:underline"
        >
          Mark all as read
        </button>
      )}
    </div>
    <div className="max-h-60 overflow-y-auto">
  {notifications.length > 0 ? (
    notifications.map((notif) => (
      <div
        key={notif.id}
        className={`p-3 border-b text-sm relative ${
          notif.read ? "bg-gray-50" : "bg-blue-50"
        }`}
      >
        {/* Notification content */}
        <div
          className="cursor-pointer pr-6"
          onClick={() => handleNotificationClick(notif.id, notif.target_tab)}
        >
          <p>{notif.message}</p>
          <span className="text-xs text-gray-500">
            {new Date(notif.created_at).toLocaleString()}
          </span>
        </div>

        {/* 3-dot button */}
        <button
          onClick={() =>
            setOpenMenuId(openMenuId === notif.id ? null : notif.id)
          }
          className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200"
        >
          <MoreVertical className="w-4 h-4 text-gray-600" />
        </button>

        {/* Dropdown */}
        {openMenuId === notif.id && (
          <div className="absolute right-6 top-6 bg-white border rounded shadow-lg text-sm z-50">
            <button
              onClick={() => {
                deleteNotification(notif.id);
                setOpenMenuId(null);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    ))
  ) : (
    <p className="p-3 text-sm text-gray-500">No notifications</p>
  )}
</div>


  </div>
)}


  {/* Logout button */}
  <button
    onClick={handleLogout}
    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
  >
    Logout
  </button>
</div>

      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-lg min-h-screen p-4">
          <div className="space-y-2">
            {[
              { id: "profile", label: "Profile", icon: "👤" },
              { id: "requests", label: "Client Requests", icon: "📋" },
              { id: "earnings", label: "Earnings", icon: "💰" },
              { id: "analytics", label: "Analytics", icon: "📊" },
              { id: "schedule", label: "Schedule", icon: "📅" },
              { id: "verification", label: "Verification", icon: "✅" },
              { id: "messages", label: "Messages", icon: "💬" },
              { id: "payments", label: "Payments", icon: "💵" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-3 rounded-lg transition ${activeTab === tab.id ? "bg-stone-700 text-white" : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Profile Card with Cover + Profile Photo */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                {/* Cover Photo */}
                <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 relative">
                  {profileData.coverPhoto && (
                    <img
  src={profileData.coverPhoto || "/default-cover.png"}
                  alt="Cover"
                  onClick={() => setSelectedImage(profileData.coverPhoto)}
                  className="w-full h-full object-cover"
/>
        )}
                  <label className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-sm hover:bg-background cursor-pointer">
                    <Camera className="w-4 h-4 inline mr-2" />
                    Change Cover
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload("coverPhoto", e.target.files[0])}
                    />
                  </label>
                </div>

                {/* Profile Info */}
                <div className="p-6 relative">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Profile Picture */}
                    <div className="relative -mt-16 md:-mt-12">
                      <div className="w-24 h-24 rounded-full bg-gray-300 border-4 border-background overflow-hidden flex items-center justify-center">
                        {profileData.profilePicture ? (
                          <img
                            src={profileData.profilePicture || "/default-avatar.png"}
                            alt="Profile"
                            onClick={() => setSelectedImage(profileData.profilePicture)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl text-gray-600">👤</span>
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-background border border-border rounded-full p-2 hover:bg-accent cursor-pointer">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload("profilePicture", e.target.files[0])}
                        />
                      </label>
                    </div>
                  {selectedImage && (
  <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
    <div className="bg-white p-4 rounded-lg relative max-w-3xl w-full">
      <button
        onClick={() => setSelectedImage(null)}
        className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
      >
        ✖
      </button>
      <img
        src={selectedImage}
        alt="Preview"
        className="w-full max-h-[500px] object-contain rounded"
      />
    </div>
  </div>
)}


                    {/* Basic Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold">{user?.name}</h1>
                        {allStepsComplete ? (
                          <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Verified
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-sm">
                            <Clock className="w-4 h-4" />
                            Pending
                          </div>
                        )}
                      </div>

                      <p className="text-lg text-muted-foreground mb-2">{user?.profession}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>

                     {/* Bio Section */}
{/* Bio Section */}
<div className="mt-3">
  
  <h3 className="text-sm font-semibold text-black-600 mb-2">
    {profileData.bio || "No bio yet"}
  </h3>
  <button
    onClick={() => {
      setBioInput(profileData.bio || "");
      setShowBioModal(true);
    }}
    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
  >
    Edit Bio
  </button>
</div>



                    </div>
                  </div>
                </div>
              </div>
              {showBioModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="bg-white p-6 rounded-lg w-full max-w-md">
      <h2 className="text-lg font-semibold mb-3">Edit Bio</h2>
      <textarea
        value={bioInput}
        onChange={(e) => setBioInput(e.target.value)}
        className="w-full border rounded-lg p-2 text-sm mb-4"
        rows={4}
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowBioModal(false)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveBio} // ✅ only calls function
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}


         <>
  {/* 🔥 Credentials Section (upload + gallery) */}
  <div className="bg-card border border-border rounded-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">Professional Credentials</h3>

      {/* Upload Button */}
      <button
        onClick={() => setShowUploadModal(true)}
        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
      >
        + Upload Credential
      </button>
    </div>

    {/* ✅ Verified Badge */}
    {user.is_verified && (
      <div className="text-green-600 font-semibold text-sm mb-2 flex items-center gap-1">
        ✅ Verified
      </div>
    )}

    {/* ✅ Credentials Grid */}
    {credentials.length > 0 ? (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {credentials.map((cred) => (
          <div
            key={cred.id}
            className="relative rounded-lg border border-border flex flex-col overflow-hidden bg-white"
          >
            {/* Delete button */}
            <button
              onClick={() => setDeleteId(cred.id)}
              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs z-10"
            >
              ✖
            </button>

            {/* Image container with fixed square */}
            <div
              className="w-full aspect-square overflow-hidden cursor-pointer"
              onClick={() =>
                setSelectedCredential(`${apiUrl}${cred.file_path}`)
              }
            >
              {cred.file_path.endsWith(".pdf") ? (
                <div className="flex items-center justify-center h-full text-gray-600 text-sm font-medium bg-gray-100">
                  📄 PDF
                </div>
              ) : (
                <img
                  src={`${apiUrl}${cred.file_path}`}
                  alt={cred.name || "Credential"}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Name below */}
            <div className="bg-gray-100 text-center text-sm p-2 font-medium truncate border-t">
              {cred.name || "Untitled"}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-muted-foreground">No credentials uploaded.</p>
    )}
  </div>

  {/* ✅ Upload Modal */}
  {showUploadModal && (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        <button
          onClick={() => setShowUploadModal(false)}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
        >
          ✖
        </button>

        <h2 className="text-lg font-semibold mb-4">Upload Credential</h2>

        <div className="flex flex-col gap-3">
          {/* Credential Name */}
          <input
            type="text"
            placeholder="Credential name"
            value={credName}
            onChange={(e) => setCredName(e.target.value)}
            className="border px-3 py-2 rounded text-sm"
          />

          {/* File Input Styled */}
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setUploadFile(e.target.files[0])}
            className="border border-gray-400 rounded px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
          />

          {/* Upload Button */}
          <button
            onClick={handleCredentialUpload}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )}

  {/* ✅ Modal viewer */}
  {selectedCredential && (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg relative max-w-3xl w-full">
        <button
          onClick={() => setSelectedCredential(null)}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
        >
          ✖
        </button>
        {selectedCredential.endsWith(".pdf") ? (
          <iframe
            src={selectedCredential}
            title="PDF Credential"
            className="w-full h-[500px] rounded"
          />
        ) : (
          <img
            src={selectedCredential}
            alt="Credential"
            className="w-full max-h-[500px] object-contain rounded"
          />
        )}
      </div>
    </div>
  )}

  {/* ✅ Delete Confirmation Modal */}
  {deleteId && (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
        {deleteMessage ? (
          <p className="text-green-600 font-medium">{deleteMessage}</p>
        ) : (
          <>
            <p className="mb-4">
              Are you sure you want to delete this credential?
            </p>

            {/* Warning if it’s the last credential */}
            {credentials.filter((cred) => cred.id !== deleteId).length === 0 && (
              <p className="text-yellow-600 text-sm mb-2">
                ⚠️ Deleting this credential will remove your verified status.
              </p>
            )}

            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDeleteCredential(deleteId)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )}
</>




 {/* About Me */}
<div className="bg-card border border-border rounded-lg p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold">About Me</h3>
    <button
      onClick={() => setShowAboutModal(true)}
      className="text-primary hover:text-primary/80 text-sm"
    >
      ✏️ Edit
    </button>
  </div>
  <div className="space-y-3 text-muted-foreground">
    <p>🏠 Home: {profileData.home || "Not set"}</p>
    <p>📍 Address: {profileData.address || "Not set"}</p>
    <p>🌐 Social Media:</p>
   {profileData.socialLinks?.length > 0 ? (
  <ul className="list-disc list-inside">
    {profileData.socialLinks.map((s, i) => (
      <li key={i}>
        <a href={s.url} target="_blank" className="text-blue-600 hover:underline">
          {s.platform}
        </a>
      </li>
    ))}
  </ul>
) : (
  <p className="ml-4">Not set</p>
)}

    <p>📞 Contact: {profileData.contact || "Not set"}</p>
  </div>
</div>

      {showAboutModal && (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg w-full max-w-lg relative">
      <button
        onClick={() => setShowAboutModal(false)}
        className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
      >
        ✖
      </button>
      <h2 className="text-xl font-semibold mb-4">Edit About Me</h2>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Home"
          className="w-full border border-border rounded-lg p-2"
          value={profileData.home || ""}
          onChange={(e) => setProfileData({ ...profileData, home: e.target.value })}
        />
        <input
          type="text"
          placeholder="Address"
          className="w-full border border-border rounded-lg p-2"
          value={profileData.address || ""}
          onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
        />
        <input
          type="text"
          placeholder="Contact"
          className="w-full border border-border rounded-lg p-2"
          value={profileData.contact || ""}
          onChange={(e) => setProfileData({ ...profileData, contact: e.target.value })}
        />

        {/* Dynamic Social Links */}
        <div>
          <h3 className="font-medium mb-2">Social Links</h3>
          {profileData.socialLinks.map((s, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Platform (e.g., Facebook)"
                className="flex-1 border border-border rounded-lg p-2"
                value={s.platform}
                onChange={(e) => {
                  const updated = [...profileData.socialLinks];
                  updated[i].platform = e.target.value;
                  setProfileData({ ...profileData, socialLinks: updated });
                }}
              />
              <input
                type="text"
                placeholder="URL"
                className="flex-1 border border-border rounded-lg p-2"
                value={s.url}
                onChange={(e) => {
                  const updated = [...profileData.socialLinks];
                  updated[i].url = e.target.value;
                  setProfileData({ ...profileData, socialLinks: updated });
                }}
              />
              <button
                onClick={() => {
                  const updated = profileData.socialLinks.filter((_, idx) => idx !== i);
                  setProfileData({ ...profileData, socialLinks: updated });
                }}
                className="px-2 bg-red-500 text-white rounded-lg"
              >
                ✖
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              setProfileData({
                ...profileData,
                socialLinks: [...profileData.socialLinks, { platform: "", url: "" }],
              })
            }
            className="text-sm text-green-600 hover:underline"
          >
            + Add Social Link
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={() => setShowAboutModal(false)}
          className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
  onClick={saveProfile}
  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
>
  Save
</button>

      </div>
    </div>
  </div>
)}
              

 {/* Services Offered */}
<div className="bg-card border border-border rounded-lg p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold">Services Offered</h3>
    <div className="flex gap-2">
      <button
        className="text-primary hover:text-primary/80 text-sm"
        onClick={() => setShowAddModal(true)}
      >
        + Add Service
      </button>

      {profileData.services.length > 0 && (
        <button
          className="text-primary hover:text-primary/80 text-sm"
          onClick={() => setShowEditModal(true)}
        >
          Edit Services
        </button>
      )}
    </div>
  </div>

  <div className="grid gap-4">
    {profileData.services.map((service, index) => (
      <div
        key={index}
        className="border border-border rounded-lg p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">{service.name}</h4>
          <div className="text-right">
            <p className="font-semibold">${service.rate}</p>
            <p className="text-sm text-muted-foreground">{service.duration}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{service.description}</p>
      </div>
    ))}
  </div>
</div>

{/* ========================= MODALS ========================= */}

{/* Add Service Modal */}
{showAddModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Add New Service</h3>
      <input
        type="text"
        placeholder="Service Name"
        value={newService.name}
        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
        className="w-full border p-2 rounded mb-2"
      />
      <textarea
        placeholder="Description"
        value={newService.description}
        onChange={(e) =>
          setNewService({ ...newService, description: e.target.value })
        }
        className="w-full border p-2 rounded mb-2"
      />
      <input
        type="number"
        placeholder="Rate"
        value={newService.rate}
        onChange={(e) => setNewService({ ...newService, rate: e.target.value })}
        className="w-full border p-2 rounded mb-4"
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowAddModal(false)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={addService}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

{/* Edit Services Modal */}
{showEditModal && (
   <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Edit Services</h3>

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {profileData.services.map((service, index) => (
          <div
            key={service.id || index}
            className="border border-gray-300 rounded-lg p-4 flex items-start justify-between gap-4"
          >
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={service.name}
                onChange={(e) => {
                  const updated = [...profileData.services];
                  updated[index].name = e.target.value;
                  setProfileData({ ...profileData, services: updated });
                }}
                className="w-full border p-2 rounded"
              />
              <textarea
                value={service.description}
                onChange={(e) => {
                  const updated = [...profileData.services];
                  updated[index].description = e.target.value;
                  setProfileData({ ...profileData, services: updated });
                }}
                className="w-full border p-2 rounded"
              />
              <input
                type="number"
                value={service.rate}
                onChange={(e) => {
                  const updated = [...profileData.services];
                  updated[index].rate = e.target.value;
                  setProfileData({ ...profileData, services: updated });
                }}
                className="w-full border p-2 rounded"
              />
            </div>

            {/* Delete button per service */}
            <button
              onClick={() => deleteService(service.id)}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 self-start"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Cancel + Save Buttons */}
      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={() => setShowEditModal(false)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={updateService}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

              {/* Ratings & Reviews */}
<div className="bg-card border border-border rounded-lg p-6">
  <h3 className="text-lg font-semibold mb-4">Ratings & Reviews</h3>
  {ratings.length > 0 ? (
    <div className="space-y-4">
      {ratings.map((r, i) => (
        <div key={i} className="border-b border-border pb-3">
          {/* Stars */}
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, starIndex) => (
              <span
                key={starIndex}
                className={`text-lg ${
                  starIndex < r.stars ? "text-yellow-500" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">{r.comment}</p>
          <p className="text-xs text-gray-500 mt-1">
            — {r.client_name} · {new Date(r.created_at).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-muted-foreground">No ratings yet.</p>
  )}
</div>

            </div>
          )}

{activeTab === "requests" && (
  <div className="space-y-6">
    {/* Header with filters */}
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold text-stone-800">Client Requests</h2>
        <p className="text-gray-500 text-sm">Manage booking requests from your clients</p>
      </div>
      <div className="flex gap-3">
        <select
          value={requestFilter}
          onChange={(e) => setRequestFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-600 text-sm"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="declined">Declined</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>

    {/* Requests List */}
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6">
        {getFilteredRequests().length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">No Client Requests</h3>
            <p className="text-gray-500">Client requests and booking inquiries will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {getFilteredRequests().map((req) => (
              <div
  key={request.id}
  className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
>
  <div>
    <h4 className="font-bold text-stone-800">{request.client}</h4>
    <p className="text-gray-600">{request.service}</p>
    <p className="text-gray-500 text-sm">
      {request.date} • {request.time}
    </p>
    <p className="text-gray-700 mt-2">{request.message}</p>
  </div>

  <div className="flex items-center gap-3">
    <span
      className={`px-3 py-1 rounded-full text-sm ${
        request.status === "pending"
          ? "bg-yellow-100 text-yellow-800"
          : request.status === "confirmed"
          ? "bg-green-100 text-green-800"
          : request.status === "completed"
          ? "bg-blue-100 text-blue-800"
          : "bg-red-100 text-red-800"
      }`}
    >
      {request.status}
    </span>

    {request.status === "pending" && (
      <div className="flex gap-2">
        <button
          onClick={() => updateRequestStatus(request.id, "confirmed")}
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
        >
          Accept
        </button>
        <button
          onClick={() => updateRequestStatus(request.id, "declined")}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
        >
          Decline
        </button>
      </div>
    )}
  </div>
</div>

            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}


          {/* Earnings Overview */}
          {activeTab === "earnings" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-stone-800">Earnings Overview</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                  <h4 className="text-lg font-bold text-stone-800 mb-2">Total Income</h4>
                  <p className="text-3xl font-bold text-green-600">₱{(earnings.totalIncome || 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                  <h4 className="text-lg font-bold text-stone-800 mb-2">This Month</h4>
                  <p className="text-3xl font-bold text-blue-600">₱{(earnings.totalIncome || 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                  <h4 className="text-lg font-bold text-stone-800 mb-2">Last Month</h4>
                  <p className="text-3xl font-bold text-gray-600">₱{(earnings.thisMonth || 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-xl">
                <h4 className="text-lg font-bold text-stone-800 mb-4">Monthly Earnings Chart</h4>
                <div className="flex items-end gap-4 h-48">
                  {earnings.monthlyData.map((amount, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="bg-stone-600 w-full rounded-t"
                        style={{ height: `${(amount / Math.max(...earnings.monthlyData)) * 100}%` }}
                      ></div>
                      <p className="text-sm text-gray-600 mt-2">Month {index + 1}</p>
                      <p className="text-xs text-gray-500">₱{amount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Performance Analytics */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-stone-800">Performance Analytics</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-xl text-center">
                  <div className="text-3xl mb-2">👁️</div>
                  <h4 className="text-lg font-bold text-stone-800">Profile Views</h4>
                  <p className="text-2xl font-bold text-blue-600">{analytics.profileViews}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-xl text-center">
                  <div className="text-3xl mb-2">📅</div>
                  <h4 className="text-lg font-bold text-stone-800">Total Bookings</h4>
                  <p className="text-2xl font-bold text-green-600">{analytics.totalBookings}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-xl text-center">
                  <div className="text-3xl mb-2">🔄</div>
                  <h4 className="text-lg font-bold text-stone-800">Repeat Clients</h4>
                  <p className="text-2xl font-bold text-purple-600">{analytics.repeatClients}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-xl text-center">
                  <div className="text-3xl mb-2">⚡</div>
                  <h4 className="text-lg font-bold text-stone-800">Response Rate</h4>
                  <p className="text-2xl font-bold text-amber-600">{analytics.responseRate}%</p>
                </div>
              </div>
            </div>
          )}


        {activeTab === "schedule" && (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Availability Scheduler</h2>
        <p className="text-muted-foreground">
          Manage your available time slots and appointments
        </p>
      </div>
      <div className="flex gap-3">
        <select
          value={availabilityMode}
          onChange={(e) => setAvailabilityMode(e.target.value)}
          className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="weekly">Weekly View</option>
          <option value="monthly">Monthly View</option>
        </select>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
          Set Bulk Availability
        </button>
      </div>
    </div>

    {/* Schedule Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Slots</p>
            <p className="text-2xl font-bold">
              {schedulerData?.weeklyStats?.totalSlots || 0}
            </p>
          </div>
          <span className="text-primary text-2xl">📅</span>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Booked</p>
            <p className="text-2xl font-bold text-blue-500">
              {schedulerData?.weeklyStats?.bookedSlots || 0}
            </p>
          </div>
          <span className="text-blue-500 text-2xl">✔️</span>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-2xl font-bold text-green-500">
              {schedulerData?.weeklyStats?.availableSlots || 0}
            </p>
          </div>
          <span className="text-green-500 text-2xl">⏰</span>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Utilization</p>
            <p className="text-2xl font-bold">
              {schedulerData?.weeklyStats?.utilizationRate || 0}%
            </p>
          </div>
          <span className="text-primary text-2xl">📊</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Weekly Schedule */}
      <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Weekly Schedule</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500/20 border border-green-500 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted rounded"></div>
              <span>Unavailable</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(schedulerData?.availability || {}).map(([day, slots]) => (
            <div key={day} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium capitalize">{day}</h4>
                <span className="text-sm text-muted-foreground">
                  {slots.filter((slot) => slot.available).length} slots available
                </span>
              </div>

              {slots.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No availability set
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {slots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => toggleTimeSlot(day, slot.time)}
                      className={`p-2 rounded-lg text-xs font-medium border transition-colors ${getSlotColor(
                        getSlotStatus(slot)
                      )}`}
                      disabled={slot.booked}
                    >
                      <div>{slot.time}</div>
                      {slot.booked && (
                        <div className="text-xs opacity-75 mt-1">
                          {slot.client?.split(" ")[0]}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Upcoming Appointments */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
            <span className="text-sm text-muted-foreground">
              {(schedulerData?.upcomingAppointments || []).length} scheduled
            </span>
          </div>
          <div className="space-y-3">
            {(schedulerData?.upcomingAppointments || []).map((appointment) => (
              <div
                key={appointment.id}
                className="border border-border rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{appointment.client}</h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {appointment.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {appointment.service}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {appointment.date} at {appointment.time}
                  </span>
                  <span>{appointment.duration}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      appointment.type === "video-call"
                        ? "bg-blue-500/10 text-blue-500"
                        : "bg-green-500/10 text-green-500"
                    }`}
                  >
                    {appointment.type === "video-call"
                      ? "📹 Video"
                      : "🏢 In-person"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 text-sm">
              Block Time Off
            </button>
            <button className="w-full border border-border py-2 px-4 rounded-lg hover:bg-accent text-sm">
              Copy Last Week
            </button>
            <button className="w-full border border-border py-2 px-4 rounded-lg hover:bg-accent text-sm">
              Set Recurring Hours
            </button>
            <button className="w-full border border-border py-2 px-4 rounded-lg hover:bg-accent text-sm">
              Export Schedule
            </button>
          </div>
        </div>

        {/* Schedule Settings */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Schedule Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Buffer Time
              </label>
              <select className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                <option>15 minutes</option>
                <option>30 minutes</option>
                <option>45 minutes</option>
                <option>60 minutes</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Advance Booking
              </label>
              <select className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                <option>1 day</option>
                <option>3 days</option>
                <option>1 week</option>
                <option>2 weeks</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="autoConfirm" className="rounded" />
              <label htmlFor="autoConfirm" className="text-sm">
                Auto-confirm bookings
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}



          {/* Verification Sidebar */}
{activeTab === "verification" && (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-stone-800">Verification Status</h2>

    <div className="bg-white p-6 rounded-2xl shadow-xl">
      {/* Status Overview */}
      {verificationStatus === "success" && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">✅</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-800">Fully Verified</h3>
            <p className="text-gray-600">Your account is completely verified</p>
          </div>
        </div>
      )}

      {verificationStatus === "pending" && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">⏳</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-yellow-800">Verification Pending</h3>
            <p className="text-gray-600">
              Some steps are still under review. Please wait for admin approval.
            </p>
          </div>
        </div>
      )}

      {verificationStatus === "failed" && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-800">Verification Failed</h3>
            <p className="text-gray-600">
              One or more of your credentials were rejected. Please re-upload valid documents.
            </p>
          </div>
        </div>
      )}

      {/* Steps with Right-Side Status */}
      <div className="space-y-4">
        {verificationSteps.map((step, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 rounded-lg border"
          >
            {/* Left side label */}
            <span className="font-medium">{step.label}</span>

            {/* Right side status */}
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold
                ${step.status === "success" ? "bg-green-100 text-green-700" :
                  step.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"}`}
            >
              {step.status === "success" && "Success"}
              {step.status === "pending" && "Pending"}
              {step.status === "failed" && "Rejected"}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
)}



         {/* Messages Only */}
{activeTab === "messages" && (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Messages</h2>
        <p className="text-muted-foreground">
          Communicate with clients efficiently
        </p>
      </div>
      <div className="flex gap-3">
        <select
          value={messageFilter}
          onChange={(e) => setMessageFilter(e.target.value)}
          className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Messages</option>
          <option value="unread">Unread</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>
    </div>

    <div className="space-y-6">
      {/* Message Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Messages</p>
              <p className="text-2xl font-bold">
                {messagesData?.conversations?.length || 0}
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unread</p>
              <p className="text-2xl font-bold text-blue-500">
                {messagesData?.conversations?.filter((msg) => msg.unread).length || 0}
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Response Rate</p>
              <p className="text-2xl font-bold text-green-500">98%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Conversations</h3>
        </div>
        <div className="divide-y divide-border">
          {getFilteredMessages()?.length ? (
  getFilteredMessages().map((conversation) => (
    <div
      key={conversation.id}
      onClick={() => setSelectedMessage(conversation)}
      className={`p-6 hover:bg-accent/50 transition-colors cursor-pointer ${
        selectedMessage?.id === conversation.id ? "bg-accent/50" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-medium text-primary">
            {conversation.avatar}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium">{conversation.client}</h4>
            <div className="flex items-center gap-2">
              {conversation.unread && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
              <span className="text-sm text-muted-foreground">
                {new Date(conversation.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {conversation.lastMessage}
          </p>
        </div>
      </div>
    </div>
  ))
) : (
  <div className="p-6 text-center text-muted-foreground">
    No conversations found.
  </div>
)}

        </div>
      </div>

      {/* Selected Conversation Thread */}
      {selectedMessage && (
        <div className="bg-card border border-border rounded-lg">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {selectedMessage.avatar}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedMessage.client}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedMessage.status === "active" ? "Active" : "Archived"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedMessage(null)}
              className="p-2 hover:bg-accent rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 max-h-96 overflow-y-auto space-y-4">
            {messagesData?.messageHistory?.[selectedMessage.id]?.map((message, i) => (
              <div
                key={i}
                className={`flex ${
                  message.sender === "professional" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === "professional"
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-foreground"
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Send Message Box */}
          <div className="p-6 border-t border-border flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
)}


{activeTab === "payments" && (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-stone-800">Payment Transactions</h2>

    {/* Payout Method Selector */}
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Payout Method</h3>

      <button
        onClick={() => setShowPaymentModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Select Payment Method
      </button>
    </div>

    {/* Transaction History */}
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Amount Received</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan="3" className="p-4 text-center text-gray-500">
                No transactions yet.
              </td>
            </tr>
          ) : (
            transactions.map((t) => (
              <tr key={t.id}>
                <td className="p-2 border">
                  {new Date(t.created_at).toLocaleDateString()}
                </td>
                <td className="p-2 border">₱{t.net_amount}</td>
                <td className="p-2 border">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      t.status === "released"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* Modal for Payment Methods */}
{showPaymentModal && (
  <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
      {/* Close button */}
      <button
        onClick={() => setShowPaymentModal(false)}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
      >
        ✖
      </button>

      <h3 className="text-lg font-semibold mb-4">Select Payout Method</h3>

      {/* GCash */}
      <div className="mb-4">
        <button
          onClick={() =>
            setBankInfo({
              ...bankInfo,
              payoutMethod:
                bankInfo.payoutMethod === "GCash" ? "" : "GCash", // ✅ toggle
            })
          }
          className={`w-full text-left p-2 rounded border ${
            bankInfo.payoutMethod === "GCash"
              ? "bg-blue-100 border-blue-400"
              : "border-gray-300"
          }`}
        >
          GCash
        </button>
        {bankInfo.payoutMethod === "GCash" && (
          <div className="mt-2 space-y-2">
            <input
              type="text"
              placeholder="GCash Number"
              value={bankInfo.accountNumber || ""}
              onChange={(e) =>
                setBankInfo({ ...bankInfo, accountNumber: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Account Holder Name"
              value={bankInfo.accountName || ""}
              onChange={(e) =>
                setBankInfo({ ...bankInfo, accountName: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
          </div>
        )}
      </div>

      {/* PayMaya */}
      <div className="mb-4">
        <button
          onClick={() =>
            setBankInfo({
              ...bankInfo,
              payoutMethod:
                bankInfo.payoutMethod === "PayMaya" ? "" : "PayMaya", // ✅ toggle
            })
          }
          className={`w-full text-left p-2 rounded border ${
            bankInfo.payoutMethod === "PayMaya"
              ? "bg-blue-100 border-blue-400"
              : "border-gray-300"
          }`}
        >
          PayMaya
        </button>
        {bankInfo.payoutMethod === "PayMaya" && (
          <div className="mt-2 space-y-2">
            <input
              type="text"
              placeholder="PayMaya Number"
              value={bankInfo.accountNumber || ""}
              onChange={(e) =>
                setBankInfo({ ...bankInfo, accountNumber: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Account Holder Name"
              value={bankInfo.accountName || ""}
              onChange={(e) =>
                setBankInfo({ ...bankInfo, accountName: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
          </div>
        )}
      </div>

      {/* PayPal */}
      <div className="mb-4">
        <button
          onClick={() =>
            setBankInfo({
              ...bankInfo,
              payoutMethod:
                bankInfo.payoutMethod === "PayPal" ? "" : "PayPal", // ✅ toggle
            })
          }
          className={`w-full text-left p-2 rounded border ${
            bankInfo.payoutMethod === "PayPal"
              ? "bg-blue-100 border-blue-400"
              : "border-gray-300"
          }`}
        >
          PayPal
        </button>
        {bankInfo.payoutMethod === "PayPal" && (
          <div className="mt-2 space-y-2">
            <input
              type="email"
              placeholder="PayPal Email"
              value={bankInfo.accountNumber || ""}
              onChange={(e) =>
                setBankInfo({ ...bankInfo, accountNumber: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
          </div>
        )}
      </div>

      {/* Bank Transfer */}
      <div className="mb-4">
        <button
          onClick={() =>
            setBankInfo({
              ...bankInfo,
              payoutMethod:
                bankInfo.payoutMethod === "Bank Transfer" ? "" : "Bank Transfer", // ✅ toggle
            })
          }
          className={`w-full text-left p-2 rounded border ${
            bankInfo.payoutMethod === "Bank Transfer"
              ? "bg-blue-100 border-blue-400"
              : "border-gray-300"
          }`}
        >
          Bank Transfer
        </button>
        {bankInfo.payoutMethod === "Bank Transfer" && (
          <div className="mt-2 space-y-2">
            <input
              type="text"
              placeholder="Bank Name"
              value={bankInfo.bankName || ""}
              onChange={(e) =>
                setBankInfo({ ...bankInfo, bankName: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Account Number"
              value={bankInfo.accountNumber || ""}
              onChange={(e) =>
                setBankInfo({ ...bankInfo, accountNumber: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Account Holder Name"
              value={bankInfo.accountName || ""}
              onChange={(e) =>
                setBankInfo({ ...bankInfo, accountName: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={() => {
          saveBankInfo();
          setShowPaymentModal(false);
        }}
        className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Save Method
      </button>
    </div>
  </div>
)}
  </div>
)}


        </main>
      </div>
    </div>
  )
}

export default ProfDashboard
