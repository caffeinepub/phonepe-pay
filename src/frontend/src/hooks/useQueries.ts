import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Profile, Transaction } from "../backend.d";
import { useActor } from "./useActor";

export function useGetBalance() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["balance"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMakePayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      amount,
      description,
      recipient,
    }: {
      amount: bigint;
      description: string;
      recipient: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.makePayment(amount, description, recipient);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useAddMoney() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ amount }: { amount: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addMoney(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useHasPin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["hasPin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasPin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetPin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ pin }: { pin: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setPin(pin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hasPin"] });
    },
  });
}

export function useVerifyPin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({ pin }: { pin: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.verifyPin(pin);
    },
  });
}

export function useChangePin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      oldPin,
      newPin,
    }: {
      oldPin: string;
      newPin: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.changePin(oldPin, newPin);
    },
  });
}

export function useGetProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor)
        return { name: "Rahul Kumar", accountNumber: "XXXX4521", phone: "" };
      return actor.getProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, phone }: { name: string; phone: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateProfile(name, phone);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useRechargeMobile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      amount,
      phone,
      operator,
      plan,
    }: {
      amount: bigint;
      phone: string;
      operator: string;
      plan: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.rechargeMobile(amount, phone, operator, plan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
