generation_model = ImageGenerationModel.from_pretrained("MODEL_VERSION")

response = generation_model.generate_images(
    prompt="...",
    negative_prompt="...",
    aspect_ratio=...,
)
response.images[0].show()


# curl -X POST \
#   -H "Authorization: Bearer $(gcloud auth print-access-token)" \
#   -H "Content-Type: application/json" \

# https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_VERSION}:predict \
# -d '{
#   "instances": [
#     {
#       "prompt": "..."
#     }
#   ],
#   "parameters": {
#     "sampleCount": ...
#   }
# }'