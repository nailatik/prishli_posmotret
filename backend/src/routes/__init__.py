from .mainpage import router as mainpage_router
from .communities import router as communities_router
from .profile import router as profile_router
#from .messages import router as messages_router

def include_routers(app):
    app.include_router(mainpage_router, prefix='/api')
    app.include_router(communities_router, prefix='/api')
    app.include_router(profile_router, prefix='/api')
    #app.include_router(messages_router, prefix='/api')

