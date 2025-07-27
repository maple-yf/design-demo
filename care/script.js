// script.js

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 设置默认用户名
    document.querySelector('.username').textContent = '用户名';
    
    // 初始化数据
    initializeData();
    
    // 绑定事件
    bindEvents();
});

// 初始化数据
function initializeData() {
    // 检查本地存储中是否有数据
    let records = localStorage.getItem('medicalRecords');
    if (!records) {
        // 如果没有数据，创建示例数据
        records = [
            {
                id: 1,
                hospital: "北京协和医院",
                department: "心血管内科",
                doctor: "张医生",
                date: "2025-07-20",
                time: "09:30",
                diagnosis: "高血压",
                status: "completed"
            },
            {
                id: 2,
                hospital: "北京大学第一医院",
                department: "神经内科",
                doctor: "李医生",
                date: "2025-07-28",
                time: "14:00",
                diagnosis: "",
                status: "pending"
            }
        ];
        localStorage.setItem('medicalRecords', JSON.stringify(records));
    } else {
        records = JSON.parse(records);
    }
    
    // 更新统计数据
    updateStatistics(records);
    
    // 渲染记录列表
    renderRecords(records);
}

// 更新统计数据
function updateStatistics(records) {
    // 获取最近就诊记录
    const completedRecords = records.filter(record => record.status === 'completed');
    let lastVisit = null;
    if (completedRecords.length > 0) {
        // 按日期排序，获取最近的
        completedRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
        lastVisit = completedRecords[0];
    }
    
    // 获取即将就诊记录 (状态为pending且日期在今天或之后)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingRecords = records.filter(record => {
        return record.status === 'pending' && new Date(record.date) >= today;
    });
    
    let nextVisit = null;
    if (upcomingRecords.length > 0) {
        // 按日期排序，获取最近的
        upcomingRecords.sort((a, b) => new Date(a.date) - new Date(b.date));
        nextVisit = upcomingRecords[0];
    }
    
    // 更新DOM - 移除了近一年就诊次数的统计显示
    // 更新最近就诊记录
    if (lastVisit) {
        document.querySelector('.recent-hospital').textContent = lastVisit.hospital;
        document.querySelector('.recent-department').textContent = lastVisit.department;
        document.querySelector('.recent-date').textContent = lastVisit.date;
    } else {
        document.querySelector('.recent-hospital').textContent = '暂无记录';
        document.querySelector('.recent-department').textContent = '';
        document.querySelector('.recent-date').textContent = '';
    }
    
    // 更新即将就诊记录
    if (nextVisit) {
        const upcomingCards = document.querySelectorAll('.stat-card.upcoming');
        const upcomingCard = upcomingCards[upcomingCards.length - 1]; // Get the last one (the upcoming visit card)
        upcomingCard.querySelector('.recent-hospital').textContent = nextVisit.hospital;
        upcomingCard.querySelector('.recent-department').textContent = nextVisit.department;
        upcomingCard.querySelector('.recent-date').textContent = nextVisit.date;
    } else {
        const upcomingCards = document.querySelectorAll('.stat-card.upcoming');
        const upcomingCard = upcomingCards[upcomingCards.length - 1]; // Get the last one (the upcoming visit card)
        upcomingCard.querySelector('.recent-hospital').textContent = '暂无记录';
        upcomingCard.querySelector('.recent-department').textContent = '';
        upcomingCard.querySelector('.recent-date').textContent = '';
    }
    
}

// 渲染记录列表
function renderRecords(records, filter = 'all') {
    const recordsList = document.querySelector('.records-list');
    recordsList.innerHTML = '';
    
    // 根据筛选条件过滤记录
    let filteredRecords = records;
    if (filter !== 'all') {
        filteredRecords = records.filter(record => record.status === filter);
    }
    
    // 如果没有记录，显示提示信息
    if (filteredRecords.length === 0) {
        recordsList.innerHTML = '<div class="no-records">暂无相关记录</div>';
        return;
    }
    
    // 渲染每条记录
    filteredRecords.forEach(record => {
        const recordElement = document.createElement('div');
        recordElement.className = 'record-item';
        recordElement.dataset.status = record.status;
        
        recordElement.innerHTML = `
            <div class="record-header">
                <div class="hospital">${record.hospital}</div>
                <div class="status ${record.status}">${record.status === 'pending' ? '预约中' : '已就诊'}</div>
            </div>
            <div class="record-details">
                <div class="detail-row">
                    <span class="label">科室:</span>
                    <span class="value">${record.department}</span>
                </div>
                <div class="detail-row">
                    <span class="label">医生:</span>
                    <span class="value">${record.doctor}</span>
                </div>
                <div class="detail-row">
                    <span class="label">时间:</span>
                    <span class="value">${record.date} ${record.time}</span>
                </div>
                <div class="detail-row">
                    <span class="label">诊断:</span>
                    <span class="value">${record.diagnosis || '-'}</span>
                </div>
            </div>
        `;
        
        recordsList.appendChild(recordElement);
    });
}

// 绑定事件
function bindEvents() {
    // 新增记录按钮
    const addRecordBtn = document.querySelector('.add-record-btn');
    addRecordBtn.addEventListener('click', function() {
        document.getElementById('addRecordModal').style.display = 'block';
        // 清空表单
        document.getElementById('recordForm').reset();
    });
    
    // 关闭模态框
    const closeBtn = document.querySelector('.close');
    closeBtn.addEventListener('click', function() {
        document.getElementById('addRecordModal').style.display = 'none';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('addRecordModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // 状态筛选按钮
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 更新激活状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 获取筛选条件
            const status = this.dataset.status;
            
            // 重新渲染记录列表
            const records = JSON.parse(localStorage.getItem('medicalRecords') || '[]');
            renderRecords(records, status);
        });
    });
    
    // 表单提交
    const recordForm = document.getElementById('recordForm');
    recordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 获取表单数据
        const formData = new FormData(this);
        const record = {
            id: Date.now(), // 简单的ID生成方式
            hospital: formData.get('hospital'),
            department: formData.get('department'),
            doctor: formData.get('doctor'),
            date: formData.get('date'),
            time: formData.get('time'),
            diagnosis: formData.get('diagnosis'),
            status: formData.get('status')
        };
        
        // 保存到本地存储
        const records = JSON.parse(localStorage.getItem('medicalRecords') || '[]');
        records.push(record);
        localStorage.setItem('medicalRecords', JSON.stringify(records));
        
        // 更新UI
        updateStatistics(records);
        renderRecords(records);
        
        // 关闭模态框
        document.getElementById('addRecordModal').style.display = 'none';
        
        // 显示成功提示
        alert('记录添加成功！');
    });
    
    // 设置按钮
    const settingsBtn = document.querySelector('.settings-btn');
    settingsBtn.addEventListener('click', function() {
        alert('设置功能待开发');
    });
}