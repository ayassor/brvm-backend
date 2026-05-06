#!/usr/bin/env python3
"""
scrape_fundamentals.py — Scrape les données fondamentales d'une action BRVM.

Usage:
    python3 scrape_fundamentals.py SNTS
    python3 scrape_fundamentals.py SGBC

Utilise curl uniquement (pas de pip install requis).
Retourne un JSON structuré prêt à injecter via les routes admin.
"""

import sys
import json
import subprocess
import re
from typing import Optional, Any


def curl_get(url: str, insecure: bool = False) -> str:
    """Télécharge une URL via curl et retourne le contenu brut."""
    cmd = ["curl", "-s", "--max-time", "15", "--user-agent",
           "Mozilla/5.0 (compatible; BRVM-Scraper/1.0)"]
    if insecure:
        cmd.append("-k")
    cmd.append(url)
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
        return result.stdout
    except subprocess.TimeoutExpired:
        return ""
    except Exception:
        return ""


def safe_float(s: str) -> Optional[float]:
    """Convertit une chaîne en float, retourne None en cas d'échec."""
    if not s:
        return None
    s = s.strip().replace(" ", "").replace("\xa0", "").replace(",", ".")
    s = re.sub(r"[^\d.\-]", "", s)
    try:
        return float(s)
    except ValueError:
        return None


def safe_int(s: str) -> Optional[int]:
    """Convertit une chaîne en int."""
    v = safe_float(s)
    if v is None:
        return None
    return int(v)


# ── Scraping SikaFinance ───────────────────────────────────────────────────────

def scrape_sikafinance(ticker: str) -> dict:
    """
    Scrape sikafinance.com pour cours, volume, variation.
    URL pattern: https://www.sikafinance.com/marches/cotation/<TICKER>
    """
    result = {
        "current_price_fcfa": None,
        "volume": None,
        "variation_pct": None,
        "name": None,
        "sector": None,
    }

    # Page de cotation directe
    url = f"https://www.sikafinance.com/marches/cotation/{ticker}"
    html = curl_get(url)

    if not html:
        return result

    # Cours actuel — cherche patterns comme "1 234,56" ou "12345"
    price_match = re.search(
        r'(?:cours|dernier|close|clôture)[^<]{0,80}?([\d\s]+[,.]?\d*)\s*(?:FCFA|F\s*CFA|XOF)',
        html, re.IGNORECASE
    )
    if price_match:
        result["current_price_fcfa"] = safe_float(price_match.group(1))

    # Variation %
    var_match = re.search(
        r'([+-]?\d+[,.]?\d*)\s*%',
        html
    )
    if var_match:
        result["variation_pct"] = safe_float(var_match.group(1))

    # Volume
    vol_match = re.search(
        r'(?:volume|vol\.?)[^<]{0,50}?([\d\s]+)',
        html, re.IGNORECASE
    )
    if vol_match:
        result["volume"] = safe_int(vol_match.group(1))

    # Nom de la société
    name_match = re.search(r'<title>([^<|]+)', html)
    if name_match:
        raw = name_match.group(1).strip()
        # Nettoyer "SNTS - SikaFinance" → "SNTS"
        raw = re.sub(r'\s*[-|]\s*[Ss]ika.*', '', raw).strip()
        if raw and raw.upper() != ticker.upper():
            result["name"] = raw

    return result


def scrape_sikafinance_list(ticker: str) -> dict:
    """
    Scrape la liste AAZ de sikafinance pour trouver le ticker.
    """
    result = {
        "current_price_fcfa": None,
        "volume": None,
        "variation_pct": None,
        "name": None,
    }
    html = curl_get("https://www.sikafinance.com/marches/aaz")
    if not html:
        return result

    # Cherche la ligne contenant le ticker
    # Format typique: <td>SNTS</td><td>Société Nationale</td><td>1 234</td>...
    ticker_upper = ticker.upper()
    pattern = rf'{re.escape(ticker_upper)}[^<]*</[^>]+>[^<]*<[^>]+>([^<]+)</[^>]+>[^<]*<[^>]+>([^<]+)</[^>]+>[^<]*<[^>]+>([^<]+)</[^>]+>[^<]*<[^>]+>([^<]+)'
    m = re.search(pattern, html, re.IGNORECASE)
    if m:
        result["name"] = m.group(1).strip() or None
        result["current_price_fcfa"] = safe_float(m.group(2))
        result["variation_pct"] = safe_float(m.group(3))
        result["volume"] = safe_int(m.group(4))

    return result


# ── Scraping BRVM.org ──────────────────────────────────────────────────────────

def scrape_brvm_org(ticker: str) -> dict:
    """
    Scrape brvm.org pour les données de cotation et infos société.
    """
    result = {
        "current_price_fcfa": None,
        "volume": None,
        "variation_pct": None,
        "name": None,
        "sector": None,
        "shares_count": None,
        "market_cap_fcfa": None,
    }

    # Page principale BRVM avec SSL insécable (-k)
    url = f"https://www.brvm.org/fr/cours-actions/0/{ticker.lower()}"
    html = curl_get(url, insecure=True)

    if not html:
        # Essai API JSON si disponible
        api_url = f"https://www.brvm.org/api/quotation/{ticker.upper()}"
        html = curl_get(api_url, insecure=True)
        if html:
            try:
                data = json.loads(html)
                result["current_price_fcfa"] = safe_float(str(data.get("close") or data.get("price") or ""))
                result["volume"] = safe_int(str(data.get("volume") or ""))
                result["variation_pct"] = safe_float(str(data.get("variation") or ""))
                result["name"] = data.get("name") or data.get("company_name") or None
            except (json.JSONDecodeError, KeyError):
                pass
        return result

    # Cours
    price_match = re.search(
        r'(?:dernier cours|cours|close)[^<]{0,100}?([\d\s.,]+)\s*(?:FCFA|XOF|F)',
        html, re.IGNORECASE
    )
    if price_match:
        result["current_price_fcfa"] = safe_float(price_match.group(1))

    # Variation
    var_match = re.search(r'([+-]?\d+[,.]?\d*)\s*%', html)
    if var_match:
        result["variation_pct"] = safe_float(var_match.group(1))

    # Volume
    vol_match = re.search(r'volume[^<]{0,50}?([\d\s]+)', html, re.IGNORECASE)
    if vol_match:
        result["volume"] = safe_int(vol_match.group(1))

    # Nombre de titres / capitalisation
    shares_match = re.search(
        r'(?:nombre.*titres?|titres? en circulation)[^<]{0,100}?([\d\s]+)',
        html, re.IGNORECASE
    )
    if shares_match:
        result["shares_count"] = safe_int(shares_match.group(1))

    cap_match = re.search(
        r'capitalisation[^<]{0,100}?([\d\s.,]+)',
        html, re.IGNORECASE
    )
    if cap_match:
        result["market_cap_fcfa"] = safe_float(cap_match.group(1))

    return result


# ── Fusion des sources ─────────────────────────────────────────────────────────

def merge_market_data(*sources: dict) -> dict:
    """Fusionne plusieurs dicts en prenant la première valeur non-None."""
    merged: dict = {}
    keys = {"current_price_fcfa", "volume", "variation_pct", "name", "sector", "shares_count"}
    for key in keys:
        for src in sources:
            if src.get(key) is not None:
                merged[key] = src[key]
                break
        if key not in merged:
            merged[key] = None
    return merged


# ── Point d'entrée ─────────────────────────────────────────────────────────────

def scrape(ticker: str) -> dict:
    ticker = ticker.strip().upper()

    sources_used = []
    missing_data = []

    # 1. SikaFinance — page de cotation
    sika_cotation = scrape_sikafinance(ticker)
    if any(v is not None for v in sika_cotation.values()):
        sources_used.append("sikafinance.com/marches/cotation")

    # 2. SikaFinance — liste AAZ
    sika_list = scrape_sikafinance_list(ticker)
    if any(v is not None for v in sika_list.values()):
        if "sikafinance.com/marches/cotation" not in sources_used:
            sources_used.append("sikafinance.com/marches/aaz")
        else:
            sources_used.append("sikafinance.com/marches/aaz")

    # 3. BRVM.org
    brvm_data = scrape_brvm_org(ticker)
    if any(v is not None for v in brvm_data.values()):
        sources_used.append("brvm.org")

    # Fusion
    merged = merge_market_data(sika_cotation, sika_list, brvm_data)

    # Données manquantes
    fundamental_fields = [
        ("market_data.current_price_fcfa", merged.get("current_price_fcfa")),
        ("market_data.volume",             merged.get("volume")),
        ("market_data.variation_pct",      merged.get("variation_pct")),
        ("company.name",                   merged.get("name")),
        ("company.sector",                 merged.get("sector")),
        ("company.shares_count",           merged.get("shares_count")),
    ]
    for field_name, value in fundamental_fields:
        if value is None:
            missing_data.append(field_name)

    # Structure finale
    output: dict[str, Any] = {
        "ticker": ticker,
        "company": {
            "name":         merged.get("name"),
            "sector":       merged.get("sector"),
            "shares_count": merged.get("shares_count"),
        },
        "financial_history": [],   # Non disponible via scraping public
        "shareholders": [],         # Non disponible via scraping public
        "dividends": [],            # Non disponible via scraping public
        "market_data": {
            "current_price_fcfa": merged.get("current_price_fcfa"),
            "volume":             merged.get("volume"),
            "variation_pct":      merged.get("variation_pct"),
        },
        "sources_used": list(dict.fromkeys(sources_used)),  # dédoublonnage ordonné
        "missing_data": missing_data,
    }

    return output


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python3 scrape_fundamentals.py <TICKER>"}))
        sys.exit(1)

    ticker_arg = sys.argv[1]
    result = scrape(ticker_arg)
    print(json.dumps(result, ensure_ascii=False, indent=2))
