# Person 4 - Threat Intelligence & Campaign Detection

This folder contains the Person 4 work package for the TRACE forensic platform.

## Included modules
- `mock_provider.py` — demo IP intelligence dataset for offline presentation mode
- `maxmind_provider.py` — optional MaxMind GeoLite2-backed provider
- `orchestrator.py` — provider fallback and cache orchestration
- `campaign_detector.py` — simple campaign clustering based on shared IP/domain patterns

## Demo usage
```python
from mock_provider import MockIntelProvider
import asyncio

async def main():
    result = await MockIntelProvider().get_ip_intel("203.0.113.42")
    print(result)

asyncio.run(main())
```

## Notes
This is kept as a standalone submodule for Person 4 work so it remains easy to track, review, and push independently.
