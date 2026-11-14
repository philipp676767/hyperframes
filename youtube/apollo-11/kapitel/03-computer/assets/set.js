// Chapter 3: a dark stage for the computer (side scene): near-black, a warm
// spotlight, a cool rim, glossy floor.
import { setSky, SKIES, darkStage, finishSet } from "./environments.js";
setSky(SKIES.studio);
darkStage({ accent: 0x6f8dff, spot: 0xffe6c8, r: 22 });
finishSet({ ground: 0x14161f });
