import { useSyncExternalStore } from "react";
import type { Provider, ZabbixConfig, Equipment, SshCredential, Vendor, Protocol } from "./types";
import {
  mockProviders,
  mockZabbixConfigs,
  mockEquipment,
  mockCredentials,
  mockVendors,
  mockProtocols,
} from "./mock-data";

/**
 * In-memory store for mocked NOC data.
 *
 * Substituir por chamadas HTTP a uma API REST externa: cada método abaixo é o
 * ponto de troca (ex: `await fetch('/api/providers')`). A camada de UI já
 * consome apenas os métodos deste módulo — nenhum componente lê `mock-data`
 * diretamente.
 */

type State = {
  providers: Provider[];
  zabbix: ZabbixConfig[];
  equipment: Equipment[];
  credentials: SshCredential[];
  vendors: Vendor[];
  protocols: Protocol[];
};

let state: State = {
  providers: [...mockProviders],
  zabbix: [...mockZabbixConfigs],
  equipment: [...mockEquipment],
  credentials: [...mockCredentials],
  vendors: [...mockVendors],
  protocols: [...mockProtocols],
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const nocApi = {
  // Providers
  listProviders: () => state.providers,
  createProvider: (data: Omit<Provider, "id">) => {
    state = { ...state, providers: [...state.providers, { ...data, id: uid("prov") }] };
    emit();
  },
  updateProvider: (id: string, data: Omit<Provider, "id">) => {
    state = {
      ...state,
      providers: state.providers.map((p) => (p.id === id ? { ...data, id } : p)),
    };
    emit();
  },
  deleteProvider: (id: string) => {
    state = { ...state, providers: state.providers.filter((p) => p.id !== id) };
    emit();
  },

  // Zabbix
  listZabbix: () => state.zabbix,
  createZabbix: (data: Omit<ZabbixConfig, "id">) => {
    state = { ...state, zabbix: [...state.zabbix, { ...data, id: uid("zbx") }] };
    emit();
  },
  updateZabbix: (id: string, data: Omit<ZabbixConfig, "id">) => {
    state = {
      ...state,
      zabbix: state.zabbix.map((z) => (z.id === id ? { ...data, id } : z)),
    };
    emit();
  },
  deleteZabbix: (id: string) => {
    state = { ...state, zabbix: state.zabbix.filter((z) => z.id !== id) };
    emit();
  },

  // Equipment
  listEquipment: () => state.equipment,
  createEquipment: (data: Omit<Equipment, "id">) => {
    state = { ...state, equipment: [...state.equipment, { ...data, id: uid("eq") }] };
    emit();
  },
  updateEquipment: (id: string, data: Omit<Equipment, "id">) => {
    state = {
      ...state,
      equipment: state.equipment.map((e) => (e.id === id ? { ...data, id } : e)),
    };
    emit();
  },
  deleteEquipment: (id: string) => {
    state = { ...state, equipment: state.equipment.filter((e) => e.id !== id) };
    emit();
  },

  // Credentials
  listCredentials: () => state.credentials,
  createCredential: (data: Omit<SshCredential, "id">) => {
    state = { ...state, credentials: [...state.credentials, { ...data, id: uid("cred") }] };
    emit();
  },
  updateCredential: (id: string, data: Omit<SshCredential, "id">) => {
    state = {
      ...state,
      credentials: state.credentials.map((c) => (c.id === id ? { ...data, id } : c)),
    };
    emit();
  },
  deleteCredential: (id: string) => {
    state = { ...state, credentials: state.credentials.filter((c) => c.id !== id) };
    emit();
  },

  // Vendors (marcas de equipamento)
  listVendors: () => state.vendors,
  createVendor: (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (state.vendors.some((v) => v.toLowerCase() === trimmed.toLowerCase())) return false;
    state = { ...state, vendors: [...state.vendors, trimmed] };
    emit();
    return true;
  },

  // Protocols (SSH, Telnet, etc.)
  listProtocols: () => state.protocols,
  createProtocol: (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (state.protocols.some((p) => p.toLowerCase() === trimmed.toLowerCase())) return false;
    state = { ...state, protocols: [...state.protocols, trimmed] };
    emit();
    return true;
  },
};

function useSlice<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

export const useProviders = () => useSlice((s) => s.providers);
export const useZabbixConfigs = () => useSlice((s) => s.zabbix);
export const useEquipment = () => useSlice((s) => s.equipment);
export const useCredentials = () => useSlice((s) => s.credentials);
export const useVendors = () => useSlice((s) => s.vendors);
export const useProtocols = () => useSlice((s) => s.protocols);