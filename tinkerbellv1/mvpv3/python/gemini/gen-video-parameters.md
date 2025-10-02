# Veo Parameter Reference (Python)

| Field | Type | Allowed values | Notes |
| --- | --- | --- | --- |
| `aspect_ratio` | str | `"16:9"`, `"1:1"`, `"9:16"` | Match distribution channel. |
| `duration_seconds` | int | 2–12 | Longer = more cost and render time. |
| `frame_rate` | int | 12, 24, 30 | `24` for cinematic. |
| `motion_intensity` | str | `"low"`, `"medium"`, `"high"` | Controls scene dynamics. |
| `camera` | dict | `{"movements": ["dolly-in"]}` | Optional camera choreography. |
| `style` | dict | `{"preset": "cinematic", "descriptors": ["soft lighting"]}` | Dial in look & feel. |
| `seed` | int | 0–2³²−1 | Deterministic variations. |
| `safety_filter_level` | str | `"standard"`, `"strict"` | Tighten moderation. |

## Config Presets

```python
VEO_PRESETS = {
    "social_teaser": {
        "aspect_ratio": "9:16",
        "duration_seconds": 6,
        "frame_rate": 24,
        "motion_intensity": "medium",
        "style": {
            "preset": "cinematic",
            "descriptors": ["soft lighting", "bokeh"],
        },
    },
    "product_demo": {
        "aspect_ratio": "16:9",
        "duration_seconds": 8,
        "frame_rate": 30,
        "motion_intensity": "high",
        "camera": {"movements": ["orbit-right", "dolly-in"]},
        "style": {
            "preset": "hyperreal",
            "descriptors": ["studio lighting"],
        },
    },
}
```

## Error Handling
- `InvalidArgument`: check enum strings and ranges.
- `ResourceExhausted`: backoff and retry; consider queueing.
- `FailedPrecondition`: ensure allow-list is active.

Log presets with each generated asset to enable reproducibility.
