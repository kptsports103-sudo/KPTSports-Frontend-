import React, { useState } from "react";
import Certificate from "./Certificate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./CertificateGenerator.css";

const CertificateGenerator = () => {
  const [students, setStudents] = useState([
    {
      id: 1,
      name: "Rahul Kumar",
      semester: "5th",
      department: "Mechanical",
      competition: "Inter Polytechnic Football Tournament",
      year: "2026",
      position: "1st",
      kpmNo: "KPM-2026-001",
    },
    {
      id: 2,
      name: "Priya Sharma",
      semester: "3rd",
      department: "Electronics",
      competition: "Inter Polytechnic Chess Championship",
      year: "2026",
      position: "2nd",
      kpmNo: "KPM-2026-002",
    },
  ]);

  const [currentStudent, setCurrentStudent] = useState(students[0]);
  const [newStudent, setNewStudent] = useState({
    name: "",
    semester: "",
    department: "",
    competition: "",
    year: "",
    position: "",
    kpmNo: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({ ...prev, [name]: value }));
  };

  const addStudent = () => {
    if (newStudent.name && newStudent.kpmNo) {
      const student = {
        id: Date.now(),
        ...newStudent,
      };
      setStudents((prev) => [...prev, student]);
      setNewStudent({
        name: "",
        semester: "",
        department: "",
        competition: "",
        year: "",
        position: "",
        kpmNo: "",
      });
    }
  };

  const downloadSinglePDF = async (student) => {
    const input = document.getElementById("certificate");

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "px", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${student.name.replace(/\s+/g, "_")}_certificate.pdf`);
  };

  const downloadAllPDFs = async () => {
    for (const student of students) {
      // Temporarily set current student
      setCurrentStudent(student);

      // Wait for render
      await new Promise((resolve) => setTimeout(resolve, 100));

      const input = document.getElementById("certificate");
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "px", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${student.name.replace(/\s+/g, "_")}_certificate.pdf`);
    }
  };

  return (
    <div className="certificate-generator">
      <h2>Certificate Generator</h2>

      <div className="generator-content">
        {/* Student List */}
        <div className="student-list">
          <h3>Students</h3>
          <ul>
            {students.map((student) => (
              <li
                key={student.id}
                className={
                  currentStudent.id === student.id ? "active" : ""
                }
                onClick={() => setCurrentStudent(student)}
              >
                {student.name} - {student.position}
              </li>
            ))}
          </ul>
        </div>

        {/* Certificate Preview */}
        <div className="certificate-preview">
          <Certificate
            ref={(node) => {
              if (node) {
                // Force re-render when currentStudent changes
              }
            }}
            name={currentStudent.name}
            semester={currentStudent.semester}
            department={currentStudent.department}
            competition={currentStudent.competition}
            year={currentStudent.year}
            position={currentStudent.position}
            kpmNo={currentStudent.kpmNo}
          />
        </div>

        {/* Add New Student Form */}
        <div className="add-student-form">
          <h3>Add New Student</h3>
          <div className="form-grid">
            <input
              type="text"
              name="kpmNo"
              placeholder="KPM No."
              value={newStudent.kpmNo}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="name"
              placeholder="Student Name"
              value={newStudent.name}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="semester"
              placeholder="Semester"
              value={newStudent.semester}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="department"
              placeholder="Department"
              value={newStudent.department}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="competition"
              placeholder="Competition"
              value={newStudent.competition}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="year"
              placeholder="Year"
              value={newStudent.year}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="position"
              placeholder="Position"
              value={newStudent.position}
              onChange={handleInputChange}
            />
          </div>
          <button className="add-btn" onClick={addStudent}>
            Add Student
          </button>
          <button className="download-all-btn" onClick={downloadAllPDFs}>
            Download All Certificates
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;
