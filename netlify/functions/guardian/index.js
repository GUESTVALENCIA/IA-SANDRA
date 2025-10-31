// =============================================================================
// SANDRA IA 7.0 - GUARDIAN PROTOCOL ENDPOINT
// Emergency snapshot and restoration system
// CEO Requirement: Voice-activated SOS/RESTAURAR commands
// =============================================================================

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

// In-memory snapshot storage (for demo - use Redis/DB in production)
const snapshots = new Map();
let snapshotCounter = 0;

exports.handler = async (event) => {
  // Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Method not allowed'
      })
    };
  }

  try {
    const { command, timestamp, context } = JSON.parse(event.body);

    console.log(`🛡️ Guardian Protocol: ${command} at ${timestamp}`);

    // =========================================================================
    // SOS COMMAND - Create emergency snapshot
    // =========================================================================
    if (command === 'SOS') {
      const snapshotId = `snapshot_${++snapshotCounter}_${Date.now()}`;

      const snapshot = {
        id: snapshotId,
        timestamp,
        context: {
          conversationHistory: context?.conversationHistory || [],
          userState: context?.userState || 'active',
          metadata: {
            browserInfo: event.headers['user-agent'] || 'unknown',
            createdAt: new Date().toISOString()
          }
        },
        createdAt: new Date().toISOString()
      };

      // Store snapshot
      snapshots.set(snapshotId, snapshot);

      console.log(`✅ Snapshot created: ${snapshotId}`, {
        totalSnapshots: snapshots.size,
        messagesStored: snapshot.context.conversationHistory.length
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          command: 'SOS',
          snapshotId,
          message: 'Punto de restauración creado exitosamente',
          timestamp: snapshot.createdAt,
          snapshotCount: snapshots.size
        })
      };

    // =========================================================================
    // RESTAURAR COMMAND - Restore from latest snapshot
    // =========================================================================
    } else if (command === 'RESTAURAR') {

      // Get all snapshots and sort by creation date
      const allSnapshots = Array.from(snapshots.values());

      if (allSnapshots.length === 0) {
        console.warn('⚠️ No snapshots available for restoration');
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'No snapshots available',
            message: 'No hay puntos de restauración disponibles. Usa "SOS" para crear uno.'
          })
        };
      }

      // Get latest snapshot
      const latest = allSnapshots.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      )[0];

      console.log(`✅ Restoring from snapshot: ${latest.id}`, {
        snapshotCreated: latest.createdAt,
        messagesRestored: latest.context.conversationHistory.length
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          command: 'RESTAURAR',
          restoredFrom: latest.id,
          snapshot: latest,
          message: 'Estado restaurado exitosamente',
          timestamp: new Date().toISOString()
        })
      };

    // =========================================================================
    // INVALID COMMAND
    // =========================================================================
    } else {
      console.warn(`⚠️ Invalid Guardian command: ${command}`);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid command',
          message: 'Comando Guardian no reconocido. Usa "SOS" o "RESTAURAR".'
        })
      };
    }

  } catch (error) {
    console.error('❌ Guardian Protocol error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        message: 'Error en Guardian Protocol. Reinténtalo.'
      })
    };
  }
};
