from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .utils import oauth2_scheme, verify_token


def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)
    username = payload.get("sub")
    if username is None:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    return {
        "username": username
    }


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Security(HTTPBearer(auto_error=False))
):
    if credentials is None:
        return None
    try:
        token = credentials.credentials
        import jwt
        payload = jwt.decode(token, "secret_key", algorithms=["HS256"])
        username = payload.get("sub")
        if username is None:
            return None
        return {
            "username": username
        }
    except:
        return None