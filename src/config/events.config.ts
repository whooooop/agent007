import { SolanaEvent, SolanaEventPayloads } from "../components/solana/types/solana.events";
import { TelegramEvent } from "../components/telegram/types/telegram.events";

export const EventsRegistry = {
  [SolanaEvent.Tx.Name]: SolanaEvent.Tx.Name,
  [SolanaEvent.Swap.Name]: SolanaEvent.Swap.Name,

  [TelegramEvent.Message.Name]: TelegramEvent.Message.Name,
} as const;

export type EventPayload = SolanaEventPayloads & {
  [TelegramEvent.Message.Name]: TelegramEvent.Message.Payload;
};

