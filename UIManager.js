class UIManager {
  constructor() {
    this.sidebarOpen = false;
    this.activeTab = 'customers'; // 'customers' or 'drivers'
    this.initializeLeftSidebar();
    this.initializeRightSidebar();
  }

  initializeLeftSidebar() {
    // Create sidebar container
    const sidebar = document.createElement('div');
    sidebar.id = 'customer-sidebar';
    sidebar.className = 'sidebar sidebar-left';
    
    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'sidebar-toggle';
    toggleBtn.className = 'sidebar-toggle';
    toggleBtn.textContent = '☰';
    toggleBtn.addEventListener('click', () => this.toggleSidebar());
    
    // Create sidebar header with tabs
    const header = document.createElement('div');
    header.className = 'sidebar-header';
    header.innerHTML = `
      <div class="sidebar-tabs">
        <button class="tab-btn active" data-tab="customers">Customers</button>
        <button class="tab-btn" data-tab="drivers">Drivers</button>
      </div>
    `;
    
    // Add click handlers to tabs
    header.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });
    
    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.id = 'sidebar-content';
    contentContainer.className = 'sidebar-content';
    
    // Create customer list container
    const customerList = document.createElement('div');
    customerList.id = 'customer-list';
    customerList.className = 'item-list customer-list';
    customerList.setAttribute('data-tab', 'customers');
    
    // Create driver list container
    const driverList = document.createElement('div');
    driverList.id = 'driver-list';
    driverList.className = 'item-list driver-list';
    driverList.setAttribute('data-tab', 'drivers');
    driverList.style.display = 'none';
    
    contentContainer.appendChild(customerList);
    contentContainer.appendChild(driverList);
    
    sidebar.appendChild(header);
    sidebar.appendChild(contentContainer);
    document.body.appendChild(sidebar);
    document.body.appendChild(toggleBtn);
  }

  initializeRightSidebar() {
    // Create right sidebar
    const rightSidebar = document.createElement('div');
    rightSidebar.id = 'info-sidebar';
    rightSidebar.className = 'sidebar sidebar-right';
    
    // Create header with clock and calendar
    const header = document.createElement('div');
    header.className = 'sidebar-header right-header';
    header.innerHTML = `
      <div class="datetime-display">
        <div class="digital-clock" id="digital-clock">00:00:00</div>
        <div class="calendar-display" id="calendar-display">Jan 01, 2026</div>
      </div>
    `;
    
    // Create event log container
    const eventLogContainer = document.createElement('div');
    eventLogContainer.id = 'event-log';
    eventLogContainer.className = 'event-log-container';
    eventLogContainer.innerHTML = '<h3 class="event-log-title">Event Log</h3><div class="event-list" id="event-list"></div>';
    
    rightSidebar.appendChild(header);
    rightSidebar.appendChild(eventLogContainer);
    document.body.appendChild(rightSidebar);
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    
    // Update active button
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.classList.remove('active');
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
      }
    });
    
    // Update visible content
    document.querySelectorAll('.item-list').forEach((list) => {
      if (list.getAttribute('data-tab') === tabName) {
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
      } else {
        list.style.display = 'none';
      }
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    const sidebar = document.getElementById('customer-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    
    if (this.sidebarOpen) {
      sidebar.classList.add('open');
      toggleBtn.classList.add('open');
    } else {
      sidebar.classList.remove('open');
      toggleBtn.classList.remove('open');
    }
  }

  updateCustomerList(pendingCustomers, matchedCustomers, simulation) {
    const listContainer = document.getElementById('customer-list');
    listContainer.innerHTML = '';

    // Display pending (unmatched) customers
    if (pendingCustomers.length > 0) {
      const pendingSection = document.createElement('div');
      pendingSection.className = 'list-section';
      pendingSection.innerHTML = '<h3 class="section-title">Unmatched</h3>';
      
      pendingCustomers.forEach((customer) => {
        const card = this.createCustomerCard(customer, null);
        pendingSection.appendChild(card);
      });
      
      listContainer.appendChild(pendingSection);
    }

    // Display matched customers
    if (matchedCustomers.length > 0) {
      const matchedSection = document.createElement('div');
      matchedSection.className = 'list-section';
      matchedSection.innerHTML = '<h3 class="section-title">Matched</h3>';
      
      matchedCustomers.forEach((customer) => {
        // Find the driver assigned to this customer
        let assignedDriver = null;
        simulation.availableDrivers.traverse((driver) => {
          if (driver.currentRide && driver.currentRide.id === customer.id) {
            assignedDriver = driver;
          }
        });
        
        const card = this.createCustomerCard(customer, assignedDriver);
        matchedSection.appendChild(card);
      });
      
      listContainer.appendChild(matchedSection);
    }

    // Show empty state if no customers
    if (pendingCustomers.length === 0 && matchedCustomers.length === 0) {
      listContainer.innerHTML = '<div class="empty-state">No active customers</div>';
    }
  }

  updateDriverList(allDrivers) {
    const listContainer = document.getElementById('driver-list');
    listContainer.innerHTML = '';

    // Group drivers by status
    const availableDrivers = [];
    const busyDrivers = [];

    allDrivers.forEach((driver) => {
      if (driver.status === 'AVAILABLE') {
        availableDrivers.push(driver);
      } else if (driver.status === 'EN_ROUTE') {
        busyDrivers.push(driver);
      }
    });

    // Display available drivers
    if (availableDrivers.length > 0) {
      const availSection = document.createElement('div');
      availSection.className = 'list-section';
      availSection.innerHTML = '<h3 class="section-title">Available</h3>';
      
      availableDrivers.forEach((driver) => {
        const card = this.createDriverCard(driver);
        availSection.appendChild(card);
      });
      
      listContainer.appendChild(availSection);
    }

    // Display busy drivers
    if (busyDrivers.length > 0) {
      const busySection = document.createElement('div');
      busySection.className = 'list-section';
      busySection.innerHTML = '<h3 class="section-title">En Route</h3>';
      
      busyDrivers.forEach((driver) => {
        const card = this.createDriverCard(driver);
        busySection.appendChild(card);
      });
      
      listContainer.appendChild(busySection);
    }

    // Show empty state
    if (allDrivers.length === 0) {
      listContainer.innerHTML = '<div class="empty-state">No drivers available</div>';
    }
  }

  createCustomerCard(customer, driver) {
    const card = document.createElement('div');
    card.className = `item-card customer-card ${customer.status.toLowerCase()}`;
    
    const timeRemaining = Math.max(0, Math.ceil((customer.expireTime - millis()) / 1000));
    const driverInfo = driver 
      ? `<div class="driver-info"><strong>Driver:</strong> ${driver.id}</div>`
      : '<div class="driver-info no-driver">No driver assigned</div>';
    
    card.innerHTML = `
      <div class="card-header">
        <span class="card-id">${customer.id}</span>
        <span class="card-status">${customer.status}</span>
      </div>
      <div class="card-details">
        <div class="detail-row">
          <strong>Passengers:</strong> ${customer.passengers}
        </div>
        <div class="detail-row">
          <strong>Location:</strong> (${Math.round(customer.location.x)}, ${Math.round(customer.location.y)})
        </div>
        <div class="detail-row">
          <strong>Destination:</strong> (${Math.round(customer.destination.x)}, ${Math.round(customer.destination.y)})
        </div>
        <div class="detail-row">
          <strong>Time Left:</strong> ${timeRemaining}s
        </div>
        ${driverInfo}
      </div>
    `;
    
    return card;
  }

  createDriverCard(driver) {
    const card = document.createElement('div');
    card.className = `item-card driver-card ${driver.status.toLowerCase()}`;
    
    const customerInfo = driver.currentRide
      ? `<div class="customer-info"><strong>Customer:</strong> ${driver.currentRide.id}</div>`
      : '<div class="customer-info no-customer">No current ride</div>';
    
    card.innerHTML = `
      <div class="card-header">
        <span class="card-id">${driver.id}</span>
        <span class="card-status">${driver.status}</span>
      </div>
      <div class="card-details">
        <div class="detail-row">
          <strong>Capacity:</strong> ${driver.capacity} passengers
        </div>
        <div class="detail-row">
          <strong>Speed:</strong> ${driver.speed} units/frame
        </div>
        <div class="detail-row">
          <strong>Location:</strong> (${Math.round(driver.location.x)}, ${Math.round(driver.location.y)})
        </div>
        <div class="detail-row">
          <strong>Amenities:</strong> ${driver.amenities.length > 0 ? driver.amenities.join(', ') : 'None'}
        </div>
        ${customerInfo}
      </div>
    `;
    
    return card;
  }

  updateTimeDisplay(timeManager) {
    const clockElement = document.getElementById('digital-clock');
    const calendarElement = document.getElementById('calendar-display');
    
    if (clockElement) {
      clockElement.textContent = timeManager.getTimeString();
    }
    if (calendarElement) {
      calendarElement.textContent = timeManager.getDateString();
    }
  }

  updateEventLog(eventList) {
    const eventListElement = document.getElementById('event-list');
    if (!eventListElement) return;
    
    eventListElement.innerHTML = '';
    
    // Traverse event log in reverse to show newest first
    const events = [];
    eventList.traverse((event) => {
      events.push(event);
    });
    
    // Display newest events first
    for (let i = events.length - 1; i >= 0; i--) {
      const event = events[i];
      const eventElement = document.createElement('div');
      eventElement.className = 'event-item';
      eventElement.innerHTML = `
        <div class="event-time">${event.timestamp}</div>
        <div class="event-message">${event.message}</div>
      `;
      eventListElement.appendChild(eventElement);
    }
  }
}
