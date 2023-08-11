import os
from dotenv import load_dotenv
from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import HumanMessagePromptTemplate, ChatPromptTemplate
from pydantic import BaseModel, Field
from langchain.output_parsers import PydanticOutputParser


class LearningPath(BaseModel):
    step_1: str = Field(description="First step")
    step_2: str = Field(description="Second step")
    step_3: str = Field(description="Third step")
    step_4: str = Field(description="Fourth step")
    step_5: str = Field(description="Fifth step")


class GetLearningPath:
    def __init__(self):
        load_dotenv()
        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        self.OPENAI_MODEL = "gpt-4"

    def run(self):
        PROMPT_TEMPLATE = """
                        Give me a path to learning {subject}.
                        {format_instructions}
        """
        llm = ChatOpenAI(openai_api_key=self.OPENAI_API_KEY, model=self.OPENAI_MODEL)
        parser = PydanticOutputParser(pydantic_object=LearningPath)

        subject: str = input(
            f"\n{'_'*80}\n\nEnter the subject you would like to learn about: "
        )

        message = HumanMessagePromptTemplate.from_template(template=PROMPT_TEMPLATE)
        chat_prompt = ChatPromptTemplate.from_messages(messages=[message])

        chat_prompt_with_values = chat_prompt.format_prompt(
            subject=subject, format_instructions=parser.get_format_instructions()
        )
        prompt_message: list = chat_prompt_with_values.to_messages()

        response = llm(prompt_message)
        data = parser.parse(response.content)

        print(f"\n\n")
        for field_name, value in data.dict().items():
            print(f"\n{field_name.strip('step_')}) {value} \n")
        print(f"\n{'_'*80}\n")

    def _Original(self):
        # TODO: fix type hint in OpenAI langchain class such that client and model
        # are optional
        llm = OpenAI(openai_api_key=self.OPENAI_API_KEY)  # type: ignore
        result: str = llm.predict(
            """
            Tell me 5 interesting facts about FastAPI vs Flask vs Django!
        """
        )

        print(result)
