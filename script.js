let token = "";

const CLIENT_ID = "3hphsu53tpv3k3isd0mri8kvnj"; 
const REGION = "ap-south-1";
const API_BASE = "https://i8tz9tjlba.execute-api.ap-south-1.amazonaws.com"; 

let employeesList = [];
let allEmployees = [];
let cycleParticipants = [];

function openAuthModal() {
    document.getElementById("authModal").style.display = "flex";
}

function closeAuthModal() {
    document.getElementById("authModal").style.display = "none";
}

async function fetchEmployeeId() {

    const response = await fetch(`${API_BASE}/employee/me`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    const data = await response.json();
    let body;
    if (data.body) {
    body = JSON.parse(data.body);
    } else {
        body = data;
    }

    window.currentEmployeeId = body.employee_id;
    window.currentUserName = body.name; 
    window.currentManagerId = body.manager_id;

    console.log("Mapped employee_id:", window.currentEmployeeId);
}
async function fetchAllEmployees() {

    const response = await fetch(`${API_BASE}/employees`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();

    allEmployees = data;

    console.log("✅ All Employees:", allEmployees);
}
async function fetchCycleParticipants(cycle_name) {

    const response = await fetch(`${API_BASE}/cycle/${cycle_name}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();
    if (data.status === "expired") {
        alert("This review cycle has expired ❌");
        return;
    }

    if (!response.ok) {
        alert("Cycle not found");
        return;
    }

    cycleParticipants = data.participants;
    window.currentCycleId = data.cycle_id;
    window.currentCycleName = cycle_name;

    console.log("Participants:", cycleParticipants);
}
async function login() {

    const email = document.getElementById("login_email").value;
    const password = document.getElementById("login_password").value;

    const response = await fetch(`https://cognito-idp.${REGION}.amazonaws.com/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-amz-json-1.1",
            "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth"
        },
        body: JSON.stringify({
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            },
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: CLIENT_ID
        })
    });

    const data = await response.json();

    if (data.AuthenticationResult) {
        token = data.AuthenticationResult.IdToken;
        localStorage.setItem("idToken", token);

        const decoded = parseJwt(token);

        userEmail = decoded.email;
        userRole = decoded["custom:role"];
        console.log("Email:", userEmail);
        console.log("Role:", userRole);

        setupReviewOptions();
        await fetchEmployeeId();
        setupUserUI(userEmail, userRole, window.currentUserName);
        applyRoleAccess(userRole);

        
        await fetchAllEmployees();

        alert("Login successful ✅");
        closeAuthModal();
    } else {
        alert("Incorrect email or password ❌");
        console.log(data);
    }
}

function showLogin() {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("signupForm").style.display = "none";
    document.getElementById("otpForm").style.display = "none";

    document.getElementById("loginTab").classList.add("active");
    document.getElementById("signupTab").classList.remove("active");
}

function showSignup() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signupForm").style.display = "block";
    document.getElementById("otpForm").style.display = "none";

    document.getElementById("signupTab").classList.add("active");
    document.getElementById("loginTab").classList.remove("active");
}

