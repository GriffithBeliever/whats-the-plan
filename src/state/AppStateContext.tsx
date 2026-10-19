// src/state/AppStateContext.tsx
// The single source of truth for everything plan/group related. Screens never
// hold their own copy of a plan or mutate it directly — they dispatch an
// action here and re-read from context, so every screen showing the same plan
// (PlansScreen, MapScreen, PlanScreen, LivePlanScreen…) always agrees. When a
// real backend arrives, only the reducer's effects need to become API calls;
// the screens and the shape of the data stay the same.
import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { generateSeedData } from '../data/seed';
import { Plan, PlanCard, ItemCard, ServiceCard, InstaPayCard, isPlanLive, clampOutingCapacity } from '../types/plan';
import { User, Group, ChatMessage } from '../types/social';
import { useNowTick } from '../utils/useNowTick';

type State = {
  currentUser: User;
  users: User[];
  plans: Plan[];
  groups: Group[];
};

export type NewPlanInput = {
  kind: Plan['kind'];
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  startTime: string;
  gradient: [string, string];
  icon: string;
  isPublic: boolean;
  hasGroupChat: boolean;
  maxParticipants: number | null;
  splitBillEnabled: boolean;
  isPaid: boolean;
  ticketPrice: number;
  amenities: string[];
  cards: PlanCard[];
};

type Action =
  | { type: 'JOIN_PLAN'; planId: string }
  | { type: 'LEAVE_PLAN'; planId: string }
  | { type: 'CREATE_PLAN'; input: NewPlanInput; id: string }
  | { type: 'SEND_MESSAGE'; groupId: string; text: string }
  | { type: 'ORDER_ITEM'; planId: string; cardId: string; delta: number }
  | { type: 'TOGGLE_SERVICE_QUEUE'; planId: string; cardId: string }
  | { type: 'CLAIM_INSTAPAY'; planId: string; cardId: string };

function mapCard(plan: Plan, cardId: string, fn: (c: PlanCard) => PlanCard): Plan {
  return { ...plan, cards: plan.cards.map(c => (c.id === cardId ? fn(c) : c)) };
}

function mapPlan(plans: Plan[], planId: string, fn: (p: Plan) => Plan): Plan[] {
  return plans.map(p => (p.id === planId ? fn(p) : p));
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'JOIN_PLAN': {
      const plans = mapPlan(state.plans, action.planId, p =>
        p.participantIds.includes('me') ? p : { ...p, participantIds: [...p.participantIds, 'me'] },
      );
      return { ...state, plans };
    }
    case 'LEAVE_PLAN': {
      const plans = mapPlan(state.plans, action.planId, p => ({
        ...p,
        participantIds: p.participantIds.filter(id => id !== 'me'),
      }));
      return { ...state, plans };
    }
    case 'CREATE_PLAN': {
      const { input, id } = action;
      const newPlan: Plan = {
        id,
        ...input,
        organizerId: state.currentUser.id,
        participantIds: [state.currentUser.id],
        createdAt: new Date().toISOString(),
      };
      const groups = input.hasGroupChat
        ? [...state.groups, { id, planId: id, messages: [] } as Group]
        : state.groups;
      return { ...state, plans: [newPlan, ...state.plans], groups };
    }
    case 'SEND_MESSAGE': {
      const message: ChatMessage = {
        id: `${action.groupId}-${Date.now()}`,
        groupId: action.groupId,
        senderId: state.currentUser.id,
        senderName: state.currentUser.name,
        senderEmoji: state.currentUser.avatarEmoji,
        text: action.text,
        createdAt: new Date().toISOString(),
      };
      const groups = state.groups.map(g =>
        g.id === action.groupId ? { ...g, messages: [...g.messages, message] } : g,
      );
      return { ...state, groups };
    }
    case 'ORDER_ITEM': {
      const plans = mapPlan(state.plans, action.planId, p =>
        mapCard(p, action.cardId, c => {
          if (c.kind !== 'item') return c;
          const item = c as ItemCard;
          const nextOrdered = Math.max(0, item.myOrderedCount + action.delta);
          if (action.delta > 0 && !item.unlimited && (item.quantityRemaining ?? 0) <= 0) return c;
          const nextRemaining = item.unlimited || item.quantityRemaining == null
            ? item.quantityRemaining
            : Math.max(0, item.quantityRemaining - action.delta);
          return { ...item, myOrderedCount: nextOrdered, quantityRemaining: nextRemaining };
        }),
      );
      return { ...state, plans };
    }
    case 'TOGGLE_SERVICE_QUEUE': {
      const plans = mapPlan(state.plans, action.planId, p =>
        mapCard(p, action.cardId, c => {
          if (c.kind !== 'service') return c;
          const service = c as ServiceCard;
          if (service.myQueuePosition != null) {
            return { ...service, myQueuePosition: null, queueLength: Math.max(0, service.queueLength - 1) };
          }
          return { ...service, myQueuePosition: service.queueLength + 1, queueLength: service.queueLength + 1 };
        }),
      );
      return { ...state, plans };
    }
    case 'CLAIM_INSTAPAY': {
      const plans = mapPlan(state.plans, action.planId, p =>
        mapCard(p, action.cardId, c => (c.kind === 'instapay' ? ({ ...c, claimed: true } as InstaPayCard) : c)),
      );
      return { ...state, plans };
    }
    default:
      return state;
  }
}

