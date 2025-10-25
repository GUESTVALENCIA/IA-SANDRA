/**
 * Sandra IA Mobile - Responsive Utilities
 * Galaxy Level Responsive System for All Device Types
 *
 * This utility provides device detection, screen size management,
 * and adaptive UI logic for optimal user experience across all devices.
 */

class ResponsiveUtils {
    constructor() {
        this.breakpoints = {
            // Phone sizes
            xs: 320,  // iPhone SE, small Android
            sm: 375,  // iPhone 12/13/14 standard
            md: 414,  // iPhone Pro Max, large Android
            lg: 480,  // Extra large phones

            // Tablet sizes
            tablet: 768,   // iPad standard
            tabletLg: 1024, // iPad Pro

            // Desktop (for completeness)
            desktop: 1200,
            wide: 1440
        };

        this.deviceTypes = {
            PHONE_SMALL: 'phone-small',
            PHONE_STANDARD: 'phone-standard',
            PHONE_LARGE: 'phone-large',
            PHONE_XLARGE: 'phone-xlarge',
            TABLET: 'tablet',
            TABLET_LARGE: 'tablet-large',
            DESKTOP: 'desktop',
            FOLDABLE: 'foldable'
        };

        this.orientations = {
            PORTRAIT: 'portrait',
            LANDSCAPE: 'landscape'
        };

        this.currentDevice = null;
        this.currentOrientation = null;
        this.callbacks = [];

        this.init();
    }

    init() {
        this.detectDevice();
        this.setupEventListeners();
        this.applyDeviceClasses();
        this.setupViewportMeta();
    }

    /**
     * Detect current device type based on screen dimensions
     */
    detectDevice() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const orientation = width > height ? this.orientations.LANDSCAPE : this.orientations.PORTRAIT;

        // Special case for foldable devices
        if (this.isFoldableDevice()) {
            this.currentDevice = this.deviceTypes.FOLDABLE;
            this.currentOrientation = orientation;
            return;
        }

        // Determine device type by width
        if (width < this.breakpoints.xs) {
            this.currentDevice = this.deviceTypes.PHONE_SMALL;
        } else if (width < this.breakpoints.sm) {
            this.currentDevice = this.deviceTypes.PHONE_SMALL;
        } else if (width < this.breakpoints.md) {
            this.currentDevice = this.deviceTypes.PHONE_STANDARD;
        } else if (width < this.breakpoints.lg) {
            this.currentDevice = this.deviceTypes.PHONE_LARGE;
        } else if (width < this.breakpoints.tablet) {
            this.currentDevice = this.deviceTypes.PHONE_XLARGE;
        } else if (width < this.breakpoints.tabletLg) {
            this.currentDevice = this.deviceTypes.TABLET;
        } else if (width < this.breakpoints.desktop) {
            this.currentDevice = this.deviceTypes.TABLET_LARGE;
        } else {
            this.currentDevice = this.deviceTypes.DESKTOP;
        }

