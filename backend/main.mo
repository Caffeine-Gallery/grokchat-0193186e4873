import Int "mo:base/Int";

import Array "mo:base/Array";
import Text "mo:base/Text";
import Option "mo:base/Option";

actor {
    type FileContent = {
        path: Text;
        content: Text;
    };

    stable var conversationHistory : [Text] = [];
    stable var addedFiles : [FileContent] = [];
    stable var lastResponse : ?Text = null;

    public func chatWithAI(message: Text) : async Text {
        conversationHistory := Array.append(conversationHistory, [message]);
        let response = simulateAIResponse(message);
        conversationHistory := Array.append(conversationHistory, [response]);
        lastResponse := ?response;
        response
    };

    public func editFiles(files: [Text], instruction: Text) : async Text {
        // Simulate file editing process
        let response = "Edited files: " # Text.join(", ", files.vals()) # "\nInstruction: " # instruction;
        lastResponse := ?response;
        response
    };

    public func createFiles(instruction: Text) : async Text {
        // Simulate file creation process
        let response = "Created files based on instruction: " # instruction;
        lastResponse := ?response;
        response
    };

    public func addFiles(files: [Text]) : async Text {
        addedFiles := Array.append(addedFiles, Array.map(files, func (file: Text) : FileContent {
            { path = file; content = "Sample content for " # file }
        }));
        "Added " # Int.toText(files.size()) # " file(s) to context."
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
        // Simulate code review process
        "Code review for files: " # Text.join(", ", files.vals()) # "\n\nNo issues found. Great job!"
    };

    public func generatePlan(instruction: Text) : async Text {
        // Simulate plan generation
        "Plan for: " # instruction # "\n\n1. Analyze requirements\n2. Design solution\n3. Implement features\n4. Test thoroughly\n5. Deploy and monitor"
    };

    private func simulateAIResponse(message: Text) : Text {
        // This is a simple simulation of AI response generation
        "I understood your message: \"" # message # "\". How can I assist you further?"
    };
}
