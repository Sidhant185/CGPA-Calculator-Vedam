// Subject maxima configuration
// UT+ET max: Maths=70 (20+50), Web=70, Java=70, Physics=70
// CA max: Maths=30 (separate from UT+ET)
const SUBJECT_MAX = {
  maths: { utet: 70, ca: 30, total: 100 }, // UT+ET=70, CA=30, Total=100
  web: { utet: 70, total: 70 }, // UT+ET=70
  java: { utet: 70, total: 70 }, // UT+ET=70
  physics: { utet: 70, total: 70 }, // UT+ET=70
};

// Application state
let appData = {
  subjects: {
    maths: {
      vedam: { contests: [], mockInterview: { marks: null, pending: true } },
      adypu: {
        ut: { marks: null, pending: true },
        et: { marks: null, pending: true },
      },
    },
    web: {
      vedam: { contests: [], mockInterview: { marks: null, pending: true } },
      adypu: {
        ut: { marks: null, pending: true },
        et: { marks: null, pending: true },
      },
    },
    java: {
      vedam: { contests: [], mockInterview: { marks: null, pending: true } },
      adypu: {
        ut: { marks: null, pending: true },
        et: { marks: null, pending: true },
      },
    },
    professionalCommunication: {
      vedam: {
        linkedinProfile: { marks: null, pending: true },
        assignment: { marks: null, pending: true },
        cvEmail: { marks: null, pending: true },
        presentation: { marks: null, pending: true },
        attendance: { marks: null, pending: true },
        caseStudy: { marks: null, pending: true },
      },
    },
    physics: {
      adypu: {
        ut: { marks: null, pending: true },
        et: { marks: null, pending: true },
      },
    },
  },
  targetCGPA: 7.5,
};

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  loadDataIntoUI();
  renderContests();
  updateData();
  setupEventListeners();
});

// Load data from localStorage
function loadData() {
  const saved = localStorage.getItem("vedamCGPA");
  if (saved) {
    try {
      const loaded = JSON.parse(saved);
      // Merge with defaults to handle missing fields
      appData = { ...appData, ...loaded };
      if (loaded.subjects) {
        Object.keys(loaded.subjects).forEach((key) => {
          if (appData.subjects[key]) {
            appData.subjects[key] = {
              ...appData.subjects[key],
              ...loaded.subjects[key],
            };
          }
        });
      }
    } catch (e) {
      console.error("Error loading data:", e);
    }
  }
}

// Save data to localStorage
function saveData() {
  localStorage.setItem("vedamCGPA", JSON.stringify(appData));
}

// Setup event listeners
function setupEventListeners() {
  document
    .getElementById("runSaveBtn")
    .addEventListener("click", runSaveScenario);
  document.getElementById("exportBtn").addEventListener("click", exportData);
  document.getElementById("importBtn").addEventListener("click", () => {
    document.getElementById("importFile").click();
  });
  document.getElementById("importFile").addEventListener("change", importData);
  document.getElementById("resetBtn").addEventListener("click", resetAllData);
}

// Render contest inputs
function renderContests() {
  ["maths", "web", "java"].forEach((subject) => {
    const container = document.getElementById(`${subject}-contests`);
    container.innerHTML = "";

    if (
      !appData.subjects[subject].vedam.contests ||
      appData.subjects[subject].vedam.contests.length === 0
    ) {
      appData.subjects[subject].vedam.contests = [{ marks: null, total: null }];
    }

    appData.subjects[subject].vedam.contests.forEach((contest, index) => {
      const contestDiv = document.createElement("div");
      contestDiv.className = "contest-item";
      contestDiv.innerHTML = `
                <label>Contest ${index + 1}:</label>
                <input type="number" min="0" step="0.1" 
                    value="${contest.marks !== null ? contest.marks : ""}" 
                    onchange="updateContest('${subject}', ${index}, 'marks', this.value)"
                    placeholder="Marks obtained">
                <span>out of</span>
                <input type="number" min="0" step="0.1" 
                    value="${contest.total !== null ? contest.total : ""}" 
                    onchange="updateContest('${subject}', ${index}, 'total', this.value)"
                    placeholder="Total marks">
                ${
                  appData.subjects[subject].vedam.contests.length > 1
                    ? `<button class="btn btn-small btn-danger" onclick="removeContest('${subject}', ${index})">Remove</button>`
                    : ""
                }
            `;
      container.appendChild(contestDiv);
    });
  });
}

// Add contest
window.addContest = function (subject) {
  if (!appData.subjects[subject].vedam.contests) {
    appData.subjects[subject].vedam.contests = [];
  }
  appData.subjects[subject].vedam.contests.push({ marks: null, total: null });
  saveData();
  renderContests();
  updateData();
};

// Remove contest
window.removeContest = function (subject, index) {
  if (appData.subjects[subject].vedam.contests.length > 1) {
    appData.subjects[subject].vedam.contests.splice(index, 1);
    saveData();
    renderContests();
    updateData();
  }
};

// Update contest
window.updateContest = function (subject, index, field, value) {
  if (field === "marks") {
    appData.subjects[subject].vedam.contests[index].marks =
      value !== "" ? parseFloat(value) : null;
  } else if (field === "total") {
    appData.subjects[subject].vedam.contests[index].total =
      value !== "" ? parseFloat(value) : null;
  }
  saveData();
  updateData();
};

// Calculate Vedam score for contest-based subjects
function calculateVedamScore(subject) {
  if (subject === "maths" || subject === "web" || subject === "java") {
    const vedam = appData.subjects[subject].vedam;

    // Scale each contest to /50, then sum
    let scaledContestSum = 0;
    let totalMaxScaled = 0;

    vedam.contests.forEach((contest) => {
      if (
        contest.marks !== null &&
        contest.total !== null &&
        contest.total > 0
      ) {
        // Scale to /50: (marks / total) * 50
        const scaled = (contest.marks / contest.total) * 50;
        scaledContestSum += scaled;
        totalMaxScaled += 50; // Each contest max is 50 after scaling
      }
    });

    // Get mock interview status
    const mockPending = vedam.mockInterview.pending;
    const mockMarks =
      !mockPending && vedam.mockInterview.marks !== null
        ? parseFloat(vedam.mockInterview.marks) || 0
        : null;

    // If mock is pending, scale contest to /100; otherwise scale to /40 and add mock /60
    if (mockPending || mockMarks === null) {
      // Mock is pending: scale contest to /100
      const contestScaled =
        totalMaxScaled > 0 ? (scaledContestSum / totalMaxScaled) * 100 : 0;
      return contestScaled;
    } else {
      // Mock is available: scale contest to /40 and add mock /60
      const contestScaled =
        totalMaxScaled > 0 ? (scaledContestSum / totalMaxScaled) * 40 : 0;
      return contestScaled + mockMarks;
    }
  } else if (subject === "professionalCommunication") {
    const vedam = appData.subjects.professionalCommunication.vedam;
    let total = 0;

    [
      "linkedinProfile",
      "assignment",
      "cvEmail",
      "presentation",
      "attendance",
      "caseStudy",
    ].forEach((component) => {
      if (!vedam[component].pending && vedam[component].marks !== null) {
        total += parseFloat(vedam[component].marks) || 0;
      }
    });

    return total;
  }
  return null;
}

