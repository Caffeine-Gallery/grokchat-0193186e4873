import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Message { 'id' : bigint, 'content' : string }
export interface _SERVICE {
  'addMessage' : ActorMethod<[string], bigint>,
  'deleteMessage' : ActorMethod<[bigint], boolean>,
  'getMessage' : ActorMethod<[bigint], [] | [Message]>,
  'getMessages' : ActorMethod<[], Array<Message>>,
  'updateMessage' : ActorMethod<[bigint, string], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
