from fastapi import Depends, HTTPException

from .utils import oauth2_scheme, verify_token


def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)
    username = payload.get("sub")
    if username is None:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    return {
        "username": username
    }