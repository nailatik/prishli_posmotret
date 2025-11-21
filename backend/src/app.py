from fastapi import FastAPI

from .routes.mainpage import router


app = FastAPI()

app.include_router(router, prefix='/api')