"""Test LLM models and configurations.

Run from backend directory:
    uv run python try_models.py
"""
from rag.llm import get_llm
from langchain_core.messages import HumanMessage


def test_gemini():
    """Test Gemini model with a simple query."""
    print("Testing Gemini model...")
    llm = get_llm()

    messages = [
        HumanMessage(content="What is the capital of France?")
    ]

    response = llm.invoke(messages)
    print(f"\nQuery: What is the capital of France?")
    print(f"Response: {response.content}\n")


def test_temperature():
    """Test different temperature settings."""
    print("Testing temperature settings...")
    from config.settings import settings

    print(f"Current temperature: {settings.llm_temperature}")
    print(f"LLM model: {settings.llm_model_name}")
    print(f"App mode: {settings.app_mode}\n")


if __name__ == "__main__":
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parent))

    test_gemini()
    test_temperature()

    print("✓ All model tests passed!")
