"""Smoke test the starter export without changing any existing site."""
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from build import ASSETS, ROOT, build, released_content


class ExportTest(unittest.TestCase):
    def test_release_boundary(self):
        release = datetime(2030, 1, 7, 7, tzinfo=timezone(timedelta(hours=1)))
        source = {"title": "Example", "edition": "Example", "weeks": [
            {"number": 1, "approved": True, "releaseAt": release.isoformat(),
             "reference": "Sample reference", "scripture": "Sample reading", "editor": "private marker"},
            {"number": 2, "approved": False, "scripture": "private draft"}
        ]}
        self.assertEqual(released_content(source, release - timedelta(microseconds=1))["weeks"], [])
        result = released_content(source, release.astimezone(timezone.utc))["weeks"]
        self.assertEqual(result, [{"number": 1, "reference": "Sample reference", "scripture": "Sample reading"}])
        source["weeks"][0]["releaseAt"] = "2030-01-07T07:00:00"
        with self.assertRaises(ValueError):
            released_content(source, release)

    def test_example(self):
        with TemporaryDirectory() as directory:
            site = Path(directory) / "site"
            self.assertEqual(build(ROOT / "example.json", site), 2)
            self.assertEqual({entry.name for entry in site.iterdir()}, {*ASSETS, "study.json"})
            public = json.loads((site / "study.json").read_text(encoding="utf-8"))
            self.assertEqual([week["number"] for week in public["weeks"]], [1, 2])
            with self.assertRaises(ValueError):
                build(ROOT / "example.json", site)


if __name__ == "__main__":
    unittest.main()