// Calculate all and update UI
window.updateData = function () {
  // Update data from inputs
  updateDataFromInputs();

  // Calculate Vedam scores
  const vedamScores = {};
  ["maths", "web", "java", "professionalCommunication"].forEach((subject) => {
    const score = calculateVedamScore(subject);
    vedamScores[subject] = score;
  });

  // Update Vedam score displays
  document.getElementById("maths-vedam-total").textContent =
    vedamScores.maths !== null ? vedamScores.maths.toFixed(2) : "-";
  document.getElementById("web-vedam-total").textContent =
    vedamScores.web !== null ? vedamScores.web.toFixed(2) : "-";
  document.getElementById("java-vedam-total").textContent =
    vedamScores.java !== null ? vedamScores.java.toFixed(2) : "-";
  document.getElementById("prof-vedam-total").textContent =
    vedamScores.professionalCommunication !== null
      ? vedamScores.professionalCommunication.toFixed(2)
      : "-";

  // Calculate ADYPU marks
  calculateADYPUMarks(vedamScores);

  // Calculate Vedam average (only 4 main subjects)
  const mainScores = [
    vedamScores.maths,
    vedamScores.web,
    vedamScores.java,
    vedamScores.professionalCommunication,
  ].filter((s) => s !== null);
  const vedamAverage =
    mainScores.length > 0
      ? mainScores.reduce((a, b) => a + b, 0) / mainScores.length
      : 0;

  document.getElementById("vedamAverage").textContent = vedamAverage.toFixed(2);

  // Calculate CGPA
  const cgpa = calculateCGPA(vedamScores);
  document.getElementById("currentCGPA").textContent = cgpa.toFixed(2);

  // Update eligibility
  updateEligibility(vedamAverage);

  // Calculate and display required marks
  calculateRequiredMarks(vedamScores, cgpa);

  // Update grade points display
  updateGradePoints(vedamScores);

  saveData();
};

// Update data from input fields
function updateDataFromInputs() {
  // Maths
  appData.subjects.maths.vedam.mockInterview.marks =
    getInputValue("maths-mock");
  appData.subjects.maths.vedam.mockInterview.pending =
    document.getElementById("maths-mock-pending").checked;
  appData.subjects.maths.adypu.ut.marks = getInputValue("maths-ut");
  appData.subjects.maths.adypu.ut.pending =
    document.getElementById("maths-ut-pending").checked;
  appData.subjects.maths.adypu.et.marks = getInputValue("maths-et");
  appData.subjects.maths.adypu.et.pending =
    document.getElementById("maths-et-pending").checked;

  // Web
  appData.subjects.web.vedam.mockInterview.marks = getInputValue("web-mock");
  appData.subjects.web.vedam.mockInterview.pending =
    document.getElementById("web-mock-pending").checked;
  appData.subjects.web.adypu.ut.marks = getInputValue("web-ut");
  appData.subjects.web.adypu.ut.pending =
    document.getElementById("web-ut-pending").checked;
  appData.subjects.web.adypu.et.marks = getInputValue("web-et");
  appData.subjects.web.adypu.et.pending =
    document.getElementById("web-et-pending").checked;

  // Java
  appData.subjects.java.vedam.mockInterview.marks = getInputValue("java-mock");
  appData.subjects.java.vedam.mockInterview.pending =
    document.getElementById("java-mock-pending").checked;
  appData.subjects.java.adypu.ut.marks = getInputValue("java-ut");
  appData.subjects.java.adypu.ut.pending =
    document.getElementById("java-ut-pending").checked;
  appData.subjects.java.adypu.et.marks = getInputValue("java-et");
  appData.subjects.java.adypu.et.pending =
    document.getElementById("java-et-pending").checked;

  // Professional Communication
  appData.subjects.professionalCommunication.vedam.linkedinProfile.marks =
    getInputValue("prof-linkedin");
  appData.subjects.professionalCommunication.vedam.linkedinProfile.pending =
    document.getElementById("prof-linkedin-pending").checked;
  appData.subjects.professionalCommunication.vedam.assignment.marks =
    getInputValue("prof-assignment");
  appData.subjects.professionalCommunication.vedam.assignment.pending =
    document.getElementById("prof-assignment-pending").checked;
  appData.subjects.professionalCommunication.vedam.cvEmail.marks =
    getInputValue("prof-cv");
  appData.subjects.professionalCommunication.vedam.cvEmail.pending =
    document.getElementById("prof-cv-pending").checked;
  appData.subjects.professionalCommunication.vedam.presentation.marks =
    getInputValue("prof-presentation");
  appData.subjects.professionalCommunication.vedam.presentation.pending =
    document.getElementById("prof-presentation-pending").checked;
  appData.subjects.professionalCommunication.vedam.attendance.marks =
    getInputValue("prof-attendance");
  appData.subjects.professionalCommunication.vedam.attendance.pending =
    document.getElementById("prof-attendance-pending").checked;
  appData.subjects.professionalCommunication.vedam.caseStudy.marks =
    getInputValue("prof-casestudy");
  appData.subjects.professionalCommunication.vedam.caseStudy.pending =
    document.getElementById("prof-casestudy-pending").checked;

  // Physics
  appData.subjects.physics.adypu.ut.marks = getInputValue("physics-ut");
  appData.subjects.physics.adypu.ut.pending =
    document.getElementById("physics-ut-pending").checked;
  appData.subjects.physics.adypu.et.marks = getInputValue("physics-et");
  appData.subjects.physics.adypu.et.pending =
    document.getElementById("physics-et-pending").checked;

  // Target CGPA
  appData.targetCGPA =
    parseFloat(document.getElementById("targetCGPA").value) || 7.5;
}

function getInputValue(id) {
  const el = document.getElementById(id);
  return el && el.value !== "" ? parseFloat(el.value) : null;
}

// Calculate ADYPU marks
function calculateADYPUMarks(vedamScores) {
  // Maths: UT + ET (max 70) + CA (from Vedam, scaled to 30)
  // Total max is 100 (UT+ET=70, CA=30)
  const mathsUTET = calculateUTET(
    appData.subjects.maths.adypu.ut.marks,
    appData.subjects.maths.adypu.ut.pending,
    appData.subjects.maths.adypu.et.marks,
    appData.subjects.maths.adypu.et.pending,
    20,
    50,
    SUBJECT_MAX.maths.utet // 70, not 100
  );
  const mathsCA =
    vedamScores.maths !== null
      ? (vedamScores.maths / 100) * SUBJECT_MAX.maths.ca
      : 0;
  const mathsTotal = mathsUTET + mathsCA;
  document.getElementById("maths-ca").textContent = mathsCA.toFixed(2);
  document.getElementById("maths-total").textContent = mathsTotal.toFixed(2);

  // Web: UT + ET (reuse helper for consistency with CGPA)
  const webUTET = calculateUTET(
    appData.subjects.web.adypu.ut.marks,
    appData.subjects.web.adypu.ut.pending,
    appData.subjects.web.adypu.et.marks,
    appData.subjects.web.adypu.et.pending,
    20,
    50,
    SUBJECT_MAX.web.utet // 70
  );
  const webLab = vedamScores.web !== null ? (vedamScores.web / 100) * 50 : 0;
  document.getElementById("web-total").textContent = webUTET.toFixed(2);
  document.getElementById("web-lab").textContent = webLab.toFixed(2);

  // Java: UT + ET (reuse helper for consistency with CGPA)
  const javaUTET = calculateUTET(
    appData.subjects.java.adypu.ut.marks,
    appData.subjects.java.adypu.ut.pending,
    appData.subjects.java.adypu.et.marks,
    appData.subjects.java.adypu.et.pending,
    20,
    50,
    SUBJECT_MAX.java.utet // 70
  );
  const javaLab = vedamScores.java !== null ? (vedamScores.java / 100) * 50 : 0;
  const javaWorkshop =
    vedamScores.java !== null ? (vedamScores.java / 100) * 50 : 0;
  document.getElementById("java-total").textContent = javaUTET.toFixed(2);
  document.getElementById("java-lab").textContent = javaLab.toFixed(2);
  document.getElementById("java-workshop").textContent =
    javaWorkshop.toFixed(2);

  // Professional Communication: from Vedam (scaled to 50)
  const profADYPU =
    vedamScores.professionalCommunication !== null
      ? (vedamScores.professionalCommunication / 100) * 50
      : 0;
  document.getElementById("prof-adypu").textContent = profADYPU.toFixed(2);
  document.getElementById("prof-cocurricular").textContent =
    profADYPU.toFixed(2);

  // Physics: UT + ET (reuse helper for consistency with CGPA)
  const physicsUTET = calculateUTET(
    appData.subjects.physics.adypu.ut.marks,
    appData.subjects.physics.adypu.ut.pending,
    appData.subjects.physics.adypu.et.marks,
    appData.subjects.physics.adypu.et.pending,
    20,
    50,
    SUBJECT_MAX.physics.utet // 70
  );
  const physicsLab =
    vedamScores.professionalCommunication !== null
      ? (vedamScores.professionalCommunication / 100) * 50
      : 0;
  document.getElementById("physics-total").textContent = physicsUTET.toFixed(2);
  document.getElementById("physics-lab").textContent = physicsLab.toFixed(2);
}

