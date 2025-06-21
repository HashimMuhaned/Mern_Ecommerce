import InputBar from "../ai_chatbot_components/InputBar";
import MessageArea from "../ai_chatbot_components/MessageArea";
import React, { useState } from "react";
import { TbMessageChatbot } from "react-icons/tb";

const ChatMainHome = () => {
  const [isOpen, setIsOpen] = useState(false);
  //  State Definitions
  const [messages, setMessages] = useState([
    {
      id: 1,
      // Initializes with a welcome message from the AI.
      content: "Hi there, how can I help you?",
      isUser: false,
      type: "message",
    },
  ]);
  // Holds the text currently being typed into the input box.
  const [currentMessage, setCurrentMessage] = useState("");
  // Used for contextual memory — stores a checkpoint ID returned by the backend.
  // Passed in the URL on future messages to help the backend understand the conversation history.
  const [checkpointId, setCheckpointId] = useState(null);

  const handleSubmit = async (e) => {
    // Prevents the default form submission behavior (which would reload the page).
    e.preventDefault();
    // Makes sure the user didn’t just hit send on an empty string.
    if (currentMessage.trim()) {
      // Dynamically generates the next unique message ID.
      const newMessageId =
        messages.length > 0 // if the length of messages > 0
          ? Math.max(...messages.map((msg) => msg.id)) + 1 // we map through the messages object and get the id of messages + 1.
          : 1; // else just set it to 1

      // adds the new typed message to the messages erray.
      setMessages((prev) => [
        ...prev,
        {
          id: newMessageId,
          content: currentMessage,
          isUser: true,
          type: "message",
        },
      ]);

      // we save current in a variable to use it in the url. part of the request.
      const userInput = currentMessage;
      setCurrentMessage(""); // Clear input field immediately

      try {
        //  An empty AI message is added as a placeholder while waiting for the backend to stream a response.
        const aiResponseId = newMessageId + 1;
        setMessages((prev) => [
          ...prev,
          {
            id: aiResponseId,
            content: "",
            isUser: false,
            type: "message",
            isLoading: true, // triggers the loading animation (PremiumTypingAnimation).
            // part of the AI response is to display if it is searching,
            // and what website it is visiting so these info are saved here.
            searchInfo: {
              stages: [], // this is how stages will look like. ['searching', 'reading', 'writing']
              query: "",
              urls: [], // here will be saved the urls of the website that the llm is searching.
            },
          },
        ]);

        // Create URL with checkpoint ID if it exists
        let url = `http://localhost:8000/chat_stream/${encodeURIComponent(
          userInput
        )}`;
        if (checkpointId) {
          url += `?checkpoint_id=${encodeURIComponent(checkpointId)}`;
        }

        // Connect to SSE endpoint using EventSource
        const eventSource = new EventSource(url);
        let streamedContent = ""; // accumulates content sent in chunks.
        let searchData = null; //  holds the evolving searchInfo state.
        let hasReceivedContent = false;

        // Process incoming messages
        eventSource.onmessage = (event) => {
          // Handles every message streamed from the backend.
          try {
            const data = JSON.parse(event.data);

            if (data.type === "checkpoint") {
              // Store the checkpoint ID for future requests
              setCheckpointId(data.checkpoint_id); // this id is coming from the backend(AI responce)
            } else if (data.type === "content") {
              // keep adding the chunks to the streamed content.
              streamedContent += data.content;
              hasReceivedContent = true;

              // Update message with accumulated content
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiResponseId
                    ? // if the mesId of the messages we are getting from the backend(AI response)
                      //  equal to previously generated AIresponseId then add that content
                      { ...msg, content: streamedContent, isLoading: false } // filling the placeholder with the data as they come.
                    : msg
                )
              );

              // This block runs when the FastAPI backend sends a message like this:
              //  yield f'data: {{"type": "search_start", "query": "{safe_query}"}}\n\n'
            } else if (data.type === "search_start") {
              // Create search info with 'searching' stage
              const newSearchInfo = {
                // Creates a new object (newSearchInfo) to describe the current status of the AI search.
                stages: ["searching"],
                query: data.query,
                urls: [],
              };
              searchData = newSearchInfo;

              // Update the AI message with search info
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiResponseId
                    ? {
                        ...msg,
                        content: streamedContent, // whatever partial response has streamed in so far.
                        searchInfo: newSearchInfo, // attaches the "searching" stage info.
                        isLoading: false,
                      }
                    : msg
                )
              );
              // this block is triggered when the backend send
              // yield f'data: {{"type": "search_results", "urls": {urls_json}}}\n\n'
              // it indicated the process of searching has ended and it returns the url of all websites that it searched.
            } else if (data.type === "search_results") {
              try {
                // Parse URLs from search results
                const urls =
                  typeof data.urls === "string"
                    ? JSON.parse(data.urls)
                    : data.urls;

                // Update search info to add 'reading' stage (don't replace 'searching')
                const newSearchInfo = {
                  stages: searchData
                    ? [...searchData.stages, "reading"] // Appends the "reading" stage to whatever stages were already there (["searching"]).
                    : ["reading"],
                  query: searchData?.query || "",
                  urls: urls,
                };
                searchData = newSearchInfo;

                // Update the AI message with search info
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiResponseId
                      ? {
                          ...msg,
                          content: streamedContent, // Keeps previously streamed text (streamedContent).
                          searchInfo: newSearchInfo, // Attaches the updated searchInfo (now includes "reading" stage and the URLs).
                          isLoading: false,
                        }
                      : msg
                  )
                );
              } catch (err) {
                console.error("Error parsing search results:", err);
              }
            } else if (data.type === "search_error") {
              // Handle search error
              const newSearchInfo = {
                stages: searchData
                  ? [...searchData.stages, "error"]
                  : ["error"],
                query: searchData?.query || "", // the search phrase the AI is using to look things up on the web.
                error: data.error,
                urls: [],
              };
              searchData = newSearchInfo;

              // {
              //   stages: ["searching", "reading"],
              //   query: "capital of France",
              //   urls: ["https://en.wikipedia.org/wiki/Paris", "https://www.britannica.com/place/Paris"]
              // }

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiResponseId
                    ? {
                        ...msg,
                        content: streamedContent,
                        searchInfo: newSearchInfo,
                        isLoading: false,
                      }
                    : msg
                )
              );
              // it gets triggered when the backend sends
              // yield f'data: {{"type": "end"}}\n\n'
            } else if (data.type === "end") {
              // When stream ends, add 'writing' stage if we had search info
              if (searchData) {
                const finalSearchInfo = {
                  ...searchData,
                  stages: [...searchData.stages, "writing"],
                };

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiResponseId
                      ? {
                          ...msg,
                          searchInfo: finalSearchInfo,
                          isLoading: false,
                        }
                      : msg
                  )
                );
              }

              eventSource.close();
            }
          } catch (error) {
            console.error("Error parsing event data:", error, event.data);
          }
        };

        // Handle errors
        eventSource.onerror = (error) => {
          console.error("EventSource error:", error);
          eventSource.close();

          // Only update with error if we don't have content yet
          if (!streamedContent) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiResponseId
                  ? {
                      ...msg,
                      content:
                        "Sorry, there was an error processing your request.",
                      isLoading: false,
                    }
                  : msg
              )
            );
          }
        };

        // Listen for end event
        eventSource.addEventListener("end", () => {
          eventSource.close();
        });
      } catch (error) {
        console.error("Error setting up EventSource:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: newMessageId + 1,
            content: "Sorry, there was an error connecting to the server.",
            isUser: false,
            type: "message",
            isLoading: false,
          },
        ]);
      }
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chat-wrapper">
          <div className="chat-container">
            <MessageArea messages={messages} />
            <InputBar
              currentMessage={currentMessage}
              setCurrentMessage={setCurrentMessage}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        className="chat-toggle-button"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? (
          <span className="close-icon">&times;</span>
        ) : (
          // <svg
          //   className="chat-icon"
          //   xmlns="http://www.w3.org/2000/svg"
          //   fill="none"
          //   viewBox="0 0 24 24"
          //   stroke="white"
          // >
          //   <path
          //     strokeLinecap="round"
          //     strokeLinejoin="round"
          //     strokeWidth="2"
          //     d="M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          //   />
          // </svg>
          <TbMessageChatbot className="chat-icon"/>
        )}
      </button>
    </div>
  );
};

export default ChatMainHome;
