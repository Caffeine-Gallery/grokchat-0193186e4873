import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'addFiles' : ActorMethod<[Array<string>], string>,
  'addMessage' : ActorMethod<[string, boolean], undefined>,
  'editFiles' : ActorMethod<[Array<string>, string], string>,
  'getConversationHistory' : ActorMethod<[], Array<string>>,
  'getLastResponse' : ActorMethod<[], string>,
  'resetContext' : ActorMethod<[], undefined>,
  'reviewCode' : ActorMethod<[Array<string>], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
