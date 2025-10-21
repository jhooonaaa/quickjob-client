import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  MoreVertical,
  LogOut,
  User,
  Search,
  Calendar,
  DollarSign,
  Star,
  Heart,
  MessageSquare,
  HelpCircle,
  Camera,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ClientDashboard() {
  const apiUrl = import.meta.env.VITE_ENDPOINT_URL;
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const [openMenuId, setOpenMenuId] = useState(null);
const [professionals, setProfessionals] = useState([]);
const [selectedProfessional, setSelectedProfessional] = useState(null);
const [professionalDetails, setProfessionalDetails] = useState(null);
// 🧾 Booking states
const [showBookingModal, setShowBookingModal] = useState(false);
const [selectedService, setSelectedService] = useState("");
const [selectedDate, setSelectedDate] = useState("");
const [selectedTime, setSelectedTime] = useState("");
const [selectedUrgency, setSelectedUrgency] = useState("normal");
const [bookingMessage, setBookingMessage] = useState("");
const [bookingMessageText, setBookingMessageText] = useState("");  
const [bookingMessageType, setBookingMessageType] = useState("");  
// 🧾 Client booking requests (for Bookings tab)
const [clientRequests, setClientRequests] = useState([]);
const [selectedBooking, setSelectedBooking] = useState(null);
const [selectedStars, setSelectedStars] = useState(0);
const [feedbackComment, setFeedbackComment] = useState("");
const [bookingFilter, setBookingFilter] = useState("all");
const [savedProfessionals, setSavedProfessionals] = useState([]);
const [favorites, setFavorites] = useState([]);
const [searchTerm, setSearchTerm] = useState("");
const [messageFilter, setMessageFilter] = useState("all");
const [messagesData, setMessagesData] = useState({ conversations: {}, messageHistory: {} });
const [selectedMessage, setSelectedMessage] = useState(null);
const [newMessage, setNewMessage] = useState("");
const [floatingChat, setFloatingChat] = useState(null);
const [isChatOpen, setIsChatOpen] = useState(false);
const [chatMessages, setChatMessages] = useState([]);
const [chatInput, setChatInput] = useState("");
const [openMenu, setOpenMenu] = useState(null);
const chatRef = useRef(null);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deleteTarget, setDeleteTarget] = useState(null);





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

// ✅ Fetch client’s bookings/requests
const fetchClientRequests = async () => {
  try {
    const res = await fetch(`${apiUrl}/requests/client/${user.id}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setClientRequests(data);
    }
  } catch (err) {
    console.error("Fetch client requests error:", err);
  }
};

// ✅ Handle submit booking (separate function)
const handleBookingSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(`${apiUrl}/requests/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: user.id,
        professional_id: selectedProfessional.id,
        service: selectedService,
        date: selectedDate,
        time: selectedTime,
        urgency: selectedUrgency,
        message: bookingMessage,
        status: "pending",
      }),
    });

    const data = await res.json();

    if (data.success) {
      // ✅ show success message
      setBookingMessageType("success");
      setBookingMessageText("✅ Booking request sent successfully!");
      fetchClientRequests();

      // optional: clear form inputs
      setSelectedService("");
      setSelectedDate("");
      setSelectedTime("");
      setSelectedUrgency("normal");
      setBookingMessage("");

      // ✅ auto-close modal after 3 seconds
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingMessageType(null);
        setBookingMessageText("");
      }, 3000);
    } else {
      setBookingMessageType("error");
      setBookingMessageText("⚠️ Failed to send booking request. Please try again.");
    }
  } catch (err) {
    console.error("Booking request error:", err);
    setBookingMessageType("error");
    setBookingMessageText("❌ Something went wrong while sending the booking request.");
  }
};

useEffect(() => {
  const fetchProfessionals = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/professionals?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      setProfessionals(data);
    } catch (err) {
      console.error("Error fetching professionals:", err);
    }
  };

  // Fetch professionals after a small delay to avoid too many requests
  const delay = setTimeout(fetchProfessionals, 400);
  return () => clearTimeout(delay);
}, [searchTerm]);


  const [profileData, setProfileData] = useState({
  profilePicture: "",
  coverPhoto: "",
  address: "",
  contact: "",
  socialLinks: [], 
});

const handleFileUpload = async (type, file) => {
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", user.id);

  const res = await fetch(`${apiUrl}/upload/${type}`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();

  if (data.success) {
    setProfileData(prev => ({
      ...prev,
      [type === "profilePicture" ? "profilePicture" : "coverPhoto"]: `${apiUrl}${data.filePath}`,
    }));
  }
};

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
      bio: "", // client doesn’t have bio input, but backend expects it
      address: profileData.address || "",
      home: "", // client doesn’t use home field
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
        address: payload.address,
        contact: payload.contact,
        socialLinks: payload.socialLinks,
      }));
      setShowAboutModal(false);
    } else {
      alert("Failed to save profile");
    }
  } catch (err) {
    console.error("Save profile error:", err);
    alert("Error saving profile");
  }
};

