import CityWorld from "../city-world/CityWorld";

import type {
  ScenarioId,
  ScenarioState,
  Phase,
} from "../city-world/CityWorld";

export type { ScenarioId, ScenarioState, Phase };

type Props = {
  active: ScenarioId;
  phases: ScenarioState;
  runId: number;
  onSelect: (id: ScenarioId) => void;
  onArrival: (id: ScenarioId) => void;
  onResolved: (id: ScenarioId) => void;
};

export default function PlayableCity(props: Props) {
  return <CityWorld mode="simulation" {...props} />;
}