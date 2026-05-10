const fs = require('fs');
const path = require('path');
const PathFinder = require('geojson-path-finder').default;
const turf = require('@turf/turf');

let pathFinder = null;
let networkPoints = null;

// Memuat data jaringan saat startup
function loadNetwork() {
    try {
        const geojsonPath = path.join(__dirname, 'network.geojson');
        if (!fs.existsSync(geojsonPath)) {
            console.error("File network.geojson tidak ditemukan. Harap jalankan script fetch-real-data.js terlebih dahulu.");
            return false;
        }

        const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
        
        // Inisialisasi PathFinder
        // weightFn opsional bisa diatur misal berdasarkan jarak (default)
        pathFinder = new PathFinder(geojson, { precision: 1e-5 });

        // Mengumpulkan semua vertex (titik) dari LineString untuk fitur snap-to-road
        const pointsArray = [];
        turf.featureEach(geojson, (feature) => {
            if (feature.geometry && feature.geometry.type === 'LineString') {
                const coords = feature.geometry.coordinates;
                coords.forEach(coord => {
                    pointsArray.push(turf.point(coord));
                });
            }
        });

        // Buat koleksi titik untuk mencari titik terdekat (snap)
        networkPoints = turf.featureCollection(pointsArray);
        console.log("Jaringan jalan dan graf A* berhasil dimuat.");
        return true;
    } catch (error) {
        console.error("Gagal memuat jaringan jalan:", error);
        return false;
    }
}

// Mencari titik terdekat di jaringan jalan
function snapToRoad(lng, lat) {
    if (!networkPoints) return null;
    const targetPoint = turf.point([lng, lat]);
    const nearest = turf.nearestPoint(targetPoint, networkPoints);
    return nearest.geometry.coordinates;
}

// Fungsi utama untuk menemukan rute
function findRoute(startLng, startLat, endLng, endLat) {
    if (!pathFinder) {
        throw new Error("Sistem pencarian jalur belum siap.");
    }

    // Pastikan titik berada di jaringan
    const snappedStart = snapToRoad(startLng, startLat);
    const snappedEnd = snapToRoad(endLng, endLat);

    if (!snappedStart || !snappedEnd) {
        throw new Error("Tidak dapat menemukan jalan terdekat dari titik yang diberikan.");
    }

    // geojson-path-finder mencari rute
    // pathFinder.findPath mengembalikan { path, weight }
    // di mana path adalah array dari koordinat [lng, lat]
    const routePointStart = turf.point(snappedStart);
    const routePointEnd = turf.point(snappedEnd);
    
    const result = pathFinder.findPath(routePointStart, routePointEnd);

    if (result && result.path) {
        const lineString = turf.lineString(result.path);
        const distanceKm = turf.length(lineString, { units: 'kilometers' });
        
        // Asumsi kecepatan rata-rata kendaraan 40 km/jam
        const speedKmh = 40;
        const timeHours = distanceKm / speedKmh;
        const timeMinutes = Math.ceil(timeHours * 60);
        
        // Memformat jarak agar rapi
        const formattedDistance = distanceKm < 1 
            ? `${(distanceKm * 1000).toFixed(0)} meter` 
            : `${distanceKm.toFixed(2)} km`;

        return {
            type: "Feature",
            properties: {
                weight: result.weight,
                snappedStart,
                snappedEnd,
                explanation: {
                    distance: formattedDistance,
                    estimatedTime: `${timeMinutes} menit`,
                    reasoning: "Algoritma A* secara otomatis mengevaluasi seluruh persimpangan jalan dan menemukan bahwa jalur ini adalah rute terpendek secara matematis berdasarkan kalkulasi bobot jarak terakumulasi."
                }
            },
            geometry: {
                type: "LineString",
                coordinates: result.path
            }
        };
    } else {
        throw new Error("Jalur tidak ditemukan antara dua titik tersebut.");
    }
}

module.exports = {
    loadNetwork,
    findRoute,
    snapToRoad
};
