from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Required API keys
    finnhub_api_key: str = ""
    fred_api_key: str = ""

    # Optional API keys
    alpha_vantage_api_key: str = ""
    polygon_api_key: str = ""
    newsapi_key: str = ""

    # Infrastructure
    redis_url: str = "redis://localhost:6379"
    cors_origins: str = "http://localhost:3000"
    env: str = "development"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
