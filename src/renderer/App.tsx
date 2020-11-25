import { hot } from "react-hot-loader";
import React from "react";

const ipcRenderer = window.require("electron").ipcRenderer;

const TestIPCRenderer = () => {
    ipcRenderer.send("AppCallingMainEvent", "This is an event");
}

const CreateEventListeners = () => {
    ipcRenderer.on("MainCallingAppEvent", (event: any, data: any) => {
        console.log(`MainCallingAppEvent data: ${data}`);
    });
}

const App = () => {
    CreateEventListeners();

    return (
        <div>
            <h1>my app</h1>
            <button onClick={TestIPCRenderer}>Test electron ipcRenderer</button>
        </div>
    );
}

export default hot(module)(App);