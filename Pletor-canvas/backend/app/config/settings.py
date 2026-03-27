from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./dev.db"
    PORT: int = 8080
    HOST: str = "0.0.0.0"
    CORS_ORIGIN: str = "http://localhost:3000"
    ANTHROPIC_API_KEY: str | None = None
    WORKFLOWY_API_KEY: str | None = None

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
