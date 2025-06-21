import React from "react";
import { useState } from "react";
import "./ChatBotStyling.css"; // Link the CSS file

const InputBar = ({ currentMessage, setCurrentMessage, onSubmit }) => {
  const handleChange = (e) => {
    setCurrentMessage(e.target.value);
  };

  return (
    <form id="input-form" onSubmit={onSubmit} className="input-form">
      <div className="input-wrapper">
        <button id="emoji-button" type="button" className="icon-button">
          <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </button>

        <input
          id="chat-input"
          type="text"
          placeholder="Type a message"
          value={currentMessage}
          onChange={handleChange}
          className="chat-input"
        />

        <button id="attach-button" type="button" className="icon-button">
          <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            ></path>
          </svg>
        </button>

        <button id="send-button" type="submit" className="send-button">
          <svg className="icon send-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            ></path>
          </svg>
        </button>
      </div>
    </form>
  );
};

export default InputBar;
