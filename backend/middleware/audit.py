from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from database import SessionLocal
import models
import auth

WRITE_METHODS = {"POST", "PATCH", "PUT", "DELETE"}
SKIP_PATHS = {"/auth/login", "/auth/register", "/openapi.json", "/docs"}


class AuditLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        if request.method in WRITE_METHODS and request.url.path not in SKIP_PATHS:
            db = SessionLocal()
            user_email = None

            # Attempt to extract user from Authorization header
            try:
                auth_header = request.headers.get("Authorization", "")
                if auth_header.startswith("Bearer "):
                    token = auth_header.split(" ")[1]
                    payload = auth.decode_token(token)
                    if payload:
                        user_email = payload.get("sub")
            except Exception:
                pass

            try:
                log = models.AuditLog(
                    method=request.method,
                    path=str(request.url.path),
                    user_email=user_email,
                    status_code=response.status_code,
                )
                db.add(log)
                db.commit()
            except Exception as e:
                print(f"Audit log error: {e}")
            finally:
                db.close()

        return response
