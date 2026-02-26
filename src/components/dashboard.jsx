import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './dashboard.css';

const menuItems = [
  'Dashboard',
  'Incidents',
  'Report',
  'Map',
  'Notifications',
];

const severityToClass = {
  Critical: 'critical',
  High: 'high',
  Medium: 'medium',
  Low: 'low',
};

const incidents = [
  {
    id: 'RA-2024-8891',
    label: 'Fire',
    location: 'District 5, Zone B',
    severity: 'Critical',
    reported: '12 min ago',
    position: [37.7799, -122.4484],
    resources: [
      { name: 'General Hospital', type: 'Hospital', distance: '1.2 km' },
      { name: 'Fire Station Alpha', type: 'Fire Station', distance: '2.8 km' },
      { name: 'District Police HQ', type: 'Police', distance: '3.1 km' },
    ],
  },
  {
    id: 'RA-2024-9014',
    label: 'Flood',
    location: 'District 2, Zone A',
    severity: 'High',
    reported: '26 min ago',
    position: [37.769, -122.4312],
    resources: [
      { name: 'Emergency Shelter Bay', type: 'Shelter', distance: '0.9 km' },
      { name: 'Water Rescue Unit', type: 'Rescue', distance: '1.5 km' },
      { name: 'Metro Clinic', type: 'Hospital', distance: '2.4 km' },
    ],
  },
  {
    id: 'RA-2024-9038',
    label: 'Accident',
    location: 'Highway 7, KM 42',
    severity: 'Medium',
    reported: '41 min ago',
    position: [37.7604, -122.4148],
    resources: [
      { name: 'Trauma Center', type: 'Hospital', distance: '2.2 km' },
      { name: 'Highway Patrol Unit', type: 'Police', distance: '1.7 km' },
      { name: 'Tow Service West', type: 'Support', distance: '2.9 km' },
    ],
  },
  {
    id: 'RA-2024-9055',
    label: 'Health',
    location: 'Central Market',
    severity: 'Critical',
    reported: '8 min ago',
    position: [37.7852, -122.423],
    resources: [
      { name: 'Rapid Response Med', type: 'Hospital', distance: '0.7 km' },
      { name: 'Ambulance Unit 3', type: 'Ambulance', distance: '1.1 km' },
      { name: 'City Operations Desk', type: 'Coordination', distance: '2.0 km' },
    ],
  },
  {
    id: 'RA-2024-9102',
    label: 'Fire',
    location: 'Industrial Zone C',
    severity: 'Low',
    reported: '53 min ago',
    position: [37.7542, -122.4416],
    resources: [
      { name: 'Industrial Safety Team', type: 'Fire Station', distance: '1.8 km' },
      { name: 'Logistics Unit 12', type: 'Support', distance: '2.1 km' },
      { name: 'North Medical Point', type: 'Hospital', distance: '2.7 km' },
    ],
  },
  {
    id: 'RA-2024-9119',
    label: 'Flood',
    location: 'Riverside Block',
    severity: 'Medium',
    reported: '1h ago',
    position: [37.7733, -122.4022],
    resources: [
      { name: 'Riverside Shelter', type: 'Shelter', distance: '1.0 km' },
      { name: 'Rescue Boat Team', type: 'Rescue', distance: '2.2 km' },
      { name: 'Southside Clinic', type: 'Hospital', distance: '2.6 km' },
    ],
  },
];

