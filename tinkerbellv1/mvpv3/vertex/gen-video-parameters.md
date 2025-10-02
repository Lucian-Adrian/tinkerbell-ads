# Veo Parameters on Vertex (JavaScript)

Same structure as consumer API, with extra enterprise toggles.

| Parameter | Type | Notes |
| --- | --- | --- |
| `videoConfig.aspectRatio` | string | `16:9`, `1:1`, `9:16`. |
| `videoConfig.durationSeconds` | number | 2–12 seconds. |
| `videoConfig.frameRate` | number | 12, 24, 30. |
| `videoConfig.motionIntensity` | string | `low`, `medium`, `high`. |
| `videoConfig.style.preset` | string | `cinematic`, `hyperreal`, `animation`. |
| `videoConfig.style.descriptors` | string[] | Additional adjectives. |
| `videoConfig.camera` | object | Movements such as `orbit-left`. |
| `videoConfig.seed` | number | Deterministic output. |
| `safetyFilterLevel` | string | `standard`, `strict`. |
| `labels` | Record<string,string> | Custom labels propagated to Vertex operations and logs. |

## Recommended Presets

```js
export const vertexVeoPresets = {
  cmoShowcase: {
    aspectRatio: '16:9',
    durationSeconds: 8,
    frameRate: 24,
    motionIntensity: 'medium',
    labels: { campaign: 'spring-launch' }
  },
  shortFormVertical: {
    aspectRatio: '9:16',
    durationSeconds: 6,
    frameRate: 30,
    motionIntensity: 'high'
  }
};
```

## Monitoring
- Use Cloud Monitoring metrics `aiplatform.googleapis.com/prediction/latencies` filtered by model name.
- Alert when latency > 60s or error rate > 5%.
- Store presets in Firestore to reuse across languages.
