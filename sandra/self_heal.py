#!/usr/bin/env python3
import os, sys, time, subprocess, requests

HEALTH_URLS = [u.strip() for u in os.getenv("SANDRA_HEALTH_URLS", "http://localhost:3001/health").split(",") if u.strip()]
RETRIES = int(os.getenv("SANDRA_HEALTH_RETRIES", "5"))
INTERVAL = float(os.getenv("SANDRA_HEALTH_INTERVAL_SEC", "6"))
FORCE_PUSH = os.getenv("SANDRA_FORCE_PUSH", "0") == "1"

def sh(cmd, check=True):
    return subprocess.run(cmd, check=check, text=True, capture_output=True)

def branch():
    r = sh(["git","rev-parse","--abbrev-ref","HEAD"])
    return r.stdout.strip()

def latest_safe_tag(br):
    sh(["git","fetch","--tags","origin"], check=False)
    pat = f"SAFE_{br}_"
    r = sh(["git","tag","--list","--sort=-creatordate"])
    tags = [t.strip() for t in r.stdout.splitlines() if t.startswith(pat)]
    return tags[0] if tags else None

def healthy():
    ok = True
    for u in HEALTH_URLS:
        try:
            r = requests.get(u, timeout=2)
            ok = ok and (r.status_code == 200)
        except Exception:
            ok = False
    return ok

def restore(tag, br):
    sh(["git","reset","--hard", tag])
    if FORCE_PUSH:
        sh(["git","push","--force-with-lease","origin", br], check=False)
    sh(["npm","ci","--no-fund","--no-audit"], check=False)
    sh(["npm","run","build"], check=False)

def main():
    for _ in range(RETRIES):
        if healthy():
            print("self-heal: healthy"); return 0
        time.sleep(INTERVAL)
    br = branch()
    tag = latest_safe_tag(br)
    if not tag:
        print("self-heal: no SAFE_* tag found; abort"); return 2
    print(f"self-heal: restoring to {tag} on {br}")
    restore(tag, br)
    return 0

if __name__ == "__main__":
    try:
        import requests  # type: ignore
    except Exception:
        print("Installing requests..."); subprocess.run([sys.executable,"-m","pip","install","requests"], check=False)
    sys.exit(main())


