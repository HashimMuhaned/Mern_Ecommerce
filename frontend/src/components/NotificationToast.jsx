import React from "react";

const NotificationToast = () => {
  function showToast(message, type = "success", duration = 3000) {
    const toastContainer = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Trigger the animation
    setTimeout(() => {
      toast.classList.add("show");
    }, 10);

    // Remove the toast after the specified duration
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 300);
    }, duration);
  }
  return <div id="toast-container">
    
  </div>;
};

export default NotificationToast;
