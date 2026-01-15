/**
 * Focus Forge - Authentication Module
 * Handles login, signup, session management, and per-user data
 */

// ==========================================
// USER DATA FUNCTIONS
// ==========================================

/**
 * Get user data object for a specific user
 */
function getUserData(userId) {
    const key = `focusForgeData_${userId}`;
    return JSON.parse(localStorage.getItem(key)) || {
        tasks: [],
        sessions: [],
        settings: {
            soundEnabled: true,
            timerDuration: 25,
            theme: 'dark'
        }
    };
}

/**
 * Save user data object
 */
function saveUserData(userId, data) {
    const key = `focusForgeData_${userId}`;
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Get user's tasks
 */
function getUserTasks(userId) {
    const data = getUserData(userId);
    return data.tasks || [];
}

/**
 * Save user's tasks
 */
function saveUserTasks(userId, tasks) {
    const data = getUserData(userId);
    data.tasks = tasks;
    saveUserData(userId, data);
}

/**
 * Get user's sessions
 */
function getUserSessions(userId) {
    const data = getUserData(userId);
    return data.sessions || [];
}

/**
 * Save user's session
 */
function saveUserSession(userId, session) {
    const data = getUserData(userId);
    data.sessions.push(session);
    saveUserData(userId, data);
}

/**
 * Get user's settings
 */
function getUserSettings(userId) {
    const data = getUserData(userId);
    return data.settings;
}

/**
 * Save user's settings
 */
function saveUserSettings(userId, settings) {
    const data = getUserData(userId);
    data.settings = { ...data.settings, ...settings };
    saveUserData(userId, data);
}

/**
 * Migrate old global data to current user
 */
function migrateGlobalData(userId) {
    // Migrate tasks
    const globalTasks = JSON.parse(localStorage.getItem('focusForgeTasks')) || [];
    if (globalTasks.length > 0) {
        const userTasks = getUserTasks(userId);
        if (userTasks.length === 0) {
            saveUserTasks(userId, globalTasks);
        }
    }
    
    // Migrate sessions
    const globalSessions = JSON.parse(localStorage.getItem('focusForgeSessions')) || [];
    if (globalSessions.length > 0) {
        const userSessions = getUserSessions(userId);
        if (userSessions.length === 0) {
            const data = getUserData(userId);
            data.sessions = globalSessions;
            saveUserData(userId, data);
        }
    }
    
    // Migrate sound setting
    const soundEnabled = JSON.parse(localStorage.getItem('focusForgeSound'));
    if (soundEnabled !== null) {
        const settings = getUserSettings(userId);
        if (settings.soundEnabled === true) {
            saveUserSettings(userId, { soundEnabled });
        }
    }
}

// ==========================================
// AUTHENTICATION FUNCTIONS
// ==========================================

/**
 * Get all registered users from localStorage
 */
function getUsers() {
    return JSON.parse(localStorage.getItem('focusForgeUsers')) || [];
}

/**
 * Save users to localStorage
 */
function saveUsers(users) {
    localStorage.setItem('focusForgeUsers', JSON.stringify(users));
}

/**
 * Find user by email
 */
function findUserByEmail(email) {
    const users = getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

/**
 * Register a new user
 */
function registerUser(name, email, password) {
    const users = getUsers();
    
    // Check if user already exists
    if (findUserByEmail(email)) {
        return { success: false, message: 'An account with this email already exists' };
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password, // In production, this should be hashed
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Initialize user data
    getUserData(newUser.id); // Creates empty data structure
    
    return { success: true, message: 'Account created successfully' };
}

/**
 * Authenticate user login
 */
function loginUser(email, password, remember) {
    const user = findUserByEmail(email);
    
    if (!user) {
        return { success: false, message: 'No account found with this email' };
    }
    
    if (user.password !== password) {
        return { success: false, message: 'Incorrect password' };
    }
    
    // Create session
    const session = {
        userId: user.id,
        name: user.name,
        email: user.email,
        loginAt: new Date().toISOString()
    };
    
    if (remember) {
        localStorage.setItem('focusForgeSession', JSON.stringify(session));
    } else {
        sessionStorage.setItem('focusForgeSession', JSON.stringify(session));
    }
    
    // Migrate any global data to this user
    migrateGlobalData(user.id);
    
    return { success: true, message: 'Login successful', user: session };
}

/**
 * Logout user
 */
function logoutUser() {
    localStorage.removeItem('focusForgeSession');
    sessionStorage.removeItem('focusForgeSession');
    window.location.href = 'login.html';
}

/**
 * Get current session
 */
function getCurrentSession() {
    return JSON.parse(localStorage.getItem('focusForgeSession')) || 
           JSON.parse(sessionStorage.getItem('focusForgeSession'));
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return getCurrentSession() !== null;
}

/**
 * Redirect to main app if logged in
 */
function redirectIfLoggedIn() {
    if (isLoggedIn()) {
        window.location.href = 'index.html';
    }
}

// ==========================================
// UI FUNCTIONS
// ==========================================

// DOM Elements
const elements = {
    loginToggle: document.getElementById('loginToggle'),
    signupToggle: document.getElementById('signupToggle'),
    toggleSlider: document.getElementById('toggleSlider'),
    loginForm: document.getElementById('loginForm'),
    signupForm: document.getElementById('signupForm'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    signupName: document.getElementById('signupName'),
    signupEmail: document.getElementById('signupEmail'),
    signupPassword: document.getElementById('signupPassword'),
    signupConfirmPassword: document.getElementById('signupConfirmPassword'),
    rememberMe: document.getElementById('rememberMe'),
    agreeTerms: document.getElementById('agreeTerms'),
    toggleLoginPassword: document.getElementById('toggleLoginPassword'),
    toggleSignupPassword: document.getElementById('toggleSignupPassword'),
    loginError: document.getElementById('loginError'),
    signupError: document.getElementById('signupError'),
    authSwitchText: document.getElementById('authSwitchText'),
    authSwitchLink: document.getElementById('authSwitchLink')
};

/**
 * Toggle between login and signup forms
 */
let isLoginMode = true;

function toggleAuthMode(mode) {
    isLoginMode = (mode === 'login');
    
    if (isLoginMode) {
        // Switch to login
        elements.loginToggle.classList.add('active');
        elements.signupToggle.classList.remove('active');
        elements.toggleSlider.style.transform = 'translateX(0)';
        elements.loginForm.classList.add('active');
        elements.signupForm.classList.remove('active');
        elements.authSwitchText.textContent = "Don't have an account?";
        elements.authSwitchLink.textContent = 'Sign up';
    } else {
        // Switch to signup
        elements.loginToggle.classList.remove('active');
        elements.signupToggle.classList.add('active');
        elements.toggleSlider.style.transform = 'translateX(100%)';
        elements.loginForm.classList.remove('active');
        elements.signupForm.classList.add('active');
        elements.authSwitchText.textContent = 'Already have an account?';
        elements.authSwitchLink.textContent = 'Login';
    }
}

/**
 * Show error message
 */
function showError(element, message) {
    element.textContent = message;
    element.classList.add('visible');
    
    setTimeout(() => {
        element.classList.remove('visible');
    }, 5000);
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility(button) {
    const input = button.parentElement.querySelector('input');
    const eyeOpen = button.querySelector('.eye-open');
    const eyeClosed = button.querySelector('.eye-closed');
    
    if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
    } else {
        input.type = 'password';
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
    }
}

/**
 * Shake animation for errors
 */
function shakeElement(element) {
    element.style.animation = 'none';
    element.offsetHeight; // Trigger reflow
    element.style.animation = 'shake 0.5s ease';
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function initEventListeners() {
    // Toggle between login and signup
    elements.loginToggle.addEventListener('click', () => toggleAuthMode('login'));
    elements.signupToggle.addEventListener('click', () => toggleAuthMode('signup'));
    
    // Footer link also toggles
    elements.authSwitchLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthMode(isLoginMode ? 'signup' : 'login');
    });
    
    // Password toggle buttons
    if (elements.toggleLoginPassword) {
        elements.toggleLoginPassword.addEventListener('click', () => togglePasswordVisibility(elements.toggleLoginPassword));
    }
    if (elements.toggleSignupPassword) {
        elements.toggleSignupPassword.addEventListener('click', () => togglePasswordVisibility(elements.toggleSignupPassword));
    }
    
    // Login form submission
    elements.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = elements.loginEmail.value.trim();
        const password = elements.loginPassword.value;
        const remember = elements.rememberMe.checked;
        
        const result = loginUser(email, password, remember);
        
        if (result.success) {
            // Redirect to main app
            window.location.href = 'index.html';
        } else {
            showError(elements.loginError, result.message);
            shakeElement(elements.loginForm);
        }
    });
    
    // Signup form submission
    elements.signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = elements.signupName.value.trim();
        const email = elements.signupEmail.value.trim();
        const password = elements.signupPassword.value;
        const confirmPassword = elements.signupConfirmPassword.value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            showError(elements.signupError, 'Passwords do not match');
            shakeElement(elements.signupForm);
            return;
        }
        
        // Validate password length
        if (password.length < 6) {
            showError(elements.signupError, 'Password must be at least 6 characters');
            shakeElement(elements.signupForm);
            return;
        }
        
        const result = registerUser(name, email, password);
        
        if (result.success) {
            // Auto login after signup
            const loginResult = loginUser(email, password, true);
            if (loginResult.success) {
                window.location.href = 'index.html';
            }
        } else {
            showError(elements.signupError, result.message);
            shakeElement(elements.signupForm);
        }
    });
    
    // Clear errors on input
    const allInputs = document.querySelectorAll('.auth-form input');
    allInputs.forEach(input => {
        input.addEventListener('input', () => {
            elements.loginError.classList.remove('visible');
            elements.signupError.classList.remove('visible');
        });
    });
}

// ==========================================
// INITIALIZATION
// ==========================================

function init() {
    // Redirect if already logged in
    redirectIfLoggedIn();
    
    // Initialize event listeners
    initEventListeners();
}

// Start
document.addEventListener('DOMContentLoaded', init);