const createMarkerIcon = (severity, isSelected) => {
  const severityClass = severityToClass[severity];
  return L.divIcon({
    className: 'incident-marker-wrapper',
    html: `<span class="incident-marker incident-marker--${severityClass}${
      isSelected ? ' incident-marker--selected' : ''
    }"></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const Dashboard = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRefs = useRef({});
  const [selectedIncidentId, setSelectedIncidentId] = useState(incidents[0].id);
  const selectedIncident =
    incidents.find((incident) => incident.id === selectedIncidentId) ?? incidents[0];

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) {
      return undefined;
    }

    const map = L.map(mapRef.current, {
      center: [37.7749, -122.4194],
      zoom: 13,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false,
    });

    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    incidents.forEach((incident) => {
      const marker = L.marker(incident.position, {
        icon: createMarkerIcon(incident.severity, incident.id === selectedIncidentId),
      })
        .addTo(map)
        .bindPopup(`<strong>${incident.label}</strong><br/>${incident.location}`);

      marker.on('click', () => {
        setSelectedIncidentId(incident.id);
      });

      markerRefs.current[incident.id] = marker;
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRefs.current = {};
    };
  }, []);

  useEffect(() => {
    incidents.forEach((incident) => {
      const marker = markerRefs.current[incident.id];
      if (!marker) {
        return;
      }
      marker.setIcon(
        createMarkerIcon(incident.severity, incident.id === selectedIncidentId),
      );
    });

    const selectedMarker = markerRefs.current[selectedIncidentId];
    if (selectedMarker && mapInstanceRef.current) {
      selectedMarker.openPopup();
      mapInstanceRef.current.panTo(selectedMarker.getLatLng(), {
        animate: true,
        duration: 0.4,
      });
    }
  }, [selectedIncidentId]);

  return (
    <div className="rapid-aid-layout">
      <aside className="rapid-aid-sidebar">
        <div className="rapid-aid-brand">
          <span className="brand-dot" />
          <span>RapidAid</span>
        </div>

        <nav className="rapid-aid-menu">
          {menuItems.map((item) => (
            <button
              key={item}
              className={`menu-item${item === 'Map' ? ' menu-item--active' : ''}`}
              type="button"
            >
              <span className="menu-item__icon" />
              {item}
            </button>
          ))}
        </nav>

        <div className="rapid-aid-sidebar__footer">
          <button className="menu-item" type="button">
            <span className="menu-item__icon" />
            Settings
          </button>
          <button className="menu-item" type="button">
            <span className="menu-item__icon" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="rapid-aid-main">
        <header className="rapid-aid-header">
          <div>
            <h1>Incident Map</h1>
            <p>Geographic overview of active incidents</p>
          </div>
          <div className="map-modes">
            <button className="map-mode map-mode--active" type="button">
              Incidents
            </button>
            <button className="map-mode" type="button">
              Heatmap
            </button>
            <button className="map-mode" type="button">
              Resources
            </button>
          </div>
        </header>

        <section className="rapid-aid-content">
          <div className="map-shell">
            <div ref={mapRef} className="incident-map" role="application" aria-label="Incident map" />

            <div className="map-legend">
              <h3>Legend</h3>
              <ul>
                {Object.keys(severityToClass).map((severity) => (
                  <li key={severity}>
                    <span
                      className={`legend-dot legend-dot--${severityToClass[severity]}`}
                    />
                    {severity}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="incident-panels">
            <article className="panel-card">
              <h2>Selected Incident</h2>
              <span className="incident-id">{selectedIncident.id}</span>
              <dl>
                <div>
                  <dt>Type</dt>
                  <dd>{selectedIncident.label}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{selectedIncident.location}</dd>
                </div>
                <div>
                  <dt>Severity</dt>
                  <dd>
                    <span
                      className={`severity-pill severity-pill--${
                        severityToClass[selectedIncident.severity]
                      }`}
                    >
                      {selectedIncident.severity}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>Reported</dt>
                  <dd>{selectedIncident.reported}</dd>
                </div>
              </dl>
            </article>

            <article className="panel-card">
              <h2>Nearby Resources</h2>
              <ul className="resource-list">
                {selectedIncident.resources.map((resource) => (
                  <li key={resource.name}>
                    <div>
                      <strong>{resource.name}</strong>
                      <span>{resource.type}</span>
                    </div>
                    <small>{resource.distance}</small>
                  </li>
                ))}
              </ul>
            </article>

            <article className="panel-card">
              <h2>Active Incidents ({incidents.length})</h2>
              <ul className="active-incident-list">
                {incidents.map((incident) => (
                  <li key={incident.id}>
                    <button
                      type="button"
                      className={`active-incident-item${
                        incident.id === selectedIncidentId
                          ? ' active-incident-item--selected'
                          : ''
                      }`}
                      onClick={() => setSelectedIncidentId(incident.id)}
                    >
                      <div>
                        <strong>{incident.label}</strong>
                        <span>{incident.location}</span>
                      </div>
                      <i
                        className={`incident-status incident-status--${
                          severityToClass[incident.severity]
                        }`}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

