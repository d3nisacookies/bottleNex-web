import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLandingPage } from "../context/LandingPageContext";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import "../css/AdminDashboard.css";

export default function AdminDashboard() {
  const { currentUser, logout } = useAuth();
  const { faqContent, homeContent, updateFaqContent, updateHomeContent } = useLandingPage();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);

  // Landing page editing states
  const [editingFaq, setEditingFaq] = useState(false);
  const [editingHome, setEditingHome] = useState(false);
  const [faqForm, setFaqForm] = useState([]);
  const [homeForm, setHomeForm] = useState({});
  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  });

  // Load users and feedback data
  useEffect(() => {
    loadUsers();
    loadFeedback();
  }, []);

  // Initialize forms when content loads
  useEffect(() => {
    if (faqContent.length > 0) {
      setFaqForm([...faqContent]);
    }
  }, [faqContent]);

  useEffect(() => {
    if (homeContent.features) {
      setHomeForm({ ...homeContent });
    }
  }, [homeContent]);

  // Create dummy feedback data if none exists
  const createDummyFeedback = async () => {
    console.log("Creating dummy feedback data...");
    const dummyFeedback = [
      {
        reviewer: "Evan Rachel",
        date: "June 10, 2025",
        rating: 4,
        category: "Traffic Bottleneck Identification",
        text: "BottleneX helped me spot traffic jams before I got stuck. The predictive features are really accurate!",
        flagged: false
      },
      {
        reviewer: "Louis Hoffman",
        date: "June 11, 2025",
        rating: 5,
        category: "Route Optimization",
        text: "The app always finds the fastest route for my commute. Saves me 15 minutes every day!",
        flagged: false
      },
      {
        reviewer: "Thomas Middleditch",
        date: "June 12, 2025",
        rating: 3,
        category: "Real-Time Traffic Updates",
        text: "Live updates are accurate and timely. Could use more frequent updates though.",
        flagged: false
      },
      {
        reviewer: "Sarah Johnson",
        date: "June 13, 2025",
        rating: 5,
        category: "User Interface",
        text: "The interface is intuitive and easy to use. Love the clean design!",
        flagged: false
      },
      {
        reviewer: "Mike Chen",
        date: "June 14, 2025",
        rating: 2,
        category: "Battery Usage",
        text: "The app drains my battery too quickly. Needs optimization.",
        flagged: true
      }
    ];

    try {
      for (const feedback of dummyFeedback) {
        await addDoc(collection(db, "feedback"), {
          ...feedback,
          timestamp: Date.now(),
          createdAt: serverTimestamp()
        });
      }
      console.log("Dummy feedback created successfully");
      loadFeedback(); // Reload feedback
    } catch (error) {
      console.error("Error creating dummy feedback:", error);
    }
  };

  const loadFeedback = async () => {
    console.log("Loading feedback...");
    setLoading(true);
    try {
      const feedbackCollection = collection(db, "feedback");
      const feedbackSnapshot = await getDocs(feedbackCollection);
      const feedbackList = feedbackSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("Loaded feedback:", feedbackList);
      setFeedback(feedbackList);
      
      // If no feedback exists, create dummy data
      if (feedbackList.length === 0) {
        console.log("No feedback found, creating dummy data...");
        await createDummyFeedback();
      }
    } catch (error) {
      console.error("Error loading feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, status) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        status: status,
        updatedAt: serverTimestamp()
      });
      loadUsers(); // Reload users
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const updateUserPremium = async (userId, isPremium) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        userType: isPremium ? "Premium" : "Free",
        updatedAt: serverTimestamp()
      });
      loadUsers(); // Reload users
    } catch (error) {
      console.error("Error updating user premium status:", error);
    }
  };

  const flagFeedback = async (feedbackId, flagged) => {
    try {
      await updateDoc(doc(db, "feedback", feedbackId), {
        flagged: flagged,
        flaggedAt: serverTimestamp()
      });
      loadFeedback(); // Reload feedback
    } catch (error) {
      console.error("Error flagging feedback:", error);
    }
  };

  const createAdminUser = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminForm.email,
        adminForm.password
      );
      
      await setDoc(doc(db, "users", userCredential.user.uid), {
        firstName: adminForm.firstName,
        lastName: adminForm.lastName,
        email: adminForm.email,
        signUpDate: serverTimestamp(),
        status: true,
        userType: "Admin",
        lastLogin: serverTimestamp(),
        role: "admin"
      });
      
      alert("Admin user created successfully!");
      setAdminForm({ email: "", password: "", firstName: "", lastName: "" });
      loadUsers();
    } catch (error) {
      console.error("Error creating admin user:", error);
      alert(`Error creating admin user: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleFaqEdit = () => {
    setEditingFaq(true);
    setFaqForm([...faqContent]);
  };

  const handleFaqSave = async () => {
    const success = await updateFaqContent(faqForm);
    if (success) {
      setEditingFaq(false);
      alert("FAQ content updated successfully!");
    } else {
      alert("Failed to update FAQ content");
    }
  };

  const handleFaqCancel = () => {
    setEditingFaq(false);
    setFaqForm([...faqContent]);
  };

  const addFaqItem = () => {
    const newId = Math.max(...faqForm.map(item => item.id), 0) + 1;
    setFaqForm([...faqForm, { id: newId, question: "", answer: "" }]);
  };

  const removeFaqItem = (index) => {
    setFaqForm(faqForm.filter((_, i) => i !== index));
  };

  const updateFaqItem = (index, field, value) => {
    const updatedFaq = [...faqForm];
    updatedFaq[index] = { ...updatedFaq[index], [field]: value };
    setFaqForm(updatedFaq);
  };

  const handleHomeEdit = () => {
    setEditingHome(true);
    setHomeForm({ ...homeContent });
  };

  const handleHomeSave = async () => {
    const success = await updateHomeContent(homeForm);
    if (success) {
      setEditingHome(false);
      alert("Home content updated successfully!");
    } else {
      alert("Failed to update Home content");
    }
  };

  const handleHomeCancel = () => {
    setEditingHome(false);
    setHomeForm({ ...homeContent });
  };

  const addHomeFeature = () => {
    const newId = Math.max(...homeForm.features.map(f => f.id), 0) + 1;
    const newFeatures = [...homeForm.features, { id: newId, title: "", description: "" }];
    setHomeForm({ ...homeForm, features: newFeatures });
  };

  const removeHomeFeature = (index) => {
    const newFeatures = homeForm.features.filter((_, i) => i !== index);
    setHomeForm({ ...homeForm, features: newFeatures });
  };

  const updateHomeFeature = (index, field, value) => {
    const updatedFeatures = [...homeForm.features];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setHomeForm({ ...homeForm, features: updatedFeatures });
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {currentUser?.firstName || currentUser?.email}!</p>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="admin-navigation">
        <button 
          className={activeSection === "dashboard" ? "active" : ""}
          onClick={() => setActiveSection("dashboard")}
        >
          Dashboard
        </button>
        <button 
          className={activeSection === "users" ? "active" : ""}
          onClick={() => setActiveSection("users")}
        >
          Manage Users
        </button>
        <button 
          className={activeSection === "feedback" ? "active" : ""}
          onClick={() => setActiveSection("feedback")}
        >
          View Feedback
        </button>
        <button 
          className={activeSection === "landing" ? "active" : ""}
          onClick={() => setActiveSection("landing")}
        >
          Edit Landing Page
        </button>
        <button 
          className={activeSection === "create-admin" ? "active" : ""}
          onClick={() => setActiveSection("create-admin")}
        >
          Create Admin User
        </button>
      </div>

      <div className="admin-content">
        {activeSection === "dashboard" && (
          <div className="dashboard-overview">
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <p>{users.length}</p>
              </div>
              <div className="stat-card">
                <h3>Premium Users</h3>
                <p>{users.filter(user => user.userType === "Premium").length}</p>
              </div>
              <div className="stat-card">
                <h3>Active Users</h3>
                <p>{users.filter(user => user.status === true).length}</p>
              </div>
              <div className="stat-card">
                <h3>Total Feedback</h3>
                <p>{feedback.length}</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === "users" && (
          <div className="manage-users">
            <h2>Manage Users</h2>
            {loading ? (
              <p>Loading users...</p>
            ) : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>User Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td>{user.userType || "Free"}</td>
                        <td>{user.status ? "Active" : "Suspended"}</td>
                        <td>
                          <button 
                            onClick={() => updateUserPremium(user.id, user.userType !== "Premium")}
                            className={user.userType === "Premium" ? "remove-premium" : "add-premium"}
                          >
                            {user.userType === "Premium" ? "Remove Premium" : "Add Premium"}
                          </button>
                          <button 
                            onClick={() => updateUserStatus(user.id, !user.status)}
                            className={user.status ? "suspend" : "activate"}
                          >
                            {user.status ? "Suspend" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeSection === "feedback" && (
          <div className="view-feedback">
            <h2>View Feedback</h2>
            {loading ? (
              <p>Loading feedback...</p>
            ) : (
              <div>
                {/* Debug section */}
                <div style={{ background: '#f8f9fa', padding: '15px', marginBottom: '20px', borderRadius: '6px' }}>
                  <h4>Debug Info:</h4>
                  <p>Feedback count: {feedback.length}</p>
                  <p>Feedback data: {JSON.stringify(feedback, null, 2)}</p>
                </div>
                
                <div className="feedback-list">
                  {feedback.map(item => (
                    <div key={item.id} className={`feedback-item ${item.flagged ? 'flagged' : ''}`}>
                      <div className="feedback-header">
                        <h4>{item.reviewer || "Anonymous User"}</h4>
                        <span className="date">{item.date || new Date(item.timestamp).toLocaleDateString()}</span>
                        <div className="rating">
                          {[...Array(5)].map((_, idx) => (
                            <span key={idx} className="star">
                              {idx < (item.rating || 3) ? "★" : "☆"}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="feedback-category">{item.category || "General Feedback"}</p>
                      <p className="feedback-body">{item.body || item.text || "No feedback content available"}</p>
                      <div className="feedback-actions">
                        <button 
                          onClick={() => flagFeedback(item.id, !item.flagged)}
                          className={item.flagged ? "unflag" : "flag"}
                        >
                          {item.flagged ? "Unflag" : "Flag"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === "landing" && (
          <div className="edit-landing">
            <h2>Edit Landing Page</h2>
            
            {/* FAQ Editing Section */}
            <div className="landing-section">
              <h3>FAQ Content</h3>
              {!editingFaq ? (
                <div>
                  <button onClick={handleFaqEdit} className="edit-btn">Edit FAQ</button>
                  <div className="preview-content">
                    {faqContent.map((item) => (
                      <div key={item.id} className="preview-item">
                        <h4>#{item.id} {item.question}</h4>
                        <p>{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="edit-form">
                  {faqForm.map((item, index) => (
                    <div key={item.id} className="form-item">
                      <div className="form-row">
                        <label>Question #{item.id}:</label>
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                          placeholder="Enter question"
                        />
                        <button 
                          onClick={() => removeFaqItem(index)}
                          className="remove-btn"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="form-row">
                        <label>Answer:</label>
                        <textarea
                          value={item.answer}
                          onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                          placeholder="Enter answer"
                          rows="3"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="form-actions">
                    <button onClick={addFaqItem} className="add-btn">Add FAQ Item</button>
                    <button onClick={handleFaqSave} className="save-btn">Save FAQ</button>
                    <button onClick={handleFaqCancel} className="cancel-btn">Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* Home Content Editing Section */}
            <div className="landing-section">
              <h3>Home Page Content</h3>
              {!editingHome ? (
                <div>
                  <button onClick={handleHomeEdit} className="edit-btn">Edit Home Content</button>
                  <div className="preview-content">
                    <h4>Section Title: {homeContent.sectionTitle}</h4>
                    <p>Promo Video: {homeContent.promoVideoText}</p>
                    <div className="features-preview">
                      {homeContent.features && homeContent.features.map((feature) => (
                        <div key={feature.id} className="preview-feature">
                          <h5>{feature.title}</h5>
                          <p>{feature.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="edit-form">
                  <div className="form-item">
                    <label>Section Title:</label>
                    <input
                      type="text"
                      value={homeForm.sectionTitle || ""}
                      onChange={(e) => setHomeForm({...homeForm, sectionTitle: e.target.value})}
                      placeholder="Enter section title"
                    />
                  </div>
                  <div className="form-item">
                    <label>Promo Video Text:</label>
                    <input
                      type="text"
                      value={homeForm.promoVideoText || ""}
                      onChange={(e) => setHomeForm({...homeForm, promoVideoText: e.target.value})}
                      placeholder="Enter promo video text"
                    />
                  </div>
                  <div className="form-item">
                    <label>Features:</label>
                    {homeForm.features && homeForm.features.map((feature, index) => (
                      <div key={feature.id} className="feature-edit">
                        <div className="form-row">
                          <label>Feature #{feature.id} Title:</label>
                          <input
                            type="text"
                            value={feature.title}
                            onChange={(e) => updateHomeFeature(index, 'title', e.target.value)}
                            placeholder="Enter feature title"
                          />
                          <button 
                            onClick={() => removeHomeFeature(index)}
                            className="remove-btn"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="form-row">
                          <label>Description:</label>
                          <textarea
                            value={feature.description}
                            onChange={(e) => updateHomeFeature(index, 'description', e.target.value)}
                            placeholder="Enter feature description"
                            rows="3"
                          />
                        </div>
                      </div>
                    ))}
                    <button onClick={addHomeFeature} className="add-btn">Add Feature</button>
                  </div>
                  <div className="form-actions">
                    <button onClick={handleHomeSave} className="save-btn">Save Home Content</button>
                    <button onClick={handleHomeCancel} className="cancel-btn">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Temporary Admin Creation Section */}
        {activeSection === "create-admin" && (
          <div className="create-admin">
            <h2>Create Admin User</h2>
            <p>Use this form to create a new admin user for testing purposes.</p>
            <form onSubmit={createAdminUser} className="admin-form">
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  value={adminForm.firstName}
                  onChange={(e) => setAdminForm({...adminForm, firstName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  value={adminForm.lastName}
                  onChange={(e) => setAdminForm({...adminForm, lastName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                  required
                  minLength="6"
                />
              </div>
              <button type="submit" className="create-admin-btn">Create Admin User</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 