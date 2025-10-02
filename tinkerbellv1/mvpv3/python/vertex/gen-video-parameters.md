# Veo Parameter Matrix (Python)

| Parameter | Location | Notes |
| --- | --- | --- |
| `video_config.aspect_ratio` | `generation_config` | `"16:9"`, `"1:1"`, `"9:16"`. |
| `video_config.duration_seconds` | `generation_config` | 2–12 seconds. |
| `video_config.frame_rate` | `generation_config` | 12, 24, 30 fps. |
| `video_config.motion_intensity` | `generation_config` | `low`, `medium`, `high`. |
| `video_config.style.preset` | `generation_config` | `cinematic`, `hyperreal`, `animation`. |
| `video_config.style.descriptors` | `generation_config` | Additional adjectives for fine-tuning. |
| `video_config.camera.movements` | `generation_config` | e.g., `"orbit-left"`, `"dolly-in"`. |
| `video_config.seed` | `generation_config` | 0–2³²−1 for reproducibility. |
| `safety_filter_level` | `generation_config` | `standard` or `strict`. |
| `labels` | request metadata | Propagate to Cloud Logging / Monitoring. |

## Presets

```python
VERTEX_VEO_PRESETS = {
    "cmo_showcase": {
        "aspect_ratio": "16:9",
        "duration_seconds": 8,
        "frame_rate": 24,
        "motion_intensity": "medium",
        "labels": {"campaign": "spring-launch"},
    },
    "short_form_vertical": {
        "aspect_ratio": "9:16",
        "duration_seconds": 6,
        "frame_rate": 30,
        "motion_intensity": "high",
    },
}
```

## Monitoring
- Use Cloud Monitoring metric `aiplatform.googleapis.com/prediction/latencies` filtered by model.
- Alert on latency > 60s or error rate > 5%.
- Persist presets in Firestore or Config Controller to sync with JS clients.
