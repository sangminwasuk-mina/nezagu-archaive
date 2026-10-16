// ==========================================
// main.js - 입력 처리, 전투 시스템 로직, 게임 루프
// ==========================================
    // 키 입력 상태
    const keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      attack: false,
      skill: false
    };

    // 더블탭 감지용 변수
    let lastLeftTapTime = 0;
    let lastRightTapTime = 0;

    // 조작키 이벤트 리스너
    window.addEventListener('keydown', (e) => {
      // [신규 UI: 조작키 도움말(=/+) 1회 호출 고정 및 브라우저 단축키 충돌 차단]
      if (e.key === '=' || e.key === '+' || e.code === 'Equal' || e.key === 'Add' || e.code === 'NumpadAdd') {
        e.preventDefault();
        if (!e.repeat && typeof toggleControlsHelp === 'function') {
          toggleControlsHelp();
        }
        return; // 키 반복(e.repeat) 시에도 즉시 리턴하여 중복 호출 원천 차단
      }

      // Escape를 누르면 조작키 도움말 팝업 닫기
      if (e.key === 'Escape') {
        const helpModalEl = document.getElementById('controls-help-modal');
        if (helpModalEl && !helpModalEl.classList.contains('hidden')) {
          e.preventDefault();
          if (typeof toggleControlsHelp === 'function') {
            toggleControlsHelp(false);
          }
          return;
        }
      }

      if (currentGameState !== 'battle') return;

      const now = performance.now();

      if (myRole === 'striker' || myRole === 'guest_striker') {
        // 기절(Stun) 상태 시 모든 입력 조작 차단
        if (player.stunTimer > 0) return;

        // [스트라이커 조작: 1P 및 2P 공통]
        // 1. 좌우 이동 & 따닥(더블탭) 대시: A키, D키 (방향키 ArrowLeft/ArrowRight도 동시 지원)
        if (e.key === 'a' || e.key === 'A' || e.code === 'KeyA' || e.key === 'ㅁ' || e.key === 'ArrowLeft') {
          keys.left = true;
          player.facing = -1;
          if (!e.repeat) {
            if (now - lastLeftTapTime < 320) {
              triggerDash(-1);
            }
            lastLeftTapTime = now;
          }
        }
        if (e.key === 'd' || e.key === 'D' || e.code === 'KeyD' || e.key === 'ㅇ' || e.key === 'ArrowRight') {
          keys.right = true;
          player.facing = 1;
          if (!e.repeat) {
            if (now - lastRightTapTime < 320) {
              triggerDash(1);
            }
            lastRightTapTime = now;
          }
        }

        // 2. 점프 / 상승: Space 또는 W (또는 위쪽 방향키)
        if (e.key === ' ' || e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'KeyW' || e.key === 'ㅈ') {
          keys.jump = true;
          keys.up = true;
        }

        // 2-1. 하강 (아비 에슈흐 공중 비행 / S키): S키 또는 아래쪽 방향키
        if (e.key === 's' || e.key === 'S' || e.code === 'KeyS' || e.key === 'ㄴ' || e.key === 'ArrowDown') {
          keys.down = true;
        }

        // 3. 일반 사격: J키 또는 Z키
        if (e.key === 'j' || e.key === 'J' || e.key === 'z' || e.key === 'Z') {
          keys.attack = true;
          if (player.isAbiEshuhActive) {
            if (!e.repeat) {
              if (player.abiFinalCanTrigger) {
                triggerAbiFinalFinisher();
              } else if (!player.abiFinalReady && player.abiFinalPhase === 'none' && player.abiStunTimer <= 0) {
                player.abiNormalCharging = true;
                player.abiNormalChargeTimer = 0;
              }
            }
            return;
          }
          // 첫 격발: 딜레이 충족 시 즉시 발사 (단발 탭 & 홀딩 연사 첫 타 즉시 반응, 기괴멸렬 발동 시 딜레이 바이패스)
          if (!e.repeat) {
            const curW = player.activeWeaponSlot === 'main' ? player.mainWeapon : player.subWeapon;
            const isSGSkill = (player.activeWeaponSlot === 'main' && player.mainWeapon.id === 'sg_bloody_gunpowder' && player.sgSkillActive);
            if (curW && (curW.fireTimer >= curW.fireDelay || isSGSkill)) {
              tryFireWeapon();
            }
          }
        }

        // 4. 메인스킬 1: K키, X키, Q키 (물리 키 코드 및 한글 IME 포함)
        if (e.key === 'k' || e.key === 'K' || e.code === 'KeyK' || e.key === 'ㅏ' ||
            e.key === 'x' || e.key === 'X' || e.code === 'KeyX' || e.key === 'ㅌ' ||
            e.key === 'q' || e.key === 'Q' || e.code === 'KeyQ' || e.key === 'ㅂ') {
          if (!e.repeat) {
            tryFireMainSkill();
          }
        }

        // 5. 메인스킬 2: L키, C키, E키
        if (e.key === 'l' || e.key === 'L' || e.key === 'c' || e.key === 'C' || e.key === 'e' || e.key === 'E') {
          if (!e.repeat) {
            tryFireMainSkill2();
          }
        }

        // 6. 특수스킬 (소속/직군): S키 (아비 에슈흐 활성 중에는 하강 이동 키로 작동)
        if (e.key === 's' || e.key === 'S' || e.code === 'KeyS' || e.key === 'ㄴ') {
          if (!e.repeat && !player.isAbiEshuhActive) {
            tryFireSpecialSkill();
          }
        }

        // 7. 수동 재장전: R키
        if (e.key === 'r' || e.key === 'R' || e.code === 'KeyR' || e.key === 'ㄱ') {
          if (!e.repeat) {
            startManualReload();
          }
        }

        // 8. 무기 교체: Shift 키
        if (e.key === 'Shift') {
          if (!e.repeat) {
            switchWeapon();
          }
        }

        // 9. 달리기 활성화/해제 토글: ; (세미콜론)
        if (e.key === ';') {
          if (!e.repeat) {
            player.isRunning = !player.isRunning;
            document.getElementById('runStatusText').innerHTML = `달리기: <b style="color:${player.isRunning ? '#38bdf8' : '#94a3b8'};">${player.isRunning ? 'ON (;키)' : 'OFF (;키)'}</b>`;
          }
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'a' || e.key === 'A' || e.code === 'KeyA' || e.key === 'ㅁ' || e.key === 'ArrowLeft') keys.left = false;
      if (e.key === 'd' || e.key === 'D' || e.code === 'KeyD' || e.key === 'ㅇ' || e.key === 'ArrowRight') keys.right = false;
      if (e.key === ' ' || e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'KeyW' || e.key === 'ㅈ') {
        keys.up = false;
        keys.jump = false;
      }
      if (e.key === 's' || e.key === 'S' || e.code === 'KeyS' || e.key === 'ㄴ' || e.key === 'ArrowDown') keys.down = false;
      if (e.key === 'j' || e.key === 'J' || e.key === 'z' || e.key === 'Z' || e.code === 'KeyZ' || e.code === 'KeyJ' || e.key === 'ㅋ' || e.key === 'ㅓ') {
        keys.attack = false;
        if (player.isAbiEshuhActive && player.abiNormalCharging) {
          fireAbiNormalLaser();
        }
      }
    });

    // 마우스 좌클릭 일반 공격 및 아비 에슈흐 레이저 차징/발사
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0 && currentGameState === 'battle') {
        keys.attack = true;
        if (player.isAbiEshuhActive) {
          if (player.abiFinalCanTrigger) {
            triggerAbiFinalFinisher();
          } else if (!player.abiFinalReady && player.abiFinalPhase === 'none' && player.abiStunTimer <= 0) {
            player.abiNormalCharging = true;
            player.abiNormalChargeTimer = 0;
          }
          return;
        }
        const curW = player.activeWeaponSlot === 'main' ? player.mainWeapon : player.subWeapon;
        const isSGSkill = (player.activeWeaponSlot === 'main' && player.mainWeapon.id === 'sg_bloody_gunpowder' && player.sgSkillActive);
        if (curW && (curW.fireTimer >= curW.fireDelay || isSGSkill)) {
          tryFireWeapon();
        }
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0 && currentGameState === 'battle') {
        keys.attack = false;
        if (player.isAbiEshuhActive && player.abiNormalCharging) {
          fireAbiNormalLaser();
        }
      }
    });


    // 전술 코스트 소모 및 누적 코스트 통계/해금 함수
    function spendPlayerCost(amount) {
      player.cost = Math.max(0, player.cost - amount);
      if (!player.isAbiEshuhActive) {
        player.spentCostTotal = (player.spentCostTotal || 0) + amount;
        // RG 아비 에슈흐 해금 검사 (10 코스트 소모 시 해금)
        if (player.mainWeapon && player.mainWeapon.id === 'rg_supernova') {
          if (player.spentCostTotal >= 10 && !player.specialSkillUnlocked && !player.specialSkillUsed) {
            player.specialSkillUnlocked = true;
            addDamageText(player.x, player.y - 35, '💎 [시스템 : 아비 에슈흐] 특수 스킬 해금! (S키)', '#38bdf8');
          }
        }

        // [감싸 안는 직감] 코스트 15 소모 시마다 최대체력의 5% 보호막 부여 (25초 지속)
        const activePassives = [
          (playerLoadout && playerLoadout.slot3 && playerLoadout.slot3.id) ? playerLoadout.slot3.id : '',
          (playerLoadout && playerLoadout.slot4 && playerLoadout.slot4.id) ? playerLoadout.slot4.id : '',
          (playerLoadout && playerLoadout.slot5 && playerLoadout.slot5.id) ? playerLoadout.slot5.id : ''
        ];
        if (activePassives.includes('embracing_instinct')) {
          player.instinctCostCounter = (player.instinctCostCounter || 0) + amount;
          while (player.instinctCostCounter >= 15) {
            player.instinctCostCounter -= 15;
            const shieldVal = Math.round(player.maxHp * 0.05);
            if (player.isTacticalDefActive && player.tacticalShield > 0) {
              player.tacticalShield = Math.min(player.tacticalShieldMax, player.tacticalShield + shieldVal);
              addDamageText(player.x, player.y - 40, `🛡️ [감싸 안는 직감] 전술 보호막 +${shieldVal.toLocaleString()} 흡수 충전!`, '#38bdf8');
            } else {
              player.instinctShieldHp = (player.instinctShieldHp || 0) + shieldVal;
              player.instinctShieldDuration = 25.0;
              addDamageText(player.x, player.y - 40, `🛡️ [감싸 안는 직감] 보호막 +${shieldVal.toLocaleString()} 부여 (25s)`, '#c084fc');
            }
          }
        }
      }
    }

    // [서포터 시스템 제거 완료 - 2P 스트라이커 전용]

    // 대시 발동 함수
    function triggerDash(dir) {
      if (player.dashTimer > 0) return; // 쿨타임 중
      if (player.abiStunTimer > 0) return; // 기절 중 불가
      if (player.abiFinalPhase && player.abiFinalPhase !== 'none') return; // 피니셔 중 불가
      if (player.rgAwakeCharging || player.rgAwakeFiring) return; // RG 레이저 집중 중 불가
      if (player.mgStanceTransitioning || player.mgStanceActive || player.isFiringSpecial) return; // MG 거치 중 불가

      player.isDashing = true;
      player.dashTimer = player.dashCooldown; // 1.5초
      player.dashDuration = 0.18; // 0.18s
      player.vx = dir * player.dashSpeed;
      player.facing = dir;
      addDamageText(player.x, player.y - 15, '💨 DASH!', '#38bdf8');
    }

    // 조준 모드 전환 (Shift) - 자동 에임 ⇋ 수동 에임
    function switchWeapon() {
      player.aimMode = player.aimMode === 'manual' ? 'auto' : 'manual';
      if (player.aimMode === 'auto') {
        addDamageText(player.x, player.y - 25, '🎯 [자동 에임] 활성화 (최근접 적 타겟팅)', '#38bdf8');
      } else {
        addDamageText(player.x, player.y - 25, '🏹 [수동 에임] 활성화', '#f59e0b');
      }
      updateWeaponHUD();
    }

    // 수동 재장전 (A)
    function startManualReload() {
      const cur = player.activeWeaponSlot === 'main' ? player.mainWeapon : player.subWeapon;
      if (cur.isReloading) return;
      if (cur.ammo >= cur.maxAmmo) {
        addDamageText(player.x, player.y - 15, '탄약 가득 참', '#94a3b8');
        return;
      }
      if (cur.mags !== Infinity && cur.mags <= 0) {
        addDamageText(player.x, player.y - 15, '남은 탄창 없음!', '#ef4444');
        return;
      }
      cur.isReloading = true;
      cur.reloadTimer = cur.reloadDuration;
      addDamageText(player.x, player.y - 20, '⏳ 재장전 중...', '#22c55e');
    }

    // 정비실에서 선택한 세팅을 플레이어 실전에 동기화
    function applyMaintenanceLoadoutToPlayer() {
      // 1. 기본 체력
      const activePassives = [
        (playerLoadout && playerLoadout.slot3 && playerLoadout.slot3.id) ? playerLoadout.slot3.id : '',
        (playerLoadout && playerLoadout.slot4 && playerLoadout.slot4.id) ? playerLoadout.slot4.id : '',
        (playerLoadout && playerLoadout.slot5 && playerLoadout.slot5.id) ? playerLoadout.slot5.id : ''
      ];

      player.maxHp = player.baseMaxHp;
      player.hp = player.baseMaxHp;
      const hpBadgeEl = document.getElementById('playerHpBadge');
      if (hpBadgeEl) hpBadgeEl.innerText = `HP: ${player.maxHp.toLocaleString()}`;

      // 코스트 최대치: 기본 15
      player.maxCost = 15;
      if (player.cost > player.maxCost) player.cost = player.maxCost;

      // 선택한 메인 무기 스탯 적용
      const selectedMain = (playerLoadout && playerLoadout.slot1) || EQUIPMENT_DATABASE.slot1[0];
      const mainStats = selectedMain.stats || { capacity: 40, maxMags: Infinity, reloadTime: 2.5, fireDelay: 0.11 };
      const baseMainCap = mainStats.capacity || 40;
      player.mainWeapon.name = selectedMain.name;
      player.mainWeapon.id = selectedMain.id;
      player.mainWeapon.maxAmmo = baseMainCap;
      player.mainWeapon.ammo = player.mainWeapon.maxAmmo;
      player.mainWeapon.maxMags = Infinity;
      player.mainWeapon.mags = Infinity;
      player.mainWeapon.reloadDuration = mainStats.reloadTime || 2.5;
      player.mainWeapon.isReloading = false;

      // 선택한 보조 무기 스탯 적용 (HG 루거 P08 vs HG 상식적 수단)
      const selectedSub = (playerLoadout && playerLoadout.slot7) || EQUIPMENT_DATABASE.slot7[0];
      const subStats = selectedSub.stats || { capacity: 6, maxMags: Infinity, reloadTime: 1.0, fireDelay: 0.20 };
      const baseSubCap = subStats.capacity || 6;
      player.subWeapon.id = selectedSub.id;
      player.subWeapon.name = selectedSub.name;
      player.subWeapon.maxAmmo = baseSubCap;
      player.subWeapon.ammo = player.subWeapon.maxAmmo;
      player.subWeapon.maxMags = Infinity;
      player.subWeapon.mags = Infinity;
      player.subWeapon.reloadDuration = subStats.reloadTime || 1.0;
      player.subWeapon.fireDelay = subStats.fireDelay || 0.20;
      player.subWeapon.isReloading = false;

      // 3. 연사 딜레이 (Slumpia 5% 감소)
      let fireDelayMultiplier = 0.95; // Slumpia 서폿팅 5% 감소
      const baseFireDelay = selectedMain.stats.fireDelay || 0.11;
      player.mainWeapon.fireDelay = baseFireDelay * fireDelayMultiplier;
      player.mainWeapon.fireTimer = player.mainWeapon.fireDelay;
      player.activeWeaponSlot = 'main';

      // 3.5. [방어 장갑 & 공격 유형 시스템] 무기에 정의된 방어장갑/공격타입을 플레이어에게 동기화
      player.armorType = selectedMain.armorType || ARMOR_TYPES.NORMAL;
      player.mainWeapon.attackType = selectedMain.attackType || ATTACK_TYPES.NORMAL;
      player.mainWeapon.skill1AttackType = selectedMain.skill1AttackType || ATTACK_TYPES.NORMAL;
      player.mainWeapon.skill2AttackType = selectedMain.skill2AttackType || ATTACK_TYPES.NORMAL;
      player.mainWeapon.specialAttackType = selectedMain.specialAttackType || ATTACK_TYPES.NORMAL;
      player.subWeapon.attackType = selectedSub.attackType || ATTACK_TYPES.NORMAL;

      // 3.55. [역할군 & 포지션 시스템] 무기에 매칭된 역할군/포지션/사거리를 플레이어에게 동기화
      const selectedRole = (playerLoadout && playerLoadout.slot7) ||
                           (EQUIPMENT_DATABASE.slot7 && EQUIPMENT_DATABASE.slot7.find(r => r.role === selectedMain.role && r.position === selectedMain.position)) ||
                           (EQUIPMENT_DATABASE.slot7 && EQUIPMENT_DATABASE.slot7.find(r => r.position === selectedMain.position)) ||
                           EQUIPMENT_DATABASE.slot7[0];
      player.role = selectedRole.role || selectedMain.role || '딜러';
      player.position = selectedRole.position || selectedMain.position || 'BACK';
      player.positionRange = selectedRole.positionRange || selectedMain.stats.range || 1420;

      // 3.6. [전투 스탯 및 신규 서브스킬 패시브 적용]
      // 세라믹 방탄판: 방어력 20% 증가 (기본 200 -> 240)
      player.baseDefense = 200;
      player.defense = activePassives.includes('ceramic_plate') ? Math.round(player.baseDefense * 1.20) : player.baseDefense;
      // 단호한 결의: 치명 수치 26.6% 증가 (기본 350 -> 443)
      player.crit = activePassives.includes('resolute_will') ? Math.round(350 * 1.266) : 350;
      // 전술 보조: 치명 데미지 17% 증가 (기본 350 -> 410)
      player.critDmg = activePassives.includes('tactical_support') ? Math.round(350 * 1.17) : 350;
      player.stability = 1500;
      player.accuracy = 0;
      player.evasion = 0;

      // 4. 이동속도 연산: 기본 6.0 * Slumpia(+10%)
      player.baseSpeed = 6.0 * 1.1;

      // 4.5. [슬롯 6: 13개 소속 패시브 능력치 적용]
      const selectedAffil = (playerLoadout && playerLoadout.slot6) ? playerLoadout.slot6.id : 'gehenna';
      player.affiliation = selectedAffil;
      player.affiliationFlatAtk = 0;
      player.affiliationDmgMult = 1.0;
      player.affiliationDmgTakenMult = 1.0;
      player.ccResist = 0;
      player.critResist = 100;

      if (selectedAffil === 'gehenna') {
        // 1. 게헨나: 기본 공격력 +70
        player.affiliationFlatAtk = 70;
      } else if (selectedAffil === 'millennium') {
        // 2. 밀레니엄: 공격력 +1%, 받는 피해 2% 감소
        player.affiliationDmgMult = 1.01;
        player.affiliationDmgTakenMult = 0.98;
      } else if (selectedAffil === 'trinity') {
        // 3. 트리니티: 명중 수치 +5% (명중수치 50 추가 = 명중률 약 5% 상승)
        player.accuracy = (player.accuracy || 0) + 50;
      } else if (selectedAffil === 'abydos') {
        // 4. 아비도스: 이동속도 +10%, 공격력 +25
        player.baseSpeed *= 1.10;
        player.affiliationFlatAtk = 25;
      } else if (selectedAffil === 'hyakkayouran') {
        // 5. 백화요란: 재장전 시간 -10%, 이동속도 +5%
        player.mainWeapon.reloadDuration *= 0.90;
        player.subWeapon.reloadDuration *= 0.90;
        player.baseSpeed *= 1.05;
      } else if (selectedAffil === 'shanhaijing') {
        // 6. 산해경: 치명 수치(치명타 확률) +7%
        player.crit = Math.round(player.crit * 1.07);
      } else if (selectedAffil === 'hyakkiyako') {
        // 7. 백귀야행: 최대 체력 +5%
        player.maxHp = Math.round(player.baseMaxHp * 1.05);
        player.hp = player.maxHp;
        if (hpBadgeEl) hpBadgeEl.innerText = `HP: ${player.maxHp.toLocaleString()}`;
      } else if (selectedAffil === 'redwinter') {
        // 8. 붉은겨울: 군중제어 저항력 +10%
        player.ccResist = 10;
      } else if (selectedAffil === 'arius') {
        // 9. 아리우스: 이동속도 +6%, 공격력 +1%, 방어력 +1%
        player.baseSpeed *= 1.06;
        player.affiliationDmgMult = 1.01;
        player.defense = Math.round(player.defense * 1.01);
      } else if (selectedAffil === 'wildhunt') {
        // 10. 와일드헌트: 치명 저항력 +12%
        player.critResist = Math.round(100 * 1.12);
      } else if (selectedAffil === 'srt') {
        // 11. SRT: 이동속도 +5%, 방어력 +3%
        player.baseSpeed *= 1.05;
        player.defense = Math.round(player.defense * 1.03);
      } else if (selectedAffil === 'valkyrie') {
        // 12. 발키리: 방어력 +6%
        player.defense = Math.round(player.defense * 1.06);
      } else if (selectedAffil === 'the_head') {
        // 13. 머리: 효과 없음
      }

      // 5. 신규 서브스킬 상태 및 타이머 초기화
      player.emergencyAidTimer = 0;
      player.instinctCostCounter = 0;
      player.instinctShieldHp = 0;
      player.instinctShieldDuration = 0;
      player.lightBeTimer = 0;
      player.isLightBeActive = false;
      player.lightBeActiveTimer = 0;
      player.isChargingSkill = false;
      player.chargeTimer = 0;
      player.chargeLevel = 1;
      player.sgSkillActive = false;
      player.sgSkillShotsLeft = 0;
      player.sgSkill2Cooldown = 0;
      player.sgTorrentCharging = false;
      player.sgTorrentChargeTimer = 0;
      player.sgTorrentFiring = false;
      player.sgTorrentShotsLeft = 0;
      player.rgAwakeStage = 0;
      player.rgAwakeCharging = false;
      player.rgAwakeChargeTimer = 0;
      player.rgAwakeFiring = false;
      player.rgAwakeLaserTimer = 0;
      player.mgSkill2Cooldown = 0;
      player.mgStanceActive = false;
      player.mgStanceTransitioning = false;
      player.mgStanceTransitionTimer = 0;
      player.mgStanceTimer = 0;
      player.mgStanceShotStage = 0;
      player.mgStanceShotDelay = 0;
      player.specialSkillUnlocked = false;
      player.specialSkillUsed = false;
      player.isFiringSpecial = false;
      player.specialTimer = 0;
      player.specialShotInterval = 0;
      player.specialPhase = 1;
      player.specialIsBerserk = false;
      specialParticles.length = 0;
      player.spentCostTotal = 0;
      player.isAbiEshuhActive = false;
      player.abiTransforming = false;
      player.abiTransformTimer = 0;
      player.isHovering = false;
      player.abiNormalCharging = false;
      player.abiNormalChargeTimer = 0;
      player.abiMissileHistory = [];
      player.abiMissileCooldown = 0;
      player.abiBarrageFiring = false;
      player.abiBarrageTimer = 0;
      player.abiBarrageShotTimer = 0;
      player.abiFinalReady = false;
      player.abiFinalDelayTimer = 0;
      player.abiFinalCanTrigger = false;
      player.abiFinalPhase = 'none';
      player.abiFinalChargeTimer = 0;
      player.abiFinalFlyTimer = 0;
      player.abiFinalHitstopTimer = 0;
      player.abiFinalHitEnemies = [];
      player.abiStunTimer = 0;

      // [SG: 불사(不死)] 상태 변수 초기화
      player.isImmortalActive = false;
      player.immortalTimer = 0;
      player.immortalMaxDuration = 8;
      player.immortalFireDelay = 0.5;
      player.immortalBaseDmg = 1250;
      player.immortalPellets = 5;
      player.immortalIsAlwaysCrit = false;
      player.immortalShotsCount = 0;
      player.immortalStack = 0;
      player.immortalTotalDmgDealt = 0;
      player.immortalHpRatioAtStart = 1.0;

      // [서포터 시스템 완전 제거 - 2인 스트라이커 멀티플레이]

      updateWeaponHUD();
    }


    // 카이텐저 페이즈 및 증원 초기화 함수
    function initBattleEncounter() {
      // 1. 플레이어 상태 초기화
      player.x = 350;
      player.y = canvas.height - GROUND_OFFSET - player.height;
      player.hp = player.maxHp;
      player.cost = 6;
      player.costTimer = 0;
      player.isDead = false;
      player.activeWeaponSlot = 'main';
      player.isFiringSkill = false;
      player.isChargingSkill = false;
      player.chargeTimer = 0;
      player.chargeLevel = 1;
      player.sgSkillActive = false;
      player.sgSkillShotsLeft = 0;
      player.sgSkill2Cooldown = 0;
      player.sgTorrentCharging = false;
      player.sgTorrentChargeTimer = 0;
      player.sgTorrentFiring = false;
      player.sgTorrentShotsLeft = 0;
      player.rgAwakeStage = 0;
      player.rgAwakeCharging = false;
      player.rgAwakeChargeTimer = 0;
      player.rgAwakeFiring = false;
      player.rgAwakeLaserTimer = 0;
      player.mgSkill2Cooldown = 0;
      player.mgStanceActive = false;
      player.mgStanceTransitioning = false;
      player.mgStanceTransitionTimer = 0;
      player.mgStanceTimer = 0;
      player.mgStanceShotStage = 0;
      player.mgStanceShotDelay = 0;
      player.specialSkillUnlocked = false;
      player.specialSkillUsed = false;
      player.isFiringSpecial = false;
      player.specialTimer = 0;
      player.specialShotInterval = 0;
      player.specialPhase = 1;
      player.specialIsBerserk = false;
      specialParticles.length = 0;
      player.spentCostTotal = 0;
      player.isAbiEshuhActive = false;
      player.abiTransforming = false;
      player.abiTransformTimer = 0;
      player.isHovering = false;
      player.abiNormalCharging = false;
      player.abiNormalChargeTimer = 0;
      player.abiMissileHistory = [];
      player.abiMissileCooldown = 0;
      player.abiBarrageFiring = false;
      player.abiBarrageTimer = 0;
      player.abiBarrageShotTimer = 0;
      player.abiFinalReady = false;
      player.abiFinalDelayTimer = 0;
      player.abiFinalCanTrigger = false;
      player.abiFinalPhase = 'none';
      player.abiFinalChargeTimer = 0;
      player.abiFinalFlyTimer = 0;
      player.abiFinalHitstopTimer = 0;
      player.abiFinalHitEnemies = [];
      player.abiStunTimer = 0;
      player.isImmortalActive = false;
      player.immortalTimer = 0;
      player.immortalMaxDuration = 8;
      player.immortalFireDelay = 0.5;
      player.immortalBaseDmg = 1250;
      player.immortalPellets = 5;
      player.immortalIsAlwaysCrit = false;
      player.immortalShotsCount = 0;
      player.immortalStack = 0;
      player.immortalTotalDmgDealt = 0;
      player.immortalHpRatioAtStart = 1.0;

      // [서포터 초기화 제거]

      // 2. 레드는 개전 시 단독 등장
      const red = kaitenzers.find(k => k.id === 'red');
      red.isSpawned = true;
      red.isDead = false;
      red.hp = red.maxHp;
      red.x = 1550;
      red.isActive = false;
      red.burstCount = 0;
      red.attackTimer = 0;

      // 나머지 4명 무작위 셔플 (랜덤 증원 순서)
      const otherIds = ['black', 'yellow', 'green', 'pink'];
      for (let i = otherIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherIds[i], otherIds[j]] = [otherIds[j], otherIds[i]];
      }

      phase1Members = [otherIds[0], otherIds[1]]; // 레드 HP 10% 감소(HP 90만) 시 등장할 2명
      phase2Members = [otherIds[2], otherIds[3]]; // 레드 HP 추가 30% 감소(HP 60만) 시 등장할 2명
      phase1Triggered = false;
      phase2Triggered = false;
      isPhase1Retreating = false;
      phase1RetreatTimer = 0;
      isPhase2Active = false;

      red.isRetreating = false;

      // 나머지 멤버들은 미등장 대기 상태
      otherIds.forEach(id => {
        const k = kaitenzers.find(m => m.id === id);
        k.isSpawned = false;
        k.isDead = false;
        k.isRetreating = false;
        k.hp = k.maxHp;
        k.isActive = false;
        k.attackTimer = 0;
        if (k.id === 'yellow') k.laserState = 'none';
        if (k.id === 'green') k.isOverheated = false;
      });

      // 3. KAITEN FX Mk.0 상태 초기화
      if (typeof kaitenFx !== 'undefined') {
        kaitenFx.isSpawned = false;
        kaitenFx.isDead = false;
        kaitenFx.isActive = false;
        kaitenFx.x = 1800;
        kaitenFx.y = 0;
        kaitenFx.hp = kaitenFx.maxHp;
        kaitenFx.atk = kaitenFx.baseAtk;
        kaitenFx.atg = 0;
        kaitenFx.atgTimer = 0;
        kaitenFx.activePart = 'pink';
        kaitenFx.partCycleTimer = 0;
        kaitenFx.partSkillDelayTimer = 2.0;
        kaitenFx.partSkillTriggered = false;
        kaitenFx.shieldActive = false;
        kaitenFx.shieldHitCount = 0;
        kaitenFx.isFiringSkill = false;
        kaitenFx.isSlashing = false;
        kaitenFx.isFiringNormal = false;
        kaitenFx.introState = 'none';
        kaitenFx.introTimer = 0;
        ['pink', 'red', 'green'].forEach(p => {
          if (kaitenFx.parts[p]) {
            kaitenFx.parts[p].hp = kaitenFx.partMaxHp;
            kaitenFx.parts[p].isBroken = false;
          }
        });
      }
    }

    // [카이텐저 1페이즈]: 5인이 5,000,000 단일 체력바를 균등 공유하는 피해 처리 함수
    function applyKaitenzerSharedDamage(dmg) {
      if (typeof kaitenzers === 'undefined') return 0;
      const currentTotal = kaitenzers.reduce((sum, r) => sum + (r.isDead ? 0 : Math.max(0, r.hp)), 0);
      const newTotal = Math.max(0, currentTotal - dmg);
      const hpPerRanger = Math.ceil(newTotal / 5);
      kaitenzers.forEach(r => {
        r.hp = hpPerRanger;
        if (newTotal <= 0) {
          r.hp = 0;
          r.isDead = true;
          r.isActive = false;
          if (r.id === 'yellow') r.laserState = 'none';
          if (r.id === 'green') r.isOverheated = false;
        }
      });
      return newTotal;
    }
    window.applyKaitenzerSharedDamage = applyKaitenzerSharedDamage;

    /**
     * [소속 패시브 & 보조스킬 통합 공격력 보정 연산 함수]
     * 게헨나(+70), 아비도스(+25), 밀레니엄(+1%), 아리우스(+1%), 미친개의 집념(+24.5%) 반영
     */
    function calcPlayerAttackDamage(rawBaseDmg) {
      let dmg = rawBaseDmg + (player.affiliationFlatAtk || 0);
      if (player.affiliationDmgMult && player.affiliationDmgMult !== 1.0) {
        dmg = Math.round(dmg * player.affiliationDmgMult);
      }
      const activePassives = [
        (playerLoadout && playerLoadout.slot3 && playerLoadout.slot3.id) ? playerLoadout.slot3.id : '',
        (playerLoadout && playerLoadout.slot4 && playerLoadout.slot4.id) ? playerLoadout.slot4.id : '',
        (playerLoadout && playerLoadout.slot5 && playerLoadout.slot5.id) ? playerLoadout.slot5.id : ''
      ];
      if (activePassives.includes('mad_dog_tenacity')) {
        dmg = Math.round(dmg * 1.245);
      }
      return Math.max(1, dmg);
    }

    // 탄환, 폭발, 파티클 배열

    // 일반 사격 함수 (MG 및 HG, RG, SG)
    function tryFireWeapon() {
      // 기절(Stun) 상태 시 일반 사격 불가
      if (player.stunTimer > 0) return;

      // 스킬 시전 및 차징 중에는 일반 사격 불가 (스킬과 평타가 겹쳐서 데미지가 뻥튀기되는 현상 방지!)
      if (player.isFiringSkill || player.isChargingSkill || player.sgTorrentCharging || player.sgTorrentFiring || player.rgAwakeCharging || player.rgAwakeFiring || player.mgStanceTransitioning || player.mgStanceActive || player.isFiringSpecial) return;

      const cur = player.activeWeaponSlot === 'main' ? player.mainWeapon : player.subWeapon;
      const isRG = (player.activeWeaponSlot === 'main' && player.mainWeapon.id === 'rg_supernova');
      const isSG = (player.activeWeaponSlot === 'main' && player.mainWeapon.id === 'sg_bloody_gunpowder');
      const isAR = (player.activeWeaponSlot === 'main' && player.mainWeapon.id === 'ar_white_fang');
      const isSMG = (player.activeWeaponSlot === 'main' && player.mainWeapon.id === 'smg_fox45');
      const isColorAR = isAR && player.isColorActive;

      // [SG: 불사(不死)] 상태 및 [AR: 색채(BLACK FANG 465)] 무한 탄창 분기
      if (player.isImmortalActive && isSG) {
        // 불사 중에는 탄약 미소모 & 재장전 불필요 & 딜레이 리셋
        cur.fireTimer = 0;
        cur.flashTimer = 0.08;
      } else if (isColorAR) {
        // [색채: BLACK FANG 465] 무한 탄창 & 노 리로드 & 고속 사격
        cur.fireTimer = 0;
        cur.flashTimer = 0.08;
        cur.ammo = 999;
        cur.fireDelay = (player.hp / player.maxHp) <= 0.30 ? 0.10 : 0.20;
      } else {
        // 단발/연사 발사 딜레이 체크 (RG는 0.7초, AR은 0.3초, SG는 스킬 미발동 시 0.25초, SMG는 0.10초)
        if (isRG && cur.fireTimer < cur.fireDelay) {
          return;
        }
        if (isSG && !player.sgSkillActive && cur.fireTimer < cur.fireDelay) {
          return;
        }

        if (cur.isReloading) return;
        if (cur.ammo <= 0) {
          // 탄약 없으면 자동 재장전 시도
          startManualReload();
          return;
        }

        cur.ammo--;
        cur.flashTimer = 0.08;
        cur.fireTimer = 0; // 발사 후 딜레이 타이머 리셋
      }

      // 패시브 효과 연산
      const activePassives = [playerLoadout.slot3.id, playerLoadout.slot4.id, playerLoadout.slot5.id];
      const isHpLow = (player.hp / player.maxHp) <= 0.30;
      let baseDmg = player.activeWeaponSlot === 'main'
        ? (isRG ? 4100 : (isAR ? (isColorAR ? (isHpLow ? 1440 : 1200) : 300) : (isSMG ? 250 : 400)))
        : (player.subWeapon.id === 'hg_tactical' ? 180 : 150);

      // [소속 패시브 & 보조스킬] 공격력 보정 연산
      baseDmg = calcPlayerAttackDamage(baseDmg);



      // [전투 스탯] 불사 1% 이하 시 치명타 확률 보너스 연동
      const bonusCrit = (player.isImmortalActive && isSG && player.immortalIsAlwaysCrit) ? 0.20 : 0;
      const isCrit = checkCritSuccess(player.crit, 100, bonusCrit);
      const critMult = calculateCritDamageMultiplier(player.critDmg, 50, 0);
      const finalDmg = isCrit ? Math.round(baseDmg * critMult) : baseDmg;

      const groundY = canvas.height - GROUND_OFFSET;
      const bulletSpeed = player.activeWeaponSlot === 'main' ? (isRG ? 28 : (isSG ? 24 : (isAR ? 25 : (isSMG ? 24 : 22)))) : 18;

      // [레드의 도발 스킬]: 10초간 모든 공격의 '발사 방향'이 강제로 레드를 향해 발사됨!
      const redKaiten = kaitenzers.find(k => k.id === 'red');
      const isRedTaunting = redKaiten && redKaiten.isSpawned && !redKaiten.isDead && redKaiten.isActive;

      let bVx, bVy, bAngle;
      let shootOriginX;
      const muzzleOffset = player.activeWeaponSlot === 'main' ? (isRG ? 46 : (isSG ? 40 : (isAR ? 46 : (isSMG ? 44 : 54)))) : 24;
      const shootOriginY = player.y + player.height * 0.58;
      if (isRedTaunting) {
        // 플레이어 시선도 레드를 향하게 강제 회전
        player.facing = (redKaiten.x + redKaiten.size / 2 >= player.x + player.width / 2) ? 1 : -1;
        shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);

        // 레드가 도발 중이면 플레이어의 조준선/총알 궤적이 강제로 레드 중심을 향해 발사!
        const dx = (redKaiten.x + redKaiten.size / 2) - shootOriginX;
        const dy = (groundY - redKaiten.size / 2) - shootOriginY;
        const dist = Math.hypot(dx, dy) || 1;
        bVx = (dx / dist) * bulletSpeed;
        bVy = (dy / dist) * bulletSpeed;
        bAngle = Math.atan2(dy, dx);
      } else {
        // [자동 에임 모드 vs 수동 에임 모드]
        const isAutoAim = (player.aimMode === 'auto');
        const pCenterX = player.x + player.width / 2;
        const pCenterY = player.y + player.height * 0.58;
        const closestEnemy = isAutoAim ? getClosestActiveEnemy(pCenterX, pCenterY) : null;

        if (closestEnemy && closestEnemy.entity) {
          // 자동 에임: 가장 가까운 적을 향해 플레이어 시선 자동 회전 및 정밀 조준 사격
          const target = closestEnemy.entity;
          const tCenterX = closestEnemy.x;
          const tCenterY = closestEnemy.y;

          // 적 방향으로 플레이어 시선 자동 전환
          player.facing = tCenterX >= pCenterX ? 1 : -1;
          shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);

          const dx = tCenterX - shootOriginX;
          const dy = tCenterY - shootOriginY;
          const dist = Math.hypot(dx, dy) || 1;
          bVx = (dx / dist) * bulletSpeed;
          bVy = (dy / dist) * bulletSpeed;
          bAngle = Math.atan2(dy, dx);
        } else {
          // 수동 에임 또는 타겟 부재 시: 플레이어가 바라보는 방향으로 발사
          shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
          bVx = player.facing * bulletSpeed;
          bVy = player.activeWeaponSlot === 'main' ? (Math.random() - 0.5) * 1.5 : 0;
          bAngle = player.facing > 0 ? 0 : Math.PI;
        }
      }

      if (isSG) {
        // [SG: 블러디 앤 건 파우더] 샷건 산탄 발사
        let pelletCount = 6;
        let basePelletDmg = 500;
        let isImmortalBullet = false;

        if (player.isImmortalActive) {
          // --- [불사(不死) 모드] 샷건 산탄 사격 ---
          isImmortalBullet = true;
          player.immortalShotsCount++;
          // 15회 발사마다 공격 횟수 +1, 공격력 +468(550의 15% 하향) 증가 (최대 5회 중첩)
          if (player.immortalShotsCount % 15 === 0 && player.immortalStack < 5) {
            player.immortalStack++;
            addDamageText(player.x, player.y - 35, `🩸 [불사] 스택 강화! [${player.immortalStack}/5] (+1발 / +468dmg)`, '#ef4444');
          }

          pelletCount = player.immortalPellets + player.immortalStack;
          basePelletDmg = player.immortalBaseDmg + (player.immortalStack * 468);

          // 사격할 때마다 몸체와 총구에서 솟구치는 거대한 핏빛 폭발 오라 (Blood Shockwave Burst)
          for (let sp = 0; sp < 8; sp++) {
            specialParticles.push({
              type: 'spark',
              x: shootOriginX + (Math.random() - 0.5) * 20,
              y: shootOriginY + (Math.random() - 0.5) * 20,
              vx: player.facing * (Math.random() * 8 + 3) + (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 10,
              color: Math.random() < 0.6 ? '#dc2626' : '#991b1b',
              size: Math.random() * 4 + 2,
              life: 14,
              maxLife: 14,
              alpha: 1
            });
          }
        } else if (player.sgSkillActive) {
          pelletCount = 12;
          basePelletDmg = 500;
        }

        basePelletDmg = calcPlayerAttackDamage(basePelletDmg);
        const finalPelletDmg = isCrit ? Math.round(basePelletDmg * critMult) : basePelletDmg;

        // 산탄 확산 각도: 기본 0.24rad, [기괴멸렬] 0.09rad, [불사] 0.16rad
        const spreadAngle = player.isImmortalActive ? 0.16 : (player.sgSkillActive ? 0.09 : 0.24);

        for (let p = 0; p < pelletCount; p++) {
          const spreadFactor = pelletCount > 1 ? (p / (pelletCount - 1) - 0.5) : 0;
          const jitter = (Math.random() - 0.5) * 0.025;
          const pAngle = bAngle + (spreadFactor * spreadAngle) + jitter;
          const pVx = Math.cos(pAngle) * bulletSpeed;
          const pVy = Math.sin(pAngle) * bulletSpeed;

          const sgBullet = {
            isPlayerBullet: true,
            isCrit: isCrit,
            isImmortalBullet: isImmortalBullet,
            type: isImmortalBullet ? 'sg_immortal_pellet' : 'sg_pellet',
            x: shootOriginX,
            y: shootOriginY,
            vx: pVx,
            vy: pVy,
            angle: pAngle,
            dmg: finalPelletDmg,
            color: isImmortalBullet ? (isCrit ? '#fee2e2' : '#dc2626') : (isCrit ? '#fbbf24' : (player.sgSkillActive ? '#f43f5e' : '#f97316')),
            size: isImmortalBullet ? (isCrit ? 6.5 : 5.5) : (isCrit ? 5.5 : 4.5),
            life: 18 // 사거리 약 430px
          };
          bullets.push(sgBullet);

          if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
            sendNetPacket({
              type: 'SYNC',
              bulletEvent: sgBullet
            });
          }
        }

        // [기괴멸렬] 6회 공격 카운트다운 처리
        if (player.sgSkillActive) {
          player.sgSkillShotsLeft--;
          if (player.sgSkillShotsLeft <= 0) {
            player.sgSkillActive = false;
            player.skillCooldown = 2.5; // 복귀 후 2.5초 쿨타임!
            player.mainWeapon.maxAmmo = 4;
            player.mainWeapon.reloadDuration = 0.75;
            let fireDelayMult = 0.95; // Slumpia 5% 감소
            player.mainWeapon.fireDelay = (playerLoadout.slot1.stats.fireDelay || 0.25) * fireDelayMult;
            addDamageText(player.x, player.y - 30, '⌛ [기괴멸렬] 종료! (스킬 쿨타임 2.5초)', '#94a3b8');
          }
        }

        updateWeaponHUD();
        return;
      }

      // [AR: WHITE FANG 465 / BLACK FANG 465] 탄환 발사 & 화력 강화 드론 지원 사격
      if (isAR) {
        const arBullet = {
          isPlayerBullet: true,
          isCrit: isCrit,
          type: 'ar_bullet',
          x: shootOriginX,
          y: shootOriginY,
          vx: bVx,
          vy: bVy,
          angle: bAngle,
          dmg: finalDmg,
          color: isColorAR ? (isCrit ? '#cbd5e1' : '#64748b') : (isCrit ? '#fef08a' : '#22d3ee'),
          size: isCrit ? (isColorAR ? 6.5 : 6) : (isColorAR ? 5.5 : 4.5),
          life: isColorAR ? 50 : 30 // 일반 AR: 30틱 * 25속도 = 750px (MIDDLE) | 색채 AR: 50틱 * 25속도 = 1,250px
        };
        bullets.push(arBullet);

        // [색채 1스킬: 화력 강화 드론] 사격 시마다 250% 지원 탄환 1~3발 발사 (가장 가까운 적 타겟팅)
        if (isColorAR && window.whiteFangDrones && window.whiteFangDrones.length > 0) {
          const colorDrones = window.whiteFangDrones.filter(d => d.isColorDrone);
          colorDrones.forEach(drone => {
            const droneShots = Math.floor(Math.random() * 3) + 1; // 1~3발
            const droneAtk = isHpLow ? 1440 : 1200;
            let droneBaseDmg = Math.round(droneAtk * 2.50); // 250% (3,000 / 3,600)
            droneBaseDmg = calcPlayerAttackDamage(droneBaseDmg);
            const droneCrit = checkCritSuccess(player.crit, 100);
            const droneCritMult = calculateCritDamageMultiplier(player.critDmg, 50, 0);
            const finalDroneDmg = droneCrit ? Math.round(droneBaseDmg * droneCritMult) : droneBaseDmg;

            for (let s = 0; s < droneShots; s++) {
              setTimeout(() => {
                drone.flashTimer = 0.08;
                drone.podAlternator = 1 - drone.podAlternator;
                const lX = drone.x + (drone.podAlternator === 0 ? -13 : 13) * drone.facing;
                const lY = drone.y - 4;
                const closest = getClosestActiveEnemy(lX, lY);
                const target = closest ? closest.entity : null;

                let bvx = drone.facing * 26;
                let bvy = (Math.random() - 0.5) * 3;
                if (target) {
                  const isBoss = (target.width !== undefined && target.height !== undefined);
                  const tCenterX = isBoss ? (target.x + target.width / 2) : (target.x + target.size / 2);
                  const tCenterY = isBoss ? ((canvas.height - GROUND_OFFSET) - target.height / 2) : ((canvas.height - GROUND_OFFSET) - (target.jumpY || 0) - target.size / 2);
                  const dx = tCenterX - lX;
                  const dy = tCenterY - lY;
                  const dist = Math.hypot(dx, dy) || 1;
                  bvx = (dx / dist) * 26;
                  bvy = (dy / dist) * 26;
                }

                const dBullet = {
                  isPlayerBullet: true,
                  isSkillBullet: true,
                  isCrit: droneCrit,
                  type: 'color_drone_bullet',
                  x: lX,
                  y: lY,
                  vx: bvx,
                  vy: bvy,
                  angle: Math.atan2(bvy, bvx),
                  dmg: finalDroneDmg,
                  color: droneCrit ? '#cbd5e1' : '#94a3b8',
                  size: 5.5,
                  life: 50
                };
                bullets.push(dBullet);
                if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
                  sendNetPacket({ type: 'SYNC', bulletEvent: dBullet });
                }
              }, s * 45);
            }
          });
        }

        if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
          sendNetPacket({
            type: 'SYNC',
            bulletEvent: arBullet
          });
        }
        updateWeaponHUD();
        return;
      }

      // [SMG: FOX 45식 기관단총] 탄환 발사
      if (isSMG) {
        const smgBullet = {
          isPlayerBullet: true,
          isCrit: isCrit,
          type: 'smg_bullet',
          x: shootOriginX,
          y: shootOriginY,
          vx: bVx,
          vy: bVy,
          angle: bAngle,
          dmg: finalDmg,
          color: isCrit ? '#fde047' : '#f59e0b',
          size: isCrit ? 6 : 4.5,
          life: 36 // 36틱 * 24속도 = 864px (MIDDLE ~850px)
        };
        bullets.push(smgBullet);
        if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
          sendNetPacket({
            type: 'SYNC',
            bulletEvent: smgBullet
          });
        }
        updateWeaponHUD();
        return;
      }

      const isMG = (player.activeWeaponSlot === 'main' && player.mainWeapon && player.mainWeapon.id === 'mg_destructor');
      // MG: 65틱 * 22속도 = 1,430px (~1,420px BACK) | RG: 51틱 * 28속도 = 1,428px (~1,420px BACK) | 기본 권총: 50틱 * 18속도 = 900px
      const pBulletLife = isMG ? 65 : (isRG ? 51 : 50);

      const pBullet = {
        isPlayerBullet: true,
        isCrit: isCrit,
        type: 'player_bullet',
        x: shootOriginX,
        y: shootOriginY,
        vx: bVx,
        vy: bVy,
        angle: bAngle,
        dmg: finalDmg,
        color: isCrit ? '#facc15' : (player.activeWeaponSlot === 'main' ? '#38bdf8' : '#ffffff'),
        size: isCrit ? 7 : 5,
        life: pBulletLife
      };
      bullets.push(pBullet);
      if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
        sendNetPacket({
          type: 'SYNC',
          bulletEvent: pBullet
        });
      }

      updateWeaponHUD();
    }

    // 메인 스킬 발동 함수 (MG: 종막의 이스보셋 / RG: 밸런스 붕괴 / 아비 에슈흐: 용기의 마법)
    function tryFireMainSkill() {
      if (player.activeWeaponSlot !== 'main') {
        addDamageText(player.x, player.y - 20, '메인 무기만 사용 가능!', '#ef4444');
        return;
      }

      // [시스템 : 아비 에슈흐] 1스킬: 용기의 마법 (유도 미사일 4발)
      if (player.isAbiEshuhActive) {
        if (player.abiFinalCanTrigger) {
          triggerAbiFinalFinisher();
          return;
        }
        if (player.abiFinalReady || player.abiFinalPhase !== 'none' || player.abiStunTimer > 0) return;
        fireAbiMissiles();
        return;
      }

      const isRG = (player.mainWeapon.id === 'rg_supernova');

      // [RG: 밸런스 붕괴] 차징 중 재사용 처리 (추가 +5코스트 소모하여 1.5배/2.0배 강화)
      if (isRG && player.isChargingSkill) {
        if (player.chargeLevel >= 3) {
          addDamageText(player.x, player.y - 30, '⚡ 이미 최대 출력 (2.0배)!', '#38bdf8');
          return;
        }
        if (player.cost < 5) {
          addDamageText(player.x, player.y - 20, '추가 코스트 부족! (5 필요)', '#ef4444');
          return;
        }
        // 5 코스트 추가 소모 & 레벨업
        spendPlayerCost(5);
        player.chargeLevel++;
        if (player.chargeLevel === 2) {
          addDamageText(player.x, player.y - 30, '⚡ [밸런스 붕괴] 1차 증폭! (1.5배 피해)', '#38bdf8');
        } else if (player.chargeLevel === 3) {
          addDamageText(player.x, player.y - 30, '💥 [밸런스 붕괴] 최대 과충전! (2.0배 피해)', '#facc15');
        }
        return;
      }

      if (player.skillCooldown > 0) {
        addDamageText(player.x, player.y - 20, '스킬 쿨타임 중!', '#94a3b8');
        return;
      }

      const isSG = (player.mainWeapon.id === 'sg_bloody_gunpowder');
      const isAR = (player.mainWeapon.id === 'ar_white_fang');
      const isSMG = (player.mainWeapon.id === 'smg_fox45');

      if (isSMG) {
        if (player.skillCooldown > 0) {
          addDamageText(player.x, player.y - 20, `스킬 쿨타임 중! (${player.skillCooldown.toFixed(1)}s)`, '#94a3b8');
          return;
        }

        const isTactical = (player.isTacticalDefActive && player.tacticalShield > 0);
        const reqCost = isTactical ? 4 : 3;
        if (player.cost < reqCost) {
          addDamageText(player.x, player.y - 20, `코스트 부족! (${reqCost} 필요)`, '#ef4444');
          return;
        }

        spendPlayerCost(reqCost);
        player.skillCooldown = 2.5;

        const mult = isTactical ? 3.50 : 5.50;
        let skill1BaseDmg = Math.round(250 * mult);
        skill1BaseDmg = calcPlayerAttackDamage(skill1BaseDmg);

        const isCrit = checkCritSuccess(player.crit, 100);
        const critMult = calculateCritDamageMultiplier(player.critDmg, 50, 0);
        const finalDmg = isCrit ? Math.round(skill1BaseDmg * critMult) : skill1BaseDmg;
        const stunSec = isTactical ? 4.6 : 2.5;

        const bulletSpeed = 28;
        const muzzleOffset = 44;
        const groundY = canvas.height - GROUND_OFFSET;
        const redKaiten = kaitenzers.find(k => k.id === 'red');
        const isRedTaunting = redKaiten && redKaiten.isSpawned && !redKaiten.isDead && redKaiten.isActive;
        let bVx, bVy, bAngle, shootOriginX;
        const shootOriginY = player.y + player.height * 0.58;

        if (isRedTaunting) {
          player.facing = (redKaiten.x + redKaiten.size / 2 >= player.x + player.width / 2) ? 1 : -1;
          shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
          const dx = (redKaiten.x + redKaiten.size / 2) - shootOriginX;
          const dy = (groundY - redKaiten.size / 2) - shootOriginY;
          const dist = Math.hypot(dx, dy) || 1;
          bVx = (dx / dist) * bulletSpeed;
          bVy = (dy / dist) * bulletSpeed;
          bAngle = Math.atan2(dy, dx);
        } else {
          const pCenterX = player.x + player.width / 2;
          const closestEnemy = getClosestActiveEnemy(pCenterX, shootOriginY);
          if (closestEnemy && closestEnemy.entity) {
            player.facing = closestEnemy.x >= pCenterX ? 1 : -1;
            shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
            const dx = closestEnemy.x - shootOriginX;
            const dy = closestEnemy.y - shootOriginY;
            const dist = Math.hypot(dx, dy) || 1;
            bVx = (dx / dist) * bulletSpeed;
            bVy = (dy / dist) * bulletSpeed;
            bAngle = Math.atan2(dy, dx);
          } else {
            shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
            bVx = player.facing * bulletSpeed;
            bVy = 0;
            bAngle = player.facing > 0 ? 0 : Math.PI;
          }
        }

        const slamBullet = {
          isPlayerBullet: true,
          isSkillBullet: true,
          isCrit: isCrit,
          isPiercing: false, // 단일 타겟 (적중 시 소형 폭발)
          type: 'fox_shield_slam',
          x: shootOriginX,
          y: shootOriginY,
          vx: bVx,
          vy: bVy,
          angle: bAngle,
          dmg: finalDmg,
          stunDuration: stunSec,
          color: isTactical ? '#38bdf8' : '#f59e0b',
          size: isTactical ? 20 : 16,
          life: 30
        };
        bullets.push(slamBullet);

        // 방패 충격파 파티클
        for (let i = 0; i < 20; i++) {
          specialParticles.push({
            type: 'spark',
            x: shootOriginX,
            y: shootOriginY + (Math.random() - 0.5) * 30,
            vx: player.facing * (Math.random() * 8 + 4),
            vy: (Math.random() - 0.5) * 8,
            color: isTactical ? '#38bdf8' : '#fbbf24',
            size: Math.random() * 4 + 2,
            life: 16,
            maxLife: 16,
            alpha: 1
          });
        }

        if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
          sendNetPacket({
            type: 'SYNC',
            bulletEvent: slamBullet
          });
        }

        addDamageText(player.x, player.y - 30, `🛡️ [철벽의 방어] 발사! (${isTactical ? '350% / 기절 4.6s' : '550% / 기절 2.5s'})`, isTactical ? '#38bdf8' : '#f59e0b');
        updateWeaponHUD();
        return;
      }

      if (isAR) {
        if (player.skillCooldown > 0) {
          addDamageText(player.x, player.y - 20, `스킬 쿨타임 중! (${player.skillCooldown.toFixed(1)}s)`, '#94a3b8');
          return;
        }

        // 색채 각성 상태: [화력 강화] 드론 소환 (체력 20% 소모, 최대 2회)
        if (player.isColorActive) {
          spawnColorDrone();
          player.skillCooldown = 2.5;
          updateWeaponHUD();
          return;
        }

        if (player.cost < 3) {
          addDamageText(player.x, player.y - 20, '코스트 부족! (3 필요)', '#ef4444');
          return;
        }
        spendPlayerCost(3);
        player.skillCooldown = 2.5; // 2.5초 쿨타임
        spawnWhiteFangDrone();
        addDamageText(player.x, player.y - 30, '🛸 [드론 소환 : 화력 지원] 출격!', '#06b6d4');
        updateWeaponHUD();
        return;
      }

      if (isSG) {
        if (player.sgSkillActive) {
          addDamageText(player.x, player.y - 20, '이미 기괴멸렬 발동 중!', '#f43f5e');
          return;
        }
        if (player.skillCooldown > 0) {
          addDamageText(player.x, player.y - 20, `스킬 쿨타임 중! (${player.skillCooldown.toFixed(1)}s)`, '#94a3b8');
          return;
        }
        if (player.cost < 4) {
          addDamageText(player.x, player.y - 20, '코스트 부족! (4 필요)', '#ef4444');
          return;
        }
        spendPlayerCost(4);
        // 1) 기괴멸렬 강화 상태 활성화 (6회 사격, 3발 탄창, 12연발 산탄, 딜레이 대폭 감소, 재장전 0.25초)
        player.sgSkillActive = true;
        player.sgSkillShotsLeft = 6;
        player.mainWeapon.maxAmmo = 3; // 탄창당 발 수 3발로 적용 (2발 -> 3발 사격)
        player.mainWeapon.reloadDuration = 0.25; // 이후 재장전 시간 0.25초로 감소
        player.mainWeapon.fireDelay = 0.08; // 기괴멸렬 딜레이 대폭 단축 (0.25s -> 0.08s 초고속 연사)
        player.mainWeapon.fireTimer = 0.08;
        // 2) 즉시 재장전 모션 돌입 (첫 재장전은 0.75초 소요)
        player.mainWeapon.isReloading = true;
        player.mainWeapon.reloadTimer = 0.75;
        addDamageText(player.x, player.y - 30, '🩸 [기괴멸렬] 발동! (즉시재장전 & 3발 탄창, 6회 12연발 강화)', '#ef4444');
        updateWeaponHUD();
        return;
      }

      if (isRG) {
        // [RG: 밸런스 붕괴] 최초 시전: 5 코스트
        if (player.cost < 5) {
          addDamageText(player.x, player.y - 20, '코스트 부족! (5 필요)', '#ef4444');
          return;
        }
        spendPlayerCost(5);
        player.isChargingSkill = true;
        player.chargeTimer = 0;
        player.chargeLevel = 1;
        player.vx = 0; // 즉시 정지
        addDamageText(player.x, player.y - 30, '✨ [밸런스 붕괴] 차징 시작... (X 재입력 시 증폭!)', '#38bdf8');
      } else {
        // [MG: 종막의 이스보셋] 시전: 6 코스트
        if (player.cost < 6) {
          addDamageText(player.x, player.y - 20, '코스트 부족! (6 필요)', '#ef4444');
          return;
        }
        if (player.isFiringSkill) return;

        spendPlayerCost(6);
        player.isFiringSkill = true;
        player.skillBurstCount = 28; // 28발 관통 발사
        player.skillBurstInterval = 0;
        addDamageText(player.x, player.y - 30, '⚡ [종막: 이스보셋] 발동!', '#c084fc');
      }
    }

    // 메인 스킬 2 발동 함수 (SG: 격류 / RG: 빛의 검/각성 : 슈퍼노바 / 아비 에슈흐: 빛의 난사)
    function tryFireMainSkill2() {
      if (player.activeWeaponSlot !== 'main') {
        addDamageText(player.x, player.y - 20, '메인 무기만 사용 가능!', '#ef4444');
        return;
      }

      // [시스템 : 아비 에슈흐] 2스킬: 빛의 난사 (3초간 50도 부채꼴 4:1 난사)
      if (player.isAbiEshuhActive) {
        if (player.abiFinalCanTrigger) {
          triggerAbiFinalFinisher();
          return;
        }
        if (player.abiFinalReady || player.abiFinalPhase !== 'none' || player.abiStunTimer > 0) return;
        fireAbiBarrage();
        return;
      }

      const isSG = (player.mainWeapon.id === 'sg_bloody_gunpowder');
      const isRG = (player.mainWeapon.id === 'rg_supernova');

      if (isSG) {
        // [SG: 블러디 앤 건 파우더] 2스킬: 격류
        if (player.sgTorrentCharging || player.sgTorrentFiring) {
          addDamageText(player.x, player.y - 20, '이미 격류 발동 중!', '#f43f5e');
          return;
        }
        if (player.sgSkill2Cooldown > 0) {
          addDamageText(player.x, player.y - 20, `스킬 쿨타임 중! (${player.sgSkill2Cooldown.toFixed(1)}s)`, '#94a3b8');
          return;
        }
        if (player.cost < 4) {
          addDamageText(player.x, player.y - 20, '코스트 부족! (4 필요)', '#ef4444');
          return;
        }

        spendPlayerCost(4);
        player.sgTorrentCharging = true;
        player.sgTorrentChargeTimer = 0;
        player.sgTorrentChargeMax = 0.5;
        addDamageText(player.x, player.y - 30, '🌊 [격류] 0.5초 차징 시작! (자유 이동 가능)', '#38bdf8');
        updateWeaponHUD();
        return;
      }

      if (isRG) {
        // [RG: 빛의검 : 슈퍼노바] 2스킬: 빛의 검/각성 : 슈퍼노바
        if (player.rgAwakeCharging || player.rgAwakeFiring) {
          addDamageText(player.x, player.y - 20, '이미 각성 스킬 시전 중!', '#38bdf8');
          return;
        }
        if (player.rgSkill2Cooldown > 0) {
          addDamageText(player.x, player.y - 20, `스킬 쿨타임 중! (${player.rgSkill2Cooldown.toFixed(1)}s)`, '#94a3b8');
          return;
        }

        if (player.rgAwakeStage < 2) {
          // 1단계 또는 2단계 충전: 8 코스트, 0.5초 제자리 차징
          if (player.cost < 8) {
            addDamageText(player.x, player.y - 20, '코스트 부족! (8 필요)', '#ef4444');
            return;
          }
          spendPlayerCost(8);
          player.rgAwakeCharging = true;
          player.rgAwakeChargeType = 'stage';
          player.rgAwakeChargeTimer = 0;
          player.rgAwakeChargeMax = 0.5;
          player.vx = 0;
          addDamageText(player.x, player.y - 30, `🌟 [빛의 검/각성] ${player.rgAwakeStage + 1}단계 충전 중... (0.5s)`, '#38bdf8');
          updateWeaponHUD();
          return;
        }

        if (player.rgAwakeStage >= 2) {
          // 2단계 충전 후 최종 발사: 10 코스트, 2.0초 제자리 집중 차징
          if (player.cost < 10) {
            addDamageText(player.x, player.y - 20, '코스트 부족! (10 필요)', '#ef4444');
            return;
          }
          spendPlayerCost(10);
          player.rgAwakeCharging = true;
          player.rgAwakeChargeType = 'fire';
          player.rgAwakeChargeTimer = 0;
          player.rgAwakeChargeMax = 2.0;
          player.rgAwakeFacing = player.facing;
          player.vx = 0;
          addDamageText(player.x, player.y - 30, '⚡ [빛의 검/각성] 최대 출력 2.0초 집중 차징!', '#facc15');
          updateWeaponHUD();
          return;
        }
      }

      const isMG = (player.mainWeapon.id === 'mg_destructor');
      if (isMG) {
        // [MG: 종막의 디스트로이어] 2스킬: 개연 : 이스보셋
        if (player.mgStanceTransitioning) {
          addDamageText(player.x, player.y - 20, '집중 사격 자세 전환 중...', '#facc15');
          return;
        }

        if (player.mgStanceActive) {
          // 이미 집중 사격 자세 중! L키 입력 시 3단계 선율 순차 사격
          if (player.mgStanceShotDelay > 0) {
            addDamageText(player.x, player.y - 20, `선율 딜레이 중! (${player.mgStanceShotDelay.toFixed(1)}s)`, '#94a3b8');
            return;
          }

          if (player.mgStanceShotStage === 0) {
            // 1타: [선율의 첫 번째 음] (3,500%, 관통 -35%)
            fireMGStanceMelodyBullet(1);
            player.mgStanceShotStage = 1;
            player.mgStanceShotDelay = 1.5;
            addDamageText(player.x, player.y - 30, '🎵 [선율의 첫 번째 음] 발사! (3,500%)', '#c084fc');
            updateWeaponHUD();
            return;
          } else if (player.mgStanceShotStage === 1) {
            // 2타: [선율의 두 번째 음] (5,500%, 관통 -45%)
            fireMGStanceMelodyBullet(2);
            player.mgStanceShotStage = 2;
            player.mgStanceShotDelay = 1.5;
            addDamageText(player.x, player.y - 30, '🎶 [선율의 두 번째 음] 발사! (5,500%)', '#e879f9');
            updateWeaponHUD();
            return;
          } else if (player.mgStanceShotStage === 2) {
            // 3타: [종연의 선율] (7,000%, 관통 -25%) -> 발사 후 즉시 자세 해제 및 쿨타임 시작!
            fireMGStanceMelodyBullet(3);
            player.mgStanceShotStage = 0; // 스택 초기화
            player.mgStanceActive = false; // 자세 해제
            player.mgStanceTimer = 0;
            player.mgStanceShotDelay = 0;
            player.mgSkill2Cooldown = 2.5; // 2.5초 쿨타임 시작!
            addDamageText(player.x, player.y - 35, '🎼 [종연의 선율] 마침표 발사! (7,000%)', '#a855f7');
            updateWeaponHUD();
            return;
          }
        }

        // 아직 자세 미진입 상태: 10 코스트 소모 후 2초 전환 시작
        if (player.mgSkill2Cooldown > 0) {
          addDamageText(player.x, player.y - 20, `스킬 쿨타임 중! (${player.mgSkill2Cooldown.toFixed(1)}s)`, '#94a3b8');
          return;
        }
        if (player.cost < 10) {
          addDamageText(player.x, player.y - 20, '코스트 부족! (10 필요)', '#ef4444');
          return;
        }

        spendPlayerCost(10);
        player.mgStanceTransitioning = true;
        player.mgStanceTransitionTimer = 0;
        player.mgStanceShotStage = 0; // 스택 초기화
        player.vx = 0; // 제자리 고정
        addDamageText(player.x, player.y - 30, '🎻 [개연 : 이스보셋] 집중 사격 자세 전환... (2.0s)', '#c084fc');
        updateWeaponHUD();
        return;
      }

      // [AR: WHITE FANG 465] 2스킬: 라이딩 그레네이드 (3 코스트) / 색채: 수류탄 투척·개(改) (3코스트, HP 50% 이하 2코스트)
      const isAR = (player.mainWeapon.id === 'ar_white_fang');
      if (isAR) {
        if (player.arSkill2Cooldown > 0) {
          addDamageText(player.x, player.y - 20, `스킬 쿨타임 중! (${player.arSkill2Cooldown.toFixed(1)}s)`, '#94a3b8');
          return;
        }

        if (player.isColorActive) {
          const isHpUnder50 = (player.hp / player.maxHp) <= 0.50;
          const reqCost = isHpUnder50 ? 2 : 3;
          if (player.cost < reqCost) {
            addDamageText(player.x, player.y - 20, `코스트 부족! (${reqCost} 필요)`, '#ef4444');
            return;
          }
          spendPlayerCost(reqCost);
          player.arSkill2Cooldown = player.arSkill2CooldownMax || 2.5;
          throwColorGrenade();
          addDamageText(player.x, player.y - 30, `💣 [수류탄 투척·개(改)] 투척! (550% 광역)`, '#94a3b8');
          updateWeaponHUD();
          return;
        }

        if (player.cost < 3) {
          addDamageText(player.x, player.y - 20, '코스트 부족! (3 필요)', '#ef4444');
          return;
        }
        spendPlayerCost(3);
        player.arSkill2Cooldown = player.arSkill2CooldownMax || 2.5;
        throwRidingGrenade();
        addDamageText(player.x, player.y - 30, '💣 [라이딩 그레네이드] 투척! (630% & 공-30%)', '#06b6d4');
        updateWeaponHUD();
        return;
      }

      // [SMG: FOX 45식 기관단총] 2스킬: 공세 전환
      const isSMG = (player.mainWeapon.id === 'smg_fox45');
      if (isSMG) {
        if (player.foxSkill2Cooldown > 0) {
          addDamageText(player.x, player.y - 20, `스킬 쿨타임 중! (${player.foxSkill2Cooldown.toFixed(1)}s)`, '#94a3b8');
          return;
        }

        const isTactical = (player.isTacticalDefActive && player.tacticalShield > 0);
        const reqCost = isTactical ? 4 : 3;
        if (player.cost < reqCost) {
          addDamageText(player.x, player.y - 20, `코스트 부족! (${reqCost} 필요)`, '#ef4444');
          return;
        }

        spendPlayerCost(reqCost);
        player.foxSkill2Cooldown = 2.5;

        const mult = isTactical ? 3.00 : 4.20;
        let skill2BaseDmg = Math.round(250 * mult);
        skill2BaseDmg = calcPlayerAttackDamage(skill2BaseDmg);

        const isCrit = checkCritSuccess(player.crit, 100);
        const critMult = calculateCritDamageMultiplier(player.critDmg, 50, 0);
        const finalDmg = isCrit ? Math.round(skill2BaseDmg * critMult) : skill2BaseDmg;
        const debuffVal = isTactical ? 44 : 22;

        const bulletSpeed = 32;
        const muzzleOffset = 44;
        const groundY = canvas.height - GROUND_OFFSET;
        const redKaiten = kaitenzers.find(k => k.id === 'red');
        const isRedTaunting = redKaiten && redKaiten.isSpawned && !redKaiten.isDead && redKaiten.isActive;
        let bVx, bVy, bAngle, shootOriginX;
        const shootOriginY = player.y + player.height * 0.58;

        if (isRedTaunting) {
          player.facing = (redKaiten.x + redKaiten.size / 2 >= player.x + player.width / 2) ? 1 : -1;
          shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
          const dx = (redKaiten.x + redKaiten.size / 2) - shootOriginX;
          const dy = (groundY - redKaiten.size / 2) - shootOriginY;
          const dist = Math.hypot(dx, dy) || 1;
          bVx = (dx / dist) * bulletSpeed;
          bVy = (dy / dist) * bulletSpeed;
          bAngle = Math.atan2(dy, dx);
        } else {
          const pCenterX = player.x + player.width / 2;
          const closestEnemy = getClosestActiveEnemy(pCenterX, shootOriginY);
          if (closestEnemy && closestEnemy.entity) {
            player.facing = closestEnemy.x >= pCenterX ? 1 : -1;
            shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
            const dx = closestEnemy.x - shootOriginX;
            const dy = closestEnemy.y - shootOriginY;
            const dist = Math.hypot(dx, dy) || 1;
            bVx = (dx / dist) * bulletSpeed;
            bVy = (dy / dist) * bulletSpeed;
            bAngle = Math.atan2(dy, dx);
          } else {
            shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
            bVx = player.facing * bulletSpeed;
            bVy = 0;
            bAngle = player.facing > 0 ? 0 : Math.PI;
          }
        }

        const shiftBullet = {
          isPlayerBullet: true,
          isSkillBullet: true,
          isCrit: isCrit,
          isPiercing: false, // 단일 타겟 (관통 불가)
          type: 'fox_offensive_shift',
          x: shootOriginX,
          y: shootOriginY,
          vx: bVx,
          vy: bVy,
          angle: bAngle,
          dmg: finalDmg,
          critResistDebuff: debuffVal,
          color: '#fb923c',
          size: 14,
          life: 35
        };
        bullets.push(shiftBullet);

        // 공세 전환 오렌지 섬광 파티클
        for (let i = 0; i < 18; i++) {
          specialParticles.push({
            type: 'spark',
            x: shootOriginX,
            y: shootOriginY + (Math.random() - 0.5) * 16,
            vx: player.facing * (Math.random() * 10 + 6),
            vy: (Math.random() - 0.5) * 6,
            color: Math.random() < 0.6 ? '#fb923c' : '#f59e0b',
            size: Math.random() * 3 + 2,
            life: 14,
            maxLife: 14,
            alpha: 1
          });
        }

        if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
          sendNetPacket({
            type: 'SYNC',
            bulletEvent: shiftBullet
          });
        }

        addDamageText(player.x, player.y - 30, `🎯 [공세 전환] 발사! (${isTactical ? '300% / 치저 -44%' : '420% / 치저 -22%'})`, '#fb923c');
        updateWeaponHUD();
        return;
      }

      addDamageText(player.x, player.y - 25, '🔒 [메인스킬 2: 준비 중]', '#94a3b8');
    }

    // MG [개연 : 이스보셋] 선율 관통 탄환 발사 함수
    function fireMGStanceMelodyBullet(stage) {
      const activePassives = [playerLoadout.slot3.id, playerLoadout.slot4.id, playerLoadout.slot5.id];
      const bulletSpeed = 36;
      const muzzleOffset = 60;
      const groundY = canvas.height - GROUND_OFFSET;
      const shootOriginY = player.y + player.height * 0.58;

      let mult = 35.0; // 1음 3,500%
      let decay = 0.35; // 관통 시 35% 감소
      let bulletColor = '#c084fc'; // 1음: 연보라빛 네온
      let bulletSize = 14;
      let stageName = '선율의 첫 번째 음';

      if (stage === 2) {
        mult = 55.0; // 2음 5,500%
        decay = 0.45; // 관통 시 45% 감소
        bulletColor = '#d946ef'; // 2음: 난초보라빛 네온
        bulletSize = 17;
        stageName = '선율의 두 번째 음';
      } else if (stage === 3) {
        mult = 70.0; // 종연 7,000%
        decay = 0.25; // 관통 시 25% 감소
        bulletColor = '#a855f7'; // 종연: 짙은 전격 보라빛 네온
        bulletSize = 21;
        stageName = '종연의 선율';
      }

      let baseDmg = Math.round(400 * mult);
      baseDmg = calcPlayerAttackDamage(baseDmg);

      // [전투 스탯 엔진] 치명타 및 치명 대미지 연산
      const isCrit = checkCritSuccess(player.crit, 100);
      const critMult = calculateCritDamageMultiplier(player.critDmg, 50, 0);
      const finalDmg = isCrit ? Math.round(baseDmg * critMult) : baseDmg;
      const minDmg = Math.round(finalDmg * 0.10); // 최소 피해량 10%

      player.mainWeapon.flashTimer = 0.15;

      // 레드 도발 체크
      const redKaiten = kaitenzers.find(k => k.id === 'red');
      const isRedTaunting = redKaiten && redKaiten.isSpawned && !redKaiten.isDead && redKaiten.isActive;

      let bVx, bVy, bAngle;
      let shootOriginX;
      if (isRedTaunting) {
        player.facing = (redKaiten.x + redKaiten.size / 2 >= player.x + player.width / 2) ? 1 : -1;
        shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
        const dx = (redKaiten.x + redKaiten.size / 2) - shootOriginX;
        const dy = (groundY - redKaiten.size / 2) - shootOriginY;
        const dist = Math.hypot(dx, dy) || 1;
        bVx = (dx / dist) * bulletSpeed;
        bVy = (dy / dist) * bulletSpeed;
        bAngle = Math.atan2(dy, dx);
      } else {
        const isAutoAim = (player.aimMode === 'auto');
        const pCenterX = player.x + player.width / 2;
        const pCenterY = player.y + player.height * 0.58;
        const closestEnemy = isAutoAim ? getClosestActiveEnemy(pCenterX, pCenterY) : null;

        if (closestEnemy && closestEnemy.entity) {
          player.facing = closestEnemy.x >= pCenterX ? 1 : -1;
          shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
          const dx = closestEnemy.x - shootOriginX;
          const dy = closestEnemy.y - shootOriginY;
          const dist = Math.hypot(dx, dy) || 1;
          bVx = (dx / dist) * bulletSpeed;
          bVy = (dy / dist) * bulletSpeed;
          bAngle = Math.atan2(dy, dx);
        } else {
          shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
          bVx = player.facing * bulletSpeed;
          bVy = 0;
          bAngle = player.facing > 0 ? 0 : Math.PI;
        }
      }

      const melodyBullet = {
        isPlayerBullet: true,
        isSkillBullet: true,
        isPiercing: true, // 관통탄
        isCrit: isCrit,
        type: 'mg_melody_bullet',
        stage: stage,
        stageName: stageName,
        x: shootOriginX,
        y: shootOriginY,
        vx: bVx,
        vy: bVy,
        angle: bAngle,
        dmg: finalDmg,
        initialDmg: finalDmg,
        decayRate: decay,
        minDmg: minDmg,
        hitKaitenIds: [], // 관통 적중한 적 ID 목록 (중복 감쇄 방지)
        color: isCrit ? '#fae8ff' : bulletColor,
        size: bulletSize,
        life: 140
      };
      bullets.push(melodyBullet);

      if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
        sendNetPacket({
          type: 'SYNC',
          bulletEvent: melodyBullet
        });
      }
    }

    // SG [격류] 1회 발사 (산탄 8발, 발당 750 피해, 사거리 400px 비관통)
    function fireSGTorrentShot() {
      const activePassives = [playerLoadout.slot3.id, playerLoadout.slot4.id, playerLoadout.slot5.id];
      const bulletSpeed = 24;
      const muzzleOffset = 50;
      const groundY = canvas.height - GROUND_OFFSET;
      const shootOriginY = player.y + player.height * 0.58;

      let basePelletDmg = 750;
      basePelletDmg = calcPlayerAttackDamage(basePelletDmg);

      // [전투 스탯 엔진] 치명타 및 치명 대미지 연산
      const isCrit = checkCritSuccess(player.crit, 100);
      const critMult = calculateCritDamageMultiplier(player.critDmg, 50, 0);
      const finalPelletDmg = isCrit ? Math.round(basePelletDmg * critMult) : basePelletDmg;

      player.mainWeapon.flashTimer = 0.10;

      // 레드 도발 체크
      const redKaiten = kaitenzers.find(k => k.id === 'red');
      const isRedTaunting = redKaiten && redKaiten.isSpawned && !redKaiten.isDead && redKaiten.isActive;

      let bAngle;
      let shootOriginX;
      if (isRedTaunting) {
        player.facing = (redKaiten.x + redKaiten.size / 2 >= player.x + player.width / 2) ? 1 : -1;
        shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
        const dx = (redKaiten.x + redKaiten.size / 2) - shootOriginX;
        const dy = (groundY - redKaiten.size / 2) - shootOriginY;
        bAngle = Math.atan2(dy, dx);
      } else {
        const isAutoAim = (player.aimMode === 'auto');
        const pCenterX = player.x + player.width / 2;
        const pCenterY = player.y + player.height * 0.58;
        const closestEnemy = isAutoAim ? getClosestActiveEnemy(pCenterX, pCenterY) : null;

        if (closestEnemy && closestEnemy.entity) {
          player.facing = closestEnemy.x >= pCenterX ? 1 : -1;
          shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
          const dx = closestEnemy.x - shootOriginX;
          const dy = closestEnemy.y - shootOriginY;
          bAngle = Math.atan2(dy, dx);
        } else {
          shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
          bAngle = player.facing > 0 ? 0 : Math.PI;
        }
      }

      const pelletCount = 8;
      const spreadAngle = 0.20; // 약 ±6도

      for (let p = 0; p < pelletCount; p++) {
        const spreadFactor = pelletCount > 1 ? (p / (pelletCount - 1) - 0.5) : 0;
        const jitter = (Math.random() - 0.5) * 0.03;
        const pAngle = bAngle + (spreadFactor * spreadAngle) + jitter;
        const pVx = Math.cos(pAngle) * bulletSpeed;
        const pVy = Math.sin(pAngle) * bulletSpeed;

        const sgBullet = {
          isPlayerBullet: true,
          isSkillBullet: true,
          isCrit: isCrit,
          type: 'sg_torrent_pellet',
          x: shootOriginX,
          y: shootOriginY,
          vx: pVx,
          vy: pVy,
          angle: pAngle,
          dmg: finalPelletDmg,
          color: isCrit ? '#fbbf24' : '#0284c7', // 수류/격류 푸른빛
          size: isCrit ? 6.0 : 5.0,
          life: 17 // 24 * 17 ≈ 408px (사거리 400px 비관통)
        };
        bullets.push(sgBullet);

        if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
          sendNetPacket({
            type: 'SYNC',
            bulletEvent: sgBullet
          });
        }
      }
    }

    // RG [빛의 검/각성 : 슈퍼노바] 0.1초 틱 관통 레이저 타격 처리 (총 40타, 틱당 115% = 4,715 피해)
    function fireRGAwakeLaserTick() {
      const activePassives = [playerLoadout.slot3.id, playerLoadout.slot4.id, playerLoadout.slot5.id];
      const groundY = canvas.height - GROUND_OFFSET;
      const originX = player.x + (player.rgAwakeFacing > 0 ? player.width + 10 : -10);
      const originY = player.y + player.height * 0.58;

      let baseTickDmg = Math.round(4100 * 1.15);
      baseTickDmg = calcPlayerAttackDamage(baseTickDmg);

      // [전투 스탯 엔진] 치명타 및 치명 대미지 연산
      const isCrit = checkCritSuccess(player.crit, 100);
      const critMult = calculateCritDamageMultiplier(player.critDmg, 50, 0);
      const finalTickDmg = isCrit ? Math.round(baseTickDmg * critMult) : baseTickDmg;

      player.mainWeapon.flashTimer = 0.08;

      // 레이저 빔 전방 범위 내의 모든 카이텐저 관통 타격
      kaitenzers.forEach(k => {
        if (!k.isSpawned || k.isDead || k.isRetreating) return;
        const kY = groundY - (k.jumpY || 0) - k.size;

        // 전방 방향 검사
        const inFront = player.rgAwakeFacing > 0 ? (k.x + k.size >= originX) : (k.x <= originX);
        if (!inFront) return;

        // Y축 레이저 두께 충돌 검사 (레이저 두께 약 50px)
        const laserTop = originY - 30;
        const laserBottom = originY + 30;
        const kBottom = kY + k.size;

        if (kBottom >= laserTop && kY <= laserBottom) {
          // 적중! 데미지 적용
          const isBlackBuff = kaitenzers.find(b => b.id === 'black').isActive;
          let calculatedDmg = k.id === 'black' ? finalTickDmg : (isBlackBuff ? Math.round(finalTickDmg * 0.7) : finalTickDmg);

          applyKaitenzerSharedDamage(calculatedDmg);

          // [2인 멀티 동기화] 2P 각성 슈퍼노바 레이저 타격 전송
          if (currentMode === 'duo' && myRole === 'guest_striker' && typeof sendNetPacket === 'function') {
            sendNetPacket({
              type: 'ENEMY_DAMAGE',
              targetType: 'kaiten',
              targetId: k.id,
              damage: calculatedDmg,
              isCrit: isCrit
            });
          }

          const dispY = groundY - (k.jumpY || 0) - k.size - 15;
          if (isCrit) {
            addDamageText(k.x + k.size / 2 + (Math.random() - 0.5) * 15, dispY - 10, `CRIT! ${calculatedDmg.toLocaleString()}`, '#fbbf24');
          } else {
            addDamageText(k.x + k.size / 2 + (Math.random() - 0.5) * 15, dispY, `-${calculatedDmg.toLocaleString()}`, '#38bdf8');
          }
        }
      });

      // 2페이즈 KAITEN FX Mk.0 거대 보스 관통 타격
      if (typeof kaitenFx !== 'undefined' && kaitenFx.isSpawned && !kaitenFx.isDead && kaitenFx.introState !== 'none') {
        const fxY = groundY - kaitenFx.height;
        const inFront = player.rgAwakeFacing > 0 ? (kaitenFx.x + kaitenFx.width >= originX) : (kaitenFx.x <= originX);
        if (inFront) {
          const laserTop = originY - 30;
          const laserBottom = originY + 30;
          if (groundY >= laserTop && fxY <= laserBottom) {
            let dmgMult = kaitenFx.shieldActive ? 0.5 : 1.0;
            if (kaitenFx.shieldActive) {
              kaitenFx.shieldHitCount = (kaitenFx.shieldHitCount || 0) + 1;
              if (kaitenFx.shieldHitCount >= 15) {
                kaitenFx.shieldActive = false;
                addDamageText(kaitenFx.x + kaitenFx.width / 2, groundY - 180, '🛡️ [SHIELD BREAK] 실드 가드 파괴!', '#22c55e');
              }
            }
            const tickDmg = Math.round(finalTickDmg * dmgMult);
            kaitenFx.hp = Math.max(0, kaitenFx.hp - tickDmg);

            // [2인 멀티 동기화] 2P 각성 슈퍼노바 보스 레이저 타격 전송
            if (currentMode === 'duo' && myRole === 'guest_striker' && typeof sendNetPacket === 'function') {
              sendNetPacket({
                type: 'ENEMY_DAMAGE',
                targetType: 'kaiten_fx',
                targetId: 'kaiten_fx',
                damage: tickDmg,
                isCrit: isCrit,
                part: kaitenFx.activePart
              });
            }
            if (kaitenFx.activePart && kaitenFx.parts[kaitenFx.activePart] && !kaitenFx.parts[kaitenFx.activePart].isBroken) {
              const curPart = kaitenFx.parts[kaitenFx.activePart];
              curPart.hp = Math.max(0, curPart.hp - tickDmg);
              if (curPart.hp <= 0) {
                curPart.hp = 0;
                curPart.isBroken = true;
                addDamageText(kaitenFx.x + kaitenFx.width / 2, groundY - 220, `💥 [${curPart.name}] 파괴 완료!`, curPart.color);
              }
            }
            if (isCrit) {
              addDamageText(kaitenFx.x + kaitenFx.width / 2 + (Math.random() - 0.5) * 50, groundY - 200, `CRIT! ${tickDmg.toLocaleString()}`, '#fbbf24');
            } else {
              addDamageText(kaitenFx.x + kaitenFx.width / 2 + (Math.random() - 0.5) * 50, groundY - 180, `-${tickDmg.toLocaleString()}`, '#38bdf8');
            }
            if (kaitenFx.hp <= 0) {
              kaitenFx.hp = 0;
              kaitenFx.isDead = true;
              addDamageText(kaitenFx.x + kaitenFx.width / 2, groundY - 250, '🎉 KAITEN FX Mk.0 격파 성공! MISSION COMPLETE!', '#10b981');
            }
          }
        }
      }
    }

    // RG 밸런스 붕괴 거대 관통 에너지탄 발사 함수
    function fireRGSkillBullet() {
      const activePassives = [playerLoadout.slot3.id, playerLoadout.slot4.id, playerLoadout.slot5.id];
      let baseSkillDmg = calcPlayerAttackDamage(Math.round(4100 * 6.10));

      // 차징 단계별 증폭 배율 (1단계: 1.0배, 2단계: 1.5배, 3단계: 2.0배)
      let levelMult = 1.0;
      if (player.chargeLevel === 2) levelMult = 1.5;
      else if (player.chargeLevel === 3) levelMult = 2.0;

      let calculatedDmg = Math.round(baseSkillDmg * levelMult);

      // [전투 스탯 엔진] 치명타 및 치명 대미지 연산
      const isCrit = checkCritSuccess(player.crit, 100);
      const critMult = calculateCritDamageMultiplier(player.critDmg, 50, 0);
      const finalDmg = isCrit ? Math.round(calculatedDmg * critMult) : calculatedDmg;

      player.mainWeapon.flashTimer = 0.15;
      const groundY = canvas.height - GROUND_OFFSET;
      const muzzleOffset = 65;
      const shootOriginY = player.y + player.height * 0.58;

      // 레드 도발 시
      const redKaiten = kaitenzers.find(k => k.id === 'red');
      const isRedTaunting = redKaiten && redKaiten.isSpawned && !redKaiten.isDead && redKaiten.isActive;

      let bVx, bVy, bAngle;
      let shootOriginX;
      if (isRedTaunting) {
        player.facing = (redKaiten.x + redKaiten.size / 2 >= player.x + player.width / 2) ? 1 : -1;
        shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
        const dx = (redKaiten.x + redKaiten.size / 2) - shootOriginX;
        const dy = (groundY - redKaiten.size / 2) - shootOriginY;
        const dist = Math.hypot(dx, dy) || 1;
        bVx = (dx / dist) * 36;
        bVy = (dy / dist) * 36;
        bAngle = Math.atan2(dy, dx);
      } else {
        const isAutoAim = (player.aimMode === 'auto');
        const pCenterX = player.x + player.width / 2;
        const pCenterY = player.y + player.height * 0.58;
        const closestEnemy = isAutoAim ? getClosestActiveEnemy(pCenterX, pCenterY) : null;

        if (closestEnemy && closestEnemy.entity) {
          player.facing = closestEnemy.x >= pCenterX ? 1 : -1;
          shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
          const dx = closestEnemy.x - shootOriginX;
          const dy = closestEnemy.y - shootOriginY;
          const dist = Math.hypot(dx, dy) || 1;
          bVx = (dx / dist) * 36;
          bVy = (dy / dist) * 36;
          bAngle = Math.atan2(dy, dx);
        } else {
          shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
          bVx = player.facing * 36;
          bVy = 0;
          bAngle = player.facing > 0 ? 0 : Math.PI;
        }
      }

      const rgBullet = {
        isPlayerBullet: true,
        isSkillBullet: true,
        isPiercing: true, // 모든 적 관통!
        isCrit: isCrit,
        type: 'rg_energy_ball', // 전용 거대 관통 에너지탄
        chargeLevel: player.chargeLevel,
        x: shootOriginX,
        y: shootOriginY,
        vx: bVx,
        vy: bVy,
        angle: bAngle,
        dmg: finalDmg,
        color: isCrit ? '#fef08a' : (player.chargeLevel === 3 ? '#ec4899' : (player.chargeLevel === 2 ? '#38bdf8' : '#60a5fa')),
        size: 14 + (player.chargeLevel * 4), // 18 ~ 26 크기의 거대 플라즈마 구체
        life: 140
      };
      bullets.push(rgBullet);

      if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
        sendNetPacket({
          type: 'SYNC',
          bulletEvent: rgBullet
        });
      }

      addDamageText(shootOriginX, shootOriginY - 30, `💥 밸런스 붕괴 발사! [Lv.${player.chargeLevel}]`, '#38bdf8');
    }

    // 종막: 이스보셋 관통 탄환 단발 생성 (발당 600% = 2,400 dmg)
    function fireSkillBullet() {
      const activePassives = [playerLoadout.slot3.id, playerLoadout.slot4.id, playerLoadout.slot5.id];
      let baseDmg = calcPlayerAttackDamage(2400); // 400 * 600%

      // [전투 스탯 엔진] 치명타 및 치명 대미지 연산
      const isCrit = checkCritSuccess(player.crit, 100);
      const critMult = calculateCritDamageMultiplier(player.critDmg, 50, 0);
      const finalDmg = isCrit ? Math.round(baseDmg * critMult) : baseDmg;

      player.mainWeapon.flashTimer = 0.08;
      const groundY = canvas.height - GROUND_OFFSET;
      const muzzleOffset = 54;
      const shootOriginY = player.y + player.height * 0.58 + (Math.random() - 0.5) * 4;

      // [레드의 도발 스킬]: 스킬 탄환도 10초간 발사 방향이 강제로 레드를 향해 발사됨!
      const redKaiten = kaitenzers.find(k => k.id === 'red');
      const isRedTaunting = redKaiten && redKaiten.isSpawned && !redKaiten.isDead && redKaiten.isActive;

      let bVx, bVy, bAngle;
      let shootOriginX;
      if (isRedTaunting) {
        player.facing = (redKaiten.x + redKaiten.size / 2 >= player.x + player.width / 2) ? 1 : -1;
        shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
        const dx = (redKaiten.x + redKaiten.size / 2) - shootOriginX;
        const dy = (groundY - redKaiten.size / 2) - shootOriginY;
        const dist = Math.hypot(dx, dy) || 1;
        bVx = (dx / dist) * 32;
        bVy = (dy / dist) * 32;
        bAngle = Math.atan2(dy, dx);
      } else {
        const isAutoAim = (player.aimMode === 'auto');
        const pCenterX = player.x + player.width / 2;
        const pCenterY = player.y + player.height * 0.58;
        const closestEnemy = isAutoAim ? getClosestActiveEnemy(pCenterX, pCenterY) : null;

        if (closestEnemy && closestEnemy.entity) {
          player.facing = closestEnemy.x >= pCenterX ? 1 : -1;
          shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
          const dx = closestEnemy.x - shootOriginX;
          const dy = closestEnemy.y - shootOriginY;
          const dist = Math.hypot(dx, dy) || 1;
          bVx = (dx / dist) * 32;
          bVy = (dy / dist) * 32;
          bAngle = Math.atan2(dy, dx);
        } else {
          shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
          bVx = player.facing * 30;
          bVy = 0;
          bAngle = player.facing > 0 ? 0 : Math.PI;
        }
      }

      const skillBullet = {
        isPlayerBullet: true,
        isSkillBullet: true,
        isPiercing: true, // 적을 관통함!
        isCrit: isCrit,
        type: 'mg_ishbosheth_bullet', // 종막: 이스보셋 전용 보라빛 네온 관통탄
        x: shootOriginX,
        y: shootOriginY,
        vx: bVx,
        vy: bVy,
        angle: bAngle,
        dmg: finalDmg,
        color: isCrit ? '#fae8ff' : '#a855f7',
        size: 9,
        life: 120
      };
      bullets.push(skillBullet);
      if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
        sendNetPacket({
          type: 'SYNC',
          bulletEvent: skillBullet
        });
      }
    }

    // [특수스킬 (S키)]: 선도부장(MG) & 시스템 : 아비 에슈흐(RG) 발동 함수
    function tryFireSpecialSkill() {
      if (player.activeWeaponSlot !== 'main') {
        addDamageText(player.x, player.y - 20, '메인 무기만 사용 가능!', '#ef4444');
        return;
      }
      if (!player.mainWeapon || (player.mainWeapon.id !== 'mg_destructor' && player.mainWeapon.id !== 'rg_supernova' && player.mainWeapon.id !== 'sg_bloody_gunpowder' && player.mainWeapon.id !== 'ar_white_fang' && player.mainWeapon.id !== 'smg_fox45')) {
        addDamageText(player.x, player.y - 20, '특수스킬 미지원 무기입니다!', '#94a3b8');
        return;
      }

      // [SG: 블러디 앤 건 파우더] 특수스킬: 불사(不死)
      if (player.mainWeapon.id === 'sg_bloody_gunpowder') {
        if (player.isImmortalActive) return;
        if (player.specialSkillUsed) {
          addDamageText(player.x, player.y - 20, '전투당 1회만 사용 가능합니다!', '#94a3b8');
          return;
        }

        // 발동 시점 체력 비율 산출 (1% ~ 100%)
        const hpRatio = Math.max(0.01, Math.min(1.0, player.hp / player.maxHp));
        player.immortalHpRatioAtStart = hpRatio;
        const isMinHp = hpRatio <= 0.0101; // 1% 이하 여부
        player.immortalIsAlwaysCrit = isMinHp;

        // t: 0.0 (1% 이하 / 극한) ~ 1.0 (100% / 만피)
        const t = Math.max(0, Math.min(1, (hpRatio - 0.01) / 0.99));

        // 1) 지속시간: 1% 이하 10초 ~ 100% 5초
        player.immortalMaxDuration = 10 - t * 5;
        player.immortalTimer = player.immortalMaxDuration;

        // 2) 사격 딜레이: 1% 이하 0.10초 ~ 100% 0.50초
        player.immortalFireDelay = 0.10 + t * 0.40;

        // 3) 기본 공격력: 1% 이하 2,450 ~ 100% 720
        player.immortalBaseDmg = Math.round(2450 - t * 1730);

        // 4) 펠릿 수: 1% 이하 7발 ~ 100% 5발
        player.immortalPellets = Math.round(7 - t * 2);

        // 스택 및 누적 데미지 초기화
        player.immortalShotsCount = 0;
        player.immortalStack = 0;
        player.immortalTotalDmgDealt = 0;

        player.isImmortalActive = true;
        player.specialSkillUsed = true;
        player.mainWeapon.isReloading = false;
        player.mainWeapon.fireTimer = player.immortalFireDelay; // 즉시 사격 가능

        // 발동 순간 거대한 핏빛 폭풍 오라 파티클 분출
        for (let i = 0; i < 35; i++) {
          specialParticles.push({
            type: 'spark',
            x: player.x + player.width / 2 + (Math.random() - 0.5) * 40,
            y: player.y + player.height / 2 + (Math.random() - 0.5) * 40,
            vx: (Math.random() - 0.5) * 16,
            vy: -(Math.random() * 12 + 4),
            color: Math.random() < 0.6 ? '#dc2626' : (Math.random() < 0.85 ? '#ef4444' : '#f87171'),
            size: Math.random() * 4 + 2,
            life: 24,
            maxLife: 24,
            alpha: 1
          });
        }

        const critNotice = isMinHp ? ' [🔥치명타 확률 +20% 증가!]' : '';
        addDamageText(player.x, player.y - 45, `🩸 [특수스킬 : 불사(不死)] 전개! (${player.immortalMaxDuration.toFixed(1)}s 무적)${critNotice}`, '#dc2626');
        if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
          sendNetPacket({
            type: 'SYNC',
            specialEvent: { action: 'immortal_start', duration: player.immortalMaxDuration, hpRatio: hpRatio }
          });
        }
        updateWeaponHUD();
        return;
      }

      // [MG: 종막의 디스트로이어] 특수스킬: 선도부장
      if (player.mainWeapon.id === 'mg_destructor') {
        if (player.isFiringSpecial) return;
        if (player.specialSkillUsed) {
          addDamageText(player.x, player.y - 20, '전투당 1회만 사용 가능합니다!', '#94a3b8');
          return;
        }
        if (!player.specialSkillUnlocked) {
          const hpPct = ((player.hp / player.maxHp) * 100).toFixed(0);
          addDamageText(player.x, player.y - 25, `체력 50% 이하 시에만 해금! (현재 ${hpPct}%)`, '#ef4444');
          return;
        }

        // 발동! (0코스트 1회성)
        player.isFiringSpecial = true;
        player.specialSkillUsed = true;
        player.specialTimer = 0;
        player.specialShotInterval = 0;
        player.specialPhase = 1;
        player.specialIsBerserk = false;
        player.vx = 0;

        addDamageText(player.x, player.y - 35, '👑 [특수스킬 : 선도부장] 폭풍 난사 개시!', '#c084fc');
        if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
          sendNetPacket({
            type: 'SYNC',
            specialEvent: { action: 'start' }
          });
        }
        updateWeaponHUD();
        return;
      }

      // [RG: 빛의검 : 슈퍼노바] 특수스킬: 시스템 : 아비 에슈흐
      if (player.mainWeapon.id === 'rg_supernova') {
        if (player.isAbiEshuhActive) return;
        if (player.specialSkillUsed) {
          addDamageText(player.x, player.y - 20, '전투당 1회만 사용 가능합니다!', '#94a3b8');
          return;
        }
        if (!player.specialSkillUnlocked) {
          addDamageText(player.x, player.y - 25, `누적 코스트 10 이상 소모 시 해금! (현재 ${player.spentCostTotal || 0}/10)`, '#ef4444');
          return;
        }

        // RG 아비 에슈흐 폼 체인지 발동! (0코스트 1회성)
        player.specialSkillUsed = true;
        player.isAbiEshuhActive = true;
        player.abiTransforming = true;
        player.abiTransformTimer = 0.5; // 0.5초 빛과 데이터 입자 트랜스폼 시퀀스
        player.isHovering = true; // 비행 호버링 모드 전환
        player.maxCost = 200;
        player.cost = 200;
        player.costTimer = 0; // 기존 코스트 충전 중단
        player.activeWeaponSlot = 'main';
        player.abiNormalCharging = false;
        player.abiNormalChargeTimer = 0;
        player.abiMissileHistory = [];
        player.abiMissileCooldown = 0;
        player.abiBarrageFiring = false;
        player.abiFinalReady = false;
        player.abiFinalDelayTimer = 0;
        player.abiFinalCanTrigger = false;
        player.abiFinalPhase = 'none';
        player.abiStunTimer = 0;
        player.vx = 0;
        player.vy = 0;

        addDamageText(player.x, player.y - 45, '💎 [시스템 : 아비 에슈흐] 폼 체인지 가동! (200 에너지)', '#00ffff');
        if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
          sendNetPacket({
            type: 'SYNC',
            specialEvent: { action: 'abi_eshuh_start' }
          });
        }
        updateWeaponHUD();
        return;
      }

      // [AR: WHITE FANG 465] 특수스킬: 색채(色彩)
      if (player.mainWeapon.id === 'ar_white_fang') {
        if (player.isColorActive) {
          addDamageText(player.x, player.y - 20, '이미 색채 각성 상태입니다!', '#94a3b8');
          return;
        }
        if (player.specialSkillUsed) {
          addDamageText(player.x, player.y - 20, '전투당 1회만 사용 가능합니다!', '#94a3b8');
          return;
        }
        addDamageText(player.x, player.y - 25, '🔒 [색채: 사망 시 1회 자동 각성 발동]', '#64748b');
        return;
      }

      // [SMG: FOX 45식 기관단총] 특수스킬: 전술 방패 전개
      if (player.mainWeapon.id === 'smg_fox45') {
        if (player.foxShieldCooldown > 0) {
          addDamageText(player.x, player.y - 20, `스킬 쿨타임 중! (${player.foxShieldCooldown.toFixed(1)}s)`, '#94a3b8');
          return;
        }
        if (player.cost < 4) {
          addDamageText(player.x, player.y - 20, '코스트 부족! (4 필요)', '#ef4444');
          return;
        }

        spendPlayerCost(4);
        player.foxShieldCooldown = 40.0; // 40초 쿨타임

        // 1) 즉시 완충 재장전
        player.mainWeapon.ammo = player.mainWeapon.maxAmmo;
        player.mainWeapon.isReloading = false;
        player.mainWeapon.reloadTimer = 0;

        // 2) 최대 체력의 12% 전술 보호막 생성 (15초 유지)
        player.tacticalShieldMax = Math.round(player.maxHp * 0.12);
        player.tacticalShield = player.tacticalShieldMax;
        player.tacticalShieldTimer = 15.0;
        player.isTacticalDefActive = true;

        // 3) 청록빛 홀로그램 방패 전개 파티클
        for (let i = 0; i < 28; i++) {
          specialParticles.push({
            type: 'spark',
            x: player.x + (player.facing > 0 ? player.width + 12 : -12) + (Math.random() - 0.5) * 20,
            y: player.y + player.height / 2 + (Math.random() - 0.5) * 35,
            vx: player.facing * (Math.random() * 6 + 2) + (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 8,
            color: Math.random() < 0.6 ? '#38bdf8' : (Math.random() < 0.85 ? '#06b6d4' : '#f59e0b'),
            size: Math.random() * 3 + 2,
            life: 20,
            maxLife: 20,
            alpha: 1
          });
        }

        addDamageText(player.x, player.y - 35, `🛡️ [전술 방패 전개] 보호막(${player.tacticalShield.toLocaleString()}) & 즉시 재장전!`, '#38bdf8');
        updateWeaponHUD();
        return;
      }
    }

    // [AR: WHITE FANG 465] 사망 시 특수스킬 [색채(色彩)] 1회 자동 각성 & BLACK FANG 465 변환
    function triggerColorAwakening() {
      if (player.isColorActive || player.specialSkillUsed) return;
      player.specialSkillUsed = true;
      player.isColorActive = true;

      // 1. 최대 체력 150% 증가 및 최대치로 부활
      player.maxHp = Math.round(player.baseMaxHp * 1.50); // 65,000 * 1.5 = 97,500
      player.hp = player.maxHp;

      // 2. 외형 흑회색 변경
      player.originalColor = player.color || '#0284c7';
      player.color = '#334155';

      // 3. 무기 스펙 BLACK FANG 465 변환 & 무한 탄창
      player.mainWeapon.name = 'AR (BLACK FANG 465)';
      player.mainWeapon.dmg = 1200;
      player.mainWeapon.fireDelay = 0.20;
      player.mainWeapon.ammo = 999;
      player.mainWeapon.maxAmmo = 999;
      player.mainWeapon.isReloading = false;
      player.crit += 180; // 치명타 확률 +10% 추가 증가
      player.critDmg += 50; // 치명 대미지 350% -> 400%
      player.stability = Math.max(100, player.stability - 1000); // 1500 -> 500

      // 4. 타이머 및 상태 초기화
      player.colorErosionTimer = 0;
      player.calmBreathActive = false;
      player.calmBreathTimer = 0;
      player.calmBreathUsed = false;
      player.colorDroneCharges = 2;

      // 각성 충격파 및 연기 파티클
      for (let i = 0; i < 40; i++) {
        specialParticles.push({
          type: 'spark',
          x: player.x + player.width / 2 + (Math.random() - 0.5) * 50,
          y: player.y + player.height / 2 + (Math.random() - 0.5) * 50,
          vx: (Math.random() - 0.5) * 14,
          vy: -(Math.random() * 10 + 3),
          color: Math.random() < 0.6 ? '#1e293b' : (Math.random() < 0.85 ? '#475569' : '#cbd5e1'),
          size: Math.random() * 4 + 2,
          life: 25,
          maxLife: 25,
          alpha: 1
        });
      }

      addDamageText(player.x, player.y - 45, '🖤 [특수스킬: 색채(色彩)] 각성 부활! (BLACK FANG 465)', '#94a3b8');
      if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
        sendNetPacket({
          type: 'SYNC',
          specialEvent: { action: 'color_start' }
        });
      }
      updateWeaponHUD();
    }

    // [색채 메인스킬 1] 화력 강화 드론 소환 (최대 체력 20% 소모, 40초 유지, 사격 시마다 250% 탄환 1~3발)
    function spawnColorDrone() {
      if (player.colorDroneCharges <= 0) {
        addDamageText(player.x, player.y - 20, '화력 강화 사용 횟수 초과! (최대 2회)', '#ef4444');
        return;
      }
      const selfDmg = Math.round(player.maxHp * 0.20);
      if (player.hp <= selfDmg && !player.calmBreathActive) {
        addDamageText(player.x, player.y - 20, '체력이 부족합니다! (최대 체력 20% 필요)', '#ef4444');
        return;
      }

      // 체력 20% 자해 소모
      player.hp = Math.max(1, player.hp - selfDmg);
      addDamageText(player.x, player.y - 20, `🩸 -${selfDmg.toLocaleString()} (체력 20% 소모)`, '#ef4444');
      player.colorDroneCharges--;

      window.whiteFangDrones = window.whiteFangDrones || [];
      const colorDrones = window.whiteFangDrones.filter(d => d.isColorDrone);
      const isSecondDrone = colorDrones.length >= 1;
      const sideMult = isSecondDrone ? -1 : 1;
      const dX = player.x + (player.width / 2) + (player.facing * sideMult * 54) - (player.facing * 10);
      const dY = player.y - 42;

      const drone = {
        x: dX,
        y: dY,
        facing: player.facing,
        duration: 40.0,
        timer: 40.0,
        fireTimer: 0,
        isColorDrone: true, // 색채 드론 구분
        shotsFired: 0,
        podAlternator: 0,
        flashTimer: 0,
        id: Date.now() + Math.random()
      };
      window.whiteFangDrones.push(drone);

      const droneLabel = isSecondDrone ? '2호기 (후방)' : '1호기 (전방)';
      addDamageText(player.x, player.y - 35, `🛸 [화력 강화] ${droneLabel} 가동! (양측 호버링)`, '#94a3b8');
      updateWeaponHUD();
    }

    // [색채 메인스킬 2] 수류탄 투척·개(改) (3코스트 / HP 50% 이하 시 2코스트, 550% 범위 피해, 드론 15발 미사일 연계)
    function throwColorGrenade() {
      const activePassives = [playerLoadout.slot3.id, playerLoadout.slot4.id, playerLoadout.slot5.id];
      const isHpLow = (player.hp / player.maxHp) <= 0.30;
      let atkStat = isHpLow ? 1440 : 1200; // HP 30% 이하 시 공격력 20% 증가 (1,440)
      let baseDmg = calcPlayerAttackDamage(Math.round(atkStat * 5.50)); // 공격력의 550%

      const isCrit = checkCritSuccess(player.crit, 100);
      const critMult = calculateCritDamageMultiplier(player.critDmg, 50, 0);
      const finalDmg = isCrit ? Math.round(baseDmg * critMult) : baseDmg;

      const groundY = canvas.height - GROUND_OFFSET;
      const muzzleOffset = 40;
      const shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
      const shootOriginY = player.y + player.height * 0.5;

      const throwVx = player.facing * 10;
      const throwVy = -5.0;

      const grenadeBullet = {
        isPlayerBullet: true,
        isCrit: isCrit,
        type: 'color_grenade',
        x: shootOriginX,
        y: shootOriginY,
        vx: throwVx,
        vy: throwVy,
        gravity: 0.28,
        dmg: finalDmg,
        color: isCrit ? '#fef08a' : '#64748b',
        size: 12,
        life: 120
      };
      bullets.push(grenadeBullet);
      if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
        sendNetPacket({ type: 'SYNC', bulletEvent: grenadeBullet });
      }

      // 드론 화력 집중 연계: 가동 중인 색채 드론이 있을 경우 드론당 15발 미사일(300% 피해) 일제 난사!
      if (window.whiteFangDrones && window.whiteFangDrones.length > 0) {
        const colorDrones = window.whiteFangDrones.filter(d => d.isColorDrone);
        colorDrones.forEach(drone => {
          let missileDmg = calcPlayerAttackDamage(Math.round(atkStat * 3.0)); // 300%
          const finalMissileDmg = isCrit ? Math.round(missileDmg * critMult) : missileDmg;

          for (let m = 0; m < 15; m++) {
            setTimeout(() => {
              const launchX = drone.x + (drone.podAlternator === 0 ? -13 : 13) * drone.facing;
              const launchY = drone.y - 4;
              drone.podAlternator = 1 - drone.podAlternator;
              drone.flashTimer = 0.08;

              const closest = getClosestActiveEnemy(launchX, launchY);
              const mTarget = closest ? closest.entity : null;

              let initVx = drone.facing * (16 + Math.random() * 4);
              let initVy = -4 + (Math.random() - 0.5) * 6;
              if (mTarget) {
                const isBoss = (mTarget.width !== undefined && mTarget.height !== undefined);
                const tCenterX = isBoss ? (mTarget.x + mTarget.width / 2) : (mTarget.x + mTarget.size / 2);
                const tCenterY = isBoss ? ((canvas.height - GROUND_OFFSET) - mTarget.height / 2) : ((canvas.height - GROUND_OFFSET) - (mTarget.jumpY || 0) - mTarget.size / 2);
                const dx = tCenterX - launchX;
                const dy = tCenterY - launchY;
                const dist = Math.hypot(dx, dy) || 1;
                initVx = (dx / dist) * 19;
                initVy = (dy / dist) * 19 - 2;
              }

              const wMissile = {
                isPlayerBullet: true,
                isSkillBullet: true,
                isCrit: isCrit,
                type: 'white_fang_missile',
                x: launchX,
                y: launchY,
                vx: initVx,
                vy: initVy,
                angle: Math.atan2(initVy, initVx),
                targetKaiten: mTarget,
                dmg: finalMissileDmg,
                color: isCrit ? '#fef08a' : '#94a3b8',
                size: 7,
                life: 110,
                smokeTimer: 0
              };
              bullets.push(wMissile);
              if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
                sendNetPacket({ type: 'SYNC', bulletEvent: wMissile });
              }
            }, m * 40); // 0.04초 간격으로 15발 연속 사출
          }
        });
        if (colorDrones.length > 0) {
          addDamageText(player.x, player.y - 45, '🚀 [드론 전탄 일제사격!] 300% 미사일 15발 난사!', '#cbd5e1');
        }
      }

      if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
        sendNetPacket({
          type: 'SYNC',
          bulletEvent: grenadeBullet
        });
      }
    }

    // [특수스킬 : 선도부장] 단계별 관통 탄환 발사
    function fireMGSpecialBullet(phase, isBerserk) {
      const activePassives = [playerLoadout.slot3.id, playerLoadout.slot4.id, playerLoadout.slot5.id];
      const groundY = canvas.height - GROUND_OFFSET;
      const muzzleOffset = 58;
      const shootOriginY = player.y + player.height * 0.58 + (Math.random() - 0.5) * 6;

      // 1단계: 720% (2,880), 2단계: 870% (3,480), 3단계: 870% (체력 30% 이하 시 1,320% = 5,280)
      let mult = 7.20;
      let bulletColor = '#c084fc';
      let bulletSize = 10;
      let speed = 36;

      if (phase === 2) {
        mult = 8.70;
        bulletColor = '#d946ef';
        bulletSize = 12;
        speed = 38;
      } else if (phase === 3) {
        if (isBerserk) {
          mult = 13.20; // 체력 30% 이하 극강 각성!
          bulletColor = '#a855f7';
          bulletSize = 15;
          speed = 42;
        } else {
          mult = 8.70;
          bulletColor = '#d946ef';
          bulletSize = 12;
          speed = 38;
        }
      }

      let baseDmg = calcPlayerAttackDamage(Math.round(400 * mult));

      // [전투 스탯 엔진] 치명타 및 치명 대미지 연산
      const isCrit = checkCritSuccess(player.crit, 100);
      const critMult = calculateCritDamageMultiplier(player.critDmg, 50, 0);
      const finalDmg = isCrit ? Math.round(baseDmg * critMult) : baseDmg;

      player.mainWeapon.flashTimer = 0.05;

      // 레드 도발 시 타겟팅
      const redKaiten = kaitenzers.find(k => k.id === 'red');
      const isRedTaunting = redKaiten && redKaiten.isSpawned && !redKaiten.isDead && redKaiten.isActive;

      let bVx, bVy, bAngle;
      let shootOriginX;
      if (isRedTaunting) {
        player.facing = (redKaiten.x + redKaiten.size / 2 >= player.x + player.width / 2) ? 1 : -1;
        shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
        const dx = (redKaiten.x + redKaiten.size / 2) - shootOriginX;
        const dy = (groundY - redKaiten.size / 2) - shootOriginY;
        const dist = Math.hypot(dx, dy) || 1;
        bVx = (dx / dist) * speed;
        bVy = (dy / dist) * speed;
        bAngle = Math.atan2(dy, dx);
      } else {
        const pCenterX = player.x + player.width / 2;
        const pCenterY = player.y + player.height * 0.58;
        const closestEnemy = getClosestActiveEnemy(pCenterX, pCenterY);
        if (closestEnemy && closestEnemy.entity) {
          player.facing = closestEnemy.x >= pCenterX ? 1 : -1;
          shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
          const dx = closestEnemy.x - shootOriginX;
          const dy = closestEnemy.y - shootOriginY;
          const dist = Math.hypot(dx, dy) || 1;
          bVx = (dx / dist) * speed;
          bVy = (dy / dist) * speed;
          bAngle = Math.atan2(dy, dx);
        } else {
          shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
          bVx = player.facing * speed;
          bVy = (Math.random() - 0.5) * 1.5;
          bAngle = player.facing > 0 ? 0 : Math.PI;
        }
      }

      const specialBullet = {
        isPlayerBullet: true,
        isSkillBullet: true,
        isSpecialBullet: true,
        isPiercing: true,
        isCrit: isCrit,
        type: 'mg_special_bullet',
        phase: phase,
        isBerserk: isBerserk,
        x: shootOriginX,
        y: shootOriginY,
        vx: bVx,
        vy: bVy,
        angle: bAngle,
        dmg: finalDmg,
        color: isCrit ? '#fae8ff' : bulletColor,
        size: bulletSize,
        life: 130
      };
      bullets.push(specialBullet);

      // [선도부장] 난사 시 폭풍 비산 이펙트 (탄피 배출, 플라즈마 스파크, 지면 분진)
      // 1) 달아오른 황금/보라빛 탄피 초고속 배출 (상공 및 후방으로 회전하며 튕겨 나감)
      specialParticles.push({
        type: 'casing',
        x: player.x + (player.facing > 0 ? player.width * 0.45 : player.width * 0.55),
        y: shootOriginY - 4,
        vx: -player.facing * (Math.random() * 4.5 + 3.2),
        vy: -(Math.random() * 5.5 + 4.5),
        gravity: 0.48,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.6,
        width: 7,
        height: 3.5,
        color: isBerserk ? '#fde047' : '#facc15',
        life: 42,
        maxLife: 42,
        alpha: 1
      });

      // 2) 총구 전방 사방으로 격렬하게 튀어 오르는 보라빛 네온 플라즈마 스파크
      const sparkCount = isBerserk ? 6 : (phase === 2 ? 4 : 3);
      for (let s = 0; s < sparkCount; s++) {
        const sAngle = bAngle + (Math.random() - 0.5) * 0.65;
        const sSpeed = Math.random() * 15 + 10;
        specialParticles.push({
          type: 'spark',
          x: shootOriginX + (Math.random() - 0.5) * 6,
          y: shootOriginY + (Math.random() - 0.5) * 6,
          vx: Math.cos(sAngle) * sSpeed,
          vy: Math.sin(sAngle) * sSpeed,
          color: isBerserk ? (Math.random() < 0.5 ? '#ffffff' : '#f5d0fe') : (Math.random() < 0.4 ? '#ffffff' : bulletColor),
          size: Math.random() * 2.5 + 1.5,
          life: Math.floor(Math.random() * 12 + 10),
          maxLife: 22,
          alpha: 1
        });
      }

      // 3) 총구 및 발밑 지면 반동 분진 충격파
      if (Math.random() < 0.75) {
        specialParticles.push({
          type: 'dust',
          x: player.x + player.width / 2 + (Math.random() - 0.5) * 24,
          y: groundY - 2,
          vx: -player.facing * (Math.random() * 3 + 1),
          vy: -(Math.random() * 1.5 + 0.5),
          size: Math.random() * 5 + 3,
          color: isBerserk ? 'rgba(217, 70, 239, 0.45)' : 'rgba(192, 132, 252, 0.35)',
          life: 20,
          maxLife: 20,
          alpha: 1
        });
      }

      if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
        sendNetPacket({
          type: 'SYNC',
          bulletEvent: specialBullet
        });
      }
    }

    // 가장 가까운 활성 카이텐저 보스 탐색 함수
    function getClosestActiveEnemy(fromX, fromY) {
      let closest = null;
      let minD = Infinity;

      // 1페이즈 카이텐저 5인 검색
      kaitenzers.forEach(k => {
        if (k.isSpawned && !k.isDead && !k.isRetreating) {
          const kX = k.x + k.size / 2;
          const kY = (canvas.height - GROUND_OFFSET) - (k.jumpY || 0) - k.size / 2;
          const d = Math.hypot(kX - fromX, kY - fromY);
          if (d < minD) {
            minD = d;
            closest = { entity: k, x: kX, y: kY, dist: d, width: k.size, height: k.size };
          }
        }
      });

      // 2페이즈 KAITEN FX Mk.0 거대 보스 검색 (등장 중이거나 준비 완료 상태 모두 타겟팅 가능)
      if (typeof kaitenFx !== 'undefined' && kaitenFx.isSpawned && !kaitenFx.isDead && kaitenFx.introState !== 'none') {
        const fxX = kaitenFx.x + kaitenFx.width / 2;
        const fxY = (canvas.height - GROUND_OFFSET) - kaitenFx.height / 2;
        const d = Math.hypot(fxX - fromX, fxY - fromY);
        if (d < minD) {
          minD = d;
          closest = { entity: kaitenFx, x: fxX, y: fxY, dist: d, width: kaitenFx.width, height: kaitenFx.height };
        }
      }

      return closest;
    }

    // 아비 에슈흐 코스트 0 도달 시 파이널 피니셔 준비 상태 돌입 검사
    function checkAbiCostZero() {
      if (!player.isAbiEshuhActive) return;
      if (player.cost <= 0 && !player.abiFinalReady && player.abiFinalPhase === 'none') {
        player.cost = 0;
        player.abiFinalReady = true;
        player.abiFinalDelayTimer = 1.0;
        player.abiFinalCanTrigger = false;
        addDamageText(player.x, player.y - 40, '⚡ 에너지 전소! 1초 후 파이널 준비 완료', '#00ffff');
      }
    }

    // [아비 에슈흐 평타 (Z/J)]: 단타 관통 레이저 발사 (1~3코스트, 5,000/8,500/12,000)
    function fireAbiNormalLaser() {
      if (!player.isAbiEshuhActive) return;
      if (!player.abiNormalCharging) return;
      player.abiNormalCharging = false;
      const chargeTime = player.abiNormalChargeTimer;
      player.abiNormalChargeTimer = 0;

      if (player.abiFinalReady || player.abiFinalPhase !== 'none' || player.abiStunTimer > 0) return;

      let stage = 1;
      let costReq = 1;
      let baseDmg = 5000;
      let range = 280; // 1단계: 샷건 400px의 약 2/3 (단거리)
      let beamThick = 18;

      if (chargeTime >= 0.6) {
        stage = 3;
        costReq = 3;
        baseDmg = 12000;
        range = 3500; // 장거리 전장 관통
        beamThick = 34;
      } else if (chargeTime >= 0.3) {
        stage = 2;
        costReq = 2;
        baseDmg = 8500;
        range = 750; // 중거리
        beamThick = 26;
      }

      if (player.cost < costReq) {
        if (player.cost <= 0) {
          checkAbiCostZero();
          return;
        }
        costReq = Math.max(1, Math.floor(player.cost));
        if (costReq === 1) { stage = 1; baseDmg = 5000; range = 280; }
        else if (costReq === 2) { stage = 2; baseDmg = 8500; range = 750; }
      }

      spendPlayerCost(costReq);

      baseDmg = calcPlayerAttackDamage(baseDmg);
      // [전투 스탯 엔진] 치명타 및 치명 대미지 연산
      const isCrit = checkCritSuccess(player.crit, 100);
      const critMult = calculateCritDamageMultiplier(player.critDmg, 50, 0);
      const finalDmg = isCrit ? Math.round(baseDmg * critMult) : baseDmg;

      // 가장 가까운 적 탐색 및 조준 방향 갱신
      const pCenterX = player.x + player.width / 2;
      const pCenterY = player.y + player.height / 2;
      const closest = getClosestActiveEnemy(pCenterX, pCenterY);
      if (closest) {
        player.facing = closest.x >= pCenterX ? 1 : -1;
      }

      const muzzleOffset = 65;
      const shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
      const shootOriginY = player.y + player.height * 0.54;

      let aimAngle = player.facing > 0 ? 0 : Math.PI;
      if (closest) {
        aimAngle = Math.atan2(closest.y - shootOriginY, closest.x - shootOriginX);
      }

      const laserSpeed = 46;
      const laserBullet = {
        isPlayerBullet: true,
        isSkillBullet: true,
        isPiercing: true,
        isCrit: isCrit,
        type: 'abi_laser',
        stage: stage,
        x: shootOriginX,
        y: shootOriginY,
        vx: Math.cos(aimAngle) * laserSpeed,
        vy: Math.sin(aimAngle) * laserSpeed,
        angle: aimAngle,
        dmg: finalDmg,
        color: isCrit ? '#ffffff' : (stage === 3 ? '#00ffff' : (stage === 2 ? '#38bdf8' : '#7dd3fc')),
        size: beamThick,
        range: range,
        maxRange: range,
        distTraveled: 0,
        life: Math.max(10, Math.round(range / laserSpeed))
      };
      bullets.push(laserBullet);

      player.mainWeapon.flashTimer = 0.08;
      for (let s = 0; s < 5; s++) {
        specialParticles.push({
          type: 'spark',
          x: shootOriginX,
          y: shootOriginY,
          vx: Math.cos(aimAngle) * (Math.random() * 12 + 8),
          vy: Math.sin(aimAngle) * (Math.random() * 12 + 8) + (Math.random() - 0.5) * 6,
          color: '#38bdf8',
          size: Math.random() * 2.5 + 1.5,
          life: 16,
          maxLife: 16,
          alpha: 1
        });
      }

      if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
        sendNetPacket({ type: 'SYNC', bulletEvent: laserBullet });
      }

      checkAbiCostZero();
      updateWeaponHUD();
    }

    // [아비 에슈흐 1스킬 (X/Q)]: 용기의 마법 (유도 미사일 4발, 6코스트, 발당 7,500)
    function fireAbiMissiles() {
      if (!player.isAbiEshuhActive) return;
      if (player.abiFinalReady || player.abiFinalPhase !== 'none' || player.abiStunTimer > 0) return;

      // 발사 시 가장 가까운 적을 향해 즉시 방향 전환
      const pCenterX = player.x + player.width / 2;
      const pCenterY = player.y + player.height / 2;
      const closest = getClosestActiveEnemy(pCenterX, pCenterY);
      if (closest) {
        player.facing = closest.x >= pCenterX ? 1 : -1;
      }

      const now = Date.now();
      player.abiMissileHistory = (player.abiMissileHistory || []).filter(t => now - t <= 1200);

      if (player.abiMissileCooldown > 0) {
        addDamageText(player.x, player.y - 25, `⚠️ 오버히트 딜레이 (${player.abiMissileCooldown.toFixed(1)}s)`, '#ef4444');
        return;
      }

      if (player.cost < 6) {
        addDamageText(player.x, player.y - 25, `코스트 부족! (6 필요 / 현재 ${Math.floor(player.cost)})`, '#ef4444');
        checkAbiCostZero();
        return;
      }

      spendPlayerCost(6);
      player.abiMissileHistory.push(now);

      if (player.abiMissileHistory.length >= 3) {
        player.abiMissileCooldown = 2.0;
        addDamageText(player.x, player.y - 35, '⚠️ 3연발 달성! 오버히트 2.0s', '#f59e0b');
      }

      const activePassives = [playerLoadout.slot3.id, playerLoadout.slot4.id, playerLoadout.slot5.id];
      let baseDmg = calcPlayerAttackDamage(7500);
      const isCrit = checkCritSuccess(player.crit, 100);
      const critMult = calculateCritDamageMultiplier(player.critDmg, 50, 0);
      const finalDmg = isCrit ? Math.round(baseDmg * critMult) : baseDmg;

      // 4연장 미사일 (좌/우 날개 포드에서 2발씩 총 4발이 하늘로 높이 솟구쳤다가 적을 향해 급강하 호밍)
      const wingOffsets = [
        { x: -16, y: -22, vx: -player.facing * 5, vy: -15 },
        { x: -8,  y: -26, vx: -player.facing * 2.5, vy: -18 },
        { x: 8,   y: -26, vx: player.facing * 2.5,  vy: -18 },
        { x: 16,  y: -22, vx: player.facing * 5,  vy: -15 }
      ];

      wingOffsets.forEach(w => {
        const mX = player.x + player.width / 2 + w.x * player.facing;
        const mY = player.y + player.height * 0.35 + w.y;
        const missile = {
          isPlayerBullet: true,
          isSkillBullet: true,
          isCrit: isCrit,
          type: 'abi_missile',
          x: mX,
          y: mY,
          vx: w.vx,
          vy: w.vy,
          angle: Math.atan2(w.vy, w.vx),
          targetKaiten: closest ? closest.entity : null,
          dmg: finalDmg,
          color: isCrit ? '#ffffff' : '#38bdf8',
          size: 7,
          life: 180
        };
        bullets.push(missile);
        if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
          sendNetPacket({ type: 'SYNC', bulletEvent: missile });
        }
      });

      addDamageText(player.x, player.y - 30, '🚀 [용기의 마법] 4연장 미사일 사출!', '#38bdf8');
      checkAbiCostZero();
      updateWeaponHUD();
    }

    // [아비 에슈흐 2스킬 (C/E)]: 빛의 난사 (10코스트, 3초간 50도 부채꼴 4:1 난사)
    function fireAbiBarrage() {
      if (!player.isAbiEshuhActive) return;
      if (player.abiFinalReady || player.abiFinalPhase !== 'none' || player.abiStunTimer > 0) return;
      if (player.abiBarrageFiring) return;

      if (player.cost < 10) {
        addDamageText(player.x, player.y - 25, `코스트 부족! (10 필요 / 현재 ${Math.floor(player.cost)})`, '#ef4444');
        checkAbiCostZero();
        return;
      }

      // 발사 시 가장 가까운 적을 향해 즉시 방향 전환
      const pCenterX = player.x + player.width / 2;
      const pCenterY = player.y + player.height / 2;
      const closest = getClosestActiveEnemy(pCenterX, pCenterY);
      if (closest) {
        player.facing = closest.x >= pCenterX ? 1 : -1;
      }

      spendPlayerCost(10);
      player.abiBarrageFiring = true;
      player.abiBarrageTimer = 3.0;
      player.abiBarrageShotTimer = 0;
      addDamageText(player.x, player.y - 35, '✨ [빛의 난사] 3초간 부채꼴 연사 개시!', '#00ffff');
      checkAbiCostZero();
      updateWeaponHUD();
    }

    // 빛의 난사 단발 탄환 생성 (일반탄 4,500 / 강화탄 9,500, 4:1 비율)
    function fireSingleBarrageBullet(isEnhanced) {
      const activePassives = [playerLoadout.slot3.id, playerLoadout.slot4.id, playerLoadout.slot5.id];
      let baseDmg = calcPlayerAttackDamage(isEnhanced ? 9500 : 4500);
      // [전투 스탯 엔진] 치명타 및 치명 대미지 연산
      const isCrit = checkCritSuccess(player.crit, 100);
      const critMult = calculateCritDamageMultiplier(player.critDmg, 50, 0);
      const finalDmg = isCrit ? Math.round(baseDmg * critMult) : baseDmg;

      // 발사 순간 가장 가까운 적을 추적하여 조준각 및 몸체 방향 동기화
      const pCenterX = player.x + player.width / 2;
      const pCenterY = player.y + player.height / 2;
      const closest = getClosestActiveEnemy(pCenterX, pCenterY);
      if (closest) {
        player.facing = closest.x >= pCenterX ? 1 : -1;
      }

      const muzzleOffset = 62;
      const shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
      const shootOriginY = player.y + player.height * 0.54 + (Math.random() - 0.5) * 6;

      // 가장 가까운 적을 향하는 중심 각도 산출
      let baseAngle = player.facing > 0 ? 0 : Math.PI;
      if (closest) {
        baseAngle = Math.atan2(closest.y - shootOriginY, closest.x - shootOriginX);
      }

      // 부채꼴 50도 각도 확산 (±25도)
      const spreadAngle = (Math.random() - 0.5) * (50 * Math.PI / 180);
      const finalAngle = baseAngle + spreadAngle;
      const speed = isEnhanced ? 42 : 38;

      const bullet = {
        isPlayerBullet: true,
        isSkillBullet: true,
        isCrit: isCrit,
        type: isEnhanced ? 'abi_enhanced_bullet' : 'abi_bullet',
        isPiercing: isEnhanced, // 강화탄은 관통!
        x: shootOriginX,
        y: shootOriginY,
        vx: Math.cos(finalAngle) * speed,
        vy: Math.sin(finalAngle) * speed,
        angle: finalAngle,
        dmg: finalDmg,
        color: isCrit ? '#ffffff' : (isEnhanced ? '#00ffff' : '#38bdf8'),
        size: isEnhanced ? 11 : 7,
        life: 120
      };
      bullets.push(bullet);

      player.mainWeapon.flashTimer = 0.04;
      if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
        sendNetPacket({ type: 'SYNC', bulletEvent: bullet });
      }
    }

    // 아비 에슈흐 미사일 폭발 처리 함수
    function triggerAbiMissileExplosion(x, y, dmg) {
      explosions.push({
        x: x,
        y: y,
        radius: 12,
        maxRadius: 75,
        dmg: dmg,
        hasDealtDamage: true, // 아군 미사일 폭발이므로 플레이어에게 스플래시 피해를 주지 않도록 즉시 true 처리
        isFriendly: true,
        color: '#38bdf8',
        alpha: 1
      });
      let hitCount = 0;
      kaitenzers.forEach(k => {
        if (k.isSpawned && !k.isDead && !k.isRetreating) {
          const kCenterX = k.x + k.size / 2;
          const kCenterY = (canvas.height - GROUND_OFFSET) - (k.jumpY || 0) - k.size / 2;
          const d = Math.hypot(kCenterX - x, kCenterY - y);
          if (d <= 80) {
            applyKaitenzerSharedDamage(dmg);
            if (currentMode === 'duo' && myRole === 'guest_striker' && typeof sendNetPacket === 'function') {
              sendNetPacket({
                type: 'ENEMY_DAMAGE',
                targetType: 'kaiten',
                targetId: k.id,
                damage: dmg,
                isCrit: false
              });
            }
            hitCount++;
            if (hitCount <= 2) {
              addDamageText(kCenterX, kCenterY - 25, `💥 -${dmg}`, '#00ffff');
            }
          }
        }
      });

      // 2페이즈 KAITEN FX Mk.0 스플래시 피해 적용
      if (typeof kaitenFx !== 'undefined' && kaitenFx.isSpawned && !kaitenFx.isDead && kaitenFx.introState !== 'none') {
        const fxCenterX = kaitenFx.x + kaitenFx.width / 2;
        const fxCenterY = (canvas.height - GROUND_OFFSET) - kaitenFx.height / 2;
        const d = Math.hypot(fxCenterX - x, fxCenterY - y);
        if (d <= 140) {
          let dmgMult = kaitenFx.shieldActive ? 0.5 : 1.0;
          if (kaitenFx.shieldActive) {
            kaitenFx.shieldHitCount = (kaitenFx.shieldHitCount || 0) + 1;
            if (kaitenFx.shieldHitCount >= 15) {
              kaitenFx.shieldActive = false;
              addDamageText(fxCenterX, (canvas.height - GROUND_OFFSET) - 180, '🛡️ [SHIELD BREAK] 실드 가드 파괴!', '#22c55e');
            }
          }
          const finalExplosionDmg = Math.round(dmg * dmgMult);
          kaitenFx.hp = Math.max(0, kaitenFx.hp - finalExplosionDmg);
          if (currentMode === 'duo' && myRole === 'guest_striker' && typeof sendNetPacket === 'function') {
            sendNetPacket({
              type: 'ENEMY_DAMAGE',
              targetType: 'kaiten_fx',
              targetId: 'kaiten_fx',
              damage: finalExplosionDmg,
              isCrit: false,
              part: kaitenFx.activePart
            });
          }
          if (kaitenFx.activePart && kaitenFx.parts[kaitenFx.activePart] && !kaitenFx.parts[kaitenFx.activePart].isBroken) {
            const curPart = kaitenFx.parts[kaitenFx.activePart];
            curPart.hp = Math.max(0, curPart.hp - finalExplosionDmg);
            if (curPart.hp <= 0) {
              curPart.hp = 0;
              curPart.isBroken = true;
              addDamageText(fxCenterX, (canvas.height - GROUND_OFFSET) - 220, `💥 [${curPart.name}] 파괴 완료!`, curPart.color);
            }
          }
          addDamageText(fxCenterX, fxCenterY - 30, `💥 -${finalExplosionDmg.toLocaleString()}`, '#00ffff');
          if (kaitenFx.hp <= 0) {
            kaitenFx.hp = 0;
            kaitenFx.isDead = true;
            addDamageText(fxCenterX, (canvas.height - GROUND_OFFSET) - 250, '🎉 KAITEN FX Mk.0 격파 성공! MISSION COMPLETE!', '#10b981');
          }
        }
      }
    }

    // [WHITE FANG 465] 화력 지원 드론 소환 함수
    function spawnWhiteFangDrone() {
      window.whiteFangDrones = window.whiteFangDrones || [];
      const dX = player.x + (player.facing > 0 ? 45 : -45);
      const dY = player.y - 38;
      const drone = {
        x: dX,
        y: dY,
        facing: player.facing,
        duration: 2.2,
        timer: 2.2,
        fireTimer: 0.0, // 소환 즉시 0초에 첫 발 사출!
        fireInterval: 0.10, // 정확히 0.10초마다 1발 발사 (초당 10발)
        shotsFired: 0,
        maxShots: 20, // 총 20발
        podAlternator: 0,
        flashTimer: 0,
        baseDmg: 300 * 6, // 공격력의 600% = 1,800
        id: Date.now() + Math.random()
      };
      window.whiteFangDrones.push(drone);

      // 소환 시 워프/배치 파티클
      for (let i = 0; i < 14; i++) {
        specialParticles.push({
          type: 'spark',
          x: dX + (Math.random() - 0.5) * 24,
          y: dY + (Math.random() - 0.5) * 24,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          color: Math.random() < 0.6 ? '#06b6d4' : '#ffffff',
          size: Math.random() * 3 + 2,
          life: 16,
          maxLife: 16,
          alpha: 1
        });
      }

      if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
        sendNetPacket({
          type: 'SYNC',
          droneEvent: { action: 'spawn', x: dX, y: dY, facing: player.facing }
        });
      }
    }

    // [WHITE FANG 465] 화력 지원 드론 미사일 폭발 처리 함수
    function triggerWhiteFangMissileExplosion(x, y, dmg) {
      explosions.push({
        x: x,
        y: y,
        radius: 10,
        maxRadius: 65,
        dmg: dmg,
        hasDealtDamage: true, // 아군 미사일 폭발
        isFriendly: true,
        color: '#06b6d4',
        alpha: 1
      });
      let hitCount = 0;
      kaitenzers.forEach(k => {
        if (k.isSpawned && !k.isDead && !k.isRetreating) {
          const kCenterX = k.x + k.size / 2;
          const kCenterY = (canvas.height - GROUND_OFFSET) - (k.jumpY || 0) - k.size / 2;
          const d = Math.hypot(kCenterX - x, kCenterY - y);
          if (d <= 75) {
            applyKaitenzerSharedDamage(dmg);
            if (currentMode === 'duo' && myRole === 'guest_striker' && typeof sendNetPacket === 'function') {
              sendNetPacket({
                type: 'ENEMY_DAMAGE',
                targetType: 'kaiten',
                targetId: k.id,
                damage: dmg,
                isCrit: false
              });
            }
            hitCount++;
            if (hitCount <= 2) {
              addDamageText(kCenterX, kCenterY - 25, `💥 -${dmg}`, '#06b6d4');
            }
            if (k.isDead) {
              addDamageText(kCenterX, (canvas.height - GROUND_OFFSET) - k.size - 25, `💀 [카이텐저 전원 격파!]`, '#94a3b8');
            }
          }
        }
      });

      // 2페이즈 KAITEN FX Mk.0 거대 보스 폭발 피해
      if (typeof kaitenFx !== 'undefined' && kaitenFx.isSpawned && !kaitenFx.isDead && kaitenFx.introState !== 'none') {
        const fxCenterX = kaitenFx.x + kaitenFx.width / 2;
        const fxCenterY = (canvas.height - GROUND_OFFSET) - kaitenFx.height / 2;
        const d = Math.hypot(fxCenterX - x, fxCenterY - y);
        if (d <= 140) {
          let dmgMult = kaitenFx.shieldActive ? 0.5 : 1.0;
          if (kaitenFx.shieldActive) {
            kaitenFx.shieldHitCount = (kaitenFx.shieldHitCount || 0) + 1;
            if (kaitenFx.shieldHitCount >= 15) {
              kaitenFx.shieldActive = false;
              addDamageText(fxCenterX, (canvas.height - GROUND_OFFSET) - 180, '🛡️ [SHIELD BREAK] 실드 가드 파괴!', '#22c55e');
            }
          }
          const finalExplosionDmg = Math.round(dmg * dmgMult);
          kaitenFx.hp = Math.max(0, kaitenFx.hp - finalExplosionDmg);
          if (currentMode === 'duo' && myRole === 'guest_striker' && typeof sendNetPacket === 'function') {
            sendNetPacket({
              type: 'ENEMY_DAMAGE',
              targetType: 'kaiten_fx',
              targetId: 'kaiten_fx',
              damage: finalExplosionDmg,
              isCrit: false,
              part: kaitenFx.activePart
            });
          }
          if (kaitenFx.activePart && kaitenFx.parts[kaitenFx.activePart] && !kaitenFx.parts[kaitenFx.activePart].isBroken) {
            const curPart = kaitenFx.parts[kaitenFx.activePart];
            curPart.hp = Math.max(0, curPart.hp - finalExplosionDmg);
            if (curPart.hp <= 0) {
              curPart.hp = 0;
              curPart.isBroken = true;
              addDamageText(fxCenterX, (canvas.height - GROUND_OFFSET) - 220, `💥 [${curPart.name}] 파괴 완료!`, curPart.color);
            }
          }
          addDamageText(fxCenterX + (Math.random() - 0.5) * 40, (canvas.height - GROUND_OFFSET) - 170, `💥 -${finalExplosionDmg.toLocaleString()}`, '#06b6d4');
          if (kaitenFx.hp <= 0) {
            kaitenFx.hp = 0;
            kaitenFx.isDead = true;
            addDamageText(fxCenterX, (canvas.height - GROUND_OFFSET) - 250, '🎉 KAITEN FX Mk.0 격파 성공! MISSION COMPLETE!', '#10b981');
          }
        }
      }
    }

    // [WHITE FANG 465] 라이딩 그레네이드 투척 함수 (3코스트, 공격력 630% 범위 피해, 10초간 공격력 30% 감소)
    function throwRidingGrenade() {
      const activePassives = [playerLoadout.slot3.id, playerLoadout.slot4.id, playerLoadout.slot5.id];
      let baseDmg = calcPlayerAttackDamage(Math.round(300 * 6.30)); // 300 * 630% = 1,890

      const isCrit = checkCritSuccess(player.crit, 100);
      const critMult = calculateCritDamageMultiplier(player.critDmg, 50, 0);
      const finalDmg = isCrit ? Math.round(baseDmg * critMult) : baseDmg;

      const groundY = canvas.height - GROUND_OFFSET;
      const muzzleOffset = 40;
      const shootOriginX = player.x + (player.facing > 0 ? player.width + muzzleOffset : -muzzleOffset);
      const shootOriginY = player.y + player.height * 0.5;

      const throwVx = player.facing * 9.5;
      const throwVy = -5.0; // 자연스럽고 완만한 포물선 투척

      const grenadeBullet = {
        isPlayerBullet: true,
        isCrit: isCrit,
        type: 'riding_grenade',
        x: shootOriginX,
        y: shootOriginY,
        vx: throwVx,
        vy: throwVy,
        gravity: 0.28,
        dmg: finalDmg,
        color: isCrit ? '#fef08a' : '#06b6d4',
        size: 11,
        life: 120
      };
      bullets.push(grenadeBullet);

      if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
        sendNetPacket({
          type: 'SYNC',
          bulletEvent: grenadeBullet
        });
      }
    }

    // [WHITE FANG 465] 라이딩 그레네이드 폭발 처리 (범위 피해 및 공격력 -30% 디버프 부여)
    function triggerRidingGrenadeExplosion(x, y, dmg) {
      explosions.push({
        x: x,
        y: y,
        radius: 12,
        maxRadius: 100, // 넓은 폭발 반경
        dmg: dmg,
        hasDealtDamage: true,
        isFriendly: true,
        color: '#06b6d4',
        alpha: 1
      });

      kaitenzers.forEach(k => {
        if (k.isSpawned && !k.isDead && !k.isRetreating) {
          const kCenterX = k.x + k.size / 2;
          const kCenterY = (canvas.height - GROUND_OFFSET) - (k.jumpY || 0) - k.size / 2;
          const d = Math.hypot(kCenterX - x, kCenterY - y);
          if (d <= 110) {
            // 1) 630% 범위 대미지 적용
            applyKaitenzerSharedDamage(dmg);
            addDamageText(kCenterX, kCenterY - 25, `💥 -${dmg}`, '#06b6d4');

            // 2) 공격력 30% 감소 디버프 부여 (10초 지속)
            k.atkDebuffTimer = 10.0;
            k.atkDebuffRatio = 0.30;
            if (currentMode === 'duo' && myRole === 'guest_striker' && typeof sendNetPacket === 'function') {
              sendNetPacket({
                type: 'ENEMY_DAMAGE',
                targetType: 'kaiten',
                targetId: k.id,
                damage: dmg,
                isCrit: false,
                atkDebuffRatio: 0.30,
                atkDebuffTimer: 10.0
              });
            }
            addDamageText(kCenterX, kCenterY - 45, `🔻 [ATK -30%]`, '#38bdf8');

            if (k.isDead) {
              addDamageText(kCenterX, (canvas.height - GROUND_OFFSET) - k.size - 25, `💀 [카이텐저 전원 격파!]`, '#94a3b8');
            }
          }
        }
      });

      // 2페이즈 KAITEN FX Mk.0 거대 보스 폭발 피해 및 공격력 -30% 디버프
      if (typeof kaitenFx !== 'undefined' && kaitenFx.isSpawned && !kaitenFx.isDead && kaitenFx.introState !== 'none') {
        const fxCenterX = kaitenFx.x + kaitenFx.width / 2;
        const fxCenterY = (canvas.height - GROUND_OFFSET) - kaitenFx.height / 2;
        const d = Math.hypot(fxCenterX - x, fxCenterY - y);
        if (d <= 170) {
          let dmgMult = kaitenFx.shieldActive ? 0.5 : 1.0;
          if (kaitenFx.shieldActive) {
            kaitenFx.shieldHitCount = (kaitenFx.shieldHitCount || 0) + 1;
            if (kaitenFx.shieldHitCount >= 15) {
              kaitenFx.shieldActive = false;
              addDamageText(fxCenterX, (canvas.height - GROUND_OFFSET) - 180, '🛡️ [SHIELD BREAK] 실드 가드 파괴!', '#22c55e');
            }
          }
          const finalExplosionDmg = Math.round(dmg * dmgMult);
          kaitenFx.hp = Math.max(0, kaitenFx.hp - finalExplosionDmg);
          if (currentMode === 'duo' && myRole === 'guest_striker' && typeof sendNetPacket === 'function') {
            sendNetPacket({
              type: 'ENEMY_DAMAGE',
              targetType: 'kaiten_fx',
              targetId: 'kaiten_fx',
              damage: finalExplosionDmg,
              isCrit: false,
              part: kaitenFx.activePart,
              atkDebuffRatio: 0.30,
              atkDebuffTimer: 10.0
            });
          }
          if (kaitenFx.activePart && kaitenFx.parts[kaitenFx.activePart] && !kaitenFx.parts[kaitenFx.activePart].isBroken) {
            const curPart = kaitenFx.parts[kaitenFx.activePart];
            curPart.hp = Math.max(0, curPart.hp - finalExplosionDmg);
            if (curPart.hp <= 0) {
              curPart.hp = 0;
              curPart.isBroken = true;
              addDamageText(fxCenterX, (canvas.height - GROUND_OFFSET) - 220, `💥 [${curPart.name}] 파괴 완료!`, curPart.color);
            }
          }
          addDamageText(fxCenterX + (Math.random() - 0.5) * 40, (canvas.height - GROUND_OFFSET) - 170, `💥 -${finalExplosionDmg.toLocaleString()}`, '#06b6d4');
          // 10초간 공격력 30% 감소 디버프 부여
          kaitenFx.atkDebuffTimer = 10.0;
          kaitenFx.atkDebuffRatio = 0.30;
          addDamageText(fxCenterX, (canvas.height - GROUND_OFFSET) - 210, '🔻 [ATK -30%]', '#38bdf8');

          if (kaitenFx.hp <= 0) {
            kaitenFx.hp = 0;
            kaitenFx.isDead = true;
            addDamageText(fxCenterX, (canvas.height - GROUND_OFFSET) - 250, '🎉 KAITEN FX Mk.0 격파 성공! MISSION COMPLETE!', '#10b981');
          }
        }
      }
    }

    // [색채: 수류탄 투척·개(改)] 폭발 처리 (550% 광역 피해 및 암회색 연막 폭발)
    function triggerColorGrenadeExplosion(x, y, dmg) {
      explosions.push({
        x: x,
        y: y,
        radius: 14,
        maxRadius: 110,
        dmg: dmg,
        hasDealtDamage: true,
        isFriendly: true,
        color: '#334155',
        alpha: 1
      });

      // 흑회색 폭발 연기 파티클
      for (let p = 0; p < 25; p++) {
        specialParticles.push({
          type: 'spark',
          x: x + (Math.random() - 0.5) * 35,
          y: y + (Math.random() - 0.5) * 35,
          vx: (Math.random() - 0.5) * 11,
          vy: -(Math.random() * 8 + 3),
          color: Math.random() < 0.5 ? '#1e293b' : (Math.random() < 0.8 ? '#475569' : '#94a3b8'),
          size: Math.random() * 4 + 2,
          life: 22,
          maxLife: 22,
          alpha: 1
        });
      }

      kaitenzers.forEach(k => {
        if (k.isSpawned && !k.isDead && !k.isRetreating) {
          const kCenterX = k.x + k.size / 2;
          const kCenterY = (canvas.height - GROUND_OFFSET) - (k.jumpY || 0) - k.size / 2;
          const d = Math.hypot(kCenterX - x, kCenterY - y);
          if (d <= 120) {
            applyKaitenzerSharedDamage(dmg);
            if (currentMode === 'duo' && myRole === 'guest_striker' && typeof sendNetPacket === 'function') {
              sendNetPacket({
                type: 'ENEMY_DAMAGE',
                targetType: 'kaiten',
                targetId: k.id,
                damage: dmg,
                isCrit: false
              });
            }
            addDamageText(kCenterX, kCenterY - 25, `💥 -${dmg.toLocaleString()}`, '#94a3b8');

            if (k.isDead) {
              addDamageText(kCenterX, (canvas.height - GROUND_OFFSET) - k.size - 25, `💀 [카이텐저 전원 격파!]`, '#94a3b8');
            }
          }
        }
      });

      // 2페이즈 KAITEN FX Mk.0 거대 보스 폭발 피해
      if (typeof kaitenFx !== 'undefined' && kaitenFx.isSpawned && !kaitenFx.isDead && kaitenFx.introState !== 'none') {
        const fxCenterX = kaitenFx.x + kaitenFx.width / 2;
        const fxCenterY = (canvas.height - GROUND_OFFSET) - kaitenFx.height / 2;
        const d = Math.hypot(fxCenterX - x, fxCenterY - y);
        if (d <= 180) {
          let dmgMult = kaitenFx.shieldActive ? 0.5 : 1.0;
          if (kaitenFx.shieldActive) {
            kaitenFx.shieldHitCount = (kaitenFx.shieldHitCount || 0) + 1;
            if (kaitenFx.shieldHitCount >= 15) {
              kaitenFx.shieldActive = false;
              addDamageText(fxCenterX, (canvas.height - GROUND_OFFSET) - 180, '🛡️ [SHIELD BREAK] 실드 가드 파괴!', '#22c55e');
            }
          }
          const finalExplosionDmg = Math.round(dmg * dmgMult);
          kaitenFx.hp = Math.max(0, kaitenFx.hp - finalExplosionDmg);
          if (currentMode === 'duo' && myRole === 'guest_striker' && typeof sendNetPacket === 'function') {
            sendNetPacket({
              type: 'ENEMY_DAMAGE',
              targetType: 'kaiten_fx',
              targetId: 'kaiten_fx',
              damage: finalExplosionDmg,
              isCrit: false,
              part: kaitenFx.activePart
            });
          }
          if (kaitenFx.activePart && kaitenFx.parts[kaitenFx.activePart] && !kaitenFx.parts[kaitenFx.activePart].isBroken) {
            const curPart = kaitenFx.parts[kaitenFx.activePart];
            curPart.hp = Math.max(0, curPart.hp - finalExplosionDmg);
            if (curPart.hp <= 0) {
              curPart.hp = 0;
              curPart.isBroken = true;
              addDamageText(fxCenterX, (canvas.height - GROUND_OFFSET) - 220, `💥 [${curPart.name}] 파괴 완료!`, curPart.color);
            }
          }
          addDamageText(fxCenterX + (Math.random() - 0.5) * 40, (canvas.height - GROUND_OFFSET) - 170, `💥 -${finalExplosionDmg.toLocaleString()}`, '#94a3b8');
          if (kaitenFx.hp <= 0) {
            kaitenFx.hp = 0;
            kaitenFx.isDead = true;
            addDamageText(fxCenterX, (canvas.height - GROUND_OFFSET) - 250, '🎉 KAITEN FX Mk.0 격파 성공! MISSION COMPLETE!', '#10b981');
          }
        }
      }
    }

    // [플레이어 피해 및 사망/색채 각성/침착한 호흡 통합 처리]
    function applyDamageToPlayer(amount, textColor, isExplosion = false) {
      if (player.isImmortalActive) {
        addDamageText(player.x + 20, player.y - 20, 'IMMORTAL (무적)', '#ef4444');
        return;
      }

      // [소속 패시브: 밀레니엄 받는 피해 2% 감소 등]
      if (player.affiliationDmgTakenMult && player.affiliationDmgTakenMult !== 1.0) {
        amount = Math.round(amount * player.affiliationDmgTakenMult);
      }

      // [FOX 45식: 전술 보호막 흡수 & 피격 시 잃은 체력 5% 자가 재생]
      if (player.isTacticalDefActive && player.tacticalShield > 0) {
        const lostShield = Math.max(0, player.tacticalShieldMax - player.tacticalShield);
        if (lostShield > 0) {
          const regen = Math.round(lostShield * 0.05);
          player.tacticalShield = Math.min(player.tacticalShieldMax, player.tacticalShield + regen);
          addDamageText(player.x - 20, player.y - 35, `🛡️ 방패 재생 +${regen}`, '#38bdf8');
        }
        const absorbed = Math.min(player.tacticalShield, amount);
        player.tacticalShield -= absorbed;
        amount -= absorbed;
        addDamageText(player.x + 20, player.y - 30, `🛡️ 전술방패 -${absorbed}`, '#06b6d4');
        if (player.tacticalShield <= 0) {
          player.tacticalShield = 0;
          player.isTacticalDefActive = false;
          player.tacticalShieldTimer = 0;
          addDamageText(player.x, player.y - 45, '💔 전술 보호막 소진!', '#ef4444');
        }
        if (amount <= 0) {
          updateWeaponHUD();
          return;
        }
      }

      // [감싸 안는 직감: 보호막 흡수 (25초 지속)]
      if (player.instinctShieldHp > 0 && player.instinctShieldDuration > 0) {
        const absorbed = Math.min(player.instinctShieldHp, amount);
        player.instinctShieldHp -= absorbed;
        amount -= absorbed;
        addDamageText(player.x + 20, player.y - 30, `🛡️ 직감보호막 -${absorbed}`, '#c084fc');
        if (player.instinctShieldHp <= 0) {
          player.instinctShieldHp = 0;
          player.instinctShieldDuration = 0;
          addDamageText(player.x, player.y - 45, '💔 직감 보호막 소진!', '#c084fc');
        }
        if (amount <= 0) {
          updateWeaponHUD();
          return;
        }
      }

      // [AR 특수스킬: 색채(色彩) 활성화 상태]
      if (player.isColorActive) {
        if (player.calmBreathActive) {
          // [침착한 호흡: 15초 유예 중] 피격은 당하지만 체력이 1 이하로 감소하지 않음 (공격 가능)
          player.hp = Math.max(1, player.hp - amount);
          addDamageText(player.x + 20, player.y - 10, isExplosion ? `💥 -${amount}` : `-${amount}`, textColor);
          updateWeaponHUD();
          return;
        }

        // 색채 활성 중 피격으로 체력이 0에 도달할 때
        if (player.hp - amount <= 0) {
          if (!player.calmBreathUsed) {
            // [침착한 호흡] 1회성 발동! 체력 1 유지 및 15초 사망 유예 시작
            player.hp = 1;
            player.calmBreathActive = true;
            player.calmBreathTimer = 15.0;
            player.calmBreathUsed = true;
            addDamageText(player.x + 20, player.y - 10, isExplosion ? `💥 -${amount}` : `-${amount}`, textColor);
            addDamageText(player.x, player.y - 45, '⏳ [침착한 호흡 발동!] 15초 사망 유예! (체력 40% 이상 회복 필요)', '#ef4444');
            updateWeaponHUD();
            return;
          } else {
            // 침착한 호흡 이미 소진 시 체력 0으로 사망
            player.hp = 0;
            addDamageText(player.x + 20, player.y - 10, isExplosion ? `💥 -${amount}` : `-${amount}`, textColor);
            updateWeaponHUD();
            return;
          }
        } else {
          player.hp -= amount;
          addDamageText(player.x + 20, player.y - 10, isExplosion ? `💥 -${amount}` : `-${amount}`, textColor);
          updateWeaponHUD();
          return;
        }
      }

      // [일반 상태] 사망에 이르는 치명상 시 AR 색채(色彩) 1회 자동 각성 확인
      if (player.hp - amount <= 0) {
        if (player.mainWeapon.id === 'ar_white_fang' && !player.isColorActive && !player.specialSkillUsed) {
          triggerColorAwakening();
          return;
        }
        player.hp = 0;
        addDamageText(player.x + 20, player.y - 10, isExplosion ? `💥 -${amount}` : `-${amount}`, textColor);
        updateWeaponHUD();
        return;
      }

      player.hp -= amount;
      addDamageText(player.x + 20, player.y - 10, isExplosion ? `💥 -${amount}` : `-${amount}`, textColor);
      updateWeaponHUD();
    }

    // [빛의 검 : 아비 에슈흐 파이널] 피니셔 발동 함수
    function triggerAbiFinalFinisher() {
      if (!player.isAbiEshuhActive || !player.abiFinalCanTrigger) return;
      player.abiFinalCanTrigger = false;
      player.abiFinalPhase = 'charging';
      player.abiFinalChargeTimer = 3.0; // 3초 제자리 집중 차징
      player.vx = 0;
      player.vy = 0;
      addDamageText(player.x, player.y - 45, '⚔️ [빛의 검 : 아비 에슈흐 파이널] 초고에너지 차징 개시!', '#00ffff');
      if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
        sendNetPacket({ type: 'SYNC', specialEvent: { action: 'abi_final_start' } });
      }
    }

    let lastTime = performance.now();

    function updateLogic(dt) {
      const groundY = canvas.height - GROUND_OFFSET;
      const playerCenterX = player.x + player.width / 2;
      const playerCenterY = player.y + player.height / 2;

      // 0. 전술 코스트 회복 (기본 2.5초, [단련된 체력] 장착 시 20% 감소하여 2.0초) - 아비 에슈흐 중에는 자연 회복 중단
      if (!player.isAbiEshuhActive) {
        let costRegenInterval = 2.5;
        const activePassives = [
          (playerLoadout && playerLoadout.slot3 && playerLoadout.slot3.id) ? playerLoadout.slot3.id : '',
          (playerLoadout && playerLoadout.slot4 && playerLoadout.slot4.id) ? playerLoadout.slot4.id : '',
          (playerLoadout && playerLoadout.slot5 && playerLoadout.slot5.id) ? playerLoadout.slot5.id : ''
        ];
        if (activePassives.includes('disciplined_stamina')) {
          costRegenInterval *= 0.80; // 20% 단축
        }
        player.costTimer += dt;
        if (player.costTimer >= costRegenInterval) {
          player.costTimer = 0;
          if (player.cost < player.maxCost) {
            player.cost = Math.min(player.maxCost, player.cost + 1);
          }
        }
      }

      // [시스템 : 아비 에슈흐] 지속 상태 및 피니셔 시퀀스 머신
      if (player.isAbiEshuhActive) {
        // 1) 0.5초 형태 변환 타이머
        if (player.abiTransforming) {
          player.abiTransformTimer -= dt;
          if (player.abiTransformTimer <= 0) {
            player.abiTransforming = false;
            player.abiTransformTimer = 0;
            addDamageText(player.x, player.y - 40, '⚡ [시스템 : 아비 에슈흐] 가동 완료! 비행 모드', '#38bdf8');
          }
        }

        // 2) 평타 차징 타이머 (최대 0.9초)
        if (player.abiNormalCharging) {
          player.abiNormalChargeTimer += dt;
          if (player.abiNormalChargeTimer > 0.9) {
            player.abiNormalChargeTimer = 0.9;
          }
        }

        // 3) 1스킬 [용기의 마법] 오버히트 딜레이 카운트다운
        if (player.abiMissileCooldown > 0) {
          player.abiMissileCooldown -= dt;
          if (player.abiMissileCooldown <= 0) {
            player.abiMissileCooldown = 0;
            addDamageText(player.x, player.y - 25, '✅ [용기의 마법] 오버히트 해제', '#38bdf8');
          }
        }

        // 4) 2스킬 [빛의 난사] 3초간 50도 부채꼴 연사 루프
        if (player.abiBarrageFiring) {
          player.abiBarrageTimer -= dt;
          player.abiBarrageShotTimer += dt;
          if (player.abiBarrageShotTimer >= 0.05) { // 0.05초마다 1발 (총 60발)
            player.abiBarrageShotTimer = 0;
            const isEnhanced = Math.random() < 0.20; // 4:1 비율 (20% 강화탄)
            fireSingleBarrageBullet(isEnhanced);
          }
          if (player.abiBarrageTimer <= 0) {
            player.abiBarrageFiring = false;
            player.abiBarrageTimer = 0;
            player.abiBarrageShotTimer = 0;
            addDamageText(player.x, player.y - 30, '✨ [빛의 난사] 난사 완료!', '#00ffff');
            updateWeaponHUD();
          }
        }

        // 5) 코스트 0 소모 후 1초 대기 -> 피니셔 발동 가능 대기 상태
        if (player.abiFinalReady && !player.abiFinalCanTrigger && player.abiFinalPhase === 'none') {
          player.abiFinalDelayTimer -= dt;
          if (player.abiFinalDelayTimer <= 0) {
            player.abiFinalDelayTimer = 0;
            player.abiFinalCanTrigger = true;
            addDamageText(player.x, player.y - 45, '⚔️ [빛의 검 : 아비 에슈흐 파이널] 준비 완료! 아무 공격키를 누르십시오!', '#facc15');
            updateWeaponHUD();
          }
        }

        // 6) [빛의 검 : 아비 에슈흐 파이널] 시퀀스 페이즈 머신
        if (player.abiFinalPhase === 'charging') {
          // 3.0초 제자리 집중 차징 (방향 전환만 허용)
          player.abiFinalChargeTimer -= dt;
          player.vx = 0;
          player.vy = 0;
          if (keys.left) player.facing = -1;
          if (keys.right) player.facing = 1;

          // 푸른 크리스탈 집적 파티클
          if (Math.random() < 0.8) {
            specialParticles.push({
              type: 'spark',
              x: player.x + player.width / 2 + (Math.random() - 0.5) * 80,
              y: player.y + player.height / 2 + (Math.random() - 0.5) * 80,
              vx: (Math.random() - 0.5) * 3,
              vy: -(Math.random() * 6 + 3),
              color: Math.random() < 0.4 ? '#ffffff' : (Math.random() < 0.7 ? '#00ffff' : '#38bdf8'),
              size: Math.random() * 3.5 + 2,
              life: 26,
              maxLife: 26,
              alpha: 1
            });
          }

          if (player.abiFinalChargeTimer <= 0) {
            // 차징 완료 -> 곡선 상승 도약
            player.abiFinalPhase = 'fly_up';
            player.abiFinalFlyTimer = 0.45;
            player.abiFinalTarget = getClosestActiveEnemy(player.x + player.width / 2, player.y + player.height / 2);
            if (player.abiFinalTarget) {
              player.facing = player.abiFinalTarget.x >= (player.x + player.width / 2) ? 1 : -1;
            }
            addDamageText(player.x, player.y - 45, '⚡ 음속 도약 상승!', '#38bdf8');
          }
        } else if (player.abiFinalPhase === 'fly_up') {
          // 전방 위로 포물선 상승 (화면 너무 높이 벗어나지 않도록 적절한 고도 유지)
          player.abiFinalFlyTimer -= dt;
          player.vx = player.facing * 480;
          player.vy = -540;
          player.x += player.vx * dt;
          player.y += player.vy * dt;
          if (player.y < 150) player.y = 150;

          if (player.abiFinalFlyTimer <= 0) {
            // 정점 도달 -> 급강하 다이브 슬래시
            player.abiFinalPhase = 'dive_slash';
            player.abiFinalFlyTimer = 0.45;
            const foundTarget = getClosestActiveEnemy(player.x + player.width / 2, player.y + player.height / 2);
            player.abiFinalTarget = foundTarget ? foundTarget.entity : null;
            if (player.abiFinalTarget) {
              const isBoss = (player.abiFinalTarget.width !== undefined && player.abiFinalTarget.height !== undefined);
              const tX = isBoss ? (player.abiFinalTarget.x + player.abiFinalTarget.width / 2) : (player.abiFinalTarget.x + player.abiFinalTarget.size / 2);
              player.facing = tX >= (player.x + player.width / 2) ? 1 : -1;
            }
            addDamageText(player.x, player.y - 45, '🗡️ [일도양단] 초음속 강하 참격!', '#00ffff');
          }
        } else if (player.abiFinalPhase === 'dive_slash') {
          // 적을 향해 지면 근처까지 초음속 다이브
          player.abiFinalFlyTimer -= dt;
          let target = player.abiFinalTarget;
          if (!target || target.isDead || !target.isSpawned) {
            const found = getClosestActiveEnemy(player.x + player.width / 2, player.y + player.height / 2);
            target = found ? found.entity : null;
            player.abiFinalTarget = target;
          }

          // 적의 중심부 또는 지면 착지 지점을 정확히 타겟팅
          const isBoss = target ? (target.width !== undefined && target.height !== undefined) : false;
          const tCenterX = target ? (isBoss ? (target.x + target.width / 2) : (target.x + target.size / 2)) : 0;
          const tx = target ? (tCenterX - player.width / 2) : (player.x + player.facing * 350);
          const enemyGroundY = target ? (isBoss ? (groundY - target.height / 2) : (groundY - (target.jumpY || 0) - target.size / 2)) : (groundY - player.height);
          const ty = target ? (enemyGroundY - player.height / 2) : (groundY - player.height);
          const dx = tx - player.x;
          const dy = ty - player.y;
          const dist = Math.hypot(dx, dy) || 1;

          player.vx = (dx / dist) * 1400;
          player.vy = (dy / dist) * 1400;
          if (isNaN(player.vx)) player.vx = player.facing * 1400;
          if (isNaN(player.vy)) player.vy = 800;

          player.x += player.vx * dt;
          player.y += player.vy * dt;

          if (isNaN(player.x) || !isFinite(player.x)) player.x = 400;
          if (isNaN(player.y) || !isFinite(player.y)) player.y = groundY - player.height;

          // 공중 높은 곳에서 멈추지 않고, 지면에 확실하게 밀착하거나 적과 35px 이내 초근접 시 격타
          const isAtGround = player.y >= groundY - player.height - 4;
          const isCloseToTarget = dist <= 38;
          if (isCloseToTarget || isAtGround || player.abiFinalFlyTimer <= 0) {
            player.y = Math.min(groundY - player.height, Math.max(player.y, groundY - player.height - 15));
            player.vx = 0;
            player.vy = 0;
            player.abiFinalPhase = 'hitstop';
            player.abiFinalHitstopTimer = 0.35; // 0.35초 시공간 정지

            // 범위 320px 내의 모든 적을 정지 상태(isFrozen)로 고정
            player.abiFinalHitEnemies = [];
            player.abiFinalHitFx = null;
            kaitenzers.forEach(k => {
              if (k.isSpawned && !k.isDead && !k.isRetreating) {
                const kCenterX = k.x + k.size / 2;
                const kCenterY = (canvas.height - GROUND_OFFSET) - (k.jumpY || 0) - k.size / 2;
                const d = Math.hypot(kCenterX - (player.x + player.width / 2), kCenterY - (player.y + player.height / 2));
                if (d <= 320) {
                  k.isFrozen = true;
                  k.frozenTimer = 0.40;
                  player.abiFinalHitEnemies.push(k);
                }
              }
            });
            if (typeof kaitenFx !== 'undefined' && kaitenFx.isSpawned && !kaitenFx.isDead && kaitenFx.introState !== 'none') {
              const fxCenterX = kaitenFx.x + kaitenFx.width / 2;
              const fxCenterY = (canvas.height - GROUND_OFFSET) - kaitenFx.height / 2;
              const d = Math.hypot(fxCenterX - (player.x + player.width / 2), fxCenterY - (player.y + player.height / 2));
              if (d <= 360) {
                player.abiFinalHitFx = kaitenFx;
              }
            }
            addDamageText(player.x, player.y - 45, '❄️ [시공간 결빙] 찰나의 정적...', '#ffffff');
          }
        } else if (player.abiFinalPhase === 'hitstop') {
          // 시공간 정지 & 참격선 유지
          player.abiFinalHitstopTimer -= dt;
          player.vx = 0;
          player.vy = 0;

          if (player.abiFinalHitstopTimer <= 0) {
            // 섬광 폭발 & 데미지 인가
            player.abiFinalPhase = 'flash_burst';
            player.abiFinalFlashTimer = 0.28;

            const enemies = player.abiFinalHitEnemies || [];
            enemies.forEach(k => {
              if (k.isSpawned && !k.isDead) {
                const dmg = Math.round(k.hp * 0.05 + 53000);
                applyKaitenzerSharedDamage(dmg);
                if (currentMode === 'duo' && myRole === 'guest_striker' && typeof sendNetPacket === 'function') {
                  sendNetPacket({
                    type: 'ENEMY_DAMAGE',
                    targetType: 'kaiten',
                    targetId: k.id,
                    damage: dmg,
                    isCrit: false
                  });
                }
                const kCenterX = k.x + k.size / 2;
                const kCenterY = (canvas.height - GROUND_OFFSET) - (k.jumpY || 0) - k.size / 2;
                addDamageText(kCenterX, kCenterY - 30, `💥 -${dmg.toLocaleString()} (체력5%+53,000)`, '#00ffff');
                if (k.isDead) {
                  addDamageText(kCenterX, kCenterY - 50, `💀 [카이텐저 전원 격파!]`, '#fbbf24');
                }
              }
            });

            if (player.abiFinalHitFx && player.abiFinalHitFx.isSpawned && !player.abiFinalHitFx.isDead) {
              const b = player.abiFinalHitFx;
              let dmgMult = b.shieldActive ? 0.5 : 1.0;
              const dmg = Math.round((b.hp * 0.05 + 53000) * dmgMult);
              b.hp = Math.max(0, b.hp - dmg);
              if (currentMode === 'duo' && myRole === 'guest_striker' && typeof sendNetPacket === 'function') {
                sendNetPacket({
                  type: 'ENEMY_DAMAGE',
                  targetType: 'kaiten_fx',
                  targetId: 'kaiten_fx',
                  damage: dmg,
                  isCrit: false,
                  part: b.activePart
                });
              }
              const bCenterX = b.x + b.width / 2;
              const bCenterY = (canvas.height - GROUND_OFFSET) - b.height / 2;
              addDamageText(bCenterX, bCenterY - 30, `💥 -${dmg.toLocaleString()} (체력5%+53,000)`, '#00ffff');
              if (b.hp <= 0) {
                b.hp = 0;
                b.isDead = true;
                addDamageText(bCenterX, (canvas.height - GROUND_OFFSET) - 250, '🎉 KAITEN FX Mk.0 일도양단 격파! MISSION COMPLETE!', '#fbbf24');
              }
              player.abiFinalHitFx = null;
            }

            // 화면 거대 섬광 및 크리스탈 파편 파티클 대량 방출
            for (let p = 0; p < 30; p++) {
              specialParticles.push({
                type: 'spark',
                x: player.x + player.width / 2 + (Math.random() - 0.5) * 45,
                y: player.y + player.height / 2 + (Math.random() - 0.5) * 45,
                vx: (Math.random() - 0.5) * 26,
                vy: (Math.random() - 0.5) * 26,
                color: Math.random() < 0.35 ? '#ffffff' : (Math.random() < 0.65 ? '#00ffff' : '#38bdf8'),
                size: Math.random() * 4.5 + 2.5,
                life: 32,
                maxLife: 32,
                alpha: 1
              });
            }
          }
        } else if (player.abiFinalPhase === 'flash_burst') {
          player.abiFinalFlashTimer -= dt;
          if (player.abiFinalFlashTimer <= 0) {
            // 아비 에슈흐 상태 완전 해제 & 5초 기절 페널티
            player.isAbiEshuhActive = false;
            player.isHovering = false;
            player.abiFinalPhase = 'none';
            player.abiFinalReady = false;
            player.abiFinalCanTrigger = false;
            player.abiNormalCharging = false;
            player.abiBarrageFiring = false;
            player.maxCost = 15;
            player.cost = 0;
            player.abiStunTimer = 5.0; // 5초간 기절!
            player.y = groundY - player.height;
            player.vy = 0;
            player.vx = 0;
            addDamageText(player.x, player.y - 45, '⚠️ [시스템 과부하] 아비 에슈흐 해제! 5초간 기절!', '#ef4444');
            updateWeaponHUD();
          }
        }
      }

      // 기절 타이머 감소
      if (player.stunTimer > 0) {
        player.stunTimer -= dt;
        player.vx = 0;
        if (player.stunTimer <= 0) {
          player.stunTimer = 0;
          addDamageText(player.x, player.y - 30, '✅ 기절 회복!', '#22c55e');
        }
      }

      if (player.abiStunTimer > 0) {
        player.abiStunTimer -= dt;
        player.vx = 0;
        if (player.abiStunTimer <= 0) {
          player.abiStunTimer = 0;
          addDamageText(player.x, player.y - 30, '✅ 과부하 기절 회복!', '#22c55e');
        }
      }

      // [서포터 및 힐팩 업데이트 루프 제거 완료]

      // 대시 쿨타임 및 지속시간 갱신
      if (player.dashTimer > 0) {
        player.dashTimer -= dt;
      }
      if (player.isDashing) {
        player.dashDuration -= dt;
        if (player.dashDuration <= 0) {
          player.isDashing = false;
          player.dashDuration = 0.18;
          player.vx = 0;
        }
      }

      // 탄창 자동 재충전 (메인 90초, 보조 40초) - 무제한 탄창이 아닐 때만 동작
      if (player.mainWeapon.maxMags !== Infinity) {
        player.mainWeapon.magChargeTimer += dt;
        if (player.mainWeapon.magChargeTimer >= player.mainWeapon.magChargeInterval) {
          player.mainWeapon.magChargeTimer = 0;
          if (player.mainWeapon.mags < player.mainWeapon.maxMags) {
            player.mainWeapon.mags++;
            addDamageText(player.x, player.y - 25, '+1 MG탄창 보급', '#facc15');
          }
        }
      }
      if (player.subWeapon.maxMags !== Infinity) {
        player.subWeapon.magChargeTimer += dt;
        if (player.subWeapon.magChargeTimer >= player.subWeapon.magChargeInterval) {
          player.subWeapon.magChargeTimer = 0;
          if (player.subWeapon.mags < player.subWeapon.maxMags) {
            player.subWeapon.mags++;
            addDamageText(player.x, player.y - 25, '+1 HG탄창 보급', '#94a3b8');
          }
        }
      }

      // 재장전 카운트다운 및 총구 플래시 타이머
      [player.mainWeapon, player.subWeapon].forEach(w => {
        if (w.flashTimer > 0) w.flashTimer -= dt;
        if (w.isReloading) {
          w.reloadTimer -= dt;
          if (w.reloadTimer <= 0) {
            w.isReloading = false;
            w.ammo = w.maxAmmo;
            if (w.mags !== Infinity) {
              w.mags = Math.max(0, w.mags - 1);
            }
            addDamageText(player.x, player.y - 20, '✅ 장전 완료!', '#22c55e');
          }
        }
      });

      // 스킬 쿨타임
      if (player.skillCooldown > 0) {
        player.skillCooldown -= dt;
      }
      if (player.arSkill2Cooldown > 0) {
        player.arSkill2Cooldown -= dt;
      }
      if (player.rgSkill2Cooldown > 0) {
        player.rgSkill2Cooldown -= dt;
        if (player.rgSkill2Cooldown < 0) player.rgSkill2Cooldown = 0;
      }
      if (player.foxShieldCooldown > 0) {
        player.foxShieldCooldown -= dt;
        if (player.foxShieldCooldown < 0) player.foxShieldCooldown = 0;
      }
      if (player.foxSkill2Cooldown > 0) {
        player.foxSkill2Cooldown -= dt;
        if (player.foxSkill2Cooldown < 0) player.foxSkill2Cooldown = 0;
      }

      // [FOX 45식: 전술 보호막 유지 및 종료 시 50% 체력 회복]
      if (player.isTacticalDefActive && player.tacticalShieldTimer > 0) {
        player.tacticalShieldTimer -= dt;
        if (player.tacticalShieldTimer <= 0) {
          if (player.tacticalShield > 0) {
            const healAmount = Math.round(player.tacticalShield * 0.50);
            const actualHeal = Math.min(player.maxHp - player.hp, healAmount);
            player.hp = Math.min(player.maxHp, player.hp + actualHeal);
            addDamageText(player.x, player.y - 40, `💚 전술 보호막 만료 전환 +${actualHeal.toLocaleString()}`, '#10b981');
          }
          player.tacticalShield = 0;
          player.isTacticalDefActive = false;
          player.tacticalShieldTimer = 0;
          updateWeaponHUD();
        }
      }

      // [신규 서브스킬: 긴급 구호 세트 B] 45초마다 체력 3,500 회복
      const activePassives = [
        (playerLoadout && playerLoadout.slot3 && playerLoadout.slot3.id) ? playerLoadout.slot3.id : '',
        (playerLoadout && playerLoadout.slot4 && playerLoadout.slot4.id) ? playerLoadout.slot4.id : '',
        (playerLoadout && playerLoadout.slot5 && playerLoadout.slot5.id) ? playerLoadout.slot5.id : ''
      ];
      if (activePassives.includes('emergency_aid_b') && !player.isDead) {
        player.emergencyAidTimer = (player.emergencyAidTimer || 0) + dt;
        if (player.emergencyAidTimer >= 45.0) {
          player.emergencyAidTimer = 0;
          if (player.hp < player.maxHp && !player.isImmortalActive) {
            const healAmount = 3500;
            const actualHeal = Math.min(player.maxHp - player.hp, healAmount);
            player.hp = Math.min(player.maxHp, player.hp + actualHeal);
            addDamageText(player.x, player.y - 35, `💚 +${actualHeal.toLocaleString()} HP [긴급 구호 B]`, '#22c55e');
            updateWeaponHUD();
          }
        }
      }

      // [신규 서브스킬: 감싸 안는 직감] 보호막 지속시간 (25초) 감소 루프
      if (player.instinctShieldDuration > 0) {
        player.instinctShieldDuration -= dt;
        if (player.instinctShieldDuration <= 0) {
          player.instinctShieldDuration = 0;
          player.instinctShieldHp = 0;
          addDamageText(player.x, player.y - 35, '⌛ 직감 보호막 종료', '#94a3b8');
        }
      }

      // [RG: 밸런스 붕괴] 1.2초 차징 진행 루프
      if (player.isChargingSkill) {
        player.chargeTimer += dt;
        // 차징 중에는 좌우 방향키로 방향 전환만 허용
        if (keys.left) player.facing = -1;
        if (keys.right) player.facing = 1;
        player.vx = 0; // 이동 불가

        // 1.2초 차징 완료 시 발사!
        if (player.chargeTimer >= player.chargeMax) {
          player.isChargingSkill = false;
          player.chargeTimer = 0;
          fireRGSkillBullet();
          player.skillCooldown = 2.5; // 2.5초 쿨타임
        }
      }

      // 메인 스킬(종막: 이스보셋) 28발 연속 관통 사격 루프
      if (player.isFiringSkill) {
        player.skillBurstInterval += dt;
        if (player.skillBurstInterval >= 0.045) { // 0.045초마다 초고속 1발
          player.skillBurstInterval = 0;
          player.skillBurstCount--;
          fireSkillBullet();
          if (player.skillBurstCount <= 0) {
            player.isFiringSkill = false;
            player.skillCooldown = 2.5; // 2.5초 쿨타임
          }
        }
      }

      // [메인스킬 2 쿨타임 카운트다운]
      if (player.sgSkill2Cooldown > 0) {
        player.sgSkill2Cooldown -= dt;
        if (player.sgSkill2Cooldown < 0) player.sgSkill2Cooldown = 0;
      }

      // [SG: 격류] 0.5초 차징 루프 (자유 이동 및 점프 가능)
      if (player.sgTorrentCharging) {
        player.sgTorrentChargeTimer += dt;
        if (player.sgTorrentChargeTimer >= player.sgTorrentChargeMax) {
          player.sgTorrentCharging = false;
          player.sgTorrentChargeTimer = 0;
          player.sgTorrentFiring = true;
          player.sgTorrentShotsLeft = 8;
          player.sgTorrentInterval = 0; // 즉시 첫 발 발사!
          player.sgSkill2Cooldown = 2.5; // 2.5초 쿨타임 시작!
          addDamageText(player.x, player.y - 35, '🌊 [격류] 8회 연속 자동 난사 개시!', '#38bdf8');
        }
      }

      // [SG: 격류] 0.2초 간격 8회 산탄 난사 루프 (자유 이동 및 점프 가능)
      if (player.sgTorrentFiring) {
        player.sgTorrentInterval -= dt;
        if (player.sgTorrentInterval <= 0) {
          player.sgTorrentInterval = 0.20;
          player.sgTorrentShotsLeft--;
          fireSGTorrentShot();
          if (player.sgTorrentShotsLeft <= 0) {
            player.sgTorrentFiring = false;
          }
        }
      }

      // [RG: 빛의 검/각성] 차징 루프 (0.5s 단계충전 or 2.0s 레이저발사 준비, 제자리 고정)
      if (player.rgAwakeCharging) {
        player.rgAwakeChargeTimer += dt;
        player.vx = 0; // 제자리 고정
        if (player.rgAwakeChargeType === 'fire') {
          player.facing = player.rgAwakeFacing; // 방향 고정
        }

        if (player.rgAwakeChargeTimer >= player.rgAwakeChargeMax) {
          player.rgAwakeCharging = false;
          player.rgAwakeChargeTimer = 0;

          if (player.rgAwakeChargeType === 'stage') {
            player.rgAwakeStage = Math.min(2, player.rgAwakeStage + 1);
            player.rgSkill2Cooldown = 2.5; // 2.5초 쿨타임
            addDamageText(player.x, player.y - 35, `✨ [빛의 검/각성] ${player.rgAwakeStage}단계 충전 완료!`, '#38bdf8');
          } else if (player.rgAwakeChargeType === 'fire') {
            player.rgAwakeStage = 0; // 스택 소모
            player.rgAwakeFiring = true;
            player.rgAwakeLaserTimer = 0;
            player.rgAwakeLaserTick = 0;
            addDamageText(player.x, player.y - 35, '💥 [빛의 검/각성 : 슈퍼노바] 4초 관통 레이저 발사!', '#facc15');
          }
        }
      }

      // [RG: 빛의 검/각성] 4초간 관통 레이저 지속 방출 루프 (0.1초마다 40타격, 방향 전환 불가)
      if (player.rgAwakeFiring) {
        player.rgAwakeLaserTimer += dt;
        player.vx = 0;
        player.facing = player.rgAwakeFacing; // 발사 중 방향 전환 불가!

        player.rgAwakeLaserTick += dt;
        if (player.rgAwakeLaserTick >= 0.10) {
          player.rgAwakeLaserTick -= 0.10;
          fireRGAwakeLaserTick();
        }

        if (player.rgAwakeLaserTimer >= 4.0) {
          player.rgAwakeFiring = false;
          player.rgAwakeLaserTimer = 0;
          player.rgAwakeLaserTick = 0;
          player.rgSkill2Cooldown = 2.5; // 4초 레이저 종료 후 2.5초 쿨타임!
          addDamageText(player.x, player.y - 35, '✨ [빛의 검/각성] 레이저 방출 종료 (쿨타임 2.5초)', '#38bdf8');
        }
      }

      // [MG: 개연 : 이스보셋] 쿨타임 및 선율 발사 딜레이 카운트다운
      if (player.mgSkill2Cooldown > 0) {
        player.mgSkill2Cooldown -= dt;
        if (player.mgSkill2Cooldown < 0) player.mgSkill2Cooldown = 0;
      }
      if (player.mgStanceShotDelay > 0) {
        player.mgStanceShotDelay -= dt;
        if (player.mgStanceShotDelay < 0) player.mgStanceShotDelay = 0;
      }

      // [MG: 개연 : 이스보셋] 2.0초 자세 전환 루프
      if (player.mgStanceTransitioning) {
        player.mgStanceTransitionTimer += dt;
        player.vx = 0;
        if (player.mgStanceTransitionTimer >= 2.0) {
          player.mgStanceTransitioning = false;
          player.mgStanceTransitionTimer = 0;
          player.mgStanceActive = true;
          player.mgStanceTimer = 15.0; // 15초 유지 타이머 시작!
          player.mgStanceShotStage = 0; // 1음 발사 준비 완료
          player.mgStanceShotDelay = 0;
          addDamageText(player.x, player.y - 35, '🎼 [개연 : 이스보셋] 집중 사격 준비 완료! (L키로 발사)', '#c084fc');
          updateWeaponHUD();
        }
      }

      // [MG: 개연 : 이스보셋] 15초 유지 시간 루프
      if (player.mgStanceActive) {
        player.mgStanceTimer -= dt;
        player.vx = 0;
        // 15초 초과 시 자동 해제 및 스택 초기화!
        if (player.mgStanceTimer <= 0) {
          player.mgStanceActive = false;
          player.mgStanceTimer = 0;
          player.mgStanceShotStage = 0; // 스택 완전 초기화
          player.mgStanceShotDelay = 0;
          player.mgSkill2Cooldown = 2.5; // 2.5초 쿨타임 시작!
          addDamageText(player.x, player.y - 35, '⌛ [개연 : 이스보셋] 자세 유지 시간 종료 (스택 초기화)', '#94a3b8');
          updateWeaponHUD();
        }
      }

      // [특수스킬: 선도부장] 체력 50% 이하 1회 해금 감지
      if (player.hp > 0 && (player.hp / player.maxHp) <= 0.50 && !player.specialSkillUnlocked && !player.specialSkillUsed) {
        player.specialSkillUnlocked = true;
        addDamageText(player.x, player.y - 45, '👑 [특수스킬: 선도부장] 해금! (S키로 발동)', '#c084fc');
        updateWeaponHUD();
      }

      // [특수스킬: 선도부장] 7초 연속 제자리 폭풍 난사 루프
      if (player.isFiringSpecial) {
        player.vx = 0; // 제자리 고정
        player.specialTimer += dt;

        if (player.specialTimer < 2.0) {
          player.specialPhase = 1;
        } else if (player.specialTimer < 4.0) {
          player.specialPhase = 2;
        } else if (player.specialTimer < 7.0) {
          player.specialPhase = 3;
          player.specialIsBerserk = (player.hp / player.maxHp) <= 0.30;
        } else {
          // 7초 경과 시 종료
          player.isFiringSpecial = false;
          player.specialTimer = 0;
          player.specialShotInterval = 0;
          addDamageText(player.x, player.y - 35, '✨ [선도부장] 폭풍 난사 종료', '#c084fc');
          updateWeaponHUD();
        }

        if (player.isFiringSpecial) {
          player.specialShotInterval -= dt;
          if (player.specialShotInterval <= 0) {
            let interval = 0.075; // 1단계 0.075s
            if (player.specialPhase === 2) {
              interval = 0.060; // 2단계 0.060s
            } else if (player.specialPhase === 3) {
              interval = player.specialIsBerserk ? 0.040 : 0.060; // 3단계 각성 0.040s, 일반 0.060s
            }
            player.specialShotInterval = interval;
            fireMGSpecialBullet(player.specialPhase, player.specialIsBerserk);
          }
        }
      }

      // [SG: 블러디 앤 건 파우더] 특수스킬: 불사(不死) 지속시간 및 사격 딜레이 & 종료 처리
      if (player.isImmortalActive) {
        player.immortalTimer -= dt;

        // 불사 중 붉은빛 혈기 불꽃 파티클 상시 방출
        if (Math.random() < 0.45) {
          specialParticles.push({
            type: 'spark',
            x: player.x + Math.random() * player.width,
            y: player.y + Math.random() * player.height,
            vx: (Math.random() - 0.5) * 3,
            vy: -(Math.random() * 5 + 2),
            color: Math.random() < 0.5 ? '#dc2626' : '#ef4444',
            size: Math.random() * 3 + 1.5,
            life: 18,
            maxLife: 18,
            alpha: 1
          });
        }

        // 불사 지속시간 종료 시: 혈기 흡수 회복 (입힌 피해량의 5%, 최대 체력 50% 한도)
        if (player.immortalTimer <= 0) {
          player.isImmortalActive = false;
          player.immortalTimer = 0;

          const healPotential = Math.round(player.immortalTotalDmgDealt * 0.05);
          const maxHealLimit = Math.round(player.maxHp * 0.50);
          const actualHeal = Math.min(maxHealLimit, healPotential);

          if (actualHeal > 0) {
            player.hp = Math.min(player.maxHp, player.hp + actualHeal);
            addDamageText(player.x, player.y - 45, `🩸 [불사 종료: 혈기 흡수] +${actualHeal.toLocaleString()} HP 회복!`, '#ef4444');
          } else {
            addDamageText(player.x, player.y - 40, '⌛ [불사 종료]', '#94a3b8');
          }
          updateWeaponHUD();
        }
      }

      // [AR: 색채(色彩) 패시브 : 매초 0.5% ~ 1.2% 지속 침식]
      if (player.isColorActive && player.hp > 0) {
        player.colorErosionTimer += dt;
        if (player.colorErosionTimer >= 1.0) {
          player.colorErosionTimer -= 1.0;
          const pct = 0.005 + Math.random() * 0.007; // 0.5% ~ 1.2%
          const erosionDmg = Math.max(1, Math.round(player.maxHp * pct));

          if (player.calmBreathActive) {
            // 침착한 호흡 중에는 체력이 1 이하로 감소하지 않음
            player.hp = Math.max(1, player.hp - erosionDmg);
            addDamageText(player.x + 10, player.y - 30, `🖤 -${erosionDmg.toLocaleString()}`, '#64748b');
          } else {
            if (player.hp - erosionDmg <= 0) {
              if (!player.calmBreathUsed) {
                // [침착한 호흡] 1회성 발동! 체력 1 유지 및 15초 유예
                player.hp = 1;
                player.calmBreathActive = true;
                player.calmBreathTimer = 15.0;
                player.calmBreathUsed = true;
                addDamageText(player.x, player.y - 45, '⏳ [침착한 호흡 발동!] 15초 사망 유예! (40% 이상 회복 필요)', '#ef4444');
              } else {
                player.hp = 0;
                addDamageText(player.x + 10, player.y - 30, `🖤 -${erosionDmg.toLocaleString()}`, '#64748b');
              }
            } else {
              player.hp -= erosionDmg;
              addDamageText(player.x + 10, player.y - 30, `🖤 -${erosionDmg.toLocaleString()}`, '#64748b');
            }
          }
          updateWeaponHUD();
        }
      }

      // [AR: 침착한 호흡 사망 유예 타이머 및 40% 체력 회복 체크]
      if (player.calmBreathActive) {
        player.calmBreathTimer -= dt;
        const reqHealHp = Math.round(player.maxHp * 0.40);
        if (player.hp >= reqHealHp) {
          player.calmBreathActive = false;
          player.calmBreathTimer = 0;
          addDamageText(player.x, player.y - 45, '✨ [침착한 호흡 극복!] 생존 성공!', '#22c55e');
          updateWeaponHUD();
        } else if (player.calmBreathTimer <= 0) {
          player.calmBreathActive = false;
          player.calmBreathTimer = 0;
          player.hp = 0;
          addDamageText(player.x, player.y - 45, '💀 [침착한 호흡 만료] 사망...', '#ef4444');
          updateWeaponHUD();
        }
      }

      // [WHITE FANG 465] 화력 지원 드론 업데이트
      if (window.whiteFangDrones && window.whiteFangDrones.length > 0) {
        for (let di = window.whiteFangDrones.length - 1; di >= 0; di--) {
          const drone = window.whiteFangDrones[di];
          drone.timer -= dt;
          drone.fireTimer -= dt;
          if (drone.flashTimer > 0) drone.flashTimer -= dt;

          // 드론 위치: 플레이어 앞뒤 상공에 부드럽게 호버링 (2개 연속 소환 시 양쪽 대칭 배치)
          let targetHoverX, targetHoverY;
          if (drone.isColorDrone) {
            const colorDrones = window.whiteFangDrones.filter(d => d.isColorDrone);
            const colorIdx = colorDrones.indexOf(drone);
            // 2개 이상일 때: 첫 번째는 전방(+54px), 두 번째는 후방(-54px)으로 양쪽에 분산 호버링
            const sideMult = (colorDrones.length > 1 && colorIdx === 1) ? -1 : 1;
            targetHoverX = player.x + (player.width / 2) + (player.facing * sideMult * 54) - (player.facing * 10);
            const bobOffset = Math.sin(Date.now() * 0.006 + (colorIdx * Math.PI)) * 5;
            targetHoverY = player.y - 42 + bobOffset;
          } else {
            // 일반 WHITE FANG 드론: 전방 호버링
            targetHoverX = player.x + (player.facing > 0 ? 45 : -45);
            targetHoverY = player.y - 38 + Math.sin(Date.now() * 0.007) * 5;
          }
          drone.x += (targetHoverX - drone.x) * 0.15;
          drone.y += (targetHoverY - drone.y) * 0.15;
          drone.facing = player.facing;

          // 하단 추진체 파티클 (VTOL thruster glow)
          if (Math.random() < 0.35 && specialParticles.length < 90) {
            specialParticles.push({
              type: 'spark',
              x: drone.x + (Math.random() < 0.5 ? -13 : 13) * drone.facing,
              y: drone.y + 14,
              vx: (Math.random() - 0.5) * 1.5,
              vy: Math.random() * 3 + 1,
              color: drone.isColorDrone ? '#64748b' : '#22d3ee',
              size: Math.random() * 2.5 + 1.5,
              life: 8,
              maxLife: 8,
              alpha: 0.8
            });
          }

          // 일반 WHITE FANG 드론 미사일 발사 (정확히 0.1초 간격으로 1발씩 발사, 총 20발)
          if (!drone.isColorDrone) {
            while (drone.fireTimer <= 0 && drone.shotsFired < drone.maxShots) {
              drone.fireTimer += drone.fireInterval;
              drone.shotsFired++;
              drone.flashTimer = 0.08;
              drone.podAlternator = 1 - drone.podAlternator;

              // 발사 포드 위치 (좌측 포드 vs 우측 포드)
              const podOffsetX = (drone.podAlternator === 0 ? -13 : 13) * drone.facing;
              const podOffsetY = -4;
              const launchX = drone.x + podOffsetX;
              const launchY = drone.y + podOffsetY;

              // 패시브 & 버프 & 치명타 연산
              const activePassives = [playerLoadout.slot3.id, playerLoadout.slot4.id, playerLoadout.slot5.id];
              let mDmg = calcPlayerAttackDamage(drone.baseDmg); // 기본 1,800 (300의 600%)
              // [전투 스탯 엔진] 치명타 및 치명 대미지 연산
              const isCrit = checkCritSuccess(player.crit, 100);
              const critMult = calculateCritDamageMultiplier(player.critDmg, 50, 0);
              const finalMissileDmg = isCrit ? Math.round(mDmg * critMult) : mDmg;

              // 가장 가까운 적 타겟팅
              const closest = getClosestActiveEnemy(launchX, launchY);
              let mTarget = closest ? closest.entity : null;

              // 미사일 초기 사출 속도 (전방 고속 사출)
              let initVx = drone.facing * 18;
              let initVy = -3 + (Math.random() - 0.5) * 2;

              if (mTarget) {
                const isBoss = (mTarget.width !== undefined && mTarget.height !== undefined);
                const tCenterX = isBoss ? (mTarget.x + mTarget.width / 2) : (mTarget.x + mTarget.size / 2);
                const tCenterY = isBoss ? ((canvas.height - GROUND_OFFSET) - mTarget.height / 2) : ((canvas.height - GROUND_OFFSET) - (mTarget.jumpY || 0) - mTarget.size / 2);
                const dx = tCenterX - launchX;
                const dy = tCenterY - launchY;
                const dist = Math.hypot(dx, dy) || 1;
                initVx = (dx / dist) * 18;
                initVy = (dy / dist) * 18 - 2;
              }

              const missile = {
                isPlayerBullet: true,
                isSkillBullet: true,
                isCrit: isCrit,
                type: 'white_fang_missile',
                x: launchX,
                y: launchY,
                vx: initVx,
                vy: initVy,
                angle: Math.atan2(initVy, initVx),
                targetKaiten: mTarget,
                dmg: finalMissileDmg,
                color: isCrit ? '#fef08a' : '#06b6d4',
                size: 6.5,
                life: 110,
                smokeTimer: 0
              };
              bullets.push(missile);

              if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
                sendNetPacket({ type: 'SYNC', bulletEvent: missile });
              }

              // 총구/포드 연막 파티클
              for (let sp = 0; sp < 4; sp++) {
                specialParticles.push({
                  type: 'spark',
                  x: launchX,
                  y: launchY,
                  vx: drone.facing * (Math.random() * 5 + 2),
                  vy: (Math.random() - 0.5) * 4,
                  color: '#06b6d4',
                  size: Math.random() * 3 + 1.5,
                  life: 10,
                  maxLife: 10,
                  alpha: 1
                });
              }
            }
          }

          // 드론 유지 시간 종료 시 소멸 (일반 드론 20발 완료 또는 색채 드론 40초 만료)
          const isDroneExpired = drone.isColorDrone
            ? (drone.timer <= 0)
            : ((drone.timer <= 0 && drone.shotsFired >= drone.maxShots) || drone.timer <= -0.5);

          if (isDroneExpired) {
            for (let p = 0; p < 8; p++) {
              specialParticles.push({
                type: 'spark',
                x: drone.x + (Math.random() - 0.5) * 20,
                y: drone.y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: drone.isColorDrone ? '#64748b' : '#22d3ee',
                size: Math.random() * 2.5 + 1.5,
                life: 12,
                maxLife: 12,
                alpha: 0.9
              });
            }
            window.whiteFangDrones.splice(di, 1);
          }
        }
      }

      // 사격 키 홀딩 처리 (MG 연사, AR 연사, SG 불사 모드, SG 기괴멸렬 발동 시) vs 일반 단발식 무기
      const isFxIntroActive = (typeof kaitenFx !== 'undefined' && kaitenFx.isSpawned && kaitenFx.introState !== 'none' && kaitenFx.introState !== 'ready');
      const isSGSkill = (player.activeWeaponSlot === 'main' && player.mainWeapon.id === 'sg_bloody_gunpowder' && player.sgSkillActive);
      const isColorAR = (player.activeWeaponSlot === 'main' && player.mainWeapon.id === 'ar_white_fang' && player.isColorActive);
      const isStunnedPlayer = (player.abiStunTimer > 0) || (player.stunTimer > 0);
      const isHoldFire = !isFxIntroActive && !isStunnedPlayer && (((player.activeWeaponSlot === 'main' && (player.mainWeapon.id === 'mg_destructor' || player.mainWeapon.id === 'ar_white_fang' || player.mainWeapon.id === 'smg_fox45')) ||
                         (player.activeWeaponSlot === 'main' && player.mainWeapon.id === 'sg_bloody_gunpowder' && (player.isImmortalActive || player.sgSkillActive))));
      const currentFireDelay = (player.isImmortalActive && player.mainWeapon.id === 'sg_bloody_gunpowder')
                               ? player.immortalFireDelay
                               : (isColorAR ? ((player.hp / player.maxHp) <= 0.30 ? 0.10 : 0.20) : (isSGSkill ? 0.08 : player.mainWeapon.fireDelay));

      if (isHoldFire && keys.attack) {
        player.mainWeapon.fireTimer += dt;
        if (player.mainWeapon.fireTimer >= currentFireDelay) {
          player.mainWeapon.fireTimer = 0;
          tryFireWeapon();
        }
      } else {
        // 사격 키를 뗐거나 단발식일 때 딜레이 복구
        if (player.mainWeapon.fireTimer < currentFireDelay) {
          player.mainWeapon.fireTimer += dt;
        }
      }

      // 1. 플레이어 이동 및 점프 물리 (내가 스트라이커(1P 또는 2P)일 때 로컬 물리 시뮬레이션!)
      if (myRole === 'striker' || myRole === 'guest_striker') {
        const isFinisherLocked = (player.abiFinalPhase && player.abiFinalPhase !== 'none');
        const isStunned = (player.abiStunTimer > 0) || (player.stunTimer > 0);
        const isMovementLocked = isFxIntroActive || isStunned || isFinisherLocked || player.isChargingSkill || player.rgAwakeCharging || player.rgAwakeFiring || player.mgStanceTransitioning || player.mgStanceActive || player.isFiringSpecial;

        if (isFxIntroActive) {
          // [합체 연출 중 플레이어 완전 일시정지]: 입력 무시 및 정지
          player.vx = 0;
          player.vy += 0.85;
          player.y += player.vy;
          if (player.y >= groundY - player.height) {
            player.y = groundY - player.height;
            player.vy = 0;
            player.isGrounded = true;
          }
        } else if (isFinisherLocked) {
          // 피니셔 중에는 피니셔 시퀀스 머신에서 좌표와 방향을 직접 제어하므로 일반 물리 바이패스
        } else if (player.isAbiEshuhActive && player.isHovering && !isStunned) {
          if (player.isDashing) {
            // [아비 에슈흐 공중 대시]: 돌진 회피
            player.x += player.vx;
            if (player.y < 70) player.y = 70;
            if (player.y > groundY - player.height) {
              player.y = groundY - player.height;
              player.vy = 0;
            }
            if (player.x < 50) player.x = 50;
            if (player.x > WORLD_WIDTH - 100) player.x = WORLD_WIDTH - 100;
            player.isGrounded = (player.y >= groundY - player.height - 2);
          } else {
            // [아비 에슈흐 비행 호버링]: 적정 비행 속도 (기본 10.5 / 달리기 14.0) 및 매끄러운 가감속 관성 물리
            const flySpeed = player.isRunning ? 14.0 : 10.5;
            let dx = 0, dy = 0;
            if (keys.left) dx -= 1;
            if (keys.right) dx += 1;
            if (keys.up || keys.jump) dy -= 1;
            if (keys.down) dy += 1;

            const dist = Math.hypot(dx, dy);
            if (dist > 0) {
              const targetVx = (dx / dist) * flySpeed;
              const targetVy = (dy / dist) * flySpeed;
              // 부드럽게 가속하며 추진력을 얻는 가속 관성
              player.vx += (targetVx - player.vx) * 0.09;
              player.vy += (targetVy - player.vy) * 0.09;
            } else {
              // 키를 뗐을 때 즉시 멈추지 않고 미끄러지듯 서서히 감속하는 비행 관성
              player.vx *= 0.93;
              player.vy *= 0.93;
              if (Math.abs(player.vx) < 0.05) player.vx = 0;
              if (Math.abs(player.vy) < 0.05) player.vy = 0;
            }

            player.x += player.vx;
            player.y += player.vy;

            // 호버링 중 가장 가까운 적을 자동 타겟팅하여 조준 방향 갱신!
            const closest = getClosestActiveEnemy(player.x + player.width / 2, player.y + player.height / 2);
            if (closest) {
              player.facing = closest.x >= (player.x + player.width / 2) ? 1 : -1;
            }

            // 비행 고도 및 월드 범위 클램프
            if (player.y < 70) player.y = 70;
            if (player.y > groundY - player.height) {
              player.y = groundY - player.height;
              player.vy = 0;
            }
            if (player.x < 50) player.x = 50;
            if (player.x > WORLD_WIDTH - 100) player.x = WORLD_WIDTH - 100;
            player.isGrounded = (player.y >= groundY - player.height - 2);
          }
        } else if (isMovementLocked) {
          player.vx = 0;
          // MG 집중 사격 자세 및 선도부장 난사 중에는 좌우 방향키로 조준 방향 전환 허용!
          if (player.mgStanceTransitioning || player.mgStanceActive || player.isFiringSpecial) {
            if (keys.left) player.facing = -1;
            if (keys.right) player.facing = 1;
          }
          if (player.rgAwakeFiring) {
            player.facing = player.rgAwakeFacing; // RG 발사 중 방향 전환 불가!
          }
          // 기절 또는 지상 차징 중 중력 적용
          player.vy += 0.85;
          player.y += player.vy;
          if (player.y >= groundY - player.height) {
            player.y = groundY - player.height;
            player.vy = 0;
            player.isGrounded = true;
          }
        } else if (player.isDashing) {
          // [지상 대시 회피 중 이동]: vx (dir * player.dashSpeed)로 전방 고속 돌진!
          player.x += player.vx;

          // 대시 중 중력 & 바닥 충돌
          player.vy += 0.85;
          player.y += player.vy;
          if (player.y >= groundY - player.height) {
            player.y = groundY - player.height;
            player.vy = 0;
            player.isGrounded = true;
          }

          if (player.x < 50) player.x = 50;
          if (player.x > WORLD_WIDTH - 100) player.x = WORLD_WIDTH - 100;
        } else {
          // [일반 지상 이동]
          const moveSpeed = player.isRunning ? player.baseSpeed * 1.5 : player.baseSpeed;
          if (keys.left) player.vx = -moveSpeed;
          else if (keys.right) player.vx = moveSpeed;
          else player.vx = 0;

          // 점프 (이동 잠금 중엔 점프 불가, SG 격류는 점프 가능!)
          if (keys.jump && player.isGrounded) {
            player.vy = -16;
            player.isGrounded = false;
          }

          // 중력
          player.vy += 0.85;
          player.x += player.vx;
          player.y += player.vy;

          // 바닥 충돌
          if (player.y >= groundY - player.height) {
            player.y = groundY - player.height;
            player.vy = 0;
            player.isGrounded = true;
          }

          if (player.x < 50) player.x = 50;
          if (player.x > WORLD_WIDTH - 100) player.x = WORLD_WIDTH - 100;
        }
      }

      // 카메라 추적 (합체 연출 중에는 로봇 중심, 평상시에는 로컬 플레이어 기준 포커스)
      let targetFocusX = player.x;
      if (typeof kaitenFx !== 'undefined' && kaitenFx.isSpawned && kaitenFx.introState !== 'none' && kaitenFx.introState !== 'ready') {
        targetFocusX = kaitenFx.x + kaitenFx.width / 2;
      }
      const targetCamX = targetFocusX - (canvas.width / 2);
      camera.x += (targetCamX - camera.x) * 0.1;
      if (camera.x < 0) camera.x = 0;
      if (camera.x > WORLD_WIDTH - canvas.width) {
        camera.x = Math.max(0, WORLD_WIDTH - canvas.width);
      }

      posDisplay.innerText = `X: ${Math.round(player.x)}`;

      // 1-1. 카이텐저 순차 증원 페이즈 판정
      const red = kaitenzers[0];
      const redHpRatio = red.hp / red.maxHp;

      // [1차 증원]: 레드의 체력이 10% 감소했을 때 (HP <= 90%) -> 2명 출격
      if (!phase1Triggered && redHpRatio <= 0.90) {
        phase1Triggered = true;
        phase1Members.forEach((id, idx) => {
          const k = kaitenzers.find(m => m.id === id);
          k.isSpawned = true;
          k.x = red.x + 220 + (idx * 180);
          addDamageText(k.x, groundY - 110, `🚨 [1차 증원] ${k.name}[${k.role}] 출격!`, k.color);
        });
      }

      // [2차 증원]: 레드의 체력이 또 30% 감소했을 때 (총 40% 감소, HP <= 60%) -> 나머지 2명 출격
      if (!phase2Triggered && redHpRatio <= 0.60) {
        phase2Triggered = true;
        phase2Members.forEach((id, idx) => {
          const k = kaitenzers.find(m => m.id === id);
          k.isSpawned = true;
          k.x = red.x + 460 + (idx * 180);
          addDamageText(k.x, groundY - 110, `⚡ [최종 증원] ${k.name}[${k.role}] 전원 집결!`, k.color);
        });
      }

      // [타인의 사슬 타이머 제거]

      // 1-2-B. 카이텐저 1페이즈 단일 공유체력 5,000,000 전소(0 이하) 시 후퇴 및 2페이즈 전환 판정
      const totalKaitenHp = kaitenzers.reduce((sum, k) => sum + (k.isDead ? 0 : Math.max(0, k.hp)), 0);
      const totalKaitenMaxHp = kaitenzers.reduce((sum, k) => sum + k.maxHp, 0) || 5000000;

      // [도주 발동 조건]: 5인이 공유하는 전체 체력 0 이하 (5,000,000 HP 완전 소진) 도달 시 2페이즈 합체 개시
      if (!isPhase1Retreating && !isPhase2Active && totalKaitenHp <= 0) {
        isPhase1Retreating = true;
        phase1RetreatTimer = 4.0; // 4초간 긴급 후퇴 시퀀스 진행

        // 전장에 긴급 경보 출력
        addDamageText(canvas.width / 2 + camera.x, 80, '🚨 [비상 경보] 카이텐저 연합 전원 후퇴 명령 발령!', '#ef4444');
        addDamageText(canvas.width / 2 + camera.x, 120, '⚡ "전원 퇴각! 최종 결전 병기 카이텐 FX Mk.0를 가동하라!"', '#facc15');

        // 스폰된 모든 멤버 후퇴 상태로 전환 (모든 공격/스킬 즉시 취소)
        kaitenzers.forEach(k => {
          if (k.isSpawned) {
            k.isRetreating = true;
            k.isActive = false;
            k.isSkillSealed = true;
            if (k.id === 'yellow') k.laserState = 'none';
            if (k.id === 'green') k.isOverheated = false;
            addDamageText(k.x + k.size / 2, groundY - (k.jumpY || 0) - k.size - 25, '💨 [전력 후퇴!]', '#38bdf8');
          }
        });

        // [사슬 결속 해제 불필요]
      }

      // 후퇴 진행 처리
      if (isPhase1Retreating) {
        phase1RetreatTimer -= dt;
        let allEscaped = true;

        kaitenzers.forEach(k => {
          if (k.isRetreating && !k.isDead) {
            // 오른쪽 맵 바깥으로 전력 질주
            k.x += 650 * dt;
            if (k.x < WORLD_WIDTH + 150) {
              allEscaped = false;
            }
          }
        });

        // 4초가 경과했거나 모든 멤버가 맵 밖으로 벗어난 경우 1페이즈 클리어 및 2페이즈 준비 완료
        if (allEscaped || phase1RetreatTimer <= 0) {
          isPhase1Retreating = false;
          isPhase2Active = true;
          kaitenzers.forEach(k => {
            k.isSpawned = false;
            k.isDead = true;
            k.isRetreating = false;
          });
          addDamageText(canvas.width / 2 + camera.x, 90, '🎉 PHASE 1 요격 성공! 카이텐저 전원 퇴각 완료!', '#10b981');
          addDamageText(canvas.width / 2 + camera.x, 130, '🤖 경고: 거대 로봇 카이텐 FX Mk.0 출격 시퀀스 대기...', '#f59e0b');
        }
      }

      // 1-3. 카이텐저 점프 물리 & 이동 AI
      kaitenzers.forEach(k => {
        if (!k.isSpawned || k.isDead || k.isRetreating) return;

        // [빛의 검 : 아비 에슈흐 파이널] 시공간 결빙 히트스톱 중에는 완전 정지!
        if (k.isFrozen) {
          k.frozenTimer = (k.frozenTimer || 0) - dt;
          if (k.frozenTimer <= 0) {
            k.isFrozen = false;
          }
          return;
        }

        // 점프 물리 연산 (중력 & 수평 관성) - 기절 중이어도 공중에 있다면 자연스럽게 바닥으로 착지!
        if (k.jumpY > 0 || k.vy > 0) {
          k.jumpY += k.vy;
          k.vy -= 0.65; // 중력 가속도
          if (k.vx) {
            k.x += k.vx;
            k.vx *= 0.96;
          }
          if (k.jumpY <= 0) {
            k.jumpY = 0;
            k.vy = 0;
            k.vx = 0;
          }
        }

        // [FOX 45식: 철벽의 방어] 기절 중에는 추가 점프 및 지상 이동 불가
        if (k.stunTimer && k.stunTimer > 0) {
          return;
        }

        // 1. 포지션 측면 설정 (targetSide: -1 = 플레이어 좌측, +1 = 플레이어 우측)
        // 블랙(선봉 기동)과 그린은 좌측 우회, 레드/핑크/옐로는 우측 기본 배치로 양각 포위 형성
        if (typeof k.targetSide === 'undefined') {
          if (k.id === 'black') k.targetSide = -1;
          else if (k.id === 'green') k.targetSide = -1;
          else k.targetSide = 1;
        }

        // 2. 포지션 셔플 & 동적 재배치 타이머 (줄서기 방지 & 순서 뒤섞기)
        k.repositionTimer = (k.repositionTimer || (2.5 + Math.random() * 3.0)) - dt;
        if (k.repositionTimer <= 0) {
          k.repositionTimer = 3.5 + Math.random() * 3.5;
          // 랜덤 거리 오프셋 (-80px ~ +80px)으로 1-2-3-4-5 고정 순서 완전 파괴
          k.dynOffset = (Math.random() - 0.5) * 160;

          // 기동성 있는 블랙/레드/그린은 가끔 플레이어 반대편으로 뛰어넘어 양각 전환
          if ((k.id === 'black' || k.id === 'red' || k.id === 'green') && Math.random() < 0.38) {
            k.targetSide = -k.targetSide;
          }
        }

        // 3. 병종별 기준 사거리 범위 (랜덤 오프셋으로 매번 섞임)
        let baseDist = 360;
        if (k.id === 'black') baseDist = 230;      // HG 블랙: 근접 교란
        else if (k.id === 'green') baseDist = 310;  // MG 그린: 전방 화력
        else if (k.id === 'red') baseDist = 370;    // AR 레드: 중거리 지휘
        else if (k.id === 'pink') baseDist = 450;   // RL 핑크: 후방 포격
        else if (k.id === 'yellow') baseDist = 530; // SR 옐로: 최후방 저격

        const targetDist = Math.max(160, baseDist + (k.dynOffset || 0));
        // 목표 월드 X 좌표
        const targetX = playerCenterX + (k.targetSide * targetDist);
        const distToTarget = targetX - k.x;
        const absDistToTarget = Math.abs(distToTarget);

        const currentSpeed = k.baseSpeed * (k.jumpY > 0 ? 1.3 : 1.0);

        if (absDistToTarget > 20) {
          k.x += Math.sign(distToTarget) * Math.min(absDistToTarget, currentSpeed * 1.15);
        }

        // 4. 점프 타이머: 바닥에서 도약할 때 수평 추진력(k.vx)을 함께 주어 역동적인 입체 도약!
        k.jumpTimer -= dt;
        if (k.jumpTimer <= 0) {
          k.jumpTimer = 2.8 + Math.random() * 3.5;
          if (k.jumpY <= 0) {
            k.vy = 11 + Math.random() * 4;
            // 목표 방향으로 공중 추진력 부여 (뒤로 빠지거나 앞으로 덮치기)
            const jumpDir = Math.sign(distToTarget) || k.targetSide;
            k.vx = jumpDir * (2.2 + Math.random() * 2.2);
            addDamageText(k.x + k.size / 2, groundY - k.size - 10, 'LEAP!', k.color);
          }
        }

        // 5. 맵 경계선 내 유지
        const mapMaxX = typeof WORLD_WIDTH !== 'undefined' ? WORLD_WIDTH - 80 : 2500;
        k.x = Math.max(80, Math.min(mapMaxX, k.x));

        // 6. [동료 간 겹침 방지 밀어내기 (강력한 탄성 분리 - 겹침 0% 보장)]
        kaitenzers.forEach(other => {
          if (other !== k && other.isSpawned && !other.isDead && !other.isRetreating) {
            const overlapDist = k.x - other.x;
            const minDist = (k.size + other.size) * 0.72; // 최소 65px 이상 거리 유지
            if (Math.abs(overlapDist) < minDist) {
              const sign = (overlapDist >= 0 ? 1 : -1);
              const pushForce = (minDist - Math.abs(overlapDist)) * 0.25;
              k.x += sign * pushForce;
            }
          }
        });
      });

      // 2. 카이텐저 스킬 쿨타임 및 버프 갱신
      const blackKaiten = kaitenzers.find(k => k.id === 'black');
      const isBlackBuffActive = blackKaiten && blackKaiten.isSpawned && !blackKaiten.isDead && blackKaiten.isActive;

      kaitenzers.forEach(k => {
        if (!k.isSpawned || k.isDead || k.isRetreating || k.isFrozen) return;

        // [FOX 45식: 철벽의 방어 기절 타이머]
        if (k.stunTimer > 0) {
          k.stunTimer -= dt;
          if (k.stunTimer <= 0) {
            k.stunTimer = 0;
            addDamageText(k.x + k.size / 2, groundY - k.size - 25, '✅ 기절 회복', '#22c55e');
          }
          return; // 기절 중에는 스킬 및 공격 불가!
        }

        // [FOX 45식: 공세 전환 치명 대미지 저항률 감소 디버프 타이머]
        if (k.critDmgResistDebuffTimer > 0) {
          k.critDmgResistDebuffTimer -= dt;
          if (k.critDmgResistDebuffTimer <= 0) {
            k.critDmgResistDebuffTimer = 0;
            k.critDmgResistDebuff = 0;
          }
        }

        // [사슬 스킬봉인 불필요]

        // [라이딩 그레네이드] 공격력 30% 감소 디버프 타이머 갱신
        if (k.atkDebuffTimer > 0) {
          k.atkDebuffTimer -= dt;
          if (k.atkDebuffTimer <= 0) {
            k.atkDebuffTimer = 0;
            k.atkDebuffRatio = 0;
          }
        }

        if (k.cooldownMax > 0) {
          if (!k.isActive) {
            k.cooldownTimer -= dt;
            if (k.cooldownTimer <= 0) {
              k.isActive = true;
              k.durationTimer = k.durationMax;
              k.cooldownTimer = k.cooldownMax;
              addDamageText(k.x, groundY - 80, `[SKILL: ${k.skillName}]`, k.color);

              // 그린 광범위 난사 스킬 (부채꼴 난사)
              if (k.id === 'green') {
                for (let angle = -40; angle <= 40; angle += 8) {
                  const rad = (180 + angle) * (Math.PI / 180);
                  bullets.push({
                    type: 'normal',
                    x: k.x,
                    y: groundY - (k.jumpY || 0) - k.size / 2,
                    vx: Math.cos(rad) * 11,
                    vy: Math.sin(rad) * 6,
                    dmg: Math.round(k.atk * (isBlackBuffActive ? 1.2 : 1.0)),
                    color: '#22c55e',
                    size: 6,
                    life: 140
                  });
                }
              }
            }
          } else {
            k.durationTimer -= dt;
            if (k.durationTimer <= 0) {
              k.isActive = false;
            }
          }
        }
      });

      // [2인 멀티플레이 동기화 헬퍼]: 적 탄환을 생성하고 호스트인 경우 게스트에게 즉각 동기화 전송
      function spawnEnemyBullet(bData) {
        bData.isEnemyBullet = true;
        bullets.push(bData);
        if (currentMode === 'duo' && myRole === 'striker' && typeof sendNetPacket === 'function') {
          sendNetPacket({
            type: 'ENEMY_BULLET',
            bullet: bData
          });
        }
      }

      // [2인 멀티플레이 어그로 타겟팅]: 1P와 2P 중 가까운 플레이어나 생존 대원을 조준
      function getEnemyTargetPos(enemyX, enemyY) {
        if (currentMode === 'duo' && typeof remotePlayer !== 'undefined' && remotePlayer && remotePlayer.isActive && remotePlayer.hp > 0) {
          const p1Dist = Math.hypot(playerCenterX - enemyX, playerCenterY - enemyY);
          const p2CenterX = remotePlayer.x + 20;
          const p2CenterY = remotePlayer.y + 35;
          const p2Dist = Math.hypot(p2CenterX - enemyX, p2CenterY - enemyY);
          if (p2Dist < p1Dist) {
            return { x: p2CenterX, y: p2CenterY };
          }
        }
        return { x: playerCenterX, y: playerCenterY };
      }

      // 3. 카이텐저 무기별 특화 공격 로직 (게스트는 호스트의 탄환 동기화를 받으므로 발사 스킵!)
      if (!(currentMode === 'duo' && myRole === 'guest_striker')) {
        const black = kaitenzers[1];
        const yellow = kaitenzers[2];
        const green = kaitenzers[3];
        const pink = kaitenzers[4];

        // --- [레드: AR 3점사] ---
        if (red.isSpawned && !red.isDead && !red.isRetreating && !red.isFrozen) {
          red.attackTimer += dt;
          if (red.burstCount > 0) {
            red.burstInterval += dt;
            if (red.burstInterval >= 0.15) { // 3발 연사 간격 약간 완화 (0.12 -> 0.15s)
              red.burstInterval = 0;
              red.burstCount--;
              let dmg = Math.round(red.atk * (isBlackBuffActive ? 1.2 : 1.0));
              if (red.atkDebuffTimer > 0) dmg = Math.round(dmg * (1.0 - (red.atkDebuffRatio || 0.30)));

              const redShootY = groundY - (red.jumpY || 0) - red.size / 2;
              const tPos = getEnemyTargetPos(red.x, redShootY);
              const dx = tPos.x - red.x;
              const dy = tPos.y - redShootY;
              const dist = Math.hypot(dx, dy) || 1;
              spawnEnemyBullet({
                type: 'ar_bullet',
                x: red.x,
                y: redShootY,
                vx: (dx / dist) * 13 + (Math.random() - 0.5) * 0.8,
                vy: (dy / dist) * 13 + (Math.random() - 0.5) * 0.8,
                dmg: dmg,
                color: '#ef4444',
                size: 5.5,
                life: 160
              });
            }
          } else if (red.attackTimer >= 2.8) { // 3점사 주기 완화 (2.2s -> 2.8s)
            red.attackTimer = 0;
            red.burstCount = 3;
            red.burstInterval = 0.15;
          }
        } else {
          red.burstCount = 0;
        }

        // --- [블랙: HG 단발 사격 타이머] ---
        if (black.isSpawned && !black.isDead && !black.isRetreating && !black.isFrozen) {
          black.attackTimer += dt;
          if (black.attackTimer >= 1.35) { // 0.95초 -> 1.35초로 약간 증가
            black.attackTimer = 0;
            let dmg = Math.round(black.atk * (isBlackBuffActive ? 1.2 : 1.0));
            if (black.atkDebuffTimer > 0) dmg = Math.round(dmg * (1.0 - (black.atkDebuffRatio || 0.30)));

            const blackShootY = groundY - (black.jumpY || 0) - black.size / 2;
            const tPos = getEnemyTargetPos(black.x, blackShootY);
            const dx = tPos.x - black.x;
            const dy = tPos.y - blackShootY;
            const dist = Math.hypot(dx, dy) || 1;
            spawnEnemyBullet({
              type: 'hg_bullet',
              x: black.x,
              y: blackShootY,
              vx: (dx / dist) * 15,
              vy: (dy / dist) * 15,
              dmg: dmg,
              color: '#94a3b8',
              size: 5,
              life: 140
            });
          }
        }

        // --- [옐로: SR 레이저 조준선 예고 후 초고속 관통탄] ---
        if (yellow.isSpawned && !yellow.isDead && !yellow.isRetreating && !yellow.isFrozen) {
          yellow.attackTimer += dt;
          if (yellow.attackTimer < 2.5) { // 2.0s -> 2.5s 대기
            yellow.laserState = 'none';
          } else if (yellow.attackTimer >= 2.5 && yellow.attackTimer < 3.8) {
            // 1단계: 플레이어 조준 추적 (월드 좌표 기준 실시간 추적)
            yellow.laserState = 'aiming';
            const tPos = getEnemyTargetPos(yellow.x, groundY - yellow.size / 2);
            yellow.aimTargetX = tPos.x;
            yellow.aimTargetY = tPos.y;
          } else if (yellow.attackTimer >= 3.8 && yellow.attackTimer < 4.4) {
            // 2단계: 조준선 고정 (Locked - 이 순간 궤적 확정)
            yellow.laserState = 'locked';
          } else if (yellow.attackTimer >= 4.4) {
            // 3단계: 초고속 저격탄 발사! (전체 주기 3.7s -> 4.4s로 증가)
            yellow.laserState = 'none';
            yellow.attackTimer = 0;

            const isSkill = yellow.isActive;
            const baseDmg = isSkill ? yellow.atk * 4 : yellow.atk;
            let dmg = Math.round(baseDmg * (isBlackBuffActive ? 1.2 : 1.0));
            if (yellow.atkDebuffTimer > 0) dmg = Math.round(dmg * (1.0 - (yellow.atkDebuffRatio || 0.30)));


            const shootOriginX = yellow.x;
            const shootOriginY = groundY - (yellow.jumpY || 0) - yellow.size / 2;
            const dx = (yellow.aimTargetX || playerCenterX) - shootOriginX;
            const dy = (yellow.aimTargetY || playerCenterY) - shootOriginY;
            const dist = Math.hypot(dx, dy) || 1;
            const speed = 34;

            spawnEnemyBullet({
              type: 'sr_bullet',
              x: shootOriginX,
              y: shootOriginY,
              vx: (dx / dist) * speed,
              vy: (dy / dist) * speed,
              angle: Math.atan2(dy, dx), // 날아가는 각도
              dmg: dmg,
              color: isSkill ? '#fbbf24' : '#eab308',
              size: 9,
              life: 90
            });
            addDamageText(yellow.x, groundY - (yellow.jumpY || 0) - 70, isSkill ? '⚡강화저격!' : '저격!', '#eab308');
          }
        } else {
          yellow.laserState = 'none';
        }

        // --- [그린: MG 연속 제압 사격 & 과열 메커니즘] ---
        if (green.isSpawned && !green.isDead && !green.isRetreating && !green.isFrozen) {
          green.heatTimer += dt;
          if (!green.isOverheated) {
            green.attackTimer += dt;
            if (green.attackTimer >= 0.17) { // 연사 간격 살짝 완화 (0.12s -> 0.17s)
              green.attackTimer = 0;
              let dmg = Math.round(green.atk * (isBlackBuffActive ? 1.2 : 1.0));
              if (green.atkDebuffTimer > 0) dmg = Math.round(dmg * (1.0 - (green.atkDebuffRatio || 0.30)));

              const greenShootY = groundY - (green.jumpY || 0) - green.size / 2;
              const tPos = getEnemyTargetPos(green.x, greenShootY);
              const dx = tPos.x - green.x;
              const dy = tPos.y - greenShootY;
              const dist = Math.hypot(dx, dy) || 1;

              spawnEnemyBullet({
                type: 'mg_bullet',
                x: green.x,
                y: greenShootY,
                vx: (dx / dist) * 11 + (Math.random() - 0.5) * 2,
                vy: (dy / dist) * 11 + (Math.random() - 0.5) * 4, // 탄퍼짐
                dmg: dmg,
                color: '#22c55e',
                size: 4.5,
                life: 150
              });
            }
            if (green.heatTimer >= 2.5) { // 2.5초 사격 후 과열 (난사 시간 약간 단축)
              green.isOverheated = true;
              green.heatTimer = 0;
              addDamageText(green.x, groundY - (green.jumpY || 0) - 70, '[MG과열 재장전]', '#4ade80');
            }
          } else {
            if (green.heatTimer >= 2.2) { // 냉각 재장전 시간 약간 증가 (1.8s -> 2.2s)
              green.isOverheated = false;
              green.heatTimer = 0;
            }
          }
        }

        // --- [핑크: RL 유도 로켓 + 착탄 광역 폭발] ---
        if (pink.isSpawned && !pink.isDead && !pink.isRetreating && !pink.isFrozen) {
          pink.attackTimer += dt;
          if (pink.attackTimer >= 3.6) { // 로켓 발사 주기 증가 (2.8s -> 3.6s)
            pink.attackTimer = 0;
            let dmg = Math.round(pink.atk * (isBlackBuffActive ? 1.2 : 1.0));
            if (pink.atkDebuffTimer > 0) dmg = Math.round(dmg * (1.0 - (pink.atkDebuffRatio || 0.30)));

            const shootOriginX = pink.x;
            const shootOriginY = groundY - pink.size / 2;
            const tPos = getEnemyTargetPos(shootOriginX, shootOriginY);
            const dx = tPos.x - shootOriginX;
            const dy = tPos.y - shootOriginY;
            const dist = Math.hypot(dx, dy) || 1;
            const initialSpeed = 6;

            spawnEnemyBullet({
              type: 'rocket',
              x: shootOriginX,
              y: shootOriginY,
              vx: (dx / dist) * initialSpeed, // 플레이어 방향을 향해 초기 발사
              vy: (dy / dist) * initialSpeed - 2.5, // 살짝 솟구치며 발사
              targetX: tPos.x,
              targetY: tPos.y,
              angle: Math.atan2(dy, dx),
              dmg: dmg,
              color: '#ec4899',
              size: 14,
              life: 240,
              tailTimer: 0
            });
          }
        }
      }

      // 3.5. [2페이즈 KAITEN FX Mk.0] 거대 메카 보스 등장 시네마틱 시퀀스 및 실전 AI
      if (isPhase2Active && typeof kaitenFx !== 'undefined') {
        if (currentMode === 'duo' && myRole === 'guest_striker') {
          // 2P 게스트: 보스 등장 시네마틱 타이머만 진행 (공격 및 세부 상태는 호스트가 동기화)
          if (kaitenFx.introState !== 'none' && kaitenFx.introState !== 'ready') {
            kaitenFx.introTimer -= dt;
            if (kaitenFx.introTimer <= 0) {
              if (kaitenFx.introState === 'fade_out') {
                kaitenFx.introState = 'docking';
                kaitenFx.introTimer = 1.5;
              } else if (kaitenFx.introState === 'docking') {
                kaitenFx.introState = 'head';
                kaitenFx.introTimer = 0.8;
              } else if (kaitenFx.introState === 'head') {
                kaitenFx.introState = 'eye_flash';
                kaitenFx.introTimer = 0.7;
              } else if (kaitenFx.introState === 'eye_flash') {
                kaitenFx.introState = 'explosion';
                kaitenFx.introTimer = 1.2;
              } else if (kaitenFx.introState === 'explosion') {
                kaitenFx.introState = 'ready';
                kaitenFx.isActive = true;
                kaitenFx.introTimer = 0;
              }
            }
          }
        } else {
        // A. 보스 소환 시작 트리거 (호스트 또는 싱글플레이어)
        if (!kaitenFx.isSpawned && kaitenFx.introState === 'none') {
          kaitenFx.isSpawned = true;
          kaitenFx.introState = 'fade_out'; // 1) 페이드아웃 및 긴장 고조
          kaitenFx.introTimer = 0.8;
          kaitenFx.introProgress = 0;
          kaitenFx.x = Math.round(WORLD_WIDTH * 0.5 - kaitenFx.width / 2); // 맵 중앙에서 웅장하게 출현
          kaitenFx.y = 0;
          kaitenFx.facing = playerCenterX < (kaitenFx.x + kaitenFx.width / 2) ? -1 : 1;
          addDamageText(kaitenFx.x + kaitenFx.width / 2, groundY - 260, '⚡ [EMERGENCY] 거대 합체 카이텐 FX Mk.0 기동!', '#ef4444');
        }

        // B. 등장 시네마틱 단계별 상태 머신 진행
        if (kaitenFx.isSpawned && kaitenFx.introState !== 'none' && kaitenFx.introState !== 'ready') {
          kaitenFx.introTimer -= dt;

          if (kaitenFx.introState === 'fade_out') {
            kaitenFx.introProgress = 1 - Math.max(0, kaitenFx.introTimer / 0.8);
            if (kaitenFx.introTimer <= 0) {
              kaitenFx.introState = 'docking'; // 2) 사방에서 파츠 비행 도킹 (1.5초)
              kaitenFx.introTimer = 1.5;
              kaitenFx.introProgress = 0;
              addDamageText(kaitenFx.x + kaitenFx.width / 2, groundY - 220, '🍣 [DOCKING] 전 파츠 고속 비행 도킹 결합!', '#f59e0b');
            }
          } else if (kaitenFx.introState === 'docking') {
            kaitenFx.introProgress = 1 - Math.max(0, kaitenFx.introTimer / 1.5);
            if (kaitenFx.introTimer <= 0) {
              kaitenFx.introState = 'head'; // 3) 머리 헤드 팝업 슬라이드 (0.8초)
              kaitenFx.introTimer = 0.8;
              kaitenFx.introProgress = 0;
              addDamageText(kaitenFx.x + kaitenFx.width / 2, groundY - 270, '🤖 [HEAD ON] 셰프 메카 페이스 락온!', '#38bdf8');
            }
          } else if (kaitenFx.introState === 'head') {
            kaitenFx.introProgress = 1 - Math.max(0, kaitenFx.introTimer / 0.8);
            if (kaitenFx.introTimer <= 0) {
              kaitenFx.introState = 'eye_flash'; // 4) 눈빛 번쩍 & 안광 크로스 (0.7초)
              kaitenFx.introTimer = 0.7;
              kaitenFx.introProgress = 0;
              addDamageText(kaitenFx.x + kaitenFx.width / 2, groundY - 250, '✨ [FLASH] "정의의 회전초밥, 카이텐 FX Mk.0 완ㆍ성!"', '#fde047');
            }
          } else if (kaitenFx.introState === 'eye_flash') {
            kaitenFx.introProgress = 1 - Math.max(0, kaitenFx.introTimer / 0.7);
            if (kaitenFx.introTimer <= 0) {
              kaitenFx.introState = 'explosion'; // 5) 등 뒤 거대 후광 폭발 (1.2초)
              kaitenFx.introTimer = 1.2;
              kaitenFx.introProgress = 0;
              addDamageText(kaitenFx.x + kaitenFx.width / 2, groundY - 140, '💥 BOOOOOOOM! 💥', '#ef4444');
            }
          } else if (kaitenFx.introState === 'explosion') {
            kaitenFx.introProgress = 1 - Math.max(0, kaitenFx.introTimer / 1.2);
            if (kaitenFx.introTimer <= 0) {
              // 6) 시네마틱 종료 ➔ 실전 75도 측면 전투 모드 개시!
              kaitenFx.introState = 'ready';
              kaitenFx.isActive = true;
              kaitenFx.introProgress = 1;
              kaitenFx.normalAttackTimer = 1.0; // 전투 시작 1초 후 첫 평타 발동
              addDamageText(kaitenFx.x + kaitenFx.width / 2, groundY - 180, '⚔️ PHASE 2 BATTLE START!', '#dc2626');
            }
          }
        }

        // C. [실전 전투 AI & 물리 이동 & 미니건 평타 패턴]
        if (kaitenFx.isSpawned && !kaitenFx.isDead && kaitenFx.introState === 'ready') {
          // [FOX 45식: 철벽의 방어 기절 타이머]
          const isFxStunned = (kaitenFx.stunTimer > 0);
          if (isFxStunned) {
            kaitenFx.stunTimer -= dt;
            if (kaitenFx.stunTimer <= 0) {
              kaitenFx.stunTimer = 0;
              addDamageText(kaitenFx.x + kaitenFx.width / 2, groundY - 240, '✅ KAITEN FX 기절 회복', '#22c55e');
            }
          }

          // [FOX 45식: 공세 전환 치명 대미지 저항률 감소 디버프 타이머]
          if (kaitenFx.critDmgResistDebuffTimer > 0) {
            kaitenFx.critDmgResistDebuffTimer -= dt;
            if (kaitenFx.critDmgResistDebuffTimer <= 0) {
              kaitenFx.critDmgResistDebuffTimer = 0;
              kaitenFx.critDmgResistDebuff = 0;
            }
          }

          // [WHITE FANG: 라이딩 그레네이드 공격력 감소 디버프 타이머]
          if (kaitenFx.atkDebuffTimer > 0) {
            kaitenFx.atkDebuffTimer -= dt;
            if (kaitenFx.atkDebuffTimer <= 0) {
              kaitenFx.atkDebuffTimer = 0;
              kaitenFx.atkDebuffRatio = 0;
            }
          }

          if (!isFxStunned) {
          // 1) 플레이어 방향 자동 지향 (facing: 1 또는 -1)
          const fxCenterX = kaitenFx.x + kaitenFx.width / 2;
          kaitenFx.facing = playerCenterX < fxCenterX ? -1 : 1;

          // 2) 횡스크롤 거대 메카 이동 물리: 후퇴(백무빙) 없이 플레이어를 향해 묵직하고 당당하게 전진 압박!
          const distToPlayer = Math.abs(playerCenterX - fxCenterX);
          const stopDist = 180; // 초근접 사거리 전까지 계속 전진
          kaitenFx.isMoving = false;
          if (!kaitenFx.isFiringSkill && !kaitenFx.isSlashing) {
            if (distToPlayer > stopDist) {
              // 플레이어를 향해 묵직하고 위압적으로 계속 전진!
              const moveDir = playerCenterX > fxCenterX ? 1 : -1;
              kaitenFx.x += moveDir * kaitenFx.speed * 60 * dt;
              kaitenFx.isMoving = true;
              kaitenFx.walkCycleTimer = (kaitenFx.walkCycleTimer || 0) + dt * 4.2; // 묵직한 보행 템포
            }
          }

          // 맵 경계 제한 (200 ~ WORLD_WIDTH - 250)
          kaitenFx.x = Math.max(200, Math.min(WORLD_WIDTH - 250, kaitenFx.x));

          // 2.5) 플라즈마 실드 3초 비주얼 타이머 & 가슴 해치 오픈 타이머 갱신
          if (kaitenFx.shieldVisualTimer > 0) {
            kaitenFx.shieldVisualTimer -= dt;
            if (kaitenFx.shieldVisualTimer < 0) kaitenFx.shieldVisualTimer = 0;
          }
          if (kaitenFx.chestHatchTimer > 0) {
            kaitenFx.chestHatchTimer -= dt;
            if (kaitenFx.chestHatchTimer < 0) kaitenFx.chestHatchTimer = 0;
          }

          // 2.6) 플레이어 위치 추적 조준 각도 갱신 (오른팔 개틀링 조준 각도: 상향 -35도 ~ 초근접 직하강 +86도)
          const shoulderWorldX = fxCenterX - (kaitenFx.facing * 23);
          const shoulderWorldY = groundY - 270;
          const aimTarget = getEnemyTargetPos(shoulderWorldX, shoulderWorldY);
          const targetDx = (aimTarget.x - shoulderWorldX) * kaitenFx.facing; // 보스 전방 거리
          const targetDy = aimTarget.y - shoulderWorldY; // 플레이어 중심까지의 수직 낙차 (지면 기준 약 +235px)

          // 초근접 시 바로 발밑의 플레이어도 정확히 조준할 수 있도록 (X거리 3px 이상이면 직하강 조준)
          const effDx = Math.max(3, targetDx);
          const rawAimAngle = Math.atan2(targetDy, effDx);
          // -35도(-0.61 rad) 상향부터 초근접 직하강 +86도(+1.50 rad)까지 완벽 조준!
          const clampedAim = Math.max(-0.61, Math.min(1.50, rawAimAngle));
          kaitenFx.aimAngle = (kaitenFx.aimAngle || 0) + (clampedAim - (kaitenFx.aimAngle || 0)) * Math.min(1, dt * 18);

          // 3) [원작 메카 평타]: 0.5초 동안 미니건 15발 고속 난사 패턴
          if (!kaitenFx.isFiringSkill && !kaitenFx.isSlashing) {
            if (kaitenFx.isFiringNormal) {
              kaitenFx.normalBurstTimer += dt;
              if (kaitenFx.normalBurstTimer >= 0.033) { // 약 33ms마다 1발 = 0.5초 동안 15발
                kaitenFx.normalBurstTimer = 0;
                kaitenFx.normalBurstCount--;

                // 미니건 발사 위치: 핑크 팔뚝 상단에 마운트된 개틀링 총구 끝 (렌더링 좌표와 100% 일치)
                const shootAngle = kaitenFx.aimAngle || 0;
                const distToTarget = Math.hypot(targetDx, targetDy);
                const armMuzzleDist = Math.min(176, Math.max(35, distToTarget - 25));
                const armMuzzleX = shoulderWorldX + kaitenFx.facing * Math.cos(shootAngle) * armMuzzleDist;
                const armMuzzleY = shoulderWorldY + Math.sin(shootAngle) * armMuzzleDist;
                const bulletSpeed = 16.5;
                const spread = (Math.random() - 0.5) * 1.0;

                spawnEnemyBullet({
                  type: 'fx_minigun',
                  isEnemyBullet: true,
                  x: armMuzzleX,
                  y: armMuzzleY,
                  vx: kaitenFx.facing * Math.cos(shootAngle) * bulletSpeed + spread,
                  vy: Math.sin(shootAngle) * bulletSpeed + spread,
                  dmg: Math.round(280 * (kaitenFx.atkDebuffTimer > 0 ? (1.0 - (kaitenFx.atkDebuffRatio || 0.30)) : 1.0)),
                  color: '#fbbf24',
                  size: 5,
                  life: 130
                });

                // 총구 스파크 파티클
                if (specialParticles.length < 80) {
                  specialParticles.push({
                    type: 'spark',
                    x: armMuzzleX,
                    y: armMuzzleY,
                    vx: kaitenFx.facing * (Math.random() * 4 + 2),
                    vy: (Math.random() - 0.5) * 4,
                    color: '#f59e0b',
                    size: Math.random() * 3 + 1,
                    life: 8,
                    maxLife: 8,
                    alpha: 1
                  });
                }

                if (kaitenFx.normalBurstCount <= 0) {
                  kaitenFx.isFiringNormal = false;
                  kaitenFx.normalAttackTimer = 0; // 쿨타임 시작
                }
              }
            } else {
              kaitenFx.normalAttackTimer += dt;
              if (kaitenFx.normalAttackTimer >= kaitenFx.normalAttackCooldown) {
                // 평타 쿨타임 충족 -> 15발 난사 개시!
                kaitenFx.isFiringNormal = true;
                kaitenFx.normalBurstCount = 15;
                kaitenFx.normalBurstTimer = 0;
                addDamageText(fxCenterX, groundY - 240, '⚡ SUPER GATLING (15 BURST)!', '#f59e0b');
              }
            }
          }

          // 4) [원작 핵심 기믹]: 20초 파츠 순환 사이클 ([무한히 타오르는 뜨거운 마음])
          const cycleOrder = ['pink', 'red', 'green'];
          const intactParts = cycleOrder.filter(p => !kaitenFx.parts[p].isBroken);

          if (intactParts.length === 0) {
            kaitenFx.activePart = 'none';
            kaitenFx.shieldActive = false;
            kaitenFx.isFiringSkill = false;
          } else {
            if (kaitenFx.activePart === 'none' || (kaitenFx.parts[kaitenFx.activePart] && kaitenFx.parts[kaitenFx.activePart].isBroken)) {
              kaitenFx.activePart = intactParts[0];
              kaitenFx.partCycleTimer = 0;
              kaitenFx.partSkillDelayTimer = 2.0;
              kaitenFx.partSkillTriggered = false;
              if (kaitenFx.activePart !== 'green') kaitenFx.shieldActive = false;
            }

            kaitenFx.partCycleTimer += dt;
            if (kaitenFx.partCycleTimer >= kaitenFx.partCycleDuration) {
              kaitenFx.partCycleTimer = 0;

              const curIdx = cycleOrder.indexOf(kaitenFx.activePart);
              let nextPart = null;
              for (let step = 1; step <= cycleOrder.length; step++) {
                const candidate = cycleOrder[(curIdx + step) % cycleOrder.length];
                if (!kaitenFx.parts[candidate].isBroken) {
                  nextPart = candidate;
                  break;
                }
              }

              if (nextPart) {
                kaitenFx.activePart = nextPart;
                if (nextPart !== 'green') kaitenFx.shieldActive = false;
                kaitenFx.partSkillDelayTimer = 2.0;
                kaitenFx.partSkillTriggered = false;

                const partObj = kaitenFx.parts[nextPart];
                addDamageText(fxCenterX, groundY - 260, `🔄 [파츠 전환] ${partObj.name}`, partObj.color);
              }
            }
          }

          // 5) 파츠별 고유 액티브 스킬 발동 (전환 2초 후 1회 시전)
          if (!kaitenFx.partSkillTriggered && !kaitenFx.isSlashing) {
            kaitenFx.partSkillDelayTimer -= dt;
            if (kaitenFx.partSkillDelayTimer <= 0) {
              kaitenFx.partSkillTriggered = true;
              const activeP = kaitenFx.parts[kaitenFx.activePart];

              if (activeP.isBroken) {
                addDamageText(fxCenterX, groundY - 240, `⚠️ [스킬 취소] ${activeP.name} 파괴 상태로 스킬 불발!`, '#94a3b8');
              } else {
                if (kaitenFx.activePart === 'pink') {
                  // [스킬 1 - 핑크]: 무한회전ㆍ슈퍼 새우 머신건 (평타 3배의 45발 폭풍 난사)
                  kaitenFx.isFiringSkill = true;
                  kaitenFx.skillBurstCount = 45;
                  kaitenFx.skillBurstTimer = 0;
                  addDamageText(fxCenterX, groundY - 250, '🦐 [무한회전ㆍ슈퍼 새우 머신건] 45발 폭풍 난사!', '#ec4899');
                } else if (kaitenFx.activePart === 'red') {
                  // [스킬 2 - 레드]: 무한회전ㆍ하이퍼 정어리 미사일 (가슴 해치 오픈 + 8발 호밍 미사일)
                  kaitenFx.isFiringSkill = true;
                  kaitenFx.missileVolleyCount = 8; // 8발 순차 발사
                  kaitenFx.missileVolleyTimer = 0;
                  kaitenFx.chestHatchTimer = 2.6;  // 가슴 해치 오픈 애니메이션
                  addDamageText(fxCenterX, groundY - 250, '🐟 [무한회전ㆍ하이퍼 정어리 미사일] 해치 오픈! 8연발 락온 사출!', '#ef4444');
                } else if (kaitenFx.activePart === 'green') {
                  // [스킬 3 - 그린]: 무한회전ㆍ울트라 뚜껑 실드 (3초간 플라즈마 보호막 전개, 스킬 25회 피격 대미지 감소)
                  kaitenFx.shieldActive = true;
                  kaitenFx.shieldHitCount = 0;
                  kaitenFx.shieldVisualTimer = 3.0; // 3초간 파란색 플라즈마 보호막 전개
                  addDamageText(fxCenterX, groundY - 250, '🛡️ [무한회전ㆍ울트라 뚜껑 실드] 플라즈마 배리어 3초 전개 (25회 방어)!', '#22c55e');
                }
              }
            }
          }

          // 6) 파츠 스킬 탄환 발사 로직 처리
          if (kaitenFx.isFiringSkill) {
            // [핑크 스킬: 45발 고속 난사]
            if (kaitenFx.activePart === 'pink' && kaitenFx.skillBurstCount > 0) {
              kaitenFx.skillBurstTimer += dt;
              if (kaitenFx.skillBurstTimer >= 0.025) { // 25ms마다 1발
                kaitenFx.skillBurstTimer = 0;
                kaitenFx.skillBurstCount--;

                // 핑크 팔뚝 상단에 마운트된 개틀링 총구 위치 (렌더링 좌표와 100% 일치)
                const shootAngle = kaitenFx.aimAngle || 0;
                const distToTarget = Math.hypot(targetDx, targetDy);
                const armMuzzleDist = Math.min(176, Math.max(35, distToTarget - 25));
                const armMuzzleX = shoulderWorldX + kaitenFx.facing * Math.cos(shootAngle) * armMuzzleDist;
                const armMuzzleY = shoulderWorldY + Math.sin(shootAngle) * armMuzzleDist;
                const spread = (Math.random() - 0.5) * 1.8;

                spawnEnemyBullet({
                  type: 'fx_super_gatling',
                  isEnemyBullet: true,
                  x: armMuzzleX,
                  y: armMuzzleY,
                  vx: kaitenFx.facing * Math.cos(shootAngle) * 18 + spread,
                  vy: Math.sin(shootAngle) * 18 + spread,
                  dmg: Math.round(350 * (kaitenFx.atkDebuffTimer > 0 ? (1.0 - (kaitenFx.atkDebuffRatio || 0.30)) : 1.0)),
                  color: '#f472b6',
                  size: 6,
                  life: 140
                });

                if (kaitenFx.skillBurstCount <= 0) {
                  kaitenFx.isFiringSkill = false;
                }
              }
            }

            // [레드 스킬: 8발 정어리 미사일 순차 발사]
            if (kaitenFx.activePart === 'red' && kaitenFx.missileVolleyCount > 0) {
              kaitenFx.missileVolleyTimer += dt;
              if (kaitenFx.missileVolleyTimer >= 0.11) { // 110ms마다 1발씩 발사
                kaitenFx.missileVolleyTimer = 0;
                kaitenFx.missileVolleyCount--;

                const chestX = fxCenterX + (kaitenFx.facing * 35);
                const chestY = groundY - 250; // 열린 가슴 해치 위치
                const baseAngle = kaitenFx.facing > 0 ? 0 : Math.PI;
                // 전방으로 랜덤한 각도로 흩뿌려짐 (-45도 ~ +30도)
                const spreadAngle = baseAngle + ((Math.random() - 0.5) * 55) * (Math.PI / 180);
                const launchSpeed = 8 + Math.random() * 4;

                spawnEnemyBullet({
                  type: 'fx_sardine_missile',
                  isEnemyBullet: true,
                  x: chestX,
                  y: chestY,
                  vx: Math.cos(spreadAngle) * launchSpeed,
                  vy: Math.sin(spreadAngle) * launchSpeed - 1.5,
                  state: 'launch',
                  stateTimer: 0,
                  lockonDelay: 0.22,
                  lockonDuration: 0.5,
                  targetChosen: false,
                  targetEntity: null,
                  dmg: Math.round(1100 * (kaitenFx.atkDebuffTimer > 0 ? (1.0 - (kaitenFx.atkDebuffRatio || 0.30)) : 1.0)),
                  color: '#ef4444',
                  size: 11,
                  life: 240,
                  tailTimer: 0
                });

                if (kaitenFx.missileVolleyCount <= 0) {
                  kaitenFx.isFiringSkill = false;
                }
              }
            }
          }

          // 7) [원작 최종 필살기]: ATG 게이지 시스템 (Active Time Gauge)
          //    - 45초 동안 지속 충전 (0 -> 100%)
          //    - 100% 도달 시 즉사급 광역 일도양단 궁극기 [하이퍼 고등어 슬래쉬] 발동!
          if (!kaitenFx.isSlashing) {
            kaitenFx.atgTimer += dt;
            kaitenFx.atg = Math.min(100, (kaitenFx.atgTimer / kaitenFx.atgMaxDuration) * 100);

            if (kaitenFx.atg >= 100) {
              // ATG 100% 완전 충전 -> 궁극기 시전 시작!
              kaitenFx.isSlashing = true;
              kaitenFx.slashPhase = 'charge'; // 'charge'(1.5초 기모으기) -> 'slash'(0.4초 참격) -> 'recover'(0.8초 후딜)
              kaitenFx.slashTimer = 1.5;
              kaitenFx.isFiringNormal = false;
              kaitenFx.isFiringSkill = false;
              addDamageText(fxCenterX, groundY - 270, '⚡ [ATG MAX] 필살기: 하이퍼 고등어 슬래쉬 충전 개시!', '#facc15');
            }
          } else {
            // [하이퍼 고등어 슬래쉬 3단계 연출 시퀀스]
            kaitenFx.slashTimer -= dt;

            if (kaitenFx.slashPhase === 'charge') {
              // 1단계: 1.5초간 검을 치켜들고 황금빛 기를 모음 (강력한 경고 섬광)
              if (Math.random() < 0.4 && specialParticles.length < 80) {
                specialParticles.push({
                  type: 'spark',
                  x: fxCenterX + (kaitenFx.facing * 30) + (Math.random() - 0.5) * 60,
                  y: groundY - 180 + (Math.random() - 0.5) * 80,
                  vx: -kaitenFx.facing * (Math.random() * 3 + 1),
                  vy: -Math.random() * 5 - 2,
                  color: '#facc15',
                  size: Math.random() * 4 + 2,
                  life: 16,
                  maxLife: 16,
                  alpha: 1
                });
              }

              if (kaitenFx.slashTimer <= 0) {
                // 2단계: 0.4초간 전방을 향해 맹렬하게 횡베기 일도양단!
                kaitenFx.slashPhase = 'slash';
                kaitenFx.slashTimer = 0.4;
                kaitenFx.slashHitDealt = false;

                // 전방으로 뿜어져 나가는 거대 초승달 고등어 검기 참격파 생성 (카이텐 FX 전체 크기 높이 360px, 푸른색 반달 검격)
                const slashDir = kaitenFx.facing;
                spawnEnemyBullet({
                  type: 'fx_mackerel_slash_wave',
                  isEnemyBullet: true,
                  isPiercing: true,
                  x: fxCenterX + slashDir * 60,
                  y: groundY - 180, // 중심 높이 180 -> 높이 360이므로 groundY - 360부터 지면(groundY)까지 완벽 커버!
                  vx: slashDir * 22,
                  vy: 0,
                  angle: slashDir > 0 ? 0 : Math.PI,
                  dmg: Math.round(38000 * (kaitenFx.atkDebuffTimer > 0 ? (1.0 - (kaitenFx.atkDebuffRatio || 0.30)) : 1.0)), // 즉사급 초절정 피해
                  width: 120,
                  height: 360,
                  color: '#00e5ff',
                  life: 80,
                  hitTargets: {}
                });

                if (typeof triggerScreenShake === 'function') {
                  triggerScreenShake(25, 0.45);
                }
                addDamageText(fxCenterX, groundY - 260, '⚡ FINAL MACKEREL SLASH!', '#00e5ff');
              }
            } else if (kaitenFx.slashPhase === 'slash') {
              if (kaitenFx.slashTimer <= 0) {
                // 3단계: 0.8초간 후딜레이 및 ATG 초기화
                kaitenFx.slashPhase = 'recover';
                kaitenFx.slashTimer = 0.8;
              }
            } else if (kaitenFx.slashPhase === 'recover') {
              if (kaitenFx.slashTimer <= 0) {
                // 참격 완전 종료
                kaitenFx.isSlashing = false;
                kaitenFx.slashPhase = 'none';
                kaitenFx.atgTimer = 0;
                kaitenFx.atg = 0;
              }
            }
          }
        }
        }
      }
    }

      // 4. 탄환 이동 및 판정
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];

        if (b.type === 'rocket') {
          // 로켓의 유도 추적 및 현재 비행 각도 동기화
          b.tailTimer = (b.tailTimer || 0) + 1;
          const dx = playerCenterX - b.x;
          const dy = playerCenterY - b.y;
          const dist = Math.hypot(dx, dy) || 1;
          b.vx += (dx / dist) * 0.35;
          b.vy += (dy / dist) * 0.22;
          // 최고 속도 제한
          b.vx = Math.max(-11, Math.min(11, b.vx));
          b.vy = Math.max(-8, Math.min(8, b.vy));
          // 날아가는 방향 각도 갱신
          b.angle = Math.atan2(b.vy, b.vx);
        } else if (b.type === 'abi_missile' || b.type === 'white_fang_missile') {
          // [유도 미사일 호밍 물리 (6프레임 간격 탐색 최적화)]
          b.retargetTimer = (b.retargetTimer || 0) + 1;
          if (b.retargetTimer % 6 === 1 || !b.targetKaiten || b.targetKaiten.isDead || !b.targetKaiten.isSpawned) {
            const found = getClosestActiveEnemy(b.x, b.y);
            b.targetKaiten = found ? found.entity : null;
          }
          if (b.targetKaiten && !b.targetKaiten.isDead && b.targetKaiten.isSpawned) {
            const isBoss = (b.targetKaiten.width !== undefined && b.targetKaiten.height !== undefined);
            const tCenterX = isBoss ? (b.targetKaiten.x + b.targetKaiten.width / 2) : (b.targetKaiten.x + b.targetKaiten.size / 2);
            const tCenterY = isBoss ? ((canvas.height - GROUND_OFFSET) - b.targetKaiten.height / 2) : ((canvas.height - GROUND_OFFSET) - (b.targetKaiten.jumpY || 0) - b.targetKaiten.size / 2);
            const dx = tCenterX - b.x;
            const dy = tCenterY - b.y;
            const dist = Math.hypot(dx, dy) || 1;
            const targetSpeed = b.type === 'white_fang_missile' ? 26 : 28;
            const targetVx = (dx / dist) * targetSpeed;
            const targetVy = (dy / dist) * targetSpeed;
            const turnFactor = b.type === 'white_fang_missile' ? 0.28 : 0.22;
            b.vx += (targetVx - b.vx) * turnFactor;
            b.vy += (targetVy - b.vy) * turnFactor;
            b.angle = Math.atan2(b.vy, b.vx);
          }
          // 미사일 후방 추진체 파티클 (3프레임마다 1개 생성 및 상한선 적용으로 렉 방지)
          b.smokeTimer = (b.smokeTimer || 0) + 1;
          if (b.smokeTimer % 2 === 0 && specialParticles.length < 80) {
            specialParticles.push({
              type: 'spark',
              x: b.x - Math.cos(b.angle || 0) * 8,
              y: b.y - Math.sin(b.angle || 0) * 8,
              vx: -Math.cos(b.angle || 0) * 3 + (Math.random() - 0.5) * 1.5,
              vy: -Math.sin(b.angle || 0) * 3 + (Math.random() - 0.5) * 1.5,
              color: b.type === 'white_fang_missile' ? '#22d3ee' : '#38bdf8',
              size: Math.random() * 2 + 1,
              life: 12,
              maxLife: 12,
              alpha: 1
            });
          }
        } else if (b.type === 'fx_sardine_missile') {
          // [하이퍼 정어리 미사일: 3단계 락온 & 확률 타겟팅 물리]
          b.tailTimer = (b.tailTimer || 0) + 1;
          b.stateTimer = (b.stateTimer || 0) + dt;

          if (b.state === 'launch') {
            // 1단계 (사출 직후 0.22초): 전방으로 랜덤하게 흩뿌려지며 서서히 감속
            b.vx *= 0.95;
            b.vy *= 0.95;
            if (b.stateTimer >= b.lockonDelay) {
              b.state = 'lockon';
              b.stateTimer = 0;
            }
          } else if (b.state === 'lockon') {
            // 2단계 (0.5초 락온): 속도가 급격히 줄어들며 공중에 부유하듯 정지 & 타깃 조준!
            b.vx *= 0.76;
            b.vy *= 0.76;

            // 락온 시작 시 1회 대상 결정 (75% 가장 가까움, 20% 가장 멂, 5% 전방 랜덤)
            if (!b.targetChosen) {
              b.targetChosen = true;
              const p1Dist = Math.hypot(player.x - b.x, (groundY - player.height / 2) - b.y);
              const hasP2 = (currentMode === 'duo' && remotePlayer && remotePlayer.isActive);
              const p2Dist = hasP2 ? Math.hypot(remotePlayer.x - b.x, (remotePlayer.y + remotePlayer.height / 2) - b.y) : Infinity;

              let closestTarget = player;
              let farthestTarget = player;
              if (hasP2) {
                if (p2Dist < p1Dist) {
                  closestTarget = remotePlayer;
                  farthestTarget = player;
                } else {
                  closestTarget = player;
                  farthestTarget = remotePlayer;
                }
              }

              const roll = Math.random();
              if (roll < 0.75) {
                // 75% 확률: 가장 가까운 플레이어
                b.targetEntity = closestTarget;
              } else if (roll < 0.95 && hasP2) {
                // 20% 확률: 가장 멀리 있는 플레이어 (솔로면 가까운 플레이어)
                b.targetEntity = farthestTarget;
              } else {
                // 5% 확률: 랜덤 방향 (단, 하늘 위는 안 됨! 수평~하향 방향)
                b.targetEntity = null;
                const fxFacing = (typeof kaitenFx !== 'undefined') ? kaitenFx.facing : -1;
                // 각도: -0.2 rad ~ +0.6 rad (전방 수평에서 지면 방향)
                const randAngle = (fxFacing > 0 ? 0 : Math.PI) + (Math.random() * 0.8 - 0.2);
                b.strayDir = {
                  x: Math.cos(randAngle),
                  y: Math.max(0.12, Math.sin(randAngle)) // 절대 하늘 위(음수) 불가!
                };
              }
            }

            // 0.5초 락온 후 'homing' 상태로 전환하며 강력 재가속!
            if (b.stateTimer >= b.lockonDuration) {
              b.state = 'homing';
              b.stateTimer = 0;
              if (b.targetEntity) {
                const tCenterX = b.targetEntity.x + (b.targetEntity.width / 2);
                const tCenterY = (b.targetEntity === player ? (groundY - player.height / 2) : (b.targetEntity.y + b.targetEntity.height / 2));
                const hDx = tCenterX - b.x;
                const hDy = tCenterY - b.y;
                const hDist = Math.hypot(hDx, hDy) || 1;
                b.vx = (hDx / hDist) * 16.5;
                b.vy = (hDy / hDist) * 16.5;
              } else if (b.strayDir) {
                b.vx = b.strayDir.x * 16.5;
                b.vy = b.strayDir.y * 16.5;
              }
            }
          } else {
            // 3단계 (유도 돌격): 타깃을 향해 궤도를 예리하게 꺾으며 급가속 돌진!
            if (b.targetEntity) {
              const tCenterX = b.targetEntity.x + (b.targetEntity.width / 2);
              const tCenterY = (b.targetEntity === player ? (groundY - player.height / 2) : (b.targetEntity.y + b.targetEntity.height / 2));
              const hDx = tCenterX - b.x;
              const hDy = tCenterY - b.y;
              const hDist = Math.hypot(hDx, hDy) || 1;
              b.vx += (hDx / hDist) * 0.85;
              b.vy += (hDy / hDist) * 0.75;
              const curSpeed = Math.hypot(b.vx, b.vy);
              if (curSpeed > 17.5) {
                b.vx = (b.vx / curSpeed) * 17.5;
                b.vy = (b.vy / curSpeed) * 17.5;
              }
            }
          }

          b.angle = Math.atan2(b.vy, b.vx);

          if (b.tailTimer % 2 === 0 && specialParticles.length < 80) {
            specialParticles.push({
              type: 'spark',
              x: b.x - Math.cos(b.angle || 0) * 8,
              y: b.y - Math.sin(b.angle || 0) * 8,
              vx: -Math.cos(b.angle || 0) * 2,
              vy: -Math.sin(b.angle || 0) * 2,
              color: '#ef4444',
              size: 2.5,
              life: 10,
              maxLife: 10,
              alpha: 1
            });
          }
        }

        b.x += b.vx;
        b.y += b.vy;
        b.life--;

        // 바닥 충돌 시 폭발 (로켓 및 아비 에슈흐 / 화력지원 드론 미사일 / 정어리 미사일)
        if ((b.type === 'rocket' || b.type === 'fx_sardine_missile') && b.y >= groundY - 10) {
          explosions.push({
            x: b.x,
            y: groundY,
            radius: 8,
            maxRadius: b.type === 'fx_sardine_missile' ? 85 : 75,
            dmg: b.dmg,
            hasDealtDamage: false,
            color: b.type === 'fx_sardine_missile' ? '#ef4444' : '#ec4899',
            alpha: 1,
            isSardineMissile: (b.type === 'fx_sardine_missile')
          });
          bullets.splice(i, 1);
          continue;
        }
        if (b.type === 'riding_grenade' || b.type === 'color_grenade') {
          if (b.gravity) b.vy += b.gravity;
          if (b.y >= groundY - 10 || b.life <= 0) {
            if (b.type === 'color_grenade') {
              triggerColorGrenadeExplosion(b.x, groundY - 10, b.dmg);
            } else {
              triggerRidingGrenadeExplosion(b.x, groundY - 10, b.dmg);
            }
            bullets.splice(i, 1);
            continue;
          }
        }
        if ((b.type === 'abi_missile' || b.type === 'white_fang_missile') && (b.y >= groundY - 6 || b.life <= 0)) {
          if (b.type === 'white_fang_missile') {
            triggerWhiteFangMissileExplosion(b.x, Math.min(groundY - 10, b.y), b.dmg);
          } else {
            triggerAbiMissileExplosion(b.x, Math.min(groundY - 10, b.y), b.dmg);
          }
          bullets.splice(i, 1);
          continue;
        }
        if (b.type === 'fox_shield_slam' && (b.life <= 0 || b.y >= groundY - 10)) {
          explosions.push({
            x: b.x,
            y: b.y,
            radius: 8,
            maxRadius: 36,
            dmg: 0,
            hasDealtDamage: true,
            isFriendly: true,
            color: b.color || '#f59e0b',
            alpha: 1
          });
          bullets.splice(i, 1);
          continue;
        }

        // 동료(원격 플레이어)의 탄환 처리 (화면 시각적 피격 스파크 연출만 수행하고 대미지 중복 연산 방지)
        if (b.isPeerBullet) {
          let hitPeerTarget = false;
          for (const k of kaitenzers) {
            if (!k.isSpawned || k.isDead || k.isRetreating) continue;
            const kY = groundY - (k.jumpY || 0) - k.size;
            if (b.x > k.x && b.x < k.x + k.size && b.y > kY && b.y < kY + k.size) {
              hitPeerTarget = true;
              break;
            }
          }
          if (!hitPeerTarget && typeof kaitenFx !== 'undefined' && kaitenFx.isSpawned && !kaitenFx.isDead && kaitenFx.introState !== 'none') {
            if (b.x > kaitenFx.x && b.x < kaitenFx.x + kaitenFx.width && b.y > groundY - kaitenFx.height && b.y < groundY) {
              hitPeerTarget = true;
            }
          }
          if (hitPeerTarget) {
            if (b.type === 'riding_grenade') {
              triggerRidingGrenadeExplosion(b.x, b.y, 0);
            } else if (b.type === 'color_grenade') {
              triggerColorGrenadeExplosion(b.x, b.y, 0);
            } else if (b.type === 'white_fang_missile') {
              triggerWhiteFangMissileExplosion(b.x, b.y, 0);
            } else if (b.type === 'abi_missile') {
              triggerAbiMissileExplosion(b.x, b.y, 0);
            } else if (b.type === 'fox_shield_slam') {
              explosions.push({
                x: b.x,
                y: b.y,
                radius: 8,
                maxRadius: 42,
                dmg: 0,
                hasDealtDamage: true,
                isFriendly: true,
                color: b.color || '#f59e0b',
                alpha: 1
              });
              for (let p = 0; p < 12; p++) {
                specialParticles.push({
                  type: 'spark',
                  x: b.x,
                  y: b.y,
                  vx: (Math.random() - 0.5) * 10,
                  vy: (Math.random() - 0.5) * 10,
                  color: b.color || '#fbbf24',
                  size: Math.random() * 3 + 1.5,
                  life: 14,
                  maxLife: 14,
                  alpha: 1
                });
              }
            } else {
              if (typeof specialParticles !== 'undefined' && specialParticles.length < 80) {
                for (let s = 0; s < 3; s++) {
                  specialParticles.push({
                    type: 'spark',
                    x: b.x,
                    y: b.y,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
                    color: b.peerColor || b.color || '#38bdf8',
                    size: Math.random() * 2.5 + 1.5,
                    life: 10,
                    maxLife: 10,
                    alpha: 1
                  });
                }
              }
            }
            if (!b.isPiercing) {
              bullets.splice(i, 1);
              continue;
            }
          }
          continue;
        }

        // 플레이어 탄환 처리 (적이 맞았을 때: 탄환이 날아가는 실제 위치 기반 물리 충돌 판정)
        if (b.isPlayerBullet) {
          let hitKaiten = null;
          let hitFxBoss = null;

          // 1페이즈 카이텐저 멤버 충돌 판정
          for (const k of kaitenzers) {
            // 미등장 적이거나 체력이 다 달아 무력화되었거나 후퇴 중인 적은 맞지 않고 총알이 완전히 관통!
            if (!k.isSpawned || k.isDead || k.isRetreating) continue;
            // 관통탄 중복 피격 방지
            if (b.hitKaitenIds && b.hitKaitenIds.includes(k.id)) continue;

            const kY = groundY - (k.jumpY || 0) - k.size;
            if (
              b.x > k.x &&
              b.x < k.x + k.size &&
              b.y > kY &&
              b.y < kY + k.size
            ) {
              hitKaiten = k;
              break;
            }
          }

          // 2페이즈 KAITEN FX Mk.0 거대 보스 충돌 판정 (폭 180, 높이 240)
          if (!hitKaiten && typeof kaitenFx !== 'undefined' && kaitenFx.isSpawned && !kaitenFx.isDead && kaitenFx.introState !== 'none') {
            if (!b.hitKaitenIds || !b.hitKaitenIds.includes('kaiten_fx')) {
              const fxY = groundY - kaitenFx.height;
              if (
                b.x > kaitenFx.x &&
                b.x < kaitenFx.x + kaitenFx.width &&
                b.y > fxY &&
                b.y < groundY
              ) {
                hitFxBoss = kaitenFx;
              }
            }
          }

          // [2페이즈 보스 피격 처리]
          if (hitFxBoss) {
            if (b.isPiercing) {
              if (!b.hitKaitenIds) b.hitKaitenIds = [];
              b.hitKaitenIds.push('kaiten_fx');
            }

            if (b.type === 'abi_missile' || b.type === 'white_fang_missile') {
              if (b.type === 'white_fang_missile') {
                triggerWhiteFangMissileExplosion(b.x, b.y, b.dmg);
              } else {
                triggerAbiMissileExplosion(b.x, b.y, b.dmg);
              }
              bullets.splice(i, 1);
              continue;
            }

            if (b.type === 'riding_grenade' || b.type === 'color_grenade') {
              if (b.type === 'color_grenade') {
                triggerColorGrenadeExplosion(b.x, b.y, b.dmg);
              } else {
                triggerRidingGrenadeExplosion(b.x, b.y, b.dmg);
              }
              bullets.splice(i, 1);
              continue;
            }

            // 실드 가드 중인지 확인 (그린 파츠 활성화 & 실드 전개 시 대미지 50% 경감 및 피격 카운트)
            let dmgMult = 1.0;
            if (kaitenFx.shieldActive) {
              dmgMult = 0.5; // 실드 50% 뎀감
              // 메인스킬 1,2 타격 카운트
              if (b.isSkillBullet) {
                kaitenFx.shieldHitCount = (kaitenFx.shieldHitCount || 0) + 1;
                if (kaitenFx.shieldHitCount >= 15) {
                  kaitenFx.shieldActive = false;
                  addDamageText(kaitenFx.x + kaitenFx.width / 2, groundY - 180, '🛡️ [SHIELD BREAK] 실드 가드 파괴!', '#22c55e');
                }
              }
            }

            const combatResult = (typeof calculateFullCombatDamage === 'function')
              ? calculateFullCombatDamage({
                  attacker: {
                    accuracy: (b.accuracy !== undefined) ? b.accuracy : (player.accuracy || 0),
                    stability: (b.stability !== undefined) ? b.stability : (player.stability || 1500),
                    crit: (b.crit !== undefined) ? b.crit : (player.crit || 350),
                    critDmg: (b.critDmg !== undefined) ? b.critDmg : (player.critDmg || 350)
                  },
                  defender: kaitenFx,
                  baseDmg: b.dmg,
                  attackType: b.attackType || 'normal',
                  forceCrit: b.isCrit || false,
                  bonusCritDmg: player.isLightBeActive ? 155 : 0
                })
              : {
                  isHit: true,
                  damage: b.dmg,
                  isCrit: b.isCrit || false,
                  effectiveness: { mult: 1.0, label: 'NORMAL', color: '#ffffff' }
                };

            let finalDmg = Math.round(combatResult.damage * dmgMult);
            kaitenFx.hp = Math.max(0, kaitenFx.hp - finalDmg);

            // [2인 멀티플레이 동기화]: 2P 게스트 타격 시 1P 호스트에게 권위적 대미지 확정 전송
            if (currentMode === 'duo' && myRole === 'guest_striker' && typeof sendNetPacket === 'function') {
              sendNetPacket({
                type: 'ENEMY_DAMAGE',
                targetType: 'kaiten_fx',
                targetId: 'kaiten_fx',
                damage: finalDmg,
                isCrit: combatResult.isCrit,
                part: kaitenFx.activePart,
                stunDuration: b.stunDuration,
                critResistDebuff: b.critResistDebuff
              });
            }

            // 현재 활성 파츠 내구도 동시 차감
            if (kaitenFx.activePart && kaitenFx.parts[kaitenFx.activePart] && !kaitenFx.parts[kaitenFx.activePart].isBroken) {
              const curPart = kaitenFx.parts[kaitenFx.activePart];
              curPart.hp = Math.max(0, curPart.hp - finalDmg);
              if (curPart.hp <= 0) {
                curPart.hp = 0;
                curPart.isBroken = true;
                addDamageText(kaitenFx.x + kaitenFx.width / 2, groundY - 220, `💥 [${curPart.name}] 파괴 완료!`, curPart.color);
              }
            }

            if (combatResult.isCrit) {
              addDamageText(kaitenFx.x + kaitenFx.width / 2, groundY - 200, `CRIT! ${finalDmg.toLocaleString()}`, '#fbbf24');
            } else {
              addDamageText(kaitenFx.x + kaitenFx.width / 2, groundY - 180, `-${finalDmg.toLocaleString()}`, b.isSkillBullet ? '#f43f5e' : '#ffffff');
            }

            // [FOX 45식: 철벽의 방어 기절 & 공세 전환 디버프]
            if (b.type === 'fox_shield_slam') {
              kaitenFx.stunTimer = Math.max(kaitenFx.stunTimer || 0, b.stunDuration || 2.5);
              addDamageText(kaitenFx.x + kaitenFx.width / 2, groundY - 240, `⚡ 기절 [${(b.stunDuration || 2.5).toFixed(1)}s]`, '#facc15');
              // 단일 타겟 적중 시 소형 충격파 폭발 연출
              explosions.push({
                x: b.x,
                y: b.y,
                radius: 8,
                maxRadius: 42,
                dmg: 0,
                hasDealtDamage: true,
                isFriendly: true,
                color: b.color || '#f59e0b',
                alpha: 1
              });
              for (let p = 0; p < 12; p++) {
                specialParticles.push({
                  type: 'spark',
                  x: b.x,
                  y: b.y,
                  vx: (Math.random() - 0.5) * 10,
                  vy: (Math.random() - 0.5) * 10,
                  color: b.color || '#fbbf24',
                  size: Math.random() * 3 + 1.5,
                  life: 14,
                  maxLife: 14,
                  alpha: 1
                });
              }
            }
            if (b.type === 'fox_offensive_shift') {
              kaitenFx.critDmgResistDebuff = b.critResistDebuff || 22;
              kaitenFx.critDmgResistDebuffTimer = 10.0;
              addDamageText(kaitenFx.x + kaitenFx.width / 2, groundY - 240, `🎯 치명 저항 -${b.critResistDebuff}%!`, '#fb923c');
            }

            // 보스 사망 검사
            if (kaitenFx.hp <= 0) {
              kaitenFx.hp = 0;
              kaitenFx.isDead = true;
              addDamageText(kaitenFx.x + kaitenFx.width / 2, groundY - 250, '🎉 KAITEN FX Mk.0 격파 성공! MISSION COMPLETE!', '#10b981');
            }

            if (!b.isPiercing) {
              bullets.splice(i, 1);
              continue;
            }
          }

          if (hitKaiten) {
            if (b.isPiercing) {
              if (!b.hitKaitenIds) b.hitKaitenIds = [];
              b.hitKaitenIds.push(hitKaiten.id);
            }

            if (b.type === 'abi_missile' || b.type === 'white_fang_missile') {
              // 미사일 직격 시 즉시 범위 폭발 유발 후 소멸
              if (b.type === 'white_fang_missile') {
                triggerWhiteFangMissileExplosion(b.x, b.y, b.dmg);
              } else {
                triggerAbiMissileExplosion(b.x, b.y, b.dmg);
              }
              bullets.splice(i, 1);
              continue;
            }

            if (b.type === 'riding_grenade' || b.type === 'color_grenade') {
              // 수류탄 적 충돌 시 즉시 범위 폭발 유발 후 소멸
              if (b.type === 'color_grenade') {
                triggerColorGrenadeExplosion(b.x, b.y, b.dmg);
              } else {
                triggerRidingGrenadeExplosion(b.x, b.y, b.dmg);
              }
              bullets.splice(i, 1);
              continue;
            }

            // 블랙의 [전술 지휘] 버프 시 받는 피해 30% 감소
            const isBlackBuff = kaitenzers.find(k => k.id === 'black').isActive;
            const buffFactor = (hitKaiten.id !== 'black' && isBlackBuff) ? 0.7 : 1.0;

            // [블루아카이브 세부 전투 스탯 연산 파이프라인]
            // 명중/회피 -> 안정수치 난수 -> 치명타 -> 상성 -> 방어력
            const bulletAtkType = b.attackType || 'normal';
            const combatResult = (typeof calculateFullCombatDamage === 'function')
              ? calculateFullCombatDamage({
                  attacker: {
                    accuracy: (b.accuracy !== undefined) ? b.accuracy : (player.accuracy || 0),
                    stability: (b.stability !== undefined) ? b.stability : (player.stability || 1500),
                    crit: (b.crit !== undefined) ? b.crit : (player.crit || 350),
                    critDmg: (b.critDmg !== undefined) ? b.critDmg : (player.critDmg || 350)
                  },
                  defender: hitKaiten,
                  baseDmg: b.dmg,
                  attackType: bulletAtkType,
                  forceCrit: b.isCrit || false, // 불사 1% 이하 확정 또는 스킬 자체 확정인 경우 호환
                  bonusCritDmg: player.isLightBeActive ? 155 : 0
                })
              : {
                  isHit: true,
                  damage: b.dmg,
                  isCrit: b.isCrit || false,
                  effectiveness: { mult: 1.0, label: 'NORMAL', color: '#ffffff' }
                };

            // 적 회피(MISS) 발생 시 대미지 무효화
            if (!combatResult.isHit) {
              addDamageText(hitKaiten.x + hitKaiten.size / 2, groundY - hitKaiten.size - 20, 'MISS', '#94a3b8');
              if (!b.isPiercing) {
                bullets.splice(i, 1);
                continue;
              }
              continue;
            }

            let finalDmg = Math.round(combatResult.damage * buffFactor);
            applyKaitenzerSharedDamage(finalDmg);

            // [2인 멀티플레이 동기화]: 2P 게스트 타격 시 1P 호스트에게 권위적 대미지 확정 전송
            if (currentMode === 'duo' && myRole === 'guest_striker' && typeof sendNetPacket === 'function') {
              sendNetPacket({
                type: 'ENEMY_DAMAGE',
                targetType: 'kaiten',
                targetId: hitKaiten.id,
                damage: finalDmg,
                isCrit: combatResult.isCrit,
                stunDuration: b.stunDuration,
                critResistDebuff: b.critResistDebuff
              });
            }

            // [SG: 불사] 지속시간 동안 입힌 피해량 누적
            if (player.isImmortalActive) {
              player.immortalTotalDmgDealt = (player.immortalTotalDmgDealt || 0) + finalDmg;
            }
            // [FOX 45식: 철벽의 방어 기절 & 공세 전환 디버프]
            if (b.type === 'fox_shield_slam') {
              hitKaiten.stunTimer = Math.max(hitKaiten.stunTimer || 0, b.stunDuration || 2.5);
              addDamageText(hitKaiten.x + hitKaiten.size / 2, groundY - (hitKaiten.jumpY || 0) - hitKaiten.size - 30, `⚡ 기절 [${(b.stunDuration || 2.5).toFixed(1)}s]`, '#facc15');
              // 단일 타겟 적중 시 소형 충격파 폭발 연출
              explosions.push({
                x: b.x,
                y: b.y,
                radius: 8,
                maxRadius: 40,
                dmg: 0,
                hasDealtDamage: true,
                isFriendly: true,
                color: b.color || '#f59e0b',
                alpha: 1
              });
              for (let p = 0; p < 12; p++) {
                specialParticles.push({
                  type: 'spark',
                  x: b.x + (Math.random() - 0.5) * 16,
                  y: b.y + (Math.random() - 0.5) * 16,
                  vx: (Math.random() - 0.5) * 10,
                  vy: (Math.random() - 0.5) * 10,
                  color: b.color || '#fbbf24',
                  size: Math.random() * 3 + 1.5,
                  life: 14,
                  maxLife: 14,
                  alpha: 1
                });
              }
            }
            if (b.type === 'fox_offensive_shift') {
              hitKaiten.critDmgResistDebuff = b.critResistDebuff || 22;
              hitKaiten.critDmgResistDebuffTimer = 10.0;
              addDamageText(hitKaiten.x + hitKaiten.size / 2, groundY - (hitKaiten.jumpY || 0) - hitKaiten.size - 30, `🎯 치저 -${b.critResistDebuff}%!`, '#fb923c');
            }

            // 체력이 0이 된 멤버는 즉시 무력화(Knockout) 상태 전환! (전체 공유체력 소진 시)
            if (hitKaiten.isDead) {
              addDamageText(hitKaiten.x + hitKaiten.size / 2, groundY - (hitKaiten.jumpY || 0) - hitKaiten.size - 25, `💀 [카이텐저 전원 격파!]`, '#94a3b8');
            }

            // 상성 표기 (WEAK, EFFECTIVE, RESIST 일 때 배지 텍스트 팝업)
            if (combatResult.effectiveness && combatResult.effectiveness.label !== 'NORMAL') {
              addDamageText(hitKaiten.x + hitKaiten.size / 2, groundY - hitKaiten.size - 35, `[${combatResult.effectiveness.label}]`, combatResult.effectiveness.color);
            }

            if (combatResult.isCrit) {
              addDamageText(hitKaiten.x + hitKaiten.size / 2, groundY - hitKaiten.size - 20, `CRIT! ${finalDmg.toLocaleString()}`, '#fbbf24');
            } else {
              addDamageText(hitKaiten.x + hitKaiten.size / 2, groundY - hitKaiten.size - 10, `-${finalDmg.toLocaleString()}`, b.isSkillBullet ? '#f43f5e' : '#ffffff');
            }

            // [개연 : 이스보셋] 관통 시 다음 적을 위한 피해량 감쇄 (최소 하한 10% 보장)
            if (b.type === 'mg_melody_bullet' && b.decayRate !== undefined) {
              b.dmg = Math.max(b.minDmg, Math.round(b.dmg * (1 - b.decayRate)));
            }

            // 관통탄(스킬탄)이 아니면 일반 총알은 소멸
            if (!b.isPiercing) {
              bullets.splice(i, 1);
              continue;
            }
          }

          if (b.life <= 0 || b.x < 0 || b.x > WORLD_WIDTH) {
            bullets.splice(i, 1);
          }
          continue;
        }

        // --- [적 카이텐저의 탄환 -> 플레이어 피격 처리] ---
        // 0) [무한회전 파이널 고등어 슬래시]: 카이텐 FX 크기(높이 360px, 폭 120px) 거대 검기 참격파 전용 AABB 박스 충돌 판정
        if (b.type === 'fx_mackerel_slash_wave') {
          b.hitTargets = b.hitTargets || {};
          const slashW = b.width || 120;
          const slashH = b.height || 360;
          const slashLeft = b.x - slashW * 0.5;
          const slashRight = b.x + slashW * 0.5;
          const slashTop = b.y - slashH * 0.5;
          const slashBottom = b.y + slashH * 0.5;

          // 1P 피격 판정
          const p1Left = player.x;
          const p1Right = player.x + player.width;
          const p1Top = player.y;
          const p1Bottom = player.y + player.height;

          const hitP1 = !(slashRight < p1Left || slashLeft > p1Right || slashBottom < p1Top || slashTop > p1Bottom);
          if (hitP1 && !b.hitTargets['p1']) {
            b.hitTargets['p1'] = true;
            if (player.isDashing) {
              addDamageText(player.x + 20, player.y - 15, 'DODGE!', '#38bdf8');
            } else if (player.isImmortalActive) {
              addDamageText(player.x + 20, player.y - 15, 'IMMORTAL', '#ef4444');
            } else {
              applyDamageToPlayer(b.dmg, '#00e5ff', true);
              addDamageText(player.x, player.y - 45, '⚡ FINAL MACKEREL SLASH!!', '#00e5ff');
              if (typeof triggerScreenShake === 'function') triggerScreenShake(26, 0.5);
              for (let s = 0; s < 18; s++) {
                specialParticles.push({
                  type: 'spark',
                  x: playerCenterX,
                  y: playerCenterY,
                  vx: (Math.random() - 0.5) * 14,
                  vy: (Math.random() - 0.5) * 14,
                  color: '#00e5ff',
                  size: Math.random() * 4 + 2,
                  life: 18,
                  maxLife: 18,
                  alpha: 1
                });
              }
            }
          }

          // 2P 동료 피격 판정 (2인 플레이 시)
          if (currentMode === 'duo' && typeof remotePlayer !== 'undefined' && remotePlayer.isActive && !remotePlayer.isDead) {
            const p2Left = remotePlayer.x;
            const p2Right = remotePlayer.x + remotePlayer.width;
            const p2Top = remotePlayer.y;
            const p2Bottom = remotePlayer.y + remotePlayer.height;

            const hitP2 = !(slashRight < p2Left || slashLeft > p2Right || slashBottom < p2Top || slashTop > p2Bottom);
            if (hitP2 && !b.hitTargets['p2']) {
              b.hitTargets['p2'] = true;
              if (remotePlayer.isDashing) {
                addDamageText(remotePlayer.x + 20, remotePlayer.y - 15, 'DODGE!', '#38bdf8');
              } else {
                remotePlayer.hp = Math.max(0, remotePlayer.hp - b.dmg);
                addDamageText(remotePlayer.x + 20, remotePlayer.y - 20, `💥 -${b.dmg}`, '#00e5ff');
                if (typeof triggerScreenShake === 'function') triggerScreenShake(24, 0.45);
                if (typeof sendNetPacket === 'function') {
                  sendNetPacket({ type: 'player_damage', hp: remotePlayer.hp, amount: b.dmg, color: '#00e5ff' });
                }
              }
            }
          }

          if (b.life <= 0 || b.x < -300 || b.x > WORLD_WIDTH + 300) {
            bullets.splice(i, 1);
          }
          continue;
        }

        // 플레이어 직격 충돌
        const hit = (
          b.x > player.x &&
          b.x < player.x + player.width &&
          b.y > player.y &&
          b.y < player.y + player.height
        );

        if (hit) {
          // 대시 중 무적 처리
          if (player.isDashing) {
            addDamageText(player.x + 20, player.y - 15, 'DODGE!', '#38bdf8');
            bullets.splice(i, 1);
            continue;
          }

          // Slumpia 서폿팅: 체력 15% 이하 시 10% 확률로 회피(무효화)
          const isLowHp = player.hp <= (player.maxHp * 0.15);
          if (isLowHp && Math.random() < 0.10) {
            addDamageText(player.x + 20, player.y - 15, 'MISS (Slumpia)', '#38bdf8');
            bullets.splice(i, 1);
            continue;
          }

          if (b.type === 'rocket' || b.type === 'fx_sardine_missile') {
            // 로켓 및 정어리 미사일 직격 시 즉시 광역 폭발
            explosions.push({
              x: b.x,
              y: b.y,
              radius: 10,
              maxRadius: b.type === 'fx_sardine_missile' ? 85 : 80,
              dmg: b.dmg,
              hasDealtDamage: false,
              color: b.type === 'fx_sardine_missile' ? '#ef4444' : '#ec4899',
              alpha: 1,
              isSardineMissile: (b.type === 'fx_sardine_missile')
            });
            bullets.splice(i, 1);
            continue;
          } else {
            // [불사(不死)] 상태 시 완전 무적: 데미지 0 처리
            if (player.isImmortalActive) {
              addDamageText(player.x + 20, player.y - 15, 'IMMORTAL (무적)', '#ef4444');
              bullets.splice(i, 1);
              continue;
            }

            // [블루아카이브 세부 전투 스탯 연산 파이프라인] 적 -> 플레이어 피격 처리
            const enemyAtkType = b.attackType || 'normal';
            const shooter = (b.shooterId ? kaitenzers.find(k => k.id === b.shooterId) : null) || {
              accuracy: b.accuracy || 0,
              stability: b.stability || 1500,
              crit: b.crit || 350,
              critDmg: b.critDmg || 350
            };

            const combatResult = (typeof calculateFullCombatDamage === 'function')
              ? calculateFullCombatDamage({
                  attacker: shooter,
                  defender: player,
                  baseDmg: b.dmg,
                  attackType: enemyAtkType
                })
              : {
                  isHit: true,
                  damage: b.dmg,
                  isCrit: false,
                  effectiveness: { mult: 1.0, label: 'NORMAL', color: '#ffffff' }
                };

            if (!combatResult.isHit) {
              addDamageText(player.x + 20, player.y - 15, 'MISS', '#94a3b8');
              bullets.splice(i, 1);
              continue;
            }

            let remainingDmg = combatResult.damage;

            if (combatResult.effectiveness && combatResult.effectiveness.label !== 'NORMAL') {
              addDamageText(player.x + 20, player.y - 45, `[${combatResult.effectiveness.label}]`, combatResult.effectiveness.color);
            }



            if (remainingDmg > 0) {
              applyDamageToPlayer(remainingDmg, combatResult.isCrit ? '#fbbf24' : '#ef4444');
            }
          }
          bullets.splice(i, 1);
          continue;
        }

        if (b.life <= 0 || b.x < -200 || b.x > WORLD_WIDTH + 200 || b.y > groundY + 100 || b.y < -400) {
          bullets.splice(i, 1);
        }
      }

      // 5. 폭발(스플래시) 판정 및 확장
      for (let i = explosions.length - 1; i >= 0; i--) {
        const exp = explosions[i];
        exp.radius += 5.5;
        exp.alpha -= 0.05;

        // 플레이어가 폭발 반경 내에 있고 아직 데미지 안 입었으면 스플래시 피해 적용
        if (!exp.hasDealtDamage) {
          const dx = playerCenterX - exp.x;
          const dy = playerCenterY - exp.y;
          const dist = Math.hypot(dx, dy);
          if (dist <= exp.radius + player.width / 2) {
            // Slumpia 10% 회피 판정
            const isLowHp = player.hp <= (player.maxHp * 0.15);
            if (player.isImmortalActive) {
              addDamageText(player.x + 20, player.y - 20, 'IMMORTAL (무적)', '#ef4444');
            } else if (isLowHp && Math.random() < 0.10) {
              addDamageText(player.x + 20, player.y - 20, 'MISS (Slumpia)', '#38bdf8');
            } else if (!player.isDashing) {
              applyDamageToPlayer(exp.dmg, exp.color || '#ec4899', true);

              // [KAITEN FX 가슴(레드) 패시브]: 스킬 공격(하이퍼 정어리 미사일) 적중 대상 기절 (5초)
              if (exp.isSardineMissile) {
                const ccResist = player.ccResist || 0;
                const stunSec = Math.max(0.5, 5.0 * (1.0 - (ccResist / 100)));
                player.stunTimer = Math.max(player.stunTimer || 0, stunSec);
                addDamageText(player.x + 20, player.y - 35, `⚡ 기절 [${stunSec.toFixed(1)}s]`, '#facc15');
              }
            }
            exp.hasDealtDamage = true;
          }
        }

        if (exp.alpha <= 0 || exp.radius >= exp.maxRadius) {
          explosions.splice(i, 1);
        }
      }

      // 피격 텍스트 갱신
      for (let i = textParticles.length - 1; i >= 0; i--) {
        const p = textParticles[i];
        p.y -= 0.8;
        p.alpha -= 0.02;
        p.life--;
        if (p.life <= 0 || p.alpha <= 0) {
          textParticles.splice(i, 1);
        }
      }

      // [선도부장] 특수 파티클(탄피, 스파크, 분진) 물리 및 바운스 갱신
      for (let i = specialParticles.length - 1; i >= 0; i--) {
        const p = specialParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += (p.gravity || 0);
        if (p.vRot) p.rot += p.vRot;

        // 지면 충돌 및 바운스 (탄피)
        if (p.type === 'casing' && p.y >= groundY - 3) {
          p.y = groundY - 3;
          p.vy = -p.vy * 0.44;
          p.vx *= 0.72;
          p.vRot *= 0.65;
        }

        p.life--;
        p.alpha = Math.max(0, p.life / p.maxLife);
        if (p.life <= 0) {
          specialParticles.splice(i, 1);
        }
      }

      // 파티클 배열 최대 개수 제한 (프레임 드랍 원천 차단)
      if (specialParticles.length > 100) {
        specialParticles.splice(0, specialParticles.length - 100);
      }
      if (textParticles.length > 40) {
        textParticles.splice(0, textParticles.length - 40);
      }

      updateUI();
    }


    let fpsFrames = 0;
    let fpsLastSampleTime = performance.now();
    let currentFps = 60;
    let fpsValEl = null;
    let fpsDotEl = null;

    function loop(now) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // 실시간 FPS 측정 (250ms 주기 정밀 계산 및 상태 색상 연동)
      fpsFrames++;
      if (now - fpsLastSampleTime >= 250) {
        currentFps = Math.round((fpsFrames * 1000) / (now - fpsLastSampleTime));
        fpsFrames = 0;
        fpsLastSampleTime = now;

        if (!fpsValEl) fpsValEl = document.getElementById('fps-val');
        if (!fpsDotEl) fpsDotEl = document.getElementById('fps-dot');

        if (fpsValEl) {
          fpsValEl.textContent = currentFps;
        }
        if (fpsDotEl) {
          if (currentFps >= 50) {
            fpsDotEl.style.backgroundColor = '#4ade80';
            fpsDotEl.style.boxShadow = '0 0 7px #4ade80';
            if (fpsValEl) fpsValEl.style.color = '#4ade80';
          } else if (currentFps >= 30) {
            fpsDotEl.style.backgroundColor = '#facc15';
            fpsDotEl.style.boxShadow = '0 0 7px #facc15';
            if (fpsValEl) fpsValEl.style.color = '#facc15';
          } else {
            fpsDotEl.style.backgroundColor = '#f87171';
            fpsDotEl.style.boxShadow = '0 0 7px #f87171';
            if (fpsValEl) fpsValEl.style.color = '#f87171';
          }
        }
      }

      try {
        // 'battle' 상태(출격 완료)일 때만 전투 AI/물리/공격 로직 실행
        if (currentGameState === 'battle') {
          updateLogic(Math.min(dt, 0.1));
          if (typeof sendInGameSync === 'function') {
            sendInGameSync(now);
          }
        }
        draw();
      } catch (err) {
        console.error('Game loop error:', err);
      }

      requestAnimationFrame(loop);
    }

    requestAnimationFrame((now) => {
      lastTime = now;
      loop(now);
    });

// 초기 화면 상태 설정
setScreenState('main');