function validatePassword() {

    const password = document.getElementById("signup_password").value;

    const length = password.length >= 8;
    const upper = /[A-Z]/.test(password);
    const number = /[0-9]/.test(password);
    const special = /[!@#$%^&*]/.test(password);

    document.getElementById("rule_length").innerText =
        (length ? "✅" : "❌") + " At least 8 characters";

    document.getElementById("rule_upper").innerText =
        (upper ? "✅" : "❌") + " One uppercase letter";

    document.getElementById("rule_number").innerText =
        (number ? "✅" : "❌") + " One number";

    document.getElementById("rule_special").innerText =
        (special ? "✅" : "❌") + " One special character";
}
async function signup() {

    const name = document.getElementById("signup_name").value;
    const email = document.getElementById("signup_email").value;
    const password = document.getElementById("signup_password").value;
    const confirm = document.getElementById("confirm_password").value;
    const role = document.getElementById("signup_role").value;

    if (password !== confirm) {
        alert("Passwords do not match ❌");
        return;
    }

    const response = await fetch(`https://cognito-idp.${REGION}.amazonaws.com/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-amz-json-1.1",
            "X-Amz-Target": "AWSCognitoIdentityProviderService.SignUp"
        },
        body: JSON.stringify({
            ClientId: CLIENT_ID,
            Username: email,
            Password: password,
            UserAttributes: [
                { Name: "email", Value: email },
                { Name: "name", Value: name },
                { Name: "custom:role", Value: role }
            ]
        })
    });

    const data = await response.json();

    if (data.UserSub) {
        alert("Signup successful! OTP sent to email 📩");
        document.getElementById("signupForm").style.display = "none";
        document.getElementById("otpForm").style.display = "block";
    } else {
        console.log(data);
        alert("Signup failed ❌");
    }
}
async function verifyOTP() {

    const email = document.getElementById("signup_email").value;
    const code = document.getElementById("otp_code").value;

    const response = await fetch(`https://cognito-idp.${REGION}.amazonaws.com/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-amz-json-1.1",
            "X-Amz-Target": "AWSCognitoIdentityProviderService.ConfirmSignUp"
        },
        body: JSON.stringify({
            ClientId: CLIENT_ID,
            Username: email,
            ConfirmationCode: code
        })
    });

    const data = await response.json();

    if (!data.__type) {
        alert("Account verified ✅ Please login");
        showLogin();
        document.getElementById("otpForm").style.display = "none";
    } else {
        console.log(data);
        alert("Invalid OTP ❌");
    }
}

function setupUserUI(email, role, name) {

    document.getElementById("authBtn").style.display = "none";
    document.getElementById("userMenu").style.display = "block";

    // Set initials in avatars
    const initial = (name || email || "U")[0].toUpperCase();
    const userAvatar = document.querySelector(".user-avatar");
    if (userAvatar) userAvatar.innerHTML = `<span>${initial}</span>`;
    const bigAvatar = document.getElementById("dropdownInitialBig");
    if (bigAvatar) bigAvatar.textContent = initial;

    // Populate dropdown
    const nameEl = document.getElementById("userName");
    const emailEl = document.getElementById("userEmail");
    const roleEl = document.getElementById("userRole");
    if (nameEl) nameEl.textContent = name || "—";
    if (emailEl) emailEl.textContent = email;
    if (roleEl) {
        roleEl.textContent = role;
        // Role badge colours
        const colours = { HR: "#7c3aed", Manager: "#0d9488", Employee: "#3d63dd" };
        roleEl.style.background = colours[role] ? colours[role] + "1a" : "";
        roleEl.style.color = colours[role] || "#3d63dd";
    }

    window.currentUser = { email, role };
}
function toggleDropdown() {
    const dropdown = document.getElementById("dropdown");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

// Close dropdown on outside click
document.addEventListener("click", (e) => {
    const menu = document.getElementById("userMenu");
    const dropdown = document.getElementById("dropdown");
    if (menu && dropdown && !menu.contains(e.target)) {
        dropdown.style.display = "none";
    }
});

function logout() {

    token = "";
    window.currentUser = null;
    localStorage.removeItem("idToken");

    document.getElementById("authBtn").style.display = "block";
    document.getElementById("userMenu").style.display = "none";

    applyRoleAccess(null);

    alert("Logged out 👋");
}
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(jsonPayload);
}
async function createCycle() {

    const cycle_name = document.getElementById("cycle_name").value;
    const start_date = document.getElementById("start_date").value;
    const end_date = document.getElementById("end_date").value;

    const participants_input = document.getElementById("participants").value;
    const participants = participants_input.split(",").map(s => s.trim());

    const response = await fetch(`${API_BASE}/cycle/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`  
        },
        body: JSON.stringify({ cycle_name, start_date, end_date, participants })
    });

    const data = await response.json();
    alert(JSON.stringify(data));
}

