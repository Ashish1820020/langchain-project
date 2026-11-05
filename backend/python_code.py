from rag.llm import get_llm, extract_text
from langchain_core.messages import HumanMessage

llm = get_llm()
answer = llm.invoke([HumanMessage(content="What is the capital of France?")])

print(answer.content)
print(extract_text(answer.content))

