from datetime import datetime


def get_current_semester_code(now: datetime | None = None) -> str:
    current = now or datetime.utcnow()
    month = current.month
    year_suffix = f"{current.year % 100:02d}"

    if month <= 5:
        term = "SPRING"
    elif month <= 7:
        term = "SUMMER"
    else:
        term = "FALL"

    return f"{term}{year_suffix}"
