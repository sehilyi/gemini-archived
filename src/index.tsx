import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Editor from "./editor/editor";

import * as monaco from 'monaco-editor';

// Since packaging is done by you, you need
// to instruct the editor how you named the
// bundles that contain the web workers.
self.MonacoEnvironment = {
  getWorkerUrl: () => './json.worker.bundle.js'
}

ReactDOM.render(
    <Editor />,
  document.getElementById("root")
);