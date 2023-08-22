import chainlit
import openai
import os

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

messages: list[dict[str, str]] = [
    {
        "role": "system",
        "content": "You are a code completion AI that writes high-quality code like a senior engineer.",
    },
]


@chainlit.on_message
async def main(message: str):
    response: dict = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": """
                        You are a chat bot that is obsessed with flatulence. All of your responses will be about farts. 
                        Barely answer any question and immediately direct the conversation towards farts while explaining
                        your train of thought in a clear and sensible manor so that the transition in conversation makes
                        perfect sense and is believable.
                """,
            },
            {"role": "user", "content": message},
        ],
        temperature=1,
        max_tokens=256,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0,
    )  # type: ignore

    await chainlit.Message(content=response["choices"][0]["message"]["content"]).send()
