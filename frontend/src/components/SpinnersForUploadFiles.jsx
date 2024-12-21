import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

const override = {
  display: "block",
  margin: "auto",
};

const SpinnersForUploadFiles = () => {
  return <ClipLoader color="green" cssOverride={override} size={30} />;
};

export default SpinnersForUploadFiles;
