# 2025 MC_hackathon_Google

## Backends env setup

We have to use 3.11

### venv
```
python3.11 -m venv venv
source venv/bin/activate
```

### install package
```
pip install -r requirements.txt
```
### import
```
unzip audio.zip -d frontend/public
```


### setting API key and activate backend
```
export GOOGLE_API_KEY="YOUR_API_KEY"
python -m app.main
```

## Frontend

```
cd frontend && npm install
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