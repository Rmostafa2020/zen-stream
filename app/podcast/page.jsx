"use client";
import React, { useState } from 'react';
import { UserButton } from "@clerk/nextjs";
import { FiTrash2, FiVolume2, FiPlayCircle, FiPauseCircle, FiStopCircle } from 'react-icons/fi';
import Sidebar from "../components/Sidebar";
import "./podcast.css";

export default function PodcastPage() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <>
      <Sidebar />
      <div className="zen-bg">
        <div className="user-avatar">
          <UserButton />
        </div>
        <div className="podcast-main-content">
        {/* Podcast Player Bar */}
        <div className="podcast-player-bar">
            <button
                className="podcast-play-btn"
                aria-label={isPlaying ? "Pause" : "Play"}
                onClick={() => setIsPlaying((prev) => !prev)}
            >
                {isPlaying ? (
                    <FiPauseCircle size={24} color="#4b2e7a" />
                ) : (
                    <FiPlayCircle size={24} color="#4b2e7a" />
                )}
            </button>
            {/* <button className="podcast-stop-btn" aria-label="Stop" onClick={() => setIsPlaying(false)}>
                <FiStopCircle size={28} color="#4b2e7a" />
            </button> */}
            <button className="podcast-volume-btn" aria-label="Volume">
                <FiVolume2 size={24} color="#4b2e7a" />
            </button>
            <div className="podcast-progress-bar">
                <div className="podcast-progress"></div>
            </div>
            <button className="podcast-delete-btn" aria-label="Delete">
                <FiTrash2 size={24} color="#231942" />
            </button>
        </div>
          <div className="podcast-transcript-box">
            <b className="podcast-transcript-title">Transcript:</b>
            <div className="podcast-transcript-content">
              {/* Transcript text goes here */}
            </div>
            <div className="podcast-show-more">
              <span className="podcast-show-more-icon">&#x25BC;</span> Show More
            </div>
          </div>
        </div>
      </div>
    </>
  );
}