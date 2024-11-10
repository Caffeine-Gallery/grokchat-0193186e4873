export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'addFiles' : IDL.Func([IDL.Vec(IDL.Text)], [IDL.Text], []),
    'addMessage' : IDL.Func([IDL.Text, IDL.Bool], [], []),
    'editFiles' : IDL.Func([IDL.Vec(IDL.Text), IDL.Text], [IDL.Text], []),
    'getConversationHistory' : IDL.Func([], [IDL.Vec(IDL.Text)], []),
    'getLastResponse' : IDL.Func([], [IDL.Text], []),
    'resetContext' : IDL.Func([], [], []),
    'reviewCode' : IDL.Func([IDL.Vec(IDL.Text)], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };
