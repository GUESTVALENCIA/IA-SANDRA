// ═══════════════════════════════════════════════════════════════════
// SANDRA IA - VISION ENDPOINT
// Claude Vision + OCR + Image Analysis
// ═══════════════════════════════════════════════════════════════════

const { withMiddleware, createSuccessResponse, createErrorResponse } = require('../shared/middleware');
const config = require('../shared/config');
const logger = require('../shared/logger');
const sharp = require('sharp');

/**
 * Compress image if needed
 */
async function compressImage(imageBase64, maxSize = config.vision.maxImageSize) {
  try {
    const buffer = Buffer.from(imageBase64, 'base64');

    // Check if compression needed
    if (buffer.length <= maxSize) {
      return imageBase64;
    }

    logger.info('Compressing image', {
      originalSize: buffer.length,
      maxSize
    });

    // Compress using sharp
    const compressed = await sharp(buffer)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: Math.floor(config.vision.compressionQuality * 100) })
      .toBuffer();

    logger.info('Image compressed', {
      originalSize: buffer.length,
      compressedSize: compressed.length,
      reduction: `${((1 - compressed.length / buffer.length) * 100).toFixed(2)}%`
    });

    return compressed.toString('base64');

  } catch (error) {
    logger.error('Image compression failed', { error: error.message });
    throw new Error('Failed to compress image');
  }
}

/**
 * Detect image format from base64
 */
function detectImageFormat(base64Data) {
  const header = base64Data.substring(0, 30);

  if (header.startsWith('/9j/')) return 'image/jpeg';
  if (header.startsWith('iVBORw0KGgo')) return 'image/png';
  if (header.startsWith('R0lGOD')) return 'image/gif';
  if (header.startsWith('UklGR')) return 'image/webp';

  return 'image/jpeg'; // Default
}

/**
 * Analyze image using Claude Vision API
 */
async function analyzeWithClaude(imageBase64, prompt, imageFormat) {
  try {
    logger.info('Analyzing image with Claude Vision', {
      promptLength: prompt?.length || 0,
      imageFormat
    });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    // Compress image if needed
    const compressedImage = await compressImage(imageBase64);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': config.models.claude.version,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: imageFormat,
                  data: compressedImage
                }
              },
              {
                type: 'text',
                text: prompt || 'Describe esta imagen en detalle en español.'
              }
            ]
          }
        ],
        system: config.sandraPrompt.system
      }),
      timeout: config.models.claude.timeout
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude Vision API error ${response.status}: ${error}`);
    }

    const data = await response.json();
    const analysis = data.content?.[0]?.text || 'No pude analizar la imagen.';

    logger.info('Claude Vision analysis successful', {
      analysisLength: analysis.length
    });

    return analysis;

  } catch (error) {
    logger.error('Claude Vision analysis failed', { error: error.message });
    throw error;
  }
}

/**
 * Perform OCR on image (using Claude Vision)
 */
async function performOCR(imageBase64, imageFormat) {
  try {
    logger.info('Performing OCR on image');

    const prompt = 'Extrae todo el texto de esta imagen. Devuelve solo el texto extraído, sin comentarios adicionales. Mantén el formato original del texto.';

    const text = await analyzeWithClaude(imageBase64, prompt, imageFormat);

    logger.info('OCR completed', {
      textLength: text.length
    });

    return text;

  } catch (error) {
    logger.error('OCR failed', { error: error.message });
    throw error;
  }
}

/**
 * Detect objects in image
 */
async function detectObjects(imageBase64, imageFormat) {
  try {
    logger.info('Detecting objects in image');

    const prompt = 'Lista todos los objetos visibles en esta imagen. Para cada objeto, indica su posición aproximada (arriba/abajo, izquierda/derecha/centro). Responde en español.';

    const analysis = await analyzeWithClaude(imageBase64, prompt, imageFormat);

    logger.info('Object detection completed');

    return analysis;

  } catch (error) {
    logger.error('Object detection failed', { error: error.message });
    throw error;
  }
}

/**
 * Analyze facial features (basic, privacy-conscious)
 */
async function analyzeFaces(imageBase64, imageFormat) {
  try {
    logger.info('Analyzing facial features');

    const prompt = '¿Hay personas en esta imagen? Si es así, describe brevemente lo que puedas observar sobre su apariencia general (edad aproximada, expresión, etc.) sin identificar identidades específicas. Responde en español.';

    const analysis = await analyzeWithClaude(imageBase64, prompt, imageFormat);

    logger.info('Face analysis completed');

    return analysis;

  } catch (error) {
    logger.error('Face analysis failed', { error: error.message });
    throw error;
  }
}

/**
 * Main handler
 */
const handler = async (event, context, { requestId, body, logger: requestLogger }) => {
  try {
    const {
      image,
      imageBase64,
      prompt,
      mode = 'analyze', // 'analyze', 'ocr', 'objects', 'faces'
      language = 'es'
    } = body;

    // Validate image
    if (!image && !imageBase64) {
      throw new Error('Image is required');
    }

    const imageData = image || imageBase64;

    // Detect image format
    const imageFormat = detectImageFormat(imageData);
    requestLogger.info('Image received', {
      format: imageFormat,
      size: imageData.length,
      mode
    });

    // Validate format
    if (!config.vision.allowedFormats.includes(imageFormat)) {
      throw new Error(`Unsupported image format: ${imageFormat}`);
    }

    // Validate size
    const imageSize = Buffer.from(imageData, 'base64').length;
    if (imageSize > config.vision.maxImageSize * 2) { // Allow 2x for pre-compression
      throw new Error(`Image too large: ${(imageSize / 1024 / 1024).toFixed(2)}MB (max ${(config.vision.maxImageSize / 1024 / 1024).toFixed(2)}MB)`);
    }

    // Process based on mode
    let result = {};

    switch (mode) {
      case 'ocr':
        result.text = await performOCR(imageData, imageFormat);
        result.mode = 'ocr';
        break;

      case 'objects':
        result.analysis = await detectObjects(imageData, imageFormat);
        result.mode = 'objects';
        break;

      case 'faces':
        result.analysis = await analyzeFaces(imageData, imageFormat);
        result.mode = 'faces';
        break;

      case 'analyze':
      default:
        result.analysis = await analyzeWithClaude(imageData, prompt, imageFormat);
        result.mode = 'analyze';
        break;
    }

    result.requestId = requestId;
    result.imageFormat = imageFormat;

    return createSuccessResponse(result);

  } catch (error) {
    requestLogger.error('Vision endpoint failed', { error: error.message });
    return createErrorResponse(error);
  }
};

// Export with middleware
exports.handler = withMiddleware(handler, {
  endpoint: 'vision',
  methods: ['POST'],
  requiredFields: [], // Image validation handled manually
  rateLimit: true,
  logging: true
});
