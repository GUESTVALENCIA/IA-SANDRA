// ═══════════════════════════════════════════════════════════════════
// SANDRA IA - DOCUMENTS ENDPOINT
// PDF/Markdown Parser + Semantic Search + Text Extraction
// ═══════════════════════════════════════════════════════════════════

const { withMiddleware, createSuccessResponse, createErrorResponse } = require('./shared/middleware');
const config = require('./shared/config');
const logger = require('./shared/logger');
const pdfParse = require('pdf-parse');
const marked = require('marked');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Generate unique file ID
 */
function generateFileId(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Parse PDF document
 */
async function parsePDF(base64Data) {
  try {
    logger.info('Parsing PDF document');

    const buffer = Buffer.from(base64Data, 'base64');

    // Validate size
    if (buffer.length > config.documents.maxFileSize) {
      throw new Error(`PDF too large: ${(buffer.length / 1024 / 1024).toFixed(2)}MB (max ${(config.documents.maxFileSize / 1024 / 1024).toFixed(2)}MB)`);
    }

    const data = await pdfParse(buffer);

    logger.info('PDF parsed successfully', {
      pages: data.numpages,
      textLength: data.text.length
    });

    return {
      text: data.text,
      pages: data.numpages,
      metadata: {
        info: data.info,
        metadata: data.metadata
      }
    };

  } catch (error) {
    logger.error('PDF parsing failed', { error: error.message });
    throw new Error('Failed to parse PDF');
  }
}

/**
 * Parse Markdown document
 */
async function parseMarkdown(content) {
  try {
    logger.info('Parsing Markdown document', {
      contentLength: content.length
    });

    // Extract raw text (no HTML)
    const tokens = marked.lexer(content);
    const text = extractTextFromTokens(tokens);

    // Extract structure
    const structure = extractStructure(tokens);

    logger.info('Markdown parsed successfully', {
      textLength: text.length,
      headings: structure.headings.length
    });

    return {
      text,
      html: marked.parse(content),
      structure,
      tokens: tokens.length
    };

  } catch (error) {
    logger.error('Markdown parsing failed', { error: error.message });
    throw new Error('Failed to parse Markdown');
  }
}

/**
 * Extract text from markdown tokens
 */
function extractTextFromTokens(tokens) {
  let text = '';

  for (const token of tokens) {
    if (token.type === 'text' || token.type === 'paragraph') {
      text += token.text + '\n';
    } else if (token.type === 'heading') {
      text += token.text + '\n';
    } else if (token.type === 'list') {
      for (const item of token.items || []) {
        text += '• ' + item.text + '\n';
      }
    } else if (token.type === 'code') {
      text += token.text + '\n';
    }
  }

  return text.trim();
}

/**
 * Extract document structure
 */
function extractStructure(tokens) {
  const headings = [];
  const lists = [];
  const codeBlocks = [];

  for (const token of tokens) {
    if (token.type === 'heading') {
      headings.push({
        level: token.depth,
        text: token.text
      });
    } else if (token.type === 'list') {
      lists.push({
        ordered: token.ordered,
        items: token.items?.map(item => item.text) || []
      });
    } else if (token.type === 'code') {
      codeBlocks.push({
        language: token.lang,
        code: token.text
      });
    }
  }

  return { headings, lists, codeBlocks };
}

/**
 * Perform semantic search in document
 */
async function semanticSearch(text, query, maxResults = 5) {
  try {
    logger.info('Performing semantic search', {
      textLength: text.length,
      query
    });

    // Split text into chunks
    const chunks = splitIntoChunks(text, 500);

    // Simple relevance scoring (keyword matching)
    const queryWords = query.toLowerCase().split(/\s+/);
    const scored = chunks.map((chunk, index) => {
      const chunkLower = chunk.toLowerCase();
      let score = 0;

      // Count keyword occurrences
      for (const word of queryWords) {
        const occurrences = (chunkLower.match(new RegExp(word, 'g')) || []).length;
        score += occurrences;
      }

      return { chunk, score, index };
    });

    // Sort by score and return top results
    const results = scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(item => ({
        text: item.chunk,
        score: item.score,
        position: item.index
      }));

    logger.info('Semantic search completed', {
      results: results.length
    });

    return results;

  } catch (error) {
    logger.error('Semantic search failed', { error: error.message });
    throw error;
  }
}

/**
 * Split text into chunks
 */
function splitIntoChunks(text, chunkSize) {
  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }

  return chunks;
}

