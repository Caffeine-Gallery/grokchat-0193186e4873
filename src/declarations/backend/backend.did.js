export const idlFactory = ({ IDL }) => {
  const Message = IDL.Record({ 'id' : IDL.Nat, 'content' : IDL.Text });
  return IDL.Service({
    'addMessage' : IDL.Func([IDL.Text], [IDL.Nat], []),
    'deleteMessage' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'getMessage' : IDL.Func([IDL.Nat], [IDL.Opt(Message)], ['query']),
    'getMessages' : IDL.Func([], [IDL.Vec(Message)], ['query']),
    'updateMessage' : IDL.Func([IDL.Nat, IDL.Text], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