async function submitReview() {

    const employee_id = document.getElementById("review_employee_id").value;
    const review_type = document.getElementById("review_type").value;
    const answers = [];

    const container = document.getElementById("dynamic_questions");
    const inputs = container.querySelectorAll("input");

    inputs.forEach((input) => {
        if (input.id.startsWith("q_")) {
            const question = input.dataset.question;
            answers.push({ question, answer: input.value });
        }
    });

    const rating = document.getElementById("rating").value;
    const cycle_id = window.currentCycleId;
    const cycle_name = window.currentCycleName;

    const response = await fetch(`${API_BASE}/review/submit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            employee_id,
            manager_id: (review_type === "upward") ? employee_id : window.currentManagerId,
            reviewer_id: window.currentEmployeeId,
            cycle_id,
            cycle_name,
            review_type,
            rating,
            answers
        })
    });

    const data = await response.json();
    alert(JSON.stringify(data));
}
let userRole = "";
let userEmail = "";

function setupReviewOptions() {

    const typeDropdown = document.getElementById("review_type");
    typeDropdown.innerHTML = `<option value="">Select Review Type</option>`;

    if (userRole === "Employee") {
        typeDropdown.innerHTML += `
            <option value="self">Self Review</option>
            <option value="peer">Peer Review</option>
            <option value="upward">Manager Feedback</option>
        `;
    }

    if (userRole === "Manager") {
        typeDropdown.innerHTML += `
            <option value="manager">Manager Review</option>
        `;
    }
}
async function handleReviewTypeChange() {

    const type = document.getElementById("review_type").value;
    const empDropdown = document.getElementById("review_employee_id");
    const cycle_name = document.getElementById("cycle_id").value;
    await fetchCycleParticipants(cycle_name);

    empDropdown.innerHTML = `<option value="">Select Employee</option>`;

    if (!cycle_name) {
        alert("Enter cycle ID first");
        return;
    }

    if (!cycleParticipants || cycleParticipants.length === 0) {
        alert("No participants loaded");
        return;
    }

    if (allEmployees.length === 0) {
        alert("Employees not loaded yet");
        return;
    }

    if (type === "self") {
        empDropdown.innerHTML += `<option value="${window.currentEmployeeId}">Myself</option>`;
    }

    if (type === "peer") {
        allEmployees.forEach(emp => {
            if (
                emp.role === "Employee" &&
                emp.employee_id !== window.currentEmployeeId &&
                cycleParticipants.includes(emp.employee_id)
            ) {
                empDropdown.innerHTML += `<option value="${emp.employee_id}">${emp.employee_id}</option>`;
            }
        });
    }
    if (type === "upward") {
        if (!window.currentManagerId) {
            alert("Manager not assigned ❌");
            return;
        }
        const manager = allEmployees.find(emp => emp.employee_id === window.currentManagerId);
        if (manager) {
            empDropdown.innerHTML += `<option value="${manager.employee_id}">${manager.name || manager.employee_id}</option>`;
        }
    }

    if (type === "manager") {
        allEmployees.forEach(emp => {
            if (
                emp.manager_id === window.currentEmployeeId &&
                cycleParticipants.includes(emp.employee_id)
            ) {
                empDropdown.innerHTML += `<option value="${emp.employee_id}">${emp.employee_id}</option>`;
            }
        });
    }

    // Fetch form config
    const response = await fetch(`${API_BASE}/form-config/${type}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
        alert("Form config not found");
        return;
    }

    const form = await response.json();
    const container = document.getElementById("dynamic_questions");
    container.innerHTML = "";

    // Render questions with improved UI
    form.questions.forEach((q, index) => {
        const div = document.createElement("div");
        div.className = "form-group";
        div.innerHTML = `
            <label>${q}</label>
            <input type="text" id="q_${index}" data-question="${q}" placeholder="Enter your response…">
        `;
        container.appendChild(div);
    });

    // Rating field
    const ratingDiv = document.createElement("div");
    ratingDiv.className = "form-group rating-group";
    ratingDiv.innerHTML = `
        <label>Overall Rating <span class="hint">(1 – 5)</span></label>
        <select id="rating">
            <option value="">Select rating</option>
            <option value="1">⭐ 1 – Poor</option>
            <option value="2">⭐⭐ 2 – Below Average</option>
            <option value="3">⭐⭐⭐ 3 – Average</option>
            <option value="4">⭐⭐⭐⭐ 4 – Good</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 – Excellent</option>
        </select>
    `;
    container.appendChild(ratingDiv);
}
function openOKRModal() {
    document.getElementById("okrModal").style.display = "flex";
    document.getElementById("kr_container").innerHTML = "";
    krCount = 0;
}
function closeModal() {
    document.getElementById("okrModal").style.display = "none";
}
let krCount = 0;

