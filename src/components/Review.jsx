import React from "react";
import "../css/Review.css";
import { useLandingPage } from "../context/LandingPageContext";
// import logo from "./bottlenex-logo.png"; // Place your logo in the project and update the path
// import reviewerImg from "./reviewer1.jpg"; // Use the same image for demo or different ones

const reviews = [
  {
    category: "Traffic Bottleneck Identification",
    body: "BottleneX helped me spot traffic jams before I got stuck.",
    reviewer: "Evan Rachel",
    date: "June 10, 2025",
    rating: 3,
    // img: reviewerImg,
  },
  {
    category: "Route Optimization",
    body: "The app always finds the fastest route for my commute.",
    reviewer: "Louis Hoffman",
    date: "June 11, 2025",
    rating: 4,
    // img: reviewerImg,
  },
  {
    category: "Real-Time Traffic Updates",
    body: "Live updates are accurate and timely.",
    reviewer: "Thoma Middleditch",
    date: "June 12, 2025",
    rating: 4,
    // img: reviewerImg,
  },
];

export default function Review() {
  const { reviewsContent, loading } = useLandingPage();

  if (loading) {
    return <div className="review-container"><h1>Rating and Reviews</h1><p>Loading reviews...</p></div>;
  }

  // Filter for 4+ stars, not flagged, sort by date (newest first), and take top 3
  const topReviews = (reviewsContent || [])
    .filter(r => r.rating >= 4 && !r.flagged)
    .sort((a, b) => {
      // Parse date strings to Date objects for comparison
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    })
    .slice(0, 3);

  return (
    <div className="review-container">
      <h1>Rating and Reviews</h1>
      <div className="review-grid">
        {topReviews.length > 0 ? (
          topReviews.map((r, i) => (
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
                {/* <img src={r.img} alt={r.reviewer} /> */}
                <div>
                  <div className="reviewer-name">{r.reviewer}</div>
                  <div className="review-date">{r.date}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No top reviews available.</p>
        )}
      </div>
    </div>
  );
}