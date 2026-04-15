from typing import Iterable, List, Optional


def parse_csv_param(raw_value: Optional[str]) -> List[str]:
    if not raw_value:
        return []
    return [item.strip() for item in raw_value.split(",") if item.strip()]


def normalize_severity(values: Iterable[str]) -> List[str]:
    allowed = {"low", "moderate", "high"}
    return [value.lower() for value in values if value.lower() in allowed]
