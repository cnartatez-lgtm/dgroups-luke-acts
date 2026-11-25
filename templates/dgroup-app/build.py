"""Export a fresh static English study site from an editorial JSON file (Python 3.9+)."""
import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from tempfile import TemporaryDirectory
from shutil import copyfile


ROOT = Path(__file__).resolve().parent
ASSETS = ("index.html", "styles.css", "app.js", "tutorial.js", "tutorial.css", "selectors.css")


def field(record, key):
    value = record.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"Expected non-empty text for {key}")
    return value


def released_content(source, now):
    seen = set()
    weeks = []
    for week in source["weeks"]:
        number = week["number"]
        if type(number) is not int or number < 1 or number in seen:
            raise ValueError(f"Invalid or duplicate week number: {number}")
        seen.add(number)
        if week.get("approved") is not True:
            continue
        release = datetime.fromisoformat(field(week, "releaseAt").replace("Z", "+00:00"))
        if release.tzinfo is None:
            raise ValueError(f"Week {number} needs a release time with a UTC offset")
        if release <= now:
            weeks.append({"number": number, "reference": field(week, "reference"), "scripture": field(week, "scripture")})
    return {"title": field(source, "title"), "edition": field(source, "edition"),
            "weeks": sorted(weeks, key=lambda week: week["number"])}


def build(content_path, destination):
    if destination.exists():
        raise ValueError(f"Choose a new output directory: {destination}")
    if destination == ROOT or ROOT in destination.parents:
        raise ValueError("Choose an output directory outside the template")
    source = json.loads(content_path.read_text(encoding="utf-8"))
    public = released_content(source, datetime.now(timezone.utc))
    destination.parent.mkdir(parents=True, exist_ok=True)
    with TemporaryDirectory(dir=destination.parent) as staging:
        site = Path(staging) / "site"
        site.mkdir()
        for name in ASSETS:
            copyfile(ROOT / "starter" / name, site / name)
        (site / "study.json").write_text(json.dumps(public, ensure_ascii=False, indent=2), encoding="utf-8")
        site.rename(destination)
    return len(public["weeks"])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--content", type=Path, default=ROOT / "example.json")
    args = parser.parse_args()
    try:
        count = build(args.content.resolve(), args.destination.resolve())
    except (KeyError, TypeError, ValueError, OSError) as error:
        parser.exit(1, f"Build failed: {error}\n")
    print(f"Exported {count} released study weeks to {args.destination.resolve()}")
