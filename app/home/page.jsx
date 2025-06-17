"use client";
import React, { useState } from 'react';
import { UserButton } from "@clerk/nextjs";
import "./homepage.css";
import { FiSearch } from 'react-icons/fi';
import { FiMic } from 'react-icons/fi';
import Sidebar from "../components/Sidebar";
import { useRouter } from 'next/navigation';

const SUGGESTIONS = [
  "acceptance",
  "achievement",
  "ambition",
  "appreciating nature",
  "appreciation",
  "beauty",
  "being there",
  "believe",
  "believe in yourself",
  "blessing",
  "bravery",
  "caring",
  "character",
  "charity",
  "cheer",
  "civility",
  "commitment",
  "common ground",
  "community",
  "compassion",
  "compliments",
  "confidence",
  "connection",
  "courage",
  "courtesy",
  "creativity",
  "curiosity",
  "dedication",
  "determination",
  "devotion",
  "discovery",
  "do thy best",
  "do your part",
  "drive",
  "education",
  "empathy",
  "encouragement",
  "equality",
  "exploring",
  "family",
  "fitness",
  "forgiveness",
  "friendship",
  "generosity",
  "get outside",
  "giving",
  "giving back",
  "good manners",
  "gratitude",
  "grit",
  "happiness",
  "hard work",
  "health",
  "helping others",
  "honesty",
  "hope",
  "humility",
  "humor",
  "imagine",
  "including others",
  "inclusion",
  "innovation",
  "inspiration",
  "integrity",
  "joy",
  "justice",
  "kindness",
  "laughter",
  "leadership",
  "learning",
  "listening",
  "literacy",
  "live life",
  "live your dreams",
  "love",
  "loyalty",
  "making a difference",
  "mentoring",
  "mindfulness",
  "money",
  "motivation",
  "opportunity",
  "optimism",
  "overcoming",
  "parenting",
  "passion",
  "patience",
  "peace",
  "perseverance",
  "persistence",
  "perspective",
  "practice",
  "preparation",
  "pull together",
  "purpose",
  "reaching out",
  "resilience",
  "respect",
  "responsibility",
  "right choices",
  "rising above",
  "self-care",
  "selflessness",
  "service",
  "sharing",
  "sleep",
  "smile",
  "soul",
  "spiritual",
  "sportsmanship",
  "spread your wings",
  "stewardship",
  "strength",
  "teaching by example",
  "teamwork",
  "true beauty",
  "trust",
  "unity",
  "vision",
  "volunteering",
  "wisdom",
  "wonder"
];

export default function Home() {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/users/me");
        const data = await res.json();
        setUserData(data);
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = SUGGESTIONS.filter(
    suggestion =>
      input &&
      suggestion.toLowerCase().includes(input.toLowerCase())
  );

  // async function sendTagToPodcastAPI(selectedTag) {
  //   try {
  //     const response = await fetch('/api/podcast', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       credentials: 'include',
  //       body: JSON.stringify({ tag: selectedTag }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to fetch podcast data');
  //     }

  //     const data = await response.json();
  //     console.log('Podcast data:', data);
  //     return data;
  //   } catch (error) {
  //     console.error('Error:', error.message);
  //   }
  // }
  async function sendTagToPodcastAPI(selectedTag) {
  try {
    // Assuming userData contains the Clerk ID as userData.clerkId or userData.id
    const userId = userData?.clerkId; // Adjust property name as needed

    if (!userId) {
      throw new Error('User not authenticated or Clerk ID not found');
    }

    const response = await fetch('/api/podcast', { // Or your endpoint as in paste.txt
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        userId,
        tag: selectedTag,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch podcast data');
    }

    const data = await response.json();
    console.log('Podcast data:', data);
    if (data?.id) {
      router.push(`/podcast/${data.id}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
    throw error; // Optionally rethrow to let caller handle it
  }
}


  return (
    <>
      <Sidebar />
      <div className="zen-bg">
        <div className="user-avatar">
          <UserButton />
        </div>
        <div className="zen-center">
          <div className="zen-greeting">
            <p>Hello</p>
            <p>Welcome to ZenStream!</p>
            <p>Stream Serenity, Powered by AI.</p>
          </div>
          <div className="zen-search-card">
            <div className="zen-search-desc">
              Tell me how you're feeling or what's been on your mind lately.<br />
              I'll turn it into a calming, supportive podcast just for you.
            </div>
            <div className="zen-search-box" style={{ position: "relative" }}>
              <FiSearch className="zen-search-icon" />
              <input
                className="zen-search-input"
                placeholder="Type a topic..."
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                autoComplete="off"
              />
             
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="zen-suggestions-dropdown">
                  {filteredSuggestions.map(suggestion => (
                    <div
                      key={suggestion}
                      className="zen-suggestion-item"
                      onMouseDown={() => {
                        setInput(suggestion);
                        setShowSuggestions(false);
                        sendTagToPodcastAPI(suggestion);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}