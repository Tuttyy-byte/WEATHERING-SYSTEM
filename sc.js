let students = [];
let editModeId = null;
let currentFilter = "all";
let currentSearch = "";

// NBSC Core Grading Systems
function convertToNBSCGrade(percentage) {
  const p = parseFloat(percentage);
  if (p >= 92) return 1.0;
  if (p >= 89) return 1.25;
  if (p >= 86) return 1.5;
  if (p >= 83) return 1.75;
  if (p >= 80) return 2.0;
  if (p >= 77) return 2.25;
  if (p >= 74) return 2.5;
  if (p >= 71) return 2.75;
  if (p >= 68) return 3.0;
  return 5.0;
}

function getRemarks(gradePoint) {
  return (gradePoint <= 3.0 && gradePoint !== 5.0) ? "PASSED" : "FAILED";
}

function getGradeCategory(gradePoint) {
  if (gradePoint <= 1.5) return "excellent";
  if (gradePoint <= 2.0) return "good";
  if (gradePoint <= 2.75) return "fair";
  if (gradePoint === 3.0) return "pass";
  return "fail";
}

// Session Validation and Init Routine
async function init() {
  try {
    const res = await fetch('check_session.php');
    const data = await res.json();

    if (data.status === "error") {
      window.location.href = "index.html";
      return;
    }
    
    document.getElementById("userNameDisplay").innerText = "Prof. " + data.user_name;
    
    loadFromServer();
    bindEvents();
  } catch (err) {
    console.error("Initialization check failed:", err);
    window.location.href = "index.html";
  }
}

// Pull Live Sync from MySQL Database Server
async function loadFromServer() {
  try {
    const response = await fetch('get_students.php');
    students = await response.json();
    renderTable();
  } catch (error) {
    console.error("Failed to load records from cloud database:", error);
  }
}

// Update Analytics Panels Dynamically
function updateStatistics(filteredList) {
  const total = filteredList.length;
  document.getElementById("totalCount").innerText = total;

  if (total === 0) {
    document.getElementById("avgGPA").innerText = "--";
    document.getElementById("deanListerCount").innerText = "0";
    document.getElementById("passRate").innerText = "--";
    return;
  }

  let totalGPAPoints = 0;
  let passingCount = 0;
  let deansListerCount = 0;

  filteredList.forEach(s => {
    const grade = convertToNBSCGrade(s.percentage);
    totalGPAPoints += grade;
    
    if (grade <= 3.0 && grade !== 5.0) {
      passingCount++;
    }
    if (grade <= 1.75) {
      deansListerCount++;
    }
  });

  const averageGPA = totalGPAPoints / total;
  const rawPassingPercentage = (passingCount / total) * 100;

  document.getElementById("avgGPA").innerText = averageGPA.toFixed(2);
  document.getElementById("deanListerCount").innerText = deansListerCount;
  document.getElementById("passRate").innerText = rawPassingPercentage.toFixed(1) + "%";
}

// Complete Search Engine and Category Filter Implementation
function renderTable() {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    students.forEach(s => {
        const grade = convertToNBSCGrade(s.percentage);
        const remarks = getRemarks(grade);
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${s.id}</td>
            <td>${s.name}</td>
            <td>${s.course}</td>
            <td>${s.percentage}%</td>
            <td><span class="nbsc-grade ${getGradeCategory(grade)}">${grade.toFixed(2)}</span></td>
            <td>${remarks}</td>
            <td>
                <button class="action-btn edit-btn" onclick="enterEditMode(${s.id})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteStudent(${s.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// NEW: Function to handle the delete request
async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
        const response = await fetch('delete_student.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });

        const result = await response.json();

        if (result.status === "success") {
            // Remove from local array and refresh table
            students = students.filter(s => s.id !== id);
            renderTable();
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Delete failed:", error);
    }
}
// Handle Submissions (Inserts and Updates via standard JSON payload structures)
async function addOrUpdateStudent() {
  const name = document.getElementById("studentName").value.trim();
  const course = document.getElementById("studentSubject").value.trim();
  const percentage = document.getElementById("studentGrade").value.trim();

  if (!name || !course || !percentage) {
    alert("Please completely fill out all official input fields.");
    return;
  }

  const url = editModeId ? 'update_student.php' : 'add_student.php';
  const payload = { id: editModeId, name, course, percentage: parseFloat(percentage) };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (result.status === "success") {
      resetFormAndExitEdit();
      loadFromServer();
    } else {
      alert("Error processing registration: " + (result.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Database persistence network operation failed:", err);
  }
}

// Transition into Edit Management State
function enterEditMode(id) {
  const target = students.find(x => x.id == id);
  if (!target) return;

  document.getElementById("studentName").value = target.name;
  document.getElementById("studentSubject").value = target.course;
  document.getElementById("studentGrade").value = target.percentage;
  
  editModeId = id;
  
  document.getElementById("addBtn").innerHTML = "💾 Update Record";
  document.getElementById("cancelEditBtn").style.display = "inline-block";
  document.getElementById("studentName").focus();
}

function resetFormAndExitEdit() {
  editModeId = null;
  document.getElementById("studentName").value = "";
  document.getElementById("studentSubject").value = "";
  document.getElementById("studentGrade").value = "";
  
  document.getElementById("addBtn").innerHTML = "➕ Register Student";
  document.getElementById("cancelEditBtn").style.display = "none";
}

// Bind Global Window Dom Component Actions
function bindEvents() {
  document.getElementById("addBtn").addEventListener("click", addOrUpdateStudent);
  document.getElementById("cancelEditBtn").addEventListener("click", resetFormAndExitEdit);
  
  document.getElementById("logoutBtn").addEventListener("click", () => {
    window.location.href = "logout.php";
  });

  // Search Engine input event
  document.getElementById("searchInput").addEventListener("input", (e) => {
    currentSearch = e.target.value;
    renderTable();
  });

  // Search Clear Event trigger
  document.getElementById("clearSearchBtn").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    currentSearch = "";
    renderTable();
  });

  // Category Filtering via Chips
  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.getAttribute("data-filter");
      renderTable();
    });
  });
}

// Run lifecycle loop loader routine
init();