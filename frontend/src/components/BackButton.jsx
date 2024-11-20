import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();
  return (
    <section>
      <button
        id="backbtn"
        onClick={() => navigate(-1)}
        style={{ padding: "10px", fontSize: "16px" }}
      >
        Go Back
      </button>
    </section>
  );
};

export default BackButton;
