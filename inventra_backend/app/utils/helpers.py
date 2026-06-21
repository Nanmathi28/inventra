from datetime import datetime, timedelta


def calculate_days_until_expiry(expiry_date: datetime) -> int:
    return (expiry_date - datetime.now()).days


def is_expiry_critical(expiry_date: datetime, days_threshold: int = 30) -> bool:
    return calculate_days_until_expiry(expiry_date) <= days_threshold


def is_expiry_warning(expiry_date: datetime, days_min: int = 31, days_max: int = 90) -> bool:
    days_until = calculate_days_until_expiry(expiry_date)
    return days_min <= days_until <= days_max


def format_date(date: datetime) -> str:
    return date.strftime("%Y-%m-%d")
