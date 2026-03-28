# Smart Context-Aware Action Assistant

A modern web-based application that converts short user messages into meaningful actionable suggestions based on context like time of day and adaptive user behavior.

## 1. Problem Statement
Users often want to do simple tasks (like getting food, studying, or unwinding) but face friction when deciding exactly *where* to go online. Typing out full URLs or opening multiple apps can be tedious.

## 2. Solution Overview
The Smart Context-Aware Action Assistant takes minimal input (e.g., "I'm hungry" or "relax") and infers the underlying **intent**. Using contextual data like the **Time of Day** and **Historical User Choices**, it provides categorized, direct links to platforms (e.g., Swiggy, Coursera, Netflix) to quickly satisfy the user's intent.

## 3. Tech Stack
- **Frontend**: HTML5, CSS3 (Custom variables, Dark mode), JavaScript (Vanilla JS).
- **Storage**: Browser `localStorage` (for adaptive learning and theme preference).
- **Icons**: FontAwesome 6 via CDN.
- **Fonts**: Google Fonts (Inter).

## 4. Features
- **Intent Detection**: Employs keyword matching to determine goals (Food, Study, Travel, Relax).
- **Context Awareness**: Retrieves the local system time to tag suggestions (Morning, Afternoon, Evening, Night).
- **Adaptive Learning**: Uses `localStorage` to boost the priority of frequently clicked apps and suggestions.
- **Dark Mode**: Fully supported, modern dark mode built-in.
- **Voice Input**: Bonus feature mapping to the Web Speech API for dictation.
- **Responsive UI**: Glassmorphism and sleek animations usable on both desktop and mobile.

## 5. How It Works
1. User types a query (e.g., "bored").
2. The logic scans keywords and maps it to the "Relax" intent.
3. The app retrieves matching actionable suggestions (YouTube, Spotify).
4. The system loads click history from local storage and sorts favorites to the top.
5. User clicks an action, opening a new tab and saving the choice frequency to improve future ordering.

## 6. Installation Steps
Since this is a client-side only web app, installation just requires cloning the files locally:
```bash
git clone <repository_url>
cd project-root
```

## 7. Run Instructions
1. Open the folder containing the project files.
2. Double click `index.html` to open it in your default web browser.
*(Alternatively, you can run a local server like `npx serve` or Live Server in VSCode to test it).*

## 8. Live Demo Link
*Pending Deployment (e.g., deploy to Vercel/Netlify using the directory contents and post the `your-app-name.vercel.app` link here).* 
