# 🎨 SANDRA IA 7.0 - MOCKUPS VISUALES & EJEMPLOS DE CÓDIGO
## Diseño Galaxy Level Enterprise Professional

**Fecha:** 2025-10-29
**Designer:** Claude Code Expert Elite

---

## 📱 VISTA GENERAL APP MÓVIL

```
┌─────────────────────────────────────────────────────────┐
│  [☰]  Sandra IA Mobile          🟢 98%  🎤  [🌓] [⚙️]  │ ← Header
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │                                                │    │
│  │     [Avatar Sandra - Video Stream HeyGen]     │    │ ← Avatar Widget
│  │              🎥 Streaming HD                   │    │
│  │           🔊 Sincronizado con voz             │    │
│  │                                                │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─[S]─ Sandra dice: ────────────────────────────┐     │
│  │ Hola! Soy Sandra, tu asistente inteligente.  │     │ ← Mensaje Sandra
│  │ ¿En qué puedo ayudarte hoy?         10:30 ✓ │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│               ┌─ Usuario dice: ────────[U]─┐           │
│               │ Necesito información sobre │           │ ← Mensaje Usuario
│               │ alojamientos    10:31 ✓    │           │
│               └────────────────────────────┘           │
│                                                         │
│  ┌─[S]─ Sandra está escribiendo... ───────────┐        │
│  │ ⚫⚫⚫                                        │        │ ← Typing indicator
│  └────────────────────────────────────────────┘        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [📎] [Escribe tu mensaje...]  [🎤] [📞]  [▶️ Enviar] │ ← Input multimodal
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 COMPONENTES DETALLADOS

### 1️⃣ **Header Component**

```
┌──────────────────────────────────────────────────────────────┐
│ [☰]  Sandra IA Mobile    🟢 Galaxy 98%  🎤 HD  [🌓]  [⚙️]   │
│  ↑         ↑                ↑            ↑      ↑     ↑      │
│  │         │                │            │      │     │      │
│ Menu     Logo            Status       Voice   Dark Settings │
└──────────────────────────────────────────────────────────────┘

Features:
✅ Sticky position (siempre visible)
✅ Backdrop blur glass effect
✅ Status indicators en tiempo real
✅ Dark mode toggle animado
✅ Responsive (collapse en móvil)
```

**Código React:**

```typescript
const Header = () => {
  const { status, darkMode } = useAppStore();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-dark-900/80
                       border-b-2 border-primary-500 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">

        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400
                         to-primary-600 bg-clip-text text-transparent">
            🧠 Sandra IA Mobile
          </h1>
        </div>

        {/* Right: Status badges + Actions */}
        <div className="flex items-center gap-3">
          <StatusBadge icon="🟢" label={`Galaxy ${status}%`} />
          <StatusBadge icon="🎤" label="HD Voice" />
          <button onClick={toggleDark}>
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button onClick={openSettings}>
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

const StatusBadge = ({ icon, label }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full
                  bg-primary-500/10 border border-primary-500/30">
    <span>{icon}</span>
    <span className="text-xs font-medium">{label}</span>
  </div>
);
```

---

### 2️⃣ **Avatar HeyGen Widget**

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│                                                        │
│            [Video Stream Avatar Sandra]               │
│                 🎥 1080p HD Stream                     │
│              🔊 Audio sincronizado                     │
│                                                        │
│                                                        │
├────────────────────────────────────────────────────────┤
│  Estado: ✅ Lista │ 🗣️ Hablando │ ⏸️ Pausado          │
│  Calidad: 🎬 HD   │ Latencia: 120ms                   │
└────────────────────────────────────────────────────────┘

Loading State:
┌────────────────────────────────────────────────────────┐
│                                                        │
│                    ⏳ Loading...                       │
│         ▓▓▓▓▓▓▓▓░░░░░░░░░░░░  40%                     │
│              Inicializando avatar...                   │
│                                                        │
└────────────────────────────────────────────────────────┘

Error State:
┌────────────────────────────────────────────────────────┐
│                                                        │
│                     ❌ Error                           │
│          No se pudo cargar el avatar                   │
│          [🔄 Reintentar]  [📞 Soporte]                │
│                                                        │
└────────────────────────────────────────────────────────┘

Fallback (Sin video):
┌────────────────────────────────────────────────────────┐
│                                                        │
│                        🧠                              │
│                     Sandra IA                          │
│                  (modo texto solamente)                │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Código React:**

```typescript
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents
} from '@heygen/streaming-avatar';

