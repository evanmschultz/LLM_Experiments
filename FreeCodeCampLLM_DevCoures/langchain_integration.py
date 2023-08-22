from typing import Any
import chainlit

# import openai
import os
from langchain import PromptTemplate, OpenAI, LLMChain

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

template: str = """
            Question: {question}

            Answer: Let's think step by step.
"""


@chainlit.on_chat_start
def main():
    prompt = PromptTemplate(template=template, input_variables=["question"])
    llm_chain: LLMChain = LLMChain(
        prompt=prompt,
        llm=OpenAI(
            openai_api_key=OPENAI_API_KEY,
            streaming=True,
            temperature=1,
        ),
        verbose=True,
    )

    chainlit.user_session.set("llm_chain", llm_chain)


@chainlit.on_message
async def handle_message(message: str):
    llm_chain: LLMChain = chainlit.user_session.get("llm_chain")  # type: ignore

    result: dict[str, Any] = await llm_chain.acall(
        message, callbacks=[chainlit.AsyncLangchainCallbackHandler()]
    )

    await chainlit.Message(content=result["text"]).send()
