# 2025 MC_hackathon_Google

## Backends env setup

We have to use 3.11

### venv
```
python3 -m venv venv
source venv/bin/activate
```

### install package
```
pip install -r requirements.txt
```

### setting API key and activate backend
```
export GOOGLE_API_KEY="YOUR_API_KEY"
python -m app.main
```

```
uvicorn app.main:app \
  --host 0.0.0.0 --port 8000 \
  --ssl-certfile ./localhost+3.pem \
  --ssl-keyfile ./localhost+3-key.pem
```


## Frontend

```
cd /home/apollo/Hackathon/Hackathon_Google/frontend && npm install
```

will see 9 vulnerabilities (3 moderate, 6 high)

```
HTTPS=true \
SSL_CRT_FILE=../localhost+3.pem \
SSL_KEY_FILE=../localhost+3-key.pem \
PORT=3000 \
npm start
```

## open LAN

install ngrok and open cmd type
```
ngrok http 3000
```