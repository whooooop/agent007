export namespace TelegramEvent {
  export namespace Message {
    export const Name = 'TelegramAccountMessageEvent'
    export interface Payload {
      username: string
      chat_id: string
      message: {
        id: number,
        replyToMsgId?: number
      }
    }
  }
}