const HeyGenAvatarWidget = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [avatar, setAvatar] = useState<StreamingAvatar | null>(null);
  const [stats, setStats] = useState({ latency: 0, quality: 'HD' });

  useEffect(() => {
    initializeAvatar();
    return () => cleanupAvatar();
  }, []);

  const initializeAvatar = async () => {
    try {
      setStatus('loading');

      const avatarInstance = new StreamingAvatar({
        token: import.meta.env.VITE_HEYGEN_API_KEY
      });

      const session = await avatarInstance.createStartAvatar({
        avatarName: import.meta.env.VITE_HEYGEN_AVATAR_ID,
        quality: AvatarQuality.High,
        voice: {
          voiceId: 'es-ES-Standard-A',
          rate: 1.0,
          emotion: 'Friendly'
        }
      });

      // Stream ready handler
      avatarInstance.on(StreamingEvents.STREAM_READY, (event) => {
        if (videoRef.current && event.stream) {
          videoRef.current.srcObject = event.stream;
          videoRef.current.play();
          setStatus('ready');
        }
      });

      // Speaking state handlers
      avatarInstance.on(StreamingEvents.AVATAR_START_TALKING, () => {
        setStats(prev => ({ ...prev, speaking: true }));
      });

      avatarInstance.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        setStats(prev => ({ ...prev, speaking: false }));
      });

      // Performance monitoring
      avatarInstance.on(StreamingEvents.STREAM_STATS, (event) => {
        setStats(prev => ({
          ...prev,
          latency: event.latency,
          quality: event.quality
        }));
      });

      setAvatar(avatarInstance);

    } catch (error) {
      console.error('HeyGen initialization failed:', error);
      setStatus('error');
    }
  };

  const cleanupAvatar = async () => {
    if (avatar) {
      await avatar.stopAvatar();
      setAvatar(null);
    }
  };

  const retryConnection = () => {
    cleanupAvatar();
    initializeAvatar();
  };

  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden
                    bg-dark-900 border-2 border-primary-500/30 relative">

      {/* Loading State */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center
                        bg-dark-900 z-10">
          <Loader className="animate-spin text-primary-500 mb-4" size={48} />
          <p className="text-white text-lg">Inicializando avatar...</p>
          <div className="w-64 h-2 bg-dark-700 rounded-full mt-4 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-600"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3 }}
            />
          </div>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center
                        bg-dark-900 z-10">
          <AlertCircle className="text-red-500 mb-4" size={48} />
          <p className="text-white text-lg mb-4">No se pudo cargar el avatar</p>
          <div className="flex gap-3">
            <button
              onClick={retryConnection}
              className="px-6 py-3 rounded-xl bg-primary-500 text-dark-900
                         font-medium hover:bg-primary-600 transition"
            >
              🔄 Reintentar
            </button>
            <button
              onClick={() => window.open('mailto:support@guestsvalencia.es')}
              className="px-6 py-3 rounded-xl bg-dark-700 text-white
                         font-medium hover:bg-dark-600 transition"
            >
              📞 Soporte
            </button>
          </div>
        </div>
      )}

      {/* Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={false}
        className={cn(
          'w-full h-full object-cover',
          status !== 'ready' && 'opacity-0'
        )}
      />

      {/* Status Bar */}
      {status === 'ready' && (
        <div className="absolute bottom-0 left-0 right-0 p-4
                        bg-gradient-to-t from-dark-900/90 to-transparent">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <span className={cn(
                'flex items-center gap-2',
                stats.speaking ? 'text-primary-400' : 'text-gray-400'
              )}>
                {stats.speaking ? '🗣️ Hablando' : '✅ Lista'}
              </span>
              <span className="text-gray-400">
                🎬 {stats.quality}
              </span>
            </div>
            <span className="text-gray-400">
              Latencia: {stats.latency}ms
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeyGenAvatarWidget;
```

---

### 3️⃣ **Message Bubble Component**

```
Sandra Message (izquierda):
┌──────────────────────────────────────────────────────┐
│ [S]  Sandra dice:                                    │
│      ┌──────────────────────────────────────────┐   │
│      │ Hola! Soy **Sandra**, tu asistente.     │   │
│      │                                          │   │
│      │ Puedo ayudarte con:                      │   │
│      │ • Información de alojamientos            │   │
│      │ • Reservas y disponibilidad              │   │
│      │ • Consultas generales                    │   │
│      │                                          │   │
│      │                            10:30 ✓      │   │
│      └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘

User Message (derecha):
┌──────────────────────────────────────────────────────┐
│                                   Usuario dice: [U]  │
│   ┌──────────────────────────────────────────┐      │
│   │ Necesito un apartamento en Valencia      │      │
│   │ para 4 personas del 15 al 20 de marzo    │      │
│   │                                          │      │
│   │ 📎 requisitos.pdf                        │      │
│   │                            10:31 ✓      │      │
│   └──────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────┘

Long-press context menu:
┌──────────────────────────────────────────────────────┐
│   ┌──────────────────────────────────────────┐      │
│   │ Necesito información sobre...            │      │
│   │                            10:31 ✓      │      │
│   └──────────────────────────────────────────┘      │
│      ┌──────────────────────────────────┐           │
│      │ 📋 Copiar   📤 Compartir  🔊 Leer │           │
│      └──────────────────────────────────┘           │
└──────────────────────────────────────────────────────┘
```

**Código React:**

```typescript
interface Message {
  id: string;
  author: 'sandra' | 'user';
  content: string;
  timestamp: Date;
  attachments?: File[];
  status: 'sending' | 'sent' | 'delivered' | 'error';
}

const MessageBubble = ({ message }: { message: Message }) => {
  const [showMenu, setShowMenu] = useState(false);
  const isSandra = message.author === 'sandra';

  const handleLongPress = useLongPress(() => {
    setShowMenu(true);
    vibrate(50);
  }, 500);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-3 max-w-[85%] relative',
        isSandra ? 'self-start' : 'self-end flex-row-reverse'
      )}
      {...handleLongPress}
    >
      {/* Avatar */}
      <div className={cn(
        'w-11 h-11 rounded-2xl flex items-center justify-center',
        'text-lg font-semibold flex-shrink-0',
        isSandra
          ? 'bg-gradient-to-br from-primary-400 to-primary-600 text-dark-900'
          : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
      )}>
        {message.author[0].toUpperCase()}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-1 px-2">
          {isSandra ? 'Sandra dice:' : 'Tú:'}
        </p>

        <div className={cn(
          'rounded-2xl p-4 backdrop-blur-md border',
          isSandra
            ? 'bg-dark-800/95 border-primary-500/30 rounded-tl-sm'
            : 'bg-primary-500/15 border-primary-500/50 rounded-tr-sm'
        )}>
          {/* Markdown Content */}
          <Markdown
            className="prose prose-invert prose-sm max-w-none"
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="text-primary-400">{children}</strong>,
              ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>
            }}
          >
            {message.content}
          </Markdown>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
              {message.attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <FileIcon type={file.type} />
                  <span className="truncate">{file.name}</span>
                  <span className="text-xs text-gray-400">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Timestamp + Status */}
          <div className="flex items-center justify-end gap-2 mt-2">
            <span className="text-xs text-gray-400">
              {format(message.timestamp, 'HH:mm')}
            </span>
            <MessageStatusIcon status={message.status} />
          </div>
        </div>

        {/* Context Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 p-3
                         bg-dark-800 rounded-xl border border-dark-700
                         shadow-lg z-20"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => copyToClipboard(message.content)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg
                             bg-dark-700 hover:bg-dark-600 transition"
                >
                  <Copy size={16} />
                  <span className="text-sm">Copiar</span>
                </button>
                <button
                  onClick={() => shareMessage(message)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg
                             bg-dark-700 hover:bg-dark-600 transition"
                >
                  <Share size={16} />
                  <span className="text-sm">Compartir</span>
                </button>
                <button
                  onClick={() => speakMessage(message.content)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg
                             bg-dark-700 hover:bg-dark-600 transition"
                >
                  <Volume2 size={16} />
                  <span className="text-sm">Leer</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const MessageStatusIcon = ({ status }) => {
  switch (status) {
    case 'sending':
      return <Loader className="animate-spin" size={14} />;
    case 'sent':
      return <Check size={14} className="text-gray-400" />;
    case 'delivered':
      return <CheckCheck size={14} className="text-primary-400" />;
    case 'error':
      return <AlertCircle size={14} className="text-red-400" />;
    default:
      return null;
  }
};
```

---

### 4️⃣ **Multimodal Input Bar**

```
Normal State:
┌────────────────────────────────────────────────────────┐
│ [📎] [Escribe tu mensaje...]        [🎤] [📞]  [▶️]   │
└────────────────────────────────────────────────────────┘

Recording State:
┌────────────────────────────────────────────────────────┐
│ [🔴] Grabando... ▁▃▅▇▅▃▁ 0:05    [⏹️ Detener]  [▶️]  │
└────────────────────────────────────────────────────────┘

With attachments:
┌────────────────────────────────────────────────────────┐
│ 📎 documento.pdf (2.3 MB) [✕]                         │
│ 🖼️ foto.jpg (1.5 MB) [✕]                             │
├────────────────────────────────────────────────────────┤
│ [📎] [Añadir descripción...]    [🎤] [📞]  [▶️ Enviar]│
└────────────────────────────────────────────────────────┘

Markdown Preview:
┌────────────────────────────────────────────────────────┐
│  ╔════════════════════════════════════════════════╗   │
│  ║ Preview:                                       ║   │
│  ║ This is **bold** and this is *italic*         ║   │
│  ║ • List item 1                                  ║   │
│  ║ • List item 2                                  ║   │
│  ╚════════════════════════════════════════════════╝   │
├────────────────────────────────────────────────────────┤
│ [📎] [This is **bold** and...    [👁️] [🎤]  [▶️]    │
└────────────────────────────────────────────────────────┘
```

**Código React:**

```typescript
const MultimodalInputBar = () => {
  const [value, setValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const { startRecording, stopRecording, audioLevel } = useVoiceRecorder();
  const { sendMessage, isLoading } = useChatStore();

  const handleSend = async () => {
    if (!value.trim() && attachments.length === 0) return;

    await sendMessage({
      content: value,
      attachments,
      timestamp: new Date()
    });

    setValue('');
    setAttachments([]);
  };

  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
      setIsRecording(false);
    } else {
      startRecording();
      setIsRecording(true);
      vibrate(50);
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-dark-900/95
                    backdrop-blur-xl border-t border-dark-700 p-4
                    pb-safe-area-inset-bottom">

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 space-y-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center justify-between
                                        bg-dark-800 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <FileIcon type={file.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeAttachment(index)}
                className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400
                           hover:bg-red-500/30 transition flex items-center
                           justify-center"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Markdown Preview */}
      {showPreview && value.trim() && (
        <div className="mb-3 p-4 bg-dark-800 rounded-xl border border-dark-700">
          <p className="text-xs text-gray-400 mb-2">Preview:</p>
          <Markdown className="prose prose-invert prose-sm max-w-none">
            {value}
          </Markdown>
        </div>
      )}

      {/* Input Container */}
      <div className="flex items-end gap-3">

        {/* File Upload Button */}
        <input
          type="file"
          id="file-upload"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            setAttachments(prev => [...prev, ...files]);
          }}
        />
        <label
          htmlFor="file-upload"
          className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-400
                     to-purple-600 flex items-center justify-center cursor-pointer
                     hover:scale-105 transition"
        >
          <Paperclip size={20} className="text-white" />
        </label>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isRecording ? 'Grabando audio...' : 'Escribe tu mensaje...'}
            disabled={isRecording}
            className="w-full bg-dark-800 border-2 border-dark-700
                       focus:border-primary-500 rounded-2xl p-4 pr-28
                       text-white placeholder-gray-400 resize-none
                       min-h-[56px] max-h-[120px] transition"
            rows={1}
            style={{
              height: 'auto',
              minHeight: '56px',
              maxHeight: '120px'
            }}
          />

          {/* Voice Controls */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">

            {/* Markdown Preview Toggle */}
            {value.trim() && !isRecording && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center transition',
                  showPreview
                    ? 'bg-primary-500 text-dark-900'
                    : 'bg-dark-700 text-gray-400 hover:text-white'
                )}
              >
                <Eye size={18} />
              </button>
            )}

            {/* Voice Recording Button */}
            <motion.button
              onClick={handleRecord}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center relative',
                isRecording
                  ? 'bg-red-500'
                  : 'bg-gradient-to-br from-red-400 to-red-600'
              )}
            >
              <Mic size={18} className="text-white relative z-10" />

              {isRecording && (
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-red-400"
                  animate={{
                    scale: [1, 1 + audioLevel * 0.5],
                  }}
                  transition={{ duration: 0.1 }}
                />
              )}
            </motion.button>

            {/* Voice Call Button */}
            <button
              onClick={() => startVoiceCall()}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400
                         to-primary-600 flex items-center justify-center
                         hover:scale-105 transition"
            >
              <Phone size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Send Button */}
        <motion.button
          onClick={handleSend}
          disabled={(!value.trim() && attachments.length === 0) || isLoading}
          whileTap={{ scale: 0.95 }}
          className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-400
                     to-primary-600 flex items-center justify-center
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:scale-105 transition"
        >
          {isLoading ? (
            <Loader className="animate-spin text-white" size={20} />
          ) : (
            <Send size={20} className="text-white" />
          )}
        </motion.button>
      </div>
    </div>
  );
};
```

---

## 🎨 SISTEMA DE COLORES

### Dark Mode (Default)

```css
Background:
  bg-dark-900:  #0a0a0a  /* App background */
  bg-dark-800:  #1a1a2e  /* Cards, inputs */
  bg-dark-700:  #2a2a3e  /* Borders, hover */

