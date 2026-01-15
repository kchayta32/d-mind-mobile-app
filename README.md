# D-MIND: Disaster Management & Information System

![D-MIND Logo](/public/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png)

**D-MIND** (Disaster Monitor) is a comprehensive web application designed to track disaster events, provide emergency resources, and notify users of critical alerts in real-time. It has been redesigned with a mobile-first approach to ensure accessibility and usability in emergency situations.

## Key Features

### 📱 Mobile-First Design
The application now features a fully responsive layout optimized for mobile devices.
-   **Persistent Bottom Navigation**: Easy access to key sections (Home, Map, Emergency Contacts, Manuals).
-   **Mobile Layout**: A specialized wrapper ensures a consistent experience on smaller screens.

### 🔔 Real-time Notifications
Stay informed with instant alerts.
-   **System Alerts**: The app listens for real-time updates from our disaster database (Supabase) and triggers system notifications.
-   **In-App Toasts**: Visual feedback within the application when new incidents are reported.

### 🗺️ Disaster Tracking
-   **Interactive Map**: Visualize disaster locations and affected areas.
-   **Daily Stats**: View summary statistics for earthquakes, floods, landslides, and wildfires.

### 🆘 Emergency Resources
-   **Emergency Contacts**: One-tap access to essential phone numbers.
-   **Manuals & Guides**: Offline-capable resources for emergency preparedness.

## Technology Stack

This project is built with modern web technologies:

-   **Frontend**: React (Vite), TypeScript
-   **Styling**: Tailwind CSS, shadcn/ui
-   **Backend / Realtime**: Supabase
-   **Map**: Leaflet / React-Leaflet

## Getting Started

To run this project locally:

1.  **Clone the repository**
    ```sh
    git clone <YOUR_GIT_URL>
    cd d-mind-ai
    ```

2.  **Install dependencies**
    ```sh
    npm install
    ```

3.  **Start the development server**
    ```sh
    npm run dev
    ```

## Project Structure

-   `src/components/layout/MobileLayout.tsx`: The main wrapper for the mobile view.
-   `src/components/notifications/NotificationManager.tsx`: Handles real-time subscriptions and alerts.
-   `src/pages`: Contains the individual route components.

## Deployment

This project is ready for deployment on platforms like Vercel or Netlify. Ensure you configured your Supabase environment variables correctly.
