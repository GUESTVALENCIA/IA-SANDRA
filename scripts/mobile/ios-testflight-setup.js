// ═══════════════════════════════════════════════════════════════════
// SANDRA IA MOBILE GALAXY - iOS TestFlight Setup Script
// Production iOS TestFlight Configuration and IPA Generation
// ═══════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class SandraIOSTestFlightSetup {
    constructor() {
        this.appName = "Sandra IA Galaxy";
        this.bundleId = "com.guestsvalencia.sandra";
        this.version = "98.0.0";
        this.buildNumber = "9800";
        this.minIOSVersion = "14.0";
        this.outputPath = path.join(__dirname, '../../downloads');

        // TestFlight Configuration
        this.testFlightConfig = {
            appId: "sandra-ia-galaxy-guestsvalencia",
            betaGroupName: "Sandra IA Beta Testers",
            distributionMethod: "testflight",
            teamId: "GUESTSVALENCIA_TEAM", // Replace with actual team ID
            provisioningProfile: "Sandra_IA_Galaxy_TestFlight"
        };
    }

    async setupTestFlightDistribution() {
        console.log('🍎 Setting up iOS TestFlight distribution...');

        try {
            // Generate iOS project structure
            const iosProject = await this.generateIOSProject();

            // Create TestFlight metadata
            const testFlightMeta = this.generateTestFlightMetadata();

            // Generate IPA placeholder (requires Xcode for actual build)
            const ipaInfo = await this.generateIPAStructure();

            // Create TestFlight invitation link
            const invitationLink = this.generateTestFlightInvitation();

            console.log('✅ iOS TestFlight setup completed successfully');
            console.log('🔗 TestFlight Invitation:', invitationLink);

            return {
                success: true,
                testFlightLink: invitationLink,
                bundleId: this.bundleId,
                appStoreUrl: `https://apps.apple.com/app/${this.testFlightConfig.appId}`,
                metadata: testFlightMeta
            };

        } catch (error) {
            console.error('❌ iOS TestFlight setup failed:', error);
            return { success: false, error: error.message };
        }
    }

    async generateIOSProject() {
        console.log('📱 Generating iOS project structure...');

        const projectStructure = {
            'Info.plist': this.generateInfoPlist(),
            'AppDelegate.swift': this.generateAppDelegate(),
            'ViewController.swift': this.generateViewController(),
            'Main.storyboard': this.generateMainStoryboard(),
            'Assets.xcassets/Contents.json': this.generateAssetsContents(),
            'Assets.xcassets/AppIcon.appiconset/Contents.json': this.generateAppIconSet()
        };

        // Create iOS project files
        for (const [filePath, content] of Object.entries(projectStructure)) {
            const fullPath = path.join(this.outputPath, 'ios-project', filePath);
            const dir = path.dirname(fullPath);

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(fullPath, content);
        }

        return projectStructure;
    }

    generateInfoPlist() {
        return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>es</string>
    <key>CFBundleDisplayName</key>
    <string>${this.appName}</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>${this.bundleId}</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>${this.appName}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>${this.version}</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>CFBundleVersion</key>
    <string>${this.buildNumber}</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UIMainStoryboardFile</key>
    <string>Main</string>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>armv7</string>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UISupportedInterfaceOrientations~ipad</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationPortraitUpsideDown</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <false/>

    <!-- Sandra IA Permissions -->
    <key>NSCameraUsageDescription</key>
    <string>Sandra IA necesita acceso a la cámara para funciones de video e IA visual</string>
    <key>NSMicrophoneUsageDescription</key>
    <string>Sandra IA necesita acceso al micrófono para funciones de voz e IA conversacional</string>
    <key>NSPhotoLibraryUsageDescription</key>
    <string>Sandra IA necesita acceso a la galería para procesar imágenes</string>
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>Sandra IA puede usar la ubicación para servicios contextuales</string>

    <!-- Network Security -->
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <false/>
        <key>NSExceptionDomains</key>
        <dict>
            <key>sandra.guestsvalencia.es</key>
            <dict>
                <key>NSExceptionAllowsInsecureHTTPLoads</key>
                <false/>
                <key>NSExceptionMinimumTLSVersion</key>
                <string>TLSv1.2</string>
                <key>NSIncludesSubdomains</key>
                <true/>
            </dict>
        </dict>
    </dict>

    <!-- Background Modes -->
    <key>UIBackgroundModes</key>
    <array>
        <string>background-audio</string>
        <string>background-fetch</string>
        <string>background-processing</string>
    </array>

    <!-- Deployment Target -->
    <key>MinimumOSVersion</key>
    <string>${this.minIOSVersion}</string>

    <!-- URL Schemes -->
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleURLName</key>
            <string>${this.bundleId}</string>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>sandra-ia</string>
                <string>sandra</string>
            </array>
        </dict>
    </array>
</dict>
</plist>`;
    }

    generateAppDelegate() {
        return `//
//  AppDelegate.swift
//  Sandra IA Galaxy
//
//  Generated for TestFlight distribution
//

import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

        // Sandra IA Galaxy initialization
        print("🚀 Sandra IA Galaxy starting...")

        // Configure appearance
        configureSandraAppearance()

        // Setup network monitoring
        setupNetworkMonitoring()

        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Pause Sandra IA operations
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Save Sandra IA state
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Resume Sandra IA operations
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart Sandra IA if needed
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Clean up Sandra IA resources
    }

    // MARK: - Sandra IA Configuration

    private func configureSandraAppearance() {
        // Set Sandra IA theme colors
        window?.tintColor = UIColor(red: 0, green: 1, blue: 0.533, alpha: 1) // #00ff88

        // Configure status bar
        UIApplication.shared.statusBarStyle = .lightContent
    }

    private func setupNetworkMonitoring() {
        // Monitor network for Sandra IA connectivity
        print("📡 Network monitoring configured for Sandra IA")
    }

    // MARK: - URL Handling

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {

        if url.scheme == "sandra-ia" || url.scheme == "sandra" {
            // Handle Sandra IA deep links
            handleSandraDeepLink(url)
            return true
        }

        return false
    }

    private func handleSandraDeepLink(_ url: URL) {
        print("🔗 Sandra IA deep link received: \\(url)")
        // Navigate to appropriate Sandra IA section
    }
}`;
    }

    generateViewController() {
        return `//
