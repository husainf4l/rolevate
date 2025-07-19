import json
import logging
from typing import AsyncIterator

from livekit.agents import llm
from livekit.plugins import openai

logger = logging.getLogger(__name__)


class LLM(openai.LLM):
    def __init__(self):
        super().__init__(model="gpt-4o")

    async def chat(
        self,
        history: list[llm.ChatMessage],
        temperature: float | None = None,
        n: int | None = None,
        stop: str | list[str] | None = None,
        max_tokens: int | None = None,
        **kwargs,
    ) -> AsyncIterator[llm.ChatItem]:

        prompt = self.system_prompt(history)

        # Use OpenAI's client to create a chat completion
        response = await self._client.chat.completions.create(
            messages=prompt,
            model=self.model,
            temperature=temperature,
            n=n,
            stop=stop,
            max_tokens=max_tokens,
            stream=True,
            response_format={"type": "json_object"},
        )

        full_response = ""
        try:
            async for chunk in response:
                content = chunk.choices[0].delta.content
                if content:
                    full_response += content

            # Parse the full JSON response
            parsed_response = json.loads(full_response)

            # Extract the message and end_interview flag
            message = parsed_response.get("message", "")
            end_interview = parsed_response.get("end_interview", False)

            # Yield the message as a ChatItem
            choice = llm.ChatChoice(delta=llm.ChatDelta(content=message))
            yield llm.ChatItem(choice=choice)

            # If the end_interview flag is set, yield a ChatItem with user_data
            if end_interview:
                yield llm.ChatItem(user_data={"end_interview": True})

        except Exception as e:
            logger.error(f"Error processing LLM stream: {e}")