function addKR() {
    if (krCount >= 3) {
        alert("Maximum 3 Key Results allowed");
        return;
    }

    const container = document.getElementById("kr_container");
    const div = document.createElement("div");
    div.className = "kr-card";
    div.innerHTML = `
        <div class="form-group">
            <label>Key Result ${krCount + 1}</label>
            <input placeholder="e.g. Reduce churn to 5%" id="kr_${krCount}">
        </div>
        <div class="form-group">
            <label>Target</label>
            <input placeholder="e.g. 5%" id="target_${krCount}">
        </div>
        <div class="form-group">
            <label>Progress %</label>
            <input placeholder="0–100" id="progress_${krCount}" type="number" min="0" max="100">
        </div>
    `;
    container.appendChild(div);
    krCount++;
}
async function submitOKR() {

    const cycle_name = document.getElementById("okr_cycle_name_modal").value;
    const objective_title = document.getElementById("objective_title").value;

    if (!cycle_name || !objective_title) {
        alert("Fill all fields ❌");
        return;
    }

    let key_results = [];

    for (let i = 0; i < krCount; i++) {
        const kr = document.getElementById(`kr_${i}`).value;
        const target = document.getElementById(`target_${i}`).value;
        const progress = document.getElementById(`progress_${i}`).value;

        if (!kr || !target || progress === "") {
            alert("Fill all KR fields ❌");
            return;
        }

        key_results.push({ kr, target, progress: Number(progress) });
    }

    const response = await fetch(`${API_BASE}/okr/update`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ cycle_name, objective_title, key_results, progress: 0 })
    });

    const data = await response.json();
    alert(JSON.stringify(data));

    document.getElementById("kr_container").innerHTML = "";
    krCount = 0;
    closeModal();
}
async function updateOKR() {
    const cycle_name = document.getElementById("okr_cycle_name").value;

    if (!cycle_name) {
        alert("Enter cycle name ❌");
        return;
    }

    const objective_title = document.getElementById("objective").value;
    const progress = document.getElementById("progress").value;
    let key_results = [];

    const response = await fetch(`${API_BASE}/okr/update`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ objective_title, key_results, progress: Number(progress), cycle_name })
    });

    const data = await response.json();
    alert(JSON.stringify(data));
}

