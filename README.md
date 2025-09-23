# 2025 MC_hackathon_Google

## Notice

You have to prepare:
- An android mobilephone
- WSL environment

And make sure ypur phone and computer are connecting the same wifi.

## Backends env setup

### 1. Install Python 3.11
```
sudo apt update
sudo apt install -y python3.11 python3.11-venv
```

### 2. Install uv

```
curl -Ls https://astral.sh/uv/install.sh | sh
```
After installed, you have to reopen terminal 

### 3. Cloning repo

```
git clone "repo's url here"
cd Hackathon_Google
```

### 4. Create venv

```
uv sync
```

### 5. Setting API key

copy `.env.example` and rename to `.env`

set your GOOGLE_API_KEY

```
GOOGLE_API_KEY="YOUR_API_KEY"
```

### 6. Find your wifi ip

open the terminal and type

```powershell
ipconfig
```

And get your wifi's IPv4's address

Maybe will be `192.168.x.xx`  

### 7. Install mkcert
Go to [mkcert official website](https://github.com/FiloSottile/mkcert/releases) and download your computer's version

After installed, you have to rename it to `mkcert`

And move it to `C:\Tools\` (If you don't have this file, you need to create one)

### 8. Setting PATH
控制台 → 系統 → 進階系統設定 → 環境變數 → Path → 編輯 → 新增 C:\Tools

or you can use cmd

```
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Tools", "User")
```

You can verify whether it has set by reopening cmd and type
```
mkcert -help
```


### 9. Initialize and Generate IP certification

```
mkcert -install
``` 

```
mkcert localhost 127.0.0.1 ::1 [your IPv4 address here]
```

It will generate `localhost+M.pem` and `localhost+M-key.pem` in `C:\Windows\System32`

copy them to `Hackathon_Google\` and `Hackathon_Google\forntend\`

### 10. Setting CA

```
mkcert -CAROOT
```

It will output the CA's path

open it and copy `rootCA.pem`

Rename to `rootCA.crt`

Send this file to phone by using gmail/discord/...

And 設定 → 安全性 → 安裝憑證 → 來自檔案，選這個檔案安裝

It will say `mkcert <你的電腦名稱>`

### 11. unzip audio

```
unzip audio_new1.zip -d frontend/public/
```

### 12. activate backend

```
uv run uvicorn app.main:app \
  --host 0.0.0.0 --port 8000 \
  --ssl-certfile ./localhost+3.pem \
  --ssl-keyfile ./localhost+3-key.pem
```

## Frontend

```
cd Hackathon_Google/frontend && npm install
```

will see 9 vulnerabilities (3 moderate, 6 high)

```
HTTPS=true \
SSL_CRT_FILE=../localhost+3.pem \
SSL_KEY_FILE=../localhost+3-key.pem \
PORT=3000 \
npm start
```