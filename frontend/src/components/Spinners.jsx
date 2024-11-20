import ClipLoader from "react-spinners/ClipLoader";
import React from "react";


const override = {
  display: "block",
  margin: "100px auto",
};

const Spinners = () => {
  return <ClipLoader color="green" cssOverride={override} size={150} />;
};

export default Spinners;
