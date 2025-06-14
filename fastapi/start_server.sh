#!/bin/bash
source /home/husain/rolevate/fastapi/venv/bin/activate
cd /home/husain/rolevate/fastapi
exec uvicorn main:app --host 0.0.0.0 --port 8000
