# Hack4Good Platform

A volunteer and participant management system built for the Hack4Good hackathon. This application connects volunteers with activities and provides staff with tools to manage events and registrations to ensure a frictionless experience. 

## Tech Stack

* **Frontend:** React, TypeScript, Vite
* **Styling:** Tailwind CSS, Shadcn UI, Lucide React
* **Backend:** Supabase (PostgreSQL, Authentication)
* **State Management:** React Context API

## Features

### Volunteer Portal
* **Activity Browsing:** View available volunteer opportunities with filtering by date, location, and needs.
* **Registration Management:** Sign up for activities or withdraw from commitments.
* **Dashboard:** Track upcoming activities and role assignments (e.g., General Support, Wheelchair Assistance).

### Staff Portal
* **Dashboard:** View real-time statistics on total volunteers, active activities, and recent signups.
* **Activity Management:** Create, edit, and delete volunteer activities.
* **Capacity Planning:** Set specific slot limits for volunteers and participants.

### Participant Portal
* **Access:** tailored view for event participants to view and register for activities.

## Local Development

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/jeromeoe/Hack4Good.git](https://github.com/jeromeoe/Hack4Good.git)
    cd Hack4Good
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the application**
    ```bash
    npm run dev
    ```

## Database Schema

The application relies on the following key Supabase tables:

* **profiles:** Stores user details linked to Supabase Auth.
* **activities:** Contains event details, locations, times, and capacity slots.
* **registrations:** Links users to activities with status and role tracking.

## Project Structure

* `src/components`: Reusable UI components (Shadcn) and feature-specific widgets.
* `src/pages`: Main view components for Staff, Volunteer, and Participant routes.
* `src/lib`: Supabase client configuration and Context providers.
* `src/types`: TypeScript definitions for database tables and application state.