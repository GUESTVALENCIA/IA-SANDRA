import json
from http.server import HTTPServer, BaseHTTPRequestHandler

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/execute":
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"status":"success","message":"test-dev.js creado"}')
            with open("test-dev.js", "w") as f:
                f.write("console.log('¡Sandra funciona!');")
    
    def do_POST(self):
        if self.path == "/execute":
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"status":"success","message":"test-dev.js creado"}')
            with open("test-dev.js", "w") as f:
                f.write("console.log('¡Sandra funciona!');")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

HTTPServer(("localhost", 8000), Handler).serve_forever()