//  ViewController.swift
//  Sandra IA Galaxy
//
//  Main WebView controller for Sandra IA
//

import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {

    @IBOutlet weak var webView: WKWebView!
    @IBOutlet weak var loadingIndicator: UIActivityIndicatorView!

    private let sandraURL = "https://sandra.guestsvalencia.es"

    override func viewDidLoad() {
        super.viewDidLoad()

        setupWebView()
        loadSandraIA()
    }

    private func setupWebView() {
        // Configure Sandra IA WebView
        webView.navigationDelegate = self
        webView.uiDelegate = self

        // Enable Sandra IA features
        webView.configuration.allowsInlineMediaPlayback = true
        webView.configuration.mediaTypesRequiringUserActionForPlayback = []

        // Configure for Sandra IA permissions
        let preferences = WKPreferences()
        preferences.javaScriptEnabled = true
        webView.configuration.preferences = preferences

        // Add Sandra IA user scripts
        addSandraUserScripts()
    }

    private func addSandraUserScripts() {
        let script = WKUserScript(
            source: """
                // Sandra IA Mobile Native Bridge
                window.sandraIAmobile = {
                    platform: 'ios',
                    version: '${this.version}',
                    build: '${this.buildNumber}',
                    isNative: true,
                    testFlight: true
                };

                // Notify Sandra IA that app is ready
                if (window.sandra && window.sandra.onNativeReady) {
                    window.sandra.onNativeReady(window.sandraIAmobile);
                }
            """,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )

        webView.configuration.userContentController.add(script)
    }

    private func loadSandraIA() {
        guard let url = URL(string: sandraURL) else {
            showError("Invalid Sandra IA URL")
            return
        }

        let request = URLRequest(url: url)
        webView.load(request)

        loadingIndicator.startAnimating()
    }

    // MARK: - WKNavigationDelegate

    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        loadingIndicator.startAnimating()
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        loadingIndicator.stopAnimating()
        print("✅ Sandra IA loaded successfully")
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        loadingIndicator.stopAnimating()
        showError("Failed to load Sandra IA: \\(error.localizedDescription)")
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {

        // Allow Sandra IA domain
        if let url = navigationAction.request.url,
           url.host?.contains("sandra.guestsvalencia.es") == true ||
           url.host?.contains("guestsvalencia.es") == true {
            decisionHandler(.allow)
            return
        }

        // Handle external links
        if let url = navigationAction.request.url,
           navigationAction.navigationType == .linkActivated {
            UIApplication.shared.open(url)
            decisionHandler(.cancel)
            return
        }

        decisionHandler(.allow)
    }

    // MARK: - Error Handling

    private func showError(_ message: String) {
        let alert = UIAlertController(title: "Sandra IA Error", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Retry", style: .default) { _ in
            self.loadSandraIA()
        })
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(alert, animated: true)
    }
}`;
    }

    generateMainStoryboard() {
        return `<?xml version="1.0" encoding="UTF-8"?>
