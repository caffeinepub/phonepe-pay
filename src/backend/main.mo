import Array "mo:core/Array";
import Time "mo:core/Time";
import List "mo:core/List";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";



actor {
  type Transaction = {
    id : Nat;
    amount : Int;
    description : Text;
    status : Text;
    timestamp : Time.Time;
    recipient : Text;
  };

  module Transaction {
    public func compareByTimestamp(t1 : Transaction, t2 : Transaction) : Order.Order {
      Int.compare(t2.timestamp, t1.timestamp);
    };
  };

  type Profile = {
    name : Text;
    phone : Text;
    accountNumber : Text;
  };

  var balance : Int = 10_000;
  var nextTransactionId = 6;
  var pin : ?Text = null;
  var profile : Profile = {
    name = "Rahul";
    phone = "";
    accountNumber = "XXXX4521";
  };

  let transactions = List.fromArray<Transaction>([
    {
      id = 1;
      amount = 5000;
      description = "Grocery Shopping";
      status = "Completed";
      timestamp = 1_623_000_000;
      recipient = "Big Bazaar";
    },
    {
      id = 2;
      amount = 2000;
      description = "Mobile Recharge";
      status = "Completed";
      timestamp = 1_623_100_000;
      recipient = "Airtel";
    },
    {
      id = 3;
      amount = 1500;
      description = "Electricity Bill";
      status = "Completed";
      timestamp = 1_623_200_000;
      recipient = "BESCOM";
    },
    {
      id = 4;
      amount = 700;
      description = "Coffee with Friends";
      status = "Completed";
      timestamp = 1_623_300_000;
      recipient = "Cafe Coffee Day";
    },
    {
      id = 5;
      amount = 800;
      description = "Movie Tickets";
      status = "Completed";
      timestamp = 1_623_400_000;
      recipient = "PVR Cinemas";
    },
  ]);

  public query ({ caller }) func getBalance() : async Int {
    balance;
  };

  public query ({ caller }) func getTransactions() : async [Transaction] {
    // Convert list to array and manually sort by timestamp descending
    transactions.toArray().sort(Transaction.compareByTimestamp);
  };

  public shared ({ caller }) func makePayment(amount : Int, description : Text, recipient : Text) : async () {
    if (amount <= 0) { Runtime.trap("Amount must be greater than zero") };
    if (amount > balance) { Runtime.trap("Insufficient balance") };

    balance -= amount;

    let transaction : Transaction = {
      id = nextTransactionId;
      amount;
      description;
      status = "Completed";
      timestamp = Time.now();
      recipient;
    };

    transactions.add(transaction);
    nextTransactionId += 1;
  };

  public shared ({ caller }) func addMoney(amount : Int) : async () {
    if (amount <= 0) { Runtime.trap("Amount must be greater than zero") };

    balance += amount;

    let transaction : Transaction = {
      id = nextTransactionId;
      amount;
      description = "Added to Wallet";
      status = "Completed";
      timestamp = Time.now();
      recipient = "Self";
    };

    transactions.add(transaction);
    nextTransactionId += 1;
  };

  // PIN Lock System
  public query ({ caller }) func hasPin() : async Bool {
    switch (pin) {
      case (null) { false };
      case (?_) { true };
    };
  };

  public shared ({ caller }) func setPin(newPin : Text) : async Bool {
    pin := ?newPin;
    true;
  };

  public query ({ caller }) func verifyPin(enteredPin : Text) : async Bool {
    switch (pin) {
      case (null) { false };
      case (?storedPin) { storedPin == enteredPin };
    };
  };

  public shared ({ caller }) func changePin(oldPin : Text, newPin : Text) : async Bool {
    switch (pin) {
      case (null) { false };
      case (?storedPin) {
        if (storedPin != oldPin) { return false };
        pin := ?newPin;
        true;
      };
    };
  };

  // User Profile
  public query ({ caller }) func getProfile() : async Profile {
    profile;
  };

  public shared ({ caller }) func updateProfile(name : Text, phone : Text) : async () {
    profile := {
      name;
      phone;
      accountNumber = profile.accountNumber;
    };
  };

  // Mobile Recharge
  public shared ({ caller }) func rechargeMobile(amount : Int, phone : Text, operator : Text, plan : Text) : async () {
    if (amount <= 0) { Runtime.trap("Amount must be greater than zero") };
    if (amount > balance) { Runtime.trap("Insufficient balance") };

    balance -= amount;

    let transaction : Transaction = {
      id = nextTransactionId;
      amount;
      description = operator # " Recharge - " # plan;
      status = "Completed";
      timestamp = Time.now();
      recipient = phone;
    };

    transactions.add(transaction);
    nextTransactionId += 1;
  };
};