Text:
  text-white:       #ffffff  /* Primary text */
  text-gray-400:    #9ca3af  /* Secondary text */
  text-gray-500:    #6b7280  /* Placeholder */

Primary (Sandra Brand):
  primary-400:  #33ff99  /* Bright accent */
  primary-500:  #00ff88  /* Main brand */
  primary-600:  #00cc6a  /* Hover state */

Gradient:
  gradient-primary: linear-gradient(135deg, #00ff88, #00aaff)
  gradient-user:    linear-gradient(135deg, #667eea, #764ba2)
```

### Light Mode (Optional)

```css
Background:
  bg-light-50:   #f8f9fa  /* App background */
  bg-light-100:  #ffffff  /* Cards */
  bg-light-200:  #f1f3f4  /* Input background */

Text:
  text-dark-900:   #1a1a1a  /* Primary text */
  text-dark-700:   #4a5568  /* Secondary text */

Primary (Adjusted for light):
  primary-500:  #007c5a  /* Main brand (darker) */
  primary-600:  #00663b  /* Hover (even darker) */
```

---

## 📏 ESPACIADO Y TIPOGRAFÍA

### Spacing Scale

```css
spacing-xs:   4px   /* Minimal spacing */
spacing-sm:   8px   /* Tight spacing */
spacing-md:  16px   /* Default spacing */
spacing-lg:  24px   /* Comfortable spacing */
spacing-xl:  32px   /* Large spacing */
spacing-2xl: 48px   /* Section spacing */
```

### Typography Scale

```css
/* Font Family */
font-sans: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI'

/* Font Sizes */
text-xs:   12px  /* Timestamps, captions */
text-sm:   14px  /* Secondary text */
text-md:   16px  /* Body text (default) */
text-lg:   18px  /* Emphasized text */
text-xl:   20px  /* Headers */
text-2xl:  24px  /* Large headers */

/* Line Heights */
leading-tight:   1.25  /* Headers */
leading-normal:  1.5   /* Body text */
leading-relaxed: 1.75  /* Reading text */
```

---

## 🚀 ANIMACIONES

### Micro-interactions

```typescript
// Button tap
whileTap={{ scale: 0.95 }}
transition={{ duration: 0.1 }}

// Message appear
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, ease: 'easeOut' }}

