import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Profile {
    name: string;
    accountNumber: string;
    phone: string;
}
export interface Transaction {
    id: bigint;
    status: string;
    recipient: string;
    description: string;
    timestamp: Time;
    amount: bigint;
}
export interface backendInterface {
    addMoney(amount: bigint): Promise<void>;
    changePin(oldPin: string, newPin: string): Promise<boolean>;
    getBalance(): Promise<bigint>;
    getProfile(): Promise<Profile>;
    getTransactions(): Promise<Array<Transaction>>;
    hasPin(): Promise<boolean>;
    makePayment(amount: bigint, description: string, recipient: string): Promise<void>;
    rechargeMobile(amount: bigint, phone: string, operator: string, plan: string): Promise<void>;
    setPin(newPin: string): Promise<boolean>;
    updateProfile(name: string, phone: string): Promise<void>;
    verifyPin(enteredPin: string): Promise<boolean>;
}
