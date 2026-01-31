#!/usr/bin/env python3
from dotenv import load_dotenv

from alphagocanvas.database.connection import ENGINE
from alphagocanvas.database.models import Base


def main() -> None:
    load_dotenv()
    Base.metadata.create_all(bind=ENGINE)
    print("Database initialized.")


if __name__ == "__main__":
    main()