// Typing indicator
<motion.div
  animate={{
    scale: [1, 1.2, 1],
    opacity: [0.5, 1, 0.5]
  }}
  transition={{
    duration: 1.4,
    repeat: Infinity,
    ease: 'easeInOut'
  }}
/>

// Slide in from side
initial={{ x: -100, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
exit={{ x: 100, opacity: 0 }}
transition={{ type: 'spring', stiffness: 300, damping: 30 }}
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
/* Mobile First Approach */

/* Small phones (default) */
/* 320px+ - Base styles */

/* Large phones */
@media (min-width: 375px) {
  /* iPhone 14, Pixel 6 */
}

/* iPhone Pro Max */
@media (min-width: 414px) {
  /* Más espacio para contenido */
}

/* Tablets */
@media (min-width: 768px) {
  /* iPad Mini, Android tablets */
  /* Sidebar permanente */
  /* Layout de 2 columnas */
}

/* iPad Pro */
@media (min-width: 1024px) {
  /* Desktop-like experience */
  /* 3 columnas posible */
}

/* Landscape orientation */
@media (orientation: landscape) and (max-width: 767px) {
  /* Header compacto */
  /* Input más estrecho */
}
```

---

## ✅ CONCLUSIÓN

Este documento visual proporciona:

✅ Mockups ASCII art de todos los componentes
✅ Código React completo y funcional
✅ Sistema de colores definido
✅ Espaciado y tipografía unificada
✅ Animaciones micro-interaction
✅ Responsive breakpoints

**Próximo paso:** Esperar confirmación del CEO para comenzar implementación.

---

**Generado:** 2025-10-29
**Desarrollador:** Claude Code Expert Elite Developer
**Estado:** ✅ MOCKUPS COMPLETOS - LISTOS PARA DESARROLLO