/**
 * Store document temporarily
 */
async function storeDocument(fileId, content, metadata) {
  try {
    const tempDir = config.documents.tempStorageDir;

    // Create temp directory if it doesn't exist
    try {
      await fs.mkdir(tempDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    const filePath = path.join(tempDir, `${fileId}.json`);

    await fs.writeFile(
      filePath,
      JSON.stringify({
        content,
        metadata,
        timestamp: Date.now()
      })
    );

    logger.info('Document stored', { fileId, path: filePath });

    // Schedule cleanup
    setTimeout(async () => {
      try {
        await fs.unlink(filePath);
        logger.info('Document cleaned up', { fileId });
      } catch (err) {
        logger.warn('Failed to cleanup document', { fileId, error: err.message });
      }
    }, config.documents.cleanupAge);

  } catch (error) {
    logger.warn('Failed to store document', { error: error.message });
    // Non-critical, continue without storage
  }
}

/**
 * Main handler
 */
const handler = async (event, context, { requestId, body, logger: requestLogger }) => {
  try {
    const {
      document,
      documentBase64,
      type = 'auto', // 'pdf', 'markdown', 'text', 'auto'
      query, // For semantic search
      mode = 'parse' // 'parse', 'search', 'extract'
    } = body;

    // Validate document
    if (!document && !documentBase64) {
      throw new Error('Document is required');
    }

    const docData = document || documentBase64;
    let content = '';
    let metadata = {};
    let result = {};

    // Detect type if auto
    let docType = type;
    if (type === 'auto') {
      if (docData.startsWith('JVBERi0')) {
        docType = 'pdf';
      } else {
        docType = 'text';
      }
    }

    requestLogger.info('Processing document', {
      type: docType,
      size: docData.length,
      mode
    });

    // Parse document based on type
    switch (docType) {
      case 'pdf':
        const pdfResult = await parsePDF(docData);
        content = pdfResult.text;
        metadata = pdfResult.metadata;
        result.pages = pdfResult.pages;
        break;

      case 'markdown':
        const decodedMd = Buffer.from(docData, 'base64').toString('utf-8');
        const mdResult = await parseMarkdown(decodedMd);
        content = mdResult.text;
        result.html = mdResult.html;
        result.structure = mdResult.structure;
        break;

      case 'text':
      default:
        content = Buffer.from(docData, 'base64').toString('utf-8');
        break;
    }

    // Generate file ID
    const fileId = generateFileId(content);

    // Store document temporarily
    await storeDocument(fileId, content, metadata);

    // Process based on mode
    switch (mode) {
      case 'search':
        if (!query) {
          throw new Error('Query is required for search mode');
        }
        result.searchResults = await semanticSearch(content, query);
        break;

      case 'extract':
        result.text = content;
        result.wordCount = content.split(/\s+/).length;
        result.charCount = content.length;
        break;

      case 'parse':
      default:
        result.summary = {
          wordCount: content.split(/\s+/).length,
          charCount: content.length,
          lines: content.split('\n').length
        };
        result.preview = content.substring(0, 500);
        break;
    }

    result.requestId = requestId;
    result.fileId = fileId;
    result.type = docType;
    result.metadata = metadata;

    return createSuccessResponse(result);

  } catch (error) {
    requestLogger.error('Documents endpoint failed', { error: error.message });
    return createErrorResponse(error);
  }
};

// Export with middleware
export default withMiddleware(handler, {
  endpoint: 'documents',
  methods: ['POST'],
  requiredFields: [], // Document validation handled manually
  rateLimit: true,
  logging: true
});

