import React from 'react';
import Image from "next/image";
import { SignInButton, SignUpButton } from "@clerk/nextjs"; // Import Clerk buttons


export default function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to My Application</h1>
      </header>
      <main className="home-main">
        <Image
          src="/images/Screenshot.png" // Replace with your image path
          alt="Screenshot"
          width={600}
          height={400}
          className="home-image"
        />
        <p className="home-description">
          This is a sample page created using Next.js and Clerk for authentication.
        </p>
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