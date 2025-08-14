import React from "react";
import "./Review.css";
import logo from "./bottlenex-logo.png"; // Place your logo in the project and update the path
import reviewerImg from "./reviewer1.jpg"; // Use the same image for demo or different ones
import { openDownloadLink } from '../src/config/download';

const reviews = [
  {
    category: "Traffic Bottleneck Identification",
    body: "BottleneX helped me spot traffic jams before I got stuck.",
    reviewer: "Evan Rachel",
    date: "June 10, 2025",
    rating: 3,
    img: reviewerImg,
  },
  {
    category: "Route Optimization",
    body: "The app always finds the fastest route for my commute.",
    reviewer: "Louis Hoffman",
    date: "June 11, 2025",
    rating: 4,
    img: reviewerImg,
  },
  {
    category: "Real-Time Traffic Updates",
    body: "Live updates are accurate and timely.",
    reviewer: "Thoma Middleditch",
    date: "June 12, 2025",
    rating: 4,
    img: reviewerImg,
  },
];

export default function Review() {
  return (
    <div className="main-bg">
      <nav className="navbar">
        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">Subscription Plan</a>
          <a href="#">Review</a>
        </div>
        <div className="nav-logo">
          <img src={logo} alt="BottleneX Logo" />
        </div>
        <div className="nav-links nav-links-right">
          <a href="#">FAQ</a>
          <a href="#">About Us</a>
          <button className="download-btn" onClick={openDownloadLink}>Download</button>
          <button className="login-btn">Login</button>
        </div>
      </nav>
      <div className="review-container">
        <h1>Rating and Reviews</h1>
        <div className="review-grid">
          {reviews.map((r, i) => (
            <div className="review-card" key={i}>
              <div className="rating">
                {[...Array(5)].map((_, idx) => (
                  <span className="star" key={idx}>
                    {idx < r.rating ? "★" : "☆"}
                  </span>
                ))}
              </div>
              <div className="review-category">{r.category}</div>
              <div className="review-body">{r.body}</div>
              <div className="reviewer-info">
                <img src={r.img} alt={r.reviewer} />
                <div>
                  <div className="reviewer-name">{r.reviewer}</div>
                  <div className="review-date">{r.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}