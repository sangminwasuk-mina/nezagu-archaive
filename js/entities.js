// ==========================================
// entities.js - 엔티티(플레이어, 카메라, 서포터, 카이텐저, 투사체, 배경)
// ==========================================
    // 1. 진압팀 플레이어 데이터 및 전투 자원 시스템
    const player = {
      x: 350,
      y: 0,
      width: 36,
      height: 48,
      color: '#0284c7',
      facing: 1, // 1: 오른쪽, -1: 왼쪽
      baseMaxHp: 65000,
      maxHp: 65000,
      hp: 65000,
      baseSpeed: 6.0,
      speed: 6.0,
      vx: 0,
      vy: 0,
      isGrounded: false,

      // [전투 세부 스탯 시스템] 기본값 설정
      accuracy: 0,        // 명중 수치
      evasion: 0,         // 회피 수치
      crit: 350,          // 치명 수치 (적 저항 100 상대로 20% 발동)
      critResist: 100,    // 치명 저항
      critDmg: 350,       // 치명 대미지 (적 저항 50 상대로 300% = 3.0배)
      critDmgResist: 50,  // 치명 대미지 저항
      stability: 1500,    // 안정 수치 (표기 대미지 대비 80%~100% 난수)
      baseDefense: 200,   // 기본 방어력
      defense: 200,       // 현재 방어력
      emergencyAidTimer: 0, // 긴급 구호 세트 B (45초 회복 타이머)
      instinctCostCounter: 0, // 감싸 안는 직감 (15 코스트 소모 카운터)
      instinctShieldHp: 0,    // 감싸 안는 직감 보호막 체력
      instinctShieldDuration: 0, // 감싸 안는 직감 보호막 지속시간 (25초)
      ccPower: 0,         // 군중 제어 강화력
      ccResist: 0,        // 군중 제어 저항력

      // 조준 모드: 'auto' (자동 에임 - 최근접 적 타겟팅) | 'manual' (수동 에임 - 전방/수동 지향)
      aimMode: 'auto',

      // 달리기 토글 (세미콜론 키)
      isRunning: false,

      // 대시 회피 (이동키 더블탭, 쿨타임 1.5s)
      dashTimer: 0,
      dashCooldown: 1.5,
      isDashing: false,
      dashDuration: 0.18,
      dashSpeed: 20,

      // 전술 코스트 (최대 15, 2.5초마다 +1)
      cost: 6,
      maxCost: 15,
      costTimer: 0,

      // 현재 무기 슬롯: 'main' (슬롯1 MG) | 'sub' (슬롯7 HG)
      activeWeaponSlot: 'main',

      // 메인 무기(MG/RG) 탄약 및 탄창 상태
      mainWeapon: {
        id: 'mg_destructor',
        name: 'MG (종막의 디스트로이어)',
        ammo: 40,
        maxAmmo: 40,
        mags: Infinity,
        maxMags: Infinity,
        isReloading: false,
        reloadTimer: 0,
        reloadDuration: 2.5,
        magChargeTimer: 0,
        magChargeInterval: 90, // 1분 30초
        fireDelay: 0.11, // 연사 딜레이
        fireTimer: 0,
        flashTimer: 0
      },

      // 보조 무기(HG) 탄약 및 탄창 상태
      subWeapon: {
        ammo: 6,
        maxAmmo: 6,
        mags: Infinity,
        maxMags: Infinity,
        isReloading: false,
        reloadTimer: 0,
        reloadDuration: 1.0,
        magChargeTimer: 0,
        magChargeInterval: 40, // 40초
        fireDelay: 0.22,
        fireTimer: 0,
        flashTimer: 0
      },

      // 메인 스킬 상태 (MG 종막: 이스보셋 / RG 밸런스 붕괴 공용 및 전용 필드)
      skillCooldown: 0,
      isFiringSkill: false,
      skillBurstCount: 0,
      skillBurstInterval: 0,

      // [RG 밸런스 붕괴] 차징 시스템
      isChargingSkill: false,
      chargeTimer: 0,
      chargeMax: 1.2,
      chargeLevel: 1, // 1 (기본 320%*1), 2 (+5코 1.5배), 3 (+5코 2.0배)

      // [보조스킬: 빛이여!] 타이머 시스템 (25초 주기, 10초 지속)
      lightBeTimer: 0,
      lightBeCycle: 25,
      isLightBeActive: false,
      lightBeActiveDuration: 10,
      lightBeActiveTimer: 0,

      // [메인스킬: 기괴멸렬] SG 특수 강화 상태 (다음 6회 사격 12연발 강화)
      sgSkillActive: false,
      sgSkillShotsLeft: 0,

      // [메인스킬 2: 격류] SG 차징 및 8회 연속 산탄 발사 시스템
      sgSkill2Cooldown: 0,
      sgSkill2CooldownMax: 2.5,
      sgTorrentCharging: false,
      sgTorrentChargeTimer: 0,
      sgTorrentChargeMax: 0.5,
      sgTorrentFiring: false,
      sgTorrentShotsLeft: 0,
      sgTorrentInterval: 0,

      // [메인스킬 2: 빛의 검/각성 : 슈퍼노바] RG 단계 충전 및 4초 거대 관통 레이저 시스템
      rgSkill2Cooldown: 0,
      rgSkill2CooldownMax: 2.5,
      rgAwakeStage: 0, // 0: 미충전, 1: 1단계 충전됨, 2: 2단계 충전됨
      rgAwakeCharging: false, // 차징 중 (0.5s 단계충전 or 2.0s 레이저발사 준비)
      rgAwakeChargeTimer: 0,
      rgAwakeChargeMax: 0.5,
      rgAwakeChargeType: 'stage', // 'stage' (0.5s 충전) 또는 'fire' (2.0s 레이저 발사 준비)
      rgAwakeFiring: false, // 4초간 레이저 발사 중
      rgAwakeLaserTimer: 0, // 0 ~ 4.0s
      rgAwakeLaserTick: 0, // 0.1s 마다 1타격
      rgAwakeFacing: 1, // 발사 시 고정된 방향

      // [메인스킬 2: 개연 : 이스보셋] MG 집중 사격 자세 및 3단계 선율 발사 시스템
      mgSkill2Cooldown: 0,
      mgSkill2CooldownMax: 2.5,
      mgStanceActive: false, // 15초 집중 사격 자세 유지 여부
      mgStanceTransitioning: false, // 2.0초 자세 전환 중
      mgStanceTransitionTimer: 0,
      mgStanceTimer: 0, // 0 ~ 15.0초 유지 타이머
      mgStanceShotStage: 0, // 0: 1음 발사 대기, 1: 2음 발사 대기, 2: 종연 발사 대기, 3: 완료
      mgStanceShotDelay: 0, // 발사 후 1.5초 딜레이

      // [메인스킬 2: 라이딩 그레네이드] AR 투척형 구체 시스템
      arSkill2Cooldown: 0,
      arSkill2CooldownMax: 2.5,

      // [특수스킬: 선도부장] MG 체력 50% 이하 1회 해금, 7초 연속 제자리 폭풍 관통 난사 시스템
      specialSkillUnlocked: false,
      specialSkillUsed: false,
      isFiringSpecial: false,
      specialTimer: 0,
      specialShotInterval: 0,
      specialPhase: 1,
      specialIsBerserk: false,

      // [전투 통계 & 특수스킬 해금용]
      spentCostTotal: 0, // 전투 중 소모한 총 누적 코스트

      // [특수스킬: 시스템 : 아비 에슈흐] RG 누적 코스트 300(테스트 10) 이상 1회 해금, 폼 체인지 & 피니셔 시스템
      isAbiEshuhActive: false,
      abiTransforming: false,
      abiTransformTimer: 0,
      isHovering: false,
      abiNormalCharging: false,
      abiNormalChargeTimer: 0,
      abiMissileHistory: [],
      abiMissileCooldown: 0,
      abiBarrageFiring: false,
      abiBarrageTimer: 0,
      abiBarrageShotTimer: 0,
      abiFinalReady: false,
      abiFinalDelayTimer: 0,
      abiFinalCanTrigger: false,
      abiFinalPhase: 'none', // 'none' | 'charging' | 'fly_up' | 'dive_slash' | 'hitstop' | 'flash_burst' | 'done'
      abiFinalChargeTimer: 0,
      abiFinalFlyTimer: 0,
      abiFinalStartX: 0,
      abiFinalStartY: 0,
      abiFinalTargetX: 0,
      abiFinalTargetY: 0,
      abiFinalHitstopTimer: 0,
      abiFinalFlashTimer: 0,
      abiFinalHitEnemies: [],
      abiStunTimer: 0,
      stunTimer: 0, // 일반 CC 기절 타이머 (카이텐 FX 하이퍼 정어리 미사일 등)
      affiliation: 'gehenna',
      affiliationFlatAtk: 0,
      affiliationDmgMult: 1.0,
      affiliationDmgTakenMult: 1.0,
      ccResist: 0,
      critResist: 100,

      // [특수스킬: 불사(不死)] SG 상시 1회 발동, 완전 무적 & 무한 난사 시스템
      isImmortalActive: false,
      immortalTimer: 0,
      immortalMaxDuration: 7.5,
      immortalHpRatioAtStart: 1.0,
      immortalIsAlwaysCrit: false,
      immortalFireDelay: 0.25,
      immortalBaseDmg: 1200,
      immortalPellets: 6,
      immortalShotsCount: 0,
      immortalStack: 0,
      immortalTotalDmgDealt: 0,

      // [AR 특수스킬: 색채(色彩) & BLACK FANG 465 각성]
      isColorActive: false, // 색채 각성 상태 활성화 여부
      colorErosionTimer: 0, // 매초 0.5~1.2% 체력 감소 타이머
      calmBreathActive: false, // 침착한 호흡 (사망 유예) 활성화 여부
      calmBreathTimer: 0, // 15초 유예 타이머
      calmBreathUsed: false, // 1회성 발동 여부
      // [FOX 45식 기관단총: 전술 방패 전개 & 전술 보호막 시스템]
      tacticalShield: 0,        // 현재 전술 보호막 체력
      tacticalShieldMax: 0,     // 최대 전술 보호막 체력 (최대 체력의 12%)
      tacticalShieldTimer: 0,   // 전술 보호막 지속시간 (15초)
      isTacticalDefActive: false, // 전술 방어 상태 돌입 여부
      foxShieldCooldown: 0,     // 전술 방패 전개 쿨타임 (40초)
      foxSkill2Cooldown: 0,     // 공세 전환 쿨타임 (2.5초)
      originalColor: '#0284c7', // 원래 플레이어 색상 보관

      // [메인 근접 무기: Red Mist (미미크리) 시스템]
      redMistStance: 'horizontal', // 'horizontal' (횡베기), 'vertical' (종베기), 'thrust' (찌르기)
      redMistStack: 0, // 붉은안개 스택 (0 ~ 100)
      redMistStanceDmgBuff: false, // 1스킬 전환 후 다음 공격 피해량 +10% (개화 시 +35%)
      redMistKihapBuffCount: 0, // 기합 발동 후 다음 공격 3회 피해량 증가 카운트 (300% / 개화 시 650%)
      redMistKihapBuffMult: 3.0,
      redMistKihapStunSelfTimer: 0, // 기합 시전 후 0.7초 이동 불가 타이머
      redMistThrustBonusDmgRatio: 0, // 돌진 치명타 발동 시 누적 피해량 비율 (+0.55씩 합산, 개화 시 +1.35)
      redMistSkill2Cooldown: 0, // 2스킬 (기합/돌진) 쿨타임
      redMistSkill2CooldownMax: 5.0, // 기본 5초 (개화 돌진 시 8초)
      redMistDashing: false, // 돌진 대시 실행 중 여부
      redMistDashTimer: 0,
      redMistDashStartX: 0,
      redMistDashTargetX: 0,
      redMistDashHitEnemies: [],
      // E.G.O 개화 상태
      isEgoActive: false, // E.G.O 개화 활성화 여부
      isEgoForced: false, // 체력 10% 이하 강제 개화 여부 (공격력 -40%, 치명타 봉인)
      egoExhausted: false, // 스택 0 도달 시 영구 탈진 (8초 기절, 충전 불가, 패시브 획득)
      egoExhaustTimer: 0, // 8초 탈진 기절 타이머
      egoPassiveSpeedBuff: false, // 탈진 후 영구 이동속도 +5%
      egoPassiveCostBuff: false, // 탈진 후 영구 코스트 회복속도 10% 단축
      // 특수스킬 시전 페이즈
      redMistSpecialPhase: 'none', // 'none' | 'vertical_dash' | 'vertical_slashes' | 'vertical_finish' | 'horizontal_windup' | 'horizontal_slash'
      redMistSpecialTimer: 0,
      redMistSpecialTarget: null,
      redMistSpecialHitEnemies: [],
      redMistSpecialTicksDone: 0,
      redMistAttackAnim: null, // 평타 애니메이션: { type: 'horizontal'|'vertical'|'thrust', timer: 0.3, maxTimer: 0.3 }
      redMistThrustSlideTimer: 0, // 찌르기 부드러운 슬라이딩 대시 타이머
      redMistThrustSlideSpeed: 0
    };

    // 1.5. 동료 스트라이커 (2인 멀티플레이 시 동기화되는 2P 스트라이커)
    const remotePlayer = {
      isActive: false,
      role: 'guest', // 'host' or 'guest'
      x: 450,
      y: 0,
      width: 36,
      height: 48,
      color: '#ef4444', // 기본 2P 레드 (1P는 블루)
      facing: 1,
      baseMaxHp: 65000,
      maxHp: 65000,
      hp: 65000,
      cost: 6,
      maxCost: 15,
      isGrounded: true,
      isRunning: false,
      isDashing: false,
      activeWeaponSlot: 'main',
      mainWeapon: {
        id: 'mg_destructor',
        name: 'MG (종막의 디스트로이어)',
        ammo: 40,
        maxAmmo: 40,
        mags: Infinity,
        maxMags: Infinity,
        isReloading: false,
        reloadTimer: 0,
        reloadDuration: 2.5,
        flashTimer: 0
      },
      subWeapon: {
        id: 'hg_sidearm',
        name: 'HG (보조 권총)',
        ammo: 6,
        maxAmmo: 6,
        mags: Infinity,
        maxMags: Infinity,
        isReloading: false,
        reloadTimer: 0,
        reloadDuration: 1.0,
        flashTimer: 0
      },
      isChargingSkill: false,
      chargeTimer: 0,
      chargeMax: 1.2,
      chargeLevel: 1,
      isFiringSkill: false,
      isLightBeActive: false,
      lightBeActiveTimer: 0,
      sgSkillActive: false,
      sgSkillShotsLeft: 0,
      sgTorrentCharging: false,
      sgTorrentChargeTimer: 0,
      sgTorrentFiring: false,
      sgTorrentShotsLeft: 0,
      rgAwakeStage: 0,
      rgAwakeCharging: false,
      rgAwakeChargeTimer: 0,
      rgAwakeChargeMax: 0.5,
      rgAwakeChargeType: 'stage',
      rgAwakeFiring: false,
      rgAwakeLaserTimer: 0,
      rgAwakeFacing: 1,
      mgSkill2Cooldown: 0,
      mgStanceActive: false,
      mgStanceTransitioning: false,
      mgStanceTransitionTimer: 0,
      mgStanceTimer: 0,
      mgStanceShotStage: 0,
      mgStanceShotDelay: 0,
      specialSkillUnlocked: false,
      specialSkillUsed: false,
      isFiringSpecial: false,
      specialTimer: 0,
      specialShotInterval: 0,
      specialPhase: 1,
      specialIsBerserk: false,
      spentCostTotal: 0,
      isAbiEshuhActive: false,
      abiTransforming: false,
      isHovering: false,
      abiBarrageFiring: false,
      abiFinalPhase: 'none',
      abiStunTimer: 0,
      stunTimer: 0,
      tacticalShield: 0,
      tacticalShieldMax: 0,
      tacticalShieldTimer: 0,
      isTacticalDefActive: false
    };

    // 독립 카메라 좌표 (화면 스크롤 기준 및 연출용 Y, Zoom)
    const camera = { x: 0, y: 0, zoom: 1.0, targetZoom: 1.0 };

    // [연출 시스템] 1페이즈 오프닝 & 2페이즈 합체 컷씬 전역 상태 객체
    window.phase1Cutscene = {
      active: true,
      state: 'rooftop', // 'rooftop' | 'jump' | 'land' | 'weapon_spin' | 'red_pose' | 'team_pose' | 'explosion' | 'done'
      timer: 0,
      subTimer: 0,
      rangers: []
    };

    window.phase2Cutscene = {
      active: false,
      state: 'none', // 'fade_out' | 'fade_in' | 'defeated_cuts' | 'weapon_raise' | 'sky_fall' | 'docking' | 'eye_flash_pose' | 'lightning_strike' | 'boss_title' | 'done'
      timer: 0,
      subTimer: 0,
      cutIndex: 0,
      dockStep: 0,
      fadeAlpha: 0
    };





    // 2. 카이텐저 5인방 데이터 (정사각형 블록, 공격력, 스킬 쿨타임/지속시간)
    const kaitenzers = [
      {
        id: 'red',
        name: '레드',
        role: 'AR',
        color: '#ef4444',
        armorType: 'light', // 원작 고증: 경장갑 (폭발 약점)
        attackType: 'normal', // 카이텐저 기본 공격 유형 (일반)
        defense: 0,
        accuracy: 0,
        evasion: 0,
        crit: 350,
        critResist: 100,
        critDmg: 350,
        critDmgResist: 50,
        stability: 1500,
        x: 1550,
        atk: 150,
        maxHp: 1000000,
        hp: 1000000,
        size: 46,
        isSpawned: true, // 개전 시 유일하게 단독 등장!
        isDead: false,
        skillName: '도발',
        cooldownMax: 35,
        cooldownTimer: 6,
        durationMax: 10,
        durationTimer: 0,
        isActive: false,
        attackTimer: 0,
        burstCount: 0,
        burstInterval: 0,
        jumpY: 0,
        vy: 0,
        jumpTimer: 2.0,
        isSkillSealed: false,
        baseSpeed: 1.8,
        speed: 1.8
      },
      {
        id: 'black',
        name: '블랙',
        role: 'HG',
        color: '#1e293b',
        border: '#94a3b8',
        armorType: 'light', // 원작 고증: 경장갑
        attackType: 'normal', // 기본 일반공격
        defense: 0,
        accuracy: 0,
        evasion: 0,
        crit: 350,
        critResist: 100,
        critDmg: 350,
        critDmgResist: 50,
        stability: 1500,
        x: 1200,
        atk: 100,
        maxHp: 1000000,
        hp: 1000000,
        size: 44,
        isSpawned: true, // 5인 전원 개전 즉시 출격
        isDead: false,
        skillName: '지휘',
        cooldownMax: 18,
        cooldownTimer: 3,
        durationMax: 10,
        durationTimer: 0,
        isActive: false,
        attackTimer: 0,
        facing: -1,
        jumpY: 0,
        vy: 0,
        jumpTimer: 3.5,
        isSkillSealed: false,
        baseSpeed: 2.2,
        speed: 2.2
      },
      {
        id: 'yellow',
        name: '옐로',
        role: 'SR',
        color: '#eab308',
        armorType: 'light', // 원작 고증: 경장갑
        attackType: 'normal', // 기본 일반공격
        defense: 0,
        accuracy: 0,
        evasion: 0,
        crit: 350,
        critResist: 100,
        critDmg: 350,
        critDmgResist: 50,
        stability: 1500,
        x: 1800,
        atk: 1200,
        maxHp: 1000000,
        hp: 1000000,
        size: 44,
        isSpawned: true, // 5인 전원 개전 즉시 출격
        isDead: false,
        skillName: '강화공격',
        cooldownMax: 20,
        cooldownTimer: 10,
        durationMax: 1,
        durationTimer: 0,
        isActive: false,
        attackTimer: 0,
        aimTargetY: 0,
        laserLock: false,
        laserState: 'none', // 'aiming', 'locked', 'fired'
        jumpY: 0,
        vy: 0,
        jumpTimer: 4.5,
        isSkillSealed: false,
        baseSpeed: 1.4,
        speed: 1.4
      },
      {
        id: 'green',
        name: '그린',
        role: 'MG',
        color: '#22c55e',
        armorType: 'light', // 원작 고증: 경장갑
        attackType: 'normal', // 기본 일반공격
        defense: 0,
        accuracy: 0,
        evasion: 0,
        crit: 350,
        critResist: 100,
        critDmg: 350,
        critDmgResist: 50,
        stability: 1500,
        x: 1500,
        atk: 75,
        maxHp: 1000000,
        hp: 1000000,
        size: 46,
        isSpawned: true, // 5인 전원 개전 즉시 출격
        isDead: false,
        skillName: '광범위난사',
        cooldownMax: 25,
        cooldownTimer: 12,
        durationMax: 4,
        durationTimer: 0,
        isActive: false,
        attackTimer: 0,
        heatTimer: 0,
        isOverheated: false,
        jumpY: 0,
        vy: 0,
        jumpTimer: 3.0,
        isSkillSealed: false,
        baseSpeed: 1.6,
        speed: 1.6
      },
      {
        id: 'pink',
        name: '핑크',
        role: 'RL',
        color: '#ec4899',
        armorType: 'light', // 원작 고증: 경장갑
        attackType: 'normal', // 기본 일반공격
        defense: 0,
        accuracy: 0,
        evasion: 0,
        crit: 350,
        critResist: 100,
        critDmg: 350,
        critDmgResist: 50,
        stability: 1500,
        x: 1650,
        atk: 2500,
        maxHp: 1000000,
        hp: 1000000,
        size: 48,
        isSpawned: true, // 5인 전원 개전 즉시 출격
        isDead: false,
        skillName: '스킬 없음',
        cooldownMax: 0,
        cooldownTimer: 0,
        durationMax: 0,
        durationTimer: 0,
        isActive: false,
        attackTimer: 0,
        jumpY: 0,
        vy: 0,
        jumpTimer: 2.8,
        isSkillSealed: false,
        baseSpeed: 1.7,
        speed: 1.7
      }
    ];

    // 카이텐저 5인 동시 출격 (순차 증원 불필요)
    let phase1Members = ['black', 'green'];
    let phase2Members = ['yellow', 'pink'];
    let phase1Triggered = true;
    let phase2Triggered = true;

    // 카이텐저 1페이즈 격파 및 2페이즈 암전 전환 상태 변수
    let phase1Defeated = false;
    let isPhase1Retreating = false;
    let phase1RetreatTimer = 0;
    let isPhase2Active = false;

    // ==========================================
    // [2페이즈 최종 결전 병기: KAITEN FX Mk.0]
    // ==========================================
    const kaitenFx = {
      id: 'kaiten_fx',
      name: 'KAITEN FX Mk.0',
      isSpawned: false,
      isDead: false,
      isActive: false,

      // 좌표 및 크기 (거대 결전 로봇: 폭 260px, 높이 360px - 압도적 위용)
      x: 1800,
      y: 0,
      width: 260,
      height: 360,
      facing: -1, // 기본값 왼쪽(-1) 플레이어 지향
      vx: 0,
      vy: 0,
      speed: 2.8,

      // 체력 및 스탯
      maxHp: 7500000,
      hp: 7500000,
      armorType: 'light', // 원작 고증: 경장갑 (폭발 약점)
      baseAtk: 1000,
      atk: 1000,
      defense: 0,
      accuracy: 100,

      // ATG 게이지 (Active Time Gauge, 45초 완전 충전)
      atg: 0,
      maxAtg: 100,
      atgTimer: 0,
      atgMaxDuration: 45, // 45초

      // 파츠 시스템 ([무한히 타오르는 뜨거운 마음]: 25초 순환)
      activePart: 'pink', // 'pink'(오른팔) | 'red'(가슴) | 'green'(왼팔)
      partCycleTimer: 0,
      partCycleDuration: 25, // 25초 주기
      partSkillDelayTimer: 2.0, // 파츠 전환 후 2초 뒤 스킬 1회 시전
      partSkillTriggered: false,
      partSkillCount: 0,
      allPartsBrokenNotified: false,

      // 상태이상 & 그로기 시스템
      stunTimer: 0,
      partGroggyTimer: 0, // 파츠 파괴 시 5초간 무릎 꿇기 그로기
      isPartGroggy: false,
      groggyDmgMultiplier: 1.5, // 그로기 중 받는 피해 1.5배 (150%) 증폭
      // 패시브: [무한히 회전하는 초밥] - CC기 지속시간 75% 감소 (단, 파츠 파괴 5초 그로기는 제외)
      ccReductionRate: 0.75,

      // 3개 핵심 파츠별 내구도 (최대체력의 24% = 1,800,000)
      partMaxHp: 1800000,
      parts: {
        pink: {
          name: '오른팔 (핑크: 새우)',
          color: '#ec4899',
          hp: 1800000,
          maxHp: 1800000,
          isBroken: false,
          skillName: '무한회전ㆍ슈퍼 새우 머신건'
        },
        red: {
          name: '가슴 (레드: 참치)',
          color: '#ef4444',
          hp: 1800000,
          maxHp: 1800000,
          isBroken: false,
          skillName: '무한회전ㆍ하이퍼 정어리 미사일'
        },
        green: {
          name: '왼팔 (그린: 오이롤/실드)',
          color: '#22c55e',
          hp: 1800000,
          maxHp: 1800000,
          isBroken: false,
          skillName: '무한회전ㆍ울트라 뚜껑 실드'
        }
      },

      // 스킬 & 버프 진행 상태
      shieldActive: false,
      shieldHitCount: 0, // 메인스킬 1,2 25회 피격 카운터
      shieldVisualTimer: 0, // 3초 플라즈마 보호막 비주얼 타이머
      chestHatchTimer: 0,   // 가슴 해치 오픈 타이머
      isFiringSkill: false,
      skillTimer: 0,
      isSlashing: false, // 파이널 고등어 슬래쉬 발동 중
      slashTimer: 0,
      aimAngle: 0, // 플레이어 조준 각도 (-35도 ~ +25도)

      // 보행(워킹) 애니메이션 상태
      isMoving: false,
      walkCycleTimer: 0,
      kneelProgress: 0, // _ㅣㄱ 무릎 꿇기 부드러운 전환 보간값 (0.0: 서있음, 1.0: 완전히 꿇음)

      // 평타 타이머 (0.5초 동안 15발 난사)
      normalAttackTimer: 0,
      normalAttackCooldown: 2.8,
      isFiringNormal: false,
      normalBurstCount: 0,
      normalBurstTimer: 0,

      // 등장 합체 애니메이션 시퀀스 상태
      introState: 'none', // 'none' | 'fade_out' | 'docking' | 'head' | 'eye_flash' | 'explosion' | 'ready'
      introTimer: 0
    };


    const bullets = [];
    const explosions = [];
    const textParticles = [];
    const specialParticles = [];

    function addDamageText(x, y, text, color) {
      textParticles.push({
        x: x,
        y: y,
        text: text,
        color: color,
        alpha: 1,
        life: 50
      });
    }


    // 도심 배경 빌딩 데이터
    const farBuildings = [];
    for (let x = 0; x < WORLD_WIDTH; x += 140) {
      farBuildings.push({
        x: x,
        width: 90 + ((x * 3) % 40),
        height: 380 + ((x * 7) % 180),
        color: `hsl(${205 + (x % 20)}, 35%, 82%)`
      });
    }
    const midBuildings = [];
    for (let x = 0; x < WORLD_WIDTH; x += 180) {
      midBuildings.push({
        x: x,
        width: 140 + (x % 50),
        height: 480 + ((x * 11) % 200),
        color: `hsl(${210 + (x % 15)}, 40%, 68%)`,
        windows: (x % 2 === 0)
      });
    }
