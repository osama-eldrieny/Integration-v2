import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@exp-textura/react/fonts.css";
import { ThemeProvider } from "@exp-textura/react";
import "./index.css";
import Landing from "./Landing.tsx";
import { PageTitle } from "./PageTitle.tsx";
import V1Updates1App from "./versions/v1-updates-1/App.tsx";
import CurrentVersionApp from "./versions/current-version/App.tsx";
import V1Updates2App from "./versions/v1-updates-2/App.tsx";
import V1Updates3App from "./versions/v1-updates-3/App.tsx";
import V1Updates4App from "./versions/v1-updates-4/App.tsx";
import V1Updates5App from "./versions/v1-updates-5/App.tsx";
import V1Updates6App from "./versions/v1-updates-6/App.tsx";
import Option1App from "./versions/option1/App.tsx";
import Option2App from "./versions/option2/App.tsx";
import Option3App from "./versions/option3/App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider hoistCSSVars hoistThemeScopedStyles>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Routes>
          <Route
            path="/"
            element={import.meta.env.VITE_PUBLIC === "1" ? <Navigate to="/final-solution" replace /> : <Landing />}
          />
          <Route
            path="/v1-updates-1"
            element={
              <>
                <PageTitle title="Integration V1 In-App Feedback — Option 1" />
                <V1Updates1App />
              </>
            }
          />
          <Route
            path="/guide-in-drawer"
            element={
              <>
                <PageTitle title="Integration V2 Option 1 — Guide inside the drawer" />
                <CurrentVersionApp />
              </>
            }
          />
          <Route
            path="/v1-updates-2"
            element={
              <>
                <PageTitle title="Integration V1 In-App Feedback — Option 2" />
                <V1Updates2App />
              </>
            }
          />
          <Route
            path="/v1-updates-3"
            element={
              <>
                <PageTitle title="Integration V1 In-App Feedback — Option 3" />
                <V1Updates3App />
              </>
            }
          />
          <Route
            path="/v1-updates-4"
            element={
              <>
                <PageTitle title="Integration V1 In-App Feedback — Option 4" />
                <V1Updates4App />
              </>
            }
          />
          <Route
            path="/v1-updates-5"
            element={
              <>
                <PageTitle title="Integration V1 In-App Feedback — Option 5" />
                <V1Updates5App />
              </>
            }
          />
          <Route
            path="/v1-updates-6"
            element={
              <>
                <PageTitle title="Integration V1 In-App Feedback — Option 6" />
                <V1Updates6App />
              </>
            }
          />
          <Route
            path="/option-1"
            element={
              <>
                <PageTitle title="Integration V2 Option 1" />
                <Option1App />
              </>
            }
          />
          <Route path="/option-2" element={<Navigate to="/final-solution" replace />} />
          <Route
            path="/final-solution"
            element={
              <>
                <PageTitle title="Integration V2 Final solution" />
                <Option2App />
              </>
            }
          />
          <Route
            path="/option-3"
            element={
              <>
                <PageTitle title="Integration V2 Option 3" />
                <Option3App />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