async function generateReport() {

    const employee_id = document.getElementById("report_employee_id").value;
    const cycle_name = document.getElementById("report_cycle_name").value;

    const response = await fetch(`${API_BASE}/report/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ employee_id, cycle_name })
    });

    const data = await response.json();
    if (!response.ok) {
        alert(data);
        return;
    }
    alert(data);

    const file_name = `${employee_id}_${cycle_name}_report.html`;
    const url = `https://performance-reports-bucket-1.s3.amazonaws.com/${file_name}`;
    window.open(url, "_blank");
}

async function loadDashboard() {

    const cycle_id = document.getElementById("dashboard_cycle_id").value;

    const response = await fetch(
        `${API_BASE}/hr/dashboard?cycle_id=${cycle_id}`,
        { method: "GET", headers: { "Authorization": `Bearer ${token}` } }
    );

    const data = await response.json();

    if (!response.ok) {
        alert("API error");
        return;
    }

    const container = document.getElementById("dashboard_data");

    // Build reviewed employees list
    const reviewedHTML = data.reviewed_employees.length
        ? data.reviewed_employees.map(emp => `
            <div class="report-emp-row">
                <span>${emp}</span>
                <button class="btn-view-report" onclick="viewReport('${emp}', '${cycle_id}')">View Report</button>
            </div>
        `).join("")
        : "<p style='font-size:13px;opacity:.7;'>No reports available yet.</p>";

    const flagsHTML = data.flags.length
        ? data.flags.map(f => `<div class="flag-item">⚠️ ${f}</div>`).join("")
        : "<span style='color:var(--green);font-weight:600;'>✅ No issues found</span>";

    container.innerHTML = `
        <div class="card card-blue">
            <div class="card-label">Total Employees</div>
            <div class="card-num">${data.total_employees}</div>
        </div>

        <div class="card card-green">
            <div class="card-label">Completed Reviews</div>
            <div class="card-num">${data.completed_reviews}</div>
        </div>

        <div class="card card-red">
            <div class="card-label">Pending Reviews</div>
            <div class="card-num">${data.pending_reviews}</div>
        </div>

        <div class="card card-orange">
            <div class="card-label">Completion Rate</div>
            <div class="card-num">${data.completion_rate.toFixed(1)}%</div>
        </div>

        <div class="card card-purple">
            <div class="card-label">Average Rating</div>
            <div class="card-num">${data.average_rating.toFixed(2)}</div>
        </div>

        <div class="card card-teal">
            <div class="card-label">OKR Progress</div>
            <div class="card-num">${data.average_okr_progress.toFixed(1)}%</div>
        </div>

        <div class="card card-dark card-wide">
            <div class="card-label" style="color:rgba(255,255,255,.6);margin-bottom:12px;">Employees with Reports</div>
            ${reviewedHTML}
        </div>

        <div class="card card-slate">
            <div class="card-label" style="margin-bottom:10px;">All Participants</div>
            <div style="font-size:13px;color:var(--text-sub);line-height:1.8;">
                ${data.participants.join(", ") || "None"}
            </div>
        </div>

        <div class="card card-slate">
            <div class="card-label" style="margin-bottom:10px;">Pending Employees</div>
            <div style="font-size:13px;color:var(--text-sub);line-height:1.8;">
                ${data.not_reviewed_employees.join(", ") || "✅ All reviewed"}
            </div>
        </div>

        <div class="card card-slate card-wide">
            <div class="card-label" style="margin-bottom:10px;">⚠️ Flags</div>
            ${flagsHTML}
        </div>
    `;
}
async function viewReport(emp, cycle_id) {

    await fetch(`${API_BASE}/report/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ employee_id: emp, cycle_name: cycle_id })
    });

    const url = `https://performance-reports-bucket-1.s3.amazonaws.com/${emp}_${cycle_id}_report.html`;
    window.open(url, "_blank");
}
function applyRoleAccess(role) {

    const cycle = document.getElementById("cycle_section");
    const review = document.getElementById("review_section");
    const okr = document.getElementById("okr_section");
    const report = document.getElementById("report_section");
    const hr = document.getElementById("hr_section");

    cycle.style.display = "none";
    review.style.display = "none";
    okr.style.display = "none";
    report.style.display = "none";
    hr.style.display = "none";

    if (role === "HR") {
        cycle.style.display = "block";
        report.style.display = "block";
        hr.style.display = "block";
    } else if (role === "Manager") {
        review.style.display = "block";
        report.style.display = "block";
    } else if (role === "Employee") {
        review.style.display = "block";
        okr.style.display = "block";
    }
}

window.onload = async function () {

    const savedToken = localStorage.getItem("idToken");

    if (savedToken) {
        token = savedToken;

        const decoded = parseJwt(token);
        userEmail = decoded.email;
        userRole = decoded["custom:role"];
        await fetchEmployeeId();
        setupUserUI(userEmail, userRole, window.currentUserName);
        applyRoleAccess(userRole);
        setupReviewOptions();
        await fetchAllEmployees();
    } else {
        applyRoleAccess(null);
    }
};