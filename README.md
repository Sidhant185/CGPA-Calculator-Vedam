# Vedam Merit Score & CGPA Calculator

A web-based calculator for tracking Vedam Merit Scores and calculating ADYPU CGPA based on the official Vedam Merit Score Calculation guide.

## Features

- **Four Main Vedam Subjects**: 
  - Mathematics for AI - I
  - System & Web Basics
  - Fundamentals of Programming - Java (merged with Workshop)
  - Professional Communication (merged with Co-curricular Activities)

- **Flexible Contest Input**: 
  - Variable contest marks (not always out of 50)
  - Automatic scaling: Each contest scaled to /50, then total scaled to /40
  - Support for multiple contests per subject

- **Automatic ADYPU Mapping**:
  - Maths: UT + ET + CA (from Vedam, scaled to 30)
  - Web: UT + ET + Lab (from Vedam, scaled to 50)
  - Java: UT + ET + Lab (from Vedam, scaled to 50) + Workshop (from Vedam, scaled to 50)
  - Professional Communication: From Vedam (scaled to 50)
  - Co-curricular: From Vedam (scaled to 50)
  - Physics: UT + ET only
  - Physics Lab: From Professional Communication Vedam (scaled to 50)

- **Real-time Calculations**: 
  - Vedam Merit Score calculation with proper contest scaling
  - ADYPU marks calculation
  - CGPA calculation based on credits and marks
  - Eligibility status for Innovation Lab (≥60) and Placements (≥75)

- **Data Management**:
  - Local storage (automatic save)
  - Export/Import JSON data
  - Track pending assessments

## How to Use

### Getting Started

1. Open `index.html` in a web browser
2. Enter marks for each subject in the dedicated sections
3. Calculations update automatically

### Entering Contest Marks

For contest-based subjects (Maths, Web, Java):

1. Click "+ Add Contest" to add a contest
2. Enter **marks obtained** and **total marks** for each contest
   - Example: If you scored 70 out of 100, enter 70 and 100
   - The calculator automatically scales it to 35/50
3. Mark contests as "Pending" if not yet completed
4. Enter Mock Interview marks (out of 60)

**Calculation Process**:
1. Each contest is scaled: `(marks_obtained / total_marks) × 50`
2. All scaled contests are summed
3. Total is scaled to 40: `(scaled_sum / (number_of_contests × 50)) × 40`
4. Mock interview marks (out of 60) are added
5. Final Vedam Score = Contest_scaled + Mock_marks (out of 100)

### Professional Communication Components

Enter marks for:
- LinkedIn Profile: 10 marks
- Assignment: 10 marks
- CV + Email: 20 marks
- Presentation: 40 marks
- Attendance: 10 marks
- Case Study: 10 marks
- **Total: 100 marks**

### ADYPU Marks

#### Mathematics for AI - I (E0005A)
- **UT**: 20 marks (enter manually)
- **ET**: 50 marks (enter manually)
- **CA**: 30 marks (automatically calculated from Vedam score)
- **Total**: 100 marks

#### System & Web Basics (E00017A)
- **UT**: 20 marks (enter manually)
- **ET**: 50 marks (enter manually)
- **Total**: 70 marks
- **Lab (E00017B)**: 50 marks (from Web Vedam score)

#### Fundamentals of Programming - Java (E0025A)
- **UT**: 20 marks (enter manually)
- **ET**: 50 marks (enter manually)
- **Total**: 70 marks
- **Lab (E0025B)**: 50 marks (from Java Vedam score)
- **Workshop (E0033B)**: 50 marks (from Java Vedam score)

#### Professional Communication (E0028B)
- **Total**: 50 marks (from Professional Communication Vedam score)

#### Co-curricular Activities - I (E0035B)
- **Total**: 50 marks (from Professional Communication Vedam score)

#### General Physics (E0018A)
- **UT**: 20 marks (enter manually)
- **ET**: 50 marks (enter manually)
- **Total**: 70 marks
- **Lab (E0018B)**: 50 marks (from Professional Communication Vedam score)

## Calculation Formulas

### Vedam Merit Score (Contest-based Subjects)

1. **Scale each contest to /50**:
   ```
   Contest_scaled = (marks_obtained / total_marks) × 50
   ```

2. **Sum all scaled contests**:
   ```
   Scaled_sum = Sum of all Contest_scaled
   Max_scaled = number_of_contests × 50
   ```

3. **Scale contest total to /40**:
   ```
   Contest_total = (Scaled_sum / Max_scaled) × 40
   ```

4. **Add Mock Interview**:
   ```
   Vedam_Score = Contest_total + Mock_marks (out of 60)
   ```

### ADYPU Mapping

- **Maths CA**: `(Vedam_Maths / 100) × 30`
- **Web Lab**: `(Vedam_Web / 100) × 50`
- **Java Lab**: `(Vedam_Java / 100) × 50`
- **Java Workshop**: `(Vedam_Java / 100) × 50`
- **Professional Communication**: `(Vedam_ProfComm / 100) × 50`
- **Co-curricular**: `(Vedam_ProfComm / 100) × 50`
- **Physics Lab**: `(Vedam_ProfComm / 100) × 50`

### CGPA Calculation

CGPA is calculated using:
- Grade points = (Marks / Max_marks) × 10
- Weighted by credits
- CGPA = Total Grade Points / Total Credits

**Total Credits**: 22
- Mathematics: 4
- Web: 3
- Web Lab: 1
- Java: 3
- Java Lab: 1
- Workshop: 2
- Professional Communication: 2
- Co-curricular: 2
- Physics: 3
- Physics Lab: 1

## Eligibility Status

- **Innovation Lab Access**: Requires average Vedam Score ≥ 60
  - Average of 4 main subjects: Maths, Web, Java, Professional Communication

- **Placement Eligibility**: Requires average Vedam Score ≥ 75
  - Average of 4 main subjects: Maths, Web, Java, Professional Communication
  - Students with average < 30 are not considered for placements

## Example Calculation

**Subject: Java (4 contests)**
- Contest 1: 40/50 → Scaled: 40/50
- Contest 2: 35/50 → Scaled: 35/50
- Contest 3: 28/50 → Scaled: 28/50
- Contest 4: 30/50 → Scaled: 30/50
- Scaled sum: 133/200
- Contest scaled: (133/200) × 40 = 26.60
- Mock: 50/60
- **Vedam Total: 76.60/100**

**ADYPU Mapping**:
- Java Lab: (76.60/100) × 50 = 38.30/50
- Workshop: (76.60/100) × 50 = 38.30/50

## Browser Compatibility

Works best on modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Data Storage

- Data is automatically saved to browser's localStorage
- Export your data regularly as backup
- Data is stored locally on your device (not uploaded anywhere)

## Notes

- The structure is based on Semester 1
- Future semesters may have different structures
- Always verify calculations with official sources
- Missing contests/mocks are counted as 0, but scaling uses full maximum
- Professional Communication and Co-curricular share the same Vedam score
- Java and Workshop share the same Vedam score

## Support

For issues or questions, refer to the official "Vedam Merit Score Calculation - Student Guide" PDF.

---

**Version**: 2.0  
**Last Updated**: Based on updated Vedam Merit Score Calculation Guide