const toggleSaveProfessional = async (professionalId) => {
  try {
    // 🔍 Check if already saved using either "professional_id" (local) or "id" (from DB)
    const isAlreadySaved = savedProfessionals.some(
      (s) => s.professional_id === professionalId || s.id === professionalId
    );

    if (isAlreadySaved) {
      // ❌ Remove
      await fetch(`${apiUrl}/saved-professionals/remove`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: user.id, professionalId }),
      });

      setSavedProfessionals((prev) =>
        prev.filter(
          (s) =>
            s.professional_id !== professionalId && s.id !== professionalId
        )
      );
    } else {
      // ❤️ Add
      await fetch(`${apiUrl}/saved-professionals/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: user.id, professionalId }),
      });

      setSavedProfessionals((prev) => [
        ...prev,
        { professional_id: professionalId },
      ]);
    }

    // 🔁 Refresh saved list so sidebar updates
    fetchSavedProfessionals();
  } catch (err) {
    console.error("Toggle save professional error:", err);
  }
};


const fetchProfessionals = async () => {
  try {
    const res = await fetch(`${apiUrl}/api/professionals`);
    const data = await res.json();
    setProfessionals(data);
  } catch (err) {
    console.error("Fetch professionals error:", err);
  }
};

const fetchSavedProfessionals = async () => {
  try {
    const res = await fetch(`${apiUrl}/saved-professionals/${user.id}`);
    const data = await res.json();

    if (Array.isArray(data)) {
      setSavedProfessionals(data); 
      setFavorites(data);
    }
  } catch (err) {
    console.error("Fetch saved professionals error:", err);
  }
};

// Fetch when tab opens
useEffect(() => {
  if (activeTab === "favorites") fetchSavedProfessionals();
}, [activeTab]);


const openProfessionalProfile = async (prof) => {
  setSelectedProfessional(prof);
  try {
    const res = await fetch(`${apiUrl}/api/professionals/${prof.id}`);
    const data = await res.json();
    setProfessionalDetails(data);
  } catch (err) {
    console.error("Error loading professional profile:", err);
  }
};

const handleFeedbackSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch(`${apiUrl}/ratings/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        request_id: selectedBooking.id,
        professional_id: selectedBooking.professional_id,
        client_id: user.id,
        stars: selectedStars,
        comment: feedbackComment,
      }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("✅ Feedback submitted!");
      setSelectedBooking(null);
      setSelectedStars(0);
      setFeedbackComment("");
      fetchClientRequests();
    }
  } catch (err) {
    console.error("Submit feedback error:", err);
    toast.error("❌ Failed to submit feedback.");
  }
};

// 🗑️ Open delete modal
const confirmDeleteConversation = (id) => {
  setDeleteTarget(id);
  setShowDeleteModal(true);
};

const handleDeleteConversation = async () => {
  if (!deleteTarget) return;

  try {
    await fetch(`${apiUrl}/conversations/${deleteTarget}/client`, {
      method: "DELETE",
    });

    // remove from conversation list
    setMessagesData((prev) => ({
      ...prev,
      conversations: prev.conversations.filter((c) => c.id !== deleteTarget),
    }));

    // ✅ Clear floating chat if it's the same conversation
    if (floatingChat?.conversation_id === deleteTarget) {
      setFloatingChat(null);
      setIsChatOpen(false);
      setChatMessages([]);
    }

    // ✅ Clear sidebar chat selection
    if (selectedMessage?.id === deleteTarget) {
      setSelectedMessage(null);
    }

    // ✅ Refresh updated conversations
    fetchConversations();

    setShowDeleteModal(false);
    setDeleteTarget(null);
  } catch (err) {
    console.error("Delete conversation error:", err);
  }
};



// 📦 Archive
const handleArchiveConversation = async (id) => {
  try {
    const res = await fetch(`${apiUrl}/conversations/${id}/archive`, {
      method: "PUT",
    });

    if (!res.ok) throw new Error("Failed to archive conversation");

    setMessagesData((prev) => ({
      ...prev,
      conversations: prev.conversations.map((c) =>
        c.id === id ? { ...c, is_archived: true } : c
      ),
    }));

    setOpenMenu(null);
  } catch (err) {
    console.error("Archive conversation error:", err);
  }
};

// ♻️ Unarchive
const handleUnarchiveConversation = async (id) => {
  try {
    const res = await fetch(`${apiUrl}/conversations/${id}/unarchive`, {
      method: "PUT",
    });

    if (!res.ok) throw new Error("Failed to unarchive conversation");

    setMessagesData((prev) => ({
      ...prev,
      conversations: prev.conversations.map((c) =>
        c.id === id ? { ...c, is_archived: false } : c
      ),
    }));

    setOpenMenu(null);
  } catch (err) {
    console.error("Unarchive conversation error:", err);
  }
};


// MESSAGES
const fetchConversations = async () => {
  if (!user?.id) return;

  try {
    const res = await fetch(`${apiUrl}/conversations/${user.id}`);
    const data = await res.json();

    const normalized = (data || []).map((c) => ({
  ...c,
  client_unread: c.client_unread ?? false,
  professional_unread: c.professional_unread ?? false,
  client_avatar:
    c.client_avatar || c.client_profile_picture || c.profile_picture || null,
  professional_avatar:
    c.professional_avatar || c.professional_profile_picture || c.profile_picture || null,
  last_message: c.last_message ?? "",
  updated_at: c.updated_at ?? new Date().toISOString(),
}));


    setMessagesData((prev) => ({
      ...prev,
      conversations: normalized,
    }));
  } catch (err) {
    console.error("Fetch conversations error:", err);
  }
};

const handleOpenMessage = async (conversation) => {
  if (!conversation?.id) return;

  try {
    // ✅ Fetch messages first
    await fetchChatMessages(conversation.id);

    // mark as read (client side + backend)
try {
  await fetch(`${apiUrl}/conversations/${conversation.id}/mark-read`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "client" }),
  });

  setMessagesData((prev) => ({
    ...prev,
    conversations: prev.conversations.map((c) =>
      c.id === conversation.id ? { ...c, client_unread: false } : c
    ),
  }));
} catch (err) {
  console.error("Failed to mark as read:", err);
}


    // ✅ Set the selected conversation
    setSelectedMessage({
      ...conversation,
      professional_name: conversation.professional_name,
      professional_avatar:
        conversation.professional_avatar || conversation.profile_picture,
    });

    // ✅ Smooth scroll automatically
    setTimeout(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, 100);

  } catch (err) {
    console.error("Open message error:", err);
  }
};






