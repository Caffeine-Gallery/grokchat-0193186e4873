import Bool "mo:base/Bool";

import Array "mo:base/Array";
import Text "mo:base/Text";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";

actor {
    type FileContent = {
        path: Text;
        content: Text;
    };

    private stable var conversationHistory : [Text] = [];
    private stable var addedFiles : [FileContent] = [];
    private stable var lastResponse : ?Text = null;

    public func addMessage(message: Text, isUser: Bool) : async () {
        conversationHistory := Array.append(conversationHistory, [message]);
        if (not isUser) {
            lastResponse := ?message;
        };
    };

    public func getConversationHistory() : async [Text] {
        conversationHistory
    };

    public func editFiles(files: [Text], instruction: Text) : async Text {
        let fileContents = Array.foldLeft<Text, Text>(files, "", func(acc, file) {
            switch (getFileContent(file)) {
                case (?content) { acc # "\n\n" # file # ":\n" # content };
                case (null) { acc # "\n\n" # file # ": File not found" };
            };
        });
        "Files to edit: " # Text.join(", ", files.vals()) # "\nInstruction: " # instruction # "\n\nFile contents:" # fileContents
    };

    public func addFiles(files: [Text]) : async Text {
        for (file in files.vals()) {
            addedFiles := Array.append(addedFiles, [{ path = file; content = "Sample content for " # file }]);
        };
        "Added " # Nat.toText(files.size()) # " file(s) to context."
    };

    public func getLastResponse() : async Text {
        Option.get(lastResponse, "No previous AI response available.")
    };

    public func resetContext() : async () {
        conversationHistory := [];
        addedFiles := [];
        lastResponse := null;
    };

    public func reviewCode(files: [Text]) : async Text {
        let fileContents = Array.foldLeft<Text, Text>(files, "", func(acc, file) {
            switch (getFileContent(file)) {
                case (?content) { acc # "\n\n" # file # ":\n" # content };
                case (null) { acc # "\n\n" # file # ": File not found" };
            };
        });
        "Review code for files: " # Text.join(", ", files.vals()) # "\n\nFile contents:" # fileContents
    };

    private func getFileContent(path: Text) : ?Text {
        Option.map<FileContent, Text>(
            Array.find<FileContent>(addedFiles, func(file) { file.path == path }),
            func(file : FileContent) { file.content }
        )
    };
}
