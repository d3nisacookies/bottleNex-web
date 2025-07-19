import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const LandingPageContext = createContext();

export function useLandingPage() {
  const context = useContext(LandingPageContext);
  if (!context) {
    throw new Error('useLandingPage must be used within a LandingPageProvider');
  }
  return context;
}

export function LandingPageProvider({ children }) {
  const [faqContent, setFaqContent] = useState([]);
  const [homeContent, setHomeContent] = useState({});
  const [loading, setLoading] = useState(true);

  // Load landing page content from Firebase
  const loadLandingPageContent = async () => {
    try {
      setLoading(true);
      
      // Load FAQ content
      const faqDoc = await getDoc(doc(db, "landingPage", "faq"));
      if (faqDoc.exists()) {
        setFaqContent(faqDoc.data().items || []);
      } else {
        // Create default FAQ content
        const defaultFaq = [
          {
            id: 1,
            question: "Do You Collect Location?",
            answer: "No, we value your privacy."
          },
          {
            id: 2,
            question: "What is a locked road?",
            answer: "A locked segment cannot be edited by an editor with a lower Editing rank than the current lock number of the segment. Generally, segments should not be locked unless specific conditions exist."
          },
          {
            id: 3,
            question: "How does BottleneX determine my home state or country?",
            answer: "BottleneX automatically matches you to the state or country based on where you have earned the most points in the last week."
          }
        ];
        await setDoc(doc(db, "landingPage", "faq"), {
          items: defaultFaq,
          updatedAt: serverTimestamp()
        });
        setFaqContent(defaultFaq);
      }

      // Load Home content
      const homeDoc = await getDoc(doc(db, "landingPage", "home"));
      if (homeDoc.exists()) {
        setHomeContent(homeDoc.data());
      } else {
        // Create default Home content
        const defaultHome = {
          sectionTitle: "These are our main Features",
          promoVideoText: "[Promo Video Placeholder]",
          features: [
            {
              id: 1,
              title: "Predictive Traffic Forecast",
              description: "Get real-time traffic predictions powered by AI that analyzes millions of data points. Our system learns from patterns to forecast congestion before it happens, suggesting optimal departure times and alternative routes."
            },
            {
              id: 2,
              title: "Historical Traffic Insights",
              description: "Access 12 months of traffic analytics to plan smarter. See how weather, events, and time of day affect routes. Perfect for scheduling important trips when reliability matters most."
            },
            {
              id: 3,
              title: "Never Reach Late",
              description: "Our algorithms provide buffer time recommendations based on your destination's punctuality requirements. Arrive exactly when you need to - whether it's a flight, meeting, or special event."
            }
          ],
          updatedAt: serverTimestamp()
        };
        await setDoc(doc(db, "landingPage", "home"), defaultHome);
        setHomeContent(defaultHome);
      }
    } catch (error) {
      console.error("Error loading landing page content:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update FAQ content
  const updateFaqContent = async (newFaqContent) => {
    try {
      await setDoc(doc(db, "landingPage", "faq"), {
        items: newFaqContent,
        updatedAt: serverTimestamp()
      });
      setFaqContent(newFaqContent);
      return true;
    } catch (error) {
      console.error("Error updating FAQ content:", error);
      return false;
    }
  };

  // Update Home content
  const updateHomeContent = async (newHomeContent) => {
    try {
      await setDoc(doc(db, "landingPage", "home"), {
        ...newHomeContent,
        updatedAt: serverTimestamp()
      });
      setHomeContent(newHomeContent);
      return true;
    } catch (error) {
      console.error("Error updating Home content:", error);
      return false;
    }
  };

  useEffect(() => {
    loadLandingPageContent();
  }, []);

  const value = {
    faqContent,
    homeContent,
    loading,
    updateFaqContent,
    updateHomeContent,
    reloadContent: loadLandingPageContent
  };

  return (
    <LandingPageContext.Provider value={value}>
      {children}
    </LandingPageContext.Provider>
  );
} 