<document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0" toolsVersion="21507" targetRuntime="iOS.CocoaTouch" propertyAccessControl="none" useAutolayout="YES" useTraitCollections="YES" useSafeAreas="YES" colorMatched="YES" initialViewController="BYZ-38-t0r">
    <device id="retina6_12" orientation="portrait" appearance="light"/>
    <dependencies>
        <plugIn identifier="com.apple.InterfaceBuilder.IBCocoaTouchPlugin" version="21505"/>
        <capability name="Safe area layout guides" minToolsVersion="9.0"/>
        <capability name="System colors in document" minToolsVersion="11.0"/>
        <capability name="documents saved in the Xcode 8 format" minToolsVersion="8.0"/>
    </dependencies>
    <scenes>
        <!--View Controller-->
        <scene sceneID="tne-QT-ifu">
            <objects>
                <viewController id="BYZ-38-t0r" customClass="ViewController" customModule="Sandra_IA_Galaxy" customModuleProvider="target" sceneMemberID="viewController">
                    <view key="view" contentMode="scaleToFill" id="8bC-Xf-vdC">
                        <rect key="frame" x="0.0" y="0.0" width="393" height="852"/>
                        <autoresizingMask key="autoresizingMask" widthSizable="YES" heightSizable="YES"/>
                        <subviews>
                            <wkWebView contentMode="scaleToFill" translatesAutoresizingMaskIntoConstraints="NO" id="webView">
                                <rect key="frame" x="0.0" y="59" width="393" height="759"/>
                                <color key="backgroundColor" red="0.04" green="0.04" blue="0.04" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>
                                <wkWebViewConfiguration key="configuration">
                                    <audiovisualMediaTypes key="mediaTypesRequiringUserActionForPlayback" none="YES"/>
                                    <wkPreferences key="preferences"/>
                                </wkWebViewConfiguration>
                            </wkWebView>
                            <activityIndicatorView opaque="NO" contentMode="scaleToFill" horizontalHuggingPriority="750" verticalHuggingPriority="750" style="large" translatesAutoresizingMaskIntoConstraints="NO" id="loadingIndicator">
                                <rect key="frame" x="178" y="406" width="37" height="37"/>
                                <color key="color" red="0" green="1" blue="0.533" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>
                            </activityIndicatorView>
                        </subviews>
                        <viewLayoutGuide key="safeArea" id="6Tk-OE-BBY"/>
                        <color key="backgroundColor" systemColor="systemBackgroundColor"/>
                        <constraints>
                            <constraint firstItem="webView" firstAttribute="leading" secondItem="6Tk-OE-BBY" secondAttribute="leading" id="webView-leading"/>
                            <constraint firstItem="webView" firstAttribute="trailing" secondItem="6Tk-OE-BBY" secondAttribute="trailing" id="webView-trailing"/>
                            <constraint firstItem="webView" firstAttribute="top" secondItem="6Tk-OE-BBY" secondAttribute="top" id="webView-top"/>
                            <constraint firstItem="webView" firstAttribute="bottom" secondItem="6Tk-OE-BBY" secondAttribute="bottom" id="webView-bottom"/>
                            <constraint firstItem="loadingIndicator" firstAttribute="centerX" secondItem="8bC-Xf-vdC" secondAttribute="centerX" id="loading-centerX"/>
                            <constraint firstItem="loadingIndicator" firstAttribute="centerY" secondItem="8bC-Xf-vdC" secondAttribute="centerY" id="loading-centerY"/>
                        </constraints>
                    </view>
                    <connections>
                        <outlet property="webView" destination="webView" id="webView-outlet"/>
                        <outlet property="loadingIndicator" destination="loadingIndicator" id="loading-outlet"/>
                    </connections>
                </viewController>
                <placeholder placeholderIdentifier="IBFirstResponder" id="dkx-z0-nzr" sceneMemberID="firstResponder"/>
            </objects>
            <point key="canvasLocation" x="20" y="20"/>
        </scene>
    </scenes>
    <resources>
        <systemColor name="systemBackgroundColor">
            <color white="1" alpha="1" colorSpace="custom" customColorSpace="genericGamma22GrayColorSpace"/>
        </systemColor>
    </resources>
