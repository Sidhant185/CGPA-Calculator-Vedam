// Application state
let appData = {
    subjects: {
        maths: {
            vedam: { contests: [], mockInterview: { marks: null, pending: true } },
            adypu: { ut: { marks: null, pending: true }, et: { marks: null, pending: true } }
        },
        web: {
            vedam: { contests: [], mockInterview: { marks: null, pending: true } },
            adypu: { ut: { marks: null, pending: true }, et: { marks: null, pending: true } }
        },
        java: {
            vedam: { contests: [], mockInterview: { marks: null, pending: true } },
            adypu: { ut: { marks: null, pending: true }, et: { marks: null, pending: true } }
        },
        professionalCommunication: {
            vedam: {
                linkedinProfile: { marks: null, pending: true },
                assignment: { marks: null, pending: true },
                cvEmail: { marks: null, pending: true },
                presentation: { marks: null, pending: true },
                attendance: { marks: null, pending: true },
                caseStudy: { marks: null, pending: true }
            }
        },
        physics: {
            adypu: { ut: { marks: null, pending: true }, et: { marks: null, pending: true } }
        }
    },
    targetCGPA: 7.5
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    loadDataIntoUI();
    renderContests();
    updateData();
    setupEventListeners();
});

// Load data from localStorage
function loadData() {
    const saved = localStorage.getItem('vedamCGPA');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            // Merge with defaults to handle missing fields
            appData = { ...appData, ...loaded };
            if (loaded.subjects) {
                Object.keys(loaded.subjects).forEach(key => {
                    if (appData.subjects[key]) {
                        appData.subjects[key] = { ...appData.subjects[key], ...loaded.subjects[key] };
                    }
                });
            }
        } catch (e) {
            console.error('Error loading data:', e);
        }
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('vedamCGPA', JSON.stringify(appData));
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', importData);
    document.getElementById('resetBtn').addEventListener('click', resetAllData);
}

// Render contest inputs
function renderContests() {
    ['maths', 'web', 'java'].forEach(subject => {
        const container = document.getElementById(`${subject}-contests`);
        container.innerHTML = '';
        
        if (!appData.subjects[subject].vedam.contests || appData.subjects[subject].vedam.contests.length === 0) {
            appData.subjects[subject].vedam.contests = [{ marks: null, total: null }];
        }
        
        appData.subjects[subject].vedam.contests.forEach((contest, index) => {
            const contestDiv = document.createElement('div');
            contestDiv.className = 'contest-item';
            contestDiv.innerHTML = `
                <label>Contest ${index + 1}:</label>
                <input type="number" min="0" step="0.1" 
                    value="${contest.marks !== null ? contest.marks : ''}" 
                    onchange="updateContest('${subject}', ${index}, 'marks', this.value)"
                    placeholder="Marks obtained">
                <span>out of</span>
                <input type="number" min="0" step="0.1" 
                    value="${contest.total !== null ? contest.total : ''}" 
                    onchange="updateContest('${subject}', ${index}, 'total', this.value)"
                    placeholder="Total marks">
                ${appData.subjects[subject].vedam.contests.length > 1 ? 
                    `<button class="btn btn-small btn-danger" onclick="removeContest('${subject}', ${index})">Remove</button>` : ''}
            `;
            container.appendChild(contestDiv);
        });
    });
}

// Add contest
window.addContest = function(subject) {
    if (!appData.subjects[subject].vedam.contests) {
        appData.subjects[subject].vedam.contests = [];
    }
    appData.subjects[subject].vedam.contests.push({ marks: null, total: null });
    saveData();
    renderContests();
    updateData();
};

// Remove contest
window.removeContest = function(subject, index) {
    if (appData.subjects[subject].vedam.contests.length > 1) {
        appData.subjects[subject].vedam.contests.splice(index, 1);
        saveData();
        renderContests();
        updateData();
    }
};

// Update contest
window.updateContest = function(subject, index, field, value) {
    if (field === 'marks') {
        appData.subjects[subject].vedam.contests[index].marks = value !== '' ? parseFloat(value) : null;
    } else if (field === 'total') {
        appData.subjects[subject].vedam.contests[index].total = value !== '' ? parseFloat(value) : null;
    }
    saveData();
    updateData();
};

