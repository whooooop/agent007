import { EventsRegistry } from "../config/events.config";

export interface SolanaAccountNewTxPayload {
  signature: string
}

export interface SolanaAccountNewSwapPayload {
  signature: string
  account: string
  mint: string
}

export interface TelegramAccountNewMessagePayload {}

export interface EventPayload {
  [EventsRegistry.SolanaAccountNewTxEvent]: SolanaAccountNewTxPayload
  [EventsRegistry.SolanaAccountNewSwapEvent]: SolanaAccountNewSwapPayload
  [EventsRegistry.TelegramAccountNewMessageEvent]: TelegramAccountNewMessagePayload
}

