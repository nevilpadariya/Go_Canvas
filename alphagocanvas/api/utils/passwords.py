import hashlib
import hmac
import secrets


PASSWORD_SCHEME = "pbkdf2_sha256"
DEFAULT_ITERATIONS = 310000


def hash_password(password: str, iterations: int = DEFAULT_ITERATIONS) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with random salt."""
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations,
    )
    return f"{PASSWORD_SCHEME}${iterations}${salt}${dk.hex()}"


def _verify_hashed_password(plain_password: str, stored_hash: str) -> bool:
    try:
        scheme, iteration_str, salt, digest_hex = stored_hash.split("$", 3)
        if scheme != PASSWORD_SCHEME:
            return False
        iterations = int(iteration_str)
    except (ValueError, TypeError):
        return False

    computed = hashlib.pbkdf2_hmac(
        "sha256",
        plain_password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations,
    ).hex()
    return hmac.compare_digest(computed, digest_hex)


def is_hashed_password(value: str | None) -> bool:
    return bool(value and value.startswith(f"{PASSWORD_SCHEME}$"))


def verify_password(plain_password: str, stored_password: str | None) -> bool:
    """Verify password, supporting both hashed and legacy plain-text values."""
    if not stored_password:
        return False
    if is_hashed_password(stored_password):
        return _verify_hashed_password(plain_password, stored_password)
    # Legacy fallback for existing plain-text rows.
    return hmac.compare_digest(plain_password, stored_password)
