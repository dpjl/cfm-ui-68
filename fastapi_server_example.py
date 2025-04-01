
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import random
from datetime import datetime, timedelta
from typing import List, Optional

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data for our example
SAMPLE_MEDIA_IDS = [f"{i}" for i in range(1, 51)]  # 50 media IDs
MEDIA_INFO = {}

# Generate random metadata for our sample media
for media_id in SAMPLE_MEDIA_IDS:
    is_video = random.random() < 0.2  # 20% chance of being a video
    extension = random.choice(["mp4", "mov"]) if is_video else random.choice(["jpg", "png"])
    
    # Random date within the last 3 years
    days_ago = random.randint(0, 1095)  # up to 3 years
    created_date = (datetime.now() - timedelta(days=days_ago)).isoformat()
    
    MEDIA_INFO[media_id] = {
        "alt": f"Sample {'Video' if is_video else 'Image'} {media_id}.{extension}",
        "createdAt": created_date
    }

# Mock server status
MOCK_SERVER_STATUS = {
    "isAccessible": True,
    "sourceDirectory": "/home/user/cfm/source_images",
    "destinationDirectory": "/home/user/cfm/processed_images",
    "sourceFileCount": 3487,
    "destinationFileCount": 3152,
    "lastExecutionDate": (datetime.now() - timedelta(hours=3, minutes=27)).isoformat(),
    "destinationFormat": "YYYY/MM/DD/Original_Filename"
}

# API Routes
@app.get("/status")
async def get_server_status():
    """Return the status of the server and application"""
    # In a real implementation, this would check actual statuses
    # Generate some random variation in the counts to simulate changes
    MOCK_SERVER_STATUS["sourceFileCount"] = 3487 + random.randint(-10, 10)
    MOCK_SERVER_STATUS["destinationFileCount"] = 3152 + random.randint(-5, 5)
    MOCK_SERVER_STATUS["lastExecutionDate"] = (datetime.now() - timedelta(
        hours=random.randint(0, 5), 
        minutes=random.randint(0, 59)
    )).isoformat()
    
    return MOCK_SERVER_STATUS

@app.get("/media")
async def get_media_ids(directory: str) -> List[str]:
    """Return just the IDs of media in the specified directory"""
    # In a real implementation, this would query your database or filesystem
    return SAMPLE_MEDIA_IDS

@app.get("/info")
async def get_media_info(id: str):
    """Return metadata for a specific media item"""
    if id in MEDIA_INFO:
        return MEDIA_INFO[id]
    return JSONResponse(
        status_code=404,
        content={"error": f"Media with ID {id} not found"}
    )

@app.get("/thumbnail")
async def get_thumbnail(id: str):
    """Return a thumbnail image for the specified media ID"""
    # In a real implementation, you would return the actual thumbnail
    # For this example, we'll just return a placeholder image
    return FileResponse("public/placeholder.svg")

@app.get("/media")
async def get_media(id: str):
    """Return the full media file for the specified ID"""
    # In a real implementation, you would return the actual media file
    # For this example, we'll just return a placeholder image
    return FileResponse("public/placeholder.svg")

@app.delete("/images")
async def delete_images(request: Request) -> dict:
    data = await request.json()
    image_ids = data.get("imageIds", [])
    # Your logic to delete images
    return {"success": True, "message": f"Deleted {len(image_ids)} images"}

# First handle direct '/index.html' requests
@app.get("/index.html")
async def serve_index_explicit():
    return FileResponse("dist/index.html")

# Mount static files with correct MIME types
# This is crucial for modern JavaScript modules
app.mount("/assets", StaticFiles(directory="dist/assets", html=False), name="assets")

# For other static files in the root like favicon, etc.
# Note: We're excluding the mounting of the root directory to avoid conflicts
# with our specific routes
app.mount("/", StaticFiles(directory="dist", html=False), name="static")

# Special catch-all route for client-side routing
# This must come after all API routes and static file mounts
@app.get("/{full_path:path}")
async def serve_index(full_path: str):
    # Skip API paths to prevent this catch-all from intercepting API requests
    if full_path.startswith("media") or full_path.startswith("info") or full_path.startswith("thumbnail") or full_path.startswith("status"):
        return JSONResponse(status_code=404, content={"detail": "Not Found"})
    
    # Handle direct requests to index.html (although we have an explicit route above)
    if full_path == "index.html":
        return FileResponse("dist/index.html")
        
    # For all frontend routes, serve the index.html
    return FileResponse("dist/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