const getAvatarUrl = (selectedMessage) => {
  if (!selectedMessage) return "/default-avatar.png";

  const rawAvatar =
    selectedMessage.professional_avatar ||
    selectedMessage.professional_profile_picture ||
    "/default-avatar.png";

  if (rawAvatar.startsWith("http")) return rawAvatar;
  if (rawAvatar.startsWith("/uploads/")) return `${apiUrl}${rawAvatar}`;
  return `${apiUrl}/uploads/${rawAvatar}`;
};


useEffect(() => {
  if (user) fetchConversations();
}, [user]);


const getFilteredMessages = () => {
  const allMessages = Array.isArray(messagesData?.conversations)
    ? messagesData.conversations
    : []; // ✅ always fallback to an array

  // Filter by message type
  let filtered = allMessages.filter((m) => {
    switch (messageFilter) {
      case "archived":
        return m.is_archived;
      case "unread":
        return m.unread && !m.is_archived;
      default:
        return !m.is_archived;
    }
  });

  // Filter by search term
  if (searchTerm.trim() !== "") {
    filtered = filtered.filter((m) => {
      const isClient = user.role === "client";
      const nameToCheck = isClient ? m.professional_name : m.client_name;
      return nameToCheck?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }

  return filtered;
};


const sendMessage = async () => {
  if (!newMessage.trim() || !selectedMessage) return;

  const conversationId = selectedMessage.id;

  // ✅ Add locally right away (optimistic UI)
  const localMsg = {
    message: newMessage,
    sender: user.role,
    timestamp: new Date().toISOString(),
  };

  setMessagesData((prev) => ({
    ...prev,
    messageHistory: {
      ...prev.messageHistory,
      [conversationId]: [
        ...(prev.messageHistory[conversationId] || []),
        localMsg,
      ],
    },
  }));

  setNewMessage("");

  try {
    const res = await fetch(`${apiUrl}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_id: conversationId,
        sender_id: user.id,
        message: newMessage,
      }),
    });

    const data = await res.json();

    if (data.success && data.message) {
      // ✅ update sidebar instantly
      setMessagesData((prev) => {
        const updatedConvos = prev.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, last_message: newMessage, updated_at: new Date().toISOString() }
            : c
        );
        updatedConvos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        return { ...prev, conversations: updatedConvos };
      });
    }
  } catch (err) {
    console.error("Failed to send message:", err);
  }
};


//message button
const handleMessageProfessional = async (professional) => {
  if (!professional?.id) return;

  try {
    const res = await fetch(`${apiUrl}/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        professional_id: professional.id,
        client_id: user.id, // client is sending message
      }),
    });
    const data = await res.json();

    if (data.success) {
      const avatar =
        professional.profile_picture ||
        professional.avatar ||
        professional.profile_picture_url ||
        (professional.avatar_path ? `${apiUrl}${professional.avatar_path}` : null);

      setFloatingChat({
        conversation_id: data.conversation.id,
        client: professional.name || professional.full_name || professional.username,
        avatar,
        id: professional.id,
      });

      setIsChatOpen(true);
      await fetchChatMessages(data.conversation.id);
      await fetchConversations();
    }
  } catch (err) {
    console.error("Open message error:", err);
  }
};