        this.currentOrientation = orientation;
    }

    /**
     * Detect foldable devices (Galaxy Fold, etc.)
     */
    isFoldableDevice() {
        // Galaxy Fold detection
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Common foldable dimensions when unfolded
        const foldableWidths = [280, 320, 512, 673, 717, 768, 884];
        const foldableHeights = [653, 717, 768, 832, 854, 1024, 1138];

        // Check if dimensions match common foldable patterns
        const isFoldableWidth = foldableWidths.some(w => Math.abs(width - w) < 10);
        const isFoldableHeight = foldableHeights.some(h => Math.abs(height - h) < 10);

        // Also check for unusual aspect ratios that might indicate folding
        const aspectRatio = width / height;
        const isFoldableRatio = aspectRatio > 2 || aspectRatio < 0.5;

        return (isFoldableWidth && isFoldableHeight) || isFoldableRatio;
    }

    /**
     * Setup event listeners for responsive changes
     */
    setupEventListeners() {
        let resizeTimeout;

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const oldDevice = this.currentDevice;
                const oldOrientation = this.currentOrientation;

                this.detectDevice();
                this.applyDeviceClasses();

                // Trigger callbacks if device or orientation changed
                if (oldDevice !== this.currentDevice || oldOrientation !== this.currentOrientation) {
                    this.triggerCallbacks({
                        oldDevice,
                        newDevice: this.currentDevice,
                        oldOrientation,
                        newOrientation: this.currentOrientation
                    });
                }
            }, 250);
        });

        // Handle orientation change specifically
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.detectDevice();
                this.applyDeviceClasses();
                this.adjustForOrientation();
            }, 300); // Allow time for orientation change to complete
        });

        // Handle device motion for folding detection
        if ('DeviceOrientationEvent' in window) {
            window.addEventListener('deviceorientation', this.handleDeviceOrientation.bind(this));
        }
    }

    /**
     * Apply CSS classes based on current device type
     */
    applyDeviceClasses() {
        const body = document.body;

        // Remove all device classes
        Object.values(this.deviceTypes).forEach(type => {
            body.classList.remove(`device-${type}`);
        });

        // Remove orientation classes
        Object.values(this.orientations).forEach(orientation => {
            body.classList.remove(`orientation-${orientation}`);
        });

        // Add current device and orientation classes
        body.classList.add(`device-${this.currentDevice}`);
        body.classList.add(`orientation-${this.currentOrientation}`);

        // Add screen size class
        body.classList.add(`screen-${this.getScreenSizeCategory()}`);
    }

    /**
     * Get screen size category for styling
     */
    getScreenSizeCategory() {
        const width = window.innerWidth;

        if (width < this.breakpoints.sm) return 'xs';
        if (width < this.breakpoints.md) return 'sm';
        if (width < this.breakpoints.lg) return 'md';
        if (width < this.breakpoints.tablet) return 'lg';
        if (width < this.breakpoints.tabletLg) return 'tablet';
        if (width < this.breakpoints.desktop) return 'tablet-lg';
        return 'desktop';
    }

    /**
     * Setup viewport meta tag for optimal mobile display
     */
    setupViewportMeta() {
        let viewport = document.querySelector('meta[name="viewport"]');

        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }

        let content = 'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover';

        // Adjust for different device types
        switch (this.currentDevice) {
            case this.deviceTypes.PHONE_SMALL:
                content += ', maximum-scale=1.0';
                break;
            case this.deviceTypes.TABLET:
            case this.deviceTypes.TABLET_LARGE:
                content = 'width=device-width, initial-scale=1.0, user-scalable=yes, viewport-fit=cover';
                break;
            case this.deviceTypes.FOLDABLE:
                content += ', minimum-scale=0.5, maximum-scale=2.0';
                break;
        }

        viewport.content = content;
    }

    /**
     * Handle device orientation events for advanced folding detection
     */
    handleDeviceOrientation(event) {
        // This can be used for detecting folding states in advanced foldable devices
        // Currently just logs for debugging - can be extended for specific foldable handling
        if (this.currentDevice === this.deviceTypes.FOLDABLE) {
            console.log('Foldable device orientation:', {
                alpha: event.alpha,
                beta: event.beta,
                gamma: event.gamma
            });
        }
    }

    /**
     * Adjust UI elements for orientation changes
     */
    adjustForOrientation() {
        const isLandscape = this.currentOrientation === this.orientations.LANDSCAPE;

        // Adjust for landscape mode on phones
        if (this.isPhone() && isLandscape) {
            this.adjustLandscapeMode();
        } else if (this.isPhone() && !isLandscape) {
            this.adjustPortraitMode();
        }
    }

    /**
     * Optimize UI for landscape mode on phones
     */
    adjustLandscapeMode() {
        // Reduce header height in landscape
        document.documentElement.style.setProperty('--header-height-landscape', '44px');

        // Adjust chat message spacing
        document.documentElement.style.setProperty('--message-spacing-landscape', '8px');

        // Compact status bar items
        document.documentElement.style.setProperty('--status-item-padding-landscape', '4px 8px');
    }

    /**
     * Restore UI for portrait mode on phones
     */
    adjustPortraitMode() {
        // Reset to standard values
        document.documentElement.style.removeProperty('--header-height-landscape');
        document.documentElement.style.removeProperty('--message-spacing-landscape');
        document.documentElement.style.removeProperty('--status-item-padding-landscape');
    }

    /**
     * Get responsive values based on current device
     */
    getResponsiveValue(values) {
        const deviceKey = this.currentDevice.replace('-', '_').toUpperCase();

        if (values[deviceKey]) {
            return values[deviceKey];
        }

        // Fallback hierarchy
        if (this.isPhone()) {
            return values.PHONE || values.default;
        } else if (this.isTablet()) {
            return values.TABLET || values.default;
        } else {
            return values.DESKTOP || values.default;
        }
    }

    /**
     * Check if current device is a phone
     */
    isPhone() {
        return [
            this.deviceTypes.PHONE_SMALL,
            this.deviceTypes.PHONE_STANDARD,
            this.deviceTypes.PHONE_LARGE,
            this.deviceTypes.PHONE_XLARGE
        ].includes(this.currentDevice);
    }

    /**
     * Check if current device is a tablet
     */
    isTablet() {
        return [
            this.deviceTypes.TABLET,
            this.deviceTypes.TABLET_LARGE
        ].includes(this.currentDevice);
    }

    /**
     * Check if current device is foldable
     */
    isFoldable() {
        return this.currentDevice === this.deviceTypes.FOLDABLE;
    }

    /**
     * Register callback for device/orientation changes
     */
    onDeviceChange(callback) {
        this.callbacks.push(callback);
    }

    /**
     * Trigger all registered callbacks
     */
    triggerCallbacks(changeData) {
        this.callbacks.forEach(callback => {
            try {
                callback(changeData);
            } catch (error) {
                console.error('Error in responsive callback:', error);
            }
        });
    }

    /**
     * Get touch-friendly dimensions based on device
     */
    getTouchTargetSize() {
        const sizes = {
            [this.deviceTypes.PHONE_SMALL]: 48,
            [this.deviceTypes.PHONE_STANDARD]: 44,
            [this.deviceTypes.PHONE_LARGE]: 44,
            [this.deviceTypes.PHONE_XLARGE]: 44,
            [this.deviceTypes.TABLET]: 48,
            [this.deviceTypes.TABLET_LARGE]: 52,
            [this.deviceTypes.FOLDABLE]: 48,
            [this.deviceTypes.DESKTOP]: 40
        };

        return sizes[this.currentDevice] || 44;
    }

    /**
     * Get optimal font scaling for current device
     */
    getFontScale() {
        const scales = {
            [this.deviceTypes.PHONE_SMALL]: 0.9,
            [this.deviceTypes.PHONE_STANDARD]: 1.0,
            [this.deviceTypes.PHONE_LARGE]: 1.05,
            [this.deviceTypes.PHONE_XLARGE]: 1.1,
            [this.deviceTypes.TABLET]: 1.15,
            [this.deviceTypes.TABLET_LARGE]: 1.2,
            [this.deviceTypes.FOLDABLE]: 1.0,
            [this.deviceTypes.DESKTOP]: 1.1
        };

        return scales[this.currentDevice] || 1.0;
    }

    /**
     * Get safe area values for iOS devices
     */
    getSafeAreaInsets() {
        const style = getComputedStyle(document.documentElement);

        return {
            top: style.getPropertyValue('--safe-area-inset-top') || '0px',
            right: style.getPropertyValue('--safe-area-inset-right') || '0px',
            bottom: style.getPropertyValue('--safe-area-inset-bottom') || '0px',
            left: style.getPropertyValue('--safe-area-inset-left') || '0px'
        };
    }

    /**
     * Apply dynamic CSS custom properties based on current device
     */
    updateCSSProperties() {
        const root = document.documentElement;
        const touchTargetSize = this.getTouchTargetSize();
        const fontScale = this.getFontScale();

        // Update touch target sizes
        root.style.setProperty('--touch-target-dynamic', `${touchTargetSize}px`);

        // Update font scaling
        root.style.setProperty('--font-scale', fontScale.toString());

        // Update spacing based on device
        const baseSpacing = this.isPhone() ? 16 : 20;
        root.style.setProperty('--spacing-base-dynamic', `${baseSpacing}px`);

        // Update margins for content
        const contentMargin = this.getResponsiveValue({
            PHONE_SMALL: '12px',
            PHONE_STANDARD: '16px',
            PHONE_LARGE: '20px',
            PHONE_XLARGE: '24px',
            TABLET: '32px',
            TABLET_LARGE: '40px',
            FOLDABLE: '20px',
            default: '16px'
        });

        root.style.setProperty('--content-margin-dynamic', contentMargin);
    }

    /**
     * Get current device info for debugging and analytics
     */
    getDeviceInfo() {
        return {
            device: this.currentDevice,
            orientation: this.currentOrientation,
            screenSize: this.getScreenSizeCategory(),
            dimensions: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            touchTargetSize: this.getTouchTargetSize(),
            fontScale: this.getFontScale(),
            safeAreas: this.getSafeAreaInsets(),
            isPhone: this.isPhone(),
            isTablet: this.isTablet(),
            isFoldable: this.isFoldable()
        };
    }
}

// Initialize responsive utils when DOM is ready
let responsiveUtils = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        responsiveUtils = new ResponsiveUtils();
        window.SandraResponsive = responsiveUtils;
    });
} else {
    responsiveUtils = new ResponsiveUtils();
    window.SandraResponsive = responsiveUtils;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveUtils;
}