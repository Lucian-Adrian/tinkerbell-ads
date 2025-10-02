feedbackImage generation API

bookmark_border
Release Notes
The Imagen API lets you generate high quality images in seconds, using text prompt to guide the generation. You can also upscale images using Imagen API.

View Imagen for Generation model card

Supported Models

Caution: Starting on June 24, 2025, Imagen versions 1 and 2 are deprecated. Imagen models imagegeneration@002, imagegeneration@005, and imagegeneration@006 will be removed on September 24, 2025 . For more information about migrating to Imagen 3, see Migrate to Imagen 3.
Imagen API supports the following models:

imagen-4.0-generate-001
imagen-4.0-fast-generate-001
imagen-4.0-ultra-generate-001
imagen-3.0-generate-002
imagen-3.0-generate-001
imagen-3.0-fast-generate-001
imagen-3.0-capability-001
imagegeneration@006
imagegeneration@005
imagegeneration@002
Important: imagen-4.0-fast-generate-001 may generate undesireable results if the prompt is complex and you use enhanced prompts. To fix this, set enhancePrompt to false.
For more information about the features that each model supports, see Imagen models.

Example syntax
Syntax to create an image from a text prompt.

Syntax
Syntax to generate an image.

REST
Python


curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \

https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_VERSION}:predict \
-d '{
  "instances": [
    {
      "prompt": "..."
    }
  ],
  "parameters": {
    "sampleCount": ...
  }
}'
Generate images
REST
Python
Parameters
prompt	
string

Required. The text prompt for the image.

add_watermark	
bool

Optional. Add a watermark to the generated image.

The default value is true, except for the following models:

imagegeneration@002
imagegeneration@005
aspect_ratio	
string

Optional. The aspect ratio for the generated output image. The default value is "1:1". This parameter doesn't apply to upscaled output.

compression_quality	
int

Optional. The level of compression if the output mime type is "image/jpeg". The default value is 75.

language	
string

Optional. The language of the text prompt for the image. The following values are supported:

auto: Automatic detection. If Imagen detects a supported language, the prompt and an optional negative prompt are translated to English. If the language detected isn't supported, Imagen uses the input text verbatim, which might result in an unexpected output. No error code is returned.
en: English (if omitted, the default value)
zh or zh-CN: Chinese (simplified)
zh-TW: Chinese (traditional)
hi: Hindi
ja: Japanese
ko: Korean
pt: Portuguese
es: Spanish
The default value is "auto".

negative_prompt	
string

Optional. A description of what to discourage in the generated images.

negative_prompt isn't supported by imagen-3.0-generate-002 and newer models.

number_of_images	
int

Required. The number of images to generate. The default value is 1.

output_gcs_uri	
string

Optional. Cloud Storage URI to store the generated images.

output_mime_type	
string

Optional. The image format that the output should be saved as. The following values are supported:

"image/png": Save as a PNG image
"image/jpeg": Save as a JPEG image
The default value is "image/png".

person_generation	
string

Optional. Allow generation of people by the model. The following values are supported:

"dont_allow": Block generation of people
"allow_adult": Generate adults, but not children
"allow_all": Generate adults and children
The default value is "allow_adult".

safety_filter_level	
string

Optional. Adds a filter level to safety filtering. The following values are supported:

"block_low_and_above": The strongest filtering level, resulting in the most strict blocking. Deprecated value: "block_most".
"block_medium_and_above": Block some problematic prompts and responses. Deprecated value: "block_some".
"block_only_high": Block fewer problematic prompts and responses. Deprecated value: "block_few".
"block_none": Block very few problematic prompts and responses. Deprecated value: "block_fewest".
The default value is "block_medium_and_above".

sample_image_size	
string

Optional. Specifies the generated image's output resolution. The accepted values are "1K" or "2K". The default value is "1K".

seed	
int

Optional. The random seed for image generation. This isn't available when addWatermark is set to true.

If enhancePrompt is set to true, the seed won't work, because enhancePrompt generates a new prompt, which results in a new or different image.

Upscale images
REST
Parameter
mode	
string

Required. Must be set to "upscale" for upscaling requests.

upscaleConfig	
UpscaleConfig