// Calculate CGPA
function calculateCGPA(vedamScores) {
  // Credits: Maths(4), Web(3), Web Lab(1), Java(3), Java Lab(1), Java Workshop(2),
  //          Prof Comm(2), Co-curricular(2), Physics(3), Physics Lab(1) = 22 total

  const credits = {
    maths: 4,
    web: 3,
    webLab: 1,
    java: 3,
    javaLab: 1,
    javaWorkshop: 2,
    profComm: 2,
    coCurricular: 2,
    physics: 3,
    physicsLab: 1,
  };

  let totalGradePoints = 0;
  let totalCredits = 0;

  // Maths: (UT + ET) max 70, CA max 30, Total max 100
  const mathsUTET = calculateUTET(
    appData.subjects.maths.adypu.ut.marks,
    appData.subjects.maths.adypu.ut.pending,
    appData.subjects.maths.adypu.et.marks,
    appData.subjects.maths.adypu.et.pending,
    20,
    50,
    SUBJECT_MAX.maths.utet // 70, not 100
  );
  const mathsCA =
    vedamScores.maths !== null
      ? (vedamScores.maths / 100) * SUBJECT_MAX.maths.ca
      : 0;
  const mathsTotal = mathsUTET + mathsCA;
  // Always 100 for maths (UT+ET=70, CA=30)
  const mathsMax = SUBJECT_MAX.maths.total; // 100
  totalGradePoints += (mathsTotal / mathsMax) * 10 * credits.maths;
  totalCredits += credits.maths;

  // Web: (UT + ET) / 70 * 10 (scaled to 70 if pending)
  const webUTET = calculateUTET(
    appData.subjects.web.adypu.ut.marks,
    appData.subjects.web.adypu.ut.pending,
    appData.subjects.web.adypu.et.marks,
    appData.subjects.web.adypu.et.pending,
    20,
    50,
    SUBJECT_MAX.web.utet // 70
  );
  // Always 70 for Web (UT+ET)
  const webMax = SUBJECT_MAX.web.total; // 70
  totalGradePoints += (webUTET / webMax) * 10 * credits.web;
  totalCredits += credits.web;

  // Web Lab: from Vedam / 50 * 10
  const webLab = vedamScores.web !== null ? (vedamScores.web / 100) * 50 : 0;
  totalGradePoints += (webLab / 50) * 10 * credits.webLab;
  totalCredits += credits.webLab;

  // Java: (UT + ET) / 70 * 10 (scaled to 70 if pending)
  const javaUTET = calculateUTET(
    appData.subjects.java.adypu.ut.marks,
    appData.subjects.java.adypu.ut.pending,
    appData.subjects.java.adypu.et.marks,
    appData.subjects.java.adypu.et.pending,
    20,
    50,
    SUBJECT_MAX.java.utet // 70
  );
  // Always 70 for Java (UT+ET)
  const javaMax = SUBJECT_MAX.java.total; // 70
  totalGradePoints += (javaUTET / javaMax) * 10 * credits.java;
  totalCredits += credits.java;

  // Java Lab: from Vedam / 50 * 10
  const javaLab = vedamScores.java !== null ? (vedamScores.java / 100) * 50 : 0;
  totalGradePoints += (javaLab / 50) * 10 * credits.javaLab;
  totalCredits += credits.javaLab;

  // Java Workshop: from Vedam / 50 * 10
  const javaWorkshop =
    vedamScores.java !== null ? (vedamScores.java / 100) * 50 : 0;
  totalGradePoints += (javaWorkshop / 50) * 10 * credits.javaWorkshop;
  totalCredits += credits.javaWorkshop;

  // Professional Communication: from Vedam / 50 * 10
  const profComm =
    vedamScores.professionalCommunication !== null
      ? (vedamScores.professionalCommunication / 100) * 50
      : 0;
  totalGradePoints += (profComm / 50) * 10 * credits.profComm;
  totalCredits += credits.profComm;

  // Co-curricular: from Vedam / 50 * 10
  totalGradePoints += (profComm / 50) * 10 * credits.coCurricular;
  totalCredits += credits.coCurricular;

  // Physics: (UT + ET) / 70 * 10 (scaled to 70 if pending)
  const physicsUTET = calculateUTET(
    appData.subjects.physics.adypu.ut.marks,
    appData.subjects.physics.adypu.ut.pending,
    appData.subjects.physics.adypu.et.marks,
    appData.subjects.physics.adypu.et.pending,
    20,
    50,
    SUBJECT_MAX.physics.utet // 70
  );
  // Always 70 for Physics (UT+ET)
  const physicsMax = SUBJECT_MAX.physics.total; // 70
  totalGradePoints += (physicsUTET / physicsMax) * 10 * credits.physics;
  totalCredits += credits.physics;

  // Physics Lab: from Professional Communication Vedam / 50 * 10
  const physicsLab =
    vedamScores.professionalCommunication !== null
      ? (vedamScores.professionalCommunication / 100) * 50
      : 0;
  totalGradePoints += (physicsLab / 50) * 10 * credits.physicsLab;
  totalCredits += credits.physicsLab;

  return totalCredits > 0 ? totalGradePoints / totalCredits : 0;
}

// Update eligibility status
function updateEligibility(vedamAverage) {
  const innovationLab = document.getElementById("innovationLabStatus");
  const placement = document.getElementById("placementStatus");

  if (vedamAverage >= 60) {
    innovationLab.textContent = "Eligible";
    innovationLab.className = "status-badge eligible";
  } else {
    innovationLab.textContent = "Not Eligible";
    innovationLab.className = "status-badge not-eligible";
  }

  if (vedamAverage >= 75) {
    placement.textContent = "Eligible";
    placement.className = "status-badge eligible";
  } else if (vedamAverage < 30) {
    placement.textContent = "Not Considered";
    placement.className = "status-badge not-eligible";
  } else {
    placement.textContent = "Not Eligible";
    placement.className = "status-badge not-eligible";
  }
}

