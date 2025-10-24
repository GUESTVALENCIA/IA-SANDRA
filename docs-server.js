const express = require('express');
const path = require('path');
const app = express();
const port = 3001;

console.log('🧠 SANDRA IA - DOCUMENTATION SERVER');
console.log('📚 Serving Sandra IA Documentation & Agent Catalog');
console.log(`🌐 Port: ${port}`);

// Serve static files from docs directory
app.use(express.static('docs'));

// Handle filter routes - redirect to index.html
const filterRoutes = ['agents', 'commands', 'settings', 'hooks', 'mcps', 'templates'];
filterRoutes.forEach(filter => {
    app.get(`/${filter}`, (req, res) => {
        res.sendFile(path.join(__dirname, 'docs', 'index.html'));
    });
});

// Handle component routes
app.get('/component/:type/:name', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'component.html'));
});

// Handle blog routes
app.get('/blog/*', (req, res) => {
    const blogPath = req.path.replace('/blog', '');
    res.sendFile(path.join(__dirname, 'docs', 'blog', blogPath, 'index.html'), (err) => {
        if (err) {
            res.status(404).send('Blog post not found');
        }
    });
});

// API endpoint for Sandra IA agents
app.get('/api/sandra/agents', (req, res) => {
    res.json({
        "sandra_ia": {
            "version": "NUCLEUS_UNIFIED_v100.0_GALAXY",
            "total_agents": 248,
            "categories": {
                "ai_processing": 76,
                "business_logic": 48,
                "voice_processing": 32,
                "computer_vision": 24,
                "development_devops": 68
            },
            "core_agents": [
                {
                    "name": "sandra-nucleus-core",
                    "category": "ai_processing",
                    "description": "Núcleo central unificado de Sandra IA",
                    "status": "active",
                    "version": "v100.0"
                },
                {
                    "name": "sandra-computer-vision",
                    "category": "computer_vision",
                    "description": "Sistema de Computer Vision en tiempo real",
                    "status": "active",
                    "models": ["COCO-SSD", "BlazeFace", "Tesseract", "MobileNet"]
                },
                {
                    "name": "sandra-neon-database",
                    "category": "business_logic",
                    "description": "Integración PostgreSQL con Neon",
                    "status": "active",
                    "tables": 4
                },
                {
                    "name": "mcp-subagents-expert",
                    "category": "ai_processing",
                    "description": "Orquestador de 248 subagentes especializados",
                    "status": "orchestrating",
                    "subagents": 248
                }
            ]
        }
    });
});

// Health check for docs server
app.get('/api/docs/health', (req, res) => {
    res.json({
        status: 'operational',
        service: 'Sandra IA Documentation Server',
        version: 'v1.0.0',
        port: port,
        endpoints: [
            '/api/sandra/agents',
            '/api/docs/health',
            '/agents',
            '/commands',
            '/component/:type/:name'
        ]
    });
});

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

app.listen(port, () => {
    console.log(`📚 Sandra IA Documentation Server running at http://localhost:${port}`);
    console.log(`🔍 API Agents: http://localhost:${port}/api/sandra/agents`);
    console.log(`💚 Health Check: http://localhost:${port}/api/docs/health`);
});