// Calculate Vedam score for contest-based subjects
function calculateVedamScore(subject) {
    if (subject === 'maths' || subject === 'web' || subject === 'java') {
        const vedam = appData.subjects[subject].vedam;
        
        // Scale each contest to /50, then sum
        let scaledContestSum = 0;
        let totalMaxScaled = 0;
        
        vedam.contests.forEach(contest => {
            if (contest.marks !== null && contest.total !== null && contest.total > 0) {
                // Scale to /50: (marks / total) * 50
                const scaled = (contest.marks / contest.total) * 50;
                scaledContestSum += scaled;
                totalMaxScaled += 50; // Each contest max is 50 after scaling
            }
        });
        
        // Scale contest total to /40
        const contestScaled = totalMaxScaled > 0 ? (scaledContestSum / totalMaxScaled) * 40 : 0;
        
        // Get mock interview marks
        const mockMarks = (!vedam.mockInterview.pending && vedam.mockInterview.marks !== null) 
            ? parseFloat(vedam.mockInterview.marks) || 0 
            : 0;
        
        return contestScaled + mockMarks;
    } else if (subject === 'professionalCommunication') {
        const vedam = appData.subjects.professionalCommunication.vedam;
        let total = 0;
        
        ['linkedinProfile', 'assignment', 'cvEmail', 'presentation', 'attendance', 'caseStudy'].forEach(component => {
            if (!vedam[component].pending && vedam[component].marks !== null) {
                total += parseFloat(vedam[component].marks) || 0;
            }
        });
        
        return total;
    }
    return null;
}

// Calculate all and update UI
window.updateData = function() {
    // Update data from inputs
    updateDataFromInputs();
    
    // Calculate Vedam scores
    const vedamScores = {};
    ['maths', 'web', 'java', 'professionalCommunication'].forEach(subject => {
        const score = calculateVedamScore(subject);
        vedamScores[subject] = score;
    });
    
    // Update Vedam score displays
    document.getElementById('maths-vedam-total').textContent = vedamScores.maths !== null ? vedamScores.maths.toFixed(2) : '-';
    document.getElementById('web-vedam-total').textContent = vedamScores.web !== null ? vedamScores.web.toFixed(2) : '-';
    document.getElementById('java-vedam-total').textContent = vedamScores.java !== null ? vedamScores.java.toFixed(2) : '-';
    document.getElementById('prof-vedam-total').textContent = vedamScores.professionalCommunication !== null ? vedamScores.professionalCommunication.toFixed(2) : '-';
    
    // Calculate ADYPU marks
    calculateADYPUMarks(vedamScores);
    
    // Calculate Vedam average (only 4 main subjects)
    const mainScores = [vedamScores.maths, vedamScores.web, vedamScores.java, vedamScores.professionalCommunication]
        .filter(s => s !== null);
    const vedamAverage = mainScores.length > 0 
        ? mainScores.reduce((a, b) => a + b, 0) / mainScores.length 
        : 0;
    
    document.getElementById('vedamAverage').textContent = vedamAverage.toFixed(2);
    
    // Calculate CGPA
    const cgpa = calculateCGPA(vedamScores);
    document.getElementById('currentCGPA').textContent = cgpa.toFixed(2);
    
    // Update eligibility
    updateEligibility(vedamAverage);
    
    // Update grade points display
    updateGradePoints(vedamScores);
    
    saveData();
};

