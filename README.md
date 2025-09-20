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

## Frontend

```
cd /home/apollo/Hackathon/Hackathon_Google/frontend && npm install
```

will see 9 vulnerabilities (3 moderate, 6 high)

```
npm start
```

## comment

在每一次要念出音檔的時候，需要先把所有 .wav 清乾淨
可以輸入
```
 find . -type f -name "*.wav" -delete
```