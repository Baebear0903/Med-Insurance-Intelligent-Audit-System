export interface InsuranceCategory {
  id: string;
  categoryName: string; // 医保业务分类
  personnelCategory: string; // 人员类别
  onlineOffline: "线上" | "线下" | ""; // 线上/线下
  enabled: boolean; // 是否启用
}

export const INITIAL_INSURANCE_CATEGORIES: InsuranceCategory[] = [
  { id: "1", categoryName: "广州医保（线上）", personnelCategory: "广州医保", onlineOffline: "线上", enabled: true },
  { id: "2", categoryName: "广州医保（线下）", personnelCategory: "广州医保", onlineOffline: "线下", enabled: true },
  { id: "3", categoryName: "省内异地（线上）", personnelCategory: "省内异地", onlineOffline: "线上", enabled: true },
  { id: "4", categoryName: "省内异地（线下）", personnelCategory: "省内异地", onlineOffline: "线下", enabled: true },
  { id: "5", categoryName: "跨省异地（线上）", personnelCategory: "跨省异地", onlineOffline: "线上", enabled: true },
  { id: "6", categoryName: "跨省异地（线下）", personnelCategory: "跨省异地", onlineOffline: "线下", enabled: true },
  { id: "7", categoryName: "市直医保", personnelCategory: "市直医保", onlineOffline: "线下", enabled: true },
  { id: "8", categoryName: "省直医保", personnelCategory: "省直医保", onlineOffline: "线上", enabled: true },
  { id: "9", categoryName: "越秀公医", personnelCategory: "越秀公医", onlineOffline: "线下", enabled: true },
  { id: "10", categoryName: "海珠公医", personnelCategory: "海珠公医", onlineOffline: "线下", enabled: true },
  { id: "11", categoryName: "荔湾公医", personnelCategory: "荔湾公医", onlineOffline: "线下", enabled: true },
  { id: "12", categoryName: "天河公医", personnelCategory: "天河公医", onlineOffline: "线下", enabled: true },
  { id: "13", categoryName: "白云公医", personnelCategory: "白云公医", onlineOffline: "线下", enabled: true },
  { id: "14", categoryName: "黄埔公医", personnelCategory: "黄埔公医", onlineOffline: "线下", enabled: true },
  { id: "15", categoryName: "番禺公医", personnelCategory: "番禺公医", onlineOffline: "线下", enabled: true },
  { id: "16", categoryName: "花都公医", personnelCategory: "花都公医", onlineOffline: "线下", enabled: true },
  { id: "17", categoryName: "南沙公医", personnelCategory: "南沙公医", onlineOffline: "线下", enabled: true },
  { id: "18", categoryName: "从化公医", personnelCategory: "从化公医", onlineOffline: "线下", enabled: true },
  { id: "19", categoryName: "增城公医", personnelCategory: "增城公医", onlineOffline: "线下", enabled: true },
];

export const getInsuranceCategories = (): InsuranceCategory[] => {
  try {
    const stored = localStorage.getItem("insurance_categories_config");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {}
  
  // Save initial if none exists
  localStorage.setItem("insurance_categories_config", JSON.stringify(INITIAL_INSURANCE_CATEGORIES));
  return INITIAL_INSURANCE_CATEGORIES;
};

export const saveInsuranceCategories = (data: InsuranceCategory[]) => {
  localStorage.setItem("insurance_categories_config", JSON.stringify(data));
};
