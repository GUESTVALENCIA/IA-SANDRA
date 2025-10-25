//
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
                    version: '98.0.0',
                    build: '9800',
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
        showError("Failed to load Sandra IA: \(error.localizedDescription)")
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
}