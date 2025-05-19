import React from "react";
import "../styles/helloKittyAssistant.scss";
import helloKittyLogo from "../assets/hello-kitty.png";

const HelloKittyAssistant = ({isThinking}) => {
    return (<div className={`hello-kitty-assistant ${isThinking ? 'thinking' : 'idle'}`}>
        <img
            src={helloKittyLogo}
            alt="Hello Kitty Assistant"
            className="hello-kitty-image"
        />
        {isThinking && (<div className="thinking-indicator">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
        </div>)}
    </div>);
};

export default HelloKittyAssistant;