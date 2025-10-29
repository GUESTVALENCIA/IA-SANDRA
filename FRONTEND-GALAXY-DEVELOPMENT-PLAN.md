# 📱 SANDRA IA 7.0 - FRONTEND GALAXY LEVEL PRO ENTERPRISE
## Plan de Desarrollo Profesional App Móvil PWA

**Fecha:** 2025-10-29
**CEO:** Clayton Thomas
**Desarrollador:** Claude Code (Expert Elite)
**Nivel:** Galaxy Level Enterprise Professional
**Estado:** INICIO DE DESARROLLO

---

## 🎯 OBJETIVO PRINCIPAL

Crear un frontend **profesional de nivel Apple/Google** para Sandra IA 7.0, con:

1. **UI/UX Galaxy Level** - Diseño moderno, elegante y funcional
2. **Performance Enterprise** - <2s carga, 60 FPS constante
3. **Responsive Premium** - iPhone SE hasta iPad Pro perfecto
4. **Accesibilidad AA** - WCAG 2.1 completo
5. **Experiencia nativa** - PWA optimizada iOS + Android

---

## 📊 ANÁLISIS ESTADO ACTUAL

### ✅ **LO QUE FUNCIONA:**

#### Backend Robusto (100% operativo)
```
Sandra IA Core System
├── 248 agentes especializados activos
├── Cartesia TTS configurado (CARTESIA_API_KEY)
├── Guardian Protocol operativo
├── Sistema de memoria persistente
├── Error recovery automático
├── WebSocket infrastructure ready
└── Performance monitoring 24/7
```

#### Credenciales Disponibles (EXAMPLE)
```env
# ⚠️ Use placeholder values only. Set actual credentials in Netlify Dashboard
HEYGEN_API_KEY=YOUR_HEYGEN_API_KEY_HERE
HEYGEN_AVATAR_ID=YOUR_HEYGEN_AVATAR_ID_HERE
CARTESIA_API_KEY=sk_car_YOUR_CARTESIA_KEY_HERE
CARTESIA_VOICE_ID=YOUR_VOICE_ID_HERE
GROQ_API_KEY=gsk_YOUR_GROQ_API_KEY_HERE
NETLIFY_SITE_ID=YOUR_NETLIFY_SITE_ID_HERE
```

#### PWA Infrastructure Ready
```
✅ Service Worker funcional (sw.js)
✅ Manifest.json configurado
✅ Netlify deployment pipeline
✅ Offline support implementado
✅ Safe Areas iOS configuradas
✅ Touch gestures implementados
```

### ⚠️ **LO QUE NECESITA MEJORA:**

#### 1. Arquitectura de Componentes
**Problema:** HTML monolítico de 2100+ líneas
**Solución:** Componentización React modular

```
Actual: sandra-ia-mobile-galaxy.html (2100 líneas)
Objetivo:
  ├── components/
  │   ├── Chat/
  │   │   ├── MessageBubble.tsx
  │   │   ├── ChatContainer.tsx
  │   │   └── TypingIndicator.tsx
  │   ├── Input/
  │   │   ├── MultimodalInput.tsx
  │   │   ├── VoiceRecorder.tsx
  │   │   └── FileUploader.tsx
  │   ├── Avatar/
  │   │   ├── HeyGenAvatar.tsx
  │   │   └── AvatarFallback.tsx
  │   └── UI/
  │       ├── Button.tsx
  │       ├── Card.tsx
  │       └── Toast.tsx
```

#### 2. Sistema de Diseño
**Problema:** CSS inline de 870+ líneas mezclado
**Solución:** Tailwind CSS + Design Tokens

```css
/* Actual: Variables CSS custom dispersas */
:root {
  --bg-primary: #0a0a0a;
  --text-accent: #00ff88;
  /* ... 50+ variables más */
}

/* Objetivo: Sistema unificado */
Design Tokens (JSON)
├── colors.json
├── spacing.json
├── typography.json
├── breakpoints.json
└── animations.json

Tailwind Config → Consume tokens
Components → Use Tailwind classes
```

#### 3. Barra de Entrada Multimodal
**Problema:** Input básico sin feedback visual profesional
**Solución:** Componente Galaxy Level con estados

```typescript
<MultimodalInput>
  ├── TextInput (Markdown preview)
  ├── VoiceButton (waveform animation)
  ├── CameraButton (face detection)
  ├── PDFUploadButton (drag & drop)
  ├── RecordingIndicator (pulsating)
  └── SendButton (loading state)
</MultimodalInput>
```

#### 4. Integración Avatar HeyGen
**Problema:** Archivo separado sin integración fluida
**Solución:** Widget embebido con fallback

```typescript
<AvatarWidget>
  ├── HeyGenStream (video principal)
  ├── AudioSync (sincronización TTS)
  ├── LoadingState (skeleton)
  ├── ErrorBoundary (fallback a icono)
  └── ResponsiveContainer (mobile/tablet/desktop)
</AvatarWidget>
```

#### 5. Performance Optimization
**Problema:** Sin code splitting ni lazy loading
**Solución:** Webpack optimization + React.lazy

```javascript
// Actual: Todo carga a la vez
import Everything from './everything';

// Objetivo: Lazy loading estratégico
const HeyGenAvatar = React.lazy(() => import('./Avatar/HeyGen'));
const VoiceRecorder = React.lazy(() => import('./Input/Voice'));
const FileUploader = React.lazy(() => import('./Input/FileUpload'));
```

---

## 🏗️ ARQUITECTURA PROPUESTA

### Stack Tecnológico

```yaml
Framework: React 18 + TypeScript
Styling: Tailwind CSS 3.4
Build: Vite (fast HMR, tree-shaking)
State: Zustand (lightweight, <1KB)
Forms: React Hook Form
Validation: Zod
Icons: Lucide React
Animations: Framer Motion
Testing: Vitest + Playwright
Deployment: Netlify
```

### Estructura de Carpetas

```
src/
├── components/
│   ├── chat/
│   │   ├── ChatContainer.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageList.tsx
│   │   └── TypingIndicator.tsx
│   ├── input/
│   │   ├── MultimodalInput.tsx
│   │   ├── VoiceRecorder.tsx
│   │   ├── CameraCapture.tsx
│   │   └── FileUploader.tsx
│   ├── avatar/
│   │   ├── HeyGenAvatar.tsx
│   │   ├── AvatarFallback.tsx
│   │   └── SyncIndicator.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Toast.tsx
│       └── Modal.tsx
├── hooks/
│   ├── useVoiceRecognition.ts
│   ├── useWebSocket.ts
│   ├── useMediaDevices.ts
│   └── usePerformance.ts
├── stores/
│   ├── chatStore.ts
│   ├── settingsStore.ts
│   └── avatarStore.ts
├── services/
│   ├── api/
│   │   ├── sandra.ts
│   │   ├── heygen.ts
│   │   └── cartesia.ts
│   └── websocket/
│       ├── connection.ts
│       └── handlers.ts
├── utils/
│   ├── format.ts
│   ├── validation.ts
│   └── performance.ts
├── styles/
│   ├── tailwind.config.js
│   ├── design-tokens.json
│   └── global.css
└── types/
    ├── chat.ts
    ├── avatar.ts
    └── api.ts
```

---

## 🎨 SISTEMA DE DISEÑO

### Design Tokens

```json
{
  "colors": {
    "primary": {
      "50": "#e6fff5",
      "100": "#b3ffe0",
      "500": "#00ff88",
      "900": "#00663b"
    },
    "dark": {
      "900": "#0a0a0a",
      "800": "#1a1a2e",
      "700": "#2a2a3e"
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px"
  },
  "typography": {
    "fontFamily": {
      "sans": "SF Pro Display, -apple-system, system-ui"
    },
    "fontSize": {
      "xs": "12px",
      "sm": "14px",
      "md": "16px",
      "lg": "18px",
      "xl": "20px"
    }
  },
  "shadows": {
    "sm": "0 2px 4px rgba(0,0,0,0.1)",
    "md": "0 4px 8px rgba(0,0,0,0.2)",
    "lg": "0 8px 16px rgba(0,0,0,0.3)"
  },
  "animations": {
    "duration": {
      "fast": "150ms",
      "normal": "300ms",
      "slow": "500ms"
    }
  }
}
```

### Componentes UI Base

#### Button Component
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// Tailwind classes
const variants = {
  primary: 'bg-primary-500 text-dark-900 hover:bg-primary-600',
  secondary: 'bg-dark-700 text-white hover:bg-dark-600',
  ghost: 'bg-transparent text-primary-500 hover:bg-primary-50'
};

const sizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-md',
  lg: 'px-6 py-4 text-lg'
};
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### FASE 1: Setup & Fundamentos (Día 1-2)

#### 1.1 Configuración del Proyecto
```bash
# Crear estructura React + TypeScript
npm create vite@latest sandra-mobile -- --template react-ts

# Instalar dependencias
npm install \
  @heygen/streaming-avatar \
  livekit-client \
  zustand \
  react-hook-form \
  zod \
  framer-motion \
  lucide-react \
  @radix-ui/react-dialog \
  @radix-ui/react-toast

# Tailwind CSS setup
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 1.2 Configurar Design Tokens
```javascript
// tailwind.config.js
import tokens from './src/styles/design-tokens.json';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: tokens.colors,
      spacing: tokens.spacing,
      fontSize: tokens.typography.fontSize,
      fontFamily: tokens.typography.fontFamily,
      boxShadow: tokens.shadows
    }
  }
};
```

#### 1.3 Crear Componentes Base UI
- [ ] Button.tsx
- [ ] Card.tsx
- [ ] Input.tsx
- [ ] Toast.tsx
- [ ] Modal.tsx
- [ ] Skeleton.tsx

---

### FASE 2: Chat Interface (Día 3-4)

#### 2.1 Sistema de Mensajes
```typescript
// MessageBubble.tsx
interface Message {
  id: string;
  author: 'sandra' | 'user';
  content: string;
  timestamp: Date;
  attachments?: File[];
  status: 'sending' | 'sent' | 'error';
}

const MessageBubble = ({ message }: { message: Message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-3 max-w-[85%]',
        message.author === 'user' ? 'self-end flex-row-reverse' : 'self-start'
      )}
    >
      <Avatar author={message.author} />
      <div className={cn(
        'rounded-2xl p-4 backdrop-blur-md',
        message.author === 'sandra'
          ? 'bg-dark-800/95 border border-primary-500/30'
          : 'bg-primary-500/15 border border-primary-500/50'
      )}>
        <Markdown>{message.content}</Markdown>
        <span className="text-xs opacity-60">
          {format(message.timestamp, 'HH:mm')}
        </span>
      </div>
    </motion.div>
  );
};
```

#### 2.2 Chat Container con Scroll Virtual
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const ChatContainer = () => {
  const messagesRef = useRef<HTMLDivElement>(null);
  const { messages } = useChatStore();

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => messagesRef.current,
    estimateSize: () => 100,
    overscan: 5
  });

  return (
    <div ref={messagesRef} className="flex-1 overflow-y-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <MessageBubble message={messages[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

### FASE 3: Barra Multimodal (Día 5-6)

#### 3.1 Input de Texto con Markdown Preview
```typescript
const TextInput = () => {
  const [value, setValue] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Habla con Sandra..."
        className="w-full rounded-2xl bg-dark-800 border-2 border-dark-700
                   focus:border-primary-500 p-4 pr-20 resize-none
                   min-h-[56px] max-h-[120px]"
      />

      {showPreview && (
        <div className="absolute bottom-full mb-2 w-full
                        bg-dark-800 rounded-xl p-4 border border-dark-700">
          <Markdown>{value}</Markdown>
        </div>
      )}

      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
        <button onClick={() => setShowPreview(!showPreview)}>
          <Eye size={20} />
        </button>
      </div>
    </div>
  );
};
```

#### 3.2 Grabadora de Voz con Waveform
```typescript
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

const VoiceRecorder = () => {
  const { isRecording, audioLevel, start, stop } = useVoiceRecorder();

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={cn(
        'w-11 h-11 rounded-xl flex items-center justify-center',
        isRecording
          ? 'bg-red-500 animate-pulse'
          : 'bg-gradient-to-br from-red-400 to-red-600'
      )}
      onClick={isRecording ? stop : start}
    >
      <Mic size={20} className="text-white" />

      {isRecording && (
        <div className="absolute -inset-1 rounded-xl">
          <div
            className="w-full h-full rounded-xl border-2 border-red-400"
            style={{
              transform: `scale(${1 + audioLevel * 0.5})`,
              transition: 'transform 50ms'
            }}
          />
        </div>
      )}
    </motion.button>
  );
};
```

#### 3.3 Camera Capture + PDF Upload
```typescript
const FileUploader = () => {
  const [files, setFiles] = useState<File[]>([]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
      'video/*': ['.mp4', '.webm']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => setFiles(prev => [...prev, ...acceptedFiles])
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'w-11 h-11 rounded-xl flex items-center justify-center',
        'bg-gradient-to-br from-purple-400 to-purple-600',
        'cursor-pointer hover:scale-105 transition-transform',
        isDragActive && 'scale-110 ring-2 ring-purple-400'
      )}
    >
      <input {...getInputProps()} />
      <Paperclip size={20} className="text-white" />
    </div>
  );
};
```

---

### FASE 4: Avatar HeyGen (Día 7-8)

#### 4.1 HeyGen Streaming Component
```typescript
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents
} from '@heygen/streaming-avatar';

const HeyGenAvatar = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [avatar, setAvatar] = useState<StreamingAvatar | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  useEffect(() => {
    initializeAvatar();
    return () => avatar?.stopAvatar();
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
        voice: { voiceId: 'es-ES-Standard-A' }
      });

      avatarInstance.on(StreamingEvents.STREAM_READY, (event) => {
        if (videoRef.current && event.stream) {
          videoRef.current.srcObject = event.stream;
          setStatus('ready');
        }
      });

      avatarInstance.on(StreamingEvents.AVATAR_START_TALKING, () => {
        // Animate avatar border or add visual feedback
      });

      setAvatar(avatarInstance);

    } catch (error) {
      console.error('HeyGen initialization failed:', error);
      setStatus('error');
    }
  };

  const speak = async (text: string) => {
    if (!avatar) return;
    await avatar.speak({ text });
  };

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden
                    bg-dark-900 border-2 border-primary-500/30">
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader className="animate-spin text-primary-500" size={48} />
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto text-red-500" size={48} />
            <p className="mt-2 text-white">Error cargando avatar</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={cn(
          'w-full h-full object-cover',
          status !== 'ready' && 'opacity-0'
        )}
      />
    </div>
  );
};
```

---

### FASE 5: Performance & Optimización (Día 9-10)

#### 5.1 Code Splitting
```typescript
// Lazy load pesados components
const HeyGenAvatar = lazy(() => import('./components/avatar/HeyGen'));
const VoiceRecorder = lazy(() => import('./components/input/VoiceRecorder'));

const App = () => (
  <Suspense fallback={<Skeleton />}>
    <Routes>
      <Route path="/" element={<ChatContainer />} />
      <Route path="/avatar" element={<HeyGenAvatar />} />
    </Routes>
  </Suspense>
);
```

#### 5.2 Image Optimization
```typescript
// Use WebP with fallback
const Avatar = ({ src }: { src: string }) => (
  <picture>
    <source srcSet={`${src}.webp`} type="image/webp" />
    <source srcSet={`${src}.jpg`} type="image/jpeg" />
    <img src={`${src}.jpg`} alt="Avatar" loading="lazy" />
  </picture>
);
```

#### 5.3 Bundle Analysis
```bash
npm run build
npx vite-bundle-visualizer

# Objetivo:
# - Initial bundle: <100KB
# - Total bundle: <250KB
# - Lazy chunks: <50KB cada uno
```

---

### FASE 6: Testing & Accessibility (Día 11-12)

#### 6.1 Unit Tests (Vitest)
```typescript
describe('MessageBubble', () => {
  it('renders user message correctly', () => {
    const message = {
      id: '1',
      author: 'user',
      content: 'Hello Sandra',
      timestamp: new Date(),
      status: 'sent'
    };

    render(<MessageBubble message={message} />);

    expect(screen.getByText('Hello Sandra')).toBeInTheDocument();
    expect(screen.getByRole('article')).toHaveClass('self-end');
  });

  it('handles markdown formatting', () => {
    const message = {
      id: '2',
      author: 'sandra',
      content: '**Bold** and *italic*',
      timestamp: new Date(),
      status: 'sent'
    };

    render(<MessageBubble message={message} />);

    expect(screen.getByText('Bold')).toHaveStyle({ fontWeight: 'bold' });
  });
});
```

#### 6.2 E2E Tests (Playwright)
```typescript
test('complete chat flow', async ({ page }) => {
  await page.goto('https://sandra.guestsvalencia.es');

  // Wait for app to load
  await page.waitForSelector('[data-testid="chat-input"]');

  // Type message
  await page.fill('[data-testid="chat-input"]', 'Hola Sandra');

  // Send message
  await page.click('[data-testid="send-button"]');

  // Wait for Sandra's response
  await page.waitForSelector('[data-testid="message-sandra"]', { timeout: 5000 });

  // Verify response appears
  const response = await page.textContent('[data-testid="message-sandra"]');
  expect(response).toBeTruthy();
});
```

#### 6.3 Accessibility Audit
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('chat interface is accessible', async () => {
  const { container } = render(<ChatContainer />);
  const results = await axe(container);

  expect(results).toHaveNoViolations();
});

// Manual checklist:
// ✅ All interactive elements have focus states
// ✅ Color contrast ratio > 4.5:1
// ✅ ARIA labels on all buttons
// ✅ Keyboard navigation works (Tab, Enter, Esc)
// ✅ Screen reader announces messages correctly
```

---

## 📋 CHECKLIST DE ENTREGABLES

### Componentes React (12 archivos)

- [ ] `Button.tsx` - Botón reutilizable con variants
- [ ] `Card.tsx` - Contenedor con shadow y border
- [ ] `Toast.tsx` - Notificaciones temporales
- [ ] `Modal.tsx` - Dialog overlay
- [ ] `MessageBubble.tsx` - Burbuja de mensaje
- [ ] `ChatContainer.tsx` - Contenedor principal chat
- [ ] `MultimodalInput.tsx` - Input texto + voz + archivos
- [ ] `VoiceRecorder.tsx` - Grabadora de voz
- [ ] `FileUploader.tsx` - Upload de archivos
- [ ] `HeyGenAvatar.tsx` - Video streaming avatar
- [ ] `Header.tsx` - Barra superior
- [ ] `Sidebar.tsx` - Panel lateral

### Estilos & Design

- [ ] `design-tokens.json` - Tokens de diseño
- [ ] `tailwind.config.js` - Configuración Tailwind
- [ ] `global.css` - Estilos globales
- [ ] Dark mode implementation

### Testing

- [ ] 10+ unit tests (Vitest)
- [ ] 5+ E2E tests (Playwright)
- [ ] Accessibility audit report
- [ ] Performance benchmark report

### Documentación

- [ ] `COMPONENTS.md` - Documentación de componentes
- [ ] `DESIGN-SYSTEM.md` - Guía del sistema de diseño
- [ ] `TESTING-GUIDE.md` - Guía de testing
- [ ] `PERFORMANCE-REPORT.md` - Reporte de performance

---

## 🎯 MÉTRICAS DE ÉXITO

### Performance (Lighthouse)

```yaml
Target Metrics:
  Performance: ≥90
  Accessibility: ≥95
  Best Practices: ≥95
  SEO: ≥100

Web Vitals:
  LCP (Largest Contentful Paint): <2.5s
  FID (First Input Delay): <100ms
  CLS (Cumulative Layout Shift): <0.1

Bundle Size:
  Initial: <100KB gzipped
  Total: <250KB gzipped
  Lazy chunks: <50KB each
```

### User Experience

```yaml
Responsive:
  ✅ iPhone SE (375px) - Perfect layout
  ✅ iPhone 14 Pro (393px) - Optimized
  ✅ iPad Mini (768px) - Tablet view
  ✅ iPad Pro (1024px) - Desktop-like

Accessibility:
  ✅ WCAG 2.1 Level AA compliant
  ✅ Screen reader compatible
  ✅ Keyboard navigation complete
  ✅ High contrast mode support

Performance:
  ✅ 60 FPS smooth scrolling
  ✅ <300ms interaction response
  ✅ Instant feedback on all actions
```

---

## 🚀 SIGUIENTE PASO INMEDIATO

**CEO, por favor confirma:**

1. ¿Procedo con FASE 1 (Setup React + TypeScript)?
2. ¿Prefieres mantener HTML actual o migrar a React completamente?
3. ¿Qué prioridad: Avatar HeyGen primero o Input multimodal?

**Esperando instrucciones para comenzar desarrollo Galaxy Level.**

---

**Generado:** 2025-10-29
**Estado:** ✅ PLAN COMPLETO - LISTO PARA EJECUCIÓN
**Modelo:** Claude Code Expert Elite Developer
