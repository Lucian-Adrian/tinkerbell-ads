from google import genai
from google.genai.types import HttpOptions

client = genai.Client(http_options=HttpOptions(api_version="v1"))
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="How does AI work?",
)
print(response.text)
# Example response:
# Okay, let's break down how AI works. It's a broad field, so I'll focus on the ...
#
# Here's a simplified overview:
# ...


from google import genai
from google.genai.types import Tool, GenerateContentConfig, HttpOptions, UrlContext

client = genai.Client(http_options=HttpOptions(api_version="v1"))
model_id = "gemini-2.5-flash"

url_context_tool = Tool(
    url_context = UrlContext
)

response = client.models.generate_content(
    model=model_id,
    contents="Compare recipes from YOUR_URL1 and YOUR_URL2",
    config=GenerateContentConfig(
        tools=[url_context_tool],
        response_modalities=["TEXT"],
    )
)

for each in response.candidates[0].content.parts:
    print(each.text)
# get URLs retrieved for context
print(response.candidates[0].url_context_metadata)
