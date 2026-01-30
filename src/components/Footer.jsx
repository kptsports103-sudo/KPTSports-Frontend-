// src/components/Footer/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import {
  FaCheckCircle,
  FaSitemap,
  FaQuestionCircle,
  FaVolumeUp,
  FaClipboardList,
  FaUniversity,
  FaUserGraduate,
  FaPhoneAlt,
  FaEnvelope
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      {/* Top Section */}
      <div className="footer-container">

        {/* Disclaimer */}
        <div className="footer-box">
          <h4 className="footer-title">Disclaimer</h4>
          <p>
            This website is developed as a student academic project. The
            information provided is related to sports activities of KPT and is
            for informational and educational purposes only.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-box">
          <h4 className="footer-title">Quick Links</h4>
          <ul className="footer-list">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/gallery">Gallery</Link></li>
            <li><Link to="/results">Results</Link></li>
          </ul>
        </div>

        {/* Policies */}
        <div className="footer-box">
          <h4 className="footer-title">Website Policies & Guidelines</h4>
          <ul className="footer-list">
            {[
              "Copyright Policy",
              "Hyperlinking Policy",
              "Security Policy",
              "Terms & Conditions",
              "Privacy Policy"
            ].map((item, i) => (
              <li key={i}>
                <FaCheckCircle /> <a href="javascript:void(0)">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Accessibility */}
        <div className="footer-box">
          <h4 className="footer-title">Accessibility Resources</h4>
          <ul className="footer-list">
            <li><FaSitemap /> <a href="javascript:void(0)">Sitemap</a></li>
            <li><FaQuestionCircle /> <a href="javascript:void(0)">Help</a></li>
            <li><FaVolumeUp /> <a href="javascript:void(0)">Screen Reader Access</a></li>
            <li><FaClipboardList /> <a href="javascript:void(0)">Guidelines</a></li>
          </ul>
        </div>
      </div>

      {/* Info Bar */}
      <div className="footer-info">
        <span>Last Updated: 2026</span>
        <span>Visitors Counter: 24891</span>
        <span>Version: KPT Sports Website 1.0</span>
      </div>

      {/* Institute Details */}
      <div className="footer-institute">
        <p>
          <FaUniversity />
          <strong>KARNATAKA (GOVT.) POLYTECHNIC, MANGALORE</strong><br />
          <span>(An Autonomous Institution Under AICTE, New Delhi)</span>
        </p>

        <div className="footer-meta">
          <p><strong>Project:</strong> KPT Sports Website</p>
          <p><strong>Department:</strong> Computer Science & Engineering (CSE)</p>
          <p><strong>Semester:</strong> Diploma – 6th Semester</p>
        </div>

        <div className="footer-developer">
          <p><FaUserGraduate /> Developed By: <strong>D. Yashawantha Reddy</strong></p>
          <p>Diploma CSE Student</p>
          <p><FaPhoneAlt /> Mobile: +91 XXXXX XXXXX</p>
          <p><FaEnvelope /> yashwanth@kpt.edu</p>
          <p><strong>Website Launch:</strong> 2026</p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        Designed, Developed & Hosted by KPT © 2026. All Rights Reserved.
      </div>

      {/* Feedback Button */}
      <button className="feedback-btn">Feedback</button>
    </footer>
  );
};

export default Footer;
