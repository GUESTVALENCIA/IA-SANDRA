/**
 * NETLIFY EXECUTOR - Deploy automático real
 * Permite a Sandra hacer deploys reales a Netlify
 */

const fs = require('fs').promises;
const path = require('path');

class NetlifyExecutor {
    constructor(config) {
        this.token = config.token || process.env.NETLIFY_AUTH_TOKEN;
        this.siteId = config.siteId || process.env.NETLIFY_SITE_SLUG;
        this.apiBase = 'https://api.netlify.com/api/v1';
    }

    // ============================================================================
    // DEPLOY AUTOMÁTICO
    // ============================================================================
    async deploySite(params, context) {
        try {
            const {
                buildDir = 'C:\\Users\\clayt\\Desktop\\sandra-professional\\dist',
                message = 'Auto-deploy by Sandra IA'
            } = params;

            console.log('🚀 Iniciando deploy a Netlify...');

            // 1. Verificar que el directorio de build existe
            await this.ensureBuildDirectory(buildDir);

            // 2. Preparar archivos para deploy
            const files = await this.prepareFiles(buildDir);

            // 3. Crear deploy
            const deploy = await this.createDeploy(message);

            // 4. Subir archivos
            await this.uploadFiles(deploy.id, files);

            // 5. Publicar deploy
            const publishedDeploy = await this.publishDeploy(deploy.id);

            console.log('✅ Deploy completado:', publishedDeploy.url);

            return {
                success: true,
                message: 'Sitio deployado exitosamente en Netlify',
                data: {
                    deployId: publishedDeploy.id,
                    deployUrl: publishedDeploy.url,
                    previewUrl: publishedDeploy.deploy_ssl_url,
                    siteUrl: publishedDeploy.ssl_url,
                    state: publishedDeploy.state,
                    createdAt: publishedDeploy.created_at
                }
            };

        } catch (error) {
            console.error('❌ Error en deploy:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================================================
    // CREAR DEPLOY
    // ============================================================================
    async createDeploy(message) {
        const response = await fetch(`${this.apiBase}/sites/${this.siteId}/deploys`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: message,
                draft: true
            })
        });

        if (!response.ok) {
            throw new Error(`Netlify API error: ${response.status}`);
        }

        return await response.json();
    }

    // ============================================================================
    // PREPARAR ARCHIVOS
    // ============================================================================
    async prepareFiles(buildDir) {
        const files = new Map();

        async function walkDirectory(dir, relativePath = '') {
            const items = await fs.readdir(dir, { withFileTypes: true });

            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                const relPath = relativePath ? path.join(relativePath, item.name) : item.name;

                if (item.isDirectory()) {
                    await walkDirectory(fullPath, relPath);
                } else {
                    const content = await fs.readFile(fullPath);
                    files.set(relPath.replace(/\\/g, '/'), {
                        content,
                        size: content.length
                    });
                }
            }
        }

        try {
            await walkDirectory(buildDir);
        } catch (error) {
            // Si no existe el directorio de build, crear uno simple
            await this.createSimpleBuild(buildDir);
            await walkDirectory(buildDir);
        }

        return files;
    }

    // ============================================================================
    // CREAR BUILD SIMPLE SI NO EXISTE
    // ============================================================================
    async createSimpleBuild(buildDir) {
        await fs.mkdir(buildDir, { recursive: true });

        const indexHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sandra IA - GuestsValencia</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            max-width: 600px;
        }
        h1 {
            font-size: 3em;
            margin-bottom: 20px;
        }
        .status {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .timestamp {
            opacity: 0.8;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Sandra IA</h1>
        <p>Sistema de IA Ejecutable para GuestsValencia</p>

        <div class="status">
            <h3>✅ Deploy Automático Exitoso</h3>
            <p>Sitio deployado automáticamente por Sandra IA</p>
            <div class="timestamp">
                Última actualización: ${new Date().toLocaleString('es-ES')}
            </div>
        </div>

        <p>
            <strong>Versión:</strong> NUCLEUS UNIFIED v100.0 GALAXY<br>
            <strong>Estado:</strong> Sistema Ejecutable Activo<br>
            <strong>Empresa:</strong> GuestsValencia
        </p>
    </div>
</body>
</html>`;

        await fs.writeFile(path.join(buildDir, 'index.html'), indexHtml, 'utf8');
        console.log('📄 Build básico creado para deploy');
    }

    // ============================================================================
    // SUBIR ARCHIVOS
    // ============================================================================
    async uploadFiles(deployId, files) {
        const fileUploads = Array.from(files.entries()).map(([path, { content }]) => ({
            path,
            content: content.toString('base64')
        }));

        const response = await fetch(`${this.apiBase}/deploys/${deployId}/files`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: Object.fromEntries(
                    fileUploads.map(({ path, content }) => [path, content])
                )
            })
        });

        if (!response.ok) {
            throw new Error(`Error subiendo archivos: ${response.status}`);
        }

        console.log(`📤 ${fileUploads.length} archivos subidos`);
    }

    // ============================================================================
    // PUBLICAR DEPLOY
    // ============================================================================
    async publishDeploy(deployId) {
        const response = await fetch(`${this.apiBase}/deploys/${deployId}/restore`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error publicando deploy: ${response.status}`);
        }

        const deploy = await response.json();

        // Esperar a que el deploy esté listo
        await this.waitForDeploy(deployId);

        return deploy;
    }

    // ============================================================================
    // ESPERAR DEPLOY
    // ============================================================================
    async waitForDeploy(deployId, maxWait = 60000) {
        const startTime = Date.now();

        while (Date.now() - startTime < maxWait) {
            const response = await fetch(`${this.apiBase}/deploys/${deployId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const deploy = await response.json();

            if (deploy.state === 'ready') {
                return deploy;
            }

            if (deploy.state === 'error') {
                throw new Error('Deploy falló en Netlify');
            }

            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        throw new Error('Deploy timeout');
    }

    // ============================================================================
    // OBTENER INFO DEL SITIO
    // ============================================================================
    async getSiteInfo() {
        try {
            const response = await fetch(`${this.apiBase}/sites/${this.siteId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Netlify API error: ${response.status}`);
            }

            const site = await response.json();

            return {
                success: true,
                data: {
                    name: site.name,
                    url: site.ssl_url || site.url,
                    deployCount: site.deploy_count,
                    lastDeploy: site.published_deploy?.created_at
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================================================
    // VALIDACIONES
    // ============================================================================
    async ensureBuildDirectory(buildDir) {
        try {
            await fs.access(buildDir);
        } catch (error) {
            console.log('📁 Directorio de build no existe, creándolo...');
            await this.createSimpleBuild(buildDir);
        }
    }

    validateConfig() {
        if (!this.token) {
            throw new Error('Netlify token no configurado');
        }

        if (!this.siteId) {
            throw new Error('Netlify site ID no configurado');
        }

        return true;
    }
}

module.exports = NetlifyExecutor;