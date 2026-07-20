import { useEffect, useState } from "react";

export interface TimeLeft {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  acabou: boolean;
}

function calcular(target: number): TimeLeft {
  const diff = Math.max(0, target - Date.now());
  const s = Math.floor(diff / 1000);
  return {
    dias: Math.floor(s / 86400),
    horas: Math.floor((s % 86400) / 3600),
    minutos: Math.floor((s % 3600) / 60),
    segundos: s % 60,
    acabou: diff <= 0,
  };
}

/** Contagem regressiva até uma data. Atualiza a cada segundo. */
export function useCountdown(data: Date): TimeLeft {
  const target = data.getTime();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calcular(target));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcular(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}
