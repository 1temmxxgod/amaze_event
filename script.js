// Global variables
let participants = [];
let selectedParticipants = [];
let savedStatics = [];

// Custom notification system
function showNotification(message, type = 'info', duration = 3000) {
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    notification.innerHTML = `
        <div style="font-size: 1.3em; font-weight: 600; margin-bottom: 15px;">
            ${type === 'error' ? '' : type === 'success' ? '' : type === 'warning' ? '' : 'ℹ'}
        </div>
        <div>${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Copy to clipboard function
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showCopyNotification();
        }).catch(() => {
            fallbackCopyTextToClipboard(text);
        });
    } else {
        fallbackCopyTextToClipboard(text);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopyNotification();
    } catch (err) {
        showNotification('Не удалось скопировать текст', 'error');
    }
    
    document.body.removeChild(textArea);
}

function showCopyNotification() {
    const notification = document.getElementById('copyNotification');
    if (notification) {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }
}

// Participant registration
function registerParticipants() {
    const input = document.getElementById('participants').value.trim();
    if (!input) {
        showNotification('Пожалуйста, введите участников!', 'warning');
        return;
    }
    
    participants = input.split(',').map(p => p.trim()).filter(p => p);
    if (participants.length === 0) {
        showNotification('Пожалуйста, введите корректных участников!', 'error');
        return;
    }
    
    showNotification(`Зарегистрировано ${participants.length} участников`, 'success');
    showMainMenu();
    // Также сохраняем участников как статики
    savedStatics = [...participants];
    console.log('Участники автоматически сохранены как статики:', savedStatics);
    showNotification(` Участники зарегистрированы и сохранены как статики: ${savedStatics.join(", ")}`, "success");
}

// Navigation functions
function showMainMenu() {
    hideAllSteps();
    document.getElementById('mainMenu').classList.add('active');
    displayParticipants();
}

function showRandomNumbers() {
    hideAllSteps();
    document.getElementById('randomNumbers').classList.add('active');
    document.getElementById('numbersCount').max = participants.length;
    document.getElementById('randomResult').style.display = 'none';
}

function showPrizeDistribution() {
    hideAllSteps();
    document.getElementById('prizeDistribution').classList.add('active');
    document.getElementById('commandResult').style.display = 'none';
    
    // Автоматически заполняем статики, если есть сохраненные статики
    if (savedStatics.length > 0) {
        const staticsInput = document.getElementById('statics');
        staticsInput.value = savedStatics.join(',');
        showNotification('Статики автоматически заполнены из сохраненных данных', 'info');
    }
}

function showLeaderPayments() {
    hideAllSteps();
    document.getElementById('leaderPayments').classList.add('active');
    document.getElementById('leaderResult').style.display = 'none';
}

function hideAllSteps() {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
}

function displayParticipants() {
    const container = document.getElementById('participantsDisplay');
    container.innerHTML = participants.map(p => 
        `<span class="participant-tag">${p}</span>`
    ).join('');
}

// Random numbers generation
function generateRandomNumbers() {
    const count = parseInt(document.getElementById('numbersCount').value);
    const maxCount = participants.length;
    
    if (!count || count < 1 || count > maxCount) {
        showNotification(`Введите количество от 1 до ${maxCount}!`, 'warning');
        return;
    }
    
    // Generate unique random numbers
    const numbers = [];
    const used = new Set();
    
    while (numbers.length < count) {
        const num = Math.floor(Math.random() * maxCount) + 1;
        if (!used.has(num)) {
            used.add(num);
            numbers.push(num);
        }
    }
    
    numbers.sort((a, b) => a - b);
    
    // Сохраняем выбранных участников для использования в командах
    selectedParticipants = numbers.map(n => participants[n-1]);
    
    // Сохраняем статики в отдельный массив для постоянного хранения
    savedStatics = [...selectedParticipants];
    console.log('Статики сохранены из генерации:', savedStatics);
    
    // Display results
    document.getElementById('randomNumbersDisplay').textContent = numbers.join(',');
    
    // Show mapping with white text
    const mapping = document.getElementById('randomMapping');
    mapping.innerHTML = '<h4 style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">Соответствие (номер  участник):</h4>' +
        numbers.map(n => `<div style="margin: 5px 0; padding: 5px; background: rgba(255, 255, 255, 0.1); border-radius: 5px; color: white;">${n}  ${participants[n-1]}</div>`).join('');
    
    // Добавляем информацию о сохранении для команд
    mapping.innerHTML += '<div style="margin-top: 15px; padding: 10px; background: rgba(255, 107, 107, 0.2); border-radius: 8px; color: white; text-align: center;"><strong> Статики сохранены для команд: ' + savedStatics.join(', ') + '</strong></div>';
    
    document.getElementById('randomResult').style.display = 'block';
    
    // Add copy functionality
    document.getElementById('randomNumbersDisplay').onclick = () => {
        copyToClipboard(numbers.join(','));
    };
    
    showNotification(`Сгенерировано ${count} случайных чисел. Статики сохранены: ${savedStatics.join(', ')}`, 'success');
}

// Command generation
function generateCommand() {
    const rewardType = document.getElementById('rewardType').value;
    const amount = document.getElementById('rewardAmount').value;
    const statics = document.getElementById('statics').value.trim();
    
    if (!amount || amount < 1) {
        showNotification('Пожалуйста, введите корректное количество награды!', 'warning');
        return;
    }
    
    if (!statics) {
        showNotification('Пожалуйста, введите статики!', 'warning');
        return;
    }
    
    const staticsList = statics.split(',').map(s => s.trim()).filter(s => s);
    if (staticsList.length === 0) {
        showNotification('Пожалуйста, введите корректные статики!', 'error');
        return;
    }
    
    // Сохраняем введенные статики для будущего использования
    savedStatics = [...staticsList];
    console.log('Статики сохранены:', savedStatics);
    
    const staticsStr = staticsList.join(',');
    const staticsWithBrackets = `[${staticsStr}]`;
    
    let command = '';
    const rewardTypes = {
        '1': '!smatsa',
        '2': '!scasha', 
        '3': '!coinsa'
    };
    
    command = `${rewardTypes[rewardType]} ${staticsWithBrackets} ${amount}`;
    
    // Display result
    document.getElementById('commandDisplay').textContent = command;
    document.getElementById('commandResult').style.display = 'block';
    
    // Add copy functionality
    document.getElementById('commandDisplay').onclick = () => {
        copyToClipboard(command);
    };
    
    showNotification(`Команда сгенерирована! Статики сохранены: ${savedStatics.join(', ')}`, 'success');
}

// Leader payments generation
function generateLeaderCommands() {
    const leaderStatic = document.getElementById('leaderStatic').value.trim();
    const leaderCoins = document.getElementById('leaderCoins').value;
    const leaderMats = document.getElementById('leaderMats').value;
    const leaderMoney = document.getElementById('leaderMoney').value;
    
    if (!leaderStatic) {
        showNotification('Пожалуйста, введите статик лидера!', 'warning');
        return;
    }
    
    if (!leaderCoins && !leaderMats && !leaderMoney) {
        showNotification('Пожалуйста, введите хотя бы одно количество награды!', 'warning');
        return;
    }
    
    const commands = [];
    
    // Генерируем команды только для заполненных полей
    if (leaderCoins && leaderCoins > 0) {
        commands.push(`!coinsa [${leaderStatic}] ${leaderCoins}`);
    }
    
    if (leaderMats && leaderMats > 0) {
        commands.push(`!smats [${leaderStatic}] ${leaderMats}`);
    }
    
    if (leaderMoney && leaderMoney > 0) {
        commands.push(`!scash [${leaderStatic}] ${leaderMoney}`);
    }
    
    if (commands.length === 0) {
        showNotification('Пожалуйста, введите корректные количества наград!', 'error');
        return;
    }
    
    // Display results
    const commandsDisplay = document.getElementById('leaderCommandsDisplay');
    commandsDisplay.innerHTML = commands.map((command, index) => 
        `<div class="leader-command" onclick="copyToClipboard('${command}')" style="margin: 15px 0;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>${command}</span>
                <span style="font-size: 0.8em; opacity: 0.7; margin-left: 10px;">Нажмите для копирования</span>
            </div>
        </div>`
    ).join('');
    
    document.getElementById('leaderResult').style.display = 'block';
    
    showNotification(`Сгенерировано ${commands.length} команд для выплат лидеру`, 'success');
}

// Reset app
function resetApp() {
    showNotification('Сброс участников...', 'info', 1000);
    setTimeout(() => {
        participants = [];
        selectedParticipants = [];
        savedStatics = [];
        document.getElementById('participants').value = '';
        hideAllSteps();
        document.getElementById('step1').classList.add('active');
    }, 1000);
}

// Функция для сохранения текущих статиков
function saveCurrentStatics() {
    const statics = document.getElementById("participants").value.trim();
    
    if (!statics) {
        showNotification("Пожалуйста, введите участников (статики) для сохранения!", "warning");
        return;
    }
    
    const staticsList = statics.split(",").map(s => s.trim()).filter(s => s);
    if (staticsList.length === 0) {
        showNotification("Пожалуйста, введите корректных участников (статики)!", "error");
        return;
    }
    
    savedStatics = [...staticsList];
    console.log("Статики сохранены из участников:", savedStatics);
    
    showNotification(` Статики сохранены: ${savedStatics.join(", ")}`, "success");
}

// Функция для заполнения статиков из сохраненных данных
function fillStaticsFromSelected() {
    console.log('savedStatics:', savedStatics);
    
    if (savedStatics.length === 0) {
        showNotification('Нет сохраненных статиков! Сначала сгенерируйте числа или введите статики вручную и сгенерируйте команду.', 'warning');
        return;
    }
    
    const staticsInput = document.getElementById('statics');
    staticsInput.value = savedStatics.join(',');
    showNotification(`Заполнено ${savedStatics.length} статиков из сохраненных данных`, 'success');
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Add click effects for result text
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('result-text') || e.target.classList.contains('leader-command')) {
            e.target.style.background = 'rgba(255, 107, 107, 0.3)';
            setTimeout(() => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            }, 200);
        }
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close any open notifications
            const notifications = document.querySelectorAll('.custom-notification');
            notifications.forEach(notification => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            });
        }
    });
});