// Update data from input fields
function updateDataFromInputs() {
    // Maths
    appData.subjects.maths.vedam.mockInterview.marks = getInputValue('maths-mock');
    appData.subjects.maths.vedam.mockInterview.pending = document.getElementById('maths-mock-pending').checked;
    appData.subjects.maths.adypu.ut.marks = getInputValue('maths-ut');
    appData.subjects.maths.adypu.ut.pending = document.getElementById('maths-ut-pending').checked;
    appData.subjects.maths.adypu.et.marks = getInputValue('maths-et');
    appData.subjects.maths.adypu.et.pending = document.getElementById('maths-et-pending').checked;
    
    // Web
    appData.subjects.web.vedam.mockInterview.marks = getInputValue('web-mock');
    appData.subjects.web.vedam.mockInterview.pending = document.getElementById('web-mock-pending').checked;
    appData.subjects.web.adypu.ut.marks = getInputValue('web-ut');
    appData.subjects.web.adypu.ut.pending = document.getElementById('web-ut-pending').checked;
    appData.subjects.web.adypu.et.marks = getInputValue('web-et');
    appData.subjects.web.adypu.et.pending = document.getElementById('web-et-pending').checked;
    
    // Java
    appData.subjects.java.vedam.mockInterview.marks = getInputValue('java-mock');
    appData.subjects.java.vedam.mockInterview.pending = document.getElementById('java-mock-pending').checked;
    appData.subjects.java.adypu.ut.marks = getInputValue('java-ut');
    appData.subjects.java.adypu.ut.pending = document.getElementById('java-ut-pending').checked;
    appData.subjects.java.adypu.et.marks = getInputValue('java-et');
    appData.subjects.java.adypu.et.pending = document.getElementById('java-et-pending').checked;
    
    // Professional Communication
    appData.subjects.professionalCommunication.vedam.linkedinProfile.marks = getInputValue('prof-linkedin');
    appData.subjects.professionalCommunication.vedam.linkedinProfile.pending = document.getElementById('prof-linkedin-pending').checked;
    appData.subjects.professionalCommunication.vedam.assignment.marks = getInputValue('prof-assignment');
    appData.subjects.professionalCommunication.vedam.assignment.pending = document.getElementById('prof-assignment-pending').checked;
    appData.subjects.professionalCommunication.vedam.cvEmail.marks = getInputValue('prof-cv');
    appData.subjects.professionalCommunication.vedam.cvEmail.pending = document.getElementById('prof-cv-pending').checked;
    appData.subjects.professionalCommunication.vedam.presentation.marks = getInputValue('prof-presentation');
    appData.subjects.professionalCommunication.vedam.presentation.pending = document.getElementById('prof-presentation-pending').checked;
    appData.subjects.professionalCommunication.vedam.attendance.marks = getInputValue('prof-attendance');
    appData.subjects.professionalCommunication.vedam.attendance.pending = document.getElementById('prof-attendance-pending').checked;
    appData.subjects.professionalCommunication.vedam.caseStudy.marks = getInputValue('prof-casestudy');
    appData.subjects.professionalCommunication.vedam.caseStudy.pending = document.getElementById('prof-casestudy-pending').checked;
    
    // Physics
    appData.subjects.physics.adypu.ut.marks = getInputValue('physics-ut');
    appData.subjects.physics.adypu.ut.pending = document.getElementById('physics-ut-pending').checked;
    appData.subjects.physics.adypu.et.marks = getInputValue('physics-et');
    appData.subjects.physics.adypu.et.pending = document.getElementById('physics-et-pending').checked;
    
    // Target CGPA
    appData.targetCGPA = parseFloat(document.getElementById('targetCGPA').value) || 7.5;
}

function getInputValue(id) {
    const el = document.getElementById(id);
    return el && el.value !== '' ? parseFloat(el.value) : null;
}