// Calculate total credits for pending assessments
function calculatePendingCredits() {
  let pendingCredits = 0;
  const credits = {
    maths: 4,
    web: 3,
    java: 3,
    physics: 3,
  };

  if (
    appData.subjects.maths.adypu.ut.pending ||
    appData.subjects.maths.adypu.et.pending
  ) {
    pendingCredits += credits.maths;
  }
  if (
    appData.subjects.web.adypu.ut.pending ||
    appData.subjects.web.adypu.et.pending
  ) {
    pendingCredits += credits.web;
  }
  if (
    appData.subjects.java.adypu.ut.pending ||
    appData.subjects.java.adypu.et.pending
  ) {
    pendingCredits += credits.java;
  }
  if (
    appData.subjects.physics.adypu.ut.pending ||
    appData.subjects.physics.adypu.et.pending
  ) {
    pendingCredits += credits.physics;
  }

  return pendingCredits;
}

// Calculate required marks for target CGPA
function calculateRequiredMarks(vedamScores, currentCGPA) {
  const container = document.getElementById("requiredMarksContainer");
  container.innerHTML = "";

  const targetCGPA =
    parseFloat(document.getElementById("targetCGPA").value) || 7.5;

  if (currentCGPA >= targetCGPA) {
    container.innerHTML =
      '<p style="color: #28a745; font-weight: 600; padding: 15px; text-align: center; background: #d4edda; border-radius: 8px;">✓ You have already achieved your target CGPA!</p>';
    return;
  }

  const totalCredits = 22; // Total credits
  const requiredTotalGradePoints = targetCGPA * totalCredits;

  // Calculate current total grade points (same logic as calculateCGPA)
  const credits = {
    maths: 4,
    web: 3,
    webLab: 1,
    java: 3,
    javaLab: 1,
    javaWorkshop: 2,
    profComm: 2,
    coCurricular: 2,
    physics: 3,
    physicsLab: 1,
  };

  let currentTotalGradePoints = 0;

  // Calculate current grade points for all subjects (same logic as calculateCGPA)
  const mathsUTET = calculateUTET(
    appData.subjects.maths.adypu.ut.marks,
    appData.subjects.maths.adypu.ut.pending,
    appData.subjects.maths.adypu.et.marks,
    appData.subjects.maths.adypu.et.pending,
    20,
    50,
    SUBJECT_MAX.maths.utet // 70, not 100
  );
  const mathsCA =
    vedamScores.maths !== null
      ? (vedamScores.maths / 100) * SUBJECT_MAX.maths.ca
      : 0;
  const mathsTotal = mathsUTET + mathsCA;
  const mathsMax = SUBJECT_MAX.maths.total; // 100
  currentTotalGradePoints += (mathsTotal / mathsMax) * 10 * credits.maths;

  const webUTET = calculateUTET(
    appData.subjects.web.adypu.ut.marks,
    appData.subjects.web.adypu.ut.pending,
    appData.subjects.web.adypu.et.marks,
    appData.subjects.web.adypu.et.pending,
    20,
    50,
    SUBJECT_MAX.web.utet // 70
  );
  const webMax = SUBJECT_MAX.web.total; // 70
  currentTotalGradePoints += (webUTET / webMax) * 10 * credits.web;

  const webLab = vedamScores.web !== null ? (vedamScores.web / 100) * 50 : 0;
  currentTotalGradePoints += (webLab / 50) * 10 * credits.webLab;

  const javaUTET = calculateUTET(
    appData.subjects.java.adypu.ut.marks,
    appData.subjects.java.adypu.ut.pending,
    appData.subjects.java.adypu.et.marks,
    appData.subjects.java.adypu.et.pending,
    20,
    50,
    SUBJECT_MAX.java.utet // 70
  );
  const javaMax = SUBJECT_MAX.java.total; // 70
  currentTotalGradePoints += (javaUTET / javaMax) * 10 * credits.java;

  const javaLab = vedamScores.java !== null ? (vedamScores.java / 100) * 50 : 0;
  currentTotalGradePoints += (javaLab / 50) * 10 * credits.javaLab;

  const javaWorkshop =
    vedamScores.java !== null ? (vedamScores.java / 100) * 50 : 0;
  currentTotalGradePoints += (javaWorkshop / 50) * 10 * credits.javaWorkshop;

  const profComm =
    vedamScores.professionalCommunication !== null
      ? (vedamScores.professionalCommunication / 100) * 50
      : 0;
  currentTotalGradePoints += (profComm / 50) * 10 * credits.profComm;
  currentTotalGradePoints += (profComm / 50) * 10 * credits.coCurricular;

  const physicsUTET = calculateUTET(
    appData.subjects.physics.adypu.ut.marks,
    appData.subjects.physics.adypu.ut.pending,
    appData.subjects.physics.adypu.et.marks,
    appData.subjects.physics.adypu.et.pending,
    20,
    50,
    SUBJECT_MAX.physics.utet // 70
  );
  const physicsMax = SUBJECT_MAX.physics.total; // 70
  currentTotalGradePoints += (physicsUTET / physicsMax) * 10 * credits.physics;

  const physicsLab =
    vedamScores.professionalCommunication !== null
      ? (vedamScores.professionalCommunication / 100) * 50
      : 0;
  currentTotalGradePoints += (physicsLab / 50) * 10 * credits.physicsLab;

  const neededGradePoints = requiredTotalGradePoints - currentTotalGradePoints;

  if (neededGradePoints <= 0) {
    container.innerHTML =
      '<p style="color: #28a745; font-weight: 600; padding: 15px; text-align: center; background: #d4edda; border-radius: 8px;">✓ You have already achieved your target CGPA!</p>';
    return;
  }

  // Calculate required marks for each pending field
  // Strategy: Calculate what marks are needed in each pending field to contribute enough to reach target
  const requiredMarks = [];
  const totalPendingCredits = calculatePendingCredits();

  if (totalPendingCredits === 0) {
    container.innerHTML =
      '<p style="color: #6c757d; padding: 15px; text-align: center;">No pending assessments found. All marks are entered.</p>';
    return;
  }

  // Calculate average grade points needed per pending credit
  const avgGradePointsNeeded = neededGradePoints / totalPendingCredits;

  // Maths UT pending
  // Maths total = UT+ET (max 70) + CA (30) = 100
  // When UT is pending, we need to calculate what UT+ET total is needed (out of 70)
  if (appData.subjects.maths.adypu.ut.pending) {
    const et =
      !appData.subjects.maths.adypu.et.pending &&
      appData.subjects.maths.adypu.et.marks !== null
        ? appData.subjects.maths.adypu.et.marks
        : 0;
    const ca = mathsCA;
    const neededMathsGradePoints = avgGradePointsNeeded * credits.maths;
    // Calculate needed total out of 100 (UT+ET+CA)
    const neededMathsTotal =
      (neededMathsGradePoints / 10) * SUBJECT_MAX.maths.total;
    // Calculate needed UT+ET total (out of 70)
    let neededUTETTotal = neededMathsTotal - ca;
    // Cap to maximum possible (70) - if target requires more, it's not achievable with UT+ET alone
    neededUTETTotal = Math.min(neededUTETTotal, SUBJECT_MAX.maths.utet);
    // Calculate needed UT out of actual max (20), given ET value
    // If ET is also pending, we need to scale proportionally: UT contributes 20/70 of the total
    // If ET is available, we subtract: neededUT = neededUTETTotal - et
    let neededUT;
    if (appData.subjects.maths.adypu.et.pending) {
      // ET is also pending, scale proportionally (UT max is 20 out of 70 total)
      neededUT = (neededUTETTotal / SUBJECT_MAX.maths.utet) * 20;
    } else {
      // ET is available, subtract it
      neededUT = neededUTETTotal - et;
    }
    neededUT = Math.max(0, Math.min(20, neededUT));
    if (neededUT >= 0 && neededUT <= 20) {
      requiredMarks.push({
        subject: "Mathematics for AI - I",
        field: "UT",
        required: neededUT.toFixed(2),
        max: 20,
        current: 0,
      });
    }
  }

  // Maths ET pending
  // Same logic as UT pending
  if (appData.subjects.maths.adypu.et.pending) {
    const ut =
      !appData.subjects.maths.adypu.ut.pending &&
      appData.subjects.maths.adypu.ut.marks !== null
        ? appData.subjects.maths.adypu.ut.marks
        : 0;
    const ca = mathsCA;
    const neededMathsGradePoints = avgGradePointsNeeded * credits.maths;
    // Calculate needed total out of 100 (UT+ET+CA)
    const neededMathsTotal =
      (neededMathsGradePoints / 10) * SUBJECT_MAX.maths.total;
    // Calculate needed UT+ET total (out of 70)
    let neededUTETTotal = neededMathsTotal - ca;
    // Cap to maximum possible (70) - if target requires more, it's not achievable with UT+ET alone
    neededUTETTotal = Math.min(neededUTETTotal, SUBJECT_MAX.maths.utet);
    // Calculate needed ET out of actual max (50), given UT value
    // If UT is also pending, we need to scale proportionally: ET contributes 50/70 of the total
    // If UT is available, we subtract: neededET = neededUTETTotal - ut
    let neededET;
    if (appData.subjects.maths.adypu.ut.pending) {
      // UT is also pending, scale proportionally (ET max is 50 out of 70 total)
      neededET = (neededUTETTotal / SUBJECT_MAX.maths.utet) * 50;
    } else {
      // UT is available, subtract it
      neededET = neededUTETTotal - ut;
    }
    neededET = Math.max(0, Math.min(50, neededET));
    if (neededET >= 0 && neededET <= 50) {
      requiredMarks.push({
        subject: "Mathematics for AI - I",
        field: "ET",
        required: neededET.toFixed(2),
        max: 50,
        current: 0,
      });
    }
  }

  // Web UT pending
  if (appData.subjects.web.adypu.ut.pending) {
    const et =
      !appData.subjects.web.adypu.et.pending &&
      appData.subjects.web.adypu.et.marks !== null
        ? appData.subjects.web.adypu.et.marks
        : 0;
    const neededWebGradePoints = avgGradePointsNeeded * credits.web;
    // Calculate needed total out of 70 (UT+ET max)
    const neededWebTotal = (neededWebGradePoints / 10) * 70;
    // Calculate needed UT out of actual max (20)
    const neededUT = Math.max(0, Math.min(20, neededWebTotal - et));
    if (neededUT >= 0 && neededUT <= 20) {
      requiredMarks.push({
        subject: "System & Web Basics",
        field: "UT",
        required: neededUT.toFixed(2),
        max: 20,
        current: 0,
      });
    }
  }

  // Web ET pending
  if (appData.subjects.web.adypu.et.pending) {
    const ut =
      !appData.subjects.web.adypu.ut.pending &&
      appData.subjects.web.adypu.ut.marks !== null
        ? appData.subjects.web.adypu.ut.marks
        : 0;
    const neededWebGradePoints = avgGradePointsNeeded * credits.web;
    // Calculate needed total out of 70 (UT+ET max)
    const neededWebTotal = (neededWebGradePoints / 10) * 70;
    // Calculate needed ET out of actual max (50)
    const neededET = Math.max(0, Math.min(50, neededWebTotal - ut));
    if (neededET >= 0 && neededET <= 50) {
      requiredMarks.push({
        subject: "System & Web Basics",
        field: "ET",
        required: neededET.toFixed(2),
        max: 50,
        current: 0,
      });
    }
  }

  // Java UT pending
  if (appData.subjects.java.adypu.ut.pending) {
    const et =
      !appData.subjects.java.adypu.et.pending &&
      appData.subjects.java.adypu.et.marks !== null
        ? appData.subjects.java.adypu.et.marks
        : 0;
    const neededJavaGradePoints = avgGradePointsNeeded * credits.java;
    // Calculate needed total out of 70 (UT+ET max)
    const neededJavaTotal = (neededJavaGradePoints / 10) * 70;
    // Calculate needed UT out of actual max (20)
    const neededUT = Math.max(0, Math.min(20, neededJavaTotal - et));
    if (neededUT >= 0 && neededUT <= 20) {
      requiredMarks.push({
        subject: "Java",
        field: "UT",
        required: neededUT.toFixed(2),
        max: 20,
        current: 0,
      });
    }
  }

  // Java ET pending
  if (appData.subjects.java.adypu.et.pending) {
    const ut =
      !appData.subjects.java.adypu.ut.pending &&
      appData.subjects.java.adypu.ut.marks !== null
        ? appData.subjects.java.adypu.ut.marks
        : 0;
    const neededJavaGradePoints = avgGradePointsNeeded * credits.java;
    // Calculate needed total out of 70 (UT+ET max)
    const neededJavaTotal = (neededJavaGradePoints / 10) * 70;
    // Calculate needed ET out of actual max (50)
    const neededET = Math.max(0, Math.min(50, neededJavaTotal - ut));
    if (neededET >= 0 && neededET <= 50) {
      requiredMarks.push({
        subject: "Java",
        field: "ET",
        required: neededET.toFixed(2),
        max: 50,
        current: 0,
      });
    }
  }

  // Physics UT pending
  if (appData.subjects.physics.adypu.ut.pending) {
    const et =
      !appData.subjects.physics.adypu.et.pending &&
      appData.subjects.physics.adypu.et.marks !== null
        ? appData.subjects.physics.adypu.et.marks
        : 0;
    const neededPhysicsGradePoints = avgGradePointsNeeded * credits.physics;
    // Calculate needed total out of 70 (UT+ET max)
    const neededPhysicsTotal = (neededPhysicsGradePoints / 10) * 70;
    // Calculate needed UT out of actual max (20)
    const neededUT = Math.max(0, Math.min(20, neededPhysicsTotal - et));
    if (neededUT >= 0 && neededUT <= 20) {
      requiredMarks.push({
        subject: "General Physics",
        field: "UT",
        required: neededUT.toFixed(2),
        max: 20,
        current: 0,
      });
    }
  }

  // Physics ET pending
  if (appData.subjects.physics.adypu.et.pending) {
    const ut =
      !appData.subjects.physics.adypu.ut.pending &&
      appData.subjects.physics.adypu.ut.marks !== null
        ? appData.subjects.physics.adypu.ut.marks
        : 0;
    const neededPhysicsGradePoints = avgGradePointsNeeded * credits.physics;
    // Calculate needed total out of 70 (UT+ET max)
    const neededPhysicsTotal = (neededPhysicsGradePoints / 10) * 70;
    // Calculate needed ET out of actual max (50)
    const neededET = Math.max(0, Math.min(50, neededPhysicsTotal - ut));
    if (neededET >= 0 && neededET <= 50) {
      requiredMarks.push({
        subject: "General Physics",
        field: "ET",
        required: neededET.toFixed(2),
        max: 50,
        current: 0,
      });
    }
  }

  // Mock Interview pending (for Vedam scores)
  // For Maths: Mock affects CA (30 marks), which affects CGPA
  if (appData.subjects.maths.vedam.mockInterview.pending) {
    const contests = appData.subjects.maths.vedam.contests;
    let scaledContestSum = 0;
    let totalMaxScaled = 0;
    contests.forEach((contest) => {
      if (
        contest.marks !== null &&
        contest.total !== null &&
        contest.total > 0
      ) {
        const scaled = (contest.marks / contest.total) * 50;
        scaledContestSum += scaled;
        totalMaxScaled += 50;
      }
    });
    if (totalMaxScaled > 0) {
      const contestScaledTo40 = (scaledContestSum / totalMaxScaled) * 40;
      // Calculate what Vedam score is needed to contribute enough to CGPA
      // CA = (Vedam/100) * 30, and CA affects CGPA through (Total/100) * 10 * 4
      // Total = UT+ET (max 70) + CA (30) = 100
      // We need: neededGradePoints from this subject
      const neededMathsGradePoints = avgGradePointsNeeded * credits.maths;
      // Calculate current UT+ET total (may be scaled if pending)
      const currentUTET = calculateUTET(
        appData.subjects.maths.adypu.ut.marks,
        appData.subjects.maths.adypu.ut.pending,
        appData.subjects.maths.adypu.et.marks,
        appData.subjects.maths.adypu.et.pending,
        20,
        50,
        SUBJECT_MAX.maths.utet  // 70
      );
      // (UT+ET + CA) / 100 * 10 * 4 = neededMathsGradePoints
      // Total needed = (neededMathsGradePoints/4/10) * 100
      // CA needed = Total needed - UT+ET
      const neededMathsTotal = (neededMathsGradePoints / 4 / 10) * SUBJECT_MAX.maths.total;
      const neededCA = neededMathsTotal - currentUTET;
      const neededVedam = (neededCA / SUBJECT_MAX.maths.ca) * 100;
      const neededMock = Math.max(
        0,
        Math.min(60, neededVedam - contestScaledTo40)
      );
      if (neededMock >= 0) {
        requiredMarks.push({
          subject: "Mathematics for AI - I",
          field: "Mock Interview",
          required: neededMock.toFixed(2),
          max: 60,
          current: contestScaledTo40.toFixed(2),
        });
      }
    }
  }

  // For Web: Mock affects Lab (50 marks), which affects CGPA
  if (appData.subjects.web.vedam.mockInterview.pending) {
    const contests = appData.subjects.web.vedam.contests;
    let scaledContestSum = 0;
    let totalMaxScaled = 0;
    contests.forEach((contest) => {
      if (
        contest.marks !== null &&
        contest.total !== null &&
        contest.total > 0
      ) {
        const scaled = (contest.marks / contest.total) * 50;
        scaledContestSum += scaled;
        totalMaxScaled += 50;
      }
    });
    if (totalMaxScaled > 0) {
      const contestScaledTo40 = (scaledContestSum / totalMaxScaled) * 40;
      const neededWebLabGradePoints = avgGradePointsNeeded * credits.webLab;
      // Lab = (Vedam/100) * 50, affects CGPA as (Lab/50) * 10 * 1
      // Lab = (neededWebLabGradePoints/1/10 * 50)
      const neededLab = (neededWebLabGradePoints / 1 / 10) * 50;
      const neededVedam = (neededLab / 50) * 100;
      const neededMock = Math.max(
        0,
        Math.min(60, neededVedam - contestScaledTo40)
      );
      if (neededMock >= 0) {
        requiredMarks.push({
          subject: "System & Web Basics",
          field: "Mock Interview",
          required: neededMock.toFixed(2),
          max: 60,
          current: contestScaledTo40.toFixed(2),
        });
      }
    }
  }

  // For Java: Mock affects Lab (50) and Workshop (50), which affects CGPA
  if (appData.subjects.java.vedam.mockInterview.pending) {
    const contests = appData.subjects.java.vedam.contests;
    let scaledContestSum = 0;
    let totalMaxScaled = 0;
    contests.forEach((contest) => {
      if (
        contest.marks !== null &&
        contest.total !== null &&
        contest.total > 0
      ) {
        const scaled = (contest.marks / contest.total) * 50;
        scaledContestSum += scaled;
        totalMaxScaled += 50;
      }
    });
    if (totalMaxScaled > 0) {
      const contestScaledTo40 = (scaledContestSum / totalMaxScaled) * 40;
      // Java Lab + Workshop = 3 credits total
      const neededJavaVedamGradePoints =
        avgGradePointsNeeded * (credits.javaLab + credits.javaWorkshop);
      // Lab = (Vedam/100) * 50, Workshop = (Vedam/100) * 50
      // Both contribute: (Lab/50) * 10 * 1 + (Workshop/50) * 10 * 2 = neededJavaVedamGradePoints
      // Simplified: (Vedam/100) * 10 * 3 = neededJavaVedamGradePoints
      const neededVedam = (neededJavaVedamGradePoints / 3 / 10) * 100;
      const neededMock = Math.max(
        0,
        Math.min(60, neededVedam - contestScaledTo40)
      );
      if (neededMock >= 0) {
        requiredMarks.push({
          subject: "Java",
          field: "Mock Interview",
          required: neededMock.toFixed(2),
          max: 60,
          current: contestScaledTo40.toFixed(2),
        });
      }
    }
  }

  // Display required marks
  if (requiredMarks.length === 0) {
    container.innerHTML =
      '<p style="color: #6c757d; padding: 15px; text-align: center; background: #f8f9fa; border-radius: 8px;">No pending assessments found. All marks are entered.</p>';
  } else {
    // Add header
    const header = document.createElement("div");
    header.style.cssText =
      "margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #dee2e6;";
    header.innerHTML =
      '<p style="color: #6c757d; font-size: 0.9em; margin: 0;">Marks needed in pending fields to reach target CGPA:</p>';
    container.appendChild(header);

    requiredMarks.forEach((item) => {
      const markItem = document.createElement("div");
      markItem.className = "required-marks-item";
      const percentage = ((parseFloat(item.required) / item.max) * 100).toFixed(
        1
      );
      const isAchievable = parseFloat(item.required) <= item.max;

      markItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong style="color: #495057; font-size: 1em;">${
                      item.subject
                    }</strong>
                    <span style="color: ${
                      isAchievable ? "#28a745" : "#dc3545"
                    }; font-weight: 700; font-size: 1.1em;">${
        item.required
      } / ${item.max}</span>
                </div>
                <div style="color: #6c757d; font-size: 0.9em; line-height: 1.6;">
                    <div style="margin-bottom: 4px;"><strong>Field:</strong> ${
                      item.field
                    }</div>
                    <div style="margin-bottom: 4px;"><strong>Required:</strong> ${
                      item.required
                    } marks (${percentage}%)</div>
                    ${
                      item.current
                        ? `<div><strong>Current Contest Score:</strong> ${item.current} / 40</div>`
                        : ""
                    }
                    ${
                      !isAchievable
                        ? '<div style="color: #dc3545; font-weight: 600; margin-top: 8px;">⚠ Target may be difficult to achieve with this field alone</div>'
                        : ""
                    }
                </div>
            `;
      container.appendChild(markItem);
    });
  }
}

// Update grade points display
function updateGradePoints(vedamScores) {
  const container = document.getElementById("gradePointsContainer");
  container.innerHTML = "";

  // Calculate max values based on pending status
  // All UT+ET subjects have max of 70 (not 100 when pending)
  const webMax = 70;
  const javaMax = 70;
  const physicsMax = 70;

  const subjects = [
    {
      name: "Mathematics for AI - I",
      code: "E0005A",
      credits: 4,
      total: getMathsTotal(vedamScores),
      max: 100,
    },
    {
      name: "System & Web Basics",
      code: "E00017A",
      credits: 3,
      total: getWebTotal(vedamScores),
      max: webMax,
    },
    {
      name: "Web Lab",
      code: "E00017B",
      credits: 1,
      total: vedamScores.web ? (vedamScores.web / 100) * 50 : 0,
      max: 50,
    },
    {
      name: "Java",
      code: "E0025A",
      credits: 3,
      total: getJavaTotal(vedamScores),
      max: javaMax,
    },
    {
      name: "Java Lab",
      code: "E0025B",
      credits: 1,
      total: vedamScores.java ? (vedamScores.java / 100) * 50 : 0,
      max: 50,
    },
    {
      name: "Workshop",
      code: "E0033B",
      credits: 2,
      total: vedamScores.java ? (vedamScores.java / 100) * 50 : 0,
      max: 50,
    },
    {
      name: "Professional Communication",
      code: "E0028B",
      credits: 2,
      total: vedamScores.professionalCommunication
        ? (vedamScores.professionalCommunication / 100) * 50
        : 0,
      max: 50,
    },
    {
      name: "Co-curricular",
      code: "E0035B",
      credits: 2,
      total: vedamScores.professionalCommunication
        ? (vedamScores.professionalCommunication / 100) * 50
        : 0,
      max: 50,
    },
    {
      name: "General Physics",
      code: "E0018A",
      credits: 3,
      total: getPhysicsTotal(vedamScores),
      max: physicsMax,
    },
    {
      name: "Physics Lab",
      code: "E0018B",
      credits: 1,
      total: vedamScores.professionalCommunication
        ? (vedamScores.professionalCommunication / 100) * 50
        : 0,
      max: 50,
    },
  ];

  subjects.forEach((subject) => {
    const gradePoint = (subject.total / subject.max) * 10;
    const item = document.createElement("div");
    item.className = "grade-point-item";
    item.innerHTML = `
            <div class="grade-point-header">
                <span>${subject.name} (${subject.code})</span>
                <span>${subject.total.toFixed(2)} / ${subject.max}</span>
            </div>
            <div class="grade-point-details">
                <span>Credits: ${subject.credits}</span>
                <span>Grade Point: ${gradePoint.toFixed(2)}</span>
            </div>
        `;
    container.appendChild(item);
  });
}

// Helper function to calculate UT+ET with pending logic
// For subjects with UT+ET only (Web, Java, Physics): max is 70 (20+50)
// For Maths: UT+ET max is 70 (20+50), CA is separate (30), total is 100
// totalMax parameter is the maximum for UT+ET combined (always 70, never 100)
function calculateUTET(
  utMarks,
  utPending,
  etMarks,
  etPending,
  utMax = 20,
  etMax = 50,
  totalMax = 70 // Always 70 for UT+ET (Maths, Web, Java, Physics all use 70)
) {
  const ut = !utPending && utMarks !== null ? utMarks : null;
  const et = !etPending && etMarks !== null ? etMarks : null;

  // If both are available, return sum
  if (ut !== null && et !== null) {
    return ut + et;
  }

  // If only UT is available and ET is pending, scale UT to totalMax
  if (ut !== null && et === null) {
    return (ut / utMax) * totalMax;
  }

  // If only ET is available and UT is pending, scale ET to totalMax
  if (ut === null && et !== null) {
    return (et / etMax) * totalMax;
  }

  // If both are pending, return 0
  return 0;
}

function getMathsTotal(vedamScores) {
  const utetTotal = calculateUTET(
    appData.subjects.maths.adypu.ut.marks,
    appData.subjects.maths.adypu.ut.pending,
    appData.subjects.maths.adypu.et.marks,
    appData.subjects.maths.adypu.et.pending,
    20,
    50,
    SUBJECT_MAX.maths.utet // 70, not 100
  );
  const ca =
    vedamScores.maths !== null
      ? (vedamScores.maths / 100) * SUBJECT_MAX.maths.ca
      : 0;
  return utetTotal + ca;
}

function getWebTotal(vedamScores) {
  return calculateUTET(
    appData.subjects.web.adypu.ut.marks,
    appData.subjects.web.adypu.ut.pending,
    appData.subjects.web.adypu.et.marks,
    appData.subjects.web.adypu.et.pending,
    20,
    50,
    SUBJECT_MAX.web.utet // 70
  );
}

function getJavaTotal(vedamScores) {
  return calculateUTET(
    appData.subjects.java.adypu.ut.marks,
    appData.subjects.java.adypu.ut.pending,
    appData.subjects.java.adypu.et.marks,
    appData.subjects.java.adypu.et.pending,
    20,
    50,
    SUBJECT_MAX.java.utet // 70
  );
}

function getPhysicsTotal(vedamScores) {
  return calculateUTET(
    appData.subjects.physics.adypu.ut.marks,
    appData.subjects.physics.adypu.ut.pending,
    appData.subjects.physics.adypu.et.marks,
    appData.subjects.physics.adypu.et.pending,
    20,
    50,
    SUBJECT_MAX.physics.utet // 70
  );
}

// Run / Save Scenario - Calculate and save current state
function runSaveScenario() {
  // Update data from inputs first
  updateDataFromInputs();

  // Calculate all values
  updateData();

  // Save to localStorage
  saveData();

  // Also export to JSON file
  const dataStr = JSON.stringify(appData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  link.download = `vedam-cgpa-scenario-${timestamp}.json`;
  link.click();
  URL.revokeObjectURL(url);

  // Show success message
  const btn = document.getElementById("runSaveBtn");
  const originalText = btn.textContent;
  btn.textContent = "✓ Saved!";
  btn.style.background = "linear-gradient(135deg, #28a745 0%, #20c997 100%)";
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = "";
  }, 2000);
}

// Export data
function exportData() {
  updateDataFromInputs();
  const dataStr = JSON.stringify(appData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "vedam-cgpa-data.json";
  link.click();
  URL.revokeObjectURL(url);
}

// Import data
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      appData = { ...appData, ...imported };
      if (imported.subjects) {
        Object.keys(imported.subjects).forEach((key) => {
          if (appData.subjects[key]) {
            appData.subjects[key] = {
              ...appData.subjects[key],
              ...imported.subjects[key],
            };
          }
        });
      }
      saveData();
      loadDataIntoUI();
      updateData();
      alert("Data imported successfully!");
    } catch (err) {
      alert("Error importing data: " + err.message);
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

// Load data into UI
function loadDataIntoUI() {
  if (!appData.subjects) return;

  // Helper function to safely set checkbox
  function setCheckbox(id, checked) {
    const el = document.getElementById(id);
    if (el) el.checked = checked || false;
  }

  // Maths
  if (appData.subjects.maths) {
    setInputValue(
      "maths-mock",
      appData.subjects.maths.vedam?.mockInterview?.marks
    );
    setCheckbox(
      "maths-mock-pending",
      appData.subjects.maths.vedam?.mockInterview?.pending
    );
    setInputValue("maths-ut", appData.subjects.maths.adypu?.ut?.marks);
    setCheckbox("maths-ut-pending", appData.subjects.maths.adypu?.ut?.pending);
    setInputValue("maths-et", appData.subjects.maths.adypu?.et?.marks);
    setCheckbox("maths-et-pending", appData.subjects.maths.adypu?.et?.pending);
  }

  // Web
  if (appData.subjects.web) {
    setInputValue("web-mock", appData.subjects.web.vedam?.mockInterview?.marks);
    setCheckbox(
      "web-mock-pending",
      appData.subjects.web.vedam?.mockInterview?.pending
    );
    setInputValue("web-ut", appData.subjects.web.adypu?.ut?.marks);
    setCheckbox("web-ut-pending", appData.subjects.web.adypu?.ut?.pending);
    setInputValue("web-et", appData.subjects.web.adypu?.et?.marks);
    setCheckbox("web-et-pending", appData.subjects.web.adypu?.et?.pending);
  }

  // Java
  if (appData.subjects.java) {
    setInputValue(
      "java-mock",
      appData.subjects.java.vedam?.mockInterview?.marks
    );
    setCheckbox(
      "java-mock-pending",
      appData.subjects.java.vedam?.mockInterview?.pending
    );
    setInputValue("java-ut", appData.subjects.java.adypu?.ut?.marks);
    setCheckbox("java-ut-pending", appData.subjects.java.adypu?.ut?.pending);
    setInputValue("java-et", appData.subjects.java.adypu?.et?.marks);
    setCheckbox("java-et-pending", appData.subjects.java.adypu?.et?.pending);
  }

  // Professional Communication
  if (appData.subjects.professionalCommunication) {
    setInputValue(
      "prof-linkedin",
      appData.subjects.professionalCommunication.vedam?.linkedinProfile?.marks
    );
    setCheckbox(
      "prof-linkedin-pending",
      appData.subjects.professionalCommunication.vedam?.linkedinProfile?.pending
    );
    setInputValue(
      "prof-assignment",
      appData.subjects.professionalCommunication.vedam?.assignment?.marks
    );
    setCheckbox(
      "prof-assignment-pending",
      appData.subjects.professionalCommunication.vedam?.assignment?.pending
    );
    setInputValue(
      "prof-cv",
      appData.subjects.professionalCommunication.vedam?.cvEmail?.marks
    );
    setCheckbox(
      "prof-cv-pending",
      appData.subjects.professionalCommunication.vedam?.cvEmail?.pending
    );
    setInputValue(
      "prof-presentation",
      appData.subjects.professionalCommunication.vedam?.presentation?.marks
    );
    setCheckbox(
      "prof-presentation-pending",
      appData.subjects.professionalCommunication.vedam?.presentation?.pending
    );
    setInputValue(
      "prof-attendance",
      appData.subjects.professionalCommunication.vedam?.attendance?.marks
    );
    setCheckbox(
      "prof-attendance-pending",
      appData.subjects.professionalCommunication.vedam?.attendance?.pending
    );
    setInputValue(
      "prof-casestudy",
      appData.subjects.professionalCommunication.vedam?.caseStudy?.marks
    );
    setCheckbox(
      "prof-casestudy-pending",
      appData.subjects.professionalCommunication.vedam?.caseStudy?.pending
    );
  }

  // Physics
  if (appData.subjects.physics) {
    setInputValue("physics-ut", appData.subjects.physics.adypu?.ut?.marks);
    setCheckbox(
      "physics-ut-pending",
      appData.subjects.physics.adypu?.ut?.pending
    );
    setInputValue("physics-et", appData.subjects.physics.adypu?.et?.marks);
    setCheckbox(
      "physics-et-pending",
      appData.subjects.physics.adypu?.et?.pending
    );
  }

  // Target CGPA
  const targetEl = document.getElementById("targetCGPA");
  if (targetEl) targetEl.value = appData.targetCGPA || 7.5;

  renderContests();
}

function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (el && value !== null) {
    el.value = value;
  }
}

// Reset all data
function resetAllData() {
  if (
    confirm(
      "Are you sure you want to reset all data? This action cannot be undone."
    )
  ) {
    // Reset to initial state
    appData = {
      subjects: {
        maths: {
          vedam: {
            contests: [{ marks: null, total: null }],
            mockInterview: { marks: null, pending: true },
          },
          adypu: {
            ut: { marks: null, pending: true },
            et: { marks: null, pending: true },
          },
        },
        web: {
          vedam: {
            contests: [{ marks: null, total: null }],
            mockInterview: { marks: null, pending: true },
          },
          adypu: {
            ut: { marks: null, pending: true },
            et: { marks: null, pending: true },
          },
        },
        java: {
          vedam: {
            contests: [{ marks: null, total: null }],
            mockInterview: { marks: null, pending: true },
          },
          adypu: {
            ut: { marks: null, pending: true },
            et: { marks: null, pending: true },
          },
        },
        professionalCommunication: {
          vedam: {
            linkedinProfile: { marks: null, pending: true },
            assignment: { marks: null, pending: true },
            cvEmail: { marks: null, pending: true },
            presentation: { marks: null, pending: true },
            attendance: { marks: null, pending: true },
            caseStudy: { marks: null, pending: true },
          },
        },
        physics: {
          adypu: {
            ut: { marks: null, pending: true },
            et: { marks: null, pending: true },
          },
        },
      },
      targetCGPA: 7.5,
    };

    // Clear localStorage
    localStorage.removeItem("vedamCGPA");

    // Clear all input fields directly
    // Maths
    document.getElementById("maths-mock").value = "";
    document.getElementById("maths-mock-pending").checked = true;
    document.getElementById("maths-ut").value = "";
    document.getElementById("maths-ut-pending").checked = true;
    document.getElementById("maths-et").value = "";
    document.getElementById("maths-et-pending").checked = true;

    // Web
    document.getElementById("web-mock").value = "";
    document.getElementById("web-mock-pending").checked = true;
    document.getElementById("web-ut").value = "";
    document.getElementById("web-ut-pending").checked = true;
    document.getElementById("web-et").value = "";
    document.getElementById("web-et-pending").checked = true;

    // Java
    document.getElementById("java-mock").value = "";
    document.getElementById("java-mock-pending").checked = true;
    document.getElementById("java-ut").value = "";
    document.getElementById("java-ut-pending").checked = true;
    document.getElementById("java-et").value = "";
    document.getElementById("java-et-pending").checked = true;

    // Professional Communication
    document.getElementById("prof-linkedin").value = "";
    document.getElementById("prof-linkedin-pending").checked = true;
    document.getElementById("prof-assignment").value = "";
    document.getElementById("prof-assignment-pending").checked = true;
    document.getElementById("prof-cv").value = "";
    document.getElementById("prof-cv-pending").checked = true;
    document.getElementById("prof-presentation").value = "";
    document.getElementById("prof-presentation-pending").checked = true;
    document.getElementById("prof-attendance").value = "";
    document.getElementById("prof-attendance-pending").checked = true;
    document.getElementById("prof-casestudy").value = "";
    document.getElementById("prof-casestudy-pending").checked = true;

    // Physics
    document.getElementById("physics-ut").value = "";
    document.getElementById("physics-ut-pending").checked = true;
    document.getElementById("physics-et").value = "";
    document.getElementById("physics-et-pending").checked = true;

    // Target CGPA
    document.getElementById("targetCGPA").value = 7.5;

    // Reset contests and update UI
    renderContests();
    updateData();

    alert("All data has been reset successfully!");
  }
}
