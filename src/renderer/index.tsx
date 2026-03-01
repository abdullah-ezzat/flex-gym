import ReactDom from "react-dom/client";
import React from "react";
import { HashRouter, useRoutes } from "react-router-dom";
import { AppRoutes } from "./routes";
import "./globals.css";

function Router() {
  const element = useRoutes(AppRoutes());
  return element;
}

ReactDom.createRoot(document.querySelector("app") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <Router />
    </HashRouter>
  </React.StrictMode>,
);
