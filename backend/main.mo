import Bool "mo:base/Bool";
import Func "mo:base/Func";

import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Text "mo:base/Text";

actor {
  // Define a type for our messages
  type Message = {
    id: Nat;
    content: Text;
  };

  // Stable variable to store messages
  stable var messages : [Message] = [];
  stable var nextId : Nat = 0;

  // Function to add a new message
  public func addMessage(content : Text) : async Nat {
    let id = nextId;
    nextId += 1;
    let newMessage : Message = {
      id = id;
      content = content;
    };
    messages := Array.append(messages, [newMessage]);
    Debug.print("Added message: " # debug_show(newMessage));
    id
  };

  // Function to get all messages
  public query func getMessages() : async [Message] {
    messages
  };

  // Function to get a specific message by id
  public query func getMessage(id : Nat) : async ?Message {
    Array.find(messages, func (m : Message) : Bool { m.id == id })
  };

  // Function to update a message
  public func updateMessage(id : Nat, newContent : Text) : async Bool {
    let index = Array.indexOf<Message>({ id = id; content = "" }, messages, func (a, b) { a.id == b.id });
    switch (index) {
      case (null) { false };
      case (?i) {
        let updatedMessage : Message = {
          id = id;
          content = newContent;
        };
        messages := Array.tabulate<Message>(messages.size(), func (j : Nat) : Message {
          if (j == i) { updatedMessage } else { messages[j] }
        });
        true
      };
    }
  };

  // Function to delete a message
  public func deleteMessage(id : Nat) : async Bool {
    let initialLength = messages.size();
    messages := Array.filter(messages, func (m : Message) : Bool { m.id != id });
    messages.size() < initialLength
  };

  // System functions for upgrades
  system func preupgrade() {
    Debug.print("Preparing to upgrade. Current message count: " # Nat.toText(messages.size()));
  };

  system func postupgrade() {
    Debug.print("Upgrade complete. New message count: " # Nat.toText(messages.size()));
  };
}
