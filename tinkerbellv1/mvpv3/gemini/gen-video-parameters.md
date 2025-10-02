# Veo Parameter Reference (JavaScript)

Use these knobs when calling `generateContent` with `model: 'veo-003'`.

| Field | Type | Allowed values | Notes |
| --- | --- | --- | --- |
| `aspectRatio` | string | `"16:9"`, `"1:1"`, `"9:16"` | Match your delivery platform (YouTube, TikTok, etc.). |
| `durationSeconds` | number | `2` – `12` | Longer videos take longer to render; cost scales linearly. |
| `frameRate` | number | `12`, `24`, `30` | Higher fps = smoother motion, bigger files. |
| `motionIntensity` | string | `"low"`, `"medium"`, `"high"` | Controls how dynamic the scene moves. |
| `camera` | object | `{ movements: string[] }` | Example: `{ movements: ['dolly-in', 'orbit-left'] }`. |
| `style` | object | `{ preset: string, descriptors: string[] }` | Presets: `cinematic`, `hyperreal`, `illustration`. |
| `seed` | number | 0 – 2³²-1 | Reproducible variations. |
| `safetyFilterLevel` | string | `"standard"`, `"strict"` | Stricter reduces chance of disallowed content but may over-block. |

## Example: Config Factory

```js
export const veoPresets = {
	socialTeaser: {
		aspectRatio: '9:16',
		durationSeconds: 6,
		frameRate: 24,
		motionIntensity: 'medium',
		style: {
			preset: 'cinematic',
			descriptors: ['soft lighting', 'shallow depth of field']
		}
	},
	productDemo: {
		aspectRatio: '16:9',
		durationSeconds: 8,
		frameRate: 30,
		motionIntensity: 'high',
		camera: { movements: ['orbit-right', 'dolly-in'] },
		style: {
			preset: 'hyperreal',
			descriptors: ['studio lighting']
		}
	}
};
```

## Error Handling
- `INVALID_ARGUMENT`: parameter mismatch. Double-check enumerations.
- `RESOURCE_EXHAUSTED`: quota exceeded. Delay and retry with exponential backoff.
- `FAILED_PRECONDITION`: project not allow-listed.

Log parameter sets alongside generated assets so you can reproduce top-performing clips.
