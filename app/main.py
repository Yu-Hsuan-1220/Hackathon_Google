# global lib
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os

# local lib

from app.routers import pose_check, menu, home, first_used, tuner, string_check, guitar, tutor

app = FastAPI()


##########################################################
# 新增：CORS 支援
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允許所有來源，或指定 ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
##########################################################


app.include_router(menu.router, prefix="/menu", tags=["Menu"])
app.include_router(home.router, prefix="/home", tags=["Home"])
app.include_router(pose_check.router, prefix="/pose", tags=["Pose Check"])
app.include_router(first_used.router, prefix="/first_used", tags=["First Used"])
app.include_router(guitar.router, prefix="/guitar", tags=["Guitar"])
app.include_router(tuner.router,prefix="/tuner",tags=["Tuner"])
app.include_router(string_check.router, prefix="/simplenote", tags=["Simple Note"])
app.include_router(tutor.router, prefix="/tutor", tags=["Tutor"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