// Calculate ADYPU marks
function calculateADYPUMarks(vedamScores) {
    // Maths: UT + ET + CA (from Vedam, scaled to 30)
    const mathsUTET = calculateUTET(
        appData.subjects.maths.adypu.ut.marks,
        appData.subjects.maths.adypu.ut.pending,
        appData.subjects.maths.adypu.et.marks,
        appData.subjects.maths.adypu.et.pending,
        20, 50
    );
    const mathsCA = vedamScores.maths !== null ? (vedamScores.maths / 100) * 30 : 0;
    const mathsTotal = mathsUTET + mathsCA;
    document.getElementById('maths-ca').textContent = mathsCA.toFixed(2);
    document.getElementById('maths-total').textContent = mathsTotal.toFixed(2);
    
    // Web: UT + ET, Lab from Vedam (scaled to 50)
    const webUT = (!appData.subjects.web.adypu.ut.pending && appData.subjects.web.adypu.ut.marks !== null) 
        ? appData.subjects.web.adypu.ut.marks : 0;
    const webET = (!appData.subjects.web.adypu.et.pending && appData.subjects.web.adypu.et.marks !== null) 
        ? appData.subjects.web.adypu.et.marks : 0;
    const webTotal = webUT + webET;
    const webLab = vedamScores.web !== null ? (vedamScores.web / 100) * 50 : 0;
    document.getElementById('web-total').textContent = webTotal.toFixed(2);
    document.getElementById('web-lab').textContent = webLab.toFixed(2);
    
    // Java: UT + ET, Lab and Workshop from Vedam (each scaled to 50)
    const javaUT = (!appData.subjects.java.adypu.ut.pending && appData.subjects.java.adypu.ut.marks !== null) 
        ? appData.subjects.java.adypu.ut.marks : 0;
    const javaET = (!appData.subjects.java.adypu.et.pending && appData.subjects.java.adypu.et.marks !== null) 
        ? appData.subjects.java.adypu.et.marks : 0;
    const javaTotal = javaUT + javaET;
    const javaLab = vedamScores.java !== null ? (vedamScores.java / 100) * 50 : 0;
    const javaWorkshop = vedamScores.java !== null ? (vedamScores.java / 100) * 50 : 0;
    document.getElementById('java-total').textContent = javaTotal.toFixed(2);
    document.getElementById('java-lab').textContent = javaLab.toFixed(2);
    document.getElementById('java-workshop').textContent = javaWorkshop.toFixed(2);
    
    // Professional Communication: from Vedam (scaled to 50)
    const profADYPU = vedamScores.professionalCommunication !== null 
        ? (vedamScores.professionalCommunication / 100) * 50 : 0;
    document.getElementById('prof-adypu').textContent = profADYPU.toFixed(2);
    document.getElementById('prof-cocurricular').textContent = profADYPU.toFixed(2);
    
    // Physics: UT + ET, Lab from Professional Communication Vedam (scaled to 50)
    const physicsUTET = calculateUTET(
        appData.subjects.physics.adypu.ut.marks,
        appData.subjects.physics.adypu.ut.pending,
        appData.subjects.physics.adypu.et.marks,
        appData.subjects.physics.adypu.et.pending,
        20, 50
    );
    const physicsLab = vedamScores.professionalCommunication !== null 
        ? (vedamScores.professionalCommunication / 100) * 50 : 0;
    document.getElementById('physics-total').textContent = physicsUTET.toFixed(2);
    document.getElementById('physics-lab').textContent = physicsLab.toFixed(2);
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
        physicsLab: 1
    };
    
    let totalGradePoints = 0;
    let totalCredits = 0;
    
    // Maths: (UT + ET + CA) / 100 * 10
    const mathsUTET = calculateUTET(
        appData.subjects.maths.adypu.ut.marks,
        appData.subjects.maths.adypu.ut.pending,
        appData.subjects.maths.adypu.et.marks,
        appData.subjects.maths.adypu.et.pending,
        20, 50
    );
    const mathsCA = vedamScores.maths !== null ? (vedamScores.maths / 100) * 30 : 0;
    const mathsTotal = mathsUTET + mathsCA;
    // For CGPA, if UT or ET is pending, scale to 100; otherwise use actual total
    const mathsMax = (appData.subjects.maths.adypu.ut.pending || appData.subjects.maths.adypu.et.pending) 
        ? 100 : 100; // Always 100 for maths (UT+ET+CA)
    totalGradePoints += (mathsTotal / mathsMax) * 10 * credits.maths;
    totalCredits += credits.maths;
    
    // Web: (UT + ET) / 70 * 10 (or scaled to 100 if pending)
    const webUTET = calculateUTET(
        appData.subjects.web.adypu.ut.marks,
        appData.subjects.web.adypu.ut.pending,
        appData.subjects.web.adypu.et.marks,
        appData.subjects.web.adypu.et.pending,
        20, 50
    );
    const webMax = (appData.subjects.web.adypu.ut.pending || appData.subjects.web.adypu.et.pending) ? 100 : 70;
    totalGradePoints += (webUTET / webMax) * 10 * credits.web;
    totalCredits += credits.web;
    
    // Web Lab: from Vedam / 50 * 10
    const webLab = vedamScores.web !== null ? (vedamScores.web / 100) * 50 : 0;
    totalGradePoints += (webLab / 50) * 10 * credits.webLab;
    totalCredits += credits.webLab;
    
    // Java: (UT + ET) / 70 * 10 (or scaled to 100 if pending)
    const javaUTET = calculateUTET(
        appData.subjects.java.adypu.ut.marks,
        appData.subjects.java.adypu.ut.pending,
        appData.subjects.java.adypu.et.marks,
        appData.subjects.java.adypu.et.pending,
        20, 50
    );
    const javaMax = (appData.subjects.java.adypu.ut.pending || appData.subjects.java.adypu.et.pending) ? 100 : 70;
    totalGradePoints += (javaUTET / javaMax) * 10 * credits.java;
    totalCredits += credits.java;
    
    // Java Lab: from Vedam / 50 * 10
    const javaLab = vedamScores.java !== null ? (vedamScores.java / 100) * 50 : 0;
    totalGradePoints += (javaLab / 50) * 10 * credits.javaLab;
    totalCredits += credits.javaLab;
    
    // Java Workshop: from Vedam / 50 * 10
    const javaWorkshop = vedamScores.java !== null ? (vedamScores.java / 100) * 50 : 0;
    totalGradePoints += (javaWorkshop / 50) * 10 * credits.javaWorkshop;
    totalCredits += credits.javaWorkshop;
    
    // Professional Communication: from Vedam / 50 * 10
    const profComm = vedamScores.professionalCommunication !== null 
        ? (vedamScores.professionalCommunication / 100) * 50 : 0;
    totalGradePoints += (profComm / 50) * 10 * credits.profComm;
    totalCredits += credits.profComm;
    
    // Co-curricular: from Vedam / 50 * 10
    totalGradePoints += (profComm / 50) * 10 * credits.coCurricular;
    totalCredits += credits.coCurricular;
    
    // Physics: (UT + ET) / 70 * 10 (or scaled to 100 if pending)
    const physicsUTET = calculateUTET(
        appData.subjects.physics.adypu.ut.marks,
        appData.subjects.physics.adypu.ut.pending,
        appData.subjects.physics.adypu.et.marks,
        appData.subjects.physics.adypu.et.pending,
        20, 50
    );
    const physicsMax = (appData.subjects.physics.adypu.ut.pending || appData.subjects.physics.adypu.et.pending) ? 100 : 70;
    totalGradePoints += (physicsUTET / physicsMax) * 10 * credits.physics;
    totalCredits += credits.physics;
    
    // Physics Lab: from Professional Communication Vedam / 50 * 10
    const physicsLab = vedamScores.professionalCommunication !== null 
        ? (vedamScores.professionalCommunication / 100) * 50 : 0;
    totalGradePoints += (physicsLab / 50) * 10 * credits.physicsLab;
    totalCredits += credits.physicsLab;
    
    return totalCredits > 0 ? totalGradePoints / totalCredits : 0;
}

