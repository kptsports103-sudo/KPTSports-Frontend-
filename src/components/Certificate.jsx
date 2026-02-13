import React, { forwardRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./Certificate.css";

const Certificate = forwardRef(({
  name,
  semester,
  department,
  competition,
  year,
  position,
  kpmNo
}, ref) => {
  const downloadPDF = async () => {
    const input = document.getElementById("certificate");

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");

    // A4 landscape dimensions in pixels (at 96 DPI)
    const pdf = new jsPDF("landscape", "px", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${name.replace(/\s+/g, "_")}_certificate.pdf`);
  };

  return (
    <div className="certificate-wrapper">
      <div className="certificate-container" id="certificate" ref={ref}>
        <img
          src="/certificate-template.jpeg"
          alt="certificate template"
          className="certificate-bg"
        />

        {/* Dynamic Fields - Positioned to match template blanks */}
        
        {/* KPM Number - Top left section */}
        <div className="certificate-field kpm">{kpmNo}</div>

        {/* Student Name - Center of certificate */}
        <div className="certificate-field name">{name}</div>

        {/* Semester - Below name, left side */}
        <div className="certificate-field semester">{semester}</div>

        {/* Department - Below name, right side */}
        <div className="certificate-field department">{department}</div>

        {/* Competition Name - Below department */}
        <div className="certificate-field competition">{competition}</div>

        {/* Year - Bottom section */}
        <div className="certificate-field year">{year}</div>

        {/* Position - Bottom section, right side */}
        <div className="certificate-field position">{position}</div>
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
