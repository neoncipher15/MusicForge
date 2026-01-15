/**
 * Focus Forge - Tasks Page
 * All tasks management
 */

// Task storage
let tasks = JSON.parse(localStorage.getItem('focusForgeTasks')) || [];

// DOM Elements
const elements = {
    taskInput: document.getElementById('taskInput'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    allTasksList: document.getElementById('allTasksList'),
    totalTasks: document.getElementById('totalTasks'),
    completedTasks: document.getElementById('completedTasks'),
    pendingTasks: document.getElementById('pendingTasks'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    donationModal: document.getElementById('donationModal'),
    donationClose: document.getElementById('donationClose'),
    sidebarDonation: document.getElementById('sidebarDonation')
};

// Task Functions
function saveTasks() {
    localStorage.setItem('focusForgeTasks', JSON.stringify(tasks));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addTask(text) {
    if (text.trim()) {
        tasks.push({ 
            text: text.trim(), 
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        });
        saveTasks();
        renderTasks();
    }
}

function toggleTask(index) {
    const task = tasks[index];
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;
    saveTasks();
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

function renderTasks(filter = 'all') {
    let filteredTasks = [...tasks];
    
    if (filter === 'pending') {
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (filter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    }
    
    elements.allTasksList.innerHTML = '';
    
    filteredTasks.forEach((task, index) => {
        // Find original index in main array
        const originalIndex = tasks.indexOf(task);
        
        const taskEl = document.createElement('div');
        taskEl.className = `task-item${task.completed ? ' completed' : ''}`;
        taskEl.innerHTML = `
            <div class="task-checkbox${task.completed ? ' checked' : ''}" data-index="${originalIndex}">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" stroke-width="3"/>
                </svg>
            </div>
            <span class="task-text">${escapeHtml(task.text)}</span>
            <span class="task-date">${formatDate(task.createdAt)}</span>
            <button class="task-delete" data-index="${originalIndex}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;
        elements.allTasksList.appendChild(taskEl);
    });
    
    updateStats();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
        return 'Today';
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    elements.totalTasks.textContent = total;
    elements.completedTasks.textContent = completed;
    elements.pendingTasks.textContent = pending;
}

// Event Listeners
function initEventListeners() {
    // Add task
    elements.addTaskBtn.addEventListener('click', () => {
        addTask(elements.taskInput.value);
        elements.taskInput.value = '';
    });
    
    elements.taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask(elements.taskInput.value);
            elements.taskInput.value = '';
        }
    });
    
    // Task delegation
    elements.allTasksList.addEventListener('click', (e) => {
        const checkbox = e.target.closest('.task-checkbox');
        const deleteBtn = e.target.closest('.task-delete');
        
        if (checkbox) {
            toggleTask(parseInt(checkbox.dataset.index));
        } else if (deleteBtn) {
            deleteTask(parseInt(deleteBtn.dataset.index));
        }
    });
    
    // Filter buttons
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTasks(btn.dataset.filter);
        });
    });
    
    // Donation modal
    if (elements.sidebarDonation) {
        elements.sidebarDonation.addEventListener('click', () => {
            elements.donationModal.classList.add('active');
        });
    }
    
    if (elements.donationClose) {
        elements.donationClose.addEventListener('click', () => {
            elements.donationModal.classList.remove('active');
        });
    }
    
    if (elements.donationModal) {
        elements.donationModal.addEventListener('click', (e) => {
            if (e.target === elements.donationModal) {
                elements.donationModal.classList.remove('active');
            }
        });
    }
}

// Initialize
function init() {
    initEventListeners();
    renderTasks();
}

// Start
document.addEventListener('DOMContentLoaded', init);

