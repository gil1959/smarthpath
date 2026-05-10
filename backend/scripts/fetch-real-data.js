const axios = require('axios');
const osmtogeojson = require('osmtogeojson');
const fs = require('fs');
const path = require('path');

// Koordinat bounding box untuk area Bengkulu (sekitar UNIB)
const bbox = "-3.80,102.24,-3.73,102.30";

// Overpass QL query untuk mengambil jalan raya (highway)
// (._;>;); memastikan kita juga mengambil node yang menjadi bagian dari way (jalan)
const overpassQuery = `[out:json];way["highway"](${bbox});(._;>;);out;`;

async function fetchRealData() {
    console.log("Mengambil data jalan nyata dari OpenStreetMap (Overpass API)...");
    try {
        const response = await axios.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(overpassQuery)}`, {
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'SmartPathApp/1.0'
            }
        });

        console.log("Data OSM berhasil diambil. Mengonversi ke GeoJSON...");
        const geojson = osmtogeojson(response.data);
        
        // Membersihkan data GeoJSON agar hanya menyertakan jalan (LineString) 
        // dan menghindari poligon atau titik yang tidak relevan.
        const cleanFeatures = geojson.features.filter(feature => {
            return feature.geometry.type === 'LineString' && feature.properties.highway;
        });

        const cleanGeojson = {
            type: "FeatureCollection",
            features: cleanFeatures
        };

        const outputPath = path.join(__dirname, '..', 'network.geojson');
        fs.writeFileSync(outputPath, JSON.stringify(cleanGeojson, null, 2));
        
        console.log(`Berhasil menyimpan data jaringan jalan nyata ke ${outputPath}`);
    } catch (error) {
        console.error("Terjadi kesalahan saat mengambil atau memproses data:", error.message);
    }
}

fetchRealData();
