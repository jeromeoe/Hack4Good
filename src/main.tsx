import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { VolunteerActivitiesProvider } from "./lib/VolunteerActivitiesContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <VolunteerActivitiesProvider>
        <App />
      </VolunteerActivitiesProvider>
    </BrowserRouter>
  </React.StrictMode>
);
