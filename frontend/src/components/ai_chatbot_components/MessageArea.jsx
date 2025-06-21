import React from "react";
import "./ChatBotStyling.css";
import { Link } from "react-router-dom";

// as the AI is responding we display this shows animated dots like a typing indicator.
const PremiumTypingAnimation = () => {
  return (
    <div className="typing-animation-container">
      <div className="typing-dots">
        <div className="dot" style={{ animationDelay: "0ms" }}></div>
        <div className="dot" style={{ animationDelay: "300ms" }}></div>
        <div className="dot" style={{ animationDelay: "600ms" }}></div>
      </div>
    </div>
  );
};

// visually represents the stages of a search process (searching, reading, writing, error)
// if the AI is searchin it display Searching...
const SearchStages = ({ searchInfo }) => {
  if (!searchInfo || !searchInfo.stages || searchInfo.stages.length === 0)
    return null;

  return (
    <div className="search-stages">
      {/* Search Process UI */}
      <div className="stages-list">
        {/* Searching Stage */}
        {/* this is how searchInfo.stage looks like. ['searching', 'reading', 'writing'] */}
        {console.log(searchInfo.stages)}
        {searchInfo.stages.includes("searching") && (
          <div className="stage-item">
            {/* Green dot */}
            <div className="stage-dot" />

            {/* Connecting line to next item if reading exists */}
            {searchInfo.stages.includes("reading") && (
              <div className="stage-connector" />
            )}

            <div className="stage-content">
              <span className="stage-title">Searching the web...</span>

              {/* Search Query in box styling */}
              <div className="query-wrapper">
                <div className="query-badge">
                  <svg
                    className="query-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                  {searchInfo.query}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reading Stage */}
        {searchInfo.stages.includes("reading") && (
          <div className="stage-item">
            <div className="stage-dot" />
            <div className="stage-content">
              <span className="stage-title">Reading</span>
              {searchInfo.urls && (
                <div className="url-list">
                  {(Array.isArray(searchInfo.urls)
                    ? searchInfo.urls
                    : [searchInfo.urls]
                  ).map((url, i) => (
                    <div className="url-badge" key={i}>
                      {typeof url === "string" ? (
                        <Link to={`${url}`}>{url}</Link>
                      ) : (
                        JSON.stringify(url).substring(0, 30)
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Writing Stage */}
        {searchInfo.stages.includes("writing") && (
          <div className="stage-item">
            {/* Green dot with subtle glow effect */}
            <div className="stage-dot" />
            <span className="stage-title">Writing answer</span>
          </div>
        )}

        {/* Error Message */}
        {searchInfo.stages.includes("error") && (
          <div className="stage-item">
            {/* Red dot over the vertical line */}
            <div className="stage-dot error-dot" />
            <span className="stage-title">Search error</span>
            <div className="error-message">
              {searchInfo.error || "An error occurred during search."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

//  displays the list of messages in a chat, including logic to show loading, search stages, and user/AI message styling.
const MessageArea = ({ messages }) => {
  return (
    <div className="message-area">
      <div className="message-container">
        {messages?.map((message) => (
          <div
            key={message.id}
            className={`message-row ${
              message.isUser ? "message-user" : "message-ai"
            }`}
          >
            <div className="message-bubble-container">
              {!message.isUser && message.searchInfo && (
                <SearchStages searchInfo={message.searchInfo} />
              )}
              <div
                className={`message-bubble ${
                  message.isUser ? "bubble-user" : "bubble-ai"
                }`}
              >
                {message.isLoading ? (
                  <PremiumTypingAnimation />
                ) : (
                  message.content || (
                    <span className="message-placeholder">
                      Waiting for response...
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageArea;
