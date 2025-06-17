# ZenStream

ZenStream is a calming, AI-powered podcast web app that helps users relax, focus, and find serenity. Users can sign in, select or search for topics, and generate personalized podcasts with text-to-speech support.

## Features

- **Clerk Authentication**: Secure sign-in and sign-up with Clerk.
- **Personal Dashboard**: Each user has a unique homepage with a sidebar and profile menu.
- **Topic Suggestions**: Google-style search box with topic suggestions as you type.
- **Podcast Generation**: Create new podcasts based on selected or typed topics.
- **Text-to-Speech**: Listen to generated podcasts directly in the browser.
- **Responsive UI**: Clean, modern interface with user-friendly navigation.

## Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- npm or yarn
- Clerk account (for authentication keys)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/zen-stream.git
   cd zen-stream
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the root directory and add your Clerk keys:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## Usage

- **Sign In:** Click the "Sign In" button to authenticate with Clerk.
- **Search Topics:** Start typing in the search box to see topic suggestions.
- **Select a Topic:** Choose a suggested topic or type your own.
- **Generate Podcast:** Click "+ New Podcast" to create a personalized podcast.
- **Listen:** Use the play button to listen to the generated podcast via text-to-speech.


## Dependencies

- [Next.js](https://nextjs.org/)
- [Clerk](https://clerk.com/)
- [React Icons](https://react-icons.github.io/react-icons/)
- [Text-to-Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)

## License

MIT

---

**Made with ❤️ for relaxation and focus.**









This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
