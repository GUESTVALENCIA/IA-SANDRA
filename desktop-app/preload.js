const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  searchAccommodation: (platform, url) => 
    ipcRenderer.invoke('search-accommodation', platform, url),
  
  processAccommodationSale: (data, userInfo) => 
    ipcRenderer.invoke('process-accommodation-sale', data, userInfo),
  
  startNegotiation: (accommodation, userInfo) => 
    ipcRenderer.invoke('start-negotiation', accommodation, userInfo),
  
  getNegotiationContext: (negotiationId) => 
    ipcRenderer.invoke('get-negotiation-context', negotiationId),
  
  handleCounterOffer: (negotiationId, counterOffer) => 
    ipcRenderer.invoke('handle-counter-offer', negotiationId, counterOffer),
  
  initiatePhoneCall: (phoneNumber, message) => 
    ipcRenderer.invoke('initiate-phone-call', phoneNumber, message),
  
  finalizeNegotiation: (negotiationId, finalPrice) => 
    ipcRenderer.invoke('finalize-negotiation', negotiationId, finalPrice),
  
  sendMessage: (message) => 
    ipcRenderer.invoke('send-message', message),
  
  executeTaskPractical: (task, role, context) => 
    ipcRenderer.invoke('execute-task-practical', task, role, context),
  
  optimizePrompt: (prompt, role) => 
    ipcRenderer.invoke('optimize-prompt', prompt, role),
  
  validateRole: (role, testTask) => 
    ipcRenderer.invoke('validate-role', role, testTask),
  
  validateAllRoles: () => 
    ipcRenderer.invoke('validate-all-roles'),
  
  validateTourismProduction: () => 
    ipcRenderer.invoke('validate-tourism-production'),
  
  getValidationStats: () => 
    ipcRenderer.invoke('get-validation-stats'),
  
  getExecutionStats: () => 
    ipcRenderer.invoke('get-execution-stats')
});

