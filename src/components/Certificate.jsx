import React, { forwardRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./Certificate.css";
import { CERT_TEMPLATE } from "./certificateTemplate";

// Certificate dimensions (matches template - 1235x1600 portrait)
const CERT_WIDTH = CERT_TEMPLATE.width;
const CERT_HEIGHT = CERT_TEMPLATE.height;

const Certificate = forwardRef(({
  name,
  semester,
  department,
  competition,
  year,
  position,
  kpmNo
}, ref) => {
  const getSlotStyle = (key) => {
    const slot = CERT_TEMPLATE.slots[key];
    return {
      left: `${slot.x}px`,
      top: `${slot.y}px`,
      width: `${slot.w}px`,
      height: `${slot.h}px`,
      textAlign: slot.align,
      justifyContent: slot.align === "left" ? "flex-start" : "center",
    };
  };

  const downloadPDF = async () => {
    const element = document.getElementById("certificate");
    if (!element) return;

    try {
      // Wait a bit to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 1, // Use scale 1 to match exact dimensions
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: CERT_WIDTH,
        height: CERT_HEIGHT,
        windowWidth: CERT_WIDTH,
        windowHeight: CERT_HEIGHT,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);

      // Create PDF with exact certificate dimensions
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [CERT_WIDTH, CERT_HEIGHT],
        compress: true,
      });

      pdf.addImage(imgData, "PNG", 0, 0, CERT_WIDTH, CERT_HEIGHT);
      pdf.save(`${name?.replace(/\s+/g, "_") || "certificate"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="certificate-wrapper">
      <div 
        className="certificate-container" 
        id="certificate"
        ref={ref}
        style={{ width: CERT_WIDTH, height: CERT_HEIGHT }}
      >
        <img
          src="/certificate-template.jpeg"
          alt="certificate template"
          className="certificate-bg"
        />

        {/* Dynamic Fields - Positioned to match template blanks */}
        
        {/* KPM Number - Top left section */}
        <div className="certificate-field kpm" style={getSlotStyle("kpm")}>{kpmNo}</div>

        {/* Student Name - Center of certificate */}
        <div className="certificate-field name" style={getSlotStyle("name")}>{name}</div>

        {/* Semester - Below name, left side */}
        <div className="certificate-field semester" style={getSlotStyle("semester")}>{semester}</div>

        {/* Department - Below name, right side */}
        <div className="certificate-field department" style={getSlotStyle("department")}>{department}</div>

        {/* Competition Name - Below department */}
        <div className="certificate-field competition" style={getSlotStyle("competition")}>{competition}</div>

        {/* Year - Bottom section */}
        <div className="certificate-field year" style={getSlotStyle("year")}>{year}</div>

        {/* Position - Bottom section, right side */}
        <div className="certificate-field position" style={getSlotStyle("position")}>{position}</div>
      </div>

      <div className="certificate-actions">
        <button className="download-btn" onClick={downloadPDF}>
          Download PDF
        </button>
      </div>
    </div>
  );
});

Certificate.displayName = "Certificate";

export default Certificate;
