import type { StoredHandoff } from "@/types";

export interface HandoffAlert {
  type: "danger" | "warning" | "info";
  title: string;
  message: string;
}

const MED_LABELS: Record<string, string> = {
  morning: "아침",
  lunch: "점심",
  dinner: "저녁",
  bedtime: "취침 전",
};

export function deriveHandoffAlerts(handoff: StoredHandoff): HandoffAlert[] {
  if (!handoff.saved) return [];

  const alerts: HandoffAlert[] = [];

  if (handoff.mobility === "거동 불가") {
    alerts.push({
      type: "danger",
      title: "낙상 고위험",
      message:
        "거동 불가 상태입니다. 모든 이동 시 부축 및 휠체어 사용이 필요합니다.",
    });
  } else if (handoff.mobility === "부축 시 이동 가능") {
    alerts.push({
      type: "warning",
      title: "이동 시 부축 필요",
      message:
        "부축 시 이동 가능 상태입니다. 화장실 이동 시 반드시 부축해 주세요.",
    });
  }

  if (handoff.excretionSleep?.urine === false) {
    alerts.push({
      type: "warning",
      title: "소변 배출 불량",
      message:
        "소변 배출이 불량으로 기록되었습니다. 수분 섭취와 배뇨 상태를 확인해 주세요.",
    });
  }
  if (handoff.excretionSleep?.feces === false) {
    alerts.push({
      type: "warning",
      title: "대변 배출 불량",
      message: "대변 배출이 불량으로 기록되었습니다.",
    });
  }
  if (handoff.excretionSleep?.sleep === false) {
    alerts.push({
      type: "warning",
      title: "수면 상태 불량",
      message:
        "수면 상태가 불량으로 기록되었습니다. 야간 돌봄에 특히 유의해 주세요.",
    });
  }

  const meds = handoff.medications ?? {};
  const incomplete = Object.entries(meds)
    .filter(([, done]) => !done)
    .map(([key]) => MED_LABELS[key] ?? key);

  if (incomplete.length > 0 && incomplete.length < 4) {
    alerts.push({
      type: "info",
      title: "투약 미완료",
      message: `${incomplete.join(", ")} 투약이 미완료입니다.`,
    });
  }

  if (handoff.emotion === "매우 우울" || handoff.emotion === "우울") {
    alerts.push({
      type: "warning",
      title: "감정 상태 주의",
      message: `감정 상태가 '${handoff.emotion}'(으)로 기록되었습니다.`,
    });
  }

  if (handoff.mealAmount === "적음") {
    alerts.push({
      type: "info",
      title: "식사량 적음",
      message: "식사량이 적음으로 기록되었습니다. 섭취량을 지켜봐 주세요.",
    });
  }

  const memo = handoff.memo?.trim();
  if (memo) {
    if (memo.includes("금식")) {
      alerts.push({
        type: "warning",
        title: "금식 안내",
        message: memo,
      });
    } else if (memo.includes("낙상") || memo.includes("주의") || memo.includes("위험")) {
      alerts.push({
        type: "danger",
        title: "특이사항 주의",
        message: memo,
      });
    }
  }

  handoff.customFields?.forEach((field) => {
    const label = field.label.toLowerCase();
    if (
      label.includes("혈당") ||
      label.includes("주의") ||
      label.includes("알림") ||
      label.includes("금식")
    ) {
      alerts.push({
        type: "info",
        title: field.label,
        message: String(field.value),
      });
    }
  });

  return alerts;
}

export function hasHandoffRecord(handoff: StoredHandoff): boolean {
  return !!handoff.saved;
}