type AppStateContextType = {
  state: State;
  joinPlan: (planId: string) => void;
  leavePlan: (planId: string) => void;
  createPlan: (input: NewPlanInput) => string;
  sendMessage: (groupId: string, text: string) => void;
  orderItem: (planId: string, cardId: string, delta: number) => void;
  toggleServiceQueue: (planId: string, cardId: string) => void;
  claimInstaPay: (planId: string, cardId: string) => void;
};

const AppStateCtx = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const seed = generateSeedData();
    return { currentUser: seed.currentUser, users: seed.users, plans: seed.plans, groups: seed.groups };
  });

  const joinPlan = useCallback((planId: string) => dispatch({ type: 'JOIN_PLAN', planId }), []);
  const leavePlan = useCallback((planId: string) => dispatch({ type: 'LEAVE_PLAN', planId }), []);
  const createPlan = useCallback((input: NewPlanInput) => {
    const id = `p-${Date.now()}`;
    dispatch({ type: 'CREATE_PLAN', input, id });
    return id;
  }, []);
  const sendMessage = useCallback((groupId: string, text: string) => dispatch({ type: 'SEND_MESSAGE', groupId, text }), []);
  const orderItem = useCallback((planId: string, cardId: string, delta: number) => dispatch({ type: 'ORDER_ITEM', planId, cardId, delta }), []);
  const toggleServiceQueue = useCallback((planId: string, cardId: string) => dispatch({ type: 'TOGGLE_SERVICE_QUEUE', planId, cardId }), []);
  const claimInstaPay = useCallback((planId: string, cardId: string) => dispatch({ type: 'CLAIM_INSTAPAY', planId, cardId }), []);

  const value = useMemo(
    () => ({ state, joinPlan, leavePlan, createPlan, sendMessage, orderItem, toggleServiceQueue, claimInstaPay }),
    [state, joinPlan, leavePlan, createPlan, sendMessage, orderItem, toggleServiceQueue, claimInstaPay],
  );

  return <AppStateCtx.Provider value={value}>{children}</AppStateCtx.Provider>;
}

function useAppState() {
  const ctx = useContext(AppStateCtx);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}

export function usePlans() {
  return useAppState().state.plans;
}

export function usePlan(planId: string | undefined) {
  const plans = usePlans();
  return useMemo(() => plans.find(p => p.id === planId), [plans, planId]);
}

export function useCurrentUser() {
  return useAppState().state.currentUser;
}

export function useUserById(id: string): User {
  const { state } = useAppState();
  if (id === state.currentUser.id) return state.currentUser;
  return state.users.find(u => u.id === id) ?? state.currentUser;
}

export function useIsJoined(planId: string | undefined) {
  const plan = usePlan(planId);
  const me = useCurrentUser();
  return !!plan && plan.participantIds.includes(me.id);
}

export function useMyPlans() {
  const plans = usePlans();
  const me = useCurrentUser();
  return useMemo(() => plans.filter(p => p.participantIds.includes(me.id)), [plans, me]);
}

export function useMyGroups() {
  const { state } = useAppState();
  const mine = useMyPlans();
  return useMemo(() => {
    const myPlanIds = new Set(mine.map(p => p.id));
    return state.groups.filter(g => myPlanIds.has(g.planId));
  }, [state.groups, mine]);
}

export function useGroup(planId: string | undefined) {
  const { state } = useAppState();
  return useMemo(() => state.groups.find(g => g.planId === planId), [state.groups, planId]);
}

export function useLivePlan() {
  const mine = useMyPlans();
  const now = useNowTick();
  return useMemo(() => mine.find(p => isPlanLive(p, now)), [mine, now]);
}

export function useOrganizedPlans() {
  const plans = usePlans();
  const me = useCurrentUser();
  return useMemo(() => plans.filter(p => p.organizerId === me.id), [plans, me]);
}

export function useCreatePlan() {
  return useAppState().createPlan;
}

export function usePlanActions() {
  const { joinPlan, leavePlan, sendMessage, orderItem, toggleServiceQueue, claimInstaPay } = useAppState();
  return { joinPlan, leavePlan, sendMessage, orderItem, toggleServiceQueue, claimInstaPay };
}

export { clampOutingCapacity };
