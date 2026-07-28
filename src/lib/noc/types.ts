export type ProviderStatus = "ativo" | "inativo";

export interface Provider {
  id: string;
  nome: string;
  descricao: string;
  status: ProviderStatus;
}

export interface ZabbixConfig {
  id: string;
  providerId: string;
  apiUrl: string;
  usuario: string;
  token: string;
}

export type Vendor = "MikroTik" | "Huawei" | "Datacom" | "V-SOL";
export type Funcao = "Borda" | "Concentrador PPPoE" | "OLT";

export interface Equipment {
  id: string;
  hostname: string;
  ip: string;
  vendor: Vendor;
  funcao: Funcao;
  providerId: string;
}

export interface SshCredential {
  id: string;
  equipmentId: string;
  usuario: string;
  senha: string;
}