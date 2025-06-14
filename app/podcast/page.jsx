"use client";
import React from 'react';
import { UserButton } from "@clerk/nextjs";
import "./homepage.css";
import { FiSearch } from 'react-icons/fi';
import { FiMic } from 'react-icons/fi';
import Sidebar from "../components/Sidebar";


export default function Home() {
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
            <div className="zen-search-box">
              <FiSearch className="zen-search-icon" />
              <input className="zen-search-input" placeholder="" />
              <FiMic className="zen-mic-icon" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}