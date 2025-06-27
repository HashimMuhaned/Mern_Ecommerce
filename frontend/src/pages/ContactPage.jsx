import React, { useState } from "react";
import "../contactStyling.css";
import contactImage from "../assets/Service-Help-Desk.png";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaPhoneAlt } from "react-icons/fa";
import { CiMail } from "react-icons/ci";
import { FaLocationDot } from "react-icons/fa6";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    complaintType: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.subject) newErrors.subject = "Subject is required";
    if (!formData.complaintType)
      newErrors.complaintType = "Please select a complaint type";
    if (!formData.message) newErrors.message = "Message is required";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        complaintType: "",
        message: "",
      });
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <section className="contact">
      <div className="container contact__container">
        <aside className="contact__aside">
          <div className="aside__image">
            <img src={contactImage} alt="" />
          </div>
          <p style={{ marginTop: "10px" }}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Repellendus, repellat quos aperiam quo ut suscipit. Vel eveniet
            repellat exercitationem temporibus.
          </p>
          <ul className="contact__details">
            <li>
              <FaPhoneAlt />
              <h5>+0464326 6363576 67535</h5>
            </li>
            <li>
              <CiMail />
              <h5>Support@gmail.com</h5>
            </li>
            <li>
              <FaLocationDot />
              <h5>UAE, Ajman</h5>
            </li>
          </ul>

          <ul className="contact__socials">
            <li>
              <a href="#">
                <FaFacebook />
              </a>
            </li>
            <li>
              <a href="#">
                <FaInstagram />
              </a>
            </li>
            <li>
              <a href="#">
                <FaTwitter />
              </a>
            </li>
            <li>
              <a href="#">
                <FaLinkedin />
              </a>
            </li>
          </ul>
        </aside>
        <form
          action="https://formspree.io/f/mayvkoqy"
          method="POST"
          className="contact__form"
        >
          <div id="contact_title">
            <p>Contact</p>
          </div>
          <div className="form__name">
            <input
              type="text"
              name="First Name"
              placeholder="First Name"
              id="first_name_contact"
              required
            />
            <input
              type="text"
              name="Last Name"
              placeholder="Last Name"
              id="last_name_contact"
              required
            />
          </div>
          <input
            type="Email"
            name="Email Address"
            placeholder="Your Email address"
            id="email_contact"
            required
          />
          <textarea
            name="Message"
            rows="7"
            placeholder="Message"
            id="message_contact"
            required
          ></textarea>
          <button type="submit" className="btn btn-primary">
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactPage;
