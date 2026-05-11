const express = require('express');
const cors = require('cors');
const { loadNetwork, findRoute } = require('./routeFinder');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Inisialisasi rute saat server mulai
const isNetworkLoaded = loadNetwork();

app.post('/api/cari-rute', (req, res) => {
    if (!isNetworkLoaded) {
        return res.status(503).json({ error: "Sistem belum siap. Jaringan jalan gagal dimuat." });
    }

    const { start, end } = req.body;

    if (!start || !end || !start.lng || !start.lat || !end.lng || !end.lat) {
        return res.status(400).json({ error: "Koordinat titik awal dan tujuan (lng, lat) harus diberikan." });
    }

    try {
        const routeGeoJSON = findRoute(start.lng, start.lat, end.lng, end.lat);
        res.json(routeGeoJSON);
    } catch (error) {
        console.error("Gagal mencari rute:", error);
        res.status(404).json({ error: error.message });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Backend server berjalan di http://localhost:${PORT}`);
    });
}

// Ekspor untuk Vercel Serverless
module.exports = app;
