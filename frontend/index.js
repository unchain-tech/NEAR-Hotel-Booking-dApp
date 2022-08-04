import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";

import App from "./App";

import { initContract } from "./assets/js/near/utils";

const container = document.querySelector("#root");
const root = createRoot(container);

window.nearInitPromise = initContract()
  .then(() => {
    <BrowserRouter>
      <App />
    </BrowserRouter>;
    root.render(<App tab='home' />);
  })
  .catch(console.error);
