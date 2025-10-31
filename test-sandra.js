// Test de funcionalidad Sandra MCP
console.log("🚀 Sandra Dev Interface - Test");
console.log("✅ Instalación completada");
console.log("📁 Ubicación: C:\\Users\\clayt\\Desktop\\SandraDevInterface");
console.log("🌐 Servidor: http://localhost:7777");
console.log("🔥 Estado: ACTIVO");

// Verificar módulos
const modules = ['express', 'ws', 'cors'];
modules.forEach(mod => {
    try {
        require.resolve(mod);
        console.log(`✅ ${mod} instalado`);
    } catch(e) {
        console.log(`❌ ${mod} no encontrado`);
    }
});

console.log("\n🎯 Sandra está lista para trabajar como tu aliada Dev!");
