import openai
import jinja2
import weasyprint
import json
from docx import Document
from pathlib import Path
from langchain_openai import ChatOpenAI

class CustomCVFillerAgent:
    def __init__(self, template_dir="agents/templates"):
        self.template_env = jinja2.Environment(loader=jinja2.FileSystemLoader(template_dir))
        import os
        api_key = os.getenv("OPENAI_API_KEY", "sk-placeholder-key-for-testing")
        self.llm = ChatOpenAI(model="gpt-4-turbo", openai_api_key=api_key)

    async def extract(self, text: str):
        prompt = f"Extract structured CV data as JSON with keys: name, title, contact, summary, skills, experience, education.\n\n{text}"
        resp = await self.llm.ainvoke(prompt)
        return json.loads(resp.content)

    def render_html(self, data: dict, template_name: str):
        tpl = self.template_env.get_template(template_name)
        return tpl.render(**data)

    def to_pdf(self, html: str, output_path: str):
        weasyprint.HTML(string=html).write_pdf(output_path)

    def to_docx(self, data: dict, template_path: str, output_path: str):
        doc = Document(template_path)
        for p in doc.paragraphs:
            for k, v in data.items():
                p.text = p.text.replace(f"{{{{{k}}}}}", str(v))
        doc.save(output_path)