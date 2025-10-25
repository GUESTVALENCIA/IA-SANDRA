#!/usr/bin/env node

/**
 * Script para verificar y corregir la configuración de Netlify
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Verificando configuración de Netlify...\n');

// Verificar netlify.toml
const netlifyTomlPath = path.join(__dirname, 'netlify.toml');
const netlifyToml = fs.readFileSync(netlifyTomlPath, 'utf8');

// Buscar la línea de publish
const lines = netlifyToml.split('\n');
let foundError = false;

lines.forEach((line, index) => {
    if (line.includes('publish')) {
        console.log(`Línea ${index + 1}: ${line.trim()}`);
        if (line.includes('sandra-deploy}')) {
            console.log('❌ ERROR ENCONTRADO: Hay un } extra en la configuración');
            foundError = true;
        } else if (line.includes('publish = "sandra-deploy"')) {
            console.log('✅ Configuración correcta en netlify.toml');
        }
    }
});

// Verificar que la carpeta sandra-deploy existe
const deployPath = path.join(__dirname, 'sandra-deploy');
if (fs.existsSync(deployPath)) {
    console.log('\n✅ Carpeta sandra-deploy existe');

    // Verificar contenido
    const files = fs.readdirSync(deployPath);
    console.log('📁 Contenido de sandra-deploy:');
    files.forEach(file => console.log(`   - ${file}`));

    // Verificar index.html
    const indexPath = path.join(deployPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        console.log('✅ index.html encontrado en sandra-deploy');
    } else {
        console.log('❌ index.html NO encontrado en sandra-deploy');
    }
} else {
    console.log('❌ Carpeta sandra-deploy NO existe');
}

console.log('\n📝 Recomendaciones:');
console.log('1. Si el error persiste, verifica en Netlify UI:');
console.log('   https://app.netlify.com/sites/grand-pasca-a584d5/settings/deploys');
console.log('2. En "Build settings" > "Publish directory" debe decir: sandra-deploy');
console.log('3. NO debe tener ningún carácter extra como }');

if (!foundError) {
    console.log('\n✅ La configuración local está correcta.');
    console.log('El problema debe estar en la configuración web de Netlify.');
}