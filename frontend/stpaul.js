// ==========================================
// 1. DATA EXTRACTION & DATABASE INITIALIZATION
// ==========================================
const urlParams = new URLSearchParams(window.location.search);
let role = urlParams.get('role') || 'student';
let username = urlParams.get('user') || 'User';
//const BASE_URL = "http://localhost:3000"; // for development
const BASE_URL = "https://lms.a2henosistechnologies.com"; // for production

const roleTitles = {
    'student': 'Student',
    'teacher': 'Teacher',
    'admin': 'Administrator'
};

// Initialize Databases
if (!localStorage.getItem('assignmentDB')) {
    localStorage.setItem('assignmentDB', JSON.stringify([]));
}
if (!localStorage.getItem('enrollmentDB')) {
    localStorage.setItem('enrollmentDB', JSON.stringify([]));
}
if (!localStorage.getItem('materialDB')) {
    localStorage.setItem('materialDB', JSON.stringify([]));
}
if (!localStorage.getItem('batchDB')) {
    const defaultBatches = [
        { id: 1, name: "Grade 12 - Physics", code: "PHY-12A", start: "01 April 2026", end: "31 March 2027", capacity: 50, enrolled: 45 },
        { id: 2, name: "Grade 10 - Science", code: "SCI-10B", start: "15 April 2026", end: "31 March 2027", capacity: 40, enrolled: 38 }
    ];
    localStorage.setItem('batchDB', JSON.stringify(defaultBatches));
}

// ==========================================
// 2. UI & NAVIGATION LOGIC
// ==========================================
function updateGreeting() {
    const greetingEl = document.getElementById('userGreeting');
    if (greetingEl) {
        const displayRole = roleTitles[role] || role.charAt(0).toUpperCase() + role.slice(1);
        greetingEl.innerHTML = `Welcome, <span style="color:var(--primary)">${displayRole}</span> 
                                <span style="font-size: 0.9rem; color: #64748b; font-weight: 400;">(${username})</span>`;
    }
}

function loadDashboard() {
    document.querySelectorAll('.role-section').forEach(el => el.style.display = 'none');
    document.getElementById('subpages-container').style.display = 'none';
    const activeSection = document.getElementById(role + '-section');
    if (activeSection) activeSection.style.display = 'grid';
}

function openSubpage(pageId) {
    document.querySelectorAll('.role-section').forEach(el => el.style.display = 'none');
    document.getElementById('subpages-container').style.display = 'block';
    document.querySelectorAll('.subpage').forEach(el => el.style.display = 'none');

    const target = document.getElementById(pageId);
    if (target) target.style.display = 'block';

    if (pageId === 'teacher-batches') {
        fetchBatches();
        renderEnrollmentRequests();
    }

    if (pageId === 'student-enroll') {
        fetchBatches();
    }

    if (pageId === 'teacher-tests') {
        loadTestBatches();
    }

    // ✅ FIX ADD THIS
    if (pageId === 'student-tests') {
        loadTests();
    }

    if (pageId === 'teacher-live') {
        //loadLiveBatches();   // ⭐ IMPORTANT FIX
        loadLiveClassBatches();      
    }

       
// AUTO TRIGGERS
    if (pageId === "admin-teacher-registration") {
        loadAdminCollege();
    }

    if (pageId === "teacher-student-registration") {
        loadTeacherBatches();
    }

}

function goBack() { loadDashboard(); }

function renderSidebar() {
    const menu = document.getElementById('dynamic-menu');
    if (!menu) return;

    let menuHTML = `
        <li class="nav-item active" onclick="goBack()"><i class="fas fa-th-large"></i> Dashboard</li>
        <li class="nav-item"><i class="fas fa-book"></i> Courses</li>
    `;

    if (role === 'teacher' || role === 'admin') {
        menuHTML += `
            <li class="nav-item" onclick="openSubpage('teacher-batches'); renderBatchesTable();"><i class="fas fa-layer-group"></i> Batches</li>
            <li class="nav-item"><i class="fas fa-calendar-alt"></i> Attendance</li>
            <li class="nav-item"><i class="fas fa-cog"></i> Settings</li>
            <li class="nav-item" onclick="openSubpage('teacher-live')">
                <i class="fas fa-video"></i> Live Class
            </li>
        `;
    } else {
        menuHTML += `
            <li class="nav-item" onclick="openSubpage('student-notices')"><i class="fas fa-bullhorn"></i> Campus News</li>
            <li class="nav-item" onclick="openSubpage('student-enroll'); renderStudentEnrollmentTable();"><i class="fas fa-user-plus"></i> Enroll</li>
            <li class="nav-item" onclick="openSubpage('student-materials'); renderStudentMaterialsList();"><i class="fas fa-folder-open"></i> Study Material</li>
        `;
    }
    menu.innerHTML = menuHTML;
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainWrapper = document.querySelector('.main-wrapper');
    sidebar.classList.toggle('hidden');
    mainWrapper.classList.toggle('expanded');
}

