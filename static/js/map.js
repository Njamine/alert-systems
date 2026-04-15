function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function ensureLeafletCss() {
    const existing = document.querySelector('link[data-leaflet="true"]');
    if (existing) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.setAttribute("data-leaflet", "true");
    document.head.appendChild(link);
}

async function ensureLeaflet() {
    if (window.L) return;
    ensureLeafletCss();
    await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");
}

async function initDashboard() {
    const map = L.map("map").setView([0.3, 34.85], 12);

    const streetLayer = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; Carto',
            subdomains: "abcd",
            maxZoom: 19,
        }
    ).addTo(map);

    const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
            attribution: "Tiles &copy; Esri",
        }
    );

    L.control.layers({ "Street map": streetLayer, Satellite: satelliteLayer }).addTo(map);

    function getColor(severity) {
        switch ((severity || "").toLowerCase()) {
            case "low":
                return "#ffff00";
            case "moderate":
                return "#ff9900";
            case "high":
                return "#ff0000";
            default:
                return "#888888";
        }
    }

    function style(feature) {
        return {
            fillColor: getColor(feature.properties.severity),
            weight: 2,
            opacity: 1,
            color: "white",
            fillOpacity: 0.6,
        };
    }

    const alertsLayer = L.geoJSON(null, {
        style,
        onEachFeature: (feature, layer) => {
            const p = feature.properties;
            const popup = `
                <strong>Alert ID:</strong> ${p.alert_id}<br>
                <strong>Date:</strong> ${p.date_detected || "N/A"}<br>
                <strong>Area:</strong> ${Number(p.area_ha || 0).toFixed(2)} ha<br>
                <strong>Severity:</strong> ${p.severity || "N/A"}<br>
                <strong>Likely cause:</strong> ${p.likely_cause || "N/A"}<br>
                <strong>Confidence:</strong> ${(Number(p.confidence_score || 0) * 100).toFixed(0)}%<br>
                <strong>Pre-NDVI:</strong> ${
                    p.pre_ndvi !== null && p.pre_ndvi !== undefined
                        ? Number(p.pre_ndvi).toFixed(2)
                        : "N/A"
                }<br>
                <strong>Method:</strong> ${p.detection_method || "N/A"}
            `;
            layer.bindPopup(popup);
        },
    }).addTo(map);

    function selectedValues(id) {
        const select = document.getElementById(id);
        return Array.from(select.selectedOptions).map((opt) => opt.value).join(",");
    }

    function buildQuery() {
        const startDate = document.getElementById("start-date").value;
        const endDate = document.getElementById("end-date").value;
        const severity = selectedValues("severity-filter");
        const cause = selectedValues("cause-filter");

        const params = new URLSearchParams();
        if (startDate) params.set("start_date", startDate);
        if (endDate) params.set("end_date", endDate);
        if (severity) params.set("severity", severity);
        if (cause) params.set("cause", cause);
        return params.toString();
    }

    async function fetchAlerts() {
        try {
            const query = buildQuery();
            const response = await fetch(`/api/alerts?${query}`);
            const data = await response.json();
            alertsLayer.clearLayers();
            alertsLayer.addData(data);
            updateTable(data.features || []);

            if ((data.features || []).length > 0) {
                map.fitBounds(alertsLayer.getBounds(), { padding: [20, 20] });
            }
            document.getElementById("update-time").innerText = new Date().toLocaleString();
        } catch (error) {
            console.error("Failed to fetch alerts:", error);
        }
    }

    function updateTable(features) {
        const tbody = document.querySelector("#alert-table tbody");
        tbody.innerHTML = "";

        features.forEach((feature) => {
            const row = tbody.insertRow();
            row.insertCell(0).innerText = feature.properties.alert_id;
            row.insertCell(1).innerText = feature.properties.date_detected || "";
            row.insertCell(2).innerText = Number(feature.properties.area_ha || 0).toFixed(2);
            row.insertCell(3).innerText = feature.properties.severity || "";
            row.insertCell(4).innerText = feature.properties.likely_cause || "";
            row.insertCell(5).innerText = `${(Number(feature.properties.confidence_score || 0) * 100).toFixed(0)}%`;

            row.addEventListener("click", () => {
                const bounds = L.geoJSON(feature).getBounds();
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { maxZoom: 16 });
                }
            });
        });
    }

    async function fetchSummary() {
        try {
            const query = buildQuery();
            const response = await fetch(`/api/summary?${query}`);
            const data = await response.json();
            document.getElementById("total-alerts").innerText = data.total_alerts ?? 0;
            document.getElementById("total-area").innerText = Number(
                data.total_area_ha ?? 0
            ).toFixed(2);
            document.getElementById("avg-confidence").innerText = (
                Number(data.avg_confidence ?? 0) * 100
            ).toFixed(0);
        } catch (error) {
            console.error("Failed to fetch summary:", error);
        }
    }

    function setDefaultDates() {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        document.getElementById("start-date").value = start.toISOString().slice(0, 10);
        document.getElementById("end-date").value = end.toISOString().slice(0, 10);
    }

    document.getElementById("apply-filters").addEventListener("click", async () => {
        await fetchAlerts();
        await fetchSummary();
    });

    document.getElementById("toggle-table").addEventListener("click", () => {
        document.getElementById("alert-table-container").classList.toggle("hidden");
    });

    setDefaultDates();
    fetchAlerts();
    fetchSummary();
}

ensureLeaflet()
    .then(initDashboard)
    .catch((error) => {
        console.error("Leaflet failed to load:", error);
        alert("Leaflet library is missing and could not be downloaded.");
    });
