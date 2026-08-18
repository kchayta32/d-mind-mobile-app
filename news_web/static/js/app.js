/* ==========================================================================
   DisasterWatch TH & World - Client Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // App State
  let disastersData = [];
  let map = null;
  let markersGroup = null;
  let autoRefreshTimer = null;

  // Filter States
  let currentRegion = 'all';
  let currentCategory = 'all';
  let currentSeverity = 'all';
  let searchQuery = '';

  // Icon Mapping per Category
  const CATEGORY_ICONS = {
    earthquake: 'fa-house-crack',
    flood: 'fa-water',
    storm: 'fa-tornado',
    wildfire: 'fa-fire',
    volcano: 'fa-volcano',
    landslide: 'fa-hill-rockslide',
    tsunami: 'fa-water',
    general: 'fa-triangle-exclamation'
  };

  const CATEGORY_NAMES_TH = {
    earthquake: 'แผ่นดินไหว',
    flood: 'อุทกภัย/น้ำท่วม',
    storm: 'พายุ/วาตภัย',
    wildfire: 'ไฟป่า',
    volcano: 'ภูเขาไฟระเบิด',
    landslide: 'ดินถล่ม',
    tsunami: 'สึนามิ',
    general: 'ภัยพิบัติทั่วไป'
  };

  // DOM Element References
  const newsFeedList = document.getElementById('newsFeedList');
  const feedCount = document.getElementById('feedCount');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const autoRefreshSelect = document.getElementById('autoRefreshSelect');

  const statTotal = document.getElementById('statTotal');
  const statThai = document.getElementById('statThai');
  const statCritical = document.getElementById('statCritical');
  const statUpdated = document.getElementById('statUpdated');

  const btnFocusThai = document.getElementById('btnFocusThai');
  const btnFocusWorld = document.getElementById('btnFocusWorld');

  // Modal Elements
  const detailModal = document.getElementById('detailModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalCategoryBadge = document.getElementById('modalCategoryBadge');
  const modalSeverityBadge = document.getElementById('modalSeverityBadge');
  const modalRegionBadge = document.getElementById('modalRegionBadge');
  const modalLocation = document.getElementById('modalLocation');
  const modalTime = document.getElementById('modalTime');
  const modalCoords = document.getElementById('modalCoords');
  const modalSource = document.getElementById('modalSource');
  const modalDescription = document.getElementById('modalDescription');
  const modalSourceLink = document.getElementById('modalSourceLink');
  const modalLocateMapBtn = document.getElementById('modalLocateMapBtn');

  let activeModalItem = null;

  // Initialize Map
  function initMap() {
    // Default view centered around SE Asia / Thailand
    map = L.map('disasterMap', {
      center: [13.7563, 100.5018],
      zoom: 5,
      zoomControl: true
    });

    // Dark Matter tile layer from CartoDB
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    markersGroup = L.layerGroup().addTo(map);
  }

  // Fetch Disasters Data from FastAPI Backend
  async function fetchDisasters(forceRefresh = false) {
    try {
      refreshBtn.querySelector('i').classList.add('fa-spin');
      
      const queryParams = new URLSearchParams({
        region: currentRegion,
        category: currentCategory,
        severity: currentSeverity,
        force_refresh: forceRefresh
      });
      if (searchQuery) queryParams.append('search', searchQuery);

      const response = await fetch(`/api/disasters?${queryParams.toString()}`);
      const json = await response.json();

      if (json.status === 'success') {
        disastersData = json.data;
        renderMapMarkers(disastersData);
        renderNewsFeed(disastersData);
        updateStats();

        const now = new Date();
        statUpdated.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      }
    } catch (err) {
      console.error('Error fetching disasters:', err);
      newsFeedList.innerHTML = `
        <div class="loading-state">
          <i class="fa-solid fa-triangle-exclamation" style="color: var(--sev-critical)"></i>
          <p>เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์</p>
        </div>
      `;
    } finally {
      refreshBtn.querySelector('i').classList.remove('fa-spin');
    }
  }

  // Create Custom Marker HTML
  function createCustomIcon(category, severity) {
    const iconClass = CATEGORY_ICONS[category] || 'fa-triangle-exclamation';
    const sevClass = `marker-${severity || 'low'}`;
    const pulseClass = severity === 'critical' ? 'pulse' : '';

    const html = `
      <div class="custom-disaster-marker ${sevClass} ${pulseClass}" style="width: 32px; height: 32px;">
        <i class="fa-solid ${iconClass}"></i>
      </div>
    `;

    return L.divIcon({
      html: html,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  }

  // Render Map Markers
  function renderMapMarkers(items) {
    markersGroup.clearLayers();

    items.forEach(item => {
      if (item.latitude != null && item.longitude != null) {
        const icon = createCustomIcon(item.category, item.severity);
        const marker = L.marker([item.latitude, item.longitude], { icon: icon });

        // Popup Content
        const popupHtml = `
          <div style="font-family: 'Prompt', sans-serif; color: #111; max-width: 250px;">
            <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px;">${item.title}</div>
            <div style="font-size: 0.8rem; color: #444; margin-bottom: 6px;">
              <i class="fa-solid fa-location-dot"></i> ${item.location_name}
            </div>
            <div style="display: flex; gap: 4px; margin-bottom: 8px;">
              <span class="badge badge-${item.severity}">${getSeverityText(item.severity)}</span>
              <span class="badge">${CATEGORY_NAMES_TH[item.category] || item.category}</span>
            </div>
            <button onclick="window.openDisasterDetail('${item.id}')" style="width:100%; background:#2563eb; color:white; border:none; padding:5px 8px; border-radius:4px; font-size:0.8rem; cursor:pointer;">
              ดูรายละเอียดข่าวเต็ม
            </button>
          </div>
        `;

        marker.bindPopup(popupHtml);
        markersGroup.addLayer(marker);
      }
    });
  }

  // Render Sidebar News Feed Cards
  function renderNewsFeed(items) {
    feedCount.textContent = `${items.length} ข่าว`;

    if (items.length === 0) {
      newsFeedList.innerHTML = `
        <div class="loading-state">
          <i class="fa-solid fa-inbox"></i>
          <p>ไม่พบข่าวภัยพิบัติที่ตรงกับเงื่อนไขตัวกรอง</p>
        </div>
      `;
      return;
    }

    newsFeedList.innerHTML = items.map(item => {
      const timeStr = formatRelativeTime(item.pub_date);
      const isThai = item.region === 'thailand';
      const regBadgeClass = isThai ? 'badge-region-th' : 'badge-region-intl';
      const regText = isThai ? '🇹🇭 ไทย' : '🌐 ต่างประเทศ';

      return `
        <div class="news-card" data-id="${item.id}" onclick="openDisasterDetail('${item.id}')">
          <div class="card-top">
            <div class="card-badges">
              <span class="badge badge-${item.severity}">${getSeverityText(item.severity)}</span>
              <span class="badge ${regBadgeClass}">${regText}</span>
            </div>
            <span class="card-time">${timeStr}</span>
          </div>

          <div class="card-title">${escapeHtml(item.title)}</div>

          <div class="card-location">
            <i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.location_name)}
          </div>

          <div class="card-actions">
            <span class="card-source">${escapeHtml(item.source_name)}</span>
            <button class="btn-card-map" onclick="event.stopPropagation(); focusMapLocation(${item.latitude}, ${item.longitude}, '${item.id}')">
              <i class="fa-solid fa-crosshairs"></i> แสดงบนแผนที่
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Update Stats Bar
  async function updateStats() {
    try {
      const res = await fetch('/api/stats');
      const json = await res.json();
      if (json.status === 'success') {
        statTotal.textContent = json.total_events;
        statThai.textContent = json.thailand_events;
        const criticalCount = (json.severities.critical || 0) + (json.severities.high || 0);
        statCritical.textContent = criticalCount;
      }
    } catch (e) {
      console.warn('Failed to update stats:', e);
    }
  }

  // Open Detail Modal
  window.openDisasterDetail = function(id) {
    const item = disastersData.find(d => d.id === id);
    if (!item) return;

    activeModalItem = item;

    modalTitle.textContent = item.title;
    modalCategoryBadge.textContent = CATEGORY_NAMES_TH[item.category] || item.category;
    modalSeverityBadge.textContent = getSeverityText(item.severity);
    modalSeverityBadge.className = `badge badge-${item.severity}`;
    modalRegionBadge.textContent = item.region === 'thailand' ? '🇹🇭 ประเทศไทย' : '🌐 ต่างประเทศ';

    modalLocation.textContent = item.location_name;
    modalTime.textContent = new Date(item.pub_date).toLocaleString('th-TH');
    modalCoords.textContent = item.latitude != null ? `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}` : 'ไม่ระบุ';
    modalSource.textContent = item.source_name;
    modalDescription.textContent = item.description || 'ไม่มีรายละเอียดเพิ่มเติม';

    modalSourceLink.href = item.source_url || '#';

    detailModal.classList.remove('hidden');
  };

  // Focus Map Location
  window.focusMapLocation = function(lat, lng, id) {
    if (lat != null && lng != null) {
      map.setView([lat, lng], 9, { animate: true });
      // Open marker popup if matches
      markersGroup.eachLayer(layer => {
        const latLng = layer.getLatLng();
        if (Math.abs(latLng.lat - lat) < 0.0001 && Math.abs(latLng.lng - lng) < 0.0001) {
          layer.openPopup();
        }
      });
    }
  };

  // Helper Utils
  function getSeverityText(sev) {
    switch (sev) {
      case 'critical': return 'วิกฤต';
      case 'high': return 'สูง';
      case 'medium': return 'ปานกลาง';
      case 'low': return 'เฝ้าระวัง';
      default: return 'ปกติ';
    }
  }

  function formatRelativeTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'เมื่อสักครู่';
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    return `${diffDays} วันที่แล้ว`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[m]);
  }

  // Event Listeners - Filters
  document.getElementById('regionTabs').addEventListener('click', (e) => {
    if (e.target.classList.contains('tab-btn')) {
      document.querySelectorAll('#regionTabs .tab-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      currentRegion = e.target.dataset.region;
      fetchDisasters();
    }
  });

  document.getElementById('categoryPills').addEventListener('click', (e) => {
    const pill = e.target.closest('.pill-btn');
    if (pill) {
      document.querySelectorAll('#categoryPills .pill-btn').forEach(btn => btn.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.dataset.cat;
      fetchDisasters();
    }
  });

  document.getElementById('severitySelector').addEventListener('click', (e) => {
    if (e.target.classList.contains('sev-btn')) {
      document.querySelectorAll('#severitySelector .sev-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      currentSeverity = e.target.dataset.sev;
      fetchDisasters();
    }
  });

  // Search Input Listener with Debounce
  let searchTimeout = null;
  searchInput.addEventListener('input', () => {
    const val = searchInput.value.trim();
    clearSearchBtn.classList.toggle('hidden', val.length === 0);

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = val;
      fetchDisasters();
    }, 400);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    fetchDisasters();
  });

  refreshBtn.addEventListener('click', () => fetchDisasters(true));

  // Auto Refresh Listener
  autoRefreshSelect.addEventListener('change', () => {
    clearInterval(autoRefreshTimer);
    const intervalSec = parseInt(autoRefreshSelect.value, 10);
    if (intervalSec > 0) {
      autoRefreshTimer = setInterval(() => fetchDisasters(true), intervalSec * 1000);
    }
  });

  // Map Views
  btnFocusThai.addEventListener('click', () => {
    map.setView([13.0, 101.5], 6, { animate: true });
  });

  btnFocusWorld.addEventListener('click', () => {
    map.setView([20.0, 10.0], 2, { animate: true });
  });

  // Modal Listeners
  modalCloseBtn.addEventListener('click', () => detailModal.classList.add('hidden'));
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) detailModal.classList.add('hidden');
  });

  modalLocateMapBtn.addEventListener('click', () => {
    if (activeModalItem) {
      detailModal.classList.add('hidden');
      focusMapLocation(activeModalItem.latitude, activeModalItem.longitude, activeModalItem.id);
    }
  });

  // Initialize
  initMap();
  fetchDisasters(true);

  // Set default 5 min auto refresh
  autoRefreshTimer = setInterval(() => fetchDisasters(true), 300000);
});
