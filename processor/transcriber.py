import json
import os
import whisper
import psycopg2
from dotenv import load_dotenv
from moviepy.editor import VideoFileClip

print("🔍 Script started")

# Load .env variables
load_dotenv()

# Connect to PostgreSQL
conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    database=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASS")
)
cursor = conn.cursor()

# Load Whisper model
model = whisper.load_model("base")

# Fetch one unprocessed video
cursor.execute("SELECT * FROM videos WHERE status = 'uploaded' LIMIT 1")
video = cursor.fetchone()
print("📥 Fetched from DB:", video)

if not video:
    print("❌ No videos to process.")
    exit()

video_id, user_id, filename, original_name, path, status, created_at = video
absolute_path = os.path.abspath(os.path.normpath(path))


print(f"🎞 Processing video: {filename}")
print(f"📍 Absolute path: {absolute_path}")

# Ensure the file exists before continuing
if not os.path.exists(absolute_path):
    print("❌ File not found at path:", absolute_path)
    exit()

# Transcribe using Whisper
result = model.transcribe(absolute_path)

segments = result['segments']
print("🧠 Transcription complete")

# Choose a segment for demo (2nd segment)
if len(segments) < 2:
    print("⚠️ Not enough speech segments to generate clip.")
    exit()

clip_start = segments[1]['start']
clip_end = segments[1]['end']

# Define output clip path
output_path = f"clips/{video_id}-{int(clip_start)}-{int(clip_end)}.mp4"
print(f"✂️ Cutting from {clip_start}s to {clip_end}s ➜ {output_path}")

# Cut and export the clip
clip = VideoFileClip(absolute_path).subclip(clip_start, clip_end)
clip.write_videofile(output_path, codec="libx264", audio_codec="aac")

# Save clip path and metadata in DB
cursor.execute(
    "INSERT INTO clips (video_id, start_time, end_time, path) VALUES (%s, %s, %s, %s)",
    (video_id, clip_start, clip_end, output_path)
)

# Update video status to 'done'
cursor.execute(
    "UPDATE videos SET status = 'done' WHERE id = %s",
    (video_id,)
)

conn.commit()
print("✅ Clip saved and database updated.")



# Save transcript JSON next to the video
json_path = os.path.splitext(absolute_path)[0] + ".json"  # replaces .mp4 with .json in full path
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"📝 Transcript saved as {json_path}")
