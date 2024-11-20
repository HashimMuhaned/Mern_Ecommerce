import { FiEdit } from "react-icons/fi";
import React, { Fragment, useState } from "react";
import ConfirmChangeEmail from "./ConfirmChangeEmail";

const EditEmailButton = ({ currnetEmail }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <Fragment>
      <button
        onClick={() => setShowModal(true)}
        style={{
          padding: "10px",
          border: "none",
          borderRadius: "4px",
          backgroundColor: "skyblue",
          color: "white",
          cursor: "pointer",
        }}
      >
        <FiEdit style={{ fontSize: "16px" }} />
      </button>
      <ConfirmChangeEmail
        show={showModal}
        onConfirm={() => setShowModal(false)} // Update this to handle name change logic
        onCancel={() => setShowModal(false)}
        currentEmail={currnetEmail}
      />
    </Fragment>
  );
};

export default EditEmailButton;
