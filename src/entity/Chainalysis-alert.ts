interface ChainalysisAlertData {
  alertLevel: string, // "Severe",
  category: string, // "sanctions",
  service: string, // "OFAC SDN Blender.io 2022-05-06",
  externalId: string, // "906ff226-8b64-11eb-8e52-7b35a3dc1742",
  alertAmount: number, // 8868.24,
  exposureType: string, // "DIRECT",
  categoryId: number // 3
}

interface ChainalysisAlert {
  alerts: ChainalysisAlertData[]
}