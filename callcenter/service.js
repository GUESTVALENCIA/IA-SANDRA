'use strict';
const fs = require('fs');
const path = require('path');

function loadDialplan() {
  const p = path.resolve(__dirname, 'config', 'dialplan.json');
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

class CallCenter {
  constructor(ctx) {
    // ctx: { serviceManager, aiOrchestrator, multimodal, rolesSystem }
    this.ctx = ctx || {};
    this.dialplan = loadDialplan();
    // Si multimodal no viene en ctx, intentar obtenerlo del serviceManager
    if (!this.ctx.multimodal && this.ctx.serviceManager) {
      this.ctx.multimodal = this.ctx.serviceManager.get?.('multimodal');
    }
    // Si rolesSystem no viene, intentar obtenerlo
    if (!this.ctx.rolesSystem && this.ctx.serviceManager) {
      this.ctx.rolesSystem = this.ctx.serviceManager.get?.('roles-system');
    }
  }
  listRoutes() {
    return {
      roles: this.dialplan.roles,
      campaigns: this.dialplan.campaigns,
      defaultPipeline: this.dialplan.defaultPipeline
    };
  }
  _resolveRole(roleId) {
    const r = this.dialplan.roles[roleId];
    if (!r) throw new Error(`role_not_found:${roleId}`);
    return r;
  }
  _resolveCampaign(campaignId) {
    const c = this.dialplan.campaigns[campaignId];
    if (!c) throw new Error(`campaign_not_found:${campaignId}`);
    return c;
  }
  async startByRole({ sessionId, roleId }) {
    const role = this._resolveRole(roleId);
    const pipeline = role.pipeline || this.dialplan.defaultPipeline || 'voice_only';
    // Pide a Multimodal Conversation Service que arranque con role + pipeline
    const mm = this.ctx.multimodal || this.ctx.serviceManager?.get?.('multimodal');
    if (!mm) throw new Error('multimodal_service_unavailable');
    // Pasar rolesSystem si está disponible
    const rolesSystem = this.ctx.rolesSystem || this.ctx.serviceManager?.get?.('roles-system');
    const result = await mm.startCall({ sessionId, roleId, pipeline, rolesSystem });
    if (!result.success) throw new Error(result.error || 'startCall_failed');
    return { sessionId: result.sessionId || sessionId, roleId, pipeline };
  }
  async startByCampaign({ sessionId, campaignId }) {
    const c = this._resolveCampaign(campaignId);
    const roleId = c.roleId;
    const pipeline = c.pipeline || this.dialplan.defaultPipeline || 'voice_only';
    const mm = this.ctx.multimodal || this.ctx.serviceManager?.get?.('multimodal');
    if (!mm) throw new Error('multimodal_service_unavailable');
    const rolesSystem = this.ctx.rolesSystem || this.ctx.serviceManager?.get?.('roles-system');
    const result = await mm.startCall({ sessionId, roleId, pipeline, rolesSystem });
    if (!result.success) throw new Error(result.error || 'startCall_failed');
    return { sessionId: result.sessionId || sessionId, roleId, pipeline };
  }
  async end({ sessionId }) {
    const mm = this.ctx.multimodal || this.ctx.serviceManager?.get?.('multimodal');
    if (!mm?.endCall) return { sessionId, ok: false, reason: 'multimodal_service_unavailable' };
    await mm.endCall({ sessionId });
    return { sessionId, ok: true };
  }
}
module.exports = CallCenter;

