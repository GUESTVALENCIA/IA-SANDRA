/**
 * GITHUB EXECUTOR - Git operations y GitHub API
 * Permite a Sandra hacer commits reales y gestionar repositorios
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class GitHubExecutor {
    constructor(config) {
        this.token = config.token || process.env.GITHUB_TOKEN;
        this.apiBase = 'https://api.github.com';
        this.repoOwner = 'claytom';
        this.repoName = 'sandra-professional';
    }

    // ============================================================================
    // COMMIT AUTOMÁTICO
    // ============================================================================
    async commitChanges(params, context) {
        try {
            const { message, files = ['.'] } = params;
            const commitMessage = message || 'Auto-commit by Sandra IA - Executable Actions';

            // Cambiar al directorio del proyecto
            const projectPath = 'C:\\Users\\clayt\\Desktop\\sandra-professional';

            // Ejecutar comandos git
            const commands = [
                `cd "${projectPath}"`,
                'git add .',
                `git commit -m "${commitMessage}"`,
                'git push origin main'
            ];

            const gitCommand = commands.join(' && ');
            const { stdout, stderr } = await execAsync(gitCommand);

            console.log('✅ Commit ejecutado:', stdout);

            // Obtener hash del último commit
            const { stdout: commitHash } = await execAsync(`cd "${projectPath}" && git rev-parse HEAD`);

            return {
                success: true,
                message: 'Cambios commiteados y pusheados exitosamente',
                data: {
                    commitId: commitHash.trim().substring(0, 7),
                    sha: commitHash.trim(),
                    message: commitMessage,
                    url: `https://github.com/${this.repoOwner}/${this.repoName}/commit/${commitHash.trim()}`
                }
            };

        } catch (error) {
            console.error('❌ Error en commit:', error);

            // Intentar commit sin push si falla
            try {
                const localCommit = await this.commitLocal(params);
                return localCommit;
            } catch (localError) {
                return {
                    success: false,
                    error: `Git error: ${error.message}`
                };
            }
        }
    }

    // ============================================================================
    // COMMIT LOCAL (FALLBACK)
    // ============================================================================
    async commitLocal(params) {
        const { message = 'Auto-commit by Sandra IA' } = params;
        const projectPath = 'C:\\Users\\clayt\\Desktop\\sandra-professional';

        const commands = [
            `cd "${projectPath}"`,
            'git add .',
            `git commit -m "${message}"`
        ];

        const { stdout } = await execAsync(commands.join(' && '));
        const { stdout: commitHash } = await execAsync(`cd "${projectPath}" && git rev-parse HEAD`);

        return {
            success: true,
            message: 'Commit local realizado (push manual requerido)',
            data: {
                commitId: commitHash.trim().substring(0, 7),
                sha: commitHash.trim(),
                message: message,
                local: true
            }
        };
    }

    // ============================================================================
    // CREAR PULL REQUEST
    // ============================================================================
    async createPullRequest(params, context) {
        try {
            const {
                title = 'Auto PR by Sandra IA',
                description = 'Pull request generado automáticamente por Sandra IA con cambios ejecutables.',
                sourceBranch = 'feature/sandra-auto',
                targetBranch = 'main'
            } = params;

            // Crear branch primero
            await this.createBranch(sourceBranch);

            // Crear PR via API
            const prData = {
                title: title,
                body: description,
                head: sourceBranch,
                base: targetBranch
            };

            const response = await fetch(`${this.apiBase}/repos/${this.repoOwner}/${this.repoName}/pulls`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(prData)
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const pr = await response.json();

            console.log('✅ Pull Request creado:', pr.html_url);

            return {
                success: true,
                message: 'Pull Request creado exitosamente',
                data: {
                    prNumber: pr.number,
                    url: pr.html_url,
                    title: pr.title,
                    state: pr.state
                }
            };

        } catch (error) {
            console.error('❌ Error creando PR:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================================================
    // CREAR BRANCH
    // ============================================================================
    async createBranch(branchName) {
        const projectPath = 'C:\\Users\\clayt\\Desktop\\sandra-professional';

        try {
            // Crear y cambiar a nueva branch
            const commands = [
                `cd "${projectPath}"`,
                `git checkout -b ${branchName}`,
                `git push -u origin ${branchName}`
            ];

            await execAsync(commands.join(' && '));
            console.log(`✅ Branch creado: ${branchName}`);

        } catch (error) {
            // Si el branch ya existe, simplemente cambiar a él
            try {
                await execAsync(`cd "${projectPath}" && git checkout ${branchName}`);
                console.log(`ℹ️ Cambiado a branch existente: ${branchName}`);
            } catch (checkoutError) {
                throw new Error(`Error con branch ${branchName}: ${error.message}`);
            }
        }
    }

    // ============================================================================
    // OBTENER STATUS DEL REPO
    // ============================================================================
    async getRepoStatus() {
        try {
            const projectPath = 'C:\\Users\\clayt\\Desktop\\sandra-professional';
            const { stdout } = await execAsync(`cd "${projectPath}" && git status --porcelain`);

            const files = stdout.trim().split('\n').filter(line => line.trim());

            return {
                success: true,
                data: {
                    hasChanges: files.length > 0,
                    changedFiles: files.length,
                    files: files.map(line => {
                        const status = line.substring(0, 2).trim();
                        const filename = line.substring(2).trim();
                        return { status, filename };
                    })
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
    // CREAR RELEASE
    // ============================================================================
    async createRelease(params) {
        try {
            const {
                tagName = `v${Date.now()}`,
                name = 'Sandra IA Auto Release',
                description = 'Release automático generado por Sandra IA'
            } = params;

            const releaseData = {
                tag_name: tagName,
                name: name,
                body: description,
                draft: false,
                prerelease: false
            };

            const response = await fetch(`${this.apiBase}/repos/${this.repoOwner}/${this.repoName}/releases`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(releaseData)
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const release = await response.json();

            return {
                success: true,
                message: 'Release creado exitosamente',
                data: {
                    releaseId: release.id,
                    tagName: release.tag_name,
                    url: release.html_url
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
    validateConfig() {
        if (!this.token) {
            throw new Error('GitHub token no configurado');
        }

        return true;
    }
}

module.exports = GitHubExecutor;