// --- Dynamic Document Viewer Simulation ---
function viewDocument(fileName) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0'; 
    overlay.style.left = '0';
    overlay.style.width = '100%'; 
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(15, 23, 42, 0.8)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.id = 'tempDocPreview';

    const modal = document.createElement('div');
    modal.style.background = 'white';
    modal.style.padding = '40px';
    modal.style.borderRadius = '16px';
    modal.style.textAlign = 'center';
    modal.style.maxWidth = '400px';
    modal.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';

    modal.innerHTML = `
        <i class="fas fa-file-pdf" style="font-size: 4rem; color: #ef4444; margin-bottom: 20px;"></i>
        <h3 style="margin-bottom: 10px; color: #1e1b4b; word-wrap: break-word;">${fileName}</h3>
        <p style="color: #64748b; margin-bottom: 25px; font-size: 0.9rem;">Document preview is currently running in simulation mode. In a live environment, this would open the file.</p>
        <button onclick="document.getElementById('tempDocPreview').remove()" style="padding: 10px 25px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Close Preview</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

// ==========================================
// 3. TEACHER / ADMIN LOGIC
// ==========================================

// --- Notifications ---
function checkTeacherNotifications() {
    if (role !== 'teacher' && role !== 'admin') return;

    const notifSection = document.getElementById('teacherNotification');
    if (notifSection) notifSection.style.display = 'block';
    
    const assignments = JSON.parse(localStorage.getItem('assignmentDB')) || [];
    const enrollments = JSON.parse(localStorage.getItem('enrollmentDB')) || [];
    
    const pendingAssignments = assignments.filter(task => task.status === 'Pending').length;
    const pendingEnrollments = enrollments.filter(req => req.status === 'Pending').length;
    
    const totalPending = pendingAssignments + pendingEnrollments;

    const bellIcon = document.getElementById('bellIcon');
    const bellBadge = document.getElementById('bellBadge');

    if (bellIcon && bellBadge) {
        if (totalPending > 0) {
            bellIcon.classList.add('ringing');
            bellBadge.style.display = 'block';
            bellBadge.innerText = totalPending;
        } else {
            bellIcon.classList.remove('ringing');
            bellBadge.style.display = 'none';
        }
    }
}

// --- Batch Management ---
function openBatchDrawer() {
    document.getElementById('batchDrawer').classList.add('active');
    document.getElementById('drawerOverlay').classList.add('active');
}

function closeBatchDrawer() {
    document.getElementById('batchDrawer').classList.remove('active');
    document.getElementById('drawerOverlay').classList.remove('active');
    
    ['newBatchName', 'newBatchCode', 'newBatchStart', 'newBatchEnd', 'newBatchCapacity'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = '';
    });
}

async function saveBatch() {

    const name = document.getElementById('newBatchName').value;
    const code = document.getElementById('newBatchCode').value;
    const start = document.getElementById('newBatchStart').value;
    const end = document.getElementById('newBatchEnd').value;
    const capacity = document.getElementById('newBatchCapacity').value;

    // 🚨 VALIDATION (VERY IMPORTANT)
    if (!name || !code || !start || !end || !capacity) {
        alert("❌ Please fill all fields including dates");
        return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/batches`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            name: name,
            subject: "General",
            className: "Grade",
            capacity: capacity,
            startDate: start,
            endDate: end
        })
    });

    const data = await res.json();

    if (data.message === "Batch created") {
        alert("Batch created successfully ✅");
        closeBatchDrawer();
        fetchBatches();
    } else {
        alert("Error creating batch");
    }
}

