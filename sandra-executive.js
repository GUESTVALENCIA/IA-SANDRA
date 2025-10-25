// Sandra IA Executive - Sistema Core CEO Edition
// Por y para Claytis Miguel Tom Zuaznabar

class SandraExecutive {
    constructor() {
        this.CEO = {
            name: "Claytis Miguel Tom Zuaznabar",
            role: "CEO & Creator",
            projects: ["GuestsValencia", "Sandra IA", "Galaxy Platform"],
            priority: "MÁXIMA"
        };
        
        this.config = {
            openai: {
                apiKey: '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',
                model: 'gpt-4o'
            },
            cartesia: {
                apiKey: 'sk_car_67c5Tg8LMpR9G6unHvsvnw',
                voiceId: 'sandra-executive'
            },
            elevenlabs: {
                apiKey: 'sk_972694e47b2a8ace6912f6689b8527b746cdf4bec9bae242',
                voiceId: '06H5cbUvetCmVYi9HUXk'
            }
        };
        
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
    }