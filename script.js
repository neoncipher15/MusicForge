// Global variables
let timerInterval;
let timeLeft = 25 * 60; // 25 minutes in seconds
let isWorkSession = true;
let sessionsCompleted = 0;
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let calendarEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];

// Initialize particles.js for brain.fm-like glow orbs background
particlesJS('particles-js', {
  particles: {
    number: { value: 50, density: { enable: true, value_area: 800 } },
    color: { value: '#4ecdc4' },
    shape: { type: 'circle' },
    opacity: { value: 0.3, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
    size: { value: 100, random: true, anim: { enable: true, speed: 2, size_min: 20, sync: false } },
    line_linked: { enable: false },
    move: { enable: true, speed: 1, direction: 'none', random: true, straight: false, out_mode: 'out', bounce: false, attract: { enable: false, rotateX: 600, rotateY: 1200 } }
  },
  interactivity: {
    detect_on: 'canvas',
    events: { onhover: { enable: true, mode: 'bubble' }, onclick: { enable: true, mode: 'repulse' }, resize: true },
    modes: {
      bubble: { distance: 200, size: 150, duration: 2, opacity: 0.8, speed: 3 },
      repulse: { distance: 200, duration: 0.4 }
    }
  },
  retina_detect: true
});

// Pomodoro Timer Functions
function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById('timer-display').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  document.getElementById('timer-status').textContent = isWorkSession ? 'Work Session' : 'Break Time';
}

function startTimer() {
  if (!timerInterval) {
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        if (isWorkSession) {
          sessionsCompleted++;
          localStorage.setItem('sessionsCompleted', sessionsCompleted);
          alert('Work session completed! Take a break.');
          timeLeft = 5 * 60; // 5 minute break
          isWorkSession = false;
        } else {
          alert('Break time over! Ready for another work session?');
          timeLeft = 25 * 60; // Back to 25 minutes
          isWorkSession = true;
        }
        updateTimerDisplay();
      }
    }, 1000);
  }
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timeLeft = 25 * 60;
  isWorkSession = true;
  updateTimerDisplay();
}

// Task Management Functions
function addTask() {
  const input = document.getElementById('task-input');
  const taskText = input.value.trim();
  if (taskText) {
    const task = {
      id: Date.now(),
      text: taskText,
      completed: false,
      priority: 'medium',
      createdAt: new Date().toISOString()
    };
    tasks.push(task);
    saveTasks();
    renderTasks();
    input.value = '';
  }
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function filterTasks(status) {
  renderTasks(status);
}

function renderTasks(filter = 'all') {
  const taskList = document.getElementById('task-list');
  if (!taskList) return;

  taskList.innerHTML = '';
  let filteredTasks = tasks;

  if (filter === 'pending') {
    filteredTasks = tasks.filter(t => !t.completed);
  } else if (filter === 'completed') {
    filteredTasks = tasks.filter(t => t.completed);
  }

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.innerHTML = `
      <span>${task.text}</span>
      <div>
        <button onclick="toggleTask(${task.id})">${task.completed ? 'Undo' : 'Complete'}</button>
        <button onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Analytics Functions
function updateAnalytics() {
  const totalHours = Math.floor((sessionsCompleted * 25) / 60);
  const tasksCompleted = tasks.filter(t => t.completed).length;

  document.getElementById('total-hours').textContent = totalHours;
  document.getElementById('sessions-completed').textContent = sessionsCompleted;
  document.getElementById('tasks-completed').textContent = tasksCompleted;

  renderChart();
}

function renderChart() {
  const ctx = document.getElementById('taskChart');
  if (!ctx) return;

  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const data = last7Days.map(date => {
    return tasks.filter(t => t.completed && t.createdAt.startsWith(date)).length;
  });

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: last7Days.map(d => new Date(d).toLocaleDateString()),
      datasets: [{
        label: 'Tasks Completed',
        data: data,
        borderColor: '#4ecdc4',
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Calendar Functions
function initCalendar() {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    events: calendarEvents,
    dateClick: function(info) {
      const taskText = prompt('Add a task for ' + info.dateStr);
      if (taskText) {
        const event = {
          id: Date.now(),
          title: taskText,
          start: info.dateStr,
          allDay: true
        };
        calendarEvents.push(event);
        saveCalendarEvents();
        calendar.addEvent(event);
      }
    },
    eventClick: function(info) {
      if (confirm('Delete this task?')) {
        calendarEvents = calendarEvents.filter(e => e.id != info.event.id);
        saveCalendarEvents();
        info.event.remove();
      }
    }
  });
  calendar.render();
}

function saveCalendarEvents() {
  localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
}

// Donation Modal Functions
function openDonationModal() {
  document.getElementById('donation-modal').style.display = 'block';
}

function closeDonationModal() {
  document.getElementById('donation-modal').style.display = 'none';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  sessionsCompleted = parseInt(localStorage.getItem('sessionsCompleted')) || 0;

  // Timer controls
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const resetBtn = document.getElementById('reset-btn');

  if (startBtn) startBtn.addEventListener('click', startTimer);
  if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
  if (resetBtn) resetBtn.addEventListener('click', resetTimer);

  updateTimerDisplay();
  renderTasks();
  updateAnalytics();
  initCalendar();

  // Close modal when clicking outside
  window.onclick = function(event) {
    const modal = document.getElementById('donation-modal');
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
});
