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

export default async function handler(req, res) {
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
  }

  try {
    const { command, timestamp, context } = JSON.parse(req.body);

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
            browserInfo: req.headers['user-agent'] || 'unknown',
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

      res.status(200).json({
          success: true,
          command: 'SOS',
          snapshotId,
          message: 'Punto de restauración creado exitosamente',
          timestamp: snapshot.createdAt,
          snapshotCount: snapshots.size
        });

    // =========================================================================
    // RESTAURAR COMMAND - Restore from latest snapshot
    // =========================================================================
    } else if (command === 'RESTAURAR') {

      // Get all snapshots and sort by creation date
      const allSnapshots = Array.from(snapshots.values());

      if (allSnapshots.length === 0) {
        console.warn('⚠️ No snapshots available for restoration');
        res.status(404).json({
            success: false,
            error: 'No snapshots available',
            message: 'No hay puntos de restauración disponibles. Usa "SOS" para crear uno.'
          });
      }

      // Get latest snapshot
      const latest = allSnapshots.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      )[0];

      console.log(`✅ Restoring from snapshot: ${latest.id}`, {
        snapshotCreated: latest.createdAt,
        messagesRestored: latest.context.conversationHistory.length
      });

      res.status(200).json({
          success: true,
          command: 'RESTAURAR',
          restoredFrom: latest.id,
          snapshot: latest,
          message: 'Estado restaurado exitosamente',
          timestamp: new Date().toISOString()
        });

    // =========================================================================
    // INVALID COMMAND
    // =========================================================================
    } else {
      console.warn(`⚠️ Invalid Guardian command: ${command}`);
      res.status(400).json({
          success: false,
          error: 'Invalid command',
          message: 'Comando Guardian no reconocido. Usa "SOS" o "RESTAURAR".'
        });
    }

  } catch (error) {
    console.error('❌ Guardian Protocol error:', error);
    res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error en Guardian Protocol. Reinténtalo.'
      });
  }
};
