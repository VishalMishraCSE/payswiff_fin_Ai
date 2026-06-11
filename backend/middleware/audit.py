from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from database import SessionLocal
import models

WRITE_METHODS = {"POST", "PATCH", "PUT", "DELETE"}


class AuditLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        if request.method in WRITE_METHODS:
            db = SessionLocal()
            try:
                log = models.AuditLog(
                    method=request.method,
                    path=str(request.url.path),
                    status_code=response.status_code,
                )
                db.add(log)
                db.commit()
            except Exception as e:
                print(f"Audit log error: {e}")
            finally:
                db.close()

        return response