async function fetchBatches() {
    try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${BASE_URL}/api/batches`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText);
        }

        const data = await res.json();

        const tbody = document.getElementById('batchesTableBody');

       
        let html = '';

        data.forEach((batch, index) => {
            html += `
            <tr>
                <td>${index + 1}</td>
                <td>${batch.name}</td>
                <td>${batch.start_date ?? 'N/A'}</td>
                <td>${batch.end_date ?? 'N/A'}</td>
                <td>${batch.enrolled ?? 0} / ${batch.capacity ?? 0}</td>
        
            </tr>`;
        });

        tbody.innerHTML = html;

    } catch (err) {
        console.log("BATCH LOAD ERROR:", err.message);
        alert("Error loading batches");
    }
}


let isDeleteMode = false;
function toggleDeleteMode() {
    const btn = document.getElementById('deleteBatchBtn');
    if (!btn) return;
    
    if (!isDeleteMode) {
        isDeleteMode = true;
        btn.innerHTML = '<i class="fas fa-check"></i> Confirm Delete';
        btn.style.background = '#ef4444';
        btn.style.color = 'white';
    } else {
        const checkboxes = document.querySelectorAll('.batch-checkbox:checked');
        if (checkboxes.length > 0) {
            const confirmMsg = confirm(`Are you sure you want to delete ${checkboxes.length} selected batch(es)?`);
            if (confirmMsg) {
                const idsToDelete = Array.from(checkboxes).map(cb => parseInt(cb.getAttribute('data-id')));
                let db = JSON.parse(localStorage.getItem('batchDB'));
                db = db.filter(batch => !idsToDelete.includes(batch.id));
                localStorage.setItem('batchDB', JSON.stringify(db));
            }
        }
        isDeleteMode = false;
        btn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        btn.style.background = 'white';
        btn.style.color = '#ef4444';
    }
    renderBatchesTable();
}

function renderBatchesTable() {
    const tbody = document.getElementById('batchesTableBody');
    if (!tbody) return;

    const db = JSON.parse(localStorage.getItem('batchDB')) || [];
    let html = '';

    if (db.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#64748b;">No batches created yet.</td></tr>';
        return;
    }

    db.forEach((batch, index) => {
        let badgeColor = batch.enrolled >= batch.capacity ? "#fee2e2" : "#dcfce7"; 
        let textColor = batch.enrolled >= batch.capacity ? "#991b1b" : "#166534"; 

        let firstColumnContent = isDeleteMode 
            ? `<input type="checkbox" id="cb_${batch.id}" class="batch-checkbox" data-id="${batch.id}" style="width: 18px; height: 18px; cursor: pointer; accent-color: #ef4444;" onclick="event.stopPropagation()">`
            : `${index + 1}`;

        let rowClickAction = isDeleteMode 
            ? `const cb = document.getElementById('cb_${batch.id}'); cb.checked = !cb.checked;` 
            : `openSubpage('batch-details')`;

        html += `
        <tr style="cursor: pointer; border-bottom: 1px solid #f1f5f9; transition: 0.2s;" onmouseover="this.style.background='#fff7ed'" onmouseout="this.style.background='white'" onclick="${rowClickAction}">
            <td style="padding: 15px;">${firstColumnContent}</td>
            <td style="padding: 15px;">
                <span style="font-weight: 700; color: var(--primary); display:block;">${batch.name}</span>
                <span style="font-size: 0.75rem; color: #64748b;">Code: ${batch.code}</span>
            </td>
            <td style="padding: 15px;">${batch.start}</td>
            <td style="padding: 15px;">${batch.end}</td>
            <td style="padding: 15px;">
                <span style="background:${badgeColor}; color:${textColor}; padding: 5px 10px; border-radius: 5px; font-weight: bold; font-size: 0.8rem;">
                    ${batch.enrolled} / ${batch.capacity} Students
                </span>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html;
}

// --- Enrollment Approvals ---

