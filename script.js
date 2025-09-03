// Load data or initialize defaults
let trainingData = JSON.parse(localStorage.getItem('trainingData')) || {
    'Upper Body': 0,
    'Core': 0,
    'Lower Body': 0,
    'Upper Body Multiplier': 1,
    'Core Multiplier': 1,
    'Lower Body Multiplier': 1,
    'Upper Body Level': 1,
    'Core Level': 1,
    'Lower Body Level': 1,
    level: 1,
    ki: 0
  };
  
  let supplementData = JSON.parse(localStorage.getItem('supplementData')) || {};
  
  // History arrays for undo tracking
  let trainingHistory = JSON.parse(localStorage.getItem('trainingHistory')) || [];
  let kiHistory = JSON.parse(localStorage.getItem('kiHistory')) || [];
  let supplementHistory = JSON.parse(localStorage.getItem('supplementHistory')) || [];
  
  const BASE_GOALS = {
    'Upper Body': 960,
    'Core': 480,
    'Lower Body': 480
  };
  
  const SAIYAN_FORMS = [
    "Super Saiyan",
    "Super Saiyan 2",
    "Super Saiyan 3",
    "Super Saiyan 4",
    "Super Saiyan God",
    "Super Saiyan God Blue",
    "Ultra Instinct",
    "Mastered Ultra Instinct",
    "Kaio-ken UI",
    "Kaio-ken MUI"
  ];

  const forms = [
    "Super Saiyan",
    "Super Saiyan 2",
    "Super Saiyan 3",
    "Super Saiyan 4",
    "Super Saiyan God",
    "Super Saiyan God Blue",
    "Ultra Instinct",
    "Mastered Ultra Instinct",
    "Kaio-ken UI",
    "Kaio-ken MUI"
  ];
  
  
  // --- LEVEL CALCULATION FUNCTIONS ---
  
  function getLevelForPart(part) {
    const baseGoal = BASE_GOALS[part];
    return Math.floor(trainingData[part] / baseGoal) + 1;
  }
  
  function calculateOverallLevel() {
    const ubLevel = trainingData['Upper Body Level'];
    const coreLevel = trainingData['Core Level'];
    const lbLevel = trainingData['Lower Body Level'];
  
    const minLevel = Math.min(ubLevel, coreLevel, lbLevel);
    return Math.min(minLevel, SAIYAN_FORMS.length);
  }

  function calculateTotalMinutes() {
    return trainingData['Upper Body'] + trainingData['Core'] + trainingData['Lower Body'];
  }
  
  
  // --- UI UPDATE FUNCTIONS ---
  
  function updateUI() {
    ['Upper Body', 'Core', 'Lower Body'].forEach(part => {
      const oldLevel = trainingData[`${part} Level`] || 1;
      const newLevel = getLevelForPart(part);
      const baseGoal = BASE_GOALS[part];
      const current = trainingData[part];
      const multiplier = trainingData[`${part} Multiplier`] || 1;
      const goal = baseGoal * multiplier;
  
      if (newLevel > oldLevel) {
        trainingData[`${part} Level`] = newLevel;
        flashLevelUp(part, newLevel);
      }
  
      const progressInCurrentChunk = current % baseGoal;
      const percent = (progressInCurrentChunk / baseGoal) * 100;
      const idBase = part.replace(/ /g, '');
      const progressBar = document.getElementById(`${idBase}-progress`);
      const label = document.getElementById(`${idBase}-hours`);
      const levelLabel = document.getElementById(`${idBase}-level`);
  
      if (progressBar) progressBar.style.width = percent + '%';
  
      if (label) {
        const newGoalText = `${Math.min(current, goal)} / <strong>${goal}</strong>`;
        const currentHTML = label.innerHTML;
        if (!currentHTML.includes(goal.toString())) {
          label.innerHTML = `${Math.min(current, goal)} / <strong class="goal-flash">${goal}</strong>`;
          setTimeout(() => {
            const strong = label.querySelector('strong');
            if (strong) strong.classList.remove('goal-flash');
          }, 1000);
        } else {
          label.innerHTML = newGoalText;
        }
      }
  
      if (levelLabel) {
        const currentLevelMatch = levelLabel.innerHTML.match(/\d+/);
        const currentLevel = currentLevelMatch ? parseInt(currentLevelMatch[0]) : 1;
        if (newLevel > currentLevel) {
          levelLabel.innerHTML = `Level : <strong class="level-flash">${newLevel}</strong>`;
          setTimeout(() => {
            const strong = levelLabel.querySelector('strong');
            if (strong) strong.classList.remove('level-flash');
          }, 800);
        } else {
          levelLabel.innerHTML = `Level : <strong>${newLevel}</strong>`;
        }
      }
    });
  
    // Overall level
    // Recalculate individual part levels
trainingData['Upper Body Level'] = getLevelForPart('Upper Body');
trainingData['Core Level'] = getLevelForPart('Core');
trainingData['Lower Body Level'] = getLevelForPart('Lower Body');

// Recalculate overall level (lowest of the 3 part levels)
const newOverallLevel = Math.min(
    trainingData['Upper Body Level'],
    trainingData['Core Level'],
    trainingData['Lower Body Level']
);



trainingData.level = newOverallLevel;
document.getElementById("level").textContent = newOverallLevel;

// ✅ Get current form name and show it
const currentForm = forms[newOverallLevel - 1] || "Unknown Form";
const formElement = document.getElementById("form");
if (formElement) {
  formElement.textContent = currentForm;
}

// ✅ Update power level (total minutes logged)
document.getElementById("power-level").textContent = calculateTotalMinutes();
document.getElementById("ki-control").textContent = trainingData.ki;



// Save to local storage
localStorage.setItem('trainingData', JSON.stringify(trainingData));
localStorage.setItem('supplementData', JSON.stringify(supplementData));
localStorage.setItem('trainingHistory', JSON.stringify(trainingHistory));
localStorage.setItem('kiHistory', JSON.stringify(kiHistory));
localStorage.setItem('supplementHistory', JSON.stringify(supplementHistory));

// Render log displays
renderSupplements();
renderHistoryLogs();

    

  }
  
  function flashLevelUp(part, newLevel) {
    const levelLabel = document.getElementById(part.replace(/ /g, '') + '-level');
    if (!levelLabel) return;
  
    levelLabel.innerHTML = `Level : <strong class="level-flash">${newLevel}</strong>`;
    setTimeout(() => {
      const strong = levelLabel.querySelector('strong');
      if (strong) strong.classList.remove('level-flash');
    }, 800);
  }
  
  // --- LOGGING FUNCTIONS WITH HISTORY ---
  
  function logTraining() {
    const type = document.getElementById("training-type").value;
    const mins = parseInt(document.getElementById("training-mins").value);
    if (!mins || mins <= 0) return;
  
    trainingData[type] += mins;
  
    if (!trainingData[`${type} Multiplier`]) trainingData[`${type} Multiplier`] = 1;
  
    const baseGoal = BASE_GOALS[type];
    while (trainingData[type] >= baseGoal * trainingData[`${type} Multiplier`]) {
      trainingData[`${type} Multiplier`] *= 2;
    }
  
    trainingData.ki = Math.max(0, trainingData.ki - 1);
  
    // Save log to history for undo
    trainingHistory.push({ type, mins });
    localStorage.setItem('trainingHistory', JSON.stringify(trainingHistory));
  
    updateUI();
    resetTraining();
  }
  
  function logKi() {
    const mins = parseInt(document.getElementById("ki-mins").value);
    if (!mins || mins <= 0) return;
  
    trainingData.ki = Math.min(100, trainingData.ki + mins);
  
    // Save ki log to history for undo
    kiHistory.push(mins);
    localStorage.setItem('kiHistory', JSON.stringify(kiHistory));
  
    updateUI();
    resetKi();
  }
  
  function logSupplement() {
    const nameInput = document.getElementById('supplement-name');
    const name = nameInput.value.trim();
    if (!name) return alert('Please enter a supplement name.');
  
    const today = new Date().toISOString().slice(0, 10);
    if (!supplementData[today]) supplementData[today] = [];
    supplementData[today].push(name);
  
    // Save supplement log to history for undo
    supplementHistory.push({ date: today, name });
    localStorage.setItem('supplementHistory', JSON.stringify(supplementHistory));
  
    localStorage.setItem('supplementData', JSON.stringify(supplementData));
    nameInput.value = '';
    updateUI();
  }
  
  // --- UNDO FUNCTIONS ---
  
  function undoTraining() {
    if (trainingHistory.length === 0) return alert('No training logs to undo.');
  
    const lastLog = trainingHistory.pop();
    trainingData[lastLog.type] -= lastLog.mins;
  
    // Adjust multipliers down if needed
    const baseGoal = BASE_GOALS[lastLog.type];
    while (
      trainingData[`${lastLog.type} Multiplier`] > 1 &&
      trainingData[lastLog.type] < baseGoal * trainingData[`${lastLog.type} Multiplier`] / 2
    ) {
      trainingData[`${lastLog.type} Multiplier`] /= 2;
    }
  
    trainingData.ki = Math.min(100, trainingData.ki + 1); // Revert ki decrease
  
    localStorage.setItem('trainingHistory', JSON.stringify(trainingHistory));
    updateUI();
    resetTraining();
  }
  
  function undoKi() {
    if (kiHistory.length === 0) return alert('No Ki logs to undo.');
  
    const lastKi = kiHistory.pop();
    trainingData.ki = Math.max(0, trainingData.ki - lastKi);
  
    localStorage.setItem('kiHistory', JSON.stringify(kiHistory));
    updateUI();
  }
  
  function undoSupplement() {
    if (supplementHistory.length === 0) return alert('No supplement logs to undo.');
  
    const lastSupp = supplementHistory.pop();
    const { date, name } = lastSupp;
  
    if (supplementData[date]) {
      const index = supplementData[date].lastIndexOf(name);
      if (index > -1) {
        supplementData[date].splice(index, 1);
        if (supplementData[date].length === 0) delete supplementData[date];
      }
    }
  
    localStorage.setItem('supplementHistory', JSON.stringify(supplementHistory));
    localStorage.setItem('supplementData', JSON.stringify(supplementData));
    updateUI();
  }
  
  // --- RESET INPUTS (NOT undo) ---
  
  function resetTraining() {
    document.getElementById("training-type").selectedIndex = 0;
    document.getElementById("training-mins").value = '';
  }
  
  function resetKi() {
    document.getElementById("ki-mins").value = '';
  }
  
  function resetSupplement() {
    document.getElementById("supplement-name").value = '';
  }
  
  // --- RENDER SUPPLEMENTS ---
  
  function renderSupplements() {
    const container = document.getElementById('supplement-log');
    container.innerHTML = '';
  
    const dates = Object.keys(supplementData).sort((a, b) => b.localeCompare(a));
    dates.forEach(date => {
      const btn = document.createElement('button');
      btn.className = 'collapsible';
      btn.textContent = date;
      btn.onclick = () => {
        btn.classList.toggle('active');
        const content = btn.nextElementSibling;
        content.style.display = content.style.display === 'block' ? 'none' : 'block';
      };
  
      const contentDiv = document.createElement('div');
      contentDiv.className = 'content';
      supplementData[date].forEach((supp, i) => {
        const item = document.createElement('div');
        item.className = 'supplement-item';
        item.textContent = `${i + 1}. ${supp}`;
        contentDiv.appendChild(item);
      });
  
      container.appendChild(btn);
      container.appendChild(contentDiv);
    });
  }
  
  // --- HISTORY MODAL LOGS RENDER ---
  
  function renderHistoryLogs() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
  
    function getLogDate(log) {
      if (log.date) return formatDate(log.date);
      if (log.timestamp) return formatDate(log.timestamp);
      return formatDate(new Date());  // fallback to today
    }
  
    function formatDate(date) {
      const d = new Date(date);
      if (isNaN(d)) return 'Invalid Date';
      return d.toISOString().split('T')[0];
    }
  
    function groupByDate(logs) {
      return logs.reduce((acc, log) => {
        const date = getLogDate(log);
        if (!acc[date]) acc[date] = [];
        acc[date].push(log);
        return acc;
      }, {});
    }
  
    // --- Training Logs ---
    const trainingCount = trainingHistory.length;
    const trainingByDate = groupByDate(trainingHistory);
  
    let html = `<h3>Training Logs History (Total ${trainingCount} entries)</h3>`;
  
    Object.keys(trainingByDate)
      .sort((a, b) => b.localeCompare(a))
      .forEach(date => {
        html += `<p style="margin-top:1rem; font-weight:bold;">${date}</p>`;
        html += '<ol style="margin-top:0; padding-left:20px;">';
        trainingByDate[date].forEach(log => {
          const type = log.type || 'Unknown Type';
          const mins = log.mins !== undefined ? log.mins : '?';
          html += `<li>${type} - ${mins} mins</li>`;
        });
        html += '</ol>';
      });
  
    // --- Ki Logs ---
    const kiCount = kiHistory.length;
    const kiByDate = groupByDate(kiHistory);
  
    html += `<h3>Ki Logs History (Total ${kiCount} entries)</h3>`;
  
    Object.keys(kiByDate)
      .sort((a, b) => b.localeCompare(a))
      .forEach(date => {
        html += `<p style="margin-top:1rem; font-weight:bold;">${date}</p>`;
        html += '<ol style="margin-top:0; padding-left:20px;">';
        kiByDate[date].forEach(log => {
          const amount = log.amount !== undefined ? log.amount : (typeof log === 'number' ? log : '?');
          const typeText = log.type ? ` (${log.type})` : '';
          html += `<li>+${amount} Ki${typeText}</li>`;
        });
        html += '</ol>';
      });
  
    // --- Supplement Logs ---
    const supplementDates = Object.keys(supplementData).sort((a, b) => b.localeCompare(a));
    html += `<h3>Supplement Logs</h3>`;
  
    supplementDates.forEach(date => {
      html += `<p style="margin-top:1rem; font-weight:bold;">${date}</p>`;
      html += '<ol style="margin-top:0; padding-left:20px;">';
      supplementData[date].forEach(supp => {
        html += `<li>${supp}</li>`;
      });
      html += '</ol>';
    });
  
    historyList.innerHTML = html;
  }
  
  
  // --- MODAL TOGGLE ---
  
  const modal = document.getElementById('history-modal');

  function toggleHistoryModal() {
    if (modal.style.display === 'flex') {
      modal.style.display = 'none';
    } else {
      modal.style.display = 'flex';
    }
  }

  // Close modal if clicking outside modal-content
  modal.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  // --- RESET ALL DATA ---
  
  function resetAllData() {
    if (!confirm("Are you sure you want to reset ALL data?")) return;
  
    trainingData = {
      'Upper Body': 0,
      'Core': 0,
      'Lower Body': 0,
      'Upper Body Multiplier': 1,
      'Core Multiplier': 1,
      'Lower Body Multiplier': 1,
      'Upper Body Level': 1,
      'Core Level': 1,
      'Lower Body Level': 1,
      level: 1,
      ki: 0
    };
    supplementData = {};
    trainingHistory = [];
    kiHistory = [];
    supplementHistory = [];
  
    localStorage.clear();
    updateUI();
  }
  
  // --- EXPORT / IMPORT ---
  
  function exportData(format) {
    const data = {
      trainingData,
      supplementData,
      trainingHistory,
      kiHistory,
      supplementHistory
    };
  
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // e.g. "2025-08-01"
  
    let blob, filename;
  
    if (format === 'json') {
      const dataStr = JSON.stringify(data, null, 2);
      blob = new Blob([dataStr], { type: "application/json" });
      filename = `saiyan_life_tracker_backup_${dateStr}.json`;
    } else if (format === 'csv') {
      let csvContent = '';
  
      // Helper to group logs by date
      function groupByDate(logs) {
        return logs.reduce((acc, log) => {
          const date = log.date || 'No Date';
          if (!acc[date]) acc[date] = [];
          acc[date].push(log);
          return acc;
        }, {});
      }
  
      // --- Training Logs ---
      const trainingCount = data.trainingHistory.length;
      const trainingByDate = groupByDate(data.trainingHistory);
  
      csvContent += `Training Logs History (Total ${trainingCount} entries)\n\n`;
      Object.keys(trainingByDate).sort((a,b) => b.localeCompare(a)).forEach(date => {
        csvContent += `${date}\n\n`;
        trainingByDate[date].forEach(log => {
          const type = log.type || 'Unknown Type';
          const mins = log.mins !== undefined ? log.mins : '?';
          csvContent += `${type} - ${mins} mins\n`;
        });
        csvContent += '\n';
      });
  
      // --- Ki Logs ---
      const kiCount = data.kiHistory.length;
      const kiByDate = groupByDate(data.kiHistory);
  
      csvContent += `Ki Logs History (Total ${kiCount} entries)\n\n`;
      Object.keys(kiByDate).sort((a,b) => b.localeCompare(a)).forEach(date => {
        csvContent += `${date}\n\n`;
        kiByDate[date].forEach(log => {
          const amount = log.amount !== undefined ? log.amount : (typeof log === 'number' ? log : '?');
          csvContent += `+${amount} Ki\n`;
        });
        csvContent += '\n';
      });
  
      // --- Supplement Logs ---
      const supplementDates = Object.keys(data.supplementData).sort((a,b) => b.localeCompare(a));
      csvContent += `Supplement Logs\n\n`;
      supplementDates.forEach(date => {
        csvContent += `${date}\n\n`;
        data.supplementData[date].forEach(supp => {
          csvContent += `${supp}\n`;
        });
        csvContent += '\n';
      });
  
      blob = new Blob([csvContent], { type: "text/csv" });
      filename = `saiyan_life_tracker_backup_${dateStr}.csv`;
    } else {
      console.error("Unsupported export format:", format);
      return;
    }
  
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
  
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const importedData = JSON.parse(event.target.result);
  
          // Basic validation
          if (
            importedData.trainingData &&
            importedData.supplementData &&
            importedData.trainingHistory &&
            importedData.kiHistory &&
            importedData.supplementHistory
          ) {
            localStorage.setItem('trainingData', JSON.stringify(importedData.trainingData));
            localStorage.setItem('supplementData', JSON.stringify(importedData.supplementData));
            localStorage.setItem('trainingHistory', JSON.stringify(importedData.trainingHistory));
            localStorage.setItem('kiHistory', JSON.stringify(importedData.kiHistory));
            localStorage.setItem('supplementHistory', JSON.stringify(importedData.supplementHistory));
  
            // Update your in-memory variables as well, if you have them
            trainingData = importedData.trainingData;
            supplementData = importedData.supplementData;
            trainingHistory = importedData.trainingHistory;
            kiHistory = importedData.kiHistory;
            supplementHistory = importedData.supplementHistory;
  
            updateUI();
            alert('Import successful!');
          } else {
            alert('Invalid import file: Missing required data.');
          }
        } catch (error) {
          alert('Error parsing JSON file.');
        }
      };
  
      reader.readAsText(file);
    };
  
    input.click();
  }
  
  
  function updateFormDropdown(level) {
    const formDropdown = document.getElementById("form");
    if (!formDropdown) return;

    // Clear old options
    formDropdown.innerHTML = "";

    for (let i = 0; i < level; i++) {
        const option = document.createElement("option");
        option.value = i + 1;
        option.textContent = SAIYAN_FORMS[i] || `Form ${i + 1}`;
        formDropdown.appendChild(option);
    }

    formDropdown.value = level;
}

  
  // --- INITIALIZE UI ON PAGE LOAD ---
  document.addEventListener('DOMContentLoaded', () => {
    updateUI();
  });
  
