

(function() {
  
    const STORAGE_USERS = "app_users";
    const SESSION_KEY = "logged_in_user";

   
    function initializeUsers() {
        const users = localStorage.getItem(STORAGE_USERS);
        if (!users) {
            const defaultUsers = [
                {
                    id: 1,
                    name: "Demo User",
                    email: "demo@example.com",
                    password: "demo123"
                }
            ];
            localStorage.setItem(STORAGE_USERS, JSON.stringify(defaultUsers));
        }
    }

    
    function getUsers() {
        const users = localStorage.getItem(STORAGE_USERS);
        return users ? JSON.parse(users) : [];
    }

 
    function saveUsers(users) {
        localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    }

    function showMessage(elementId, message, isSuccess = false) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.className = `message ${isSuccess ? 'success' : 'error'} show`;
            
            setTimeout(() => {
                element.classList.remove('show');
            }, 3000);
        }
    }

  
    function clearMessages() {
        const messages = document.querySelectorAll('.message');
        messages.forEach(msg => {
            msg.classList.remove('show');
        });
    }

   
    function registerUser(name, email, password) {
   
        if (!name || !email || !password) {
            showMessage('registerError', '⚠️ All fields are required');
            return false;
        }
        
        if (!email.includes('@') || !email.includes('.')) {
            showMessage('registerError', '⚠️ Please enter a valid email address');
            return false;
        }
        
        if (password.length < 6) {
            showMessage('registerError', '⚠️ Password must be at least 6 characters');
            return false;
        }
        
        
        const users = getUsers();
        const userExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());
        
        if (userExists) {
            showMessage('registerError', '❌ Email already registered. Please login instead.');
            return false;
        }
        
       
        const newUser = {
            id: Date.now(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password
        };
        
        users.push(newUser);
        saveUsers(users);
        
        showMessage('registerSuccess', '✅ Account created successfully! Please login.', true);
        
        
        document.getElementById('regName').value = '';
        document.getElementById('regEmail').value = '';
        document.getElementById('regPassword').value = '';
        
      
        setTimeout(() => {
            switchToLogin();
        }, 1500);
        
        return true;
    }

     
    function loginUser(email, password) {
        if (!email || !password) {
            showMessage('loginError', '⚠️ Please enter email and password');
            return false;
        }
        
        const users = getUsers();
        const user = users.find(u => u.email === email.toLowerCase() && u.password === password);
        
        if (!user) {
            showMessage('loginError', '❌ Invalid email or password');
            return false;
        }
        
         
        const sessionData = {
            id: user.id,
            name: user.name,
            email: user.email
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        
        showMessage('loginError', '✅ Login successful! Redirecting...', true);
        
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
        return true;
    }

    
    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.href = 'index.html';
    }

   
    function isLoggedIn() {
        const session = sessionStorage.getItem(SESSION_KEY);
        return session !== null;
    }

   
    function getCurrentUser() {
        const session = sessionStorage.getItem(SESSION_KEY);
        return session ? JSON.parse(session) : null;
    }

   
    function switchToLogin() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        
        clearMessages();
    }

    function switchToRegister() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        
        clearMessages();
    }

    function protectDashboard() {
        if (!isLoggedIn()) {
            window.location.href = 'index.html';
        }
    }

   
    function displayUserInfo() {
        const user = getCurrentUser();
        if (user) {
            const userNameElement = document.getElementById('userName');
            const userEmailElement = document.getElementById('userEmail');
            
            if (userNameElement) userNameElement.textContent = user.name;
            if (userEmailElement) userEmailElement.textContent = user.email;
        }
    }

   
    document.addEventListener('DOMContentLoaded', () => {
        initializeUsers();
        
        
        const loginForm = document.getElementById('login');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                loginUser(email, password);
            });
        }
        
      
        const registerForm = document.getElementById('register');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('regName').value;
                const email = document.getElementById('regEmail').value;
                const password = document.getElementById('regPassword').value;
                registerUser(name, email, password);
            });
        }
        
        // Switch to register button
        const showRegisterBtn = document.getElementById('showRegisterBtn');
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                switchToRegister();
            });
        }
        
        // Switch to login button
        const showLoginBtn = document.getElementById('showLoginBtn');
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                switchToLogin();
            });
        }
        
        // Logout button (if on dashboard)
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                logout();
            });
        }
        
        // Protect dashboard and display user info
        if (window.location.pathname.includes('dashboard.html')) {
            protectDashboard();
            displayUserInfo();
        }
    });
})();