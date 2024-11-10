export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'addFiles' : IDL.Func([IDL.Vec(IDL.Text)], [IDL.Text], []),
    'chatWithAI' : IDL.Func([IDL.Text], [IDL.Text], []),
    'createFiles' : IDL.Func([IDL.Text], [IDL.Text], []),
    'editFiles' : IDL.Func([IDL.Vec(IDL.Text), IDL.Text], [IDL.Text], []),
    'generatePlan' : IDL.Func([IDL.Text], [IDL.Text], []),
    'getLastResponse' : IDL.Func([], [IDL.Text], []),
    'resetContext' : IDL.Func([], [], []),
    'reviewCode' : IDL.Func([IDL.Vec(IDL.Text)], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };
