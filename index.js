// Competition data
const boxesData = [
    {
      box: 1,
      building: "River",
      health: "2",
      ip: "10.150.1.1",
      os: "Windows",
      port: "139",
      service: "AD/DNS",
      state: "UP",
    },
    {
      box: 5,
      building: "Plains",
      health: "10.0",
      ip: "10.150.1.5",
      os: "Ubuntu",
      port: "80",
      service: "Apache",
      state: "UP",
    },
    {
      box: 10,
      building: "Desert",
      health: "0",
      ip: "10.150.1.10",
      os: "Ubuntu",
      port: "9200,5044,5601",
      service: "ELK",
      state: "UP",
    },
    {
      box: 8,
      building: "Taiga",
      health: "10.0",
      ip: "10.150.1.8",
      os: "Ubuntu",
      port: "21",
      service: "FTP",
      state: "UP",
    },
    {
      box: 2,
      building: "Swamp",
      health: "10.0",
      ip: "10.150.1.2",
      os: "Windows",
      port: "80",
      service: "IIS",
      state: "UP",
    },
    {
      box: 7,
      building: "Savanna",
      health: "8.5",
      ip: "10.150.1.7",
      os: "Ubuntu",
      port: "143,993",
      service: "Mail",
      state: "UP",
    },
    {
      box: 6,
      building: "Forest",
      health: "6.5",
      ip: "10.150.1.6",
      os: "Ubuntu",
      port: "3306",
      service: "MySQL",
      state: "DOWN",
    },
    {
      box: 3,
      building: "Beach",
      health: "6.5",
      ip: "10.150.1.3",
      os: "Ubuntu",
      port: "80",
      service: "Nginx",
      state: "DOWN",
    },
    {
      box: 9,
      building: "Jungle",
      health: "6.5",
      ip: "10.150.1.9",
      os: "Ubuntu",
      port: "139",
      service: "Samba",
      state: "DOWN",
    },
    {
      box: 4,
      building: "Ocean",
      health: "10.0",
      ip: "10.150.1.4",
      os: "Windows",
      port: "5985",
      service: "WinRM",
      state: "UP",
    },
  ];
  
// API endpoints
const API_BASE_URL = "http://10.10.1.1:5000";
const SCAN_ENDPOINT = `${API_BASE_URL}/scan`;
const SCORES_ENDPOINT = `${API_BASE_URL}/scores`;

// Variable to track scanning status
let isScanning = false;
let scanTimer = null;

// Function to create Minecraft-style hearts with more granular health representation
function createHealthBar(healthValue) {
  const healthContainer = document.createElement('div');
  healthContainer.className = 'health';
  
  // Maximum health is 10.0, with each heart representing 1 health point
  const maxHearts = 10;
  const healthNum = parseFloat(healthValue);
  const isCritical = healthNum <= 2.0 && healthNum > 0;
  
  for (let i = 0; i < maxHearts; i++) {
    const heart = document.createElement('div');
    heart.className = 'heart';
    
    // Add critical class to each heart if health is 2.0 or less
    if (isCritical) {
      heart.classList.add('critical');
    }
    
    // Each heart represents 1 health point
    const remainingHealth = healthNum - i;
    
    if (remainingHealth >= 1) {
      // Full heart (1.0+ points)
      heart.style.backgroundImage = "url('assets/images/full_heart.png')";
    } else if (remainingHealth >= 0.75) {
      // Three-quarter heart (0.75 - 0.99 points)
      heart.style.backgroundImage = "url('assets/images/three_quarter_heart.png')";
    } else if (remainingHealth >= 0.5) {
      // Half heart (0.5 - 0.74 points)
      heart.style.backgroundImage = "url('assets/images/half_heart.png')";
    } else if (remainingHealth >= 0.25) {
      // Quarter heart (0.25 - 0.49 points)
      heart.style.backgroundImage = "url('assets/images/quarter_heart.png')";
    } else {
      // Empty heart (0 - 0.24 points)
      heart.style.backgroundImage = "url('assets/images/empty_heart.png')";
    }
    
    healthContainer.appendChild(heart);
  }
  
  return healthContainer;
}

// Function to create a box element
 // Function to create a box element
 function createBoxElement(boxData) {
    const boxElement = document.createElement('div');
    boxElement.className = 'box';
    
    // Check if box is dead (health is 0 or lower)
    const isDead = parseFloat(boxData.health) <= 0;
    
    if (isDead) {
        // Add dead styling to the box
        boxElement.classList.add('box-dead');
        
        // Set state to DEAD regardless of original state
        boxData.state = "DEAD";
    } else {
        // Add state-based styling to the box (only if not dead)
        boxElement.classList.add(`box-${boxData.state.toLowerCase()}`);
    }
    
    // Set background image based on building/biome name
    const biomeName = boxData.building.toLowerCase();
    boxElement.style.backgroundImage = `url('assets/images/${biomeName}.png')`;
    
    // Add state indicator in the upper right corner
    const stateIndicator = document.createElement('div');
    stateIndicator.className = `state-indicator state-${boxData.state.toLowerCase()}`;
    stateIndicator.textContent = boxData.state;
    boxElement.appendChild(stateIndicator);
    
    // Create the bottom left info container
    const bottomInfo = document.createElement('div');
    bottomInfo.className = 'box-info-bottom';
    
    // Add building name as header
    const title = document.createElement('h3');
    title.textContent = boxData.building;
    bottomInfo.appendChild(title);

    // Add service and IP info in the requested format
    const serviceIP = document.createElement('div');
    serviceIP.className = 'service-ip';

    const servIp = document.createElement('p');
    servIp.textContent = `${boxData.service} - ${boxData.ip}`;
    serviceIP.appendChild(servIp);

    bottomInfo.appendChild(serviceIP);
    
    // Add health bar
    const healthBar = createHealthBar(boxData.health);
    bottomInfo.appendChild(healthBar);
    
    boxElement.appendChild(bottomInfo);
    
    return boxElement;
}

// Function to update box data in the DOM
function updateBoxElement(boxData) {
  const boxElement = document.getElementById(`box-${boxData.box}`);
  if (!boxElement) return;
  
  // Remove all state classes
  boxElement.classList.remove('box-up', 'box-down', 'box-dead');
  
  // Check if box is dead (health is 0 or lower)
  const isDead = parseFloat(boxData.health) <= 0;
  
  if (isDead) {
    // Add dead styling to the box
    boxElement.classList.add('box-dead');
    
    // Set state to DEAD regardless of original state
    boxData.state = "DEAD";
  } else {
    // Add state-based styling to the box (only if not dead)
    boxElement.classList.add(`box-${boxData.state.toLowerCase()}`);
  }
  
  // Update state indicator
  const stateIndicator = boxElement.querySelector('.state-indicator');
  stateIndicator.className = `state-indicator state-${boxData.state.toLowerCase()}`;
  stateIndicator.textContent = boxData.state;
  
  // Update health bar
  const bottomInfo = boxElement.querySelector('.box-info-bottom');
  const oldHealthBar = bottomInfo.querySelector('.health');
  const newHealthBar = createHealthBar(boxData.health);
  bottomInfo.replaceChild(newHealthBar, oldHealthBar);
  
  // Update service and IP info
  const serviceIP = bottomInfo.querySelector('.service-ip');
  serviceIP.textContent = `${boxData.service} - ${boxData.ip}`;
}

// Function to fetch scores data and update the UI
async function fetchScoresAndUpdateUI() {
  try {
    const response = await fetch(SCORES_ENDPOINT);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    const data = await response.json();
    
    if (data.boxes && Array.isArray(data.boxes)) {
      data.boxes.forEach(box => {
        // Find matching box in UI
        const existingBox = document.getElementById(`box-${box.box}`);
        if (existingBox) {
          // Update existing box
          updateBoxElement(box);
        }
      });
      
      // Update our data storage
      if (Array.isArray(data.boxes)) {
        // Replace our data with the new data
        boxesData.length = 0;
        data.boxes.forEach(box => boxesData.push(box));
      }
    }
    
    updateStatusMessage("Scores updated successfully");
  } catch (error) {
    updateStatusMessage(`Error fetching scores: ${error.message}`, true);
    console.error("Error fetching scores:", error);
  }
}

// Function to perform a scan
async function performScan() {
  try {
    updateStatusMessage("Scanning...");
    
    const response = await fetch(SCAN_ENDPOINT);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    const data = await response.json();
    
    if (data.error) {
      // Competition hasn't started
      updateStatusMessage(`Scan result: ${data.error}`, false);
      return false;
    }
    
    if (data.message && data.message === "Scan Complete!") {
      updateStatusMessage("Scan completed successfully");
      // Fetch new scores since the scan was successful
      await fetchScoresAndUpdateUI();
      return true;
    }
    
    return false;
  } catch (error) {
    updateStatusMessage(`Error during scan: ${error.message}`, true);
    console.error("Error during scan:", error);
    return false;
  }
}

// Function to update status message
function updateStatusMessage(message, isError = false) {
  const statusElement = document.getElementById("statusMessage");
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = isError ? "status-error" : "status-success";
    
    // Make the status fade after 3 seconds
    setTimeout(() => {
      statusElement.style.opacity = "0";
      setTimeout(() => {
        statusElement.style.opacity = "1";
        statusElement.textContent = isScanning ? "Auto-scanning active" : "Scan manually or activate auto-scan";
        statusElement.className = isScanning ? "status-active" : "";
      }, 500);
    }, 3000);
  }
}

// Function to toggle automatic scanning
function toggleAutoScan() {
  const autoScanButton = document.getElementById("autoScanButton");
  
  if (isScanning) {
    // Stop automatic scanning
    if (scanTimer) {
      clearInterval(scanTimer);
      scanTimer = null;
    }
    isScanning = false;
    autoScanButton.textContent = "Start Auto-Scan";
    autoScanButton.classList.remove("active");
    updateStatusMessage("Auto-scan stopped");
  } else {
    // Start automatic scanning
    isScanning = true;
    autoScanButton.textContent = "Stop Auto-Scan";
    autoScanButton.classList.add("active");
    updateStatusMessage("Auto-scan started");
    
    // Perform an immediate scan
    performScan();
    
    // Set up one-minute interval for scanning
    scanTimer = setInterval(async () => {
      if (isScanning) {
        await performScan();
      }
    }, 60000); // 60000 ms = 1 minute
  }
}

// Function to create controls UI
function createControls() {
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'controls-container';
  
  // Create manual scan button
  const scanButton = document.createElement('button');
  scanButton.id = "scanButton";
  scanButton.className = "control-button";
  scanButton.textContent = "Scan Now";
  scanButton.addEventListener('click', performScan);
  
  // Create automatic scan toggle button
  const autoScanButton = document.createElement('button');
  autoScanButton.id = "autoScanButton";
  autoScanButton.className = "control-button";
  autoScanButton.textContent = "Start Auto-Scan";
  autoScanButton.addEventListener('click', toggleAutoScan);
  
  // Create status message element
  const statusMessage = document.createElement('div');
  statusMessage.id = "statusMessage";
  statusMessage.className = "status-message";
  statusMessage.textContent = "Ready to scan";
  
  // Add buttons to container
  controlsContainer.appendChild(scanButton);
  controlsContainer.appendChild(autoScanButton);
  controlsContainer.appendChild(statusMessage);
  
  return controlsContainer;
}

// Render all boxes
function renderBoxes() {
  const boxesContainer = document.getElementById('boxesContainer');
  
  // Sort boxes by box number
  boxesData.sort((a, b) => a.box - b.box);
  
  boxesData.forEach(boxData => {
    const boxElement = createBoxElement(boxData);
    boxesContainer.appendChild(boxElement);
  });
  
  // Add controls to the page
  const main = document.querySelector('main');
  const controls = createControls();
  main.insertBefore(controls, boxesContainer);
  
  // Adjust layout based on screen size and number of boxes
  adjustLayout();
  
  // Add window resize event listener to adjust layout when browser size changes
  window.addEventListener('resize', adjustLayout);
  
  // Fetch initial scores
  fetchScoresAndUpdateUI();
}

// Function to dynamically adjust layout based on screen size
function adjustLayout() {
  const container = document.getElementById('boxesContainer');
  const boxCount = boxesData.length;
  const windowWidth = window.innerWidth;
  
  // Calculate optimal columns based on screen size and number of boxes
  let columns = 3; // Default for large screens
  
  if (windowWidth < 1200) {
    columns = 2;
  }
  
  if (windowWidth < 768) {
    columns = 1;
  }
  
  // Set the grid template columns
  container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
}

// Initialize the scoreboard when the page loads
document.addEventListener('DOMContentLoaded', renderBoxes);