// Update eligibility status
function updateEligibility(vedamAverage) {
    const innovationLab = document.getElementById('innovationLabStatus');
    const placement = document.getElementById('placementStatus');
    
    if (vedamAverage >= 60) {
        innovationLab.textContent = 'Eligible';
        innovationLab.className = 'status-badge eligible';
    } else {
        innovationLab.textContent = 'Not Eligible';
        innovationLab.className = 'status-badge not-eligible';
    }
    
    if (vedamAverage >= 75) {
        placement.textContent = 'Eligible';
        placement.className = 'status-badge eligible';
    } else if (vedamAverage < 30) {
        placement.textContent = 'Not Considered';
        placement.className = 'status-badge not-eligible';
    } else {
        placement.textContent = 'Not Eligible';
        placement.className = 'status-badge not-eligible';
    }
}

// Update grade points display
function updateGradePoints(vedamScores) {
    const container = document.getElementById('gradePointsContainer');
    container.innerHTML = '';
    
    // Calculate max values based on pending status
    const webMax = (appData.subjects.web.adypu.ut.pending || appData.subjects.web.adypu.et.pending) ? 100 : 70;
    const javaMax = (appData.subjects.java.adypu.ut.pending || appData.subjects.java.adypu.et.pending) ? 100 : 70;
    const physicsMax = (appData.subjects.physics.adypu.ut.pending || appData.subjects.physics.adypu.et.pending) ? 100 : 70;
    
    const subjects = [
        { name: 'Mathematics for AI - I', code: 'E0005A', credits: 4, total: getMathsTotal(vedamScores), max: 100 },
        { name: 'System & Web Basics', code: 'E00017A', credits: 3, total: getWebTotal(vedamScores), max: webMax },
        { name: 'Web Lab', code: 'E00017B', credits: 1, total: vedamScores.web ? (vedamScores.web / 100) * 50 : 0, max: 50 },
        { name: 'Java', code: 'E0025A', credits: 3, total: getJavaTotal(vedamScores), max: javaMax },
        { name: 'Java Lab', code: 'E0025B', credits: 1, total: vedamScores.java ? (vedamScores.java / 100) * 50 : 0, max: 50 },
        { name: 'Workshop', code: 'E0033B', credits: 2, total: vedamScores.java ? (vedamScores.java / 100) * 50 : 0, max: 50 },
        { name: 'Professional Communication', code: 'E0028B', credits: 2, total: vedamScores.professionalCommunication ? (vedamScores.professionalCommunication / 100) * 50 : 0, max: 50 },
        { name: 'Co-curricular', code: 'E0035B', credits: 2, total: vedamScores.professionalCommunication ? (vedamScores.professionalCommunication / 100) * 50 : 0, max: 50 },
        { name: 'General Physics', code: 'E0018A', credits: 3, total: getPhysicsTotal(vedamScores), max: physicsMax },
        { name: 'Physics Lab', code: 'E0018B', credits: 1, total: vedamScores.professionalCommunication ? (vedamScores.professionalCommunication / 100) * 50 : 0, max: 50 }
    ];
    
    subjects.forEach(subject => {
        const gradePoint = (subject.total / subject.max) * 10;
        const item = document.createElement('div');
        item.className = 'grade-point-item';
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
function calculateUTET(utMarks, utPending, etMarks, etPending, utMax = 20, etMax = 50) {
    const ut = (!utPending && utMarks !== null) ? utMarks : null;
    const et = (!etPending && etMarks !== null) ? etMarks : null;
    
    // If both are available, return sum
    if (ut !== null && et !== null) {
        return ut + et;
    }
    
    // If only UT is available and ET is pending, scale UT to 100
    if (ut !== null && et === null) {
        return (ut / utMax) * 100;
    }
    
    // If only ET is available and UT is pending, scale ET to 100
    if (ut === null && et !== null) {
        return (et / etMax) * 100;
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
        20, 50
    );
    const ca = vedamScores.maths !== null ? (vedamScores.maths / 100) * 30 : 0;
    return utetTotal + ca;
}

function getWebTotal(vedamScores) {
    return calculateUTET(
        appData.subjects.web.adypu.ut.marks,
        appData.subjects.web.adypu.ut.pending,
        appData.subjects.web.adypu.et.marks,
        appData.subjects.web.adypu.et.pending,
        20, 50
    );
}

function getJavaTotal(vedamScores) {
    return calculateUTET(
        appData.subjects.java.adypu.ut.marks,
        appData.subjects.java.adypu.ut.pending,
        appData.subjects.java.adypu.et.marks,
        appData.subjects.java.adypu.et.pending,
        20, 50
    );
}

function getPhysicsTotal(vedamScores) {
    return calculateUTET(
        appData.subjects.physics.adypu.ut.marks,
        appData.subjects.physics.adypu.ut.pending,
        appData.subjects.physics.adypu.et.marks,
        appData.subjects.physics.adypu.et.pending,
        20, 50
    );
}

// Export data
function exportData() {
    updateDataFromInputs();
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vedam-cgpa-data.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Import data
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            appData = { ...appData, ...imported };
            if (imported.subjects) {
                Object.keys(imported.subjects).forEach(key => {
                    if (appData.subjects[key]) {
                        appData.subjects[key] = { ...appData.subjects[key], ...imported.subjects[key] };
                    }
                });
            }
            saveData();
            loadDataIntoUI();
            updateData();
            alert('Data imported successfully!');
        } catch (err) {
            alert('Error importing data: ' + err.message);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
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
        setInputValue('maths-mock', appData.subjects.maths.vedam?.mockInterview?.marks);
        setCheckbox('maths-mock-pending', appData.subjects.maths.vedam?.mockInterview?.pending);
        setInputValue('maths-ut', appData.subjects.maths.adypu?.ut?.marks);
        setCheckbox('maths-ut-pending', appData.subjects.maths.adypu?.ut?.pending);
        setInputValue('maths-et', appData.subjects.maths.adypu?.et?.marks);
        setCheckbox('maths-et-pending', appData.subjects.maths.adypu?.et?.pending);
    }
    
    // Web
    if (appData.subjects.web) {
        setInputValue('web-mock', appData.subjects.web.vedam?.mockInterview?.marks);
        setCheckbox('web-mock-pending', appData.subjects.web.vedam?.mockInterview?.pending);
        setInputValue('web-ut', appData.subjects.web.adypu?.ut?.marks);
        setCheckbox('web-ut-pending', appData.subjects.web.adypu?.ut?.pending);
        setInputValue('web-et', appData.subjects.web.adypu?.et?.marks);
        setCheckbox('web-et-pending', appData.subjects.web.adypu?.et?.pending);
    }
    
    // Java
    if (appData.subjects.java) {
        setInputValue('java-mock', appData.subjects.java.vedam?.mockInterview?.marks);
        setCheckbox('java-mock-pending', appData.subjects.java.vedam?.mockInterview?.pending);
        setInputValue('java-ut', appData.subjects.java.adypu?.ut?.marks);
        setCheckbox('java-ut-pending', appData.subjects.java.adypu?.ut?.pending);
        setInputValue('java-et', appData.subjects.java.adypu?.et?.marks);
        setCheckbox('java-et-pending', appData.subjects.java.adypu?.et?.pending);
    }
    
    // Professional Communication
    if (appData.subjects.professionalCommunication) {
        setInputValue('prof-linkedin', appData.subjects.professionalCommunication.vedam?.linkedinProfile?.marks);
        setCheckbox('prof-linkedin-pending', appData.subjects.professionalCommunication.vedam?.linkedinProfile?.pending);
        setInputValue('prof-assignment', appData.subjects.professionalCommunication.vedam?.assignment?.marks);
        setCheckbox('prof-assignment-pending', appData.subjects.professionalCommunication.vedam?.assignment?.pending);
        setInputValue('prof-cv', appData.subjects.professionalCommunication.vedam?.cvEmail?.marks);
        setCheckbox('prof-cv-pending', appData.subjects.professionalCommunication.vedam?.cvEmail?.pending);
        setInputValue('prof-presentation', appData.subjects.professionalCommunication.vedam?.presentation?.marks);
        setCheckbox('prof-presentation-pending', appData.subjects.professionalCommunication.vedam?.presentation?.pending);
        setInputValue('prof-attendance', appData.subjects.professionalCommunication.vedam?.attendance?.marks);
        setCheckbox('prof-attendance-pending', appData.subjects.professionalCommunication.vedam?.attendance?.pending);
        setInputValue('prof-casestudy', appData.subjects.professionalCommunication.vedam?.caseStudy?.marks);
        setCheckbox('prof-casestudy-pending', appData.subjects.professionalCommunication.vedam?.caseStudy?.pending);
    }
    
    // Physics
    if (appData.subjects.physics) {
        setInputValue('physics-ut', appData.subjects.physics.adypu?.ut?.marks);
        setCheckbox('physics-ut-pending', appData.subjects.physics.adypu?.ut?.pending);
        setInputValue('physics-et', appData.subjects.physics.adypu?.et?.marks);
        setCheckbox('physics-et-pending', appData.subjects.physics.adypu?.et?.pending);
    }
    
    // Target CGPA
    const targetEl = document.getElementById('targetCGPA');
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
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
        // Reset to initial state
        appData = {
            subjects: {
                maths: {
                    vedam: { contests: [{ marks: null, total: null }], mockInterview: { marks: null, pending: true } },
                    adypu: { ut: { marks: null, pending: true }, et: { marks: null, pending: true } }
                },
                web: {
                    vedam: { contests: [{ marks: null, total: null }], mockInterview: { marks: null, pending: true } },
                    adypu: { ut: { marks: null, pending: true }, et: { marks: null, pending: true } }
                },
                java: {
                    vedam: { contests: [{ marks: null, total: null }], mockInterview: { marks: null, pending: true } },
                    adypu: { ut: { marks: null, pending: true }, et: { marks: null, pending: true } }
                },
                professionalCommunication: {
                    vedam: {
                        linkedinProfile: { marks: null, pending: true },
                        assignment: { marks: null, pending: true },
                        cvEmail: { marks: null, pending: true },
                        presentation: { marks: null, pending: true },
                        attendance: { marks: null, pending: true },
                        caseStudy: { marks: null, pending: true }
                    }
                },
                physics: {
                    adypu: { ut: { marks: null, pending: true }, et: { marks: null, pending: true } }
                }
            },
            targetCGPA: 7.5
        };
        
        // Clear localStorage
        localStorage.removeItem('vedamCGPA');
        
        // Reset UI
        loadDataIntoUI();
        renderContests();
        updateData();
        
        alert('All data has been reset successfully!');
    }
}
