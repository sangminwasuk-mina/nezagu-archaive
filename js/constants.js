// ==========================================
// constants.js - 전역 상수, DOM 엘리먼트 참조, 장비 데이터베이스
// ==========================================
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const minimap = document.getElementById('minimap');
    const miniCtx = minimap.getContext('2d');

    const kaitenStatusEl = document.getElementById('kaiten-status');
    const playerHpBar = document.getElementById('playerHpBar');
    const playerHpText = document.getElementById('playerHpText');
    const posDisplay = document.getElementById('posDisplay');
    const mainScreen = document.getElementById('main-screen');
    const maintenanceScreen = document.getElementById('maintenance-screen');
    const btnSolo = document.getElementById('btn-solo');
    const btnDuo = document.getElementById('btn-duo');
    const btnBackToMain = document.getElementById('btn-back-to-main');
    const btnDeployBattle = document.getElementById('btn-deploy-battle');

    const topHud = document.getElementById('top-hud');

    const duoLobbyModal = document.getElementById('duo-lobby-modal');
    const btnDuoHost = document.getElementById('btn-duo-host');
    const btnDuoJoin = document.getElementById('btn-duo-join');
    const btnDuoLobbyBack = document.getElementById('btn-duo-lobby-back');

    const btnSupporterStatus = document.getElementById('btn-supporter-status');
    const supporterModal = document.getElementById('supporter-modal');
    const supporterModalCloseBtn = document.getElementById('supporter-modal-close-btn');
    const maintTitleText = document.getElementById('maint-title-text');
    const strikerSpecView = document.getElementById('striker-spec-view');
    const maintKeyGuide = document.getElementById('maint-key-guide');

    // 멀티플레이 대기실 DOM 참조
    const inputHostCode = document.getElementById('input-host-code');
    const inputJoinCode = document.getElementById('input-join-code');
    const duoRoomBadge = document.getElementById('duo-room-badge');
    const displayRoomCode = document.getElementById('display-room-code');
    const displayPeerStatus = document.getElementById('display-peer-status');
    const btnSupporterReady = document.getElementById('btn-supporter-ready');

    // 화면 상태 관리 변수: 'main' | 'duo_lobby' | 'maintenance' | 'battle'
    let currentGameState = 'main';
    let currentMode = 'solo'; // 'solo' | 'duo'
    let myRole = 'striker'; // 'striker' | 'supporter'

    // 멀티플레이 룸 상태
    let roomCode = '57291';
    let isSupporterConnected = false;
    let isSupporterReady = false;


// 모달 DOM 참조
    const selectionModal = document.getElementById('selection-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalList = document.getElementById('modal-list');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    const skillDetailModal = document.getElementById('skill-detail-modal');
    const skillDetailTitle = document.getElementById('skill-detail-title');
    const skillDetailBadge = document.getElementById('skill-detail-badge');
    const skillDetailWeapon = document.getElementById('skill-detail-weapon');
    const skillDetailBody = document.getElementById('skill-detail-body');
    const skillDetailCloseBtn = document.getElementById('skill-detail-close-btn');
    const skillDetailConfirmBtn = document.getElementById('skill-detail-confirm-btn');


    // 맵 설정 (와이드 맵 5000px)
    const WORLD_WIDTH = 5000;
    const WORLD_HEIGHT = 1080;
    const GROUND_OFFSET = 120; // 바닥 높이


    // ==========================================
    // [공격 타입 vs 방어 타입(장갑) 상성 시스템]
    // Weak: 2.0x (200%), Effective: 1.5x (150%), Normal: 1.0x (100%), Resist: 0.5x (50%)
    // ==========================================
    const ATTACK_TYPES = {
      NORMAL: 'normal',   // 일반 (회색)
      EXPLOSION: 'explosive', // 폭발 (빨강)
      PIERCE: 'pierce',   // 관통 (노랑)
      DECOMPOSE: 'decompose', // 분해 (초록)
      MYSTIC: 'mystic',   // 신비 (파랑)
      SONIC: 'sonic'      // 진동 (보라)
    };

    const ARMOR_TYPES = {
      NORMAL: 'normal',     // 일반장갑
      LIGHT: 'light',       // 경장갑
      HEAVY: 'heavy',       // 중장갑
      COMPOSITE: 'composite', // 복합장갑
      SPECIAL: 'special',   // 특수장갑
      ELASTIC: 'elastic'    // 탄력장갑
    };

    // 상성 매트릭스 [방어타입][공격타입] = { multiplier, label, color }
    const DAMAGE_EFFECTIVENESS = {
      // 1. 일반장갑: 모든 공격에 100% (Normal)
      normal: {
        normal: { mult: 1.0, label: 'NORMAL', color: '#ffffff' },
        explosive: { mult: 1.0, label: 'NORMAL', color: '#ffffff' },
        pierce: { mult: 1.0, label: 'NORMAL', color: '#ffffff' },
        decompose: { mult: 1.0, label: 'NORMAL', color: '#ffffff' },
        mystic: { mult: 1.0, label: 'NORMAL', color: '#ffffff' },
        sonic: { mult: 1.0, label: 'NORMAL', color: '#ffffff' }
      },
      // 2. 경장갑: 폭발(Weak 200%), 관통/분해(Resist 50%), 나머지 100%
      light: {
        normal: { mult: 1.0, label: 'NORMAL', color: '#ffffff' },
        explosive: { mult: 2.0, label: 'WEAK', color: '#ef4444' },
        pierce: { mult: 0.5, label: 'RESIST', color: '#94a3b8' },
        decompose: { mult: 0.5, label: 'RESIST', color: '#94a3b8' },
        mystic: { mult: 1.0, label: 'NORMAL', color: '#ffffff' },
        sonic: { mult: 1.0, label: 'NORMAL', color: '#ffffff' }
      },
      // 3. 중장갑: 관통(Weak 200%), 분해(Effective 150%), 신비/진동(Resist 50%), 나머지 100%
      heavy: {
        normal: { mult: 1.0, label: 'NORMAL', color: '#ffffff' },
        explosive: { mult: 1.0, label: 'NORMAL', color: '#ffffff' },
        pierce: { mult: 2.0, label: 'WEAK', color: '#eab308' },
        decompose: { mult: 1.5, label: 'EFFECTIVE', color: '#22c55e' },
        mystic: { mult: 0.5, label: 'RESIST', color: '#94a3b8' },
        sonic: { mult: 0.5, label: 'RESIST', color: '#94a3b8' }
      },
      // 4. 복합장갑: 분해(Weak 200%), 신비/진동(Resist 50%), 나머지 100%
      composite: {
        normal: { mult: 1.0, label: 'NORMAL', color: '#ffffff' },
        explosive: { mult: 1.0, label: 'NORMAL', color: '#ffffff' },
        pierce: { mult: 1.0, label: 'NORMAL', color: '#ffffff' },
        decompose: { mult: 2.0, label: 'WEAK', color: '#22c55e' },
        mystic: { mult: 0.5, label: 'RESIST', color: '#94a3b8' },
        sonic: { mult: 0.5, label: 'RESIST', color: '#94a3b8' }
      },
      // 5. 특수장갑: 폭발(Resist 50%), 신비(Weak 200%), 진동(Effective 150%), 나머지 100%
      special: {
        normal: { mult: 1.0, label: 'NORMAL', color: '#ffffff' },
        explosive: { mult: 0.5, label: 'RESIST', color: '#94a3b8' },
        pierce: { mult: 1.0, label: 'NORMAL', color: '#ffffff' },
        decompose: { mult: 1.0, label: 'NORMAL', color: '#ffffff' },
        mystic: { mult: 2.0, label: 'WEAK', color: '#38bdf8' },
        sonic: { mult: 1.5, label: 'EFFECTIVE', color: '#c084fc' }
      },
      // 6. 탄력장갑: 폭발(Resist 50%), 진동(Weak 200%), 나머지 100%
      elastic: {
        normal: { mult: 1.0, label: 'NORMAL', color: '#ffffff' },
        explosive: { mult: 0.5, label: 'RESIST', color: '#94a3b8' },
        pierce: { mult: 1.0, label: 'NORMAL', color: '#ffffff' },
        decompose: { mult: 1.0, label: 'NORMAL', color: '#ffffff' },
        mystic: { mult: 1.0, label: 'NORMAL', color: '#ffffff' },
        sonic: { mult: 2.0, label: 'WEAK', color: '#c084fc' }
      }
    };

    /**
     * 공격 타입과 방어 장갑 간의 상성 계산 함수
     * @param {string} atkType - 공격 유형 ('normal', 'explosive', 'pierce', 'decompose', 'mystic', 'sonic')
     * @param {string} armType - 방어 장갑 ('normal', 'light', 'heavy', 'composite', 'special', 'elastic')
     * @returns {{ mult: number, label: string, color: string }}
     */
    function getDamageEffectiveness(atkType = 'normal', armType = 'normal') {
      const armRow = DAMAGE_EFFECTIVENESS[armType] || DAMAGE_EFFECTIVENESS.normal;
      return armRow[atkType] || { mult: 1.0, label: 'NORMAL', color: '#ffffff' };
    }
    window.getDamageEffectiveness = getDamageEffectiveness;

    /**
     * 최종 상성 대미지 연산 헬퍼 함수
     */
    function calculateFinalDamage(dmg, atkType = 'normal', armType = 'normal') {
      const eff = getDamageEffectiveness(atkType, armType);
      return Math.round(dmg * eff.mult);
    }
    window.calculateFinalDamage = calculateFinalDamage;

    // ==========================================
    // [블루 아카이브 기반 세부 전투 스탯 공식 엔진]
    // 1. 방어력 공식: 받는 피해 = 1000 / (방어력 + 1000)
    // 2. 명중/회피 공식: 명중률 = 1000 / (회피 - 명중 + 1000) (상한 100%)
    // 3. 치명 확률: (치명 - 저항) / (치명 - 저항 + 1000) (상한 80%)
    // 4. 치명 대미지: (치명대미지% - 치명대미지저항%) (기본 350% - 50% = 300% = 3.0배)
    // 5. 안정 수치 (대미지 난수): 최소배율 = 안정 / (안정 + 1000) + 0.20
    // ==========================================

    /**
     * 1. 방어력에 의한 피해 감소율 계산 (방어력 1000 = 피해 50% 경감)
     */
    function calculateDefenseDamageMultiplier(defense = 0) {
      const def = Math.max(0, defense);
      return 1000 / (def + 1000);
    }

    /**
     * 2. 명중 vs 회피 판정 (명중률 계산)
     * @returns {boolean} 명중 여부 (true = 적중, false = MISS 회피)
     */
    function checkHitSuccess(accuracy = 0, evasion = 0) {
      const diff = Math.max(0, evasion - accuracy);
      const hitRate = 1000 / (diff + 1000);
      return Math.random() < hitRate;
    }

    /**
     * 3. 치명타 확률 계산 및 판정
     * @param {number} crit - 공격자 치명 수치 (기본값: 350)
     * @param {number} critResist - 방어자 치명 저항 (기본값: 100)
     * @param {number} bonusCritRate - 추가 치명타 확률 (예: 불사 1% 이하 시 +0.20)
     * @param {boolean} forceCrit - 확정 치명타 여부
     * @returns {boolean}
     */
    function checkCritSuccess(crit = 350, critResist = 100, bonusCritRate = 0, forceCrit = false) {
      if (forceCrit) return true;
      const diff = Math.max(0, crit - critResist);
      let critRate = diff / (diff + 1000); // 250 / 1250 = 0.20 (20%)
      critRate = Math.min(0.80, critRate); // 기본 상한 80%
      critRate += bonusCritRate;
      return Math.random() < critRate;
    }

    /**
     * 4. 치명 대미지 배율 계산
     * @param {number} critDmg - 공격자 치명 대미지 (기본값: 350 => 350%)
     * @param {number} critDmgResist - 방어자 치명 대미지 저항 (기본값: 50 => 50%)
     * @param {number} bonusCritDmg - 추가 치명 대미지 (예: 빛이여! 버프 +155 => 155%)
     * @returns {number} 실수 배율 (예: (350 - 50)/100 = 3.0배)
     */
    function calculateCritDamageMultiplier(critDmg = 350, critDmgResist = 50, bonusCritDmg = 0) {
      const net = (critDmg + bonusCritDmg) - critDmgResist;
      const finalPercent = Math.max(100, net); // 최소 100% (1.0배) 보장
      return finalPercent / 100;
    }

    /**
     * 5. 안정 수치에 따른 대미지 난수 계산 (표기 대미지 = 최대값)
     * @param {number} maxDmg - 무기 표기 대미지
     * @param {number} stability - 안정 수치 (기본값: 1500 => 최소 80% 난수)
     * @param {boolean} ignoreStability - 안정 수치 무시 항상 최대 대미지 여부
     * @returns {number}
     */
    function applyStabilityRandomDamage(maxDmg, stability = 1500, ignoreStability = false) {
      if (ignoreStability || stability >= 4000) return maxDmg;
      const stab = Math.max(0, stability);
      const minRatio = (stab / (stab + 1000)) + 0.20; // 1500 / 2500 + 0.2 = 0.80
      const clampedMin = Math.min(1.0, Math.max(0.20, minRatio));
      const factor = clampedMin + Math.random() * (1.0 - clampedMin);
      return Math.round(maxDmg * factor);
    }

    /**
     * 6. 군중 제어(CC) 지속시간/확률 계산
     */
    function calculateCCEffect(baseVal, ccPower = 0, ccResist = 0) {
      const factor = Math.max(0, (100 + ccPower - ccResist) / 100);
      return baseVal * factor;
    }

    /**
     * [통합 전투 대미지 파이프라인]
     * 공격자 -> 방어자 대미지 연산 (명중 -> 안정 -> 치명 -> 상성 -> 방어력)
     */
    function calculateFullCombatDamage({
      attacker,
      defender,
      baseDmg,
      attackType = 'normal',
      forceCrit = false,
      bonusCritRate = 0,
      bonusCritDmg = 0,
      ignoreStability = false
    }) {
      // 1. 명중 vs 회피
      const acc = (attacker && attacker.accuracy !== undefined) ? attacker.accuracy : 0;
      const eva = (defender && defender.evasion !== undefined) ? defender.evasion : 0;
      const isHit = checkHitSuccess(acc, eva);
      if (!isHit) {
        return { isHit: false, damage: 0, isCrit: false, effectiveness: { mult: 1.0, label: 'NORMAL', color: '#ffffff' } };
      }

      // 2. 안정 수치에 의한 대미지 난수 (표기 대미지가 최대값)
      const stab = (attacker && attacker.stability !== undefined) ? attacker.stability : 1500;
      let rolledDmg = applyStabilityRandomDamage(baseDmg, stab, ignoreStability);

      // 3. 치명타 판정 & 치명 대미지
      const crit = (attacker && attacker.crit !== undefined) ? attacker.crit : 350;
      const critRes = (defender && defender.critResist !== undefined) ? defender.critResist : 100;
      const isCrit = checkCritSuccess(crit, critRes, bonusCritRate, forceCrit);

      let damageWithCrit = rolledDmg;
      if (isCrit) {
        const critDmg = (attacker && attacker.critDmg !== undefined) ? attacker.critDmg : 350;
        const baseCritDmgRes = (defender && defender.critDmgResist !== undefined) ? defender.critDmgResist : 50;
        const debuffRes = (defender && defender.critDmgResistDebuff !== undefined) ? defender.critDmgResistDebuff : 0;
        const critDmgRes = Math.max(0, baseCritDmgRes - debuffRes);
        const critMult = calculateCritDamageMultiplier(critDmg, critDmgRes, bonusCritDmg);
        damageWithCrit = Math.round(damageWithCrit * critMult);
      }

      // 4. 공격 유형 vs 방어 장갑 상성
      const armorType = (defender && defender.armorType) ? defender.armorType : 'normal';
      const effectiveness = getDamageEffectiveness(attackType, armorType);
      let damageWithArmor = Math.round(damageWithCrit * effectiveness.mult);

      // 5. 방어력 감소
      const defense = (defender && defender.defense !== undefined) ? defender.defense : 0;
      const defMult = calculateDefenseDamageMultiplier(defense);
      const finalDmg = Math.max(1, Math.round(damageWithArmor * defMult));

      return {
        isHit: true,
        damage: finalDmg,
        isCrit: isCrit,
        effectiveness: effectiveness
      };
    }

    // [정비실 장비 및 스킬 데이터베이스 (사용자 지정 항목만 유지)]
    // ==========================================
    const EQUIPMENT_DATABASE = {
      // 슬롯 1: 메인 무기
      slot1: [
        {
          id: 'mg_destructor',
          name: '[폭발] MG (종막의 디스트로이어)',
          tag: '메인 무기',
          color: '#facc15',
          role: '딜러',
          position: 'BACK',
          armorType: ARMOR_TYPES.HEAVY, // 방어 장갑: 중장갑
          attackType: ATTACK_TYPES.EXPLOSION, // 기본 사격 공격 유형: 폭발
          skill1AttackType: ATTACK_TYPES.EXPLOSION, // 메인스킬 1 공격 유형: 폭발
          skill2AttackType: ATTACK_TYPES.EXPLOSION, // 메인스킬 2 공격 유형: 폭발
          specialAttackType: ATTACK_TYPES.EXPLOSION, // 특수스킬 공격 유형: 폭발
          hp: 65000,
          desc: '• 체력: 65,000 | 방어 장갑: 중장갑 | 장전: 40발 (연사) | 피해량: 400 | 포지션: BACK (1,420px) | 딜레이: 0.11초 | 재장전: 2.5초 | 탄창: 무제한',
          skillName: '[폭발] 종막: 이스보셋',
          skillDesc: '• 소모: <b>6 코스트</b> | 라인 관통 <b>28발</b> 난사 (발당 600%)',
          skill2Name: '[폭발] 개연 : 이스보셋',
          skill2Desc: '• 소모: <b>10 코스트</b> | 15s 고정 사격 모드 | 3단계 순차 발사 (4,500% / 7,000% / 11,500%+최대체력 2%)',
          specialSkillName: '[폭발] 선도부장',
          specialSkillDesc: '• 발동: <b>체력 50% 이하 1회 해금</b> (0코스트) | 7s 폭풍 관통 난사 (자동조준 각도 연동 빔)',
          stats: { hp: 65000, capacity: 40, dmg: 400, reloadTime: 2.5, maxMags: Infinity, holdFire: true, fireDelay: 0.11, range: 1420 },
          skillDetails: {
            title: '[폭발] 종막: 이스보셋',
            keyLabel: '[K키 / Q키] 메인스킬 1',
            badgeColor: '#f43f5e',
            tags: ['공격: 폭발', '소모: 6 코스트', '딜레이: 2.5초', '관통 탄환 28발', '계수: 발당 600%'],
            sections: [
              { title: '스킬 개요', text: '제자리에 거치하여 전방 라인 전체를 관통하는 고화력 탄환 28발을 초고속 난사합니다.' },
              { title: '피해량', text: '발당 기본 공격력의 600% (발당 약 2,400 피해 / 28발 전탄 적중 시 총 67,200 대미지)' },
              { title: '쿨타임 규칙', text: '발사 완료 후 기본 쿨타임 2.5초가 적용됩니다.' }
            ]
          },
          skill2Details: {
            title: '[폭발] 개연 : 이스보셋',
            keyLabel: '[L키 / E키] 메인스킬 2',
            badgeColor: '#38bdf8',
            tags: ['공격: 폭발', '소모: 10 코스트', '모드 유지: 15초', '쿨타임: 2.5초', '3단계 선율 순차 사격'],
            sections: [
              { title: '자세 전환', text: '발동 시 2.0초간 전환 후 15초 동안 고정 집중 사격 모드로 돌입합니다. (사격 중 좌/우 방향 전환 가능)' },
              { title: '3단계 선율 사격', text: '• 1음: 4,500% 피해 (관통 감쇠 -35%, 발사 딜레이 1.5초)\n• 2음: 7,000% 피해 (관통 감쇠 -45%, 발사 딜레이 1.5초)\n• 종연: 11,500% + 적 최대체력의 2% 극딜 마무리 사격 (관통 감쇠 -25%, 발사 딜레이 1.5초)' },
              { title: '쿨타임 규칙', text: '3회 사격 완료 시 쿨타임 2.5초가 적용되며 일반 모드로 복귀합니다.' }
            ]
          },
          specialSkillDetails: {
            title: '[폭발] 선도부장',
            keyLabel: '[S키] 특수스킬',
            badgeColor: '#c084fc',
            tags: ['공격: 폭발', '발동: 체력 50% 이하 1회', '소모: 0 코스트', '지속: 7초', '3단계 폭풍 난사', '광기 각성'],
            sections: [
              { title: '발동 조건', text: '체력이 50% 이하로 감소 시 1회에 한해 [S] 키로 즉시 발동 가능합니다. (코스트 소모 없음)' },
              { title: '단계별 지속 사격', text: '7초 동안 제자리에서 전방 라인을 향해 폭풍 관통 사격을 쏟아붓습니다. (자동 조준된 적의 상/하 각도를 추적하여 서치라이트 빔 회전 연동)\n• 1단계 (0~2초): 720% 피해 (0.075초 간격 난사)\n• 2단계 (2~4초): 870% 피해 (0.060초 간격 가속 난사)\n• 3단계 (4~7초): 870% 피해 (0.060초 간격 난사)' },
              { title: '광기 각성 (체력 30% 이하)', text: '체력이 30% 이하인 상태에서 3단계에 진입하면 1,320% 극강 각성 난사 (0.040초 초고속)로 전환되어 압도적인 화력을 투사합니다.' }
            ]
          }
        },
        {
          id: 'rg_supernova',
          name: '[신비] RG (빛의검 : 슈퍼노바)',
          tag: '메인 무기',
          color: '#38bdf8',
          role: '딜러',
          position: 'BACK',
          armorType: ARMOR_TYPES.SPECIAL, // 방어 장갑: 특수장갑 (아비 에슈흐 시 복합장갑으로 전환)
          attackType: ATTACK_TYPES.MYSTIC, // 기본 사격 공격 유형: 신비
          skill1AttackType: ATTACK_TYPES.MYSTIC, // 메인스킬 1 공격 유형: 신비
          skill2AttackType: ATTACK_TYPES.MYSTIC, // 메인스킬 2 공격 유형: 신비
          specialAttackType: ATTACK_TYPES.MYSTIC, // 특수스킬 (아비 에슈흐 전 공격): 신비
          hp: 65000,
          desc: '• 체력: 65,000 | 방어 장갑: 특수장갑 (아비 에슈흐 폼 체인지 시 복합장갑 전환) | 장전: 5발 (단발식) | 피해량: 4,100 | 포지션: BACK (1,420px) | 딜레이: 0.70초 | 재장전: 3.0초 | 탄창: 무제한',
          skillName: '[신비] 밸런스 붕괴',
          skillDesc: '• 소모: <b>5 코스트</b> | 쿨타임 2.5초 | 1.2s 차징 관통탄 (270%, 재사용 시 1/2/3배 증폭)',
          skill2Name: '[신비] 빛의 검/각성 : 슈퍼노바',
          skill2Desc: '• 충전: <b>8코스트</b> (최대 2스택) | 발사: <b>10코스트</b> 4초 관통 레이저 (0.1s마다 120%, 쿨타임 2.5초)',
          specialSkillName: '[신비] 시스템 : 아비 에슈흐',
          specialSkillDesc: '• 발동: <b>누적 코스트 150 소모 시 1회 해금</b> | 폼 체인지 시 복합장갑 전환 & 모든 공격 신비',
          stats: { hp: 65000, capacity: 5, dmg: 4100, reloadTime: 3.0, maxMags: Infinity, holdFire: false, fireDelay: 0.70, range: 1420 },
          skillDetails: {
            title: '[신비] 밸런스 붕괴',
            keyLabel: '[K키 / Q키] 메인스킬 1',
            badgeColor: '#38bdf8',
            tags: ['공격: 신비', '소모: 5 코스트 (+5 코스트 증폭)', '차징: 1.2초', '쿨타임: 2.5초', '관통 에너지탄'],
            sections: [
              { title: '스킬 개요', text: '1.2초 동안 제자리에서 고농축 에너지를 응축한 뒤 전방으로 강력한 관통 에너지탄을 발사합니다. (쿨타임 2.5초)' },
              { title: '기본 피해량', text: '기본 공격력의 270% (약 11,070 관통 피해)' },
              { title: '에너지 증폭', text: '차징 도중 스킬 키를 추가 입력할 때마다 5 코스트를 추가 소모하여 피해량이 1배(270%), 2배(540%), 3배(810%)로 대폭 증폭됩니다.' }
            ]
          },
          skill2Details: {
            title: '[신비] 빛의 검/각성 : 슈퍼노바',
            keyLabel: '[L키 / E키] 메인스킬 2',
            badgeColor: '#38bdf8',
            tags: ['공격: 신비', '충전: 8 코스트', '발사: 10 코스트', '최대 2스택 영구 충전식', '쿨타임: 2.5초'],
            sections: [
              { title: '에너지 충전', text: '8 코스트를 소모하여 0.5초 차징 후 전용 에너지 스택을 충전합니다. (최대 2스택까지 영구 유지)' },
              { title: '각성 방출 (지속 레이저)', text: '스택 보유 상태에서 10 코스트를 소모하여 2.0초 집중 차징 후 4초간 일직선 관통 레이저를 연속 방출합니다. 방출 종료 후 2.5초 쿨타임이 적용됩니다.' },
              { title: '피해량', text: '0.1초마다 120% 피해 (4초간 40회 타격, 총 196,800 극딜 관통 피해)' }
            ]
          },
          specialSkillDetails: {
            title: '[신비] 시스템 : 아비 에슈흐',
            keyLabel: '[S키] 특수스킬',
            badgeColor: '#38bdf8',
            tags: ['방어: 복합장갑 전환', '공격: 전부 신비', '해금: 누적 코스트 150 소모', '소모: 0 코스트', '8방향 비행 호버링', '전용 코스트 200', '일도양단 피니셔'],
            sections: [
              { title: '시스템 가동 & 변환', text: '누적 코스트 150 소모 시 [S]키로 1회 해금 발동. 0.5초 동안 빛이 모여들며 비행 날개 파츠가 장착되고 [빛의 검 : 슈퍼노바 for 아비 에슈흐] 무장 형태로 변환됩니다.' },
              { title: '비행 호버링 & 제어 규칙', text: '점프가 비활성화되고 W/A/S/D 키로 상하좌우 공중을 자유롭게 날아다닙니다.\n• 가장 가까운 적을 자동 타겟팅합니다.\n• 보조무기 변경이 불가능합니다.\n• 일반 코스트 충전이 중단되고, 최대 및 현재 전용 에너지가 200으로 설정됩니다.' },
              { title: '전용 무장 액션 3종', text: '• [Z / 좌클릭] 전방 단타 레이저 (관통)\n  0.3초당 단계 상승 (최대 0.9초 차징), 1~3 코스트 소모\n  1단계: 90% (3,690) / 2단계: 180% (7,380) / 3단계: 270% (11,070) 대미지 (사거리 증가)\n• [X / Q키] 용기의 마법 (유도 미사일)\n  5 코스트 소모, 등 뒤에서 적을 자동 추적하는 미사일 3발 발사 (발당 210% 범위 피해)\n  ※ 1.2초 내 3회 연속 발사 시 2.0초 딜레이 발생\n• [C / E키] 빛의 난사\n  10 코스트 소모, 2.5초 동안 전방 40도 부채꼴 각도로 일반 탄환(110%)과 강화 관통 탄환(250%)을 4:1 비율로 난사 (쿨타임 없이 재사용 가능)' },
              { title: '빛의 검 : 아비 에슈흐 파이널 (피니셔)', text: '전용 코스트 200 전소 시 1초 대기 후 임의 키(공격/스킬) 입력으로 발동!\n1. 3초간 제자리 집중 차징 (방향 전환만 가능)\n2. 전방 상공으로 곡선 급상승 후 가장 가까운 적을 향해 급강하\n3. 빛의 검 일도양단 베기 -> 적중 시 시간 정지(히트스탑) & 십자 다이아 섬광 & 산산조각 파동 폭발!\n4. 범위 내 모든 적에게 [공격력의 3,675% (약 150,675)] 확정 비치명타 피해를 입히고 시스템 상태 해제 후 5초간 과부하 기절' }
            ]
          }
        },
        {
          id: 'sg_bloody_gunpowder',
          name: '[관통] SG (블러디 앤 건 파우더)',
          tag: '메인 무기',
          color: '#ef4444',
          role: '딜러',
          position: 'FRONT',
          armorType: ARMOR_TYPES.HEAVY, // 방어 장갑: 중장갑
          attackType: ATTACK_TYPES.PIERCE, // 기본 사격 공격 유형: 관통
          skill1AttackType: ATTACK_TYPES.PIERCE, // 메인스킬 1 (기괴멸렬): 관통
          skill2AttackType: ATTACK_TYPES.MYSTIC, // 메인스킬 2 (격류 난사): 신비
          specialAttackType: ATTACK_TYPES.EXPLOSION, // 특수스킬 (불사 혈기 폭풍): 폭발
          hp: 65000,
          desc: '• 체력: 65,000 | 방어 장갑: 중장갑 | 장전: 4발 (단발식) | 피해량: 500*6 (3,000) | 포지션: FRONT (400px) | 딜레이: 0.25초 | 재장전: 0.75초 | 탄창: 무제한',
          skillName: '[관통] 기괴멸렬',
          skillDesc: '• 소모: <b>4 코스트</b> | 쿨타임 2.5초 | 탄창 3발 사격 & 즉시재장전 | 6회 산탄 강화 사격',
          skill2Name: '[신비] 격류',
          skill2Desc: '• 소모: <b>4 코스트</b> | 쿨타임 2.5초 | 0.5s 차징 후 산탄 8회 연속 발사',
          specialSkillName: '[폭발] 불사(不死)',
          specialSkillDesc: '• 발동: <b>상시 1회 발동 (S키)</b> | 5~10s 무적 & 무한 난사 | 종료 후 5% 흡혈 회복',
          stats: { hp: 65000, capacity: 4, dmg: 500, pellets: 6, reloadTime: 0.75, maxMags: Infinity, holdFire: false, fireDelay: 0.25, range: 400 },
          skillDetails: {
            title: '[관통] 기괴멸렬',
            keyLabel: '[K키 / Q키] 메인스킬 1',
            badgeColor: '#ef4444',
            tags: ['공격: 관통', '소모: 4 코스트', '즉시 재장전: 0.75초', '탄창 3발로 증가', '6회 사격 강화', '쿨타임: 2.5초'],
            sections: [
              { title: '스킬 개요', text: '0.75초 만에 신속하게 즉시 재장전합니다. (강화 사격 종료 후 쿨타임 2.5초)' },
              { title: '강화 산탄 효과', text: '이후 6회의 사격 동안 탄창 크기가 기존 2발에서 3발로 증가하여 연속 사격이 가능해지며, 1회 격발 시 12발의 고밀도 산탄(발당 500, 총 6,000 피해)을 발사 딜레이 없이 뿜어냅니다. (재장전 시간 0.25초)' }
            ]
          },
          skill2Details: {
            title: '[신비] 격류',
            keyLabel: '[L키 / E키] 메인스킬 2',
            badgeColor: '#ef4444',
            tags: ['공격: 신비', '소모: 4 코스트', '쿨타임: 2.5초', '0.5초 차징', '총 48,000 대미지'],
            sections: [
              { title: '스킬 개요', text: '0.5초 동안 자유롭게 이동하며 산탄을 집중 장전한 뒤 전방으로 연속 난사를 가합니다. (쿨타임 2.5초)' },
              { title: '피해량', text: '0.2초 간격으로 산탄을 8회 연속 발사합니다. (회당 8발, 발당 750, 회당 6,000, 8회 전탄 적중 시 총 48,000 피해)' }
            ]
          },
          specialSkillDetails: {
            title: '[폭발] 불사(不死)',
            keyLabel: '[S키] 특수스킬',
            badgeColor: '#dc2626',
            tags: ['공격: 폭발', '전투당 1회', '상시 발동 가능', '완전 무적/불사', '체력 비례 강화', '무한 탄약 난사', '종료 후 흡혈 회복'],
            sections: [
              { title: '발동 및 불사(무적) 상태', text: '메인 무기 상태에서 언제든 [S]키로 1회 발동 가능합니다.\n• 지속시간 동안 체력이 1도 감소하지 않으며(완전 무적), 외부 회복 또한 일체 차단됩니다.\n• 발동 시점의 플레이어 현재 체력 비율(1% ~ 100%)에 따라 모든 스펙이 결정됩니다.' },
              { title: '체력 비례 스펙 (1% 이하 vs 100%)', text: '• 지속 시간: 1% 이하 시 10초 / 100% 시 5초\n• 연사 딜레이: 1% 이하 시 0.10초 (초당 10회) / 100% 시 0.50초\n• 기본 공격력: 1% 이하 시 2,450 × 7발 (17,150) / 100% 시 720 × 5발 (3,600)\n• [1% 이하 극한 효과]: 불사 지속시간 동안 치명타 확률이 +20% 추가 증가!' },
              { title: '사격 메커니즘 & 스택 가속', text: '• 무한 탄약 & 노 리로드 (탄약 소모 0, 재장전 딜레이 삭제)\n• 홀딩 난사 지원: 공격 키(Z/J/좌클릭)를 꾹 누르면 초고속 연속 발사\n• 15회 사격할 때마다: 펠릿 수 +1발, 발당 공격력 +468 영구 증가 (최대 5중첩)\n  ※ 풀스택 달성 시 (1% 기준): 4,790 × 12발 = 단발 57,480 피해!' },
              { title: '종료 후 효과 (혈기 흡수 회복)', text: '불사 지속시간이 종료되는 순간, 불사 동안 적에게 입힌 총 누적 데미지의 5%만큼 플레이어 체력을 즉시 회복합니다. (최대 회복 한도: 플레이어 최대 체력의 50%)' }
            ]
          }
        },
        {
          id: 'ar_white_fang',
          name: '[폭발] AR (WHITE FANG 465)',
          tag: '메인 무기',
          color: '#06b6d4',
          role: '딜러',
          position: 'MIDDLE',
          armorType: ARMOR_TYPES.LIGHT, // 방어 장갑: 경장갑 (테러화 시 특수장갑으로 전환)
          attackType: ATTACK_TYPES.EXPLOSION, // 기본 사격 공격 유형: 폭발 (테러화 시 신비)
          skill1AttackType: ATTACK_TYPES.EXPLOSION, // 메인스킬 1 (드론 소환): 폭발 (테러화 시 신비)
          skill2AttackType: ATTACK_TYPES.MYSTIC, // 메인스킬 2 (라이딩 그레네이드): 신비 (테러화 시 신비)
          specialAttackType: ATTACK_TYPES.MYSTIC, // 특수스킬 (테러화): 신비
          hp: 65000,
          desc: '• 체력: 65,000 | 방어 장갑: 경장갑 (테러화 시 특수장갑 전환) | 장전: 14발 (연발) | 피해량: 350 | 포지션: MIDDLE (750px) | 딜레이: 0.25초 | 재장전: 0.8초 | 탄창: 무제한',
          skillName: '[폭발] 드론 소환 : 화력 지원',
          skillDesc: '• 소모: <b>3 코스트</b> | 쿨타임 2.5초 | 2초간 화력지원 드론 소환 (발당 590% 미사일 20발 난사)',
          skill2Name: '[신비] 라이딩 그레네이드',
          skill2Desc: '• 소모: <b>3 코스트</b> | 쿨타임 2.5초 | 660% 범위 피해 (2,310) 및 피격 적 공격력 35% 감소 (12초, 폭발반경 +10%)',
          specialSkillName: '[신비] 테러화(恐怖化)',
          specialSkillDesc: '• 발동: <b>사망 시 1회 자동 각성</b> | 135% 최대체력 부활 & BLACK FANG 465 폼 체인지 (받는 회복량 -20%)',
          stats: { hp: 65000, capacity: 14, dmg: 350, reloadTime: 0.8, maxMags: Infinity, holdFire: true, fireDelay: 0.25, range: 750 },
          skillDetails: {
            title: '[폭발] 드론 소환 : 화력 지원',
            keyLabel: '[K키 / Q키] 메인스킬 1',
            badgeColor: '#06b6d4',
            tags: ['공격: 폭발 (테러화 시 신비)', '소모: 3 코스트', '지속: 2초', '쿨타임: 2.5초', '화력 지원 드론', '유도 미사일 난사'],
            sections: [
              { title: '스킬 개요', text: '3 코스트를 소모하여 전술 화력지원 드론을 소환합니다. (쿨타임 2.5초)' },
              { title: '미사일 난사', text: '드론이 2초 동안 머물며 0.1초마다 가장 가까운 적을 향해 미사일을 1발씩 발사합니다. (총 20발)' },
              { title: '피해량', text: '기본 공격력의 590% (발당 2,065 피해, 20발 전탄 적중 시 총 41,300 피해)' }
            ]
          },
          skill2Details: {
            title: '[신비] 라이딩 그레네이드',
            keyLabel: '[L키 / E키] 메인스킬 2',
            badgeColor: '#06b6d4',
            tags: ['공격: 신비', '소모: 3 코스트', '쿨타임: 2.5초', '투척형 구체', '범위 660%', '공격력 -35% 디버프', '폭발 반경 +10%'],
            sections: [
              { title: '스킬 개요', text: '3 코스트를 소모하여 전방으로 고에너지 구체(그레네이드)를 힘껏 투척합니다. (쿨타임 2.5초)' },
              { title: '범위 폭발 피해', text: '투척된 구체가 적과 충돌하거나 지면에 닿으면 강력한 범위 폭발을 일으키며 공격력의 660% (약 2,310 피해)를 입힙니다. (폭발 반경 +10% 상향)' },
              { title: '화력 약화 디버프', text: '폭발에 휩쓸린 적들에게 12초 동안 [공격력 35% 감소] 디버프를 부여하여 아군이 받는 피해를 크게 줄입니다.' }
            ]
          },
          specialSkillDetails: {
            title: '[신비] 테러화(恐怖化)',
            keyLabel: '[사망 시 자동 발동] 특수스킬',
            badgeColor: '#475569',
            tags: ['방어: 특수장갑 전환', '공격: 전부 신비 전환', '사망 시 1회 발동', '최대체력 135% 부활', '회복량 -20%', 'BLACK FANG 465', '치명 420%', '안정 650', '무한 탄창'],
            sections: [
              { title: '발동 및 부활', text: '체력이 0이 되어 사망 시 1회에 한해 최대 체력이 135%(87,750)로 증가하고 전량 회복되며 즉시 부활합니다.\n• 부활 후 전신이 잿빛 흑회색으로 변하며 어두운 연기 아우라가 방출됩니다.\n• 테러화 지속 중 받는 회복량이 20% 감소합니다.\n• 매 초마다 최대 체력의 0.5% ~ 1.2%가 지속적으로 침식 감소합니다.' },
              { title: '전용 무장 [BLACK FANG 465]', text: '• 공격력: 1,000 | 사거리: 750px\n• 사격 딜레이: 0.20초 (초당 5발 고속 연사)\n• 치명타 확률: +5% 추가 증가\n• 치명 대미지: 420%\n• 안정 수치: 650 (최소 59.4% 난수)\n• 무한 탄창: 노 리로드 상시 발동' },
              { title: '위기 본능 & 침착한 호흡', text: '• [체력 30% 이하]: 사격 딜레이가 0.10초(초당 10발)로 절반 단축되고 공격력이 20%(1,200) 증가합니다.\n• [침착한 호흡 (사망 유예)]: 테러화 상태에서 체력이 0이 되면 15초간 사망을 유예합니다. 15초 내에 최대 체력의 40% 이상으로 회복 시 사망하지 않고 생존합니다.' },
              { title: '각성 스킬 2종', text: '• [K키] 화력 강화: 최대체력 20% 소모 (동시 최대 1기 가동, 쿨타임 2.5초). 30초간 전술 드론 생성, 공격 시마다 230%(2,300) 지원 탄환 2~3발 발사\n• [L키] 수류탄 투척·개(改): 3 코스트(체력 50% 이하 시 2 코스트). 620%(6,200) 범위 폭발 및 0.5초 기절(STUN) 부여. 드론 가동 중일 경우 드론에서 240%(2,400) 미사일 12발 일제 발사!' }
            ]
          }
        },
        {
          id: 'smg_fox45',
          name: '[폭발] SMG (FOX 45식 기관단총)',
          tag: '메인 무기',
          color: '#f59e0b',
          role: '탱커',
          position: 'MIDDLE',
          armorType: ARMOR_TYPES.LIGHT, // 방어 장갑: 경장갑
          attackType: ATTACK_TYPES.EXPLOSION, // 기본 사격 공격 유형: 폭발
          skill1AttackType: ATTACK_TYPES.EXPLOSION, // 메인스킬 1 (철벽의 방어): 폭발
          skill2AttackType: ATTACK_TYPES.EXPLOSION, // 메인스킬 2 (공세 전환): 폭발
          specialAttackType: ATTACK_TYPES.EXPLOSION, // 특수스킬 (전술 방패 전개): 폭발
          hp: 65000,
          desc: '• 체력: 65,000 | 방어 장갑: 경장갑 | 장전: 12발 (초고속 연사) | 피해량: 280 | 포지션: MIDDLE (850px) | 딜레이: 0.10초 | 재장전: 1.0초 | 탄창: 무제한',
          skillName: '[폭발] 철벽의 방어',
          skillDesc: '• 소모: <b>3 / 4 코스트</b> | 단일 770% / 540% & 기절 (2.5초 / 4.6초) (적중 시 소형 폭발)',
          skill2Name: '[폭발] 공세 전환',
          skill2Desc: '• 소모: <b>2 / 3 코스트</b> | 단일 550% / 410% & 치명 대미지 저항률 -22% / -44%',
          specialSkillName: '[폭발] 전술 방패 전개',
          specialSkillDesc: '• 발동: <b>상시 무제한 (S키)</b> | 쿨타임 40초 (4C) | 즉시 재장전 & 17초 전술 보호막 (최대체력 15%)',
          stats: { hp: 65000, capacity: 12, dmg: 280, reloadTime: 1.0, maxMags: Infinity, holdFire: true, fireDelay: 0.10, range: 850 },
          skillDetails: {
            title: '[폭발] 철벽의 방어',
            keyLabel: '[K키 / Q키] 메인스킬 1',
            badgeColor: '#f59e0b',
            tags: ['공격: 폭발', '소모: 3 / 4 코스트', '단일 타겟 충격파', '적중 시 소형 폭발', '기절 CC 부여', '전술 보호막 연계 강화'],
            sections: [
              { title: '스킬 개요', text: '전방의 단일 적을 향해 강력한 충격파를 발사합니다. 적중 시 소형 폭발을 일으키며 기절시킵니다. (쿨타임 2.5초, 관통 불가)' },
              { title: '일반 상태 (3 코스트)', text: '• 공격력의 770% 피해 (약 2,156 데미지)\n• 적중한 적에게 2.5초 기절(STUN) 부여' },
              { title: '전술 보호막 상태 (4 코스트)', text: '• 피해량이 공격력의 540% (약 1,512 데미지)\n• 기절 시간이 +2.1초 증가하여 총 4.6초 동안 적을 완전 무력화!' }
            ]
          },
          skill2Details: {
            title: '[폭발] 공세 전환',
            keyLabel: '[L키 / E키] 메인스킬 2',
            badgeColor: '#fb923c',
            tags: ['공격: 폭발', '소모: 2 / 3 코스트', '쿨타임 2.5초', '단일 타겟 철갑탄', '치명 대미지 저항률 감소', '전술 보호막 연계 강화'],
            sections: [
              { title: '스킬 개요', text: '전방의 단일 적을 향해 특수 철갑 탄환을 발사하여 피해를 입히고 방어 약점을 노출시킵니다. (쿨타임 2.5초, 관통 불가)' },
              { title: '일반 상태 (2 코스트)', text: '• 공격력의 550% 피해 (약 1,540 데미지)\n• 10초 동안 적의 치명 대미지 저항률 22% 감소 (아군의 치명 대미지 배율 대폭 증가)' },
              { title: '전술 보호막 상태 (3 코스트)', text: '• 피해량이 공격력의 410% (약 1,148 데미지)\n• 치명 대미지 저항률 감소량이 44%로 2배 폭증하여 극한의 치명타 극딜 환경 조성!' }
            ]
          },
          specialSkillDetails: {
            title: '[폭발] 전술 방패 전개',
            keyLabel: '[S키] 특수스킬',
            badgeColor: '#38bdf8',
            tags: ['공격: 폭발', '상시 발동 가능 (무제한)', '소모: 4 코스트', '쿨타임 40초', '전술 보호막 (최대체력 15%)', '지속: 17초', '즉시 완충 재장전', '종료 시 50% HP 회복', '피격 시 5% 자가 회복'],
            sections: [
              { title: '발동 효과', text: '전투 중 언제든지 [S]키로 발동 가능합니다. (4 코스트 소모, 쿨타임 40초)\n• 즉시 탄창을 12발 완충 재장전합니다.\n• 플레이어 최대 체력의 15%에 해당하는 전술 보호막을 17초 동안 생성하고 [전술 방어 상태]에 돌입합니다.' },
              { title: '전술 보호막 고유 규칙', text: '• [종료 시 회복]: 전술 보호막 지속시간 종료 시 남아있는 보호막 잔여량의 50%만큼 플레이어 체력을 즉시 회복합니다.\n• [타 보호막 흡수]: 전술 보호막 유지 중 다른 보호막(서포터 쉴드 등)을 획득하면 해당 수치의 100%만큼 전술 보호막 체력 회복으로 대체 충전됩니다.\n• [피격 시 재생]: 전술 보호막이 유지되는 동안 적에게 피격당할 때마다 현재 잃은 보호막의 5%만큼 전술 보호막이 즉각 재생됩니다.' }
            ]
          }
        },
        {
          id: 'melee_red_mist',
          name: '[일반] Red Mist (미미크리)',
          tag: '메인 근접 무기',
          color: '#ef4444',
          role: '딜러',
          position: 'FRONT',
          armorType: ARMOR_TYPES.LIGHT, // 방어 장갑: 경장갑
          attackType: ATTACK_TYPES.NORMAL, // 기본 공격: 일반
          skill1AttackType: ATTACK_TYPES.NORMAL,
          skill2AttackType: ATTACK_TYPES.NORMAL,
          specialAttackType: ATTACK_TYPES.NORMAL,
          isMelee: true,
          hp: 65000,
          desc: '• 체력: 65,000 | 방어 장갑: 경장갑 | 공격: 일반 근접 대검 | 피해량: 3,560 | 딜레이: 0.3초 | 탄약/재장전: 불필요 (무제한) | 3종 자세 전환 & E.G.O 개화',
          skillName: '[일반] 전환 (자세 순환)',
          skillDesc: '• 소모: <b>1 코스트 (개화 시 0C)</b> | 쿨타임 없음 | 횡베기 ⇋ 종베기 ⇋ 찌르기 순환 전환 & 다음 공격 +10%(개화 시 +35%)',
          skill2Name: '[일반] 기합 / 돌진',
          skill2Desc: '• 횡/종베기 시 [기합] (4C, 2.2s 기절, 3회 피해 +300%) | 찌르기 시 [돌진] (5C, 820% 대시, 치명타 시 쿨초기화+0C+공격력 누적)',
          specialSkillName: '[일반] 대절단 - 세로 / E.G.O 개화',
          specialSkillDesc: '• 스택 100 미만: [대절단-세로] (12~8C, 450% 3연타 + 피니시 1250% + 2.5s 기절) | 스택 100: [E.G.O 개화] (특색 붉은안개 발현)',
          stats: { hp: 65000, capacity: Infinity, dmg: 3560, reloadTime: 0, maxMags: Infinity, holdFire: true, fireDelay: 0.30, range: 140 },
          skillDetails: {
            title: '[일반] 전환',
            keyLabel: '[K키 / Q키] 메인스킬 1',
            badgeColor: '#ef4444',
            tags: ['공격: 일반', '소모: 1 코스트 (개화 시 0C)', '쿨타임: 없음 (0초)', '자세 순환 전환', '다음 피해 증폭'],
            sections: [
              { title: '스킬 개요', text: '대검의 공격 자세를 [횡베기] ➔ [종베기] ➔ [찌르기] ➔ [횡베기] 순서로 순환 교체합니다. 쿨타임이 없어 연속 사용이 가능합니다.' },
              { title: '피해량 증폭', text: '자세 전환 후 다음 1회 공격의 피해량이 +10% 증가합니다. (E.G.O 개화 중에는 +35%로 강화되며, 연속 사용 시 수치는 중첩되지 않고 갱신됩니다.)' }
            ]
          },
          skill2Details: {
            title: '[일반] 기합 / 돌진',
            keyLabel: '[L키 / E키] 메인스킬 2',
            badgeColor: '#f97316',
            tags: ['공격: 일반', '자세 연동 분기', '기합: 광역 기절 + 3회 피해 300% 증가', '돌진: 820% 대시 + 치명타 무한 리셋'],
            sections: [
              { title: '자세 연동 발동', text: '현재 일반공격 자세에 따라 자동으로 발동 스킬이 분기됩니다.\n• [횡베기 / 종베기 자세]: [기합] 발동\n• [찌르기 자세]: [돌진] 발동' },
              { title: '[기합] 효과 (4 코스트, 쿨타임 5초)', text: '전방으로 붉은 기운을 내뿜어 범위 내 적들에게 2.2초 기절을 부여합니다. (시전 후 0.7초 이동 불가, 이후 3회 공격 피해량 +300% 증가 / 개화 시: 6코스트, 기절 3.5초, 피해량 +650% 폭증)' },
              { title: '[돌진] 효과 (5 코스트, 쿨타임 5초)', text: '전방으로 길게 대시하며 경로 내 모든 적에게 820% 피해를 줍니다. 치명타 배율 증폭은 없으나, 치명타 판정 성공 시 즉시 쿨타임 초기화 + 코스트 0 소모 + 다음 돌진 피해량 +55% 합산 누적! (개화 시: 7코스트, 쿨타임 8초, 돌진거리 +20%, 치명타율 +10%, 공격력 증가량 +135%로 강화)' }
            ]
          },
          specialSkillDetails: {
            title: '[일반] 대절단 - 세로 / E.G.O 개화',
            keyLabel: '[S키] 특수스킬',
            badgeColor: '#dc2626',
            tags: ['공격: 일반', '스택 100 미만: 대절단-세로', '스택 100: E.G.O 개화', '개화 중: 대절단-가로/세로 분기', '치명타 미발동'],
            sections: [
              { title: '스택 100 미만: [대절단 - 세로]', text: '스택에 따라 12~8 코스트 소모. 전방 대시 후 종베기로 적을 내리꽂고 수평 고정. 0.7초 간격 450% 3연타(총 1,350%) 후 1,250% 피니시 방출 + 2.5초 기절 (치명타 미발동).' },
              { title: '스택 100 달성: [E.G.O 개화]', text: '특색 붉은안개 발현! 이동속도 +50%, 일반 공격력 +20%, 범위 +35% 증가. 모든 스킬이 극도로 강화되며 스택이 소진될 때까지 유지됩니다.' },
              { title: '개화 중 특수스킬 (S키)', text: '• [찌르기 자세]: 강화 [대절단-세로] (8코스트, 단일 타겟, 560% 3연타 + 피니시 1,550% + 4초 기절, 치명타 미발동)\n• [횡/종베기 자세]: [대절단-가로] (12코스트, 0.5초 적 완전 정지 후 2,150% 화면 양단 광역 참격, 치명타 미발동)' },
              { title: '탈진 및 강제 개화', text: '• 스택 0 도달 시: 8초 탈진 기절 및 스택 충전 불가 (영구 패시브: 이속 +5%, 코스트 속도 10% 단축 획득)\n• 체력 10% 이하 시: 강제 개화 발동 (공격력 -40% 페널티, 치명타 전면 봉인)' }
            ]
          }
        }
      ],

      // 슬롯 7: 역할군 & 포지션 (주무기 연동 자동 지정)
      slot7: [
        {
          id: 'role_dealer_back',
          name: '딜러 [BACK]',
          tag: '역할군',
          color: '#facc15',
          role: '딜러',
          position: 'BACK',
          positionRange: 1420,
          desc: '• 역할: 딜러 | 포지션: BACK (1,420px)<br>딜러는 적에게 강한 피해를 줘서 적을 처치해요.',
          skillDetails: {
            title: '역할군: 딜러 (Dealer)',
            keyLabel: '[포지션: BACK] 후열 딜러',
            badgeColor: '#facc15',
            tags: ['역할: 딜러', '포지션: BACK', '사거리: 1,420px', '초장거리 거치/저격'],
            sections: [
              { title: '역할군 개요', text: '딜러는 적에게 강한 피해를 줘서 적을 처치해요.\n압도적인 유효 사거리로 안전한 후방에서 전장 전체를 타격합니다.' },
              { title: '포지션: BACK (후열)', text: '초장거리 화력 투사 포지션 (기본 사거리 1,420px).\n제자리 거치 폭풍 기관총(MG) 및 초장거리 관통 레일건(RG)으로 적진 전체를 유린합니다.' }
            ]
          }
        },
        {
          id: 'role_dealer_middle',
          name: '딜러 [MIDDLE]',
          tag: '역할군',
          color: '#06b6d4',
          role: '딜러',
          position: 'MIDDLE',
          positionRange: 750,
          desc: '• 역할: 딜러 | 포지션: MIDDLE (750px)<br>딜러는 적에게 강한 피해를 줘서 적을 처치해요.',
          skillDetails: {
            title: '역할군: 딜러 (Dealer)',
            keyLabel: '[포지션: MIDDLE] 중열 딜러',
            badgeColor: '#06b6d4',
            tags: ['역할: 딜러', '포지션: MIDDLE', '사거리: 750px', '표준 교전선'],
            sections: [
              { title: '역할군 개요', text: '딜러는 적에게 강한 피해를 줘서 적을 처치해요.\n공수 밸런스를 유지하며 전방과 후방의 연결 고리 역할을 수행합니다.' },
              { title: '포지션: MIDDLE (중열)', text: '표준 중거리 교전 포지션 (기본 사거리 750px).\n안정적인 사선 확보와 유연한 기동 사격(AR)을 통해 지속 화력을 투사합니다.' }
            ]
          }
        },
        {
          id: 'role_dealer_front',
          name: '딜러 [FRONT]',
          tag: '역할군',
          color: '#ef4444',
          role: '딜러',
          position: 'FRONT',
          positionRange: 400,
          desc: '• 역할: 딜러 | 포지션: FRONT (400px)<br>딜러는 적에게 강한 피해를 줘서 적을 처치해요.',
          skillDetails: {
            title: '역할군: 딜러 (Dealer)',
            keyLabel: '[포지션: FRONT] 전열 딜러',
            badgeColor: '#ef4444',
            tags: ['역할: 딜러', '포지션: FRONT', '사거리: 400px', '근접 전선 돌파'],
            sections: [
              { title: '역할군 개요', text: '딜러는 적에게 강한 피해를 줘서 적을 처치해요.\n높은 화력 투사력으로 전선의 위협적인 적을 최우선으로 제압합니다.' },
              { title: '포지션: FRONT (전열)', text: '최전방 근접 교전 포지션 (기본 사거리 400px).\n적과의 거리가 가장 가깝고 화력 밀도가 높은 산탄(SG) 등 전열 무장과 함께 활약합니다.' }
            ]
          }
        },
        {
          id: 'role_tanker_middle',
          name: '탱커 [MIDDLE]',
          tag: '역할군',
          color: '#f59e0b',
          role: '탱커',
          position: 'MIDDLE',
          positionRange: 850,
          desc: '• 역할: 탱커 | 포지션: MIDDLE (850px)<br>탱커는 적의 공격을 버텨내고 아군을 지켜요.',
          skillDetails: {
            title: '역할군: 탱커 (Tanker)',
            keyLabel: '[포지션: MIDDLE] 중열 탱커',
            badgeColor: '#f59e0b',
            tags: ['역할: 탱커', '포지션: MIDDLE', '사거리: 850px', '전술 방패/보호막'],
            sections: [
              { title: '역할군 개요', text: '탱커는 강력한 방어력과 전술 보호막으로 적의 공격을 버텨내고 전선을 수호해요.' },
              { title: '포지션: MIDDLE (중열)', text: '표준 중거리 포지션 (기본 사거리 850px).\n전술 방패와 보호막을 바탕으로 안정적으로 전선을 유지하며 교전합니다.' }
            ]
          }
        }
      ],

      // 슬롯 3, 4, 5: 서브스킬 (신규 7종)
      subskills: [
        {
          id: 'ceramic_plate',
          name: '세라믹 방탄판',
          tag: '서브스킬',
          desc: '방어력 20% 증가'
        },
        {
          id: 'emergency_aid_b',
          name: '긴급 구호 세트 B',
          tag: '서브스킬',
          desc: '45초마다 체력 3500 회복'
        },
        {
          id: 'disciplined_stamina',
          name: '단련된 체력',
          tag: '서브스킬',
          desc: '코스트 회복속도 20% 감소(쿨이 줄어듬)'
        },
        {
          id: 'tactical_support',
          name: '전술 보조',
          tag: '서브스킬',
          desc: '치명 데미지 17% 증가'
        },
        {
          id: 'mad_dog_tenacity',
          name: '미친개의 집념',
          tag: '서브스킬',
          desc: '공격력 24.5% 증가'
        },
        {
          id: 'resolute_will',
          name: '단호한 결의',
          tag: '서브스킬',
          desc: '치명 수치 26.6% 증가'
        },
        {
          id: 'embracing_instinct',
          name: '감싸 안는 직감',
          tag: '서브스킬',
          desc: '코스트 15 소모시 마다 최대체력의 5% 만큼의 보호막 부여 25초'
        }
      ],

      // 슬롯 6: 소속 (학원 / 단체 - 13개 소속)
      slot6: [
        {
          id: 'gehenna',
          name: '게헨나',
          tag: '소속',
          color: '#ef4444',
          desc: '• 기본 공격력 +70'
        },
        {
          id: 'millennium',
          name: '밀레니엄',
          tag: '소속',
          color: '#38bdf8',
          desc: '• 공격력 +1%, 받는 피해 2% 감소'
        },
        {
          id: 'trinity',
          name: '트리니티',
          tag: '소속',
          color: '#facc15',
          desc: '• 명중 수치 +5%'
        },
        {
          id: 'abydos',
          name: '아비도스',
          tag: '소속',
          color: '#06b6d4',
          desc: '• 이동속도 +10%, 공격력 +25'
        },
        {
          id: 'hyakkayouran',
          name: '백화요란',
          tag: '소속',
          color: '#f43f5e',
          desc: '• 재장전 시간 -10%, 이동속도 +5%'
        },
        {
          id: 'shanhaijing',
          name: '산해경',
          tag: '소속',
          color: '#10b981',
          desc: '• 치명 수치(치명타 확률) +7%'
        },
        {
          id: 'hyakkiyako',
          name: '백귀야행',
          tag: '소속',
          color: '#ec4899',
          desc: '• 최대 체력 +5%'
        },
        {
          id: 'redwinter',
          name: '붉은겨울',
          tag: '소속',
          color: '#ea580c',
          desc: '• 군중제어 저항력 +10%'
        },
        {
          id: 'arius',
          name: '아리우스',
          tag: '소속',
          color: '#8b5cf6',
          desc: '• 이동속도 +6%, 공격력 +1%, 방어력 +1%'
        },
        {
          id: 'wildhunt',
          name: '와일드헌트',
          tag: '소속',
          color: '#a855f7',
          desc: '• 치명 저항력 +12%'
        },
        {
          id: 'srt',
          name: 'SRT',
          tag: '소속',
          color: '#60a5fa',
          desc: '• 이동속도 +5%, 방어력 +3%'
        },
        {
          id: 'valkyrie',
          name: '발키리',
          tag: '소속',
          color: '#818cf8',
          desc: '• 방어력 +6%'
        },
        {
          id: 'the_head',
          name: '머리',
          tag: '소속',
          color: '#e2e8f0',
          desc: '• 효과 없음'
        }
      ],

      // 슬롯 8: 제약 (준비중)
      slot8: [
        {
          id: 'none',
          name: '준비중',
          tag: '제약',
          desc: '현재 준비 중인 항목입니다.'
        }
      ],

      // 슬롯 9: 가호 (준비중)
      slot9: [
        {
          id: 'none',
          name: '준비중',
          tag: '가호',
          desc: '현재 준비 중인 항목입니다.'
        }
      ],

      // 난이도
      difficulty: [
        {
          id: 'diff_extreme',
          name: 'Extreme',
          color: '#facc15',
          tag: '플레이 가능',
          badge: 'EXTREME',
          isDev: false,
          desc: '• KAITEN FX Mk.0 정규 작전|• 현재 플레이 가능한 기본 총력전 난이도입니다.'
        },
        {
          id: 'diff_insane',
          name: 'Insane',
          color: '#a855f7',
          tag: '제작 중',
          badge: 'INSANE',
          isDev: true,
          desc: '• KAITEN FX Mk.0 상위 난이도 작전|• 현재 제작 중입니다.'
        },
        {
          id: 'diff_torment',
          name: 'Torment',
          color: '#ef4444',
          tag: '제작 중',
          badge: 'TORMENT',
          isDev: true,
          desc: '• KAITEN FX Mk.0 최고 난도 작전|• 현재 제작 중입니다.'
        },
        {
          id: 'diff_lunatic',
          name: 'Lunatic',
          color: '#ec4899',
          tag: '제작 중',
          badge: 'LUNATIC',
          isDev: true,
          desc: '• KAITEN FX Mk.0 초극한 난이도 작전|• 현재 제작 중입니다.'
        }
      ]
    };

    // 현재 플레이어가 장착 중인 장비 상태
    const playerLoadout = {
      slot1: EQUIPMENT_DATABASE.slot1[0], // MG
      slot7: EQUIPMENT_DATABASE.slot7[0], // 역할군 (준비 중)
      slot6: EQUIPMENT_DATABASE.slot6[0], // 게헨나
      slot3: EQUIPMENT_DATABASE.subskills[0], // 세라믹 방탄판
      slot4: EQUIPMENT_DATABASE.subskills[1], // 긴급 구호 세트 B
      slot5: EQUIPMENT_DATABASE.subskills[2], // 단련된 체력
      slot8: EQUIPMENT_DATABASE.slot8[0], // 없음
      slot9: EQUIPMENT_DATABASE.slot9[0], // 없음
      difficulty: null // 아래 초기화 시점 또는 EQUIPMENT_DATABASE.difficulty[0]
    };
    playerLoadout.difficulty = EQUIPMENT_DATABASE.difficulty[0];



    // 모달 DOM 참조