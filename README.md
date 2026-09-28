# Torrente: La Saga

A browser platformer inspired by Super Mario Bros. Plain HTML5 Canvas and JavaScript: no build step, no dependencies.

## Play online

**https://pedcremo.github.io/torrente-la-saga/** (desktop and mobile)

## Run locally

- Open `index.html` in a browser, **or**
- `npx serve .` (or `python3 -m http.server 8000`) and visit the printed URL.

## Controls

| Key | Action |
|---|---|
| ← → / A D | Move |
| Space / ↑ / W / Z | Jump (hold to jump higher) |
| Shift / X | Run |
| C / K | Megaphone (film 6 only) |
| P | Pause |
| M | Music on/off (setting is remembered) |
| ◀ ▶ on the title screen | Choose film |
| Enter / click | Start / continue |

**Mobile:** on-screen buttons appear automatically on touch devices: ◀ ▶ (you can slide your thumb between them), SALTAR (jump), CORRER (run on/off), MITIN (megaphone, film 6 only), ♪ (music) and II (pause). Tap the screen to start. Landscape works best.

**Music:** an original beach rumba over the Andalusian cadence (Am–G–F–E), made in code with WebAudio. A faster version plays while El Fary's blessing is active and on the reward screen.

**Using your own song (e.g. El Fary):** copy an audio file you own (mp3/ogg/m4a) into `assets/` and set its path in `assets/music.js`:

```js
window.TORRENTE_MUSIC = { play: 'assets/fary.mp3', fary: null, volume: 0.6 };
```

`play` is used on the title screen and in the level, and `fary` while the blessing is active. Any value left `null` uses the built-in synth. If the file can't be loaded, you get a console warning and the game falls back to the synth music.

## The six films

One level per film. Each has its own setting, enemies, closing bar and a gameplay twist:

| # | Film | Setting | Twist |
|---|---|---|---|
| 1 | El brazo tonto de la ley (1998) | Madrid at night | **Darkness**: you only see what Torrente and the street lamps light up |
| 2 | Misión en Marbella (2001) | Beach | **Missiles**: an alert shows where one will cross; jump it or stomp it |
| 3 | El protector (2005) | Central Madrid | **Escort**: the MEP follows your path; if an enemy touches her, you lose a life |
| 4 | Lethal Crisis (2011) | Prison | **Searchlights**: if one catches you, the alarm sounds and guards come. "3D" title |
| 5 | Operación Eurovegas (2014) | Casino | **Slot machines**: `?` blocks spin; 777 = jackpot, or "la banca gana" (−3 €) |
| 6 | Torrente Presidente (2026) | Election campaign | **Votes + megaphone**: 50 % of the votes or more makes you president |

In every film:
- Collect **euros**. Every 50 € gives an extra life.
- Hit the purple **F** block for **El Fary's blessing**: 10 s of invincibility.
- At the flag, Torrente walks into the bar. He's paid in whiskys and beers: the more euros in that film, the more drinks.
- Losing a life restarts the film. The title screen lets you pick any film.

## Code layout

Plain scripts loaded in order by `index.html`:

- `src/core.js`: constants, keyboard/touch input, sound effects and music, drawing helpers, tiles and physics
- `src/art.js`: shape-drawn characters, enemies, items and goal bars
- `src/levels.js`: the themes (backgrounds, tile colours, scenery) and the six level layouts
- `src/game.js`: game states, the twist for each film, HUD, screens and the main loop
