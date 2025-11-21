from fastapi import FastAPI

from .routes import include_routers


app = FastAPI()

include_routers(app)