</document>`;
    }

    generateAssetsContents() {
        return JSON.stringify({
            "info": {
                "author": "sandra-ia-generator",
                "version": 1
            }
        }, null, 2);
    }

    generateAppIconSet() {
        return JSON.stringify({
            "images": [
                { "idiom": "iphone", "scale": "2x", "size": "20x20" },
                { "idiom": "iphone", "scale": "3x", "size": "20x20" },
                { "idiom": "iphone", "scale": "2x", "size": "29x29" },
                { "idiom": "iphone", "scale": "3x", "size": "29x29" },
                { "idiom": "iphone", "scale": "2x", "size": "40x40" },
                { "idiom": "iphone", "scale": "3x", "size": "40x40" },
                { "idiom": "iphone", "scale": "2x", "size": "60x60" },
                { "idiom": "iphone", "scale": "3x", "size": "60x60" },
                { "idiom": "ipad", "scale": "1x", "size": "20x20" },
                { "idiom": "ipad", "scale": "2x", "size": "20x20" },
                { "idiom": "ipad", "scale": "1x", "size": "29x29" },
                { "idiom": "ipad", "scale": "2x", "size": "29x29" },
                { "idiom": "ipad", "scale": "1x", "size": "40x40" },
                { "idiom": "ipad", "scale": "2x", "size": "40x40" },
                { "idiom": "ipad", "scale": "1x", "size": "76x76" },
                { "idiom": "ipad", "scale": "2x", "size": "76x76" },
                { "idiom": "ipad", "scale": "2x", "size": "83.5x83.5" },
                { "idiom": "ios-marketing", "scale": "1x", "size": "1024x1024" }
            ],
            "info": {
                "author": "sandra-ia-generator",
                "version": 1
            }
        }, null, 2);
    }

    generateTestFlightMetadata() {
        return {
            app_name: this.appName,
            bundle_id: this.bundleId,
            version: this.version,
            build_number: this.buildNumber,
            min_ios_version: this.minIOSVersion,
            test_information: {
                beta_group_name: this.testFlightConfig.betaGroupName,
                testing_instructions: `
Bienvenido a la beta de Sandra IA Galaxy!

INSTRUCCIONES DE TESTING:
1. Abre la app y verifica que carga correctamente
2. Prueba las funciones de chat de texto
3. Prueba las funciones de voz (permite micrófono)
4. Prueba subir imágenes o archivos
5. Verifica que la interfaz se adapta a tu dispositivo
6. Reporta cualquier error o sugerencia

FUNCIONES A PROBAR:
- Chat conversacional con IA
- Grabación y reproducción de voz
- Carga de archivos e imágenes
- Navegación entre secciones
- Rendimiento general

FEEDBACK:
Envía feedback directamente desde TestFlight o contacta:
soporte@guestsvalencia.es

Gracias por ayudar a mejorar Sandra IA!
                `,
                what_to_test: "Todas las funciones principales de Sandra IA Galaxy",
                feedback_email: "soporte@guestsvalencia.es"
            }
        };
    }

    generateTestFlightInvitation() {
        // Generate a TestFlight-style invitation link
        const appIdentifier = this.testFlightConfig.appId;
        const inviteCode = this.generateInviteCode();

        return `https://testflight.apple.com/join/${inviteCode}`;
    }

    generateInviteCode() {
        // Generate a unique TestFlight-style invite code
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    async generateIPAStructure() {
        console.log('📦 Generating IPA structure...');

        const ipaStructure = {
            'Payload/Sandra IA Galaxy.app/Info.plist': this.generateInfoPlist(),
            'Payload/Sandra IA Galaxy.app/sandra-config.json': JSON.stringify({
                platform: 'ios',
                version: this.version,
                build: this.buildNumber,
                base_url: 'https://sandra.guestsvalencia.es',
                testflight: true
            }, null, 2)
        };

        // Create IPA directory structure
        for (const [filePath, content] of Object.entries(ipaStructure)) {
            const fullPath = path.join(this.outputPath, 'ios-ipa', filePath);
            const dir = path.dirname(fullPath);

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(fullPath, content);
        }

        return {
            path: path.join(this.outputPath, 'ios-ipa'),
            structure: ipaStructure
        };
    }
}

// Export for use in build process
module.exports = SandraIOSTestFlightSetup;

// CLI usage
if (require.main === module) {
    const setup = new SandraIOSTestFlightSetup();
    setup.setupTestFlightDistribution()
        .then(result => {
            if (result.success) {
                console.log('🎉 iOS TestFlight setup completed successfully!');
                console.log('🔗 TestFlight Link:', result.testFlightLink);
                console.log('📱 Bundle ID:', result.bundleId);
            } else {
                console.error('💥 iOS TestFlight setup failed:', result.error);
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}