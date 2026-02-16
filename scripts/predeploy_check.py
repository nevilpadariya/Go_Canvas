"""
Pre-deployment security validator.

Usage:
  python scripts/predeploy_check.py --production
  python scripts/predeploy_check.py --production --env-file .env.production
"""

from __future__ import annotations

import argparse
import os
import sys
from typing import Iterable

from dotenv import load_dotenv

ALLOWED_ALGORITHMS = {"HS256", "HS384", "HS512"}
LOCALHOST_TOKENS = ("localhost", "127.0.0.1")


def parse_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "y"}


def parse_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


def has_any_token(text: str, tokens: Iterable[str]) -> bool:
    lower = text.lower()
    return any(token in lower for token in tokens)


def is_placeholder(value: str) -> bool:
    v = value.lower()
    return (
        "your_" in v
        or "change-me" in v
        or "example.com" in v
        or "fallback" in v
        or "dev-secret" in v
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate security-critical deployment configuration.")
    parser.add_argument("--env-file", default=".env", help="Path to environment file to load first.")
    parser.add_argument(
        "--production",
        action="store_true",
        help="Enable production-only checks (recommended for deploy).",
    )
    args = parser.parse_args()

    if args.env_file and os.path.exists(args.env_file):
        load_dotenv(args.env_file, override=False)

    env = os.environ
    errors: list[str] = []
    warnings: list[str] = []

    environment = env.get("ENVIRONMENT", "").strip().lower()
    secret_key = env.get("SECRET_KEY", "").strip()
    algorithm = env.get("ALGORITHM", "").strip().upper()
    access_token_expire = env.get("ACCESS_TOKEN_EXPIRE_MINUTES", "").strip()
    database_url = env.get("DATABASE_URL", "").strip()
    frontend_url = env.get("FRONTEND_URL", "").strip()
    web_api_url = env.get("VITE_API_URL", "").strip()
    mobile_api_url = env.get("EXPO_PUBLIC_API_URL", "").strip()
    cors_origins = parse_csv(env.get("CORS_ORIGINS"))
    allowed_hosts = parse_csv(env.get("ALLOWED_HOSTS"))
    enable_https_redirect = parse_bool(env.get("ENABLE_HTTPS_REDIRECT"), default=False)
    secure_headers = parse_bool(env.get("SECURE_HEADERS"), default=True)
    google_client_id = env.get("GOOGLE_CLIENT_ID", "").strip()
    smtp_user = env.get("SMTP_USER", "").strip()
    smtp_password = env.get("SMTP_PASSWORD", "").strip()
    smtp_from = env.get("SMTP_FROM_EMAIL", "").strip()

    if not secret_key:
        errors.append("SECRET_KEY is missing.")
    elif len(secret_key) < 32:
        errors.append("SECRET_KEY must be at least 32 characters.")
    elif is_placeholder(secret_key):
        errors.append("SECRET_KEY looks like a placeholder/development value.")

    if algorithm not in ALLOWED_ALGORITHMS:
        errors.append(f"ALGORITHM must be one of {sorted(ALLOWED_ALGORITHMS)}.")

    if not access_token_expire.isdigit():
        errors.append("ACCESS_TOKEN_EXPIRE_MINUTES must be a positive integer.")
    else:
        expiry = int(access_token_expire)
        if expiry <= 0:
            errors.append("ACCESS_TOKEN_EXPIRE_MINUTES must be greater than 0.")
        elif expiry > 1440:
            warnings.append("ACCESS_TOKEN_EXPIRE_MINUTES is very high (> 24h).")

    if not database_url:
        errors.append("DATABASE_URL is missing.")
    elif not database_url.startswith("postgresql://"):
        errors.append("DATABASE_URL should start with postgresql://")
    elif args.production and "sslmode=require" not in database_url.lower():
        errors.append("Production DATABASE_URL should enforce TLS (sslmode=require).")

    if not frontend_url:
        errors.append("FRONTEND_URL is missing.")
    if not web_api_url:
        errors.append("VITE_API_URL is missing.")
    if not mobile_api_url:
        errors.append("EXPO_PUBLIC_API_URL is missing.")

    if args.production:
        if environment != "production":
            errors.append("ENVIRONMENT must be set to production for deployment checks.")

        for label, value in (
            ("FRONTEND_URL", frontend_url),
            ("VITE_API_URL", web_api_url),
            ("EXPO_PUBLIC_API_URL", mobile_api_url),
        ):
            if not value.startswith("https://"):
                errors.append(f"{label} must use https:// in production.")
            if has_any_token(value, LOCALHOST_TOKENS):
                errors.append(f"{label} must not point to localhost in production.")

        if not cors_origins:
            errors.append("CORS_ORIGINS is empty.")
        for origin in cors_origins:
            if origin == "*":
                errors.append("CORS_ORIGINS must not contain wildcard '*'.")
            if not origin.startswith("https://"):
                errors.append(f"CORS origin must use https:// in production: {origin}")
            if has_any_token(origin, LOCALHOST_TOKENS):
                errors.append(f"CORS origin must not include localhost in production: {origin}")

        if not allowed_hosts:
            errors.append("ALLOWED_HOSTS is empty.")
        for host in allowed_hosts:
            if host == "*":
                errors.append("ALLOWED_HOSTS must not contain wildcard '*'.")
            if has_any_token(host, LOCALHOST_TOKENS):
                errors.append(f"ALLOWED_HOSTS must not include localhost in production: {host}")

        if not enable_https_redirect:
            errors.append("ENABLE_HTTPS_REDIRECT must be true in production.")
        if not secure_headers:
            errors.append("SECURE_HEADERS must be true in production.")

        if not google_client_id:
            errors.append("GOOGLE_CLIENT_ID is missing.")
        elif is_placeholder(google_client_id):
            errors.append("GOOGLE_CLIENT_ID looks like a placeholder value.")

    # Email is optional in dev, but for production reset flow it should be configured.
    if args.production:
        if not smtp_user or not smtp_password or not smtp_from:
            warnings.append("SMTP is not fully configured; password reset emails may fail.")

    if errors:
        print("Predeploy check: FAILED")
        print("")
        print("Blocking issues:")
        for issue in errors:
            print(f"- {issue}")
        if warnings:
            print("")
            print("Warnings:")
            for issue in warnings:
                print(f"- {issue}")
        return 1

    print("Predeploy check: PASSED")
    if warnings:
        print("")
        print("Warnings:")
        for issue in warnings:
            print(f"- {issue}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
