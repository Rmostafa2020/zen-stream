import React from 'react';
import Image from "next/image";
import "./homepage.css"
import { SignInButton, SignUpButton } from "@clerk/nextjs"; // Import Clerk buttons


export default function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>
        <p className="home-greeting">Hello</p>
        <p className="home-greeting"> Welcome to ZenStream!</p> 
        <p className="home-greeting">Stream Serenity, Powered by AI.</p>
    </h1>
      </header>
      <main className="home-main">
        
        {/* <p className="home-description">
          This is a sample page created using Next.js and Clerk for authentication.
        </p> */}
        <div className="auth-buttons">
          <SignInButton>
            <button className="auth-button">Sign In</button>
          </SignInButton>
          <SignUpButton>
            <button className="auth-button">Sign Up</button>
          </SignUpButton>
        </div>
      </main>
    </div>
  );
}