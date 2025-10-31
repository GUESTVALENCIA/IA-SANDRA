// Sandra DevConsole - Utility Functions
class SandraUtils {
    static formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static formatDateTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    static timeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
        if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        return 'ahora mismo';
    }

    static generateId(prefix = '') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
    }

    static debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static copyToClipboard(text) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            return new Promise((resolve, reject) => {
                try {
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    resolve();
                } catch (err) {
                    document.body.removeChild(textArea);
                    reject(err);
                }
            });
        }
    }

    static downloadFile(content, filename, contentType = 'text/plain') {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    static downloadJSON(data, filename) {
        const jsonString = JSON.stringify(data, null, 2);
        this.downloadFile(jsonString, filename, 'application/json');
    }

    static parseJSON(str, fallback = null) {
        try {
            return JSON.parse(str);
        } catch (error) {
            console.warn('Failed to parse JSON:', error);
            return fallback;
        }
    }

    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    static sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    static escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    static capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static camelToKebab(str) {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    }

    static kebabToCamel(str) {
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }

    static truncateText(text, maxLength, suffix = '...') {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength - suffix.length) + suffix;
    }

    static hashCode(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }

    static colorFromString(str) {
        const hash = this.hashCode(str);
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 50%)`;
    }

    static getDeviceInfo() {
        const ua = navigator.userAgent;
        return {
            platform: navigator.platform,
            userAgent: ua,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screen: {
                width: screen.width,
                height: screen.height,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight,
                colorDepth: screen.colorDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    }

    static detectBrowser() {
        const ua = navigator.userAgent;

        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Chrome') && !ua.includes('Chromium')) return 'Chrome';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        if (ua.includes('Opera')) return 'Opera';

        return 'Unknown';
    }

    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    static isElectron() {
        return typeof window !== 'undefined' && window.require;
    }

    static getRandomFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    static groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = (typeof key === 'function') ? key(item) : item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    }

    static sortBy(array, key, direction = 'asc') {
        return array.sort((a, b) => {
            const aVal = (typeof key === 'function') ? key(a) : a[key];
            const bVal = (typeof key === 'function') ? key(b) : b[key];

            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (obj instanceof Object) {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    static deepMerge(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();

        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return this.deepMerge(target, ...sources);
    }

    static isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    static isEmpty(value) {
        if (value == null) return true;
        if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }

    static retry(fn, maxAttempts = 3, delay = 1000) {
        return new Promise((resolve, reject) => {
            let attempts = 0;

            const attempt = () => {
                attempts++;
                Promise.resolve(fn())
                    .then(resolve)
                    .catch(error => {
                        if (attempts >= maxAttempts) {
                            reject(error);
                        } else {
                            setTimeout(attempt, delay * attempts);
                        }
                    });
            };

            attempt();
        });
    }

    static createWorker(fn) {
        const blob = new Blob([`(${fn.toString()})()`], { type: 'application/javascript' });
        return new Worker(URL.createObjectURL(blob));
    }

    static addEventListener(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);

        // Return cleanup function
        return () => {
            element.removeEventListener(event, handler, options);
        };
    }

    static createElement(tag, options = {}) {
        const element = document.createElement(tag);

        if (options.className) element.className = options.className;
        if (options.id) element.id = options.id;
        if (options.innerHTML) element.innerHTML = options.innerHTML;
        if (options.textContent) element.textContent = options.textContent;

        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }

        if (options.styles) {
            Object.entries(options.styles).forEach(([key, value]) => {
                element.style[key] = value;
            });
        }

        if (options.events) {
            Object.entries(options.events).forEach(([event, handler]) => {
                element.addEventListener(event, handler);
            });
        }

        return element;
    }

    static loadScript(src, async = true) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = async;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    static loadCSS(href) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }

    static storage = {
        get(key, fallback = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : fallback;
            } catch (error) {
                console.warn('Failed to get from storage:', error);
                return fallback;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.warn('Failed to set storage:', error);
                return false;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn('Failed to remove from storage:', error);
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.warn('Failed to clear storage:', error);
                return false;
            }
        }
    };

    static performance = {
        mark(name) {
            if (window.performance && performance.mark) {
                performance.mark(name);
            }
        },

        measure(name, startMark, endMark) {
            if (window.performance && performance.measure) {
                performance.measure(name, startMark, endMark);
                const entries = performance.getEntriesByName(name, 'measure');
                return entries[entries.length - 1];
            }
            return null;
        },

        time(label) {
            console.time(label);
        },

        timeEnd(label) {
            console.timeEnd(label);
        }
    };

    static logger = {
        log(...args) {
            console.log('[Sandra]', ...args);
        },

        info(...args) {
            console.info('[Sandra]', ...args);
        },

        warn(...args) {
            console.warn('[Sandra]', ...args);
        },

        error(...args) {
            console.error('[Sandra]', ...args);
        },

        debug(...args) {
            if (window.sandraDebug) {
                console.debug('[Sandra Debug]', ...args);
            }
        }
    };
}

// Global utility functions for convenience
window.utils = SandraUtils;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SandraUtils };
}