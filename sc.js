
let students = [];
let editModeId = null;
let currentFilter = "all";
let currentSearch = "";


function convertToNBSCGrade(percentage) {
  if (percentage >= 92) return 1.0;
  if (percentage >= 89) return 1.25;
  if (percentage >= 86) return 1.5;
  if (percentage >= 83) return 1.75;
  if (percentage >= 80) return 2.0;
  if (percentage >= 77) return 2.25;
  if (percentage >= 74) return 2.5;
  if (percentage >= 71) return 2.75;
  if (percentage >= 68) return 3.0;
  return 5.0;
}

function getRemarks(gradePoint) {
  if (gradePoint <= 3.0 && gradePoint !== 5.0) return "PASSED";
  return "FAILED";
}

function getGradeCategory(gradePoint) {
  if (gradePoint <= 1.5) return "excellent";
  if (gradePoint <= 2.0) return "good";
  if (gradePoint <= 2.75) return "fair";
  if (gradePoint === 3.0) return "pass";
  return "fail";
}


function loadFromStorage() {
  const stored = localStorage.getItem("nbsc_gradebook");
  if (stored) {
    try {
      students = JSON.parse(stored);
    } catch(e) { students = []; }
  } else {

    students = [
      { id: Date.now() + 201, name: "Reyes, Maria C.", subject: "BS Elementary Education", percentage: 94.2 },
      { id: Date.now() + 202, name: "Salvador, John M.", subject: "BS Criminology", percentage: 87.5 },
      { id: Date.now() + 203, name: "Lumagbas, Sofia R.", subject: "BS Social Work", percentage: 79.0 },
      { id: Date.now() + 204, name: "Dumagan, Carlo A.", subject: "BS Agriculture", percentage: 71.5 },
      { id: Date.now() + 205, name: "Bantilan, Jenna L.", subject: "BS Information Technology", percentage: 65.0 },
      { id: Date.now() + 206, name: "Olayon, Mark Joseph", subject: "BS Entrepreneurship", percentage: 91.3 },
    ];
    saveToStorage();
  }
}

function saveToStorage() {
  localStorage.setItem("nbsc_gradebook", JSON.stringify(students));
}

function computeStats() {
  const total = students.length;
  document.getElementById("totalCount").innerText = total;
  if (total === 0) {
    document.getElementById("avgGPA").innerText = "--";
    document.getElementById("deanListerCount").innerText = "0";
    document.getElementById("passRate").innerText = "--";
    return;
  }

  let sumPoints = 0;
  let passed = 0;
  let deanLister = 0;
  students.forEach(s => {
    let gp = convertToNBSCGrade(s.percentage);
    sumPoints += gp;
    if (gp <= 3.0 && gp !== 5.0) passed++;
    if (gp <= 1.75) deanLister++;
  });
  let avgGPA = (sumPoints / total).toFixed(2);
  document.getElementById("avgGPA").innerText = avgGPA;
  document.getElementById("deanListerCount").innerText = deanLister;
  let passPercent = (passed / total) * 100;
  document.getElementById("passRate").innerHTML = passPercent.toFixed(0) + "%";
}

function getFilteredStudents() {
  let filtered = [...students];
  if (currentSearch.trim()) {
    let term = currentSearch.trim().toLowerCase();
    filtered = filtered.filter(s => s.name.toLowerCase().includes(term) || s.subject.toLowerCase().includes(term));
  }
  if (currentFilter !== "all") {
    filtered = filtered.filter(s => {
      let gp = convertToNBSCGrade(s.percentage);
      if (currentFilter === "1.0") return gp <= 1.5;
      if (currentFilter === "1.75") return gp >= 1.75 && gp <= 2.0;
      if (currentFilter === "2.25") return gp >= 2.25 && gp <= 2.75;
      if (currentFilter === "3.0") return gp === 3.0;
      if (currentFilter === "5.0") return gp === 5.0;
      return true;
    });
  }
  return filtered;
}

function renderTable() {
  const filtered = getFilteredStudents();
  const tbody = document.getElementById("tableBody");
  computeStats();

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="7">🏔️ No records match. Register a new student. 🏔️</td></tr>`;
    return;
  }

  let html = "";
  filtered.forEach((student, idx) => {
    const nbscGrade = convertToNBSCGrade(student.percentage);
    const remarks = getRemarks(nbscGrade);
    const category = getGradeCategory(nbscGrade);
    let gradeClass = "nbsc-grade";
    let gradeStyle = "";
    
    html += `
      <tr data-id="${student.id}">
        <td>${String(student.id).slice(-5)}</td>
        <td><strong>${escapeHtml(student.name)}</strong></td>
        <td>${escapeHtml(student.subject)}</td>
        <td>${student.percentage.toFixed(1)}%</td>
        <td><span class="nbsc-grade" style="background: ${category === 'excellent' ? '#d4f5e6' : category === 'good' ? '#d9f0e0' : category === 'fair' ? '#fef0cf' : category === 'pass' ? '#d4eaea' : '#ffe0db'}">${nbscGrade.toFixed(2)}</span></td>
        <td class="${remarks === 'PASSED' ? 'remarks-pass' : 'remarks-fail'}">${remarks}</td>
        <td class="action-buttons">
          <button class="action-btn edit-action edit-student" data-id="${student.id}">✏️ Edit</button>
          <button class="action-btn delete-action delete-student" data-id="${student.id}">🗑 Drop</button>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
  

  document.querySelectorAll('.edit-student').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(btn.getAttribute('data-id'));
      startEditStudent(id);
    });
  });
  document.querySelectorAll('.delete-student').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(btn.getAttribute('data-id'));
      deleteStudentById(id);
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}


function addStudent() {
  const name = document.getElementById("studentName").value.trim();
  const subject = document.getElementById("studentSubject").value.trim();
  let percentRaw = document.getElementById("studentGrade").value.trim();
  
  if (!name) { alert("❌ Please enter student name (Last, First)"); return; }
  if (!subject) { alert("❌ Please enter program/course"); return; }
  if (percentRaw === "") { alert("❌ Enter percentage grade (0-100)"); return; }
  let percent = parseFloat(percentRaw);
  if (isNaN(percent) || percent < 0 || percent > 100) {
    alert("⚠️ Percentage must be between 0 and 100.");
    return;
  }
  const newStudent = { id: Date.now(), name, subject, percentage: percent };
  students.push(newStudent);
  saveToStorage();
  resetFormAndExitEdit();
  applyFiltersAndSearch();
}


function startEditStudent(id) {
  const student = students.find(s => s.id === id);
  if (!student) return;
  editModeId = id;
  document.getElementById("studentName").value = student.name;
  document.getElementById("studentSubject").value = student.subject;
  document.getElementById("studentGrade").value = student.percentage;
  const addBtn = document.getElementById("addBtn");
  const cancelBtn = document.getElementById("cancelEditBtn");
  addBtn.innerText = "✏️ Update Record";
  addBtn.style.background = "#b46f1a";
  cancelBtn.style.display = "inline-flex";
}

function updateStudent() {
  if (editModeId === null) return;
  const name = document.getElementById("studentName").value.trim();
  const subject = document.getElementById("studentSubject").value.trim();
  const percentRaw = document.getElementById("studentGrade").value.trim();
  if (!name || !subject) { alert("Name and course required"); return; }
  let percent = parseFloat(percentRaw);
  if (isNaN(percent) || percent < 0 || percent > 100) { alert("Percentage 0-100 required"); return; }
  
  const index = students.findIndex(s => s.id === editModeId);
  if (index !== -1) {
    students[index] = { ...students[index], name, subject, percentage: percent };
    saveToStorage();
  }
  resetFormAndExitEdit();
  applyFiltersAndSearch();
}

function resetFormAndExitEdit() {
  document.getElementById("studentName").value = "";
  document.getElementById("studentSubject").value = "";
  document.getElementById("studentGrade").value = "";
  editModeId = null;
  const addBtn = document.getElementById("addBtn");
  const cancelBtn = document.getElementById("cancelEditBtn");
  addBtn.innerText = "➕ Register Student";
  addBtn.style.background = "#1e6b50";
  cancelBtn.style.display = "none";
}

function deleteStudentById(id) {
  if (confirm("⚠️ Registrar: Permanently remove this student record from NBSC database?")) {
    students = students.filter(s => s.id !== id);
    saveToStorage();
    if (editModeId === id) resetFormAndExitEdit();
    applyFiltersAndSearch();
  }
}


function applyFiltersAndSearch() { renderTable(); }
function setFilter(filterValue) {
  currentFilter = filterValue;
  document.querySelectorAll('.chip').forEach(chip => {
    if (chip.getAttribute('data-filter') === filterValue) chip.classList.add('active');
    else chip.classList.remove('active');
  });
  applyFiltersAndSearch();
}
function setSearch(term) {
  currentSearch = term;
  const searchInput = document.getElementById("searchInput");
  if (searchInput.value !== term) searchInput.value = term;
  applyFiltersAndSearch();
}
function clearSearch() { setSearch(""); }

function bindEvents() {
  document.getElementById("addBtn").addEventListener("click", () => {
    if (editModeId !== null) updateStudent();
    else addStudent();
  });
  document.getElementById("cancelEditBtn").addEventListener("click", resetFormAndExitEdit);
  document.getElementById("clearSearchBtn").addEventListener("click", clearSearch);
  document.getElementById("searchInput").addEventListener("input", (e) => setSearch(e.target.value));
  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => setFilter(chip.getAttribute("data-filter")));
  });
}

function init() {
  loadFromStorage();
  bindEvents();
  renderTable();
  setFilter("all");
}
init();