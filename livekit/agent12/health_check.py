"""
Health Check Module for Agent11

Provides health check endpoints for monitoring and load balancers.
"""

import asyncio
import logging
import os
import time
from aiohttp import web
import aiohttp

logger = logging.getLogger("health-check")


async def health_check(request):
    """Health check endpoint for load balancers/monitoring"""
    try:
        health_status = {
            "status": "healthy",
            "timestamp": time.time(),
            "version": "1.0.0",
            "agent": "agent11",
            "checks": {}
        }
        
        # Check environment variables
        required_vars = [
            "OPENAI_API_KEY",
            "LIVEKIT_URL", 
            "LIVEKIT_API_KEY",
            "LIVEKIT_API_SECRET",
            "ELEVENLABS_API_KEY"
        ]
        
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        if missing_vars:
            health_status["status"] = "unhealthy"
            health_status["checks"]["environment"] = {
                "status": "failed",
                "message": f"Missing environment variables: {', '.join(missing_vars)}"
            }
        else:
            health_status["checks"]["environment"] = {"status": "passed"}
        
        # Check OpenAI API (optional - could be expensive)
        # health_status["checks"]["openai"] = await check_openai_api()
        
        # Check LiveKit connection (optional - could be expensive)
        # health_status["checks"]["livekit"] = await check_livekit_connection()
        
        status_code = 200 if health_status["status"] == "healthy" else 503
        return web.json_response(health_status, status=status_code)
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return web.json_response({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": time.time()
        }, status=503)


async def readiness_check(request):
    """Readiness check for Kubernetes/container orchestration"""
    try:
        # Add readiness checks here
        # - Check if agent is ready to accept new sessions
        # - Check if all required services are available
        
        return web.json_response({
            "status": "ready",
            "timestamp": time.time()
        })
    except Exception as e:
        return web.json_response({
            "status": "not_ready",
            "error": str(e),
            "timestamp": time.time()
        }, status=503)


async def liveness_check(request):
    """Liveness check for Kubernetes/container orchestration"""
    try:
        # Basic liveness check - if this endpoint responds, the process is alive
        return web.json_response({
            "status": "alive",
            "timestamp": time.time()
        })
    except Exception as e:
        return web.json_response({
            "status": "dead",
            "error": str(e),
            "timestamp": time.time()
        }, status=503)


async def start_health_server():
    """Start health check server"""
    app = web.Application()
    app.router.add_get('/health', health_check)
    app.router.add_get('/ready', readiness_check)
    app.router.add_get('/live', liveness_check)
    
    port = int(os.getenv("HEALTH_CHECK_PORT", "8011"))
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', port)
    await site.start()
    logger.info(f"✅ Health check server started on port {port}")
    return runner


if __name__ == "__main__":
    # For testing the health check server standalone
    async def main():
        runner = await start_health_server()
        try:
            while True:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            await runner.cleanup()
    
    asyncio.run(main())
