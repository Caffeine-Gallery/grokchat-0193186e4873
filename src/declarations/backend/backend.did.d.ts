import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'addFiles' : ActorMethod<[Array<string>], string>,
  'chatWithAI' : ActorMethod<[string], string>,
  'createFiles' : ActorMethod<[string], string>,
  'editFiles' : ActorMethod<[Array<string>, string], string>,
  'generatePlan' : ActorMethod<[string], string>,
  'getLastResponse' : ActorMethod<[], string>,
  'resetContext' : ActorMethod<[], undefined>,
  'reviewCode' : ActorMethod<[Array<string>], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