const sendChatMessage = async () => {
  if (!chatInput.trim() || !floatingChat?.conversation_id) return;

  const msg = {
    conversation_id: floatingChat.conversation_id,
    sender_id: user.id,
    message: chatInput,
  };

  // ✅ Add message instantly to floating chat
  const localMsg = {
    message: chatInput,
    sender: user.role,
    timestamp: new Date().toISOString(),
  };
  setChatMessages((prev) => [...prev, localMsg]);
  setChatInput("");

  try {
    const res = await fetch(`${apiUrl}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg),
    });
    const data = await res.json();

    if (data.success) {
      // ✅ Instantly update sidebar last message
      setMessagesData((prev) => {
        const updatedConvos = prev.conversations.map((c) =>
          c.id === floatingChat.conversation_id
            ? { ...c, last_message: msg.message, updated_at: new Date().toISOString() }
            : c
        );
        updatedConvos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        return { ...prev, conversations: updatedConvos };
      });
    }
  } catch (err) {
    console.error("Send chat message error:", err);
  }
};


const fetchChatMessages = async (conversation_id) => {
  if (!conversation_id) return;

  try {
    const res = await fetch(`${apiUrl}/messages/${conversation_id}/${user.id}`);
    const data = await res.json();

    if (Array.isArray(data)) {
      // ✅ Normalize messages
      const normalizedMessages = data.map((m) => ({
        message: m.message ?? "",
        sender:
          m.sender_id === user.id
            ? user.role // current user
            : user.role === "client"
            ? "professional"
            : "client",
        timestamp: m.created_at ?? m.timestamp ?? "",
      }));

      // ✅ Update floating chat messages (for popup chat)
      setChatMessages(normalizedMessages);

      // ✅ Update main messagesData history (for sidebar/main chat)
      setMessagesData((prev) => ({
        ...prev,
        messageHistory: {
          ...prev.messageHistory,
          [conversation_id]: normalizedMessages,
        },
      }));
    } else {
      console.error("Unexpected messages format:", data);
    }
  } catch (err) {
    console.error("Fetch messages error:", err);
  }
};



// Auto-scroll chat on new messages
useEffect(() => {
  const chatBox = chatRef.current;
  if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
}, [chatMessages]);

// 🧩 Auto-refresh chat + sidebar in sync (every 2 seconds)
useEffect(() => {
  if (!user) return;

  const interval = setInterval(() => {
    fetchConversations(); // refresh sidebar

    if (floatingChat?.conversation_id) {
      fetchChatMessages(floatingChat.conversation_id); // floating chat refresh
    } else if (selectedMessage?.id) {
      fetchChatMessages(selectedMessage.id); // main chat refresh
    }
  }, 2000); // every 2 seconds (adjust if needed)

  return () => clearInterval(interval);
}, [user, floatingChat?.conversation_id, selectedMessage?.id]);



  useEffect(() => {
  const data = localStorage.getItem("clientUser");
  if (!data) navigate("/");
  else setUser(JSON.parse(data));
}, [navigate]);

const handleLogout = () => {
  localStorage.removeItem("clientUser");
  navigate("/");
};

const [bookings, setBookings] = useState({
  pending: [],
  confirmed: [],
  declined: [],
  completed: [],
});



 
  const payments = [
    {
      id: 1,
      professional: "Maria Cruz",
      amount: "₱500",
      status: "Sent to Admin",
    },
    {
      id: 2,
      professional: "John Santos",
      amount: "₱700",
      status: "Paid to Professional",
    },
  ];
  const reviews = [
    { id: 1, prof: "Maria Cruz", rating: 5, feedback: "Very professional!" },
  ];
  const faqs = [
    { q: "How to cancel a booking?", a: "Go to Bookings → Cancel option." },
    {
      q: "Refund Policy",
      a: "Refunds processed within 3–5 business days by admin.",
    },
  ];

  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target))
        setShowNotifications(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
  if (user?.id) {
    fetchProfile(); 
    fetchClientRequests();
    fetchSavedProfessionals();
    fetchProfessionals();
    fetchNotifications();

  }
}, [user]);


  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow p-4 flex justify-between items-center relative">
        <h1 className="text-xl font-bold">QuickJob Client Dashboard</h1>
        <div className="flex items-center gap-4" ref={notifRef}>
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
    <div className="absolute right-20 top-12 w-80 bg-white shadow-lg rounded-lg border z-50">
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
              className={`p-3 border-b text-sm relative transition-colors ${
                notif.read
                  ? "bg-gray-50 hover:bg-gray-100"
                  : "bg-blue-50 hover:bg-blue-100"
              }`}
            >
              {/* Content */}
              <div
                className="cursor-pointer pr-6"
                onClick={() =>
                  handleNotificationClick(notif.id, notif.targetTab)
                }
              >
                <p>{notif.message}</p>
                <span className="text-xs text-gray-500">
                  {new Date(notif.created_at).toLocaleString()}
                </span>
              </div>

              {/* ⋮ 3-dot menu */}
              <button
                onClick={() =>
                  setOpenMenuId(openMenuId === notif.id ? null : notif.id)
                }
                className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>

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
</div>


          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600"
          >
            <LogOut className="inline w-4 h-4 mr-1" />
            Logout
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="flex">
        {/* SIDEBAR */}
        <aside className="w-64 bg-white shadow-md min-h-screen p-4 space-y-2">
          {[
            { id: "profile", label: "Profile", icon: <User /> },
            { id: "find", label: "Find Professionals", icon: <Search /> },
            { id: "bookings", label: "Bookings & Requests", icon: <Calendar /> },
            { id: "payments", label: "Payments & Transactions", icon: <DollarSign /> },
            { id: "favorites", label: "Saved Professionals", icon: <Heart /> },
            { id: "messages", label: "Messages", icon: <MessageSquare /> },
            { id: "reviews", label: "Ratings & Feedback", icon: <Star /> },
            { id: "support", label: "Help & Support", icon: <HelpCircle /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 w-full p-3 rounded-md transition ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* 1. PROFILE */}
          {activeTab === "profile" && (
  <div className="space-y-6">
    {/* Profile Card */}
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {/* Cover Photo */}
      <div className="h-40 bg-gradient-to-r from-blue-200 to-blue-100 relative">
        {profileData.coverPhoto && (
          <img
            src={profileData.coverPhoto}
            alt="Cover"
            onClick={() => setSelectedImage(profileData.coverPhoto)}
            className="w-full h-full object-cover"
          />
        )}
        <label className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm border rounded-lg px-3 py-1 text-sm hover:bg-white cursor-pointer">
          <Camera className="w-4 h-4 inline mr-2" />
             Change Cover
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              handleFileUpload("coverPhoto", e.target.files[0])
            }
          />
        </label>
      </div>

      {/* Profile Info */}
      <div className="p-6 relative">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Picture */}
          <div className="relative -mt-20 md:-mt-16">
            <div className="w-32 h-32 rounded-full bg-gray-300 border-4 border-white overflow-hidden flex items-center justify-center">
              {profileData.profilePicture ? (
                <img
                  src={profileData.profilePicture}
                  alt="Profile"
                  onClick={() => setSelectedImage(profileData.profilePicture)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl text-gray-600">👤</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-white border border-gray-300 rounded-full p-2 hover:bg-gray-100 cursor-pointer">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleFileUpload("profilePicture", e.target.files[0])
                }
              />
            </label>
          </div>

          {/* Name & Email */}
          <div className="flex-1 mt-4 md:mt-0">
            <h1 className="text-2xl font-bold text-gray-800">
              {user?.name || "Your Name"}
            </h1>
            <p className="text-gray-600">{user?.email || "your@email.com"}</p>

          </div>
        </div>
      </div>
    </div>

     {/* About Me Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">About Me</h3>
              <button
                onClick={() => setShowAboutModal(true)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ✏️ Edit
              </button>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>📍 Address: {profileData.address || "Not set"}</p>
              <p>📞 Contact: {profileData.contact || "Not set"}</p>
              <p>🌐 Social Media:</p>
              {profileData.socialLinks?.length > 0 ? (
                <ul className="list-disc list-inside">
                  {profileData.socialLinks.map((s, i) => (
                    <li key={i}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {s.platform}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="ml-4 text-gray-500">Not set</p>
              )}
            </div>
          </div>

          {/* Edit Modal */}
          {showAboutModal && (
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-lg relative shadow-lg">
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
                    placeholder="Address"
                    className="w-full border border-gray-300 rounded-lg p-2"
                    value={profileData.address || ""}
                    onChange={(e) =>
                      setProfileData({ ...profileData, address: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Contact"
                    className="w-full border border-gray-300 rounded-lg p-2"
                    value={profileData.contact || ""}
                    onChange={(e) =>
                      setProfileData({ ...profileData, contact: e.target.value })
                    }
                  />

                  {/* Social Links */}
                  <div>
                    <h3 className="font-medium mb-2">Social Links</h3>
                    {profileData.socialLinks.map((s, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Platform (e.g., Facebook)"
                          className="flex-1 border border-gray-300 rounded-lg p-2"
                          value={s.platform}
                          onChange={(e) => {
                            const updated = [...profileData.socialLinks];
                            updated[i].platform = e.target.value;
                            setProfileData({
                              ...profileData,
                              socialLinks: updated,
                            });
                          }}
                        />
                        <input
                          type="text"
                          placeholder="URL"
                          className="flex-1 border border-gray-300 rounded-lg p-2"
                          value={s.url}
                          onChange={(e) => {
                            const updated = [...profileData.socialLinks];
                            updated[i].url = e.target.value;
                            setProfileData({
                              ...profileData,
                              socialLinks: updated,
                            });
                          }}
                        />
                        <button
                          onClick={() => {
                            const updated = profileData.socialLinks.filter(
                              (_, idx) => idx !== i
                            );
                            setProfileData({
                              ...profileData,
                              socialLinks: updated,
                            });
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
                          socialLinks: [
                            ...profileData.socialLinks,
                            { platform: "", url: "" },
                          ],
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

    {/* Optional Image Preview */}
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
  </div>
)}



          {/* 2. FIND PROFESSIONAL */}
        {activeTab === "find" && (
  <div className="p-4">
    {/* ===================== CHECK IF VIEWING PROFILE ===================== */}
    {!selectedProfessional ? (
      <>
        {/* FIND PROFESSIONAL LIST VIEW */}
        <h2 className="text-2xl font-semibold mb-4">Find Professionals</h2>

        {/* SEARCH + FILTER */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by name, service, or location..."
            className="border p-2 rounded w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select className="border p-2 rounded">
            <option>Sort by</option>
            <option>Rating</option>
            <option>Price</option>
            <option>Availability</option>
          </select>
        </div>
     {/* Card layout*/}
       <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {professionals.length > 0 ? (
        professionals.map((p) => {
        const isSaved = savedProfessionals.some(
  (s) => s.id === p.id || s.professional_id === p.id
);

          return (
            <div
              key={p.id}
              className="relative bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* ❤️ Save button */}
              <button
                onClick={() => toggleSaveProfessional(p.id)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white hover:bg-gray-100 shadow-sm transition"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isSaved ? "fill-red-500 text-red-500" : "text-gray-400"
                  }`}
                />
              </button>

              {/* Profile info */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={p.profile_picture || "/default-avatar.png"}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover border"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{p.name}</h3>

                  {/* ⭐ Ratings */}
                  <div className="flex items-center gap-1 mt-1">
                    {p.avg_rating ? (
                      <>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(p.avg_rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">
                          ({p.review_count})
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">No ratings yet</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio & address */}
              <p className="text-sm text-gray-500 mb-2">
                {p.bio?.slice(0, 40) || "No bio yet"}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                📍 {p.address || "No address provided"}
              </p>

              {/* View button */}
              <button
                onClick={() => openProfessionalProfile(p)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition"
              >
                View Profile
              </button>
            </div>
          );
        })
      ) : (
        <p className="text-gray-500 text-sm">No professionals found.</p>
      )}
    </div>
      </>
    ) : (
      /* ===================== PROFILE VIEW ===================== */
      professionalDetails && (
  <div className="space-y-8 max-w-4xl mx-auto">

    {/* 🔙 Back Button */}
    <button
      onClick={() => {
        setSelectedProfessional(null);
        setProfessionalDetails(null);
      }}
      className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
    >
      ← Back to Professionals
    </button>

    {/* 🌟 PROFILE HEADER (WITH REQUEST BUTTON & MODAL) */}
<div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
  {/* Cover Photo */}
  <div className="relative h-40 bg-gray-100">
    <img
      src={professionalDetails?.profile?.cover_photo || "/default-cover.png"}
      alt="Cover"
      className="w-full h-full object-cover"
    />
  </div>

  {/* Main Info Row */}
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 relative">
    {/* LEFT SIDE - Profile Picture + Info */}
    <div className="flex items-start gap-6">
      {/* Profile Picture */}
      <div className="flex-shrink-0 -mt-16 md:-mt-20 ml-2">
        <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
          <img
            src={professionalDetails?.profile?.profile_picture || "/default-avatar.png"}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Text Info */}
      <div className="flex-1 pt-4 md:pt-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          {professionalDetails?.profile?.name || "Unnamed"}
          {professionalDetails?.profile?.is_verified && (
            <span className="text-green-700 bg-green-100 px-2 py-1 rounded-full text-sm font-medium">
              ✅ Verified
            </span>
          )}
        </h1>

        <p className="text-gray-500 text-sm mt-1">
          {professionalDetails?.profile?.email}
        </p>

        <p className="mt-3 text-gray-700 leading-relaxed max-w-xl">
          {professionalDetails?.profile?.bio || "Nobio yet."}
        </p>
      </div>
    </div>

    {/* RIGHT SIDE - Request Booking + Message Button */}
<div className="mt-2 md:mt-0 flex gap-2">
  {/* Request Booking Button */}
  <button
    onClick={() => setShowBookingModal(true)}
    className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 shadow-sm text-sm font-medium transition"
  >
    📅 Request Booking
  </button>

  {/* Message Button */}
  <button
    onClick={() => handleMessageProfessional(professionalDetails?.profile)}
    className="bg-green-600 text-white px-4 py-1.5 rounded-md hover:bg-green-700 shadow-sm text-sm font-medium transition"
  >
    💬 Message
  </button>
</div>

  </div>

  {/* 💬 Floating Chat */}
{isChatOpen && floatingChat && (
  <div className="fixed bottom-6 right-6 z-50 w-80 bg-white border border-gray-300 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
    <div className="flex items-center justify-between bg-blue-600 text-white p-3">
      <div className="flex items-center gap-3">
        {floatingChat.avatar ? (
          <img
            src={floatingChat.avatar}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover border-2 border-white"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center font-semibold">
            {floatingChat.client?.charAt(0) || "?"}
          </div>
        )}
        <div>
          <p className="font-semibold text-sm leading-none">{floatingChat.client}</p>
        </div>
      </div>
      <button
        onClick={() => {
          setIsChatOpen(false);
          setFloatingChat(null);
        }}
        className="text-white hover:text-gray-200"
      >
        ✕
      </button>
    </div>

    <div ref={chatRef} className="chat-messages-container p-4 h-64 overflow-y-auto bg-gray-50 space-y-3">
      {chatMessages.map((msg, i) => {
  const isMine = msg.sender === user.role; // ✅ FIXED
  return (
    <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
          isMine ? "bg-blue-600 text-white" : "bg-white border text-gray-800"
        }`}
      >
        {msg.message}
        <div className="text-[10px] mt-1 opacity-70 text-right">
          {msg.timestamp
            ? new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </div>
      </div>
    </div>
  );
})}

    </div>

    <div className="flex items-center gap-2 p-3 border-t bg-white">
      <input
        type="text"
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 border border-gray-300 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
      />
      <button
        onClick={sendChatMessage}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-3 py-2 text-sm"
      >
        ➤
      </button>
    </div>
  </div>
)}


  {/* 🧾 BOOKING MODAL */}
  {showBookingModal && (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
        <button
          onClick={() => setShowBookingModal(false)}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
        >
          ✖
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Request Booking
        </h2>

        <form onSubmit={handleBookingSubmit} className="space-y-4">
{bookingMessageText && (
  <div
    className={`p-2 rounded-md text-sm mb-2 ${
      bookingMessageType === "success"
        ? "bg-green-100 text-green-700 border border-green-300"
        : "bg-red-100 text-red-700 border border-red-300"
    }`}
  >
    {bookingMessageText}
  </div>
)}

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Select Service
    </label>
    <select
      required
      value={selectedService}
      onChange={(e) => setSelectedService(e.target.value)}
      className="w-full border rounded-lg p-2"
    >
      <option value="">-- Choose Service --</option>
      {professionalDetails?.services?.map((s) => (
        <option key={s.id} value={s.name}>
          {s.name} (₱{s.rate})
        </option>
      ))}
    </select>
  </div>

  {/* Date */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Select Date
    </label>
    <input
      type="date"
      required
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
      className="w-full border rounded-lg p-2"
    />
  </div>

  {/* Time */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Select Time
    </label>
    <input
      type="time"
      required
      value={selectedTime}
      onChange={(e) => setSelectedTime(e.target.value)}
      className="w-full border rounded-lg p-2"
    />
  </div>

  {/* Urgency */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Urgency
    </label>
    <select
      value={selectedUrgency}
      onChange={(e) => setSelectedUrgency(e.target.value)}
      className="w-full border rounded-lg p-2"
    >
      <option value="normal">Normal</option>
      <option value="high">High</option>
      <option value="low">Low</option>
    </select>
  </div>

  {/* Message */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Message / Notes
    </label>
    <textarea
      value={bookingMessage}
      onChange={(e) => setBookingMessage(e.target.value)}
      rows="3"
      placeholder="Add any details about your request..."
      className="w-full border rounded-lg p-2 resize-none"
    ></textarea>
  </div>

  <button
    type="submit"
    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
  >
    Submit Booking Request
  </button>
</form>
      </div>
    </div>
  )}
</div>




    {/* 🏠 ABOUT SECTION */}
    <div className="bg-white border border-gray-200 rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold mb-4">About</h3>
      <div className="space-y-2 text-gray-700">
        <p>🏠 Home: {professionalDetails?.profile?.home || "Not set"}</p>
        <p>📍 Address: {professionalDetails?.profile?.address || "Not set"}</p>
        <p>📞 Contact: {professionalDetails?.profile?.contact || "Not set"}</p>

        <div>
          <p>🌐 Social Links:</p>
          {professionalDetails?.profile?.social_links?.length > 0 ? (
            <ul className="list-disc list-inside text-blue-600 text-sm">
              {professionalDetails.profile.social_links.map((s, i) => (
                <li key={i}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {s.platform}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ml-4 text-gray-500">Not set</p>
          )}
        </div>
      </div>
    </div>

    {/* 💼 SERVICES */}
    <div className="bg-white border border-gray-200 rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Services Offered</h3>
      {professionalDetails?.services?.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {professionalDetails.services.map((s) => (
            <div
              key={s.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow transition"
            >
              <h4 className="font-semibold text-gray-800">{s.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{s.description}</p>
              <p className="font-semibold text-blue-600 mt-2">₱{s.rate}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No services available.</p>
      )}
    </div>

    {/* 🪪 CREDENTIALS */}
    <div className="bg-white border border-gray-200 rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Credentials</h3>
      {professionalDetails?.credentials?.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {professionalDetails.credentials.map((c) => (
            <img
              key={c.id}
              src={c.file_path}
              alt={c.name}
              className="w-full h-32 object-cover rounded-lg border border-gray-200"
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No credentials uploaded.</p>
      )}
    </div>

    {/* ⭐ RATINGS */}
    <div className="bg-white border border-gray-200 rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Ratings & Reviews</h3>
      {professionalDetails?.ratings?.length > 0 ? (
        <div className="space-y-4">
          {professionalDetails.ratings.map((r, i) => (
            <div key={i} className="border-b pb-3">
              <div className="flex gap-1 mb-1">
                {[...Array(5)].map((_, idx) => (
                  <span
                    key={idx}
                    className={`${
                      idx < r.stars ? "text-yellow-400" : "text-gray-300"
                    } text-lg`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-gray-700 text-sm">{r.comment}</p>
              <p className="text-xs text-gray-500 mt-1">
                — {r.client_name} · {new Date(r.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No reviews yet.</p>
      )}
    </div>

    
    </div>
  
)
    )}
  </div>
)}



         
{/* 3. BOOKINGS */}
{activeTab === "bookings" && (
  <div className="p-6">
    <h2 className="text-3xl font-bold text-stone-800 mb-6">Bookings & Requests</h2>

    {/* 🟢 Top Filter Tabs */}
    <div className="flex flex-wrap gap-3 mb-6 border-b border-gray-200 pb-3">
      {["all", "pending", "confirmed", "declined", "completed"].map((status) => (
        <button
          key={status}
          onClick={() => setBookingFilter(status)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            bookingFilter === status
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {status === "all"
            ? "All"
            : status.charAt(0).toUpperCase() + status.slice(1)}
        </button>
      ))}
    </div>

    {/* 🧾 Filtered Bookings */}
    <div className="space-y-4">
      {clientRequests
        .filter((r) =>
          bookingFilter === "all" ? true : r.status === bookingFilter
        )
        .map((b) => (
          <div
            key={b.id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col md:flex-row justify-between items-start md:items-center"
          >
            {/* Left Info */}
            <div>
              <h4 className="text-lg font-semibold text-stone-800">
                {b.professional_name}
              </h4>
              <p className="text-stone-600 text-sm font-medium">{b.service}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(b.date).toLocaleDateString()} •{" "}
                {new Date(`1970-01-01T${b.time}`).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              {b.message && (
                <p className="text-sm text-gray-700 mt-2 border-l-4 border-gray-100 pl-2">
                  “{b.message}”
                </p>
              )}
            </div>

            {/* Right: Status + Feedback */}
            <div className="flex flex-col items-end mt-4 md:mt-0 gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                  b.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : b.status === "confirmed"
                    ? "bg-green-100 text-green-700"
                    : b.status === "declined"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {b.status}
              </span>

              {b.status === "completed" && (
                <button
                  onClick={() => setSelectedBooking(b)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1"
                >
                  Leave Feedback
                </button>
              )}
            </div>
          </div>
        ))}

      {clientRequests.filter((r) =>
        bookingFilter === "all" ? true : r.status === bookingFilter
      ).length === 0 && (
        <p className="text-sm text-gray-500 italic text-center py-6">
          No {bookingFilter === "all" ? "" : bookingFilter} bookings found.
        </p>
      )}
    </div>

    {/* ⭐ Feedback Modal */}
    {selectedBooking && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fadeIn">
          <h3 className="text-xl font-semibold text-stone-800 mb-4">
            Leave Feedback for{" "}
            <span className="text-blue-600">{selectedBooking.professional_name}</span>
          </h3>

         <form onSubmit={handleFeedbackSubmit}>
  {/* Rating */}
  <div className="mb-4">
    <p className="text-sm font-medium mb-2">Rating:</p>
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => setSelectedStars(star)}
          className={`text-2xl transition ${
            selectedStars >= star
              ? "text-yellow-400 hover:text-yellow-500"
              : "text-gray-300 hover:text-gray-400"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  </div>

  {/* Feedback */}
  <div className="mb-5">
    <p className="text-sm font-medium mb-2">Feedback:</p>
    <textarea
      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      rows="3"
      placeholder="Write your feedback..."
      value={feedbackComment}
      onChange={(e) => setFeedbackComment(e.target.value)}
      required
    />
  </div>

  {/* Buttons */}
  <div className="flex justify-end gap-3">
    <button
      type="button"
      onClick={() => setSelectedBooking(null)}
      className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
    >
      Submit
    </button>
  </div>
</form>

        </div>
      </div>
    )}
  </div>
)}


          {/* 4. PAYMENTS */}
          {activeTab === "payments" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                Payment & Transactions
              </h2>
              <div className="space-y-3">
                {payments.map((p) => (
                  <div key={p.id} className="bg-white p-3 rounded shadow flex justify-between">
                    <span>
                      {p.professional} – <strong>{p.amount}</strong>
                    </span>
                    <span
                      className={`text-sm ${
                        p.status.includes("Admin")
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

         {/* 5. FAVORITES */}
{activeTab === "favorites" && (
  <div className="p-4">
    <h2 className="text-2xl font-semibold mb-6">Saved Professionals</h2>

    {favorites.length ? (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((pro) => (
          <div
            key={pro.id}
            className="bg-white rounded-xl shadow p-4 flex flex-col items-start relative hover:shadow-md transition"
          >
            <button
  onClick={() => toggleSaveProfessional(pro.id)}
  className="absolute top-3 right-3 p-2 rounded-full bg-white hover:bg-gray-100 shadow-sm transition"
>
  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
</button>
            {/* Profile Info */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={pro.profile_picture || "/default-avatar.png"}
                alt={pro.name}
                className="w-12 h-12 rounded-full object-cover border"
              />
              <div>
                <h3 className="font-semibold text-gray-800">{pro.name}</h3>
                <p className="text-sm text-gray-500">{pro.bio?.slice(0, 40) || "No bio yet"}</p>
              </div>
            </div>

            {/* Address + Rating */}
            <p className="text-sm text-gray-600 mb-2">📍 {pro.address || "No address"}</p>
            <div className="flex items-center gap-1 mb-3">
              <span className="text-yellow-400 text-lg">★</span>
              <span className="text-gray-700 text-sm">
                {pro.avg_rating} ({pro.review_count} reviews)
              </span>
            </div>

            <button
              onClick={() => openProfessionalProfile(pro)}
              className="mt-auto w-full bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition"
            >
              View Profile
            </button>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 text-sm">No saved professionals yet.</p>
    )}
  </div>
)}


        {activeTab === "messages" && (
  <div className="space-y-6">
    {!selectedMessage ? (
      <>
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Messages</h2>
            <p className="text-muted-foreground">Chat with professionals</p>
          </div>

          {/* Search + Filter */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search professionals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-3 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <select
              value={messageFilter}
              onChange={(e) => setMessageFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Conversations List */}
        <div className="bg-card border border-border rounded-lg mt-6">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold">
              {messageFilter === "archived" ? "Archived Conversations" : "Conversations"}
            </h3>
          </div>

          <div className="divide-y divide-border">
            {getFilteredMessages()?.length > 0 ? (
              getFilteredMessages().map((convo) => {
                const displayName = convo.professional_name;
                const displayAvatar =
                  convo.professional_avatar ||
                  convo.professional_profile_picture ||
                  convo.professional_id_photo ||
                  "/default-avatar.png";

                const avatarSrc = displayAvatar.startsWith("http")
                  ? displayAvatar
                  : displayAvatar.startsWith("/uploads/")
                  ? `${apiUrl}${displayAvatar}`
                  : `${apiUrl}/uploads/${displayAvatar}`;

                return (
                  <div
  key={convo.id}
  className={`relative p-6 transition-colors cursor-pointer
    ${selectedMessage?.id === convo.id ? "bg-blue-50" : ""}
    ${convo.client_unread ? "bg-blue-300 hover:bg-blue-400" : "hover:bg-accent/50"}
  `}

                    onClick={() => {
                      handleOpenMessage(convo);
                
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={avatarSrc}
                          alt={displayName}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => (e.target.src = "/default-avatar.png")}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{displayName}</h4>
                          <span className="text-sm text-muted-foreground">
                            {convo.updated_at
                              ? new Date(convo.updated_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {convo.last_message || "No messages yet"}
                        </p>
                      </div>

                      {/* 3-dot menu (Archive/Delete) */}
                      <div
                        className="relative flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            setOpenMenu((prev) => (prev === convo.id ? null : convo.id))
                          }
                          className="p-2 rounded-full hover:bg-gray-100 text-lg font-bold leading-none"
                        >
                          ...
                        </button>

                        {openMenu === convo.id && (
                          <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-lg shadow-md z-10">
                            {messageFilter !== "archived" ? (
                              <>
                                <button
                                  onClick={() => confirmDeleteConversation(convo.id)}
                                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => handleArchiveConversation(convo.id)}
                                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  Archive
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleUnarchiveConversation(convo.id)}
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                              >
                                Unarchive
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                No {messageFilter === "archived" ? "archived" : ""} conversations found.
              </div>
            )}
          </div>
        </div>
{showDeleteModal && (
  <div className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center border border-gray-200">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">
        Delete Conversation?
      </h3>
      <p className="text-gray-600 mb-6 text-sm">
        This will permanently remove all messages in this conversation.
      </p>

      <div className="flex justify-center gap-3">
        <button
          onClick={() => setShowDeleteModal(false)}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleDeleteConversation}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
      </>
    ) : (
      /* Chat Window */
      <div className="bg-white border border-gray-300 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[500px]">
        <div className="flex items-center justify-between bg-blue-600 text-white p-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedMessage(null)}
              className="text-white text-lg font-bold hover:text-gray-200"
            >
              ←
            </button>
            {selectedMessage && (
              <>
                <img
  src={getAvatarUrl(selectedMessage)}
  alt={selectedMessage.professional_name || "Professional"}
  className="w-8 h-8 rounded-full object-cover border-2 border-white"
  onError={(e) => (e.target.src = "/default-avatar.png")}
/>

                <div>
                  <p className="font-semibold text-sm leading-none">
                    {selectedMessage.professional_name}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <div
          ref={chatRef}
          className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3 chat-messages-container"
        >
          {messagesData?.messageHistory?.[selectedMessage.id]?.length ? (
            messagesData.messageHistory[selectedMessage.id].map((message, i) => {
              const isMine = message.sender === user.role;
              return (
                <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                      isMine ? "bg-blue-600 text-white" : "bg-white border text-gray-800"
                    }`}
                  >
                    {message.message}
                    <div className="text-[10px] mt-1 opacity-70 text-right">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-sm text-gray-500">No messages yet.</p>
          )}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 p-3 border-t bg-white flex-shrink-0">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-3 py-2 text-sm"
          >
            ➤
          </button>
        </div>
      </div>
    )}
  </div>
)}


          {/* 8. REVIEWS */}
          {activeTab === "reviews" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Ratings & Feedback</h2>
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-white p-3 rounded shadow">
                    <p>
                      <strong>{r.prof}</strong> – ⭐ {r.rating}
                    </p>
                    <p className="text-sm text-gray-600">{r.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. SUPPORT */}
          {activeTab === "support" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Help & Support</h2>
              <div className="bg-white p-4 rounded shadow space-y-3">
                <h3 className="font-semibold">Contact Admin / Report an Issue</h3>
                <textarea
                  className="border p-2 w-full rounded"
                  placeholder="Describe your issue..."
                ></textarea>
                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                  Send
                </button>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">FAQs & Policies</h3>
                <div className="space-y-2">
                  {faqs.map((f, i) => (
                    <div key={i} className="bg-white p-3 rounded shadow">
                      <p className="font-semibold">{f.q}</p>
                      <p className="text-sm text-gray-600">{f.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
