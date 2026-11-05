export const EVENT_TYPES = [
  "Casual",
  "Cumpleaños",
  "Casamiento",
  "Bautismo",
  "Comunión",
  "15 años",
  "Baby shower",
  "Aniversario",
  "Empresarial",
  "Otro",
] as const;

export type EventTypeOption = (typeof EVENT_TYPES)[number];

export const DEFAULT_EVENT_TYPE: EventTypeOption = "Casual";

export function isKnownEventType(value: string): value is EventTypeOption {
  return (EVENT_TYPES as readonly string[]).includes(value);
}
