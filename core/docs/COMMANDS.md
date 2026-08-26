# Core Development Commands

## Setup Python Environment
```bash
cd core
python -m venv .venv
# Activate on Windows:
.venv\Scripts\activate
# Activate on Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

## Running the Server
```bash
python serve.py
```

## Running Standalone Pipeline Test
```bash
python -m pytest
# or
python test_phase1.py
```