async function renderEnrollmentRequests() {
    const tbody = document.getElementById('enrollmentRequestsBody');
    if (!tbody) return;

    const res = await fetch(`${BASE_URL}/api/enrollments/teacher`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        console.log("Failed to load requests");
        return;
    }

    const enrollments = await res.json();

    let html = '';

    enrollments.forEach(req => {
        html += `
        <tr>
            <td>${req.studentName}</td>
            <td>${req.batchName}</td>
            <td>
                <button onclick="approveEnrollment(${req.id})"
                style="background:green;color:white;padding:6px 12px;border:none;border-radius:5px;">
                Approve</button>
            </td>
        </tr>`;
    });

    if (!html) {
        html = `<tr><td colspan="3">No pending requests</td></tr>`;
    }

    tbody.innerHTML = html;
}

async function approveEnrollment(id) {
    const res = await fetch(`${BASE_URL}/api/enrollments/approve/${id}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    const data = await res.json();
    alert(data.message);

    renderEnrollmentRequests();
    fetchBatches();
}

// --- Grading Logic ---
function renderGradingTable() {
    const tbody = document.getElementById('gradingTableBody');
    if (!tbody) return;

    const db = JSON.parse(localStorage.getItem('assignmentDB'));
    let html = '';

    db.forEach(task => {
        if (task.status === 'Pending') {
            html += `
            <tr style="background: white;">
                <td style="font-weight: 600;">${task.studentName}</td>
                <td>
                    <span style="display:block; color:var(--primary); font-size:0.85rem; font-weight:bold;">${task.subject}</span>
                    <span style="font-size:0.75rem; color:#64748b;">${task.grade} - ${task.batch}</span>
                </td>
                <td><a href="#" onclick="viewDocument('${task.fileName}')" style="color:#2563eb; text-decoration:none;"><i class="fas fa-file-word"></i> ${task.fileName}</a></td>
                <td>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="number" id="score_${task.id}" max="100" min="0" placeholder="/100" style="width:70px; padding:8px; border:1px solid #cbd5e1; border-radius:8px; outline:none;">
                        <button style="width:auto; padding:8px 15px; margin:0; border-radius:8px;" onclick="saveGrade(${task.id})">Save</button>
                    </div>
                </td>
            </tr>`;
        }
    });

    if (html === '') {
        html = '<tr><td colspan="4" style="text-align:center; padding:30px; color:#64748b;">No pending assignments to grade. Great job!</td></tr>';
    }
    tbody.innerHTML = html;
}

function saveGrade(taskId) {
    const scoreInput = document.getElementById('score_' + taskId).value;
    
    if (scoreInput === '' || scoreInput < 0 || scoreInput > 100) {
        alert("Please enter a valid score between 0 and 100.");
        return;
    }

    const db = JSON.parse(localStorage.getItem('assignmentDB'));
    const taskIndex = db.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
        db[taskIndex].status = 'Graded';
        db[taskIndex].score = scoreInput;
        localStorage.setItem('assignmentDB', JSON.stringify(db));
        
        alert("Grade saved successfully!");
        renderGradingTable(); 
        checkTeacherNotifications(); 
    }
}

// --- Teacher Upload Material Logic ---

async function openMaterialDrawer() {
    const batchSelect = document.getElementById('uploadMaterialBatch');

    try {
        const res = await fetch(`${BASE_URL}/api/batches`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        const batches = await res.json();

        let html = '';

        if (!Array.isArray(batches) || batches.length === 0) {
            html = '<option value="">No batches available</option>';
            batchSelect.disabled = true;
        } else {
            batches.forEach(batch => {
                html += `<option value="${batch.id}">${batch.name}</option>`;
            });
            batchSelect.disabled = false;
        }

        batchSelect.innerHTML = html;

    } catch (err) {
        console.error(err);
        batchSelect.innerHTML = `<option>Error loading batches</option>`;
    }

    document.getElementById('materialDrawer').classList.add('active');
    document.getElementById('drawerOverlay').classList.add('active');
}

function closeMaterialDrawer() {
    const drawer = document.getElementById('materialDrawer');
    const overlay = document.getElementById('drawerOverlay');
    if (drawer) drawer.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    
    const title = document.getElementById('uploadMaterialTitle');
    const file = document.getElementById('uploadMaterialFile');
    if(title) title.value = '';
    if(file) file.value = '';
}

async function uploadMaterial() {
    const batchId = document.getElementById('uploadMaterialBatch').value;
    const title = document.getElementById('uploadMaterialTitle').value;
    const fileInput = document.getElementById('uploadMaterialFile').files[0];

    if (!batchId || !title || !fileInput) {
        alert("All fields required");
        return;
    }

    const formData = new FormData();
    formData.append("batchId", batchId);
    formData.append("title", title);
    formData.append("file", fileInput);

    const res = await fetch(`${BASE_URL}/api/materials`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
    });

    const data = await res.json();
    alert(data.message);
}

// ==========================================
// 4. STUDENT LOGIC
// ==========================================

function toggleDrawer() {
    populateApprovedBatches(); 
    document.getElementById('sideDrawer').classList.add('active');
    document.getElementById('drawerOverlay').classList.add('active');
}

function populateApprovedBatches() {
    const batchSelect = document.getElementById('subBatch');
    if (!batchSelect) return;

    const enrollments = JSON.parse(localStorage.getItem('enrollmentDB')) || [];
    const batches = JSON.parse(localStorage.getItem('batchDB')) || [];
    
    const myApprovedBatches = enrollments.filter(req => req.studentName === username && req.status === 'Approved');
    
    let html = '';
    
    if (myApprovedBatches.length === 0) {
        html = '<option value="">🚫 Not enrolled in any batches yet</option>';
        batchSelect.disabled = true;
    } else {
        myApprovedBatches.forEach(req => {
            const batch = batches.find(b => b.id === req.batchId);
            if (batch) {
                html += `<option value="${batch.name}">${batch.name}</option>`;
            }
        });
        batchSelect.disabled = false;
    }
    
    batchSelect.innerHTML = html;
}

function closeDrawer() {
    document.getElementById('sideDrawer').classList.remove('active');
    document.getElementById('drawerOverlay').classList.remove('active');
}

function submitAssignment() {
    const batch = document.getElementById('subBatch').value;
    
    if (!batch) {
        alert("Action Denied: You must be approved in a batch before you can submit assignments.");
        return;
    }

    const grade = document.getElementById('subGrade').value;
    const subject = document.getElementById('subSubject').value;
    const fileInput = document.getElementById('subFile').files[0];
    
    const fileName = fileInput ? fileInput.name : "Assignment_Document.docx";

    const newSubmission = {
        id: Date.now(),
        studentName: username,
        batch: batch,
        grade: grade,
        subject: subject,
        fileName: fileName,
        status: 'Pending',
        score: null
    };

    const db = JSON.parse(localStorage.getItem('assignmentDB'));
    db.push(newSubmission);
    localStorage.setItem('assignmentDB', JSON.stringify(db));

    alert('Success! Your work has been submitted to the teacher.');
    closeDrawer();
    checkTeacherNotifications();
}

async function renderStudentResults() {
    const tbody = document.getElementById('studentResultsBody');
    if (!tbody) return;

    try {
        const res = await fetch(`${BASE_URL}/api/results/student`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        const data = await res.json();

        let html = '';

        data.forEach(r => {

            let percentage = ((r.score / r.total) * 100).toFixed(2);

            let grade = '';
            if (percentage >= 90) grade = "A+";
            else if (percentage >= 80) grade = "A";
            else if (percentage >= 70) grade = "B";
            else if (percentage >= 60) grade = "C";
            else grade = "F";

            html += `
                <tr>
                    <td>${r.testTitle}</td>
                    <td>${r.subject}</td>
                    <td>${r.score} / ${r.total}</td>
                    <td>${percentage}%</td>
                    <td>${grade}</td>
                    <td>${new Date(r.attempted_at).toLocaleString()}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html || `<tr><td colspan="6">No results yet</td></tr>`;

    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="6">Error loading results</td></tr>`;
    }
}

async function renderStudentEnrollmentTable() {
    const tbody = document.getElementById('studentEnrollmentTableBody');

    try {
        const res = await fetch(`${BASE_URL}/api/batches`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

        const data = await res.json();

        // ✅ SAFETY CHECK
        if (!Array.isArray(data)) {
            console.error("Invalid data:", data);
            tbody.innerHTML = `<tr><td colspan="4">Error loading batches</td></tr>`;
            return;
        }

        const batches = data;

        const enrollRes = await fetch(`${BASE_URL}/api/enrollments`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        const enrollments = await enrollRes.json();

        let html = '';

        batches.forEach(batch => {
            const userRequest = enrollments.find(
                req => req.batch_id === batch.id
            );

            let actionButton = `<button onclick="applyForBatch(${batch.id})">Apply Now</button>`;

            if (userRequest) {
                if (userRequest.status === 'Pending') {
                    actionButton = `<span style="color:orange;">Pending</span>`;
                } else if (userRequest.status === 'Approved') {
                    actionButton = `<span style="color:green;">Approved ✅</span>`;
                }
            }

            html += `
            <tr>
                <td>${batch.name}</td>
                <td>${batch.start_date || '-'}</td>
                <td>
                    ${batch.enrolled || 0} / ${batch.capacity}
                    
                </td>
                <td>${actionButton}</td>
            </tr>`;
        });

        tbody.innerHTML = html;

    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="4">Server error</td></tr>`;
    }
}


