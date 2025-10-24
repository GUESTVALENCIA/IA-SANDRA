/**
 * SANDRA COMPUTER VISION PANEL
 * Panel de demostración de capacidades Computer Vision de Sandra IA 7.0
 *
 * Funcionalidades:
 * - Object Detection en tiempo real
 * - Face Recognition y análisis
 * - OCR (Optical Character Recognition)
 * - Image Classification
 * - Video Analysis
 * - Análisis Inteligente integrado con Sandra
 *
 * @author: Sandra IA 7.0 DEV - Galaxy Level
 */

import React, { useState, useRef, useEffect } from 'react';

const ComputerVisionPanel = () => {
    const [activeTab, setActiveTab] = useState('detect-objects');
    const [processing, setProcessing] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [cvStatus, setCvStatus] = useState(null);

    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Cargar status de Computer Vision al montar el componente
    useEffect(() => {
        loadCVStatus();
    }, []);

    const loadCVStatus = async () => {
        try {
            const response = await fetch('/api/cv/status');
            const data = await response.json();
            if (data.success) {
                setCvStatus(data.status);
            }
        } catch (error) {
            console.error('Error loading CV status:', error);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setResults(null);
            setError(null);
        }
    };

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const processImage = async (endpoint, options = {}) => {
        if (!selectedFile) {
            setError('Por favor selecciona una imagen primero');
            return;
        }

        setProcessing(true);
        setError(null);
        setResults(null);

        try {
            const base64Image = await convertFileToBase64(selectedFile);

            const response = await fetch(`/api/cv/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image: base64Image,
                    options
                })
            });

            const data = await response.json();

            if (data.success) {
                setResults(data);
            } else {
                setError(data.error || 'Error procesando imagen');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error de conexión con el servidor');
        } finally {
            setProcessing(false);
        }
    };

    const performIntelligentAnalysis = async (context = {}) => {
        if (!selectedFile) {
            setError('Por favor selecciona una imagen primero');
            return;
        }

        setProcessing(true);
        setError(null);
        setResults(null);

        try {
            const base64Image = await convertFileToBase64(selectedFile);

            const response = await fetch('/api/cv/intelligent-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    input: base64Image,
                    context: {
                        ...context,
                        analysisType: activeTab,
                        userRequest: 'comprehensive_analysis'
                    }
                })
            });

            const data = await response.json();

            if (data.success) {
                setResults(data);
            } else {
                setError(data.error || 'Error en análisis inteligente');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error de conexión con el servidor');
        } finally {
            setProcessing(false);
        }
    };

    const renderResults = () => {
        if (!results) return null;

        switch (activeTab) {
            case 'detect-objects':
                return (
                    <div className="cv-results">
                        <h4>🎯 Objetos Detectados</h4>
                        {results.detections && results.detections.length > 0 ? (
                            <div className="detection-list">
                                {results.detections.map((detection, index) => (
                                    <div key={index} className="detection-item">
                                        <span className="object-class">{detection.class}</span>
                                        <span className="confidence">{(detection.confidence * 100).toFixed(1)}%</span>
                                        <div className="bbox">
                                            Posición: [{detection.bbox.join(', ')}]
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No se detectaron objetos</p>
                        )}
                        {results.metadata && (
                            <div className="metadata">
                                <p>⏱️ Tiempo: {results.metadata.processingTime}ms</p>
                                <p>🎯 Confianza promedio: {(results.metadata.confidence * 100).toFixed(1)}%</p>
                            </div>
                        )}
                    </div>
                );

            case 'recognize-faces':
                return (
                    <div className="cv-results">
                        <h4>👤 Análisis Facial</h4>
                        {results.faces && results.faces.length > 0 ? (
                            <div className="faces-list">
                                {results.faces.map((face, index) => (
                                    <div key={index} className="face-item">
                                        <div className="face-info">
                                            <p><strong>Rostro {index + 1}</strong></p>
                                            <p>Confianza: {(face.confidence * 100).toFixed(1)}%</p>
                                            {face.ageGender && (
                                                <div className="age-gender">
                                                    <p>Edad estimada: {face.ageGender.age.estimated} años</p>
                                                    <p>Género: {face.ageGender.gender.predicted} ({(face.ageGender.gender.confidence * 100).toFixed(1)}%)</p>
                                                </div>
                                            )}
                                            {face.expression && (
                                                <div className="expression">
                                                    <p>Expresión: {face.expression.emotion} ({(face.expression.confidence * 100).toFixed(1)}%)</p>
                                                </div>
                                            )}
                                            {face.liveness && (
                                                <div className="liveness">
                                                    <p>Liveness: {face.liveness.isLive ? '✅ Real' : '❌ Falso'}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No se detectaron rostros</p>
                        )}
                    </div>
                );

            case 'ocr':
                return (
                    <div className="cv-results">
                        <h4>📝 Texto Extraído (OCR)</h4>
                        {results.text ? (
                            <div className="ocr-results">
                                <div className="extracted-text">
                                    <h5>Texto detectado:</h5>
                                    <p className="text-content">{results.text}</p>
                                </div>
                                <div className="ocr-confidence">
                                    <p>Confianza: {(results.confidence * 100).toFixed(1)}%</p>
                                </div>
                                {results.structuredData && (
                                    <div className="structured-data">
                                        <h5>Datos estructurados:</h5>
                                        {results.structuredData.emails?.length > 0 && (
                                            <p>📧 Emails: {results.structuredData.emails.join(', ')}</p>
                                        )}
                                        {results.structuredData.phones?.length > 0 && (
                                            <p>📞 Teléfonos: {results.structuredData.phones.join(', ')}</p>
                                        )}
                                        {results.structuredData.dates?.length > 0 && (
                                            <p>📅 Fechas: {results.structuredData.dates.join(', ')}</p>
                                        )}
                                        {results.structuredData.urls?.length > 0 && (
                                            <p>🔗 URLs: {results.structuredData.urls.join(', ')}</p>
                                        )}
                                    </div>
                                )}
                                {results.languageDetection && (
                                    <div className="language-detection">
                                        <p>🌐 Idioma: {results.languageDetection.primary} ({(results.languageDetection.confidence * 100).toFixed(1)}%)</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p>No se detectó texto en la imagen</p>
                        )}
                    </div>
                );

            case 'classify':
                return (
                    <div className="cv-results">
                        <h4>🏷️ Clasificación de Imagen</h4>
                        {results.predictions && results.predictions.length > 0 ? (
                            <div className="predictions-list">
                                {results.predictions.map((prediction, index) => (
                                    <div key={index} className="prediction-item">
                                        <span className="prediction-class">{prediction.class}</span>
                                        <span className="prediction-confidence">{(prediction.confidence * 100).toFixed(1)}%</span>
                                        <div className="confidence-bar">
                                            <div
                                                className="confidence-fill"
                                                style={{ width: `${prediction.confidence * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No se pudo clasificar la imagen</p>
                        )}
                        {results.metadata && (
                            <div className="metadata">
                                <p>⏱️ Tiempo: {results.metadata.processingTime}ms</p>
                                <p>🏆 Mejor predicción: {results.metadata.topPrediction?.class}</p>
                            </div>
                        )}
                    </div>
                );

            case 'intelligent-analysis':
                return (
                    <div className="cv-results">
                        <h4>🧠 Análisis Inteligente Sandra</h4>
                        {results.securityLevel !== undefined && (
                            <div className="security-analysis">
                                <h5>🛡️ Análisis de Seguridad</h5>
                                <p>Nivel de seguridad: {results.securityLevel}/100</p>
                                {results.threats && results.threats.length > 0 && (
                                    <div className="threats">
                                        <h6>⚠️ Amenazas detectadas:</h6>
                                        {results.threats.map((threat, index) => (
                                            <p key={index}>• {threat.type}: {threat.reason || threat.object}</p>
                                        ))}
                                    </div>
                                )}
                                {results.recommendations && results.recommendations.length > 0 && (
                                    <div className="recommendations">
                                        <h6>💡 Recomendaciones:</h6>
                                        {results.recommendations.map((rec, index) => (
                                            <p key={index}>• {rec}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {results.documentType && (
                            <div className="document-analysis">
                                <h5>📄 Análisis de Documento</h5>
                                <p>Tipo: {results.documentType}</p>
                                {results.extractedData && (
                                    <div className="extracted-data">
                                        <h6>Datos extraídos:</h6>
                                        <pre>{JSON.stringify(results.extractedData, null, 2)}</pre>
                                    </div>
                                )}
                            </div>
                        )}
                        {results.contentRating && (
                            <div className="content-analysis">
                                <h5>🎬 Análisis de Contenido</h5>
                                <p>Clasificación: {results.contentRating}</p>
                                {results.mood && (
                                    <p>Estado de ánimo general: {results.mood.overall} ({(results.mood.confidence * 100).toFixed(1)}%)</p>
                                )}
                                {results.tags && results.tags.length > 0 && (
                                    <div className="content-tags">
                                        <p>Etiquetas: {results.tags.join(', ')}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );

            default:
                return <div className="cv-results">Resultados no disponibles</div>;
        }
    };

    const tabs = [
        { id: 'detect-objects', label: '🎯 Detección de Objetos', action: () => processImage('detect-objects') },
        { id: 'recognize-faces', label: '👤 Reconocimiento Facial', action: () => processImage('recognize-faces') },
        { id: 'ocr', label: '📝 OCR', action: () => processImage('ocr') },
        { id: 'classify', label: '🏷️ Clasificación', action: () => processImage('classify') },
        { id: 'intelligent-analysis', label: '🧠 Análisis Inteligente', action: () => performIntelligentAnalysis() }
    ];

    return (
        <div className="computer-vision-panel">
            <div className="cv-header">
                <h2>🔍 Sandra Computer Vision</h2>
                <p>Capacidades de visión artificial integradas en Sandra IA 7.0</p>
                {cvStatus && (
                    <div className="cv-status">
                        <span className={`status-indicator ${cvStatus.initialized ? 'active' : 'inactive'}`}>
                            {cvStatus.initialized ? '✅ Activo' : '❌ Inactivo'}
                        </span>
                        <span className="models-count">
                            Modelos cargados: {Object.keys(cvStatus.models || {}).length}
                        </span>
                    </div>
                )}
            </div>

            <div className="cv-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`cv-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="cv-content">
                <div className="cv-input-section">
                    <div className="file-upload">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                        <button
                            className="upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            📁 Seleccionar Imagen
                        </button>
                    </div>

                    {previewUrl && (
                        <div className="image-preview">
                            <img src={previewUrl} alt="Preview" style={{ maxWidth: '300px', maxHeight: '200px' }} />
                        </div>
                    )}

                    <div className="cv-actions">
                        <button
                            className="analyze-btn"
                            onClick={() => {
                                const currentTab = tabs.find(tab => tab.id === activeTab);
                                if (currentTab) currentTab.action();
                            }}
                            disabled={!selectedFile || processing}
                        >
                            {processing ? '🔄 Procesando...' : `🚀 Ejecutar ${tabs.find(t => t.id === activeTab)?.label.split(' ').slice(1).join(' ')}`}
                        </button>
                    </div>
                </div>

                <div className="cv-results-section">
                    {error && (
                        <div className="error-message">
                            ❌ {error}
                        </div>
                    )}

                    {processing && (
                        <div className="processing-indicator">
                            <div className="spinner"></div>
                            <p>Analizando imagen con {tabs.find(t => t.id === activeTab)?.label}...</p>
                        </div>
                    )}

                    {renderResults()}
                </div>
            </div>

            <style jsx>{`
                .computer-vision-panel {
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    padding: 24px;
                    margin: 20px;
                    border: 1px solid var(--border);
                }

                .cv-header {
                    text-align: center;
                    margin-bottom: 24px;
                }

                .cv-header h2 {
                    color: var(--blue-corporate);
                    margin-bottom: 8px;
                }

                .cv-header p {
                    color: var(--text-secondary);
                    margin-bottom: 16px;
                }

                .cv-status {
                    display: flex;
                    gap: 16px;
                    justify-content: center;
                    align-items: center;
                }

                .status-indicator {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 500;
                }

                .status-indicator.active {
                    background: var(--success);
                    color: white;
                }

                .status-indicator.inactive {
                    background: var(--warning);
                    color: white;
                }

                .models-count {
                    color: var(--text-secondary);
                    font-size: 14px;
                }

                .cv-tabs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 24px;
                    overflow-x: auto;
                    padding-bottom: 8px;
                }

                .cv-tab {
                    padding: 12px 16px;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                    font-size: 14px;
                }

                .cv-tab:hover {
                    color: var(--text-primary);
                    border-color: var(--blue-corporate);
                }

                .cv-tab.active {
                    background: var(--blue-corporate);
                    color: white;
                    border-color: var(--blue-corporate);
                }

                .cv-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }

                @media (max-width: 768px) {
                    .cv-content {
                        grid-template-columns: 1fr;
                    }
                }

                .cv-input-section {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .upload-btn {
                    padding: 12px 24px;
                    background: var(--bg-tertiary);
                    border: 2px dashed var(--border);
                    border-radius: 8px;
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .upload-btn:hover {
                    border-color: var(--blue-corporate);
                    color: var(--blue-corporate);
                }

                .image-preview {
                    text-align: center;
                    padding: 16px;
                    background: var(--bg-primary);
                    border-radius: 8px;
                    border: 1px solid var(--border);
                }

                .image-preview img {
                    border-radius: 8px;
                    object-fit: contain;
                }

                .analyze-btn {
                    padding: 16px 24px;
                    background: var(--blue-corporate);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .analyze-btn:hover:not(:disabled) {
                    background: var(--blue-hover);
                }

                .analyze-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .cv-results-section {
                    background: var(--bg-primary);
                    border-radius: 8px;
                    padding: 20px;
                    border: 1px solid var(--border);
                    max-height: 500px;
                    overflow-y: auto;
                }

                .error-message {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.1);
                    padding: 12px;
                    border-radius: 6px;
                    margin-bottom: 16px;
                }

                .processing-indicator {
                    text-align: center;
                    padding: 40px;
                }

                .spinner {
                    border: 3px solid var(--border);
                    border-top: 3px solid var(--blue-corporate);
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 16px;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .cv-results {
                    color: var(--text-primary);
                }

                .cv-results h4, .cv-results h5, .cv-results h6 {
                    color: var(--blue-corporate);
                    margin-bottom: 12px;
                }

                .detection-list, .faces-list, .predictions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 16px;
                }

                .detection-item, .face-item, .prediction-item {
                    background: var(--bg-secondary);
                    padding: 12px;
                    border-radius: 6px;
                    border: 1px solid var(--border);
                }

                .object-class, .prediction-class {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .confidence, .prediction-confidence {
                    color: var(--success);
                    font-weight: 500;
                    float: right;
                }

                .bbox {
                    color: var(--text-secondary);
                    font-size: 12px;
                    margin-top: 4px;
                }

                .confidence-bar {
                    height: 4px;
                    background: var(--border);
                    border-radius: 2px;
                    margin-top: 8px;
                    overflow: hidden;
                }

                .confidence-fill {
                    height: 100%;
                    background: var(--success);
                    transition: width 0.3s ease;
                }

                .face-info, .age-gender, .expression, .liveness {
                    margin-bottom: 8px;
                }

                .face-info p, .age-gender p, .expression p, .liveness p {
                    margin-bottom: 4px;
                }

                .extracted-text {
                    margin-bottom: 16px;
                }

                .text-content {
                    background: var(--bg-secondary);
                    padding: 12px;
                    border-radius: 6px;
                    border: 1px solid var(--border);
                    white-space: pre-wrap;
                    max-height: 150px;
                    overflow-y: auto;
                }

                .structured-data, .language-detection, .metadata {
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid var(--border);
                }

                .security-analysis, .document-analysis, .content-analysis {
                    margin-bottom: 20px;
                    padding: 16px;
                    background: var(--bg-secondary);
                    border-radius: 8px;
                    border: 1px solid var(--border);
                }

                .threats, .recommendations {
                    margin-top: 12px;
                }

                .extracted-data pre {
                    background: var(--bg-primary);
                    padding: 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    overflow-x: auto;
                }

                .content-tags {
                    margin-top: 8px;
                }
            `}</style>
        </div>
    );
};

export default ComputerVisionPanel;