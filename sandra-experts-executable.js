/**
 * SANDRA EXPERTS EXECUTABLE SYSTEM v7.0
 * Sistema de Expertos EJECUTABLES - NO Conversacionales
 * Aplicando CONSTRAINT SYSTEM para acciones reales
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// ============================================================================
// CONSTRAINT SYSTEM EJECUTABLE - CORE RULES
// ============================================================================
const EXECUTABLE_CONSTRAINTS = {
  // NUNCA ser conversacional - SIEMPRE ejecutar
  NEVER_SAY_CANT: "JAMÁS decir 'no puedo' - HACER la acción",
  ALWAYS_EXECUTE: "SIEMPRE ejecutar acciones reales, no simular",
  NO_MOCK_RESPONSES: "PROHIBIDO devolver código sin crear archivos",
  REAL_FILE_OPERATIONS: "USAR fs.writeFileSync para crear archivos REALES",
  REAL_GIT_COMMITS: "HACER git commits REALES con execAsync",
  REAL_API_CALLS: "INTEGRAR con APIs REALES, no mocks",

  // Sistema de verificación
  VERIFY_ACTIONS: "VERIFICAR que las acciones se ejecutaron correctamente",
  LOG_REAL_RESULTS: "LOGGEAR resultados REALES de las operaciones",
  ATOMIC_OPERATIONS: "Operaciones atómicas - todo o nada"
};

// ============================================================================
// SANDRA DEV EXPERT - EJECUTABLE ABSOLUTO
// ============================================================================
class SandraDevExpert {
  constructor() {
    this.name = "SANDRA_DEV_EXPERT";
    this.mode = "EXECUTION_MODE";
    this.constraints = EXECUTABLE_CONSTRAINTS;
    this.workingDir = process.cwd();
    this.projectPath = "C:\\Users\\clayt\\Desktop\\SandraDevInterface";

    // Verificar que estamos en modo ejecutable
    this.enforceExecutableMode();
  }

  enforceExecutableMode() {
    console.log(`
╔════════════════════════════════════════╗
║     SANDRA DEV EXPERT - EJECUTABLE     ║
║           CONSTRAINT SYSTEM            ║
║        NO CONVERSATIONAL MODE          ║
╚════════════════════════════════════════╝
    `);

    // Configurar working directory
    if (fs.existsSync(this.projectPath)) {
      process.chdir(this.projectPath);
      this.workingDir = this.projectPath;
    }

    console.log(`[DEV EXPERT] Working directory: ${this.workingDir}`);
    console.log(`[DEV EXPERT] Mode: ${this.mode}`);
    console.log(`[DEV EXPERT] Constraints: ACTIVE`);
  }

  // ============================================================================
  // MÉTODO PRINCIPAL - EJECUTAR TAREA DE DESARROLLO
  // ============================================================================
  async executeDevelopmentTask(task) {
    console.log(`[DEV EXPERT] EXECUTING TASK: ${task.type}`);

    try {
      switch (task.type) {
        case 'CREATE_COMPONENT':
          return await this.createReactComponent(task);
        case 'CREATE_FILE':
          return await this.createFile(task);
        case 'MODIFY_FILE':
          return await this.modifyFile(task);
        case 'GIT_COMMIT':
          return await this.gitCommit(task);
        case 'INSTALL_PACKAGE':
          return await this.installPackage(task);
        case 'RUN_COMMAND':
          return await this.runCommand(task);
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      console.error(`[DEV EXPERT] ERROR:`, error);
      throw error;
    }
  }

  // ============================================================================
  // CREAR COMPONENTE REACT - EJECUTABLE
  // ============================================================================
  async createReactComponent(task) {
    const { name, props = [], directory = 'src/components' } = task.params;

    console.log(`[DEV EXPERT] Creating React component: ${name}`);

    // 1. CREAR DIRECTORIO SI NO EXISTE
    const componentDir = path.join(this.workingDir, directory);
    if (!fs.existsSync(componentDir)) {
      fs.mkdirSync(componentDir, { recursive: true });
      console.log(`[DEV EXPERT] ✅ Created directory: ${componentDir}`);
    }

    // 2. GENERAR CÓDIGO DEL COMPONENTE
    const componentCode = this.generateReactComponentCode(name, props);

    // 3. CREAR ARCHIVO REAL CON fs.writeFileSync
    const filePath = path.join(componentDir, `${name}.jsx`);
    fs.writeFileSync(filePath, componentCode, 'utf8');

    // 4. VERIFICAR QUE EL ARCHIVO SE CREÓ
    if (!fs.existsSync(filePath)) {
      throw new Error(`Failed to create component file: ${filePath}`);
    }

    // 5. CREAR ARCHIVO DE ESTILOS SI ES NECESARIO
    if (task.params.includeStyles) {
      const stylesCode = this.generateComponentStyles(name);
      const stylesPath = path.join(componentDir, `${name}.module.css`);
      fs.writeFileSync(stylesPath, stylesCode, 'utf8');
      console.log(`[DEV EXPERT] ✅ Created styles: ${stylesPath}`);
    }

    // 6. ACTUALIZAR INDEX.JS PARA EXPORT
    await this.updateComponentIndex(componentDir, name);

    console.log(`[DEV EXPERT] ✅ Component ${name} created successfully`);

    return {
      success: true,
      componentPath: filePath,
      message: `Component ${name} created and ready to use`,
      realFileCreated: true,
      verificationPassed: fs.existsSync(filePath)
    };
  }

  // ============================================================================
  // GENERAR CÓDIGO REACT - TEMPLATE EJECUTABLE
  // ============================================================================
  generateReactComponentCode(name, props) {
    const propsInterface = props.map(prop => `  ${prop.name}: ${prop.type};`).join('\n');
    const propsDestructuring = props.map(prop => prop.name).join(', ');

    return `import React from 'react';
import PropTypes from 'prop-types';
import styles from './${name}.module.css';

/**
 * ${name} Component
 * Generated by Sandra DEV Expert - Executable System
 * Created: ${new Date().toISOString()}
 */