async function applyForBatch(batchId) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/enrollments`, {
    //const res = await fetch("http://localhost:5000/api/enroll", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ batchId })
    });

    const data = await res.json();

    alert(data.message);

    // ⭐ REFRESH TABLE AFTER APPLY
    renderStudentEnrollmentTable();
}

// --- Student Study Material View Logic ---

async function renderStudentMaterialsList() {
    const container = document.getElementById('studentMaterialsGrid');

    const res = await fetch(`${BASE_URL}/api/materials`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    const materials = await res.json();

    // 🔥 Group by batch
    const grouped = {};

    materials.forEach(mat => {
        if (!grouped[mat.batchName]) {
            grouped[mat.batchName] = [];
        }
        grouped[mat.batchName].push(mat);
    });

    let html = '';

    for (let batch in grouped) {
        html += `<h2 style="margin-top:20px;">📚 ${batch}</h2>`;

        grouped[batch].forEach(mat => {
            html += `
                <div style="background:white;padding:15px;margin:10px;border-radius:10px;">
                    <h3>${mat.title}</h3>

                    <button onclick="downloadMaterial(${mat.id})">
                        📥 Download
                    </button>
                </div>
            `;
        });
    }

    if (!html) html = "No materials available";

    container.innerHTML = html;
}

async function downloadMaterial(id) {
    try {
        const res = await fetch(`${BASE_URL}/api/materials/download/${id}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (!res.ok) {
            const err = await res.json();
            alert(err.message);
            return;
        }

        const blob = await res.blob();

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.href = url;
        a.download = "study_material.pdf"; // optional name
        document.body.appendChild(a);
        a.click();
        a.remove();

    } catch (err) {
        console.log(err);
        alert("Download failed");
    }
}


function viewSpecificBatchMaterials(batchId, batchName) {
    const titleEl = document.getElementById('batchMaterialTitle');
    if(titleEl) titleEl.innerText = `${batchName} - Materials`;
    
    const tbody = document.getElementById('batchMaterialsTableBody');
    if(!tbody) return;

    const materials = JSON.parse(localStorage.getItem('materialDB')) || [];
    const batchMaterials = materials.filter(mat => mat.batchId === batchId);
    
    let html = '';

    if (batchMaterials.length === 0) {
        html = '<tr><td colspan="3" style="text-align:center; padding:30px; color:#64748b;">No materials have been uploaded for this batch yet.</td></tr>';
    } else {
        batchMaterials.forEach(mat => {
            html += `
            <tr style="border-bottom: 1px solid #f1f5f9; background: white;">
                <td style="padding: 15px; font-weight: 600; color: #1e1b4b;">${mat.title}</td>
                <td style="padding: 15px;">
                    <a href="#" onclick="viewDocument('${mat.fileName}')" style="color:#2563eb; text-decoration:none;">
                        <i class="fas fa-file-pdf"></i> ${mat.fileName}
                    </a>
                </td>
                <td style="padding: 15px; color: #64748b; font-size: 0.9rem;">${mat.date}</td>
            </tr>`;
        });
    }

    tbody.innerHTML = html;
    openSubpage('student-batch-materials');
}

// --- MCQ Test ---

function addQuestion() {
    const container = document.getElementById('questionsContainer');

    container.innerHTML += `
        <div class="q-block">
            <input placeholder="Question" class="q">
            <input placeholder="Option A" class="a">
            <input placeholder="Option B" class="b">
            <input placeholder="Option C" class="c">
            <input placeholder="Option D" class="d">
            <input placeholder="Correct (A/B/C/D)" class="correct">
        </div>
    `;
}

async function loadTestBatches() {
    try {
        const res = await fetch(`${BASE_URL}/api/batches`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (!res.ok) {
            throw new Error(await res.text());
        }

        const batches = await res.json();

        const select = document.getElementById("testBatch");

        if (!Array.isArray(batches)) {
            select.innerHTML = `<option>No batches found</option>`;
            return;
        }

        select.innerHTML = `
            <option value="">Select Batch</option>
        ` + batches.map(b =>
            `<option value="${b.id}">${b.name}</option>`
        ).join("");

    } catch (err) {
        console.error("Batch load error:", err);
    }
}

async function createTest() {
    const questions = [];

    document.querySelectorAll('.q-block').forEach(q => {
        questions.push({
            question: q.querySelector('.q').value,
            a: q.querySelector('.a').value,
            b: q.querySelector('.b').value,
            c: q.querySelector('.c').value,
            d: q.querySelector('.d').value,
            correct: q.querySelector('.correct').value
        });
    });

    const res = await fetch(`${BASE_URL}/api/tests`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
            title: document.getElementById('testTitle').value,
            subject: document.getElementById('testSubject').value,
            //batchId: document.getElementById('testBatch').value,
            batchId: Number(document.getElementById('testBatch').value),
            questions
        })
    });

    const data = await res.json();
    alert(data.message);
}

async function loadTests() {
    const res = await fetch(`${BASE_URL}/api/tests`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    const tests = await res.json();

    console.log("TESTS:", tests); // 🔴 ADD THIS

    let html = '';

    tests.forEach(t => {
        html += `<button onclick="startTest(${t.id})">${t.title}</button>`;
    });

    document.getElementById('testList').innerHTML = html;
}

let currentTest = null;
let answers = {};

async function startTest(id) {
    currentTest = id;

    const res = await fetch(`${BASE_URL}/api/tests/${id}`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    const questions = await res.json();

    let html = '';

    questions.forEach(q => {
        html += `
            <div>
                <p>${q.question}</p>
                <label><input type="radio" name="q${q.id}" value="A"> ${q.option_a}</label>
                <label><input type="radio" name="q${q.id}" value="B"> ${q.option_b}</label>
                <label><input type="radio" name="q${q.id}" value="C"> ${q.option_c}</label>
                <label><input type="radio" name="q${q.id}" value="D"> ${q.option_d}</label>
            </div>
        `;
    });

    document.getElementById('questionBox').innerHTML = html;
    openSubpage('test-attempt');
}

async function submitTest() {
    document.querySelectorAll('input[type=radio]:checked').forEach(r => {
        const qId = r.name.replace('q','');
        answers[qId] = r.value;
    });

    const res = await fetch(`${BASE_URL}/api/tests/submit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
            testId: currentTest,
            answers
        })
    });

    const data = await res.json();
    if (!res.ok) {
        alert(data.message); // "Already attempted ❌"
        return;
    }
    alert("Score: " + data.score);
}

// --- Live class ---

function initTeacher() {
    loadTeacherBatches();
}

function initStudent() {
    loadLiveClass();
}

 async function loadLiveClassBatches() {
    //console.log("🚀 FUNCTION CALLED");
    //console.log("ELEMENT:", document.getElementById("batchSelect1"));
    const select = document.getElementById("batchSelect1");

    console.log("SELECT FOUND:", select);

    if (!select) {
        console.error("❌ batchSelect1 not found in DOM");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/api/batches`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        console.log("STATUS:", res.status);

        if (!res.ok) {
            const err = await res.text();
            console.error("SERVER ERROR:", err);
            throw new Error(err);
        }

        const batches = await res.json();

        console.log("✅ DATA:", batches);

        if (!Array.isArray(batches) || batches.length === 0) {
            select.innerHTML = `<option>No batches found</option>`;
            return;
        }

        select.innerHTML =
            `<option value="">Select Batch</option>` +
            batches.map(b =>
                `<option value="${b.id}">${b.name}</option>`
            ).join("");

    } catch (err) {
        console.error("❌ ERROR:", err);
    }
} 
    


function createLive() {
    const batchId = document.getElementById("batchSelect1").value;
    const meetingLink = document.getElementById("meetingLink").value;

    if (!batchId || !meetingLink) {
        alert("Select batch and enter Zoom link");
        return;
    }

    fetch(`${BASE_URL}/api/live-class`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ batchId, meetingLink })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);

        // ✅ clear input after success
        document.getElementById("meetingLink").value = "";

        // ✅ OPTIONAL: reload student view
        loadLiveClass();
    })
    .catch(err => {
        console.log(err);
        alert("Error creating live class");
    });
}    

