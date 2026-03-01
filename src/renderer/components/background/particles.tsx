import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { useCallback } from "react";

export default function ParticleBackground() {
  const init = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={init}
      options={{
        background: { color: "transparent" },
        fpsLimit: 60,
        particles: {
          number: { value: 60 },
          color: { value: "#ff2e2e" },
          links: {
            enable: true,
            color: "#ff2e2e",
            distance: 150,
            opacity: 0.2,
          },
          move: { enable: true, speed: 1 },
          opacity: { value: 0.3 },
          size: { value: { min: 1, max: 3 } },
        },
      }}
      className="fixed inset-0 -z-10"
    />
  );
}
