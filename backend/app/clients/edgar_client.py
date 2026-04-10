import httpx

EDGAR_BASE = "https://efts.sec.gov/LATEST/search-index"
EDGAR_FILINGS = "https://efts.sec.gov/LATEST/search-index"
EDGAR_COMPANY = "https://data.sec.gov/submissions"

HEADERS = {
    "User-Agent": "TradingHub/1.0 (contact@tradinghub.app)",
    "Accept": "application/json",
}


async def get_company_filings(cik: str, filing_type: str = "", count: int = 20) -> list[dict]:
    url = f"{EDGAR_COMPANY}/CIK{cik.zfill(10)}.json"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, headers=HEADERS)
        if resp.status_code != 200:
            return []
        data = resp.json()
        recent = data.get("filings", {}).get("recent", {})
        forms = recent.get("form", [])
        dates = recent.get("filingDate", [])
        accessions = recent.get("accessionNumber", [])
        descriptions = recent.get("primaryDocDescription", [])

        filings = []
        for i in range(min(len(forms), count)):
            if filing_type and forms[i] != filing_type:
                continue
            filings.append({
                "form": forms[i],
                "filingDate": dates[i] if i < len(dates) else None,
                "accessionNumber": accessions[i] if i < len(accessions) else None,
                "description": descriptions[i] if i < len(descriptions) else None,
            })
        return filings[:count]


async def search_filings(query: str, form_type: str = "", count: int = 20) -> list[dict]:
    url = "https://efts.sec.gov/LATEST/search-index"
    params = {"q": query, "dateRange": "custom", "forms": form_type, "from": 0, "size": count}
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(url, params=params, headers=HEADERS)
            if resp.status_code != 200:
                return []
            return resp.json().get("hits", {}).get("hits", [])
        except Exception:
            return []
