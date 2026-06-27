// 持ち物チェックリスト生成
export function buildChecklist(spotType, timeZone) {
  const base = [
    { icon: '🎣', label: '竿・リール・仕掛け', ok: true },
    { icon: '🪣', label: 'バケツ・タオル', ok: true },
    { icon: '🧊', label: 'ジップロック（大）', ok: true, note: 'エギ保管・釣れた魚の保管兼用。車に匂いをつけずに運べる' },
  ];

  if (spotType === 'pier') {
    base.splice(1, 0, { icon: '🦺', label: 'ライフジャケット', ok: false, badge: '必須', badgeType: 'danger', note: '堤防・護岸では転落の危険があるため必須' });
  } else {
    base.splice(1, 0, { icon: '🦺', label: 'ライフジャケット', ok: true, badge: '推奨', badgeType: 'ok', note: '砂浜の投げ釣りでは義務ではないが着用を推奨' });
  }

  const extra = {
    mazume_morning: [
      { icon: '🔦', label: 'ヘッドライト（必須）', ok: false, badge: '必須', badgeType: 'danger' },
      { icon: '🧥', label: '防寒着', ok: false, badge: '推奨', badgeType: 'ok' },
    ],
    mazume_evening: [
      { icon: '🔦', label: 'ヘッドライト（帰り道用）', ok: false, badge: '推奨', badgeType: 'ok' },
    ],
    night: [
      { icon: '🔦', label: 'ヘッドライト＋予備電池', ok: false, badge: '必須', badgeType: 'danger' },
      { icon: '👥', label: '複数人で行動', ok: false, badge: '必須', badgeType: 'danger' },
    ],
    daytime: [
      { icon: '🧴', label: '日焼け止め・帽子', ok: false, badge: '推奨', badgeType: 'ok' },
      { icon: '💧', label: '飲み物（多め）', ok: false },
    ],
  };

  return [...base, ...(extra[timeZone] || [])];
}
