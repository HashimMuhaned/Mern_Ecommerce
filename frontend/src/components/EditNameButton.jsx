import React, { Fragment, useState, useContext } from "react";
import ConfirmChangeName from "../components/ConfirmChangeName";
import { FiEdit } from "react-icons/fi";
import { CheckUserContext } from "../context/CheckUserToken";

const EditNameButton = ({ field, currentName }) => {
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
      <ConfirmChangeName
        show={showModal}
        onConfirm={() => setShowModal(false)} // Update this to handle name change logic
        onCancel={() => setShowModal(false)}
        currentName={currentName}
        field={field}
      />
    </Fragment>
  );
};

export default EditNameButton;
