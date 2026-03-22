# CineMood 🎬

CineMood is a sophisticated, interactive movie discovery platform designed to help users find the perfect film based on their current emotional state. By leveraging AI-powered search and immersive 3D visuals, CineMood transforms the often-tedious process of choosing a movie into an engaging and intuitive experience.

## 🚀 Live Demo
[View Live Application](https://ais-pre-m2xlyya4z4ppg4cmqnj2it-531071592031.asia-east1.run.app)

## ✨ Key Features

- **Mood-Based Discovery:** Navigate through curated movie categories based on emotional "vibes" such as Chilled, Energetic, Romantic, and Dramatic.
- **AI-Powered "Magic Search":** Utilize Google's Gemini AI to identify movies from natural language descriptions of plots, scenes, or characters.
- **Interactive 3D Environment:** An immersive background powered by Spline that responds dynamically to user cursor movements.
- **Seamless Theme Integration:** Full support for Light and Dark modes with persistent user preferences.
- **Responsive & Fluid UI:** A mobile-first design built with Tailwind CSS and animated with Framer Motion for a premium feel.
- **Real-time Search:** Instant filtering and retrieval of movie data as you type.

## 🛠️ Tech Stack

- **Frontend:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **3D Graphics:** Spline
- **AI Integration:** Google Gemini API (`@google/genai`)
- **Icons:** Lucide React

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/harshhh1122/cinemood.git
   cd cinemood
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

5. **Production Build:**
   ```bash
   npm run build
   ```

## 📖 Usage Guide

- **Mood Selection:** Click on the mood tags at the top to instantly filter movies by genre and emotional tone.
- **Magic Search:** Click the "Magic" icon in the search bar to describe a movie in your own words. The AI will analyze your prompt and suggest the most relevant titles.
- **Theme Toggle:** Use the theme switcher in the header to toggle between Light and Dark modes.

## 📄 License
This project is licensed under the MIT License.

---
Developed with ❤️ by [Harsh](https://github.com/harshhh1122)