function loadLiveClass() {
    fetch(`${BASE_URL}/api/live-class/student`, {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    })
    .then(res => res.json())
    .then(data => {

        const container = document.getElementById("liveBox");

        if (!data) {
            container.innerHTML = "No live class available";
            return;
        }

        /* container.innerHTML = `
            <h4>Live Class Active</h4>
            <p>Batch ID: ${data.batch_id}</p>
            <a href="${data.meeting_link}" target="_blank">
                Join Zoom Class
            </a>
        `; */
        
           /*  <button onclick="window.open('${data.meeting_link}', '_blank')">
                Join Zoom Class
            </button>  */

        container.innerHTML = `
           <div > <h4>Live Class Active</h4>
            <p>Batch ID: ${data.batch_id}</p></div>

            <button onclick="joinMeeting('${data.meeting_link}')">
            Join Zoom Class
        </button>
        `;
    })
    .catch(err => {
        console.log(err);
    });
}

function joinMeeting(link) {

    if (!link.startsWith("http")) {
        alert("Invalid meeting link");
        return;
    }

    window.open(link, "_blank", "noopener,noreferrer");
}

// --- Registration ---

const params = new URLSearchParams(window.location.search);

//let currentUser = JSON.parse(localStorage.getItem("user"));

function loadAdminCollege() {
    const el = document.getElementById("adminCollegeDisplay");

    if (!el) return; // safety

    // TEMP (later from backend)
    el.innerText = "College: St Paul College";
}

async function registerTeacher() {
    const currentUser = getUserFromToken();

    if (!currentUser || !currentUser.college) {
        alert("User not loaded properly");
        return;
    }

    const nameEl = document.getElementById("t_name");
    const emailEl = document.getElementById("t_email");
    const phoneEl = document.getElementById("t_phone");

    const name = nameEl.value;
    const email = emailEl.value;
    const phone = phoneEl.value;

    const res = await fetch(`${BASE_URL}/api/register-teacher`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, phone, college: currentUser.college })
    });

    const data = await res.json();
    alert(data.message);

    // ✅ CLEAR FIELDS AFTER SUCCESS
    if (res.ok) {
        nameEl.value = "";
        emailEl.value = "";
        phoneEl.value = "";
    }
}

async function loadTeacherBatches() {

    const select = document.getElementById("s_batch");

    // ✅ FIX: check element exists
    if (!select) return;

    const res = await fetch(`${BASE_URL}/api/batches/my`, {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    });

    const data = await res.json();

    select.innerHTML =
        `<option>Select Batch</option>` +
        data.map(b => `<option value="${b.id}">${b.name}</option>`).join("");
}

async function registerStudent() {

    const name = document.getElementById("s_name").value;
    const email = document.getElementById("s_email").value;
    const phone = document.getElementById("s_phone").value;

    const res = await fetch(`${BASE_URL}/api/register-student`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token") // ✅ REQUIRED
        },
        body: JSON.stringify({
            name,
            email,
            phone
        })
    });

    const data = await res.json();
    alert(data.message);
}


function getUserFromToken() {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    } catch (err) {
        console.error("Token decode error:", err);
        return null;
    }
}



// ==========================================
// 5. INITIALIZATION ON LOAD
// ==========================================

const display = document.getElementById('network-display');
if (display) {
    fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
            display.innerHTML = `IP: <strong>${data.ip}</strong> | Loc: <strong>${data.city}, ${data.country_name}</strong>`;
        })
        .catch(() => {
            display.innerHTML = `IP: <strong>Local Network</strong> | Loc: <strong>Jammu, India</strong>`;
        });
}

// Run all initial setups
updateGreeting();
renderSidebar();
loadDashboard();
checkTeacherNotifications();
renderGradingTable();
renderStudentResults();
renderBatchesTable();
renderStudentEnrollmentTable();
renderEnrollmentRequests();
renderStudentMaterialsList();
loadLiveClass();
loadLiveClassBatches();