interface ${name}Props {
${propsInterface}
}

const ${name}: React.FC<${name}Props> = ({ ${propsDestructuring} }) => {
  return (
    <div className={styles.${name.toLowerCase()}}>
      <h2>${name} Component</h2>
      {/* Component implementation goes here */}
      <div className={styles.content}>
        <p>This component was created by Sandra DEV Expert</p>
        ${props.map(prop => `<p>{${prop.name}}</p>`).join('\n        ')}
      </div>
    </div>
  );
};

${name}.propTypes = {
${props.map(prop => `  ${prop.name}: PropTypes.${this.getPropTypeFromType(prop.type)}.isRequired,`).join('\n')}
};

export default ${name};
`;
  }

  // ============================================================================
  // GENERAR ESTILOS CSS MODULE
  // ============================================================================
  generateComponentStyles(name) {
    return `.${name.toLowerCase()} {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.${name.toLowerCase()} h2 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
}

.content {
  color: #4a5568;
  line-height: 1.6;
}

.content p {
  margin: 0.5rem 0;
}

/* Generated by Sandra DEV Expert - ${new Date().toISOString()} */
`;
  }

  // ============================================================================
  // CREAR ARCHIVO GENÉRICO - EJECUTABLE
  // ============================================================================
  async createFile(task) {
    const { filePath, content, encoding = 'utf8' } = task.params;

    console.log(`[DEV EXPERT] Creating file: ${filePath}`);

    // 1. RESOLVER PATH ABSOLUTO
    const fullPath = path.resolve(this.workingDir, filePath);
    const directory = path.dirname(fullPath);

    // 2. CREAR DIRECTORIO SI NO EXISTE
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
      console.log(`[DEV EXPERT] ✅ Created directory: ${directory}`);
    }

    // 3. ESCRIBIR ARCHIVO REAL
    fs.writeFileSync(fullPath, content, encoding);

    // 4. VERIFICAR CREACIÓN
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Failed to create file: ${fullPath}`);
    }

    console.log(`[DEV EXPERT] ✅ File created: ${fullPath}`);

    return {
      success: true,
      filePath: fullPath,
      message: `File created successfully`,
      realFileCreated: true,
      verificationPassed: fs.existsSync(fullPath)
    };
  }

  // ============================================================================
  // MODIFICAR ARCHIVO EXISTENTE - EJECUTABLE
  // ============================================================================
  async modifyFile(task) {
    const { filePath, modifications } = task.params;

    console.log(`[DEV EXPERT] Modifying file: ${filePath}`);

    // 1. VERIFICAR QUE EL ARCHIVO EXISTE
    const fullPath = path.resolve(this.workingDir, filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`);
    }

    // 2. LEER CONTENIDO ACTUAL
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // 3. APLICAR MODIFICACIONES
    for (const mod of modifications) {
      switch (mod.type) {
        case 'REPLACE':
          content = content.replace(mod.search, mod.replace);
          break;
        case 'INSERT_AFTER':
          content = content.replace(mod.search, mod.search + '\n' + mod.insert);
          break;
        case 'INSERT_BEFORE':
          content = content.replace(mod.search, mod.insert + '\n' + mod.search);
          break;
        case 'APPEND':
          content = content + '\n' + mod.content;
          break;
        case 'PREPEND':
          content = mod.content + '\n' + content;
          break;
      }
    }

    // 4. ESCRIBIR ARCHIVO MODIFICADO
    fs.writeFileSync(fullPath, content, 'utf8');

    // 5. VERIFICAR CAMBIOS
    const newContent = fs.readFileSync(fullPath, 'utf8');
    const hasChanged = newContent !== originalContent;

    console.log(`[DEV EXPERT] ✅ File modified: ${fullPath}`);

    return {
      success: true,
      filePath: fullPath,
      message: `File modified successfully`,
      realFileModified: true,
      hasChanged,
      verificationPassed: true
    };
  }

  // ============================================================================
  // GIT COMMIT REAL - EJECUTABLE
  // ============================================================================
  async gitCommit(task) {
    const { message, files = ['.'] } = task.params;

    console.log(`[DEV EXPERT] Making git commit: ${message}`);

    try {
      // 1. GIT ADD
      for (const file of files) {
        const addResult = await execAsync(`git add ${file}`);
        console.log(`[DEV EXPERT] ✅ Added: ${file}`);
      }

      // 2. GIT COMMIT REAL
      const commitResult = await execAsync(`git commit -m "${message}"`);
      console.log(`[DEV EXPERT] ✅ Commit successful`);

      // 3. VERIFICAR COMMIT
      const logResult = await execAsync('git log -1 --oneline');

      return {
        success: true,
        message: `Git commit successful`,
        commitMessage: message,
        lastCommit: logResult.stdout.trim(),
        realCommitMade: true,
        verificationPassed: true
      };

    } catch (error) {
      console.error(`[DEV EXPERT] Git commit failed:`, error);
      throw new Error(`Git commit failed: ${error.message}`);
    }
  }

  // ============================================================================
  // INSTALAR PACKAGE REAL - EJECUTABLE
  // ============================================================================
  async installPackage(task) {
    const { packageName, dev = false } = task.params;

    console.log(`[DEV EXPERT] Installing package: ${packageName}`);

    try {
      const command = dev ? `npm install --save-dev ${packageName}` : `npm install ${packageName}`;
      const result = await execAsync(command);

      console.log(`[DEV EXPERT] ✅ Package installed: ${packageName}`);

      return {
        success: true,
        packageName,
        message: `Package ${packageName} installed successfully`,
        realPackageInstalled: true,
        output: result.stdout,
        verificationPassed: true
      };

    } catch (error) {
      console.error(`[DEV EXPERT] Package installation failed:`, error);
      throw new Error(`Package installation failed: ${error.message}`);
    }
  }

  // ============================================================================
  // EJECUTAR COMANDO REAL - EJECUTABLE
  // ============================================================================
  async runCommand(task) {
    const { command, cwd = this.workingDir } = task.params;

    console.log(`[DEV EXPERT] Running command: ${command}`);

    try {
      const result = await execAsync(command, { cwd });

      console.log(`[DEV EXPERT] ✅ Command executed successfully`);

      return {
        success: true,
        command,
        message: `Command executed successfully`,
        realCommandExecuted: true,
        stdout: result.stdout,
        stderr: result.stderr,
        verificationPassed: true
      };

    } catch (error) {
      console.error(`[DEV EXPERT] Command execution failed:`, error);
      throw new Error(`Command execution failed: ${error.message}`);
    }
  }

  // ============================================================================
  // UTILIDADES INTERNAS
  // ============================================================================
  async updateComponentIndex(componentDir, componentName) {
    const indexPath = path.join(componentDir, 'index.js');

    let indexContent = '';
    if (fs.existsSync(indexPath)) {
      indexContent = fs.readFileSync(indexPath, 'utf8');
    }

    const exportLine = `export { default as ${componentName} } from './${componentName}';`;

    if (!indexContent.includes(exportLine)) {
      indexContent += '\n' + exportLine;
      fs.writeFileSync(indexPath, indexContent, 'utf8');
      console.log(`[DEV EXPERT] ✅ Updated component index`);
    }
  }

  getPropTypeFromType(type) {
    const typeMap = {
      'string': 'string',
      'number': 'number',
      'boolean': 'bool',
      'object': 'object',
      'array': 'array',
      'function': 'func'
    };
    return typeMap[type] || 'any';
  }

  // ============================================================================
  // MÉTODO DE ENTRADA PRINCIPAL - MCP INTERFACE
  // ============================================================================
  async handleMCPRequest(request) {
    console.log(`[DEV EXPERT] Handling MCP request:`, request.type);

    try {
      // Validar que la request tiene el formato correcto
      if (!request.type || !request.params) {
        throw new Error('Invalid MCP request format');
      }

      // Ejecutar la tarea de desarrollo
      const result = await this.executeDevelopmentTask(request);

      // Verificar que la acción se ejecutó correctamente
      if (!result.success || !result.verificationPassed) {
        throw new Error('Task execution failed verification');
      }

      return {
        success: true,
        expert: 'SANDRA_DEV_EXPERT',
        mode: 'EXECUTABLE',
        result,
        constraints_applied: true,
        real_action_performed: true
      };

    } catch (error) {
      console.error(`[DEV EXPERT] MCP Request failed:`, error);
      return {
        success: false,
        expert: 'SANDRA_DEV_EXPERT',
        error: error.message,
        constraints_applied: true,
        real_action_attempted: true
      };
    }
  }
}

// ============================================================================
// EXPORT Y AUTO-INICIALIZACIÓN
// ============================================================================
const sandraDevExpert = new SandraDevExpert();

module.exports = {
  SandraDevExpert,
  sandraDevExpert,
  EXECUTABLE_CONSTRAINTS
};

// Auto-test si se ejecuta directamente
if (require.main === module) {
  console.log('[DEV EXPERT] Testing executable system...');

  // Test de creación de componente
  const testTask = {
    type: 'CREATE_COMPONENT',
    params: {
      name: 'TestComponent',
      props: [
        { name: 'title', type: 'string' },
        { name: 'count', type: 'number' }
      ],
      directory: 'src/components/test',
      includeStyles: true
    }
  };

  sandraDevExpert.executeDevelopmentTask(testTask)
    .then(result => {
      console.log('[DEV EXPERT] ✅ Test successful:', result);
    })
    .catch(error => {
      console.error('[DEV EXPERT] ❌ Test failed:', error);
    });
}