Required. An UpscaleConfig object.

outputOptions	
OutputOptions

Optional. Describes the output image format in an outputOptions object.

storageUri	
string

Optional. Cloud Storage URI for where to store the generated images.

Upscale config object
Parameter
upscaleConfig.upscaleFactor	
string

Required. The upscale factor. The supported values are "x2" and "x4".

Response
The response body from the REST request.

Parameter
predictions	An array of VisionGenerativeModelResult objects, one for each requested sampleCount. If any images are filtered by responsible AI, they are not included, unless includeRaiReason is set to true.
Examples
The following examples show how to use the Imagen models to generate images.

Generate images
REST
Python
Before trying this sample, follow the Python setup instructions in the Vertex AI quickstart using client libraries. For more information, see the Vertex AI Python API reference documentation.

To authenticate to Vertex AI, set up Application Default Credentials. For more information, see Set up authentication for a local development environment.

In this sample you call the generate_images method on the ImageGenerationModel (@006 version) and save generated images locally. You then can optionally use the show() method in a notebook to show you the generated images. For more information on model versions and features, see model versions.





import vertexai
from vertexai.preview.vision_models import ImageGenerationModel

# TODO(developer): Update and un-comment below lines
# PROJECT_ID = "your-project-id"
# output_file = "input-image.png"
# prompt = "" # The text prompt describing what you want to see.

vertexai.init(project=PROJECT_ID, location="us-central1")

model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-002")

images = model.generate_images(
    prompt=prompt,
    # Optional parameters
    number_of_images=1,
    language="en",
    # You can't use a seed value and watermark at the same time.
    # add_watermark=False,
    # seed=100,
    aspect_ratio="1:1",
    safety_filter_level="block_some",
    person_generation="allow_adult",
)

images[0].save(location=output_file, include_generation_parameters=False)

# Optional. View the generated image in a notebook.
# images[0].show()

print(f"Created output image using {len(images[0]._image_bytes)} bytes")
# Example response:
# Created output image using 1234567 bytes
Upscale images
REST
Before using any of the request data, make the following replacements:

LOCATION: Your project's region. For example, us-central1, europe-west2, or asia-northeast3. For a list of available regions, see Generative AI on Vertex AI locations.
PROJECT_ID: Your Google Cloud project ID.
B64_BASE_IMAGE: The base image to edit or upscale. The image must be specified as a base64-encoded byte string. Size limit: 10 MB.
IMAGE_SOURCE: The Cloud Storage location of the image you want to edit or upscale. For example: gs://output-bucket/source-photos/photo.png.
UPSCALE_FACTOR: Optional. The factor to which the image will be upscaled. If not specified, the upscale factor will be determined from the longer side of the input image and sampleImageSize. Available values: x2 or x4 .
HTTP method and URL:



POST https://LOCATION-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/LOCATION/publishers/google/models/imagegeneration@002:predict
Request JSON body:



{
  "instances": [
    {
      "prompt": "",
      "image": {
        // use one of the following to specify the image to upscale
        "bytesBase64Encoded": "B64_BASE_IMAGE"
        "gcsUri": "IMAGE_SOURCE"
        // end of base image input options
      },
    }
  ],
  "parameters": {
    "sampleCount": 1,
    "mode": "upscale",
    "upscaleConfig": {
      "upscaleFactor": "UPSCALE_FACTOR"
    }
  }
}
To send your request, choose one of these options:

curl
PowerShell
Note: The following command assumes that you have logged in to the gcloud CLI with your user account by running gcloud init or gcloud auth login , or by using Cloud Shell, which automatically logs you into the gcloud CLI . You can check the currently active account by running gcloud auth list.
Save the request body in a file named request.json, and execute the following command:



curl -X POST \
     -H "Authorization: Bearer $(gcloud auth print-access-token)" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d @request.json \
     "https://LOCATION-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/LOCATION/publishers/google/models/imagegeneration@002:predict"
You should receive a JSON response similar to the following:


{
  "predictions": [
    {
      "mimeType": "image/png",
      "bytesBase64Encoded": "iVBOR..[base64-encoded-upscaled-image]...YII="
    }
  ]
}
