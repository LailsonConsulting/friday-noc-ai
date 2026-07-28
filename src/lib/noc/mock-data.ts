import type { Provider, ZabbixConfig, Equipment, SshCredential } from "./types";

export const mockProviders: Provider[] = [
  { id: "prov-1", nome: "FibraNet Telecom", descricao: "Provedor regional — Sudeste, ~48k assinantes", status: "ativo" },
  { id: "prov-2", nome: "Vale Conecta", descricao: "ISP metropolitano — Vale do Paraíba", status: "ativo" },
  { id: "prov-3", nome: "Sertão Fibra", descricao: "Provedor rural — interior da Bahia", status: "ativo" },
  { id: "prov-4", nome: "NetSul Banda Larga", descricao: "Cobertura no RS — em manutenção programada", status: "inativo" },
  { id: "prov-5", nome: "Amazonlink ISP", descricao: "Operação em Manaus e região metropolitana", status: "ativo" },
];

export const mockZabbixConfigs: ZabbixConfig[] = [
  { id: "zbx-1", providerId: "prov-1", apiUrl: "https://zabbix.fibranet.com.br/api_jsonrpc.php", usuario: "noc-api", token: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4" },
  { id: "zbx-2", providerId: "prov-2", apiUrl: "https://monitor.valeconecta.net/api_jsonrpc.php", usuario: "sextafeira", token: "9f8e7d6c5b4a9f8e7d6c5b4a9f8e7d6c" },
  { id: "zbx-3", providerId: "prov-3", apiUrl: "https://zbx.sertaofibra.com/api_jsonrpc.php", usuario: "integrador", token: "11223344556677881122334455667788" },
];

export const mockEquipment: Equipment[] = [
  { id: "eq-1", hostname: "brd-core-01", ip: "10.10.0.1", vendor: "MikroTik", funcao: "Borda", providerId: "prov-1" },
  { id: "eq-2", hostname: "pppoe-conc-01", ip: "10.10.1.10", vendor: "Huawei", funcao: "Concentrador PPPoE", providerId: "prov-1" },
  { id: "eq-3", hostname: "olt-centro-01", ip: "10.20.5.2", vendor: "V-SOL", funcao: "OLT", providerId: "prov-2" },
  { id: "eq-4", hostname: "olt-zona-sul-02", ip: "10.20.5.3", vendor: "Datacom", funcao: "OLT", providerId: "prov-2" },
  { id: "eq-5", hostname: "brd-sertao-01", ip: "172.16.0.1", vendor: "MikroTik", funcao: "Borda", providerId: "prov-3" },
  { id: "eq-6", hostname: "olt-manaus-01", ip: "10.30.10.5", vendor: "Huawei", funcao: "OLT", providerId: "prov-5" },
];

export const mockCredentials: SshCredential[] = [
  { id: "cred-1", equipmentId: "eq-1", usuario: "admin", senha: "MikTk!2024#Fbn" },
  { id: "cred-2", equipmentId: "eq-2", usuario: "noc-ssh", senha: "Hw@Conc-2024" },
  { id: "cred-3", equipmentId: "eq-3", usuario: "root", senha: "vsol-olt-9910" },
  { id: "cred-4", equipmentId: "eq-4", usuario: "operador", senha: "dtc0m!OLT" },
  { id: "cred-5", equipmentId: "eq-5", usuario: "admin", senha: "SertaoMik#01" },
];