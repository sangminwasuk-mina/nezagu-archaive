// ==========================================
// render.js - 캔버스 렌더링, 무기 그래픽, 이펙트, 미니맵
// ==========================================
    // [시스템 : 아비 에슈흐] 등 뒤 기계식 비행 날개 파츠 렌더링 함수 (유저 레퍼런스 이미지 2 완벽 반영)
    function drawMechanicalWings(pScreenX, pScreenY, targetEntity) {
      if (!targetEntity.isAbiEshuhActive) return;

      const dir = targetEntity.facing > 0 ? 1 : -1;
      const wingCenterX = pScreenX + (dir > 0 ? targetEntity.width * 0.35 : targetEntity.width * 0.65);
      const wingCenterY = pScreenY + targetEntity.height * 0.42;
      const t = Date.now() * 0.005;
      const hoverFlutter = Math.sin(t * 3) * 2.5;

      ctx.save();
      ctx.translate(wingCenterX, wingCenterY);
      ctx.scale(dir, 1);

      // 1. 중앙 백팩 메인 프레임 마운트 (Navy & Dark Steel)
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-6, -10);
      ctx.lineTo(4, -10);
      ctx.lineTo(6, 8);
      ctx.lineTo(-4, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 중앙 고출력 코어 LED (Cyan Pulsing Diamond)
      const corePulse = Math.sin(t * 4) * 0.2 + 0.8;
      ctx.fillStyle = `rgba(0, 255, 255, ${corePulse})`;
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      // 2. 상단 메인 주익 (Upper Main Flight Wings: 날렵한 샤프 화이트 외장 & 네이비 블루 인너)
      const upperAngle = -0.35 + hoverFlutter * 0.02;
      ctx.save();
      ctx.translate(-2, -6);
      ctx.rotate(upperAngle);

      // (A) 상단 주익 화이트 외부 아머 플레이트
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-24, -28);
      ctx.lineTo(-48, -42);
      ctx.lineTo(-42, -34);
      ctx.lineTo(-20, -18);
      ctx.lineTo(-10, -4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // (B) 상단 주익 내부 딥 네이비 프레임 & 시안 슬릿
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.moveTo(-12, -10);
      ctx.lineTo(-36, -26);
      ctx.lineTo(-30, -22);
      ctx.lineTo(-10, -6);
      ctx.closePath();
      ctx.fill();

      // (C) 상단 주익 광자 날개(Photon Blade) 네온 발광 에지
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(-20, -24);
      ctx.lineTo(-48, -42);
      ctx.lineTo(-42, -34);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // (D) 상단 주익 슬러스터 분사염 (Cyan Exhaust Flame)
      const flameLen = 14 + Math.sin(t * 12) * 5;
      const flameGrad = ctx.createLinearGradient(-15, -15, -15 - flameLen, -15 - flameLen * 0.6);
      flameGrad.addColorStop(0, '#ffffff');
      flameGrad.addColorStop(0.35, '#00ffff');
      flameGrad.addColorStop(0.8, '#38bdf8');
      flameGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(-12, -18);
      ctx.lineTo(-18 - flameLen, -22 - flameLen * 0.5);
      ctx.lineTo(-18, -12);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // 3. 하단 보조익 (Lower Stabilizer Wings: 사선 아래로 전개되는 보조 날개)
      const lowerAngle = 0.25 - hoverFlutter * 0.015;
      ctx.save();
      ctx.translate(-2, 4);
      ctx.rotate(lowerAngle);

      // (A) 하단 보조익 화이트 장갑
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-20, 16);
      ctx.lineTo(-36, 26);
      ctx.lineTo(-30, 20);
      ctx.lineTo(-14, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // (B) 하단 보조익 네온 엣지
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-14, 12);
      ctx.lineTo(-36, 26);
      ctx.stroke();

      // (C) 하단 슬러스터 분사염
      const lowerFlameLen = 10 + Math.sin(t * 10 + 1) * 3;
      const lowerFlameGrad = ctx.createLinearGradient(-12, 10, -12 - lowerFlameLen, 10 + lowerFlameLen * 0.6);
      lowerFlameGrad.addColorStop(0, '#ffffff');
      lowerFlameGrad.addColorStop(0.4, '#00ffff');
      lowerFlameGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = lowerFlameGrad;
      ctx.beginPath();
      ctx.moveTo(-10, 8);
      ctx.lineTo(-14 - lowerFlameLen, 12 + lowerFlameLen * 0.5);
      ctx.lineTo(-14, 16);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      ctx.restore();
    }

    // [신규 UI] 플레이어 머리 위 사선 블록형 체력바 & 퍼센트 렌더링 (유저 스케치 반영)
    function drawOverheadSlantedHpBar(targetScreenX, targetScreenY, targetEntity, isLocal = true) {
      if (!targetEntity || targetEntity.isDead) return;
      const hp = Math.max(0, targetEntity.hp);
      const maxHp = targetEntity.maxHp || 65000;
      const hpPct = Math.max(0, Math.min(100, (hp / maxHp) * 100));

      const barW = 76;
      const barH = 11;
      const skew = -7; // 사선 기울기
      const totalW = barW + 36;
      const startX = targetScreenX + targetEntity.width / 2 - totalW / 2;
      const startY = targetScreenY - 26;

      ctx.save();

      // 1. 체력바 외곽 베이스 트랙
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.moveTo(startX - skew, startY);
      ctx.lineTo(startX + barW - skew, startY);
      ctx.lineTo(startX + barW, startY + barH);
      ctx.lineTo(startX, startY + barH);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 2. 5개 사선 세그먼트 (스케치 반영)
      const numSegs = 5;
      const segGap = 2;
      const segW = (barW - (numSegs + 1) * segGap) / numSegs;
      const barColor = hpPct <= 25 ? '#ef4444' : (hpPct <= 50 ? '#facc15' : '#84cc16'); // 라임 그린

      for (let i = 0; i < numSegs; i++) {
        const segStartX = startX + segGap + i * (segW + segGap);
        const segSkew = skew * (segW / barW);
        const segMinPct = i * 20;

        if (hpPct > segMinPct) {
          const segFill = Math.max(0, Math.min(1, (hpPct - segMinPct) / 20));
          ctx.fillStyle = barColor;
          ctx.beginPath();
          ctx.moveTo(segStartX - segSkew, startY + 1.5);
          ctx.lineTo(segStartX + (segW * segFill) - segSkew, startY + 1.5);
          ctx.lineTo(segStartX + (segW * segFill), startY + barH - 1.5);
          ctx.lineTo(segStartX, startY + barH - 1.5);
          ctx.closePath();
          ctx.fill();
        }

        // 세그먼트 구분선
        if (i > 0) {
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(segStartX - 1 - segSkew, startY);
          ctx.lineTo(segStartX - 1, startY + barH);
          ctx.stroke();
        }
      }

      // 3. 우측 사선 퍼센트 박스 (스케치의 '80%' 표시 영역)
      const pctBoxX = startX + barW + 5;
      const pctBoxW = 32;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = barColor;
      ctx.lineWidth = 1.3;

      ctx.beginPath();
      ctx.moveTo(pctBoxX - skew, startY - 0.5);
      ctx.lineTo(pctBoxX + pctBoxW - skew, startY - 0.5);
      ctx.lineTo(pctBoxX + pctBoxW, startY + barH + 0.5);
      ctx.lineTo(pctBoxX, startY + barH + 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 퍼센트 텍스트 렌더링
      ctx.font = 'bold 9.5px monospace';
      ctx.fillStyle = barColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(hpPct)}%`, pctBoxX + pctBoxW / 2 - skew / 2, startY + barH / 2);

      ctx.restore();
    }

    // 플레이어 전용 무기 캔버스 드로잉 함수 (종막의 디스트로이어 & 루거 P08 스타일 보조권총 & 아비 에슈흐 레일건)
    function drawPlayerWeapon(pScreenX, pScreenY, playerCenterX, playerCenterY, groundY, targetEntity = player) {
      const isMain = targetEntity.activeWeaponSlot === 'main';
      const dir = targetEntity.facing > 0 ? 1 : -1;
      const targetMain = targetEntity.mainWeapon || player.mainWeapon;
      const targetSub = targetEntity.subWeapon || player.subWeapon;

      // 레드 도발 시 레드를 향해 조준 각도 자동 회전
      const redKaiten = kaitenzers.find(k => k.id === 'red');
      const isRedTaunting = redKaiten && redKaiten.isSpawned && !redKaiten.isDead && redKaiten.isActive;

      let elev = 0;
      if (isRedTaunting) {
        const dx = (redKaiten.x + redKaiten.size / 2) - playerCenterX;
        const dy = (groundY - redKaiten.size / 2) - playerCenterY;
        elev = Math.atan2(dy, Math.abs(dx));
        elev = Math.max(-0.55, Math.min(0.55, elev));
      } else if (targetEntity.aimMode === 'auto' && typeof getClosestActiveEnemy === 'function') {
        const closestEnemy = getClosestActiveEnemy(playerCenterX, playerCenterY);
        if (closestEnemy && closestEnemy.entity) {
          const dx = closestEnemy.x - playerCenterX;
          const dy = closestEnemy.y - playerCenterY;
          elev = Math.atan2(dy, Math.abs(dx));
          elev = Math.max(-0.55, Math.min(0.55, elev));
        }
      }

      // 사격 반동 킥백 오프셋
      let recoilX = 0;
      if (isMain) {
        if (targetEntity.isFiringSkill || (targetEntity === player && keys.attack && targetMain.ammo > 0 && !targetMain.isReloading)) {
          recoilX = -(Math.random() * 2.5);
        }
      }

      const anchorX = pScreenX + (dir > 0 ? targetEntity.width * 0.72 : targetEntity.width * 0.28) + (recoilX * dir);
      const anchorY = pScreenY + targetEntity.height * 0.58;

      ctx.save();
      ctx.translate(anchorX, anchorY);
      ctx.scale(dir, 1);
      ctx.rotate(elev);

      ctx.lineWidth = 1.4;
      ctx.strokeStyle = '#0f172a';

      const isRG = (isMain && targetMain && targetMain.id === 'rg_supernova');
      const isSG = (isMain && targetMain && targetMain.id === 'sg_bloody_gunpowder');
      const isAR = (isMain && targetMain && targetMain.id === 'ar_white_fang');
      const isSMG = (isMain && targetMain && targetMain.id === 'smg_fox45');

      if (isMain && !isRG && !isSG && !isAR && !isSMG) {
        // ==========================================
        // [메인 무기: 종막의 디스트로이어]
        // ==========================================
        const isSkillActive = targetEntity.isFiringSkill;

        // 1. 하단 개머리판-그립 연결 레일 프레임 (Bottom Frame Rail)
        ctx.fillStyle = '#1e1c24';
        ctx.fillRect(-16, 8, 22, 2.5);
        ctx.strokeRect(-16, 8, 22, 2.5);
        // 사선 지지대
        ctx.fillStyle = '#2d2b36';
        ctx.fillRect(-6, 2, 3, 7);

        // 2. 후방 대형 앵글 개머리판 (Chunky Angular Stock)
        ctx.fillStyle = '#222028';
        ctx.beginPath();
        ctx.moveTo(-7, -4);
        ctx.lineTo(-7, 7);
        ctx.lineTo(-20, 11);
        ctx.lineTo(-24, 7);
        ctx.lineTo(-23, -8);
        ctx.lineTo(-15, -7);
        ctx.lineTo(-14, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 개머리판 상단 네온 퍼플 라인 악센트
        ctx.strokeStyle = isSkillActive ? '#f472b6' : '#c026d3';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-23, -7.5);
        ctx.lineTo(-15, -6.5);
        ctx.lineTo(-14, -3.5);
        ctx.lineTo(-7, -3.5);
        ctx.stroke();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = '#0f172a';

        // 개머리판 금색 태엽 손잡이 (Golden Winding Key)
        ctx.fillStyle = '#eab308';
        ctx.strokeStyle = '#854d0e';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-16, 5);
        ctx.lineTo(-21, 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(-21, 1, 2.5, 1.8, -0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = '#0f172a';

        // 개머리판 세로 슬릿 램프 (Vertical Purple LED Slit)
        ctx.fillStyle = isSkillActive ? '#fbcfe8' : '#e879f9';
        ctx.fillRect(-8.5, -2, 1.8, 5);

        // 3. 권총 손잡이 (Pistol Grip)
        ctx.fillStyle = '#18171d';
        ctx.fillRect(0, 2, 4.5, 9);
        ctx.strokeRect(0, 2, 4.5, 9);
        // 손잡이 전면 퍼플 가드 스트랩 (Purple Grip Front)
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(3, 2, 2.2, 9);
        ctx.strokeRect(3, 2, 2.2, 9);

        // 방아쇠 울 및 트리거
        ctx.fillStyle = '#2d2b36';
        ctx.strokeRect(4.5, 2.5, 6, 5);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(6.5, 3.5, 1.8, 3);

        // 4. 수직 접이식 상단 바 (Vertical Carry / Cocking Bar)
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(0, -18, 3.2, 18);
        ctx.strokeRect(0, -18, 3.2, 18);
        // 상하단 피벗 핀
        ctx.fillStyle = '#e9d5ff';
        ctx.fillRect(0.6, -16.5, 2, 2);
        ctx.fillRect(0.6, -2, 2, 2);

        // 5. 중앙 기관총 리시버 본체 (MG Receiver Body)
        ctx.fillStyle = '#2d2b36';
        ctx.fillRect(-2, -5, 22, 7.5);
        ctx.strokeRect(-2, -5, 22, 7.5);

        // [핵심] 네온 퍼플 에너지 셀 챔버 (Glowing Purple Energy Cell)
        ctx.fillStyle = isSkillActive ? '#fdf4ff' : '#d946ef';
        ctx.fillRect(6, -3.5, 10, 4.2);
        ctx.strokeStyle = '#701a75';
        ctx.strokeRect(6, -3.5, 10, 4.2);
        // 내부 그릴 슬릿 (Cell Slats)
        ctx.fillStyle = isSkillActive ? '#c026d3' : '#86198f';
        ctx.fillRect(8.5, -3, 1.2, 3.2);
        ctx.fillRect(11.5, -3, 1.2, 3.2);
        ctx.fillRect(14.5, -3, 1.2, 3.2);

        // 게헨나 스타일 하부 마크 데칼
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(7, 1.5, 4, 1.2);

        // 하부 사선 탄창 소켓 (Angled Magwell)
        ctx.fillStyle = '#1e1c24';
        ctx.beginPath();
        ctx.moveTo(13, 2.5);
        ctx.lineTo(19, 2.5);
        ctx.lineTo(21, 8.5);
        ctx.lineTo(16, 8.5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.stroke();

        // 6. 긴 타공 방열 총열 덮개 (Vented Barrel Shroud)
        ctx.fillStyle = '#383542';
        ctx.fillRect(20, -3.8, 30, 6.2);
        ctx.strokeRect(20, -3.8, 30, 6.2);

        // 3개의 라운드 사각 쿨링 벤트 (3 Cooling Vent Slots)
        ctx.fillStyle = '#121116';
        ctx.fillRect(25, -2, 4.5, 2.8);
        ctx.fillRect(32.5, -2, 4.5, 2.8);
        ctx.fillRect(40, -2, 4.5, 2.8);

        // 가늠쇠 브라켓 (Front Sight)
        ctx.fillStyle = '#1e1c24';
        ctx.fillRect(47, -6, 3, 3);
        ctx.stroke();

        // 7. [핵심] 대형 나선형 코일 가속기 머즐 디바이스 (Spiral Accelerator Muzzle Device)
        // 연결 칼라 밴드
        ctx.fillStyle = '#4c1d95';
        ctx.fillRect(50, -5.2, 3.5, 9);
        ctx.strokeRect(50, -5.2, 3.5, 9);

        // 굵은 나선형 발광 실린더 (Spiral Glowing Drum) - 종막/개연/선도부장 시 보라빛 네온 과열 발광
        const isMGStance = targetEntity.mgStanceActive || targetEntity.mgStanceTransitioning;
        const isSpecialFiring = targetEntity.isFiringSpecial;
        ctx.fillStyle = (isSkillActive || isMGStance || isSpecialFiring) ? '#fae8ff' : '#a855f7';
        ctx.fillRect(53.5, -5.5, 14, 9.5);
        ctx.strokeStyle = '#4c1d95';
        ctx.strokeRect(53.5, -5.5, 14, 9.5);

        // 나선형 스트라이프 핀 (Diagonal Spiral Stripes)
        ctx.strokeStyle = (isSkillActive || isMGStance || isSpecialFiring) ? '#c084fc' : '#d8b4fe';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(54.5, 3.5);
        ctx.lineTo(58, -4.5);
        ctx.moveTo(58.5, 3.5);
        ctx.lineTo(62, -4.5);
        ctx.moveTo(62.5, 3.5);
        ctx.lineTo(66, -4.5);
        ctx.stroke();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = '#0f172a';

        // 립형 총열 목 (Ribbed Barrel Neck)
        ctx.fillStyle = '#222028';
        ctx.fillRect(67.5, -2.6, 6, 4.2);
        ctx.strokeRect(67.5, -2.6, 6, 4.2);
        // 리브 링 2개
        ctx.fillStyle = '#383542';
        ctx.fillRect(69, -3.2, 1.2, 5.4);
        ctx.fillRect(71.5, -3.2, 1.2, 5.4);

        // 최종 원통형 총구 (Final Barrel Tip)
        ctx.fillStyle = '#18171d';
        ctx.fillRect(73.5, -2, 10, 3.2);
        ctx.strokeRect(73.5, -2, 10, 3.2);

        // 사격 머즐 플래시 이펙트 (보라빛 네온)
        if (isSkillActive || isSpecialFiring || (targetMain && targetMain.flashTimer > 0)) {
          ctx.save();
          let flashSize = isSkillActive ? 16 : 9;
          if (isSpecialFiring) {
            flashSize = (targetEntity.specialPhase === 3 && targetEntity.specialIsBerserk) ? 32 : (targetEntity.specialPhase === 2 ? 24 : 18);
          }
          const flashGrad = ctx.createRadialGradient(84, -0.4, 1, 84, -0.4, flashSize);
          flashGrad.addColorStop(0, '#ffffff');
          flashGrad.addColorStop(0.35, '#c084fc');
          flashGrad.addColorStop(0.7, '#9333ea');
          flashGrad.addColorStop(1, 'rgba(147, 51, 234, 0)');
          ctx.fillStyle = flashGrad;
          ctx.beginPath();
          ctx.arc(84, -0.4, flashSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

      } else if (isRG) {
        if (targetEntity.isAbiEshuhActive) {
          // ==========================================
          // [빛의 검 : 슈퍼노바 for 아비 에슈흐]
          // (유저 레퍼런스 이미지 1: 네이비 & 화이트 고기동 중레일건 완벽 구현)
          // ==========================================
          const isNormalCharging = targetEntity.abiNormalCharging;
          const chargeTimer = targetEntity.abiNormalChargeTimer || 0;
          const chargePct = Math.min(1, chargeTimer / 0.9);
          const isBarrage = targetEntity.abiBarrageFiring;

          // 1. 대형 후방 하우징 스톡 & 에너지 팩 (Dark Navy & Pure White)
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-26, -10, 20, 18);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.4;
          ctx.strokeRect(-26, -10, 20, 18);

          // 후방 냉각 슬릿 벤트
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(-24, -7, 6, 12);
          ctx.fillStyle = '#00ffff';
          for (let v = 0; v < 3; v++) {
            ctx.fillRect(-23, -5 + v * 4, 4, 1.5);
          }

          // 2. 상단 고배율 스마트 옵틱 스코프 (Extended Top Optical Sensor Rail)
          ctx.fillStyle = '#172554';
          ctx.beginPath();
          ctx.moveTo(-12, -11);
          ctx.lineTo(24, -11);
          ctx.lineTo(28, -7);
          ctx.lineTo(-8, -7);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 스코프 대물 렌즈 (Cyan Glowing Lens)
          ctx.fillStyle = '#00ffff';
          ctx.beginPath();
          ctx.arc(26, -9, 2.2, 0, Math.PI * 2);
          ctx.fill();

          // 3. 중앙 양자 변환 코어 프레임 (Pure White Shell with Cyan Matrix)
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(-6, -7);
          ctx.lineTo(16, -7);
          ctx.lineTo(20, 7);
          ctx.lineTo(-6, 7);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.stroke();

          // 중앙 헥사고날 코어 윈도우
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(0, -3, 10, 6);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(2, -1.5, 6, 3);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(4, -0.5, 2, 1);

          // 4. 메인 그립 및 보조 그립
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-2, 2, 5, 9);
          ctx.strokeRect(-2, 2, 5, 9);
          ctx.fillRect(12, 3, 4, 7);
          ctx.strokeRect(12, 3, 4, 7);

          // 5. 전방 연장 강화 화이트 레일 배럴 (Extended Heavy Rail Barrel)
          ctx.fillStyle = '#f8fafc';
          // 상부 배럴 슈라우드
          ctx.beginPath();
          ctx.moveTo(14, -7);
          ctx.lineTo(46, -7);
          ctx.lineTo(42, -1.5);
          ctx.lineTo(16, -1.5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 하부 배럴 슈라우드
          ctx.beginPath();
          ctx.moveTo(14, 1.5);
          ctx.lineTo(42, 1.5);
          ctx.lineTo(46, 7);
          ctx.lineTo(14, 7);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 6. [핵심] 중앙 선형 가속 레일 빔로 (Glowing Cyan Linear Accelerator Core)
          const coreGlow = isNormalCharging ? (chargePct > 0.66 ? '#ffffff' : (chargePct > 0.33 ? '#38bdf8' : '#00ffff')) : '#00ffff';
          ctx.fillStyle = coreGlow;
          ctx.fillRect(16, -1.2, 28, 2.4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(18, -0.4, 24, 0.8);

          // 7. 측면 스태빌라이저 장갑 핀 (Dual Lateral Stabilizer Armors)
          ctx.fillStyle = '#1e3a8a';
          ctx.beginPath();
          ctx.moveTo(22, -10);
          ctx.lineTo(42, -10);
          ctx.lineTo(38, -6);
          ctx.lineTo(22, -6);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(22, 6);
          ctx.lineTo(38, 6);
          ctx.lineTo(42, 10);
          ctx.lineTo(22, 10);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 8. 전방 대형 머즐 브레이크 & 레일 가이드 포트 (Front Heavy Muzzle)
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(44, -4.5, 6, 9);
          ctx.strokeRect(44, -4.5, 6, 9);

          // 머즐 내부 전자기 방전 링
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(48, -3.5, 2.5, 7);

          // 9. 플레이어 양손 렌더링
          ctx.fillStyle = '#0284c7';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(0, 5, 3.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(14, 5, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // 10. 사격 머즐 플래시 이펙트
          if (targetMain && targetMain.flashTimer > 0) {
            ctx.save();
            const flashGrad = ctx.createRadialGradient(52, 0, 1, 52, 0, 22);
            flashGrad.addColorStop(0, '#ffffff');
            flashGrad.addColorStop(0.4, '#00ffff');
            flashGrad.addColorStop(0.8, '#38bdf8');
            flashGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
            ctx.fillStyle = flashGrad;
            ctx.beginPath();
            ctx.arc(52, 0, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // 11. 평타 차징 시 총구 집적 구체 & 흡수 링 (0.3s -> 1단계, 0.6s -> 2단계, 0.9s -> 3단계)
          if (isNormalCharging) {
            ctx.save();
            const stage = chargePct >= 0.66 ? 3 : (chargePct >= 0.33 ? 2 : 1);
            const rSize = 6 + stage * 4 + Math.sin(Date.now() * 0.03) * 1.5;
            const cColor = stage === 3 ? '#ffffff' : (stage === 2 ? '#00ffff' : '#38bdf8');

            const aura = ctx.createRadialGradient(50, 0, 1, 50, 0, rSize);
            aura.addColorStop(0, '#ffffff');
            aura.addColorStop(0.4, cColor);
            aura.addColorStop(1, 'rgba(56, 189, 248, 0)');
            ctx.fillStyle = aura;
            ctx.beginPath();
            ctx.arc(50, 0, rSize, 0, Math.PI * 2);
            ctx.fill();

            // 집적 링
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.ellipse(50, 0, rSize * 1.3, rSize * 0.5, Date.now() * 0.015, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          // 12. 빛의 난사 중 총구 불꽃 진동
          if (isBarrage) {
            ctx.save();
            const jx = 51 + (Math.random() - 0.5) * 4;
            const jy = (Math.random() - 0.5) * 4;
            const bFlash = ctx.createRadialGradient(jx, jy, 1, jx, jy, 16);
            bFlash.addColorStop(0, '#ffffff');
            bFlash.addColorStop(0.5, '#00ffff');
            bFlash.addColorStop(1, 'rgba(56, 189, 248, 0)');
            ctx.fillStyle = bFlash;
            ctx.beginPath();
            ctx.arc(jx, jy, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        } else {
        // ==========================================
        // [메인 무기: RG (빛의검 : 슈퍼노바)]
        // 유저 레퍼런스 이미지(밀레니엄/아리스 화이트 레일건) 완벽 비율 구현
        // 캐릭터의 손잡이 파지 위치 (0,0) 중심, 몸체 밀착형 스톡 & 양손 파지
        // ==========================================
        const isCharging = targetEntity.isChargingSkill;
        const cLevel = targetEntity.chargeLevel || 1;

        // 1. 후방 배터리/스톡 블록 (Rear Housing Stock Block: 캐릭터 몸체에 자연스럽게 안착)
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-22, -8, 16, 14);
        ctx.strokeRect(-22, -8, 16, 14);

        // 후방 배기 덕트 인렛 (Black Exhaust Vent)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-20, -5, 7, 7);
        ctx.strokeRect(-20, -5, 7, 7);

        // 2. 아리스 고유 핑크 캣 데칼 (Pink Cat Decal)
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(-11, 2.5, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(-8, 2.5, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // 3. 네이비 블루 상부 탑 카울링 (Navy Blue Top Cowling)
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.moveTo(-10, -8.5);
        ctx.lineTo(8, -8.5);
        ctx.lineTo(13, -3);
        ctx.lineTo(4, -1);
        ctx.lineTo(-10, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 상부 카울링 볼트 핀
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, -5, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // 4. 중앙 기계부 & 오렌지색 코어 실린더 (Orange Energy Cylinder)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-4, -1, 14, 6);
        ctx.strokeRect(-4, -1, 14, 6);

        // 오렌지 실린더 코어
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(1, -0.5, 7, 5);
        ctx.strokeRect(1, -0.5, 7, 5);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(3.5, -0.5, 2.5, 5); // 코어 하이라이트

        // 5. 메인 권총 손잡이 (Main Pistol Grip - 플레이어 손 파지 위치 (0, 0))
        ctx.fillStyle = '#334155';
        ctx.fillRect(-2, 2, 4.5, 8);
        ctx.strokeRect(-2, 2, 4.5, 8);

        // 6. 전방 보조 지지 손잡이 (Fore-Grip)
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(10, 3, 3.5, 6);
        ctx.strokeRect(10, 3, 3.5, 6);

        // 7. 전방 화이트 레일 배럴 (Large White Rail Barrel Shell)
        ctx.fillStyle = '#ffffff';
        // 상부 화이트 배럴
        ctx.beginPath();
        ctx.moveTo(9, -8);
        ctx.lineTo(38, -8);
        ctx.lineTo(34, -1.5);
        ctx.lineTo(11, -1.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 하부 화이트 배럴
        ctx.beginPath();
        ctx.moveTo(10, 1);
        ctx.lineTo(34, 1);
        ctx.lineTo(36, 7);
        ctx.lineTo(10, 7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 8. [핵심] 중앙 빛나는 청록색 발광 레일 코어 (Glowing Cyan Rail Core)
        const glowColor = isCharging ? (cLevel === 3 ? '#ec4899' : (cLevel === 2 ? '#38bdf8' : '#22d3ee')) : '#06b6d4';
        ctx.fillStyle = glowColor;
        ctx.fillRect(12, -1.2, 22, 2.4);
        // 내부 초고에너지 화이트 코어 빔 라인
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(14, -0.5, 18, 1);

        // 9. 전방 하부 네이비/그레이 챔퍼드 아머 (Lower Front Navy Armored Skirt)
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(31, 3);
        ctx.lineTo(44, 3);
        ctx.lineTo(39, 10);
        ctx.lineTo(31, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.arc(37, 6.5, 2, 0, Math.PI * 2);
        ctx.fill();

        // 10. 전방 상부 각진 노즈 카울링 & 밀레니엄 데칼
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.moveTo(31, -8);
        ctx.lineTo(44, -8);
        ctx.lineTo(46, -2);
        ctx.lineTo(36, -2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // '711' 밀레니엄 각인
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 4.5px sans-serif';
        ctx.fillText('711', 34, -3.5);

        // 11. 최종 블랙 머즐 포트 (Black Rail Muzzle Port)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(44, -3.5, 5, 7);
        ctx.strokeRect(44, -3.5, 5, 7);

        // 12. 플레이어의 양손 렌더링 (안정적으로 총을 쥐고 있는 손 그래픽)
        ctx.fillStyle = '#0284c7'; // 플레이어 몸체 슈트 색상
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        // 뒷손 (메인 손잡이 파지)
        ctx.beginPath();
        ctx.arc(0, 5, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // 앞손 (보조 손잡이 받침)
        ctx.beginPath();
        ctx.arc(12, 5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 13. 사격 머즐 플래시 이펙트
        if (targetMain && targetMain.flashTimer > 0) {
          ctx.save();
          const flashGrad = ctx.createRadialGradient(50, 0, 1, 50, 0, 18);
          flashGrad.addColorStop(0, '#ffffff');
          flashGrad.addColorStop(0.35, '#38bdf8');
          flashGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
          ctx.fillStyle = flashGrad;
          ctx.beginPath();
          ctx.arc(50, 0, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // 14. [밸런스 붕괴] 차징 중 총구 플라즈마 구체 및 스파크 렌더링
        if (isCharging) {
          ctx.save();
          const pulse = Math.sin(Date.now() * 0.02) * 2;
          const chargeRadius = (8 + cLevel * 4) + pulse;
          const auraGrad = ctx.createRadialGradient(49, 0, 2, 49, 0, chargeRadius);
          auraGrad.addColorStop(0, '#ffffff');
          auraGrad.addColorStop(0.5, cLevel === 3 ? '#ec4899' : (cLevel === 2 ? '#38bdf8' : '#67e8f9'));
          auraGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(49, 0, chargeRadius, 0, Math.PI * 2);
          ctx.fill();

          // 튀는 전격 스파크 (Sparks)
          ctx.strokeStyle = cLevel === 3 ? '#fbcfe8' : '#e0f2fe';
          ctx.lineWidth = 1.5;
          for (let s = 0; s < (cLevel * 2); s++) {
            const ang = (Date.now() * 0.01 + s * (Math.PI / cLevel)) % (Math.PI * 2);
            const dist = chargeRadius * 0.85;
            ctx.beginPath();
            ctx.moveTo(49, 0);
            ctx.lineTo(49 + Math.cos(ang) * dist, Math.sin(ang) * dist);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      } else if (isSG) {
        // ==========================================
        // [메인 무기: SG (블러디 앤 건 파우더)]
        // 유저 레퍼런스 이미지(레버액션 샷건 & 붉은 원목 & 블러디 스패터 리시버) 완벽 구현
        // ==========================================
        const isSkill = targetEntity.sgSkillActive;

        // 0. [기괴멸렬] 발동 시 무기 주변을 감싸는 붉은 아우라 및 피어오르는 도깨비불 이펙트
        if (isSkill) {
          ctx.save();
          const time = Date.now() * 0.005;
          // 총열 및 리시버 주변 붉은 안개 글로우
          const auraGrad = ctx.createRadialGradient(20, 0, 8, 20, 0, 36);
          auraGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
          auraGrad.addColorStop(0.5, 'rgba(185, 28, 28, 0.25)');
          auraGrad.addColorStop(1, 'rgba(153, 27, 27, 0)');
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(20, 0, 36, 0, Math.PI * 2);
          ctx.fill();

          // 위로 피어오르는 핏빛 아우라 불꽃들 (Rising Blood Embers)
          ctx.fillStyle = '#ef4444';
          for (let f = 0; f < 5; f++) {
            const fx = -15 + f * 12 + Math.sin(time + f) * 4;
            const fy = -4 - ((time * 15 + f * 7) % 22);
            const fSize = 2.2 + Math.sin(time * 2 + f) * 0.8;
            ctx.beginPath();
            ctx.arc(fx, fy, Math.max(1, fSize), 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // 1. 후방 붉은 원목 개머리판 (Red Wood Ergonomic Stock)
        ctx.fillStyle = '#991b1b'; // 진한 붉은 원목 기본색
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        // 개머리판 상단 곡선: 뺨 닿는 볼록한 능선(Cheek Crest) 및 곡선
        ctx.moveTo(-2, 0);
        ctx.lineTo(-6, -1);
        ctx.lineTo(-12, -4);
        ctx.lineTo(-16, -2);
        ctx.lineTo(-24, -2.5);
        ctx.lineTo(-30, -7);
        // 후방 사선 버트 플레이트 (Slanted Buttplate)
        ctx.lineTo(-35, 8);
        // 하단 복귀 곡선
        ctx.lineTo(-26, 7);
        ctx.lineTo(-18, 4.5);
        ctx.lineTo(-10, 3.5);
        ctx.lineTo(-2, 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 개머리판 내부 나뭇결 텍스처 (Dark Red Woodgrain Lines)
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(-28, -4);
        ctx.quadraticCurveTo(-20, -1, -10, 0.5);
        ctx.moveTo(-31, 1);
        ctx.quadraticCurveTo(-22, 2.5, -14, 2);
        ctx.stroke();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.3;

        // 개머리판 후방 다크 고무/철제 반동패드 (Recoil Pad)
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(-30, -7);
        ctx.lineTo(-33, -7);
        ctx.lineTo(-38, 8);
        ctx.lineTo(-35, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 2. 대형 레버 루프 & 방아쇠울 (Oversized Teardrop Lever Loop with Studded Wrap)
        // 레버 루프 금속 프레임
        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.moveTo(1, 2);
        ctx.quadraticCurveTo(-8, 14, -14, 13);
        ctx.quadraticCurveTo(-15, 6, -5, 3);
        ctx.lineTo(-3, 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 레버 내부 개방 공간 (Loop Opening)
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(-7, 7.5, 4.2, 2.2, -0.65, 0, Math.PI * 2);
        ctx.fill();

        // 레버 외곽 붉은 가죽 패딩 및 실버 리벳 스터드 (Studded Red Wrap)
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-4, 11);
        ctx.quadraticCurveTo(-11, 14.5, -14, 12);
        ctx.stroke();
        ctx.lineWidth = 1.3;
        ctx.strokeStyle = '#0f172a';

        // 4개의 실버 스터드 징
        ctx.fillStyle = '#e2e8f0';
        [[-6, 11.2], [-9, 12.8], [-12, 13], [-13.8, 11.5]].forEach(([sx, sy]) => {
          ctx.beginPath();
          ctx.arc(sx, sy, 0.9, 0, Math.PI * 2);
          ctx.fill();
        });

        // 방아쇠울 및 트리거 (Trigger Guard & Trigger)
        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.arc(3, 4, 3.2, 0.2, Math.PI * 0.9);
        ctx.stroke();
        // 내부 방아쇠
        ctx.fillStyle = '#475569';
        ctx.fillRect(2.5, 3, 1.2, 3);
        // 방아쇠울 뒤쪽 뾰족한 스퍼 뿔 (Spur Horn)
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.moveTo(5.5, 3);
        ctx.lineTo(6.5, 6.5);
        ctx.lineTo(4.5, 4.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 3. 중앙 흑철 리시버 본체 (Gunmetal Steel Receiver with Blood Spatter)
        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.moveTo(-2, 0);
        ctx.lineTo(-1, -7);
        ctx.lineTo(0.5, -9); // 상단 해머/피크 뿔
        ctx.lineTo(3, -6.5);
        ctx.lineTo(15, -6.5);
        ctx.lineTo(15, 3.5);
        ctx.lineTo(-2, 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 리시버 피색 핏자국 스패터 (Blood Splatter Decals)
        ctx.save();
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.arc(3, -3, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.arc(6, -1.5, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(1, -5, 3.5, 1.5);
        ctx.fillRect(8, -4, 4, 2);
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(10, 0, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 리시버 전면 연결 칼라 밴드 (Steel Connecting Collar)
        ctx.fillStyle = '#475569';
        ctx.fillRect(15, -7, 2.5, 10.5);
        ctx.strokeRect(15, -7, 2.5, 10.5);

        // 4. 이중 총열 (Double Barrels: 상단 사격 총열 + 하단 관형 탄창 튜브)
        // 하단 관형 탄창 튜브 (Lower Mag Tube)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(17.5, -0.5, 31, 3.6);
        ctx.strokeRect(17.5, -0.5, 31, 3.6);
        // 탄창 튜브 끝 엔드캡
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(48.5, 1.3, 1.8, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
        ctx.stroke();

        // 상단 사격 총열 (Upper Shotgun Barrel - 더 길고 굵음)
        ctx.fillStyle = '#27272a';
        ctx.fillRect(17.5, -5.8, 36.5, 4.5);
        ctx.strokeRect(17.5, -5.8, 36.5, 4.5);
        // 총열 상단 하이라이트 광택선
        ctx.fillStyle = '#64748b';
        ctx.fillRect(18, -5.2, 35, 1);

        // 전방 이중 총열 고정 밴드 클램프 (Front Double Barrel Clamp)
        ctx.fillStyle = '#334155';
        ctx.fillRect(44, -6.5, 2.2, 10);
        ctx.strokeRect(44, -6.5, 2.2, 10);

        // 총구 구멍 (Muzzle Bore)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(53, -5.5, 2, 4);

        // 5. 붉은 원목 핸드가드 / 포어엔드 (Crimson Wood Forend)
        ctx.fillStyle = '#b91c1c'; // 선명한 붉은 원목
        ctx.beginPath();
        ctx.moveTo(17.5, -4.5);
        ctx.lineTo(39, -4.5);
        ctx.lineTo(39, 2.2);
        ctx.lineTo(17.5, 2.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 포어엔드 나뭇결
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(19, -1.5);
        ctx.lineTo(37, -1.5);
        ctx.moveTo(21, 0.5);
        ctx.lineTo(35, 0.5);
        ctx.stroke();
        ctx.lineWidth = 1.3;
        ctx.strokeStyle = '#0f172a';

        // 포어엔드 고정 실버 스크루 볼트 2개 (2 Silver Screws)
        ctx.fillStyle = '#cbd5e1';
        [22, 34].forEach(bx => {
          ctx.beginPath();
          ctx.arc(bx, -1.2, 1.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });

        // 6. 플레이어 양손 렌더링 (Rear Wrist Grip & Forward Forend Support)
        ctx.fillStyle = '#0284c7'; // 플레이어 슈트 색상
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        // 뒷손 (그립/레버 파지)
        ctx.beginPath();
        ctx.arc(0, 3, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // 앞손 (포어엔드 하단 안정적 받침 파지)
        ctx.beginPath();
        ctx.arc(28, 3.8, 3.0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 7. 사격 머즐 플래시 (화염 방출 이펙트)
        if (targetMain && targetMain.flashTimer > 0) {
          ctx.save();
          const flashW = isSkill ? 28 : 22;
          const flashH = isSkill ? 18 : 14;
          const flashGrad = ctx.createRadialGradient(55, -3.5, 1, 55, -3.5, flashW);
          flashGrad.addColorStop(0, '#ffffff');
          flashGrad.addColorStop(0.3, isSkill ? '#fb7185' : '#f97316');
          flashGrad.addColorStop(0.7, isSkill ? '#e11d48' : '#ea580c');
          flashGrad.addColorStop(1, 'rgba(225, 29, 72, 0)');
          ctx.fillStyle = flashGrad;
          ctx.beginPath();
          ctx.ellipse(56, -3.5, flashW, flashH, 0, 0, Math.PI * 2);
          ctx.fill();

          // 산탄 스파크 불꽃들
          ctx.fillStyle = '#fef08a';
          for (let s = 0; s < (isSkill ? 8 : 5); s++) {
            const sx = 58 + Math.random() * 16;
            const sy = -3.5 + (Math.random() - 0.5) * 14;
            ctx.beginPath();
            ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

      } else if (isAR) {
        // ==========================================
        // [메인 무기: AR (WHITE FANG 465) vs (BLACK FANG 465 : 색채 각성)]
        // 유저 레퍼런스 이미지 완벽 구현:
        // - 색채 각성 시: 어두운 다크 그레이/흑철색 바디 & 짙은 회색 발광 림 & 암흑 총구 플래시
        // - 일반 상태: 아비도스 화이트 프레임 & 스켈레톤 개머리판, 시안(청록) 발광 라인
        // ==========================================
        const isColorFang = targetEntity && targetEntity.isColorActive;
        const mainFrameColor = isColorFang ? '#1e293b' : '#ffffff';
        const subFrameColor = isColorFang ? '#0f172a' : '#f8fafc';
        const accentNeonColor = isColorFang ? '#64748b' : '#06b6d4';
        const glowNeonColor = isColorFang ? '#94a3b8' : '#00ffff';

        // 1. 후방 스켈레톤 개머리판 (Triangular Skeleton Stock)
        // (A) 외곽 프레임
        ctx.fillStyle = mainFrameColor;
        ctx.beginPath();
        ctx.moveTo(-6, -3);
        ctx.lineTo(-28, -5);
        ctx.lineTo(-32, -8);
        ctx.lineTo(-36, -8);
        ctx.lineTo(-36, 10);
        ctx.lineTo(-31, 10);
        ctx.lineTo(-26, 4);
        ctx.lineTo(-6, 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // (B) 개머리판 내부 삼각 컷아웃 중공부
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(-10, -1.5);
        ctx.lineTo(-28, -3.5);
        ctx.lineTo(-28, 5.5);
        ctx.lineTo(-10, 0.8);
        ctx.closePath();
        ctx.fill();

        // (C) 후방 충격흡수 블랙 버트패드
        ctx.fillStyle = '#18181b';
        ctx.fillRect(-37.5, -8.5, 3.5, 19);
        ctx.strokeRect(-37.5, -8.5, 3.5, 19);

        // 2. 권총 손잡이 (Black Ergonomic Pistol Grip & Baseplate)
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.moveTo(-2, 2);
        ctx.lineTo(-8, 12);
        ctx.lineTo(-3.5, 13.5);
        ctx.lineTo(2.5, 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 그립 하단 베이스패드 캡
        ctx.fillStyle = subFrameColor;
        ctx.fillRect(-8.5, 12, 5.5, 2.2);
        ctx.strokeRect(-8.5, 12, 5.5, 2.2);

        // 3. 중앙 리시버 본체 (Upper & Lower Receiver)
        ctx.fillStyle = mainFrameColor;
        ctx.beginPath();
        ctx.moveTo(-6, -7);
        ctx.lineTo(16, -7);
        ctx.lineTo(16, 4);
        ctx.lineTo(4, 4);
        ctx.lineTo(2, 2);
        ctx.lineTo(-6, 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 상부 리시버 발광 슬릿 라인 & 인디케이터
        ctx.fillStyle = accentNeonColor;
        ctx.fillRect(-2, -4.5, 12, 1.6);
        ctx.fillStyle = glowNeonColor;
        ctx.beginPath();
        ctx.arc(10, -3.7, 1.6, 0, Math.PI * 2);
        ctx.fill();

        // 하부 탄창 삽입구 악센트 라인
        ctx.fillStyle = accentNeonColor;
        ctx.fillRect(4.5, 2.5, 10.5, 1.4);

        // 아비도스(ABYDOS) 트라이앵글 심볼 마크
        ctx.strokeStyle = accentNeonColor;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(10, -0.5);
        ctx.lineTo(7, 2.8);
        ctx.lineTo(13, 2.8);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = glowNeonColor;
        ctx.beginPath();
        ctx.arc(10, 1.5, 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = '#0f172a';

        // 4. 전술 탄창 (Curved Black STANAG Magazine)
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.moveTo(5, 4);
        ctx.lineTo(15, 4);
        ctx.lineTo(17.5, 17);
        ctx.lineTo(9.5, 17.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 탄창 리브 그루브 음각선
        ctx.strokeStyle = isColorFang ? '#475569' : '#334155';
        ctx.lineWidth = 1.0;
        for (let mg = 0; mg < 3; mg++) {
          ctx.beginPath();
          ctx.moveTo(7 + mg * 3, 7);
          ctx.lineTo(11 + mg * 3, 16);
          ctx.stroke();
        }
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = '#0f172a';

        // 5. 상단 콤팩트 택티컬 스코프 (Top Optical Sight)
        // 마운트 베이스
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-2, -9, 14, 2);
        ctx.strokeRect(-2, -9, 14, 2);

        // 스코프 본체
        ctx.fillStyle = '#18181b';
        ctx.fillRect(-4, -14, 5, 5.5);
        ctx.strokeRect(-4, -14, 5, 5.5);

        ctx.fillStyle = mainFrameColor;
        ctx.fillRect(1, -13.5, 6, 4.5);
        ctx.strokeRect(1, -13.5, 6, 4.5);

        ctx.fillStyle = '#18181b';
        ctx.fillRect(7, -14.5, 6, 6.5);
        ctx.strokeRect(7, -14.5, 6, 6.5);

        // 스코프 렌즈 발광
        ctx.fillStyle = glowNeonColor;
        ctx.fillRect(-4.5, -13, 1.2, 3.5);
        ctx.beginPath();
        ctx.arc(13, -11.2, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // 6. 핸드가드 (Handguard with Cooling Vents)
        ctx.fillStyle = mainFrameColor;
        ctx.beginPath();
        ctx.moveTo(16, -7);
        ctx.lineTo(39, -7);
        ctx.lineTo(39, 1.5);
        ctx.lineTo(16, 2.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 사선 쿨링 벤트 슬릿 4개 (///)
        ctx.fillStyle = '#18181b';
        for (let v = 0; v < 4; v++) {
          const vx = 21 + v * 4.2;
          ctx.beginPath();
          ctx.moveTo(vx, -2.5);
          ctx.lineTo(vx + 2, -2.5);
          ctx.lineTo(vx - 0.5, 1.5);
          ctx.lineTo(vx - 2.5, 1.5);
          ctx.closePath();
          ctx.fill();
        }

        // 상부 가스 블록 벤트
        ctx.fillStyle = '#18181b';
        ctx.fillRect(20, -5.5, 14, 1.4);

        // 7. 버티컬 포어그립 (Vertical Foregrip)
        ctx.fillStyle = '#18181b';
        ctx.fillRect(24.5, 2.5, 4.5, 9.5);
        ctx.strokeRect(24.5, 2.5, 4.5, 9.5);

        // 포어그립 발광 링 2줄
        ctx.fillStyle = glowNeonColor;
        ctx.fillRect(24.5, 5, 4.5, 1.2);
        ctx.fillRect(24.5, 9.5, 4.5, 1.2);

        // 8. 프론트 사이트 & 총열 (Front Sight Post & Barrel)
        ctx.fillStyle = '#18181b';
        ctx.fillRect(38, -9.5, 2.5, 3.5);
        ctx.strokeRect(38, -9.5, 2.5, 3.5);

        // 총열 연결부
        ctx.fillStyle = '#475569';
        ctx.fillRect(39, -4.5, 8, 3.2);
        ctx.strokeRect(39, -4.5, 8, 3.2);

        // 9. 대형 블랙 소음기 (Cylindrical Suppressor)
        ctx.fillStyle = '#18181b';
        ctx.fillRect(47, -6, 17, 6.2);
        ctx.strokeRect(47, -6, 17, 6.2);

        // 소음기 후방 발광 링
        ctx.fillStyle = glowNeonColor;
        ctx.fillRect(48.5, -6, 2.2, 6.2);

        // 소음기 전방 캡 & 머즐 홀
        ctx.fillStyle = '#334155';
        ctx.fillRect(63.5, -5.2, 1.5, 4.6);

        // 10. 플레이어 양손 파지
        ctx.fillStyle = isColorFang ? '#334155' : '#0284c7';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        // 뒷손 (권총 손잡이)
        ctx.beginPath();
        ctx.arc(-2, 4, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // 앞손 (버티컬 포어그립)
        ctx.beginPath();
        ctx.arc(26.5, 6, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 11. 사격 시 소음기 머즐 플래시
        if (targetMain && targetMain.flashTimer > 0) {
          ctx.save();
          const flashGrad = ctx.createRadialGradient(65, -3, 1, 65, -3, 16);
          if (isColorFang) {
            flashGrad.addColorStop(0, '#ffffff');
            flashGrad.addColorStop(0.35, '#94a3b8');
            flashGrad.addColorStop(0.7, '#475569');
            flashGrad.addColorStop(1, 'rgba(30, 41, 59, 0)');
          } else {
            flashGrad.addColorStop(0, '#ffffff');
            flashGrad.addColorStop(0.35, '#22d3ee');
            flashGrad.addColorStop(0.7, '#06b6d4');
            flashGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
          }
          ctx.fillStyle = flashGrad;
          ctx.beginPath();
          ctx.arc(65, -3, 16, 0, Math.PI * 2);
          ctx.fill();

          // 미세 방전 스파크
          ctx.fillStyle = isColorFang ? '#cbd5e1' : '#ffffff';
          for (let s = 0; s < 3; s++) {
            ctx.fillRect(66 + s * 4, -4 + (Math.random() - 0.5) * 6, 2, 1.2);
          }
          ctx.restore();
        }

      } else if (isSMG) {
        // ==========================================
        // [메인 무기: SMG (FOX 45식 기관단총)]
        // 유저 레퍼런스 이미지 완벽 반영:
        // - 탄(Tan) / 사막색 코요테 브라운 리시버 & 핸드가드
        // - 후방 스켈레톤 접철식 와이어 개머리판
        // - 상단 캔틸레버 도트사이트 (레드닷 조준선)
        // - 전방 원통형 대구경 전술 소음기 (매트 블랙)
        // - 핸드가드 하단 수직 포어그립 (버티컬 그립)
        // - 스트레이트형 .45 ACP 대용량 탄창
        // ==========================================
        const tanMain = '#c29b6c';       // 메인 코요테 탄
        const tanHighlight = '#dfbc88';  // 상단 하이라이트
        const tanShadow = '#9a7444';     // 하단 음영
        const darkMetal = '#1e293b';     // 다크 메탈 파츠
        const deepBlack = '#0f172a';     // 외곽선 및 고무
        const opticGlass = 'rgba(56, 189, 248, 0.45)'; // 렌즈 글래스

        // 1. 후방 스켈레톤 접철식 개머리판 (Skeleton Folding Stock)
        ctx.strokeStyle = darkMetal;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        // 상단 지지 바
        ctx.moveTo(-4, -2.5);
        ctx.lineTo(-20, -3.5);
        // 하단 지지 바
        ctx.moveTo(-4, 4);
        ctx.lineTo(-18, 8);
        // 대각 트러스 보강선
        ctx.moveTo(-12, -3);
        ctx.lineTo(-8, 5);
        ctx.stroke();

        // 후방 버트패드 (Rubber Buttpad)
        ctx.fillStyle = deepBlack;
        ctx.fillRect(-22, -5, 3.2, 14);
        ctx.strokeRect(-22, -5, 3.2, 14);

        // 개머리판 힌지 마운트
        ctx.fillStyle = '#475569';
        ctx.fillRect(-5, -3, 3, 7.5);
        ctx.strokeRect(-5, -3, 3, 7.5);

        // 2. 권총 손잡이 (Pistol Grip)
        ctx.fillStyle = darkMetal;
        ctx.beginPath();
        ctx.moveTo(-2, 3);
        ctx.lineTo(4, 3);
        ctx.lineTo(2, 14);
        ctx.lineTo(-5, 14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 그립 텍스처 줄무늬
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.0;
        for (let g = 0; g < 3; g++) {
          ctx.beginPath();
          ctx.moveTo(-3 + g * 0.8, 6 + g * 2.5);
          ctx.lineTo(2 + g * 0.8, 6 + g * 2.5);
          ctx.stroke();
        }

        // 트리거 가드 & 방아쇠
        ctx.strokeStyle = deepBlack;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(6, 6, 4.5, 0, Math.PI * 0.9);
        ctx.stroke();
        ctx.fillStyle = '#64748b';
        ctx.fillRect(6, 4.5, 1.2, 3);

        // 3. 직선형 .45 ACP 탄창 (Straight Stick Magazine)
        ctx.save();
        ctx.translate(13, 3);
        ctx.rotate(0.06); // 약간 전방으로 뻗은 탄창 각도
        ctx.fillStyle = darkMetal;
        ctx.fillRect(0, 0, 5.5, 20);
        ctx.strokeStyle = deepBlack;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(0, 0, 5.5, 20);

        // 탄창 잔탄 확인창 (Brass Bullet Indicator Holes)
        ctx.fillStyle = '#eab308';
        ctx.fillRect(1.8, 6, 2, 2.5);
        ctx.fillRect(1.8, 11, 2, 2.5);

        // 탄창 하부 범퍼 베이스패드 (Desert Tan Basepad)
        ctx.fillStyle = tanMain;
        ctx.fillRect(-0.5, 19, 6.5, 3);
        ctx.strokeRect(-0.5, 19, 6.5, 3);
        ctx.restore();

        // 4. 상부/하부 리시버 바디 (Coyote Tan Receiver)
        ctx.fillStyle = tanMain;
        ctx.beginPath();
        ctx.moveTo(-4, -6.5);
        ctx.lineTo(20, -6.5);
        ctx.lineTo(20, 3.5);
        ctx.lineTo(-4, 3.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 상단 리시버 베벨 하이라이트
        ctx.fillStyle = tanHighlight;
        ctx.fillRect(-3, -6.5, 22, 1.8);

        // 하단 리시버 섀도우
        ctx.fillStyle = tanShadow;
        ctx.fillRect(-3, 1.5, 22, 1.8);

        // 탄피 배출구 (Ejection Port)
        ctx.fillStyle = '#18181b';
        ctx.fillRect(4, -5, 9, 3.8);
        ctx.strokeRect(4, -5, 9, 3.8);
        // 내부 볼트 캐리어
        ctx.fillStyle = '#475569';
        ctx.fillRect(6, -4.5, 5, 2.8);

        // 조정간 (Fire Selector Switch: Safe / Semi / Auto)
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // 셀렉터 레버 핀
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(2.5, -2);
        ctx.stroke();

        // 5. 총열 덮개 / 핸드가드 (Desert Tan Handguard & M-LOK Slots)
        ctx.fillStyle = tanMain;
        ctx.fillRect(20, -5.5, 16, 7.5);
        ctx.strokeRect(20, -5.5, 16, 7.5);

        // M-LOK 방열 슬릿 3개
        ctx.fillStyle = '#18181b';
        for (let m = 0; m < 3; m++) {
          ctx.fillRect(22 + m * 4.5, -3, 3, 2);
        }

        // 6. 상부 피카티니 레일 (Top Full-Length Picatinny Rail)
        ctx.fillStyle = darkMetal;
        ctx.fillRect(-2, -8.5, 38, 2);
        ctx.strokeRect(-2, -8.5, 38, 2);
        // 레일 요철 홈 (Rail Grooves)
        ctx.fillStyle = '#334155';
        for (let r = 0; r < 7; r++) {
          ctx.fillRect(1 + r * 5, -8.5, 2.5, 2);
        }

        // 7. 상단 도트사이트 조준기 (Red Dot Sight)
        // 캔틸레버 마운트
        ctx.fillStyle = darkMetal;
        ctx.fillRect(6, -10.5, 9, 2);
        ctx.strokeRect(6, -10.5, 9, 2);
        // 옵틱 튜브 하우징
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(4, -16, 13, 6);
        ctx.strokeRect(4, -16, 13, 6);
        // 대물렌즈 & 접안렌즈 테두리 림
        ctx.fillStyle = '#334155';
        ctx.fillRect(3, -16.5, 1.8, 7);
        ctx.fillRect(16.2, -16.5, 1.8, 7);
        // 렌즈 유리 반사광
        ctx.fillStyle = opticGlass;
        ctx.fillRect(5, -15, 11, 4.2);
        // 레티클 레드 도트 (Illuminated Red Dot)
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(10.5, -13, 1.0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 8. 하부 버티컬 포어그립 (Vertical Foregrip)
        ctx.fillStyle = darkMetal;
        ctx.beginPath();
        ctx.moveTo(25, 2);
        ctx.lineTo(29, 2);
        ctx.lineTo(28.5, 13);
        ctx.lineTo(24.5, 13);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // 포어그립 홈 요철
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(25, 6);
        ctx.lineTo(28.5, 6);
        ctx.moveTo(24.8, 9.5);
        ctx.lineTo(28.3, 9.5);
        ctx.stroke();

        // 9. 전방 전술 대구경 소음기 (Tactical Cylindrical Suppressor)
        ctx.fillStyle = '#18181b';
        ctx.fillRect(36, -5.2, 17, 6.8);
        ctx.strokeRect(36, -5.2, 17, 6.8);
        // 소음기 결합 널링 링 (Knurled Base Collar)
        ctx.fillStyle = '#334155';
        ctx.fillRect(36.5, -5.2, 2.5, 6.8);
        // 소음기 전면 머즐 캡
        ctx.fillStyle = '#475569';
        ctx.fillRect(52, -4.2, 1.5, 4.8);

        // 10. 플레이어 양손 파지
        ctx.fillStyle = targetEntity.color || '#0284c7';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        // 뒷손 (권총 손잡이)
        ctx.beginPath();
        ctx.arc(0, 5, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // 앞손 (버티컬 포어그립 파지)
        ctx.beginPath();
        ctx.arc(26.5, 7, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 11. 사격 시 소음기 머즐 플래시 (Amber / Gold Flash)
        if (targetMain && targetMain.flashTimer > 0) {
          ctx.save();
          const flashGrad = ctx.createRadialGradient(55, -2, 1, 55, -2, 14);
          flashGrad.addColorStop(0, '#ffffff');
          flashGrad.addColorStop(0.3, '#fde047');
          flashGrad.addColorStop(0.7, '#f59e0b');
          flashGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = flashGrad;
          ctx.beginPath();
          ctx.arc(55, -2, 14, 0, Math.PI * 2);
          ctx.fill();

          // 화염 스파크 2~3개
          ctx.fillStyle = '#fef08a';
          for (let s = 0; s < 3; s++) {
            ctx.fillRect(56 + s * 3.5, -3 + (Math.random() - 0.5) * 5, 2, 1.2);
          }
          ctx.restore();
        }

      } else {
        // ==========================================
        // [보조 무기: HG (상식적 수단) vs HG (루거 P08)]
        // ==========================================
        const isTactical = (targetSub && targetSub.id === 'hg_tactical');

        if (isTactical) {
          // [보조 무기: HG (상식적 수단 - 실버 택티컬 권총)]
          // 1. 하단 랜야드 와이어 루프
          ctx.save();
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-4, 15);
          ctx.lineTo(-4, 20);
          ctx.stroke();

          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.arc(-6, 21, 2.5, 0, Math.PI * 2);
          ctx.arc(-2, 21, 2.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          // 2. 하부 실버 프레임 & 매거진 베이스
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.moveTo(-7, 13);
          ctx.lineTo(-2, 14);
          ctx.lineTo(-2, 15.5);
          ctx.lineTo(-8, 14.5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 3. 블랙 에르고노믹 그립 패널
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.moveTo(-7, 0);
          ctx.lineTo(2, 0.5);
          ctx.lineTo(0.5, 13.5);
          ctx.lineTo(-5.5, 13.5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 4. 비버테일 & 실버 해머
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.moveTo(-6, -1);
          ctx.lineTo(-9, -3.5);
          ctx.lineTo(-7.5, -0.5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 5. 트리거 가드 & 레드 방아쇠
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.arc(3.5, 3.5, 3.5, 0.2, Math.PI * 0.85);
          ctx.stroke();
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(3, 2.5);
          ctx.quadraticCurveTo(5.5, 4.5, 4.5, 6);
          ctx.lineTo(3.5, 5);
          ctx.quadraticCurveTo(4, 3.5, 3, 2.5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 6. 하부 전방 피카티니 언더레일
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(5, -0.5, 12, 4);
          ctx.strokeRect(5, -0.5, 12, 4);

          // 7. 실버 슬라이드
          const slideGrad = ctx.createLinearGradient(0, -6.5, 0, 0);
          slideGrad.addColorStop(0, '#ffffff');
          slideGrad.addColorStop(0.35, '#f1f5f9');
          slideGrad.addColorStop(0.85, '#cbd5e1');
          slideGrad.addColorStop(1, '#94a3b8');
          ctx.fillStyle = slideGrad;
          ctx.fillRect(-7.5, -6.5, 26, 6);
          ctx.strokeRect(-7.5, -6.5, 26, 6);

          // 슬라이드 서레이션 & 약실
          ctx.fillStyle = '#64748b';
          ctx.fillRect(-6, -5.5, 1.0, 4);
          ctx.fillRect(-4, -5.5, 1.0, 4);
          ctx.fillRect(-2, -5.5, 1.0, 4);
          ctx.fillRect(0, -5.5, 1.0, 4);
          ctx.fillStyle = '#475569';
          ctx.fillRect(3.5, -6.2, 5.5, 3.2);
          ctx.strokeRect(3.5, -6.2, 5.5, 3.2);

          // 8. 가늠자 & 가늠쇠 & 머즐 팁
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-6.5, -8, 2.5, 2);
          ctx.fillRect(16, -8, 2.0, 2);
          ctx.fillStyle = '#334155';
          ctx.fillRect(18.5, -5.5, 1.5, 4);

          // 발사 머즐 플래시
          if (targetSub && targetSub.flashTimer > 0) {
            ctx.save();
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(22, -3.5, 5.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(21, -3.5, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        } else {
          // [보조 무기: 루거 P08 스타일 전술 권총]
          // 1. 에르고노믹 사선 그립 프레임 (Angled Grip Frame)
          ctx.fillStyle = '#18181b';
          ctx.beginPath();
          ctx.moveTo(-1, 0);
          ctx.lineTo(-7, 16);
          ctx.lineTo(-12, 14);
          ctx.lineTo(-7, -1);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 딥 블루 그립 패널 (Deep Blue Grip Panel Inlay)
          ctx.fillStyle = '#1d4ed8';
          ctx.beginPath();
          ctx.moveTo(-2, 1);
          ctx.lineTo(-7, 14.5);
          ctx.lineTo(-10.5, 13);
          ctx.lineTo(-6, 0);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#1e3a8a';
          ctx.stroke();
          ctx.strokeStyle = '#0f172a';

          // 하단 실버 나사 핀 & 힐 피스
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.arc(-7.5, 12.5, 1.2, 0, Math.PI * 2);
          ctx.fill();

          // 그립 상단 실버 안전 래치 레버 (Silver Safety Latch)
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(-6.5, 0.5, 2, 6.5);
          ctx.strokeRect(-6.5, 0.5, 2, 6.5);

          // 2. 라운드 트리거 가드 & 블루 방아쇠 (Round Trigger Guard & Blue Trigger)
          ctx.fillStyle = '#18181b';
          ctx.beginPath();
          ctx.arc(4, 5.5, 4.5, 0.2, Math.PI * 0.9);
          ctx.stroke();

          // 블루 트리거
          ctx.fillStyle = '#2563eb';
          ctx.beginPath();
          ctx.arc(2.5, 4, 3, 0, Math.PI * 0.5);
          ctx.lineTo(2.5, 4);
          ctx.fill();

          // 프레임 측면 실버 핀
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(6, 4.5, 1.5, 1.5);
          ctx.fillRect(1.5, 8, 1.5, 1.5);

          // 3. 리시버 & 루거 토글 액션 휠 (Receiver & Luger Toggle Action)
          ctx.fillStyle = '#27272a';
          ctx.fillRect(-6, -4, 16, 5);
          ctx.strokeRect(-6, -4, 16, 5);

          // 원형 토글 액션 볼트 휠 (Circular Toggle Wheel)
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.arc(-1, -3.8, 3.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // 휠 중심 액슬 핀
          ctx.fillStyle = '#18181b';
          ctx.beginPath();
          ctx.arc(-1, -3.8, 1.2, 0, Math.PI * 2);
          ctx.fill();

          // 4. 전면 블루 총열 칼라 링 (Vibrant Blue Barrel Collar)
          ctx.fillStyle = '#2563eb';
          ctx.fillRect(10, -3.2, 4.5, 4);
          ctx.strokeRect(10, -3.2, 4.5, 4);

          // 5. 슬림 원통형 롱 배럴 (Slim Cylindrical Barrel)
          ctx.fillStyle = '#27272a';
          ctx.fillRect(14.5, -2.4, 16, 2.8);
          ctx.strokeRect(14.5, -2.4, 16, 2.8);

          // 6. 삼각 가늠쇠 블록 (High Triangular Front Sight Post)
          ctx.fillStyle = '#18181b';
          ctx.beginPath();
          ctx.moveTo(30.5, 0.4);
          ctx.lineTo(35, 0.4);
          ctx.lineTo(35, -4.5);
          ctx.lineTo(32, -4.5);
          ctx.lineTo(30.5, -1);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 발사 머즐 플래시 (단발 사격 직후)
          if (targetSub && targetSub.flashTimer > 0) {
            ctx.save();
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(37, -1, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }

      ctx.restore();
    }

    // ==========================================
    // [서포터 지원무기: 상식적 수단 (HG) 캔버스 드로잉 함수]
    // 유저 제공 레퍼런스 실버 택티컬 권총 디자인 완벽 구현
    // (실버 슬라이드 & 프레임, 블랙 에르고노믹 그립 패널, 레드 방아쇠, 하단 랜야드 링/와이어)
    // ==========================================
    function drawSupporterWeapon() {}

    // 카이텐저 5인방 전용 무기 캔버스 드로잉 함수
    function drawKaitenzerWeapon(k, kScreenX, kScreenY, playerCenterX, playerCenterY, groundY) {
      // 플레이어를 향한 수평 방향 (1: 우측, -1: 좌측)
      const dir = (playerCenterX >= k.x + k.size / 2) ? 1 : -1;

      // 무기 장착 중심축 (카이텐저 몸체 전면부)
      const anchorX = kScreenX + (dir > 0 ? k.size * 0.72 : k.size * 0.28);
      const anchorY = kScreenY + k.size * 0.58;

      // 플레이어 위치를 향한 상하 조준 각도 (-26도 ~ +26도 제한)
      const dy = playerCenterY - (kScreenY + k.size / 2);
      const dx = Math.max(30, Math.abs(playerCenterX - k.x));
      let elev = Math.atan2(dy, dx);
      elev = Math.max(-0.45, Math.min(0.45, elev));

      ctx.save();
      ctx.translate(anchorX, anchorY);
      ctx.scale(dir, 1);
      ctx.rotate(elev);

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#0f172a';

      if (k.id === 'red') {
        // [레드: AR (돌격소총)]
        // 개머리판 (Stock)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-11, -3, 11, 6);
        ctx.strokeRect(-11, -3, 11, 6);

        // 손잡이 (Grip)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-2, 3, 4, 7);
        ctx.strokeRect(-2, 3, 4, 7);

        // 리시버 본체 (Receiver)
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, -4.5, 15, 8);
        ctx.strokeRect(0, -4.5, 15, 8);

        // 바나나 탄창 (Curved Magazine)
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(7, 3.5);
        ctx.lineTo(13, 3.5);
        ctx.lineTo(15, 13);
        ctx.lineTo(9, 13);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 핸드가드 (Handguard)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(15, -4, 9, 6.5);
        ctx.strokeRect(15, -4, 9, 6.5);

        // 총열 & 소염기 (Barrel & Flash Hider)
        ctx.fillStyle = '#64748b';
        ctx.fillRect(24, -2.5, 10, 3.5);
        ctx.strokeRect(24, -2.5, 10, 3.5);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(34, -3.5, 3.5, 5.5);
        ctx.strokeRect(34, -3.5, 3.5, 5.5);

        // 레드도트 조준경 (Red Dot Sight)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(3, -8, 8, 3.5);
        ctx.strokeRect(3, -8, 8, 3.5);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(6, -7, 2, 1.5);

        // 발사 화염 이펙트 (점사 사격 중)
        if (k.burstCount > 0 && k.burstInterval < 0.06) {
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(39, -1, 5, 0, Math.PI * 2);
          ctx.fill();
        }

      } else if (k.id === 'black') {
        // [블랙: HG (택티컬 권총)]
        // 손잡이 (Grip)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-2, 1, 5, 9);
        ctx.strokeRect(-2, 1, 5, 9);

        // 슬라이드 (Slide)
        ctx.fillStyle = '#475569';
        ctx.fillRect(0, -4, 15, 5.5);
        ctx.strokeRect(0, -4, 15, 5.5);

        // 약실 하이라이트 (Chamber)
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(5, -4, 3, 2);

        // 총구 (Muzzle Tip)
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(15, -3, 2.5, 3.5);
        ctx.strokeRect(15, -3, 2.5, 3.5);

        // 하부 언더레일 플래시/레이저 (Underbarrel Module)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(7, 1.5, 6, 3);
        ctx.strokeRect(7, 1.5, 6, 3);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(13, 2.2, 1.5, 1.5);

      } else if (k.id === 'yellow') {
        // [옐로: SR (대구경 정밀 저격총)]
        // 개머리판 및 뺨 받침 (Sniper Stock & Cheek Pad)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-15, -3.5, 15, 7);
        ctx.strokeRect(-15, -3.5, 15, 7);
        ctx.fillStyle = '#475569';
        ctx.fillRect(-11, -5.5, 8, 2);

        // 손잡이
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-2, 3.5, 4, 8);
        ctx.strokeRect(-2, 3.5, 4, 8);

        // 리시버 본체
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, -4.5, 18, 8);
        ctx.strokeRect(0, -4.5, 18, 8);

        // 직선형 탄창
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(6, 3.5, 6, 7.5);
        ctx.strokeRect(6, 3.5, 6, 7.5);

        // 초장축 중총열 (Heavy Fluted Barrel)
        ctx.fillStyle = '#64748b';
        ctx.fillRect(18, -3, 26, 4.5);
        ctx.strokeRect(18, -3, 26, 4.5);

        // 대형 머즐 브레이크 (Muzzle Brake)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(44, -4.5, 5.5, 7.5);
        ctx.strokeRect(44, -4.5, 5.5, 7.5);

        // 접이식 양각대 (Folded Bipod)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(30, 1.5, 9, 2.5);
        ctx.strokeRect(30, 1.5, 9, 2.5);

        // 고배율 광학 조준경 (High-Magnification Scope)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(4, -7, 2.5, 3);
        ctx.fillRect(12, -7, 2.5, 3);
        ctx.fillRect(-1, -10.5, 19, 4);
        ctx.strokeRect(-1, -10.5, 19, 4);
        ctx.fillRect(18, -11.5, 4.5, 6);
        ctx.strokeRect(18, -11.5, 4.5, 6);
        ctx.fillRect(-3, -11, 3, 5);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(21, -10, 1.5, 3.5);

      } else if (k.id === 'green') {
        // [그린: MG (중기관총)]
        // 개머리판 및 손잡이
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-10, -4, 10, 8);
        ctx.strokeRect(-10, -4, 10, 8);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-2, 4, 4, 8);
        ctx.strokeRect(-2, 4, 4, 8);

        // 기관총 본체 (Receiver)
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, -6, 21, 10);
        ctx.strokeRect(0, -6, 21, 10);

        // 상단 운반 손잡이 (Carrying Handle)
        ctx.strokeStyle = '#64748b';
        ctx.strokeRect(6, -9.5, 9, 3.5);

        // 하부 대용량 원형 드럼 탄창 (Round Drum Magazine)
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.ellipse(10, 9, 7.5, 7.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.stroke();

        // 방열판 타공 총열 (Perforated Heavy Barrel)
        const barrelColor = k.isOverheated ? '#ea580c' : '#475569';
        ctx.fillStyle = barrelColor;
        ctx.fillRect(21, -4.5, 16, 7);
        ctx.strokeRect(21, -4.5, 16, 7);

        // 타공 통풍구
        if (!k.isOverheated) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(24, -3, 2.5, 4);
          ctx.fillRect(29, -3, 2.5, 4);
        }

        // 나팔형 대형 소염기 (Conical Muzzle)
        ctx.fillStyle = k.isOverheated ? '#f97316' : '#0f172a';
        ctx.beginPath();
        ctx.moveTo(37, -3.5);
        ctx.lineTo(42, -5.5);
        ctx.lineTo(42, 5.5);
        ctx.lineTo(37, 3.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 과열 시 붉은 열기 이펙트
        if (k.isOverheated) {
          ctx.fillStyle = 'rgba(251, 146, 60, 0.7)';
          ctx.fillRect(21, -6.5, 21, 2);
        }

      } else if (k.id === 'pink') {
        // [핑크: RL (로켓 런처 / 바주카)]
        // 어깨 견착식 원통형 발사관 본체 (Heavy Tube)
        ctx.fillStyle = '#475569';
        ctx.fillRect(-15, -7.5, 38, 13);
        ctx.strokeRect(-15, -7.5, 38, 13);

        // 튜브 강화 링
        ctx.fillStyle = '#334155';
        ctx.fillRect(-4, -8, 4, 14);
        ctx.strokeRect(-4, -8, 4, 14);
        ctx.fillRect(10, -8, 4, 14);
        ctx.strokeRect(10, -8, 4, 14);

        // 후방 가스 분사구 (Rear Exhaust Bell)
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(-15, -7.5);
        ctx.lineTo(-20, -10);
        ctx.lineTo(-20, 10);
        ctx.lineTo(-15, 7.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 전방 총구 테두리 (Front Flared Muzzle)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(23, -9, 4, 16);
        ctx.strokeRect(23, -9, 4, 16);

        // 상단 광학 조준경 박스 (Optic Sight)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(1, -12, 10, 4.5);
        ctx.strokeRect(1, -12, 10, 4.5);
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(9, -11, 2, 2.5);

        // 더블 손잡이 (Foregrip & Trigger Grip)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 5.5, 4.5, 8.5);
        ctx.strokeRect(0, 5.5, 4.5, 8.5);
        ctx.fillRect(14, 5.5, 4.5, 7.5);
        ctx.strokeRect(14, 5.5, 4.5, 7.5);

        // 장전된 로켓 탄두 (발사 직전까지 앞쪽에 탄두 노출)
        if (k.attackTimer < 3.2) {
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.moveTo(27, -5.5);
          ctx.lineTo(37, 0);
          ctx.lineTo(27, 5.5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // 탄두 경고 띠
          ctx.fillStyle = '#facc15';
          ctx.fillRect(28, -5, 2.5, 10);
        }
      }

      ctx.restore();
    }

    // =========================================================================
    // [1. 등장 합체 시네마틱 전용]: KAITEN FX Mk.0 정면 뷰 (Front View)
    // - 합체 연출 전용: 사방에서 파츠가 날아와 쿵! 결합되는 정면 샷
    // =========================================================================
    function drawKaitenFxFront(boss, groundY, customCtx = null) {
      if (!boss.isSpawned || boss.isDead) return;

      const screenX = customCtx ? (boss.x || 0) : (boss.x - camera.x);
      const screenY = groundY - boss.height - (boss.jumpY || 0);
      const now = performance.now();
      const ctxToUse = customCtx || ctx;

      // 도킹 연출용 파라미터 계산
      const isIntro = boss.introState && boss.introState !== 'none' && boss.introState !== 'ready';
      const introProg = Math.max(0, Math.min(1, boss.introProgress || 0)); // 0 -> 1

      // 도킹 단계별 오프셋 (비행해 날아와 철컥 결합)
      // introState: 'docking' 일 때 (0 -> 1 진행 동안 사방에서 날아와 중앙으로 합체)
      let legOffset = 0;
      let armOffset = 0;
      let headOffset = 0;
      let showHead = true;

      if (boss.introState === 'docking') {
        const ease = 1 - Math.pow(1 - introProg, 3);
        legOffset = (1 - ease) * 180; // 바닥 아래에서 올라옴
        armOffset = (1 - ease) * 220; // 좌우 바깥에서 날아옴
        showHead = false; // 머리는 아직 몸통 내부
      } else if (boss.introState === 'head') {
        const hEase = 1 - Math.pow(1 - introProg, 2);
        headOffset = (1 - hEase) * 45; // 몸통 속에서 위로 솟아오름
      }

      return (function(ctx) {
        ctx.save();
        ctx.translate(screenX + boss.width / 2, screenY + boss.height);
        ctx.scale(1.45, 1.45); // 거대 로봇 스케일 증강

        // 0-A. [등 뒤 거대 폭발 이펙트]: 'explosion' 상태 시 웅장한 화염과 스파크 분출
        if (boss.introState === 'explosion') {
          const expProg = introProg; // 0 -> 1
          const expAlpha = Math.max(0, 1 - expProg * 0.9);
          ctx.save();
          ctx.translate(0, -130);
          
          // 방사형 화염 폭발 원형들
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const dist = 60 + expProg * 140;
            const radius = (35 + Math.sin(i * 1.5) * 15) * (1 + expProg * 0.8);
            const fx = Math.cos(angle) * dist;
            const fy = Math.sin(angle) * dist * 0.7;

            const grad = ctx.createRadialGradient(fx, fy, 5, fx, fy, radius);
            grad.addColorStop(0, `rgba(255, 255, 255, ${expAlpha})`);
            grad.addColorStop(0.3, `rgba(250, 204, 21, ${expAlpha * 0.9})`);
            grad.addColorStop(0.7, `rgba(239, 68, 68, ${expAlpha * 0.7})`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(fx, fy, radius, 0, Math.PI * 2);
            ctx.fill();
          }

          // 전방위 금빛 쇼크웨이브 링
          ctx.strokeStyle = `rgba(254, 240, 138, ${expAlpha})`;
          ctx.lineWidth = 14 * (1 - expProg);
          ctx.beginPath();
          ctx.ellipse(0, 0, expProg * 240, expProg * 160, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // 0-B. 바닥 정면 그림자 (소프트 + 접지 2중 타원)
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath();
        ctx.ellipse(0, 0, boss.width * 0.58, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(0, 0, boss.width * 0.42, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 밥핑 모션 (도킹 완료 후 작동)
        const bobY = isIntro ? 0 : (Math.sin(now * 0.003) * 3.5);
        ctx.translate(0, bobY);

        // 1. 오른다리 (옐로우 계란 - 골반에 밀착하여 길게 연장, 발끝 y=0 접지)
        ctx.save();
        ctx.translate(34, -86 + legOffset);
        // 고관절 연결 조인트
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-14, -62, 28, 22);
        // 계란말이 장갑 (길이 대폭 연장)
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-20, -42, 40, 80);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.2;
        ctx.strokeRect(-20, -42, 40, 80);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-20, -10, 40, 14);
        // 메카 슈즈 & 게타
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-18, 38, 36, 20);
        ctx.strokeRect(-18, 38, 36, 20);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-22, 64, 44, 12);
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(-20, 58, 40, 10);
        ctx.strokeRect(-20, 58, 40, 10);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-14, 76, 8, 10);
        ctx.fillRect(10, 76, 8, 10);
        ctx.restore();

        // 2. 왼다리 (블랙 연어알 - 골반에 밀착하여 길게 연장, 발끝 y=0 접지)
        ctx.save();
        ctx.translate(-34, -86 + legOffset);
        // 고관절 연결 조인트
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-14, -62, 28, 22);
        // 군함말이 아머 (길이 대폭 연장)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-20, -42, 40, 80);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2.2;
        ctx.strokeRect(-20, -42, 40, 80);
        // 이쿠라 알 캡슐
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.roundRect(-10, -36, 9, 68, 4);
        ctx.roundRect(1, -36, 9, 68, 4);
        ctx.fill();
        // 메카 슈즈 & 게타
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-18, 38, 36, 20);
        ctx.strokeRect(-18, 38, 36, 20);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-22, 64, 44, 12);
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(-20, 58, 40, 10);
        ctx.strokeRect(-20, 58, 40, 10);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-14, 76, 8, 10);
        ctx.fillRect(10, 76, 8, 10);
        ctx.restore();

        // 3. 몸통 (레드 참치 - 정면)
        ctx.save();
        ctx.translate(0, -160);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-48, -55, 96, 76);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-48, -55, 96, 76);
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 4.5;
        for (let r = 0; r < 3; r++) {
          ctx.beginPath();
          ctx.arc(0, -10, 24 + r * 14, Math.PI * 0.85, Math.PI * 2.15);
          ctx.stroke();
        }
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -55);
        ctx.lineTo(0, 21);
        ctx.stroke();
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(0, 8, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 정면 골반 하부 프레임 (다리와 연결)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-42, 21, 84, 18);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-36, 24, 72, 12);
        ctx.restore();

        // 4. 머리 (헤드 팝업 슬라이드 & 눈 번쩍임 연출)
        if (showHead) {
          ctx.save();
          ctx.translate(0, -225 + headOffset);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-12, 10, 24, 10);
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(0, -6, 22, Math.PI, 0);
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(-8, -28, 16, 22);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-16, -6, 32, 18);
          ctx.strokeRect(-16, -6, 32, 18);

          // 눈 번쩍임 (eye_flash 단계 또는 평소 아이들)
          const isFlashing = boss.introState === 'eye_flash';
          ctx.fillStyle = isFlashing ? '#ffffff' : '#38bdf8';
          if (isFlashing) {
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 25;
          }
          ctx.fillRect(-11, -2, 9, 5);
          ctx.fillRect(2, -2, 9, 5);

          // 안광 크로스 플래시 광선
          if (isFlashing) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            // 좌측 안광 십자선
            ctx.beginPath();
            ctx.moveTo(-16, 0.5); ctx.lineTo(2, 0.5);
            ctx.moveTo(-7, -8); ctx.lineTo(-7, 9);
            // 우측 안광 십자선
            ctx.moveTo(2, 0.5); ctx.lineTo(20, 0.5);
            ctx.moveTo(7, -8); ctx.lineTo(7, 9);
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
          ctx.restore();
        }

        // 5. 오른팔 (핑크 새우 - 우측에서 비행 도킹)
        ctx.save();
        ctx.translate(68 + armOffset, -165);
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.moveTo(-10, -28);
        ctx.quadraticCurveTo(10, -56, 32, -48);
        ctx.quadraticCurveTo(16, -26, 4, -20);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-14, -20, 32, 28);
        ctx.strokeRect(-14, -20, 32, 28);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-12, 10, 28, 30);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-10, 38, 24, 18);
        ctx.restore();

        // 6. 왼팔 (그린 오이롤 & 실드 - 좌측에서 비행 도킹)
        ctx.save();
        ctx.translate(-68 - armOffset, -165);
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(-18, -26, 36, 30);
        ctx.strokeRect(-18, -26, 36, 30);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-14, 6, 28, 30);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-12, 36, 24, 18);
        ctx.save();
        ctx.translate(-6, 24);
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 38, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
        ctx.restore();

        ctx.restore();
      })(ctxToUse);
    }

    // =========================================================================
    // [2. 인게임 실전 전투 전용]: KAITEN FX Mk.0 (75~80도 깊은 측면 프로필 뷰)
    // - 플레이어 방향(옆쪽)으로 75~80도 깊게 돌아선 진짜 횡스크롤 메카 보스 뷰!
    // - 몸통: 참치 붉은 사각의 [두툼한 측면(옆구리 80%)]이 메인으로 보이고 앞면은 살짝 감김
    // - 다리: 앞발(블랙 군함말이)이 적을 향해 성큼 딛고, 뒷발(옐로우 계란)이 뒤를 받치는 역동적 보행
    // - 팔: 앞팔(접시 실드)이 전방에서 가드/돌출, 뒷팔(새우 머신건)이 어깨 위로 조준
    // - 머리: 플레이어를 내려다보는 75도 날렵한 측면 페이스
    // =========================================================================
    function drawKaitenFx(boss, groundY, customCtx = null) {
      if (!boss.isSpawned || boss.isDead) return;

      const screenX = customCtx ? (boss.x || 0) : (boss.x - camera.x);
      const screenY = groundY - boss.height - (boss.jumpY || 0);
      const dir = boss.facing >= 0 ? 1 : -1;
      const now = performance.now();

      const origCtx = ctx;
      const ctxToUse = customCtx || origCtx;

      return (function(ctx) {
        ctx.save();
        ctx.translate(screenX + boss.width / 2, screenY + boss.height);
        ctx.scale(-dir * 1.45, 1.45); // 기본 드로잉 방향 일치 및 1.45배 거대화 스케일 증강!

        // 보행(워킹) 및 관절 자세(Kinematic Pose) 연산
        const isMoving = !!boss.isMoving;
        const walkCycle = boss.walkCycleTimer || 0;
        const walkSwing = isMoving ? Math.sin(walkCycle) * 16 : 0;
        const walkLiftF = isMoving ? Math.max(0, -Math.sin(walkCycle)) * 14 : 0; // 앞다리 들림
        const walkLiftB = isMoving ? Math.max(0, Math.sin(walkCycle)) * 14 : 0;  // 뒷다리 들림
        const baseBobY = isMoving ? (Math.abs(Math.sin(walkCycle * 2)) * 6 - 3) : (Math.sin(now * 0.003) * 3);

        // 보스 모션 상태 플래그
        const isShieldVisual = !!(boss.shieldVisualTimer && boss.shieldVisualTimer > 0);
        const isHatchOpen = !!(boss.chestHatchTimer && boss.chestHatchTimer > 0);
        const isSlashing = !!boss.isSlashing;
        const slashPhase = boss.slashPhase || 'none';
        const slashTimer = boss.slashTimer || 0;
        const isFiringGatling = boss.isFiringNormal || (boss.isFiringSkill && boss.activePart === 'pink');

        // 상태별 동적 자세 (Crouch, 무릎 굽힘, 상체 틸트)
        let crouchY = 0;
        let kneeBrace = 0;
        let torsoBraceTilt = 0;

        if (isShieldVisual) {
          // [초록 쉴드 전개 시]: 다리를 전방으로 굽혀 무게중심을 낮추고 묵직하게 가드
          crouchY = 14;
          kneeBrace = -0.32; // 전방(앞쪽)으로 쑥 굽혀지는 정방향 무릎 각도!
          torsoBraceTilt = 0.05;
        } else if (isSlashing) {
          // [파이널 고등어 슬래시]: 3단계 역동적 베기 자세
          if (slashPhase === 'charge') {
            crouchY = 6;
            kneeBrace = -0.14;
            torsoBraceTilt = -0.08; // 기모으기 상체 뒤로 젖힘
          } else if (slashPhase === 'slash') {
            crouchY = 12;
            kneeBrace = -0.26;
            torsoBraceTilt = 0.14; // 전방을 향해 호쾌하게 내리베기
          } else if (slashPhase === 'recover') {
            crouchY = 8;
            kneeBrace = -0.18;
            torsoBraceTilt = 0.06;
          }
        } else if (isHatchOpen) {
          // [레드 미사일 발사 시]: 가슴을 열고 반동을 지탱하는 웅크림
          crouchY = 6;
          kneeBrace = -0.14;
          torsoBraceTilt = 0;
        }

        const bodyBobY = baseBobY + crouchY;

        // 0. 현실적이고 부드러운 다중 레이어 지면 그림자
        ctx.save();
        const shadowPulse = isMoving ? (Math.sin(walkCycle * 2) * 4) : (crouchY * 0.5);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath();
        ctx.ellipse(0, 0, (boss.width * 0.58) + shadowPulse, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(0, 0, (boss.width * 0.42), 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // ---------------------------------------------------------------------
        // [다관절 팔 드로잉 모듈 함수 정의]
        // ---------------------------------------------------------------------

        // 1) 오른팔 (핑크 새우 어깨 & 6연장 개틀링 & 고등어 블레이드)
        const drawPinkArm = (isFront) => {
          const isPinkBroken = boss.parts.pink.isBroken;
          const isPinkActive = boss.activePart === 'pink' && !isPinkBroken;

          ctx.save();
          ctx.translate(0, bodyBobY);
          ctx.rotate(torsoBraceTilt);

          let armShoulderX = 35;
          let armShoulderY = -190;
          let shoulderAngle = 0;
          let elbowAngle = 0.08;
          let armScale = isFront ? 1.05 : 0.92;

          if (isSlashing) {
            // [무한회전 파이널 고등어 슬래시 모션]
            if (slashPhase === 'charge') {
              armShoulderX = 22;
              armShoulderY = -186;
              shoulderAngle = 0.82; // 검을 머리 뒤로 높게 치켜듦
              elbowAngle = -0.92;   // 팔꿈치 굽힘
            } else if (slashPhase === 'slash') {
              const p = Math.max(0, Math.min(1, 1.0 - (slashTimer / 0.4)));
              const ease = p * p * (3 - 2 * p);
              armShoulderX = 22 - ease * 16;
              armShoulderY = -186 + ease * 10;
              shoulderAngle = 0.82 - ease * 2.25; // 120도 수직 횡베기 스윙!
              elbowAngle = -0.92 + ease * 0.82;
            } else if (slashPhase === 'recover') {
              armShoulderX = 6;
              armShoulderY = -176;
              shoulderAngle = -1.18; // 바닥 앞쪽으로 검을 내리꽂은 팔로우스루
              elbowAngle = -0.25;
            }
          } else if (isHatchOpen) {
            // [레드 미사일 발사 시]: 양팔 'ㄴ'자 반동 억제 자세!
            armShoulderX = 38;
            armShoulderY = -184;
            shoulderAngle = 0.42;   // 어깨를 살짝 뒤로 젖히고
            elbowAngle = -1.55;    // 팔꿈치 90도 꺾어 주먹을 위로 세운 'ㄴ' 자세!
          } else if (isFiringGatling) {
            // [머신건 사격 시]: 팔을 앞으로 쭉 뻗고 플레이어 좌표를 향해 각도 조준!
            armShoulderX = 16;
            armShoulderY = -186;
            shoulderAngle = -(boss.aimAngle || 0); // 플레이어 높이에 따른 실시간 조준 각도!
            elbowAngle = 0; // 사격 시 일직선으로 뻗어 조준 방향 및 탄도 궤적과 100% 일치!
          }

          ctx.translate(armShoulderX, armShoulderY);
          ctx.rotate(shoulderAngle);
          ctx.scale(armScale, armScale);

          if (isPinkActive) {
            ctx.strokeStyle = '#ec4899';
            ctx.lineWidth = 3.5;
            ctx.strokeRect(-24, -40, 50, 92);
          }

          // 어깨 볼 조인트
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.stroke();

          // 새우 꼬리 지느러미
          ctx.fillStyle = isPinkBroken ? '#64748b' : '#f472b6';
          ctx.beginPath();
          ctx.moveTo(-10, -28);
          ctx.quadraticCurveTo(8, -72, 38, -62);
          ctx.quadraticCurveTo(20, -26, 4, -18);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.moveTo(38, -62);
          ctx.lineTo(52, -74);
          ctx.lineTo(44, -58);
          ctx.lineTo(54, -54);
          ctx.lineTo(40, -48);
          ctx.closePath();
          ctx.fill();

          // 상완 장갑
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(-18, -26, 38, 34);
          ctx.strokeRect(-18, -26, 38, 34);
          ctx.fillStyle = isPinkBroken ? '#475569' : '#ec4899';
          ctx.fillRect(-14, -22, 30, 8);
          ctx.fillRect(-14, -8, 30, 8);

          // 팔꿈치 관절
          ctx.save();
          ctx.translate(-8, 6);
          ctx.rotate(elbowAngle);

          // 팔꿈치 볼 조인트 원판
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(0, 0, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1.8;
          ctx.stroke();

          // [유저 스케치 완벽 반영]: 핑크색 새우 팔뚝 완갑 위에 머신건 총신이 건틀릿 형태로 일체형 결합!
          // 하단: 핑크 새우 팔뚝 본체
          ctx.fillStyle = isPinkBroken ? '#64748b' : '#f472b6';
          ctx.fillRect(-52, 0, 56, 22);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2.2;
          ctx.strokeRect(-52, 0, 56, 22);

          // 새우 살결 줄무늬
          ctx.fillStyle = isPinkBroken ? '#475569' : '#ec4899';
          ctx.fillRect(-44, 3, 8, 16);
          ctx.fillRect(-26, 3, 8, 16);

          // 상단: 팔뚝 위에 견고하게 마운트된 개틀링 건틀릿 하우징
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-48, -16, 52, 16);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.strokeRect(-48, -16, 52, 16);

          // 전방 돌출 6연장 총열 (사격 시 회전감 및 길이 연장)
          const gunLength = isFiringGatling ? 56 : (isHatchOpen ? 22 : 30);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(-48 - gunLength, -14, gunLength, 12);
          ctx.strokeStyle = '#0f172a';
          ctx.strokeRect(-48 - gunLength, -14, gunLength, 12);

          // 머즐 팁
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-56 - gunLength, -15, 8, 14);

          // 머신건 사격 총구 화염 (Muzzle Flash - 초경량 연산, 렉 0%)
          if (isFiringGatling) {
            ctx.save();
            const muzzleTipX = -58 - gunLength;
            const muzzleTipY = -6;

            // 반투명 외곽 플래시
            ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
            ctx.beginPath();
            ctx.arc(muzzleTipX, muzzleTipY, 22, 0, Math.PI * 2);
            ctx.fill();

            // 중심 고열 섬광
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(muzzleTipX, muzzleTipY, 12 + Math.random() * 5, 0, Math.PI * 2);
            ctx.fill();

            // 십자 섬광 스파이크
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(muzzleTipX - 18, muzzleTipY);
            ctx.lineTo(muzzleTipX + 18, muzzleTipY);
            ctx.moveTo(muzzleTipX, muzzleTipY - 18);
            ctx.lineTo(muzzleTipX, muzzleTipY + 18);
            ctx.stroke();
            ctx.restore();
          }

          // [무한회전 파이널 고등어 블레이드 (손에 쥐고 휘두르는 거대 사시미 대검)]
          if (isSlashing) {
            ctx.save();
            ctx.translate(-24, 18); // 팔뚝 손잡이/주먹 위치
            ctx.rotate(0.35);

            // 외곽 발광 레이어 (shadowBlur 없이 초경량 네온 글로우)
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
            ctx.lineWidth = 12;
            ctx.beginPath();
            ctx.moveTo(0, 10);
            ctx.lineTo(14, -160);
            ctx.lineTo(0, -180);
            ctx.lineTo(-11, -160);
            ctx.lineTo(-6, 10);
            ctx.closePath();
            ctx.stroke();

            // 거대 고등어 대검 날 본체
            ctx.fillStyle = '#00e5ff';
            ctx.beginPath();
            ctx.moveTo(0, 10);
            ctx.lineTo(12, -155);
            ctx.lineTo(0, -175);
            ctx.lineTo(-9, -155);
            ctx.lineTo(-6, 10);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.8;
            ctx.stroke();

            // 백색 예리한 칼날 코어 라인
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 10);
            ctx.lineTo(0, -170);
            ctx.stroke();

            // 황금빛 힐트 & 손잡이
            ctx.fillStyle = '#eab308';
            ctx.fillRect(-12, 10, 24, 8);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(-7, 18, 14, 28);
            ctx.strokeStyle = '#eab308';
            ctx.strokeRect(-7, 18, 14, 28);

            // 스윙 시 검신 뒤로 남는 푸른빛 잔상 아크 (Slash Trail)
            if (slashPhase === 'slash') {
              ctx.strokeStyle = 'rgba(0, 229, 255, 0.55)';
              ctx.lineWidth = 12;
              ctx.beginPath();
              ctx.arc(0, 0, 160, -Math.PI * 0.45, 0.05);
              ctx.stroke();
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.arc(0, 0, 160, -Math.PI * 0.38, 0.02);
              ctx.stroke();
            }
            ctx.restore();
          }

          ctx.restore(); // 팔꿈치 복원
          ctx.restore(); // 오른팔 복원
        };

        // 2) 왼팔 (그린 오이롤 어깨 & 회전초밥 접시 쉴드)
        const drawGreenArm = (isFront) => {
          const isGreenBroken = boss.parts.green.isBroken;
          const isGreenActive = boss.activePart === 'green' && !isGreenBroken;

          ctx.save();
          ctx.translate(0, bodyBobY);
          ctx.rotate(torsoBraceTilt);

          let shieldArmX = -52;
          let shieldArmY = -170;
          let shoulderAngle = 0;
          let elbowAngle = 0;
          let armScale = isFront ? 1.1 : 0.95;

          if (isShieldVisual) {
            // [초록 병뚜껑 쉴드 자세]: 왼팔을 전방으로 뻗고 방어 자세
            shieldArmX = -68;
            shieldArmY = -164;
            shoulderAngle = -0.15;
            elbowAngle = -0.22;
          } else if (isHatchOpen) {
            // [레드 미사일 발사 시]: 왼팔도 'ㄴ'자 형태로 옆으로 꺾어 가슴을 개방!
            shieldArmX = -38;
            shieldArmY = -170;
            shoulderAngle = 0.38;
            elbowAngle = -1.55; // 90도 꺾은 'ㄴ'자
          } else if (isSlashing) {
            shieldArmX = -48;
            shieldArmY = -168;
            shoulderAngle = -0.25;
            elbowAngle = -0.35;
          }

          ctx.translate(shieldArmX, shieldArmY);
          ctx.rotate(shoulderAngle);
          ctx.scale(armScale, armScale);

          if (isGreenActive) {
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 3.5;
            ctx.strokeRect(-28, -34, 54, 88);
          }

          // 어깨 볼 조인트
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#16a34a';
          ctx.lineWidth = 2.2;
          ctx.stroke();

          // 오이 김말이 롤 어깨 블록
          ctx.fillStyle = isGreenBroken ? '#475569' : '#16a34a';
          ctx.fillRect(-22, -28, 42, 34);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2.2;
          ctx.strokeRect(-22, -28, 42, 34);
          ctx.fillStyle = '#86efac';
          ctx.beginPath();
          ctx.arc(-2, -11, 9, 0, Math.PI * 2);
          ctx.fill();

          // 팔꿈치 관절
          ctx.save();
          ctx.translate(-8, 14);
          ctx.rotate(elbowAngle);

          // 팔꿈치 볼 조인트 원판
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(0, 0, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1.8;
          ctx.stroke();

          // 하완 팔뚝 & 주먹
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-18, 0, 36, 34);
          ctx.strokeRect(-18, 0, 36, 34);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-22, 34, 30, 22);
          ctx.strokeRect(-22, 34, 30, 22);

          // 회전초밥 접시 원형 쉴드
          ctx.save();
          ctx.translate(-16, 26);
          const shieldGlow = boss.shieldActive;

          // 접시 두께 (측면 3D 림)
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.ellipse(4, 0, 16, 46, 0.1, 0, Math.PI * 2);
          ctx.fill();

          // 외곽 거대 회전초밥 접시
          ctx.fillStyle = shieldGlow ? '#dbeafe' : '#f1f5f9';
          ctx.beginPath();
          ctx.ellipse(0, 0, 15, 45, 0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = shieldGlow ? '#38bdf8' : '#0f172a';
          ctx.lineWidth = shieldGlow ? 3.5 : 2.5;
          ctx.stroke();

          // 접시 남색 테두리 무늬
          ctx.strokeStyle = '#1e3a8a';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(0, 0, 10, 36, 0.1, 0, Math.PI * 2);
          ctx.stroke();

          // 접시 중앙 황금빛 엠블럼
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.ellipse(0, 0, 4, 8, 0.1, 0, Math.PI * 2);
          ctx.fill();

          // [3초 동안 발동하는 푸른빛 플라즈마 보호막 (파란색 에너지 배리어)]
          if (isShieldVisual) {
            const plasmaPulse = Math.sin(now * 0.015) * 5;
            ctx.save();
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.ellipse(-14, 0, 28 + plasmaPulse, 85 + plasmaPulse, 0.08, -Math.PI * 0.5, Math.PI * 0.5);
            ctx.stroke();

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.fillStyle = 'rgba(56, 189, 248, 0.32)';
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            for (let p = 0; p < 4; p++) {
              const arcY = -60 + p * 40 + (Math.random() - 0.5) * 8;
              ctx.beginPath();
              ctx.moveTo(-14, arcY);
              ctx.lineTo(-30 - Math.random() * 12, arcY + (Math.random() - 0.5) * 16);
              ctx.stroke();
            }
            ctx.restore();
          }
          ctx.restore(); // 접시 쉴드 복원
          ctx.restore(); // 팔꿈치 복원
          ctx.restore(); // 왼팔 복원
        };

        // ---------------------------------------------------------------------
        // [레이어 1: 뒤편 파츠 (Far / Background)]
        // ---------------------------------------------------------------------

        // 1-1. [뒷다리: 옐로우 계란말이 (골반 ➔ 무릎 관절 ➔ 발목 관절 계층 연결)]
        ctx.save();
        ctx.translate(32 - walkSwing * 0.8, -86 - walkLiftB + crouchY);
        ctx.scale(0.9, 0.9);

        // 골반 힙 볼 조인트
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, -68, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 대퇴부 허벅지 상단 프레임
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-14, -68, 28, 26);

        // 계란말이 허벅지 아머
        const eggGlow = boss.activePart === 'pink';
        ctx.fillStyle = eggGlow ? '#fde047' : '#eab308';
        ctx.fillRect(-20, -50, 42, 42);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.2;
        ctx.strokeRect(-20, -50, 42, 42);

        // 무릎 메카 관절 (Knee Disc Joint)
        const kneeBendB = (isMoving ? Math.max(0, Math.sin(walkCycle)) * 0.18 : 0) + kneeBrace;
        ctx.save();
        ctx.translate(0, -8);
        ctx.rotate(kneeBendB);

        // 무릎 볼 조인트 원판
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-3, -3, 6, 6);

        // 정강이 하단 아머 & 계란 김 띠
        ctx.fillStyle = eggGlow ? '#fde047' : '#eab308';
        ctx.fillRect(-20, 0, 42, 44);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.2;
        ctx.strokeRect(-20, 0, 42, 44);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-20, 10, 42, 14);

        // 발목 볼 조인트
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 44, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(0, 44);
        ctx.rotate(-kneeBendB); // 발목 각도 보정으로 나막신 바닥 수평 유지
        ctx.translate(0, -44);

        // 메카 발목 슈즈 (옆모습)
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-18, 44, 38, 20);
        ctx.strokeRect(-18, 44, 38, 20);

        // 게타 나막신 발판 (바닥 접지 높이 맞춤)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-22, 64, 46, 12);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-20, 58, 42, 10);
        ctx.strokeRect(-20, 58, 42, 10);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-14, 76, 8, 10);
        ctx.fillRect(10, 76, 8, 10);
        ctx.restore(); // 발목 각도 복원
        ctx.restore(); // 무릎 관절 복원
        ctx.restore(); // 뒷다리 복원

        // 1-2. [시선 방향에 따른 배경 팔 드로잉]:
        // 오른쪽을 볼 때는 초록이 뒤로, 왼쪽을 볼 때는 핑크가 뒤로!
        // 단, 필살기 고등어 슬래시(isSlashing) 도중에는 핑크 검 팔이 무조건 전경(앞)에 와야 검격 모션이 가려지지 않음!
        const isRightFacing = (boss.facing >= 0);
        const isPinkForeground = isSlashing || isRightFacing;
        if (isPinkForeground) {
          drawGreenArm(false); // 초록 팔 배경 드로잉
        } else {
          drawPinkArm(false);  // 핑크 팔 배경 드로잉
        }

        // ---------------------------------------------------------------------
        // [레이어 2: 몸통 코어 & 머리 헤드 (상체 밥핑 & 웅크림 연동)]
        // ---------------------------------------------------------------------
        ctx.save();
        ctx.translate(0, bodyBobY);
        ctx.rotate(torsoBraceTilt);

        const isRedBroken = boss.parts.red.isBroken;
        const isRedActive = boss.activePart === 'red' && !isRedBroken;

        ctx.save();
        ctx.translate(0, -172);

        if (isRedActive) {
          const pulse = Math.sin(now * 0.008) * 4;
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3.5;
          ctx.strokeRect(-62 - pulse/2, -66 - pulse/2, 110 + pulse, 98 + pulse);
        }

        // 2-1. 참치 몸통의 거대한 옆면 (Side Face)
        ctx.fillStyle = isRedBroken ? '#334155' : '#b91c1c';
        ctx.fillRect(-36, -60, 72, 85);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-36, -60, 72, 85);

        // 참치 살결 측면 줄무늬
        ctx.strokeStyle = isRedBroken ? '#475569' : '#dc2626';
        ctx.lineWidth = 3.5;
        for (let s = 0; s < 3; s++) {
          ctx.beginPath();
          ctx.moveTo(-32, -45 + s * 24);
          ctx.lineTo(30, -52 + s * 24);
          ctx.stroke();
        }

        // 2-2. 전방 가슴 해치 내부: 미사일 사일로 베이 (해치 오픈 시 노출!)
        if (isHatchOpen) {
          ctx.save();
          ctx.fillStyle = '#020617';
          ctx.fillRect(-52, -48, 26, 62);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.8;
          ctx.strokeRect(-52, -48, 26, 62);

          // 8발 사일로 튜브 구멍들
          for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 2; col++) {
              ctx.fillStyle = '#ef4444';
              ctx.beginPath();
              ctx.arc(-46 + col * 12, -40 + row * 14, 3.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#fde047';
              ctx.fillRect(-47 + col * 12, -41 + row * 14, 2, 2);
            }
          }
          ctx.restore();
        }

        // 2-3. 전방 가슴 앞면 (해치 오픈 시 앞/위로 젖혀짐!)
        ctx.save();
        if (isHatchOpen) {
          ctx.translate(-54, -55);
          ctx.rotate(-0.35); // 위쪽으로 철컥 젖혀진 해치 합판!
          ctx.translate(54, 55);
        }
        ctx.fillStyle = isRedBroken ? '#475569' : '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-36, -60);
        ctx.lineTo(-54, -55);
        ctx.lineTo(-54, 30);
        ctx.lineTo(-36, 25);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(-54, -12, 18, -Math.PI * 0.45, Math.PI * 0.45);
        ctx.stroke();
        ctx.restore(); // 해치 패널 회전 복원

        // 2-4. 원형 접시 버클
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(-28, 12, 8, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // 몸통 하부 메카 골반 프레임
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-38, 25, 76, 22);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-34, 28, 68, 16);
        ctx.restore(); // 몸통 복원

        // ---------------------------------------------------------------------
        // [레이어 3: 머리 헤드]
        // ---------------------------------------------------------------------
        ctx.save();
        ctx.translate(-16, -240);

        // 목 조인트
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-2, 14, 20, 10);

        // 셰프 머리띠 투구
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(6, -6, 22, -Math.PI * 0.8, Math.PI * 0.2);
        ctx.lineTo(-14, 10);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-4, -28, 14, 24);

        // 로봇 측면 마스크
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(-16, -6);
        ctx.lineTo(8, -6);
        ctx.lineTo(6, 12);
        ctx.lineTo(-20, 8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 듀얼 아이 센서 (shadowBlur 없는 초경량 네온 센서)
        const eyeFlash = boss.introState === 'eye_flash' || Math.sin(now * 0.005) > 0.8;
        if (eyeFlash) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.fillRect(-20, -4, 16, 9.5);
        }
        ctx.fillStyle = eyeFlash ? '#ffffff' : (boss.atg >= 100 ? '#00e5ff' : '#38bdf8');
        ctx.fillRect(-18, -2, 12, 5.5);
        ctx.restore(); // 머리 복원

        ctx.restore(); // 상체 밥핑 & 틸트 복원

        // ---------------------------------------------------------------------
        // [레이어 4: 앞다리 (Near Leg)]
        // ---------------------------------------------------------------------
        ctx.save();
        ctx.translate(-24 + walkSwing, -86 - walkLiftF + crouchY);
        ctx.scale(1.05, 1.05);

        // 골반 힙 볼 조인트
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, -72, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // 골반 연결 상부 대퇴부 프레임
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-16, -72, 32, 26);

        // 허벅지 군함말이 검은 아머 상단
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-24, -54, 50, 46);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-24, -54, 50, 46);

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-24, -10, 24, -Math.PI * 0.45, Math.PI * 0.45);
        ctx.stroke();

        // 무릎 메카 관절
        const kneeBendF = (isMoving ? Math.max(0, -Math.sin(walkCycle)) * 0.22 : 0) + kneeBrace;
        ctx.save();
        ctx.translate(0, -8);
        ctx.rotate(kneeBendF);

        // 무릎 볼 조인트 원판
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-3, -3, 6, 6);

        // 정강이 군함말이 아머 하단
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-24, 0, 50, 44);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-24, 0, 50, 44);

        // 측면 노출 연어알 캡슐 2개
        const eelGlow = boss.activePart === 'green';
        for (let i = 0; i < 2; i++) {
          const capX = -6 + i * 15;
          ctx.fillStyle = eelGlow ? '#f87171' : '#dc2626';
          ctx.beginPath();
          ctx.roundRect(capX - 5, -36, 11, 64, 5);
          ctx.fill();
          ctx.strokeStyle = '#7f1d1d';
          ctx.lineWidth = 1.8;
          ctx.stroke();
          ctx.fillStyle = '#fef2f2';
          ctx.fillRect(capX - 3, -30, 3, 28);
        }
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-24, -4, 50, 14);

        // 발목 볼 조인트
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 44, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(0, 44);
        ctx.rotate(-kneeBendF); // 발목 각도 보정으로 나막신 바닥 수평 유지
        ctx.translate(0, -44);

        // 앞발 화이트 메카 슈즈
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-24, 44, 48, 20);
        ctx.strokeRect(-24, 44, 48, 20);

        // 게타 나막신
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-28, 64, 56, 12);
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(-26, 58, 52, 10);
        ctx.strokeRect(-26, 58, 52, 10);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-20, 76, 9, 10);
        ctx.fillRect(14, 76, 9, 10);

        if (eelGlow) {
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 3;
          ctx.strokeRect(-26, -56, 54, 96);
        }
        ctx.restore(); // 발목 각도 복원
        ctx.restore(); // 무릎 관절 복원
        ctx.restore(); // 앞다리 복원

        // ---------------------------------------------------------------------
        // [레이어 5: 최상단 전면 팔 드로잉 (Foreground Layer)]
        // 오른쪽 볼 때: 핑크가 가장 위! 왼쪽 볼 때: 초록이 가장 위! (단, 슬래시 필살기 때는 핑크가 항상 최상단)
        // ---------------------------------------------------------------------
        if (isPinkForeground) {
          drawPinkArm(true);   // 핑크 팔 최상단 전경 드로잉!
        } else {
          drawGreenArm(true);  // 초록 팔 최상단 전경 드로잉!
        }

        // ---------------------------------------------------------------------
        // [레이어 6: 등 뒤 수납 대검 (ATG 100% 충전 시 장착 경고 푸른빛 오라)]
        // ---------------------------------------------------------------------
        if (!boss.isSlashing && boss.atg >= 100) {
          ctx.save();
          ctx.translate(15, -185 + crouchY);
          ctx.rotate(-0.5);

          const bladeGrad = ctx.createLinearGradient(0, -150, 18, 0);
          bladeGrad.addColorStop(0, '#ffffff');
          bladeGrad.addColorStop(0.5, '#67e8f9');
          bladeGrad.addColorStop(1, '#0284c7');
          ctx.fillStyle = bladeGrad;
          ctx.beginPath();
          ctx.moveTo(0, 24);
          ctx.lineTo(9, -150);
          ctx.lineTo(0, -165);
          ctx.lineTo(-7, -150);
          ctx.lineTo(-5, 24);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2.2;
          ctx.stroke();

          ctx.fillStyle = '#eab308';
          ctx.fillRect(-7, 24, 14, 7);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-5, 31, 10, 34);
          ctx.strokeStyle = '#eab308';
          ctx.strokeRect(-5, 31, 10, 34);

          // 외곽 글로우 (shadowBlur 없이 초경량 네온 테두리)
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.moveTo(0, 24);
          ctx.lineTo(9, -150);
          ctx.lineTo(0, -165);
          ctx.lineTo(-7, -150);
          ctx.lineTo(-5, 24);
          ctx.closePath();
          ctx.stroke();

          ctx.strokeStyle = '#00e5ff';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.restore();
        }

        // KAITEN FX Mk.0 머리 위 디버프/스턴 상태 표시
        if (boss.stunTimer > 0) {
          ctx.save();
          ctx.font = 'bold 16px monospace';
          ctx.fillStyle = '#facc15';
          ctx.shadowColor = '#eab308';
          ctx.shadowBlur = 10;
          ctx.fillText(`⚡ STUN (${boss.stunTimer.toFixed(1)}s)`, -50, -290);
          ctx.shadowBlur = 0;
          ctx.restore();
        }
        if (boss.critDmgResistDebuffTimer > 0) {
          ctx.save();
          ctx.font = 'bold 13px monospace';
          ctx.fillStyle = '#fb923c';
          ctx.shadowColor = '#ea580c';
          ctx.shadowBlur = 8;
          ctx.fillText(`🎯 치명 저항 -${boss.critDmgResistDebuff || 22}% (${boss.critDmgResistDebuffTimer.toFixed(1)}s)`, -75, -310);
          ctx.shadowBlur = 0;
          ctx.restore();
        }
        if (boss.atkDebuffTimer > 0) {
          ctx.save();
          ctx.font = 'bold 13px monospace';
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#0284c7';
          ctx.shadowBlur = 8;
          ctx.fillText(`🔻 ATK -${Math.round((boss.atkDebuffRatio || 0.30) * 100)}% (${boss.atkDebuffTimer.toFixed(1)}s)`, -55, -330);
          ctx.shadowBlur = 0;
          ctx.restore();
        }

        ctx.restore();
      })(ctxToUse);
    }

    /**
     * [신규 UI] 활성화된 파츠 직상단 실시간 체력바 렌더링 함수
     * 상단 메인 HUD 대신 현재 활성화된 파츠(오른팔/가슴/왼팔) 바로 위에 플레이어 체력바처럼 표시
     */
    function drawKaitenFxActivePartOverheadHpBar(boss, groundY) {
      if (!boss || !boss.isSpawned || boss.isDead || !boss.activePart || boss.activePart === 'none') return;
      if (boss.introState && boss.introState !== 'ready') return;

      const partKey = boss.activePart;
      const part = boss.parts ? boss.parts[partKey] : null;
      if (!part || part.isBroken) return;

      const dir = boss.facing >= 0 ? 1 : -1;
      const screenX = boss.x - camera.x;
      const screenY = groundY - boss.height - (boss.jumpY || 0);

      // 파츠별 장착 월드/스크린 상대 좌표 오프셋 (로봇 몸체 중심 기준)
      let partOffsetX = 0;
      let partOffsetY = -150;
      let partName = '';
      let partColor = '#facc15';

      if (partKey === 'pink') {
        // 핑크: 오른팔 슈림프 개틀링 머신건
        partOffsetX = -dir * 60;
        partOffsetY = -175;
        partName = '오른팔 [슈림프 개틀링]';
        partColor = '#ec4899';
      } else if (partKey === 'red') {
        // 레드: 가슴 참치 쉴드 플레이트
        partOffsetX = -dir * 10;
        partOffsetY = -240;
        partName = '가슴 [참치 실드]';
        partColor = '#ef4444';
      } else if (partKey === 'green') {
        // 그린: 왼팔 고등어 슬래시 블레이드
        partOffsetX = dir * 65;
        partOffsetY = -185;
        partName = '왼팔 [고등어 블레이드]';
        partColor = '#22c55e';
      }

      const pX = screenX + boss.width / 2 + partOffsetX;
      const pY = screenY + boss.height + partOffsetY;

      const maxHp = boss.partMaxHp || 1500000;
      const curHp = Math.max(0, part.hp || 0);
      const hpPct = Math.max(0, Math.min(100, (curHp / maxHp) * 100));

      // 플레이어 머리 위 체력바와 동일한 규격의 사선 블록형 게이지
      const barW = 84;
      const barH = 10;
      const skew = -7;
      const totalW = barW + 36;
      const startX = pX - totalW / 2;
      const startY = pY;

      ctx.save();

      // 1. 파츠 타겟 뱃지 라벨
      ctx.font = '900 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = partColor;
      ctx.shadowColor = partColor;
      ctx.shadowBlur = 8;
      const leftSec = Math.max(0, (boss.partCycleDuration || 20) - (boss.partCycleTimer || 0));
      ctx.fillText(`🎯 ${partName} [${leftSec.toFixed(0)}s]`, startX + barW / 2, startY - 7);
      ctx.shadowBlur = 0;

      // 2. 체력바 외곽 베이스 트랙
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.moveTo(startX - skew, startY);
      ctx.lineTo(startX + barW - skew, startY);
      ctx.lineTo(startX + barW, startY + barH);
      ctx.lineTo(startX, startY + barH);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 3. 5개 사선 세그먼트 (플레이어 체력바와 동일한 블록 렌더링)
      const numSegs = 5;
      const segGap = 2;
      const segW = (barW - (numSegs + 1) * segGap) / numSegs;

      for (let i = 0; i < numSegs; i++) {
        const segStartX = startX + segGap + i * (segW + segGap);
        const segSkew = skew * (segW / barW);
        const segMinPct = i * 20;

        if (hpPct > segMinPct) {
          const segFill = Math.max(0, Math.min(1, (hpPct - segMinPct) / 20));
          ctx.fillStyle = partColor;
          ctx.beginPath();
          ctx.moveTo(segStartX - segSkew, startY + 1.2);
          ctx.lineTo(segStartX + (segW * segFill) - segSkew, startY + 1.2);
          ctx.lineTo(segStartX + (segW * segFill), startY + barH - 1.2);
          ctx.lineTo(segStartX, startY + barH - 1.2);
          ctx.closePath();
          ctx.fill();
        }

        if (i > 0) {
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(segStartX - 1 - segSkew, startY);
          ctx.lineTo(segStartX - 1, startY + barH);
          ctx.stroke();
        }
      }

      // 4. 우측 퍼센트 박스
      const pctBoxX = startX + barW + 5;
      const pctBoxW = 28;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(pctBoxX - skew, startY);
      ctx.lineTo(pctBoxX + pctBoxW - skew, startY);
      ctx.lineTo(pctBoxX + pctBoxW, startY + barH);
      ctx.lineTo(pctBoxX, startY + barH);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 8.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(hpPct)}%`, pctBoxX + pctBoxW / 2, startY + 8);

      ctx.restore();
    }

    // [WHITE FANG 465] 화력 지원 드론 렌더링 함수
    // 유저 레퍼런스 스케치 완벽 구현:
    // - 중앙 수평 동체(Fuselage)와 양측 듀얼 수직 포드(Vertical Pods)의 "H"자 전술 드론 형상
    // - 아비도스 화이트 아머 플레이트 & 다크 프레임 & 시안(청록) 발광 라인
    // - 하단 듀얼 VTOL 플라즈마 분사염 & 미사일 발사 시 총구 화염 및 머리 위 잔여시간/탄환 HUD
    function drawWhiteFangDrones() {
      if (!window.whiteFangDrones || window.whiteFangDrones.length === 0) return;
      window.whiteFangDrones.forEach(d => {
        const dScreenX = d.x - camera.x;
        const dScreenY = d.y;
        const dir = d.facing > 0 ? 1 : -1;

        ctx.save();
        ctx.translate(dScreenX, dScreenY);

        // 1. 머리 위 HUD 라벨 (좌우 반전 없이 바른 방향으로 표시)
        const isColorDrone = d.isColorDrone;
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = isColorDrone ? '#94a3b8' : '#22d3ee';
        ctx.shadowColor = isColorDrone ? '#334155' : '#06b6d4';
        let droneTitle;
        if (isColorDrone) {
          const colorDrones = (window.whiteFangDrones || []).filter(item => item.isColorDrone);
          const colorIdx = colorDrones.indexOf(d);
          const numLabel = colorDrones.length > 1 ? ` #${colorIdx + 1}` : '';
          droneTitle = `🛸 [색채${numLabel}] 화력강화 [${d.timer.toFixed(1)}s]`;
        } else {
          droneTitle = `🛸 화력지원 드론 [${d.shotsFired}/20 | ${d.timer.toFixed(1)}s]`;
        }
        ctx.fillText(droneTitle, -65, -28);
        ctx.shadowBlur = 0;

        ctx.scale(dir, 1);
        ctx.lineWidth = 1.3;
        ctx.strokeStyle = '#0f172a';

        // 2. 하단 VTOL 추진기 플라즈마 분사염 (양측 포드 하단)
        const flamePulse = Math.sin(Date.now() * 0.03) * 2;
        [-13, 13].forEach(px => {
          ctx.fillStyle = isColorDrone ? '#64748b' : '#00ffff';
          ctx.beginPath();
          ctx.moveTo(px - 3, 15);
          ctx.lineTo(px, 22 + flamePulse);
          ctx.lineTo(px + 3, 15);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(px - 1.5, 15);
          ctx.lineTo(px, 19 + flamePulse * 0.6);
          ctx.lineTo(px + 1.5, 15);
          ctx.closePath();
          ctx.fill();
        });

        // 3. 중앙 메인 브릿지 / 아비도스 동체 (Central Fuselage - H자의 가로 연결부)
        ctx.fillStyle = isColorDrone ? '#1e293b' : '#ffffff';
        ctx.fillRect(-12, -7, 24, 14);
        ctx.strokeRect(-12, -7, 24, 14);

        // 중앙 어두운 내부 메카닉 프레임 & 코어 LED
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-8, -4, 16, 8);
        ctx.strokeRect(-8, -4, 16, 8);

        ctx.fillStyle = isColorDrone ? '#94a3b8' : '#00ffff';
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // 상부 통신 안테나 핀
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-1.5, -11, 3, 4);

        // 4. 좌우 수직 추진/미사일 포드 블록 (Vertical Pods - H자의 세로 기둥 2개)
        [-13, 13].forEach((px, idx) => {
          // 포드 외부 아머 (상하 대칭형 수직 블록)
          ctx.fillStyle = isColorDrone ? '#334155' : '#f8fafc';
          ctx.beginPath();
          ctx.moveTo(px - 6, -16);
          ctx.lineTo(px + 6, -16);
          ctx.lineTo(px + 7, 14);
          ctx.lineTo(px - 7, 14);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 포드 내부 미사일 사출구 2문 (Upper & Lower Silo Tubes)
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px - 4, -12, 8, 4.5);
          ctx.fillRect(px - 4, -4, 8, 4.5);

          // 포드 측면 발광 인디케이터 라인
          ctx.fillStyle = isColorDrone ? '#64748b' : '#06b6d4';
          ctx.fillRect(px - 5.5, 4, 2, 7);

          // 사격 시 해당 포드 총구 플래시
          if (d.flashTimer > 0 && ((d.podAlternator === 0 && idx === 0) || (d.podAlternator === 1 && idx === 1))) {
            ctx.save();
            const flashGrad = ctx.createRadialGradient(px, -8, 1, px, -8, 14);
            flashGrad.addColorStop(0, '#ffffff');
            flashGrad.addColorStop(0.4, isColorDrone ? '#94a3b8' : '#00ffff');
            flashGrad.addColorStop(1, isColorDrone ? 'rgba(71, 85, 105, 0)' : 'rgba(6, 182, 212, 0)');
            ctx.fillStyle = flashGrad;
            ctx.beginPath();
            ctx.arc(px, -8, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });

        ctx.restore();
      });
    }

    // =========================================================================
    // [신규 연출] 1페이즈 카이텐저 오프닝 컷신 렌더러 (실제 kaitenzers 5인 엔티티 직접 활용)
    // 옥상 대기 -> 도약/착지 -> 무기 회전 -> 포징 -> 5색 대폭발 (대사 자막 없음)
    // =========================================================================
    function drawPhase1Cutscene(groundY) {
      const cut = window.phase1Cutscene;
      if (!cut || !cut.active) return;

      const t = cut.timer;
      const state = cut.state;
      const roofY = groundY - 220;

      // 1. [건물 옥상 씬 배경] ('rooftop' 또는 'jump' 초반)
      if (state === 'rooftop' || (state === 'jump' && t < 0.8)) {
        ctx.save();
        // 옥상 건물 바디
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(800 - camera.x, roofY, 1200, canvas.height - roofY + 300);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 4;
        ctx.strokeRect(800 - camera.x, roofY, 1200, canvas.height - roofY + 300);

        // 옥상 테두리 난간
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(800 - camera.x, roofY);
        ctx.lineTo(2000 - camera.x, roofY);
        ctx.stroke();

        ctx.lineWidth = 2;
        for (let bx = 850; bx < 1980; bx += 90) {
          ctx.beginPath();
          ctx.moveTo(bx - camera.x, roofY - 24);
          ctx.lineTo(bx - camera.x, roofY);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(800 - camera.x, roofY - 24);
        ctx.lineTo(2000 - camera.x, roofY - 24);
        ctx.stroke();

        // 옥상 환풍 실린더
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(860 - camera.x, roofY - 50, 70, 50);
        ctx.fillRect(1880 - camera.x, roofY - 55, 80, 55);
        ctx.restore();
      }

      // 2. [실제 카이텐저 5인방 렌더링]: [블랙, 핑크, 레드(중심), 그린, 옐로]
      const order = ['black', 'pink', 'red', 'green', 'yellow'];
      order.forEach(id => {
        const k = kaitenzers.find(item => item.id === id);
        if (!k) return;

        const kScreenX = k.x - camera.x;
        const currentY = groundY - (k.jumpY || 0) - k.size;

        ctx.save();

        // (A) 지면 착지 그림자 & 착지 모래먼지
        if (k.jumpY <= 2) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.ellipse(kScreenX + k.size / 2, groundY, k.size * 0.65, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          if (k.landSmokeTimer && k.landSmokeTimer > 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
            for (let s = -1; s <= 1; s += 2) {
              ctx.beginPath();
              ctx.arc(kScreenX + k.size / 2 + s * 24, groundY - 6, 14 * (k.landSmokeTimer / 0.35), 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // (B) 카이텐저 실제 본체 (정사각형 컬러 블록 + 고유 테두리)
        ctx.fillStyle = k.color;
        ctx.fillRect(kScreenX, currentY, k.size, k.size);
        ctx.strokeStyle = k.border || '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(kScreenX, currentY, k.size, k.size);

        // 눈/바이저
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(kScreenX + 6, currentY + 8, k.size - 12, 6);

        // 펄럭이는 머리띠 (옥상 대기 중 바람 연출)
        if (state === 'rooftop') {
          ctx.strokeStyle = k.color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(kScreenX + k.size, currentY + 6);
          ctx.quadraticCurveTo(kScreenX + k.size + 14 + Math.sin(t * 10) * 5, currentY + 4, kScreenX + k.size + 26 + Math.sin(t * 10) * 8, currentY + 12);
          ctx.stroke();
        }

        // (C) 실제 무기 렌더링 & 시계방향 회전 연출
        ctx.save();
        const dir = (k.facing >= 0) ? 1 : -1;
        const anchorX = kScreenX + (dir > 0 ? k.size * 0.72 : k.size * 0.28);
        const anchorY = currentY + k.size * 0.58;

        ctx.translate(anchorX, anchorY);

        let wAngle = 0;
        if (state === 'rooftop') {
          wAngle = 0.2;
        } else if (state === 'jump') {
          wAngle = -0.4;
        } else if (state === 'land') {
          // 착지 직후 1.0초 정적: 무기를 왼쪽에 파지
          wAngle = -Math.PI * 0.85;
        } else if (state === 'weapon_spin') {
          // 0.7초간 무기를 왼쪽에서 시계방향 360도 회전시켜 오른쪽으로 촥!
          const prog = Math.min(1, t / 0.7);
          const ease = prog * prog * (3 - 2 * prog);
          wAngle = -Math.PI * 0.85 + (ease * Math.PI * 2);
          // 회전 궤적 빛의 링
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, Math.PI * 2);
          ctx.stroke();
        } else if (state === 'red_pose') {
          if (k.id === 'red') {
            // 레드 솔로 리더 포즈: 검을 대각선 위로 번쩍 치켜듦!
            wAngle = -Math.PI * 0.45;
          } else {
            wAngle = 0.2;
          }
        } else if (state === 'team_pose' || state === 'explosion') {
          // 전원 단체 결전 포징 완성!
          if (k.id === 'red') wAngle = -Math.PI * 0.45;
          else if (k.id === 'pink') wAngle = -0.35;
          else if (k.id === 'green') wAngle = 0.45;
          else if (k.id === 'black') wAngle = -0.75;
          else if (k.id === 'yellow') wAngle = 0.75;
        }

        ctx.rotate(wAngle);

        // 실제 무기 외형 렌더링 (각 멤버별 고유 총기/도검)
        ctx.fillStyle = '#0f172a';
        if (k.role === 'AR' || k.id === 'red') {
          ctx.fillRect(-3, -22, 6, 26);
          ctx.fillStyle = k.color;
          ctx.fillRect(-5, -12, 10, 8);
        } else if (k.id === 'yellow') {
          ctx.fillRect(-2.5, -28, 5, 34); // 저격총 긴 총열
          ctx.fillStyle = '#eab308';
          ctx.fillRect(-4.5, -10, 9, 8);
        } else if (k.id === 'green') {
          ctx.fillRect(-4, -18, 8, 22); // 산탄총 굵은 총신
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(-5, -8, 10, 6);
        } else {
          ctx.fillRect(-3, -16, 6, 20); // SMG / HG
          ctx.fillStyle = k.color;
          ctx.fillRect(-4, -6, 8, 6);
        }
        ctx.restore();

        // 레드 단독 오라 ('red_pose')
        if (state === 'red_pose' && k.id === 'red') {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.strokeRect(kScreenX - 4, currentY - 4, k.size + 8, k.size + 8);
        }

        ctx.restore();
      });

      // 3. [등 뒤 5색 대폭발 연출] ('explosion')
      if (state === 'explosion') {
        const expProg = Math.min(1, t / 1.4);
        const expAlpha = Math.max(0, 1 - expProg * 0.85);

        order.forEach(id => {
          const k = kaitenzers.find(item => item.id === id);
          if (!k) return;

          const screenX = k.x - camera.x;
          ctx.save();
          ctx.translate(screenX + k.size / 2, groundY - 45);

          for (let i = 0; i < 7; i++) {
            const ang = (i / 7) * Math.PI * 2;
            const dist = 35 + expProg * 85;
            const rad = 28 + Math.sin(i * 1.5) * 14 + expProg * 40;
            const fx = Math.cos(ang) * dist;
            const fy = Math.sin(ang) * dist * 0.7 - (expProg * 50);

            const grad = ctx.createRadialGradient(fx, fy, 4, fx, fy, rad);
            grad.addColorStop(0, `rgba(255, 255, 255, ${expAlpha})`);
            grad.addColorStop(0.4, k.color);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(fx, fy, rad, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
      }
    }

    // =========================================================================
    // [신규 연출] 2페이즈 합체 컷씬 렌더러 (실제 본체 활용, 대사 자막 전면 제거)
    // 패배 순차 컷 -> 무기 치켜들기 -> 하늘 5부품 강하 -> 도킹 -> 안광 위압포즈 -> 암전 번개 -> 보스 타이틀
    // =========================================================================
    function drawPhase2Cutscene(groundY) {
      const cut = window.phase2Cutscene;
      if (!cut || !cut.active) return;

      const state = cut.state;
      const t = cut.timer;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // 1. [패배한 카이텐저 실제 본체 순차 컷 포커스] ('defeated_cuts', 대사 자막 없음)
      if (state === 'defeated_cuts') {
        const cutIdx = cut.cutIndex || 0;
        ctx.save();

        // 시네마틱 레터박스 상하 52px
        ctx.fillStyle = '#050811';
        ctx.fillRect(0, 0, canvas.width, 52);
        ctx.fillRect(0, canvas.height - 52, canvas.width, 52);

        if (cutIdx === 0) {
          // [컷 1]: 중심 레드 실제 본체 비틀거림 클로즈업
          const stagger = Math.sin(t * 12) * 8;
          ctx.save();
          ctx.translate(centerX + stagger, centerY);
          ctx.scale(2.4, 2.4);

          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-18, -36, 36, 36);
          ctx.strokeStyle = '#b91c1c';
          ctx.lineWidth = 2;
          ctx.strokeRect(-18, -36, 36, 36);

          // 눈 바이저
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-10, -28, 20, 6);
          ctx.restore();
        } else if (cutIdx === 1) {
          // [컷 2]: 옐로 & 핑크 실제 쓰러진 본체 클로즈업
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.scale(2.0, 2.0);

          // 핑크 다운
          ctx.fillStyle = '#f472b6';
          ctx.fillRect(-75, -8, 42, 16);
          ctx.strokeStyle = '#db2777';
          ctx.strokeRect(-75, -8, 42, 16);

          // 옐로 다운
          ctx.fillStyle = '#eab308';
          ctx.fillRect(30, -8, 42, 16);
          ctx.strokeStyle = '#a16207';
          ctx.strokeRect(30, -8, 42, 16);
          ctx.restore();
        } else if (cutIdx === 2) {
          // [컷 3]: 그린 & 블랙 실제 쓰러진 본체 클로즈업
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.scale(2.0, 2.0);

          // 블랙 다운
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-75, -8, 42, 16);
          ctx.strokeStyle = '#0f172a';
          ctx.strokeRect(-75, -8, 42, 16);

          // 그린 다운
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(30, -8, 42, 16);
          ctx.strokeStyle = '#15803d';
          ctx.strokeRect(30, -8, 42, 16);
          ctx.restore();
        }

        ctx.restore();
      }

      // 2. [전원 무기 치켜들기] ('weapon_raise', 대사 없음)
      if (state === 'weapon_raise') {
        ctx.save();
        ctx.fillStyle = '#050811';
        ctx.fillRect(0, 0, canvas.width, 48);
        ctx.fillRect(0, canvas.height - 48, canvas.width, 48);

        const rangers = [
          { id: 'black', color: '#1e293b', x: centerX - 150 },
          { id: 'pink', color: '#f472b6', x: centerX - 75 },
          { id: 'red', color: '#ef4444', x: centerX },
          { id: 'green', color: '#22c55e', x: centerX + 75 },
          { id: 'yellow', color: '#eab308', x: centerX + 150 }
        ];

        const rProg = Math.min(1, t / 0.8);

        rangers.forEach(m => {
          ctx.save();
          ctx.translate(m.x, groundY - 20);

          // 본체
          ctx.fillStyle = m.color;
          ctx.fillRect(-18, -36, 36, 36);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.strokeRect(-18, -36, 36, 36);

          // 무기: 오른쪽에서 시계방향으로 회전하여 머리 위 하늘 높이 번쩍 치켜듦!
          let armAngle = 0;
          if (m.id === 'red') {
            armAngle = (Math.PI * 0.4) + (rProg * Math.PI * 1.1);
          } else {
            const subProg = Math.max(0, (t - 0.5) / 0.7);
            armAngle = (Math.PI * 0.2) + (subProg * Math.PI * 1.3);
          }

          ctx.save();
          ctx.translate(0, -22);
          ctx.rotate(armAngle);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-3, -26, 6, 30);
          ctx.fillStyle = m.color;
          ctx.fillRect(-5, -14, 10, 10);
          ctx.restore();

          ctx.restore();
        });

        ctx.restore();
      }

      // 3. [하늘에서 5개 부품 동시 강하 & 도킹 & 위압포즈 & 암전 번개 & 타이틀]
      if (['sky_fall', 'docking', 'eye_flash_pose', 'lightning_strike', 'boss_title'].includes(state)) {
        ctx.save();

        const robotCenterY = groundY - 145;

        let armROfsX = 0, armROfsY = 0;
        let armLOfsX = 0, armLOfsY = 0;
        let legOfsY = 0;
        let bodyOfsY = 0;

        if (state === 'sky_fall') {
          // 하늘에서 처음부터 함께 배치되어 아래로 고속 하강 (머리+가슴 일체)
          const fallEase = Math.min(1, t / 1.8);
          bodyOfsY = -280 * (1 - fallEase);
          armROfsX = 95;
          armROfsY = -45;
          armLOfsX = -95;
          armLOfsY = -45;
          legOfsY = 65;
        } else if (state === 'docking') {
          const step = cut.dockStep || 0;
          const sT = cut.subTimer || 0;
          const prog = Math.min(1, sT / 0.6);

          if (step === 0) {
            // 우측팔(새우) 결합
            armROfsX = 95 * (1 - prog);
            armROfsY = -45 * (1 - prog);
            armLOfsX = -95;
            armLOfsY = -45;
            legOfsY = 65;
          } else if (step === 1) {
            // 좌측팔(오이) 결합
            armROfsX = 0; armROfsY = 0;
            armLOfsX = -95 * (1 - prog);
            armLOfsY = -45 * (1 - prog);
            legOfsY = 65;
          } else {
            // 양다리 결합
            armROfsX = 0; armROfsY = 0;
            armLOfsX = 0; armLOfsY = 0;
            legOfsY = 65 * (1 - prog);
          }
        } else {
          // 전 부품 도킹 완료
          armROfsX = 0; armROfsY = 0;
          armLOfsX = 0; armLOfsY = 0;
          legOfsY = 0;
          bodyOfsY = 0;
        }

        // [암전 번개 씬 ('lightning_strike')]
        if (state === 'lightning_strike') {
          // 완전 칠흑 암전 배경!
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 거대 노란색 번개 벼락 2~3줄기 콰르르릉!
          const flashAlpha = Math.sin(t * 26) > 0 ? 1.0 : 0.5;
          ctx.strokeStyle = `rgba(250, 204, 21, ${flashAlpha})`;
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 35;
          ctx.lineWidth = 7;

          // 메인 벼락 1
          ctx.beginPath();
          ctx.moveTo(centerX - 190, 0);
          ctx.lineTo(centerX - 145, 95);
          ctx.lineTo(centerX - 220, 170);
          ctx.lineTo(centerX - 135, 250);
          ctx.lineTo(centerX - 170, groundY);
          ctx.stroke();

          // 메인 벼락 2
          ctx.beginPath();
          ctx.moveTo(centerX + 170, 0);
          ctx.lineTo(centerX + 220, 115);
          ctx.lineTo(centerX + 145, 195);
          ctx.lineTo(centerX + 240, 280);
          ctx.lineTo(centerX + 185, groundY);
          ctx.stroke();

          // 중앙 굵은 코어 벼락
          ctx.lineWidth = 9;
          ctx.strokeStyle = `rgba(255, 255, 255, ${flashAlpha})`;
          ctx.beginPath();
          ctx.moveTo(centerX + 25, 0);
          ctx.lineTo(centerX - 35, 110);
          ctx.lineTo(centerX + 45, 190);
          ctx.lineTo(centerX, 270);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // -----------------------------------------------------------------
        // [KAITEN FX Mk.0 인게임 정품 실체 렌더러 (100% 동일 모델 & 1.45x 스케일)]
        // -----------------------------------------------------------------
        ctx.save();
        ctx.translate(centerX, groundY + bodyOfsY);
        ctx.scale(1.45, 1.45); // 인게임 실전 KAITEN FX Mk.0와 100% 동일한 1.45배 거대 스케일

        // (0) 지면 접지 그림자
        if (bodyOfsY > -60) {
          ctx.save();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.beginPath();
          ctx.ellipse(0, 0, 90, 16, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // (1) 양쪽 다리 [계란 오른다리 & 김 왼다리]
        // 1-A. 오른다리 (옐로우 계란초밥 - 고관절 ➔ 계란 아머 ➔ 검은 김 띠 ➔ 게타 나막신)
        ctx.save();
        ctx.translate(34, -86 + legOfsY);
        // 고관절 연결 조인트
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-14, -62, 28, 22);
        // 계란말이 장갑 (인게임 정품 크기 및 배색)
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-20, -42, 40, 80);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.2;
        ctx.strokeRect(-20, -42, 40, 80);
        // 검은 김 띠
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-20, -10, 40, 14);
        // 화이트 메카 슈즈
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-18, 38, 36, 20);
        ctx.strokeStyle = '#0f172a';
        ctx.strokeRect(-18, 38, 36, 20);
        // 게타 나막신 밑창
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-22, 64, 44, 12);
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(-20, 58, 40, 10);
        ctx.strokeStyle = '#0f172a';
        ctx.strokeRect(-20, 58, 40, 10);
        // 게타 나무 굽 (바닥 접지 높이)
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-14, 76, 8, 10);
        ctx.fillRect(10, 76, 8, 10);
        ctx.restore();

        // 1-B. 왼다리 (블랙 군함말이 - 고관절 ➔ 군함 아머 ➔ 연어알 캡슐 ➔ 황금 파도 ➔ 게타 나막신)
        ctx.save();
        ctx.translate(-34, -86 + legOfsY);
        // 고관절 연결 조인트
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-14, -62, 28, 22);
        // 군함말이 아머
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-20, -42, 40, 80);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2.2;
        ctx.strokeRect(-20, -42, 40, 80);
        // 황금빛 파도 아크 문양
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(-20, -10, 24, -Math.PI * 0.45, Math.PI * 0.45);
        ctx.stroke();
        // 이쿠라 연어알 캡슐
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.roundRect(-10, -36, 9, 68, 4);
        ctx.roundRect(1, -36, 9, 68, 4);
        ctx.fill();
        // 화이트 메카 슈즈
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-18, 38, 36, 20);
        ctx.strokeStyle = '#0f172a';
        ctx.strokeRect(-18, 38, 36, 20);
        // 게타 나막신 밑창
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-22, 64, 44, 12);
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(-20, 58, 40, 10);
        ctx.strokeStyle = '#0f172a';
        ctx.strokeRect(-20, 58, 40, 10);
        // 게타 나무 굽
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-14, 76, 8, 10);
        ctx.fillRect(10, 76, 8, 10);
        ctx.restore();

        // (2) 몸통 + 머리 (처음부터 일체로 결합된 상태!)
        // 2-A. 몸통 코어 (레드 참치 - 부채꼴 흰색 원호 문양 & 중심 원형 엠블럼)
        ctx.save();
        ctx.translate(0, -160);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-48, -55, 96, 76);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-48, -55, 96, 76);
        // 참치 살결 측면 음영
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(-48, -55, 14, 76);
        ctx.fillRect(34, -55, 14, 76);
        // 상반신 흰색 부채꼴 원호 문양 3중선
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 4.5;
        for (let r = 0; r < 3; r++) {
          ctx.beginPath();
          ctx.arc(0, -10, 24 + r * 14, Math.PI * 0.85, Math.PI * 2.15);
          ctx.stroke();
        }
        // 중앙 분할선
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -55);
        ctx.lineTo(0, 21);
        ctx.stroke();
        // 하단 중심 원형 엠블럼 버클
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(0, 8, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3;
        ctx.stroke();
        // 골반 하부 프레임
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-42, 21, 84, 18);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-36, 24, 72, 12);
        ctx.restore();

        // 2-B. 머리 (참치 셰프 투구 & 안광 플래시)
        ctx.save();
        ctx.translate(0, -225);
        // 목 조인트
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-12, 10, 24, 10);
        // 투구 돔
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(0, -6, 22, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();
        // 붉은 볏 중심선
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-8, -28, 16, 22);
        // 마스크
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-16, -6, 32, 18);
        ctx.strokeStyle = '#0f172a';
        ctx.strokeRect(-16, -6, 32, 18);

        // 눈 바이저 & 안광 플래시
        const isEyeActive = ['eye_flash_pose', 'lightning_strike', 'boss_title'].includes(state);
        ctx.fillStyle = isEyeActive ? '#ffffff' : '#38bdf8';
        if (isEyeActive) {
          ctx.shadowColor = '#00ffff';
          ctx.shadowBlur = 25;
        }
        ctx.fillRect(-11, -2, 9, 5);
        ctx.fillRect(2, -2, 9, 5);
        ctx.shadowBlur = 0;

        // 안광 십자광 크로스 이펙트 ('eye_flash_pose', 'lightning_strike', 'boss_title')
        if (isEyeActive) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-18, 0.5); ctx.lineTo(2, 0.5);
          ctx.moveTo(-7, -9); ctx.lineTo(-7, 10);
          ctx.moveTo(2, 0.5); ctx.lineTo(22, 0.5);
          ctx.moveTo(7, -9); ctx.lineTo(7, 10);
          ctx.stroke();
        }
        ctx.restore();

        // (3) 양쪽 팔 [핑크 새우 오른팔 & 그린 오이/실드 왼팔]
        // [시그니처 위압 포즈]: 사진 포즈(양 주먹 쥐고 전방으로 뻗은 위압 포즈) 완벽 재현!
        const isSignaturePose = ['eye_flash_pose', 'lightning_strike', 'boss_title'].includes(state);

        // 3-A. 오른팔 (핑크 새우)
        ctx.save();
        ctx.translate(68 + armROfsX, -165 + armROfsY);
        if (isSignaturePose) {
          ctx.rotate(-0.18); // 팔꿈치를 구부리며 주먹을 카메라 쪽으로 내민 각도
        }
        // 새우 꼬리 지느러미
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.moveTo(-10, -28);
        ctx.quadraticCurveTo(10, -56, 32, -48);
        ctx.quadraticCurveTo(16, -26, 4, -20);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();
        // 상완 화이트 아머
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-14, -20, 32, 28);
        ctx.strokeRect(-14, -20, 32, 28);
        // 전완 개틀링 하우징
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-12, 10, 34, 30);
        ctx.strokeStyle = '#0f172a';
        ctx.strokeRect(-12, 10, 34, 30);
        // 전방을 향해 불끈 쥔 거대 주먹
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-14, 40, 38, 24);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(-14, 40, 38, 24);
        // 주먹 화이트 너클 플레이트
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-12, 42, 34, 7);
        ctx.restore();

        // 3-B. 왼팔 (그린 오이 & 회전초밥 접시 쉴드)
        ctx.save();
        ctx.translate(-68 + armLOfsX, -165 + armLOfsY);
        if (isSignaturePose) {
          ctx.rotate(0.18); // 대칭으로 팔꿈치 굽혀 주먹 전방 전개
        }
        // 오이 롤 어깨 블록
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(-18, -26, 36, 30);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.strokeRect(-18, -26, 36, 30);
        // 오이 심 단면
        ctx.fillStyle = '#86efac';
        ctx.beginPath();
        ctx.arc(0, -11, 8, 0, Math.PI * 2);
        ctx.fill();
        // 상완 화이트 아머
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-18, 6, 32, 26);
        ctx.strokeStyle = '#0f172a';
        ctx.strokeRect(-18, 6, 32, 26);
        // 전완 하우징
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-22, 12, 34, 28);
        ctx.strokeRect(-22, 12, 34, 28);
        // 회전초밥 원형 접시 쉴드 (팔 외측에 장착)
        ctx.save();
        ctx.translate(-24, 20);
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 42, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.ellipse(0, 0, 6, 12, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // 전방을 향해 불끈 쥔 거대 주먹
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-24, 40, 38, 24);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(-24, 40, 38, 24);
        // 주먹 화이트 너클 플레이트
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-22, 42, 34, 7);
        ctx.restore();

        ctx.restore(); // 로봇 끝

        // (4) [보스 타이틀 명판 ('boss_title', 대사 없음)]
        if (state === 'boss_title') {
          ctx.save();
          ctx.fillStyle = '#050811';
          ctx.fillRect(0, 0, canvas.width, 54);
          ctx.fillRect(0, canvas.height - 54, canvas.width, 54);

          ctx.textAlign = 'center';
          ctx.font = '900 32px sans-serif';
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#dc2626';
          ctx.shadowBlur = 24;
          ctx.fillText('⚡ TOTAL ASSAULT : KAITEN FX Mk.0 ⚡', canvas.width / 2, 39);

          ctx.font = 'bold 14px monospace';
          ctx.fillStyle = '#fde047';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 6;
          ctx.fillText('무한초밥전대 카이텐저 최종 결전 병기', canvas.width / 2, canvas.height - 21);
          ctx.restore();
        }

        ctx.restore();
      }
    }

    // 렌더링
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const groundY = canvas.height - GROUND_OFFSET;
      const playerCenterX = player.x + player.width / 2;
      const playerCenterY = player.y + player.height / 2;

      // 카메라 줌 & 틸트 매트릭스 적용
      ctx.save();
      const curZoom = (typeof camera.zoom !== 'undefined') ? camera.zoom : 1.0;
      const curCamY = (typeof camera.y !== 'undefined') ? camera.y : 0;
      if (curZoom !== 1.0 || curCamY !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(curZoom, curZoom);
        ctx.translate(-canvas.width / 2, -canvas.height / 2 - curCamY);
      }

      // 1. 하늘
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(0.6, '#bae6fd');
      grad.addColorStop(1, '#ffffff');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. 원경 빌딩 (속도 15%)
      farBuildings.forEach(b => {
        const drawX = b.x - (camera.x * 0.15);
        if (drawX + b.width > 0 && drawX < canvas.width) {
          ctx.fillStyle = b.color;
          ctx.fillRect(drawX, groundY - b.height, b.width, b.height);
        }
      });

      // 3. 중경 빌딩 (속도 45%)
      midBuildings.forEach(b => {
        const drawX = b.x - (camera.x * 0.45);
        if (drawX + b.width > 0 && drawX < canvas.width) {
          ctx.fillStyle = b.color;
          ctx.fillRect(drawX, groundY - b.height, b.width, b.height);
          if (b.windows) {
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            for (let r = 2; r < b.height / 35; r++) {
              for (let c = 1; c < b.width / 22; c++) {
                ctx.fillRect(drawX + c * 20, groundY - b.height + r * 30, 12, 16);
              }
            }
          }
        }
      });

      // 4. 바닥 (도로 & 보도)
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, groundY, canvas.width, 24);
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, groundY + 24, canvas.width, GROUND_OFFSET);

      // 차선
      ctx.fillStyle = '#ffffff';
      const laneStart = Math.floor(camera.x / 100) * 100;
      for (let lx = laneStart; lx < camera.x + canvas.width + 100; lx += 100) {
        ctx.fillRect(lx - camera.x, groundY + 55, 55, 6);
      }

      // 5. 옐로의 SR 조준 레이저 렌더링 (월드 좌표 기준 일관된 표시)
      const yellow = kaitenzers[2];
      if (yellow.isSpawned && !yellow.isDead && yellow.laserState !== 'none') {
        const yScreenX = yellow.x - camera.x;
        const yScreenY = groundY - yellow.size / 2;
        const targetScreenX = (yellow.aimTargetX || playerCenterX) - camera.x;
        const targetScreenY = yellow.aimTargetY || playerCenterY;

        ctx.save();
        if (yellow.laserState === 'aiming') {
          ctx.strokeStyle = 'rgba(234, 179, 8, 0.55)';
          ctx.lineWidth = 1.8;
          ctx.setLineDash([8, 6]);
        } else if (yellow.laserState === 'locked') {
          // 조준 고정 시 붉은 실선으로 경고!
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
          ctx.lineWidth = 3;
        }
        ctx.beginPath();
        ctx.moveTo(yScreenX, yScreenY);
        ctx.lineTo(targetScreenX, targetScreenY);
        ctx.stroke();
        ctx.restore();
      }

      // 6. 플레이어 (진압팀 정사각형 블록)
      const pScreenX = player.x - camera.x;
      const pScreenY = player.y;

      // 그림자
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(pScreenX + player.width / 2, groundY, player.width * 0.6, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // [SG: 블러디 앤 건 파우더] 특수스킬: 불사(不死) 거대 핏빛 네온 폭풍 오라 렌더링
      if (player.isImmortalActive) {
        ctx.save();
        const t = Date.now() * 0.005;
        const pulse = Math.sin(t * 3) * 6;

        // 1. 발밑 핏빛 마법진/혈기 충격파 링
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.ellipse(pScreenX + player.width / 2, groundY, (player.width + 24) / 2 + pulse, 9 + pulse * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(pScreenX + player.width / 2, groundY, (player.width + 42) / 2 - pulse * 0.5, 12, 0, 0, Math.PI * 2);
        ctx.stroke();

        // 2. 몸체 주변을 소용돌이치며 솟구치는 핏빛 화염 아우라
        const auraGrad = ctx.createRadialGradient(
          pScreenX + player.width / 2, pScreenY + player.height / 2, 8,
          pScreenX + player.width / 2, pScreenY + player.height / 2, player.width + 32 + pulse
        );
        auraGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
        auraGrad.addColorStop(0.5, 'rgba(220, 38, 38, 0.25)');
        auraGrad.addColorStop(0.85, 'rgba(153, 27, 27, 0.15)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(pScreenX + player.width / 2, pScreenY + player.height / 2, player.width + 32 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // 3. 수직으로 뿜어져 나오는 혈기 스파크 기둥
        for (let sp = 0; sp < 4; sp++) {
          const sx = pScreenX + ((Math.sin(t * 2 + sp * 1.5) * 0.5 + 0.5) * player.width);
          ctx.strokeStyle = sp % 2 === 0 ? '#dc2626' : '#fee2e2';
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.moveTo(sx, pScreenY + player.height);
          ctx.lineTo(sx + (Math.sin(t * 5 + sp) * 6), pScreenY - 18 - (Math.cos(t * 4 + sp) * 12));
          ctx.stroke();
        }

        ctx.restore();
      }

      // [AR 특수스킬: 색채(色彩)] 어두운 회색 연기/잔상 아우라
      if (player.isColorActive) {
        ctx.save();
        const t = Date.now() * 0.004;
        const pulse = Math.sin(t * 3) * 5;

        // 1. 발밑 흑회색 침식 링
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#0f172a';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.ellipse(pScreenX + player.width / 2, groundY, (player.width + 20) / 2 + pulse, 8 + pulse * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();

        // 2. 몸체 주변을 휘감는 짙은 흑회색 연기 아우라
        const auraGrad = ctx.createRadialGradient(
          pScreenX + player.width / 2, pScreenY + player.height / 2, 6,
          pScreenX + player.width / 2, pScreenY + player.height / 2, player.width + 28 + pulse
        );
        auraGrad.addColorStop(0, 'rgba(51, 65, 85, 0.65)');
        auraGrad.addColorStop(0.5, 'rgba(30, 41, 59, 0.45)');
        auraGrad.addColorStop(0.85, 'rgba(15, 23, 42, 0.25)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(pScreenX + player.width / 2, pScreenY + player.height / 2, player.width + 28 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // 3. 위로 피어오르는 잿빛 미립자 연기
        ctx.fillStyle = '#64748b';
        for (let sp = 0; sp < 5; sp++) {
          const sx = pScreenX + ((Math.sin(t * 2.5 + sp * 1.3) * 0.5 + 0.5) * player.width);
          const sy = pScreenY + player.height - ((t * 40 + sp * 16) % (player.height + 25));
          ctx.beginPath();
          ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // [시스템 : 아비 에슈흐] 기계식 비행 날개 파츠 (몸체 뒤에 렌더링)
      if (player.isAbiEshuhActive) {
        drawMechanicalWings(pScreenX, pScreenY, player);
      }

      // 플레이어 블록
      const bodyColor = player.isColorActive ? '#334155' : (player.isImmortalActive ? '#7f1d1d' : player.color);
      const strokeColor = player.isColorActive ? '#64748b' : (player.isImmortalActive ? '#ef4444' : (player.isDashing ? '#38bdf8' : '#ffffff'));
      ctx.fillStyle = bodyColor;
      ctx.fillRect(pScreenX, pScreenY, player.width, player.height);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = (player.isColorActive || player.isImmortalActive || player.isDashing) ? 3 : 2;
      ctx.strokeRect(pScreenX, pScreenY, player.width, player.height);

      // [AR: 색채 & 침착한 호흡] 머리 위 배지 및 유예 타이머 표시
      if (player.isColorActive) {
        ctx.save();
        ctx.font = 'bold 11px monospace';
        if (player.calmBreathActive) {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 8;
          ctx.fillText(`⏳ [침착한 호흡: 사망 유예] (${player.calmBreathTimer.toFixed(1)}s)`, pScreenX - 45, pScreenY - 34);
        } else {
          ctx.fillStyle = '#94a3b8';
          ctx.shadowColor = '#334155';
          ctx.shadowBlur = 6;
          const berserkLabel = (player.hp / player.maxHp) <= 0.30 ? ' [🔥위기 본능]' : '';
          ctx.fillText(`🖤 [색채 : BLACK FANG]${berserkLabel}`, pScreenX - 35, pScreenY - 34);
        }
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // [시스템 : 아비 에슈흐] 머리 위 상태 바 & 인디케이터
      if (player.isAbiEshuhActive) {
        ctx.save();
        if (player.abiTransforming) {
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(`⚡ 아비 에슈흐 기동 중... [${player.abiTransformTimer.toFixed(1)}s]`, pScreenX - 35, pScreenY - 34);
        } else if (player.abiNormalCharging) {
          const cPct = Math.min(1, player.abiNormalChargeTimer / 0.9);
          const stage = (player.abiNormalChargeTimer >= 0.6) ? 3 : ((player.abiNormalChargeTimer >= 0.3) ? 2 : 1);
          const dmgEst = stage === 3 ? 12000 : (stage === 2 ? 8500 : 5000);
          const barW = player.width + 20;
          ctx.fillStyle = 'rgba(15,23,42,0.85)';
          ctx.fillRect(pScreenX - 10, pScreenY - 34, barW, 6);
          ctx.fillStyle = stage === 3 ? '#ffffff' : (stage === 2 ? '#00ffff' : '#38bdf8');
          ctx.fillRect(pScreenX - 10, pScreenY - 34, barW * cPct, 6);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.strokeRect(pScreenX - 10, pScreenY - 34, barW, 6);
          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#00ffff';
          ctx.fillText(`⚡ 레이저 차징 Lv.${stage} (${dmgEst.toLocaleString()} dmg)`, pScreenX - 25, pScreenY - 38);
        } else if (player.abiBarrageFiring) {
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#00ffff';
          ctx.fillText(`✨ 빛의 난사! [${player.abiBarrageTimer.toFixed(1)}s]`, pScreenX - 20, pScreenY - 34);
        } else if (player.abiFinalReady && !player.abiFinalCanTrigger) {
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#f59e0b';
          ctx.fillText(`⚡ 파이널 대기... [${player.abiFinalDelayTimer.toFixed(1)}s]`, pScreenX - 24, pScreenY - 34);
        } else if (player.abiFinalCanTrigger) {
          ctx.font = 'bold 12px monospace';
          ctx.fillStyle = '#facc15';
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
          ctx.fillText(`⚔️ [파이널 발동 가능! 공격키 입력]`, pScreenX - 55, pScreenY - 36);
          ctx.shadowBlur = 0;
        } else if (player.abiFinalPhase === 'charging') {
          const cPct = Math.min(1, (3.0 - player.abiFinalChargeTimer) / 3.0);
          const barW = player.width + 36;
          ctx.fillStyle = 'rgba(15,23,42,0.85)';
          ctx.fillRect(pScreenX - 18, pScreenY - 34, barW, 7);
          ctx.fillStyle = '#00ffff';
          ctx.fillRect(pScreenX - 18, pScreenY - 34, barW * cPct, 7);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.strokeRect(pScreenX - 18, pScreenY - 34, barW, 7);
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`⚔️ 파이널 에너지 충전 [${(3.0 - player.abiFinalChargeTimer).toFixed(1)}/3.0s]`, pScreenX - 45, pScreenY - 39);
        } else if (player.abiFinalPhase !== 'none') {
          ctx.font = 'bold 12px monospace';
          ctx.fillStyle = '#00ffff';
          ctx.shadowColor = '#00ffff';
          ctx.shadowBlur = 12;
          ctx.fillText(`🗡️ [빛의 검 : 아비 에슈흐 파이널]`, pScreenX - 50, pScreenY - 36);
          ctx.shadowBlur = 0;
        }
        ctx.restore();
      }

      // [SG: 블러디 앤 건 파우더] 머리 위 [불사(不死)] 상태 바 & 스택 인디케이터
      if (player.isImmortalActive) {
        ctx.save();
        const cPct = Math.max(0, player.immortalTimer / player.immortalMaxDuration);
        const barW = player.width + 36;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(pScreenX - 18, pScreenY - 34, barW, 6);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(pScreenX - 18, pScreenY - 34, barW * cPct, 6);
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 1;
        ctx.strokeRect(pScreenX - 18, pScreenY - 34, barW, 6);

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#fee2e2';
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 8;
        const critText = player.immortalIsAlwaysCrit ? ' [CRIT +20%]' : '';
        ctx.fillText(`🩸 불사(不死) [${player.immortalTimer.toFixed(1)}s | ${player.immortalStack}/5스택]${critText}`, pScreenX - 42, pScreenY - 38);
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // [일반 CC 기절 (카이텐 FX 가슴 스킬 등)]
      if (player.stunTimer > 0) {
        ctx.save();
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 8;
        ctx.fillText(`⚡ STUN [${player.stunTimer.toFixed(1)}s]`, pScreenX - 16, pScreenY - 36);
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // [시스템 과부하 기절] 방전 스파크 및 머리 위 배지
      if (player.abiStunTimer > 0) {
        ctx.save();
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.fillText(`⚡ 과부하 기절 [${player.abiStunTimer.toFixed(1)}s]`, pScreenX - 30, pScreenY - 36);
        ctx.shadowBlur = 0;

        // 방전 정전기 스파크
        ctx.strokeStyle = Math.random() < 0.5 ? '#f59e0b' : '#ef4444';
        ctx.lineWidth = 1.5;
        for (let s = 0; s < 4; s++) {
          const sx = pScreenX + Math.random() * player.width;
          const sy = pScreenY + Math.random() * player.height;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + (Math.random() - 0.5) * 16, sy + (Math.random() - 0.5) * 16);
          ctx.stroke();
        }
        ctx.restore();
      }



      // [FOX 45식: 전술 방패 전개 & 전술 보호막 배리어 (몸 전체를 감싸는 원형 구체 실드)]
      if (player.isTacticalDefActive && player.tacticalShield > 0) {
        ctx.save();
        const pCenterX = pScreenX + player.width / 2;
        const pCenterY = pScreenY + player.height / 2;
        const shieldPulse = Math.sin(Date.now() * 0.008) * 2;
        const baseRadius = Math.max(player.width, player.height) * 0.64 + 4;
        const shieldRadius = baseRadius + shieldPulse;

        // 1. 내부 플라즈마 방사형 그라데이션 필 (몸 전체 구체)
        const radGrad = ctx.createRadialGradient(pCenterX, pCenterY, shieldRadius * 0.35, pCenterX, pCenterY, shieldRadius);
        radGrad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
        radGrad.addColorStop(0.7, 'rgba(6, 182, 212, 0.22)');
        radGrad.addColorStop(1, 'rgba(2, 132, 199, 0.38)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(pCenterX, pCenterY, shieldRadius, 0, Math.PI * 2);
        ctx.fill();

        // 2. 메인 홀로그램 원형 배리어 외곽 링 (발광 글로우)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.8;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(pCenterX, pCenterY, shieldRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 3. 자전하는 전술 에너지 궤도 고리 (미래지향적 전술 방패 연출)
        const orbitAngle = Date.now() * 0.0018;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(pCenterX, pCenterY, shieldRadius * 1.06, shieldRadius * 0.38, orbitAngle, 0, Math.PI * 2);
        ctx.stroke();

        // 4. 머리 위 전술 보호막 게이지바 & 수치 HUD
        const maxShield = Math.max(1, player.tacticalShieldMax || 1);
        const curShield = Math.max(0, Math.round(player.tacticalShield || 0));
        const sPct = Math.max(0, Math.min(1, curShield / maxShield));
        const barW = 68;
        const barX = pScreenX + player.width / 2 - barW / 2;
        const barY = pScreenY - 32;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(barX, barY, barW, 6);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(barX, barY, barW * sPct, 6);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, 6);

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#38bdf8';
        const sTimer = (player.tacticalShieldTimer || 0).toFixed(1);
        ctx.fillText(`🛡️ 전술보호막 [${curShield.toLocaleString()}] (${sTimer}s)`, barX - 20, barY - 4);
        ctx.restore();
      }



      // [감싸 안는 직감: 보호막 배리어 및 게이지 (보라빛 구체 쉴드)]
      if (player.instinctShieldHp > 0 && player.instinctShieldDuration > 0) {
        ctx.save();
        const pCenterX = pScreenX + player.width / 2;
        const pCenterY = pScreenY + player.height / 2;
        const shieldRadius = Math.max(player.width, player.height) * 0.60 + Math.sin(Date.now() * 0.007) * 2;

        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(pCenterX, pCenterY, shieldRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#c084fc';
        const iTimer = player.instinctShieldDuration.toFixed(1);
        ctx.fillText(`🛡️ 직감보호막 [${Math.round(player.instinctShieldHp).toLocaleString()}] (${iTimer}s)`, pScreenX - 25, pScreenY - (player.isTacticalDefActive ? 48 : 32));
        ctx.restore();
      }

      // [RG: 밸런스 붕괴] 차징 진행 바 & 레벨 렌더링
      if (player.isChargingSkill) {
        ctx.save();
        const cPct = Math.min(1, player.chargeTimer / player.chargeMax);
        const barW = player.width + 16;
        ctx.fillStyle = 'rgba(15,23,42,0.8)';
        ctx.fillRect(pScreenX - 8, pScreenY - 26, barW, 6);
        const barColor = player.chargeLevel === 3 ? '#ec4899' : (player.chargeLevel === 2 ? '#38bdf8' : '#60a5fa');
        ctx.fillStyle = barColor;
        ctx.fillRect(pScreenX - 8, pScreenY - 26, barW * cPct, 6);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(pScreenX - 8, pScreenY - 26, barW, 6);

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = barColor;
        const multLabel = player.chargeLevel === 3 ? '2.0x' : (player.chargeLevel === 2 ? '1.5x' : '1.0x');
        ctx.fillText(`차징 Lv.${player.chargeLevel} (${multLabel}) [X:추가]`, pScreenX - 16, pScreenY - 30);
        ctx.restore();
      }

      // [MG: 종막의 이스보셋] 28연발 관통 난사 중 보라빛 네온 오라 및 머리 위 배지
      if (player.isFiringSkill) {
        ctx.save();
        const bodyAura = ctx.createRadialGradient(
          pScreenX + player.width / 2, pScreenY + player.height / 2, player.width * 0.3,
          pScreenX + player.width / 2, pScreenY + player.height / 2, player.width * 1.25
        );
        bodyAura.addColorStop(0, 'rgba(216, 180, 254, 0.6)');
        bodyAura.addColorStop(0.5, 'rgba(168, 85, 247, 0.35)');
        bodyAura.addColorStop(1, 'rgba(147, 51, 234, 0)');
        ctx.fillStyle = bodyAura;
        ctx.beginPath();
        ctx.arc(pScreenX + player.width / 2, pScreenY + player.height / 2, player.width * 1.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(pScreenX + player.width / 2, groundY, player.width * 0.85, 7, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#c084fc';
        ctx.fillText(`⚡ 종막 : 이스보셋 난사 중! [${player.skillBurstCount || 0}/28발]`, pScreenX - 30, pScreenY - 32);
        ctx.restore();
      }

      // [MG 특수스킬: 선도부장] 폭풍 난사 시전 중 보라빛 네온 아우라, 지면 충격파 링, 머리 위 뱃지
      if (player.isFiringSpecial) {
        ctx.save();
        const phase = player.specialPhase || 1;
        const isBerserk = player.specialIsBerserk;
        const auraColor = isBerserk ? 'rgba(168, 85, 247, 0.65)' : (phase === 2 ? 'rgba(217, 70, 239, 0.5)' : 'rgba(192, 132, 252, 0.45)');
        const ringColor = isBerserk ? '#a855f7' : (phase === 2 ? '#d946ef' : '#c084fc');

        // 1. 캐릭터 전신 보라빛 네온 폭풍 오라
        const auraRadius = player.width * (isBerserk ? 1.6 : (phase === 2 ? 1.4 : 1.25));
        const bodyAura = ctx.createRadialGradient(
          pScreenX + player.width / 2, pScreenY + player.height / 2, player.width * 0.2,
          pScreenX + player.width / 2, pScreenY + player.height / 2, auraRadius
        );
        bodyAura.addColorStop(0, '#ffffff');
        bodyAura.addColorStop(0.3, auraColor);
        bodyAura.addColorStop(0.7, 'rgba(147, 51, 234, 0.25)');
        bodyAura.addColorStop(1, 'rgba(147, 51, 234, 0)');
        ctx.fillStyle = bodyAura;
        ctx.beginPath();
        ctx.arc(pScreenX + player.width / 2, pScreenY + player.height / 2, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        // 2. 발밑 지면 다중 충격파 링 (Ground Shockwaves)
        const ringPulse = (Date.now() * 0.005) % 1;
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = isBerserk ? 3.5 : 2.5;
        ctx.beginPath();
        ctx.ellipse(pScreenX + player.width / 2, groundY, player.width * (0.8 + ringPulse * 0.6), 7 + ringPulse * 4, 0, 0, Math.PI * 2);
        ctx.stroke();

        // 3. 머리 위 선도부장 상태 뱃지
        const remainingTime = Math.max(0, 7.0 - (player.specialTimer || 0)).toFixed(1);
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = ringColor;
        ctx.shadowColor = ringColor;
        ctx.shadowBlur = 8;
        const phaseText = isBerserk 
          ? `👑 [선도부장: 초광폭 각성 3단계] (${remainingTime}s)`
          : `👑 [선도부장: ${phase}단계 폭풍 난사] (${remainingTime}s)`;
        ctx.fillText(phaseText, pScreenX - 45, pScreenY - 32);
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // [SG: 기괴멸렬] 발동 중 플레이어 몸체 주변 붉은 아우라 및 머리 위 카운트 표시
      if (player.sgSkillActive) {
        ctx.save();
        const auraTime = Date.now() * 0.006;
        // 캐릭터 몸체 주변 핏빛 불꽃 글로우
        const bodyAura = ctx.createRadialGradient(
          pScreenX + player.width / 2, pScreenY + player.height / 2, player.width * 0.3,
          pScreenX + player.width / 2, pScreenY + player.height / 2, player.width * 1.1
        );
        bodyAura.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
        bodyAura.addColorStop(0.6, 'rgba(185, 28, 28, 0.2)');
        bodyAura.addColorStop(1, 'rgba(153, 27, 27, 0)');
        ctx.fillStyle = bodyAura;
        ctx.beginPath();
        ctx.arc(pScreenX + player.width / 2, pScreenY + player.height / 2, player.width * 1.1, 0, Math.PI * 2);
        ctx.fill();

        // 위로 피어오르는 핏빛 아우라 불꽃 기둥
        ctx.fillStyle = '#ef4444';
        for (let i = 0; i < 4; i++) {
          const fx = pScreenX + 4 + i * 8 + Math.sin(auraTime + i) * 3;
          const fy = pScreenY + player.height - ((auraTime * 20 + i * 11) % (player.height + 15));
          const rad = 2.0 + Math.sin(auraTime * 3 + i) * 0.8;
          ctx.beginPath();
          ctx.arc(fx, fy, Math.max(1, rad), 0, Math.PI * 2);
          ctx.fill();
        }

        // 머리 위 강화 탄환 잔여 수 배지
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`🩸 기괴멸렬 [${player.sgSkillShotsLeft}/6회]`, pScreenX - 22, pScreenY - 32);
        ctx.restore();
      }

      // [SG: 격류] 차징 바 & 난사 카운터
      if (player.sgTorrentCharging) {
        ctx.save();
        const cPct = Math.min(1, player.sgTorrentChargeTimer / player.sgTorrentChargeMax);
        const barW = player.width + 16;
        ctx.fillStyle = 'rgba(15,23,42,0.85)';
        ctx.fillRect(pScreenX - 8, pScreenY - 32, barW, 6);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(pScreenX - 8, pScreenY - 32, barW * cPct, 6);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(pScreenX - 8, pScreenY - 32, barW, 6);
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`🌊 격류 차징 [${player.sgTorrentChargeTimer.toFixed(1)}/0.5s]`, pScreenX - 22, pScreenY - 36);
        ctx.restore();
      }
      if (player.sgTorrentFiring) {
        ctx.save();
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#0284c7';
        ctx.fillText(`🌊 격류 난사! [${8 - player.sgTorrentShotsLeft}/8]`, pScreenX - 24, pScreenY - 32);
        ctx.restore();
      }

      // [RG: 빛의 검/각성 : 슈퍼노바] 스택 배지, 차징 바 & 방출 상태
      const isEquippedRG = (player.activeWeaponSlot === 'main' && player.mainWeapon && player.mainWeapon.id === 'rg_supernova');
      if (isEquippedRG && player.rgAwakeStage > 0 && !player.rgAwakeCharging && !player.rgAwakeFiring) {
        ctx.save();
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = player.rgAwakeStage === 2 ? '#facc15' : '#38bdf8';
        const stackLabel = player.rgAwakeStage === 2 ? '⚡ [각성: ◆◆ MAX]' : '🌟 [각성: ◆]';
        ctx.fillText(stackLabel, pScreenX - 18, pScreenY - 34);
        ctx.restore();
      }
      if (player.rgAwakeCharging) {
        ctx.save();
        const cPct = Math.min(1, player.rgAwakeChargeTimer / player.rgAwakeChargeMax);
        const barW = player.width + 20;
        ctx.fillStyle = 'rgba(15,23,42,0.85)';
        ctx.fillRect(pScreenX - 10, pScreenY - 34, barW, 6);
        const isFireCharge = player.rgAwakeChargeType === 'fire';
        const barCol = isFireCharge ? '#facc15' : '#38bdf8';
        ctx.fillStyle = barCol;
        ctx.fillRect(pScreenX - 10, pScreenY - 34, barW * cPct, 6);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(pScreenX - 10, pScreenY - 34, barW, 6);
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = barCol;
        const chargeLabel = isFireCharge ? `⚡ 슈퍼노바 차징 [${player.rgAwakeChargeTimer.toFixed(1)}/2.0s]` : `✨ 각성 ${player.rgAwakeStage + 1}단계 충전 [0.5s]`;
        ctx.fillText(chargeLabel, pScreenX - 28, pScreenY - 38);
        ctx.restore();
      }
      if (player.rgAwakeFiring) {
        ctx.save();
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#facc15';
        ctx.fillText(`⚡ 각성 슈퍼노바! [${(4.0 - player.rgAwakeLaserTimer).toFixed(1)}s]`, pScreenX - 32, pScreenY - 34);
        ctx.restore();
      }

      // [MG: 개연 : 이스보셋] 전환 차징 바
      if (player.mgStanceTransitioning) {
        ctx.save();
        const cPct = Math.min(1, player.mgStanceTransitionTimer / 2.0);
        const barW = player.width + 24;
        ctx.fillStyle = 'rgba(15,23,42,0.85)';
        ctx.fillRect(pScreenX - 12, pScreenY - 34, barW, 6);
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(pScreenX - 12, pScreenY - 34, barW * cPct, 6);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(pScreenX - 12, pScreenY - 34, barW, 6);
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#e879f9';
        ctx.fillText(`🎻 자세 전환 중 [${player.mgStanceTransitionTimer.toFixed(1)}/2.0s]`, pScreenX - 28, pScreenY - 38);
        ctx.restore();
      }

      // [MG: 개연 : 이스보셋] 집중 사격 자세 중: 네온 음선(Staff lines) 및 부유하는 음표 파티클
      if (player.mgStanceActive) {
        ctx.save();
        const nowMs = Date.now();
        const t = nowMs * 0.003;

        // 0) 플레이어 발밑 보라빛 네온 파동 링
        const auraPulse = Math.sin(t * 2.5) * 3;
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(pScreenX + player.width / 2, groundY, (player.width + 18) / 2 + auraPulse, 7 + auraPulse * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(pScreenX + player.width / 2, groundY, (player.width + 30) / 2 - auraPulse, 9 - auraPulse * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();

        // 1) 네온 오선지 음선 (캐릭터 몸체 주변을 물결치며 감싸는 5개의 보라빛 네온 발광 곡선)
        const staffColors = ['#f5d0fe', '#e879f9', '#d946ef', '#c084fc', '#a855f7'];
        for (let l = 0; l < 5; l++) {
          ctx.strokeStyle = staffColors[l];
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          const lineBaseY = pScreenY + player.height * 0.2 + l * 6;
          for (let step = -35; step <= player.width + 35; step += 4) {
            const waveX = pScreenX + step;
            const waveY = lineBaseY + Math.sin(t * 2 + step * 0.08 + l * 0.7) * 4;
            if (step === -35) ctx.moveTo(waveX, waveY);
            else ctx.lineTo(waveX, waveY);
          }
          ctx.stroke();
        }

        // 2) 부유하는 보라빛 네온 음표 기호 (♪ ♫ ♬ ♩)
        const notes = ['♪', '♫', '♬', '♩'];
        ctx.font = 'bold 15px sans-serif';
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 10;
        for (let n = 0; n < 6; n++) {
          const noteChar = notes[n % notes.length];
          const noteTime = t + n * 1.3;
          const noteX = pScreenX - 15 + ((n * 16 + Math.sin(noteTime) * 12) % (player.width + 30));
          const noteY = pScreenY + player.height - ((noteTime * 25 + n * 10) % (player.height + 25));
          const noteAlpha = Math.max(0.25, Math.sin(noteTime * 2));
          ctx.fillStyle = staffColors[n % staffColors.length];
          ctx.globalAlpha = noteAlpha;
          ctx.fillText(noteChar, noteX, noteY);
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;

        // 3) 머리 위 유지 시간 및 다음 발사 단계 배지
        const nextNote = player.mgStanceShotStage === 0 ? '1음: 3,500%' : (player.mgStanceShotStage === 1 ? '2음: 5,500%' : '종연: 7,000%');
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = player.mgStanceShotDelay > 0 ? '#94a3b8' : '#c084fc';
        const delayStr = player.mgStanceShotDelay > 0 ? ` (딜레이 ${player.mgStanceShotDelay.toFixed(1)}s)` : ' [L:발사]';
        ctx.fillText(`🎼 개연 [${player.mgStanceTimer.toFixed(1)}s] ➔ ${nextNote}${delayStr}`, pScreenX - 55, pScreenY - 34);
        ctx.restore();
      }

      // 플레이어 무기 외형 캔버스 렌더링 (메인: 종막의 디스트로이어 / RG 빛의검 : 슈퍼노바 / SG 블러디 앤 건 파우더, 보조: 루거 P08 스타일 권총)
      drawPlayerWeapon(pScreenX, pScreenY, playerCenterX, playerCenterY, groundY);

      // 재장전 중이면 머리 위에 재장전 바 표시
      const activeW = player.activeWeaponSlot === 'main' ? player.mainWeapon : player.subWeapon;
      if (activeW.isReloading) {
        const reloadPct = Math.max(0, 1 - (activeW.reloadTimer / activeW.reloadDuration));
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(pScreenX - 5, pScreenY - 14, player.width + 10, 6);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(pScreenX - 5, pScreenY - 14, (player.width + 10) * reloadPct, 6);
      }

      // [신규 UI] 플레이어 머리 위 사선 블록형 체력바 & 퍼센트 렌더링 (유저 스케치 반영)
      drawOverheadSlantedHpBar(pScreenX, pScreenY, player, true);

      // 머리 위 타이틀 라벨 (체력바 상단 배치)
      ctx.save();
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      if (currentMode === 'duo') {
        if (myRole === 'striker') {
          ctx.fillStyle = '#0284c7';
          ctx.fillText('👑 [나 (1P 스트라이커)]', pScreenX + player.width / 2, pScreenY - 32);
        } else {
          ctx.fillStyle = '#ef4444';
          ctx.fillText('👑 [나 (2P 스트라이커)]', pScreenX + player.width / 2, pScreenY - 32);
        }
      } else {
        ctx.fillStyle = '#0284c7';
        ctx.fillText('스트라이커', pScreenX + player.width / 2, pScreenY - 32);
      }
      ctx.restore();

      // 6.5. [동료 2인 스트라이커] (2인 모드 시 상대방 스트라이커 캐릭터 및 무기 렌더링)
      if (currentMode === 'duo' && remotePlayer.isActive) {
        const rScreenX = remotePlayer.x - camera.x;
        const rScreenY = remotePlayer.y;
        const rWorldCenterX = remotePlayer.x + remotePlayer.width / 2;
        const rWorldCenterY = remotePlayer.y + remotePlayer.height / 2;
        const rScreenCenterX = rScreenX + remotePlayer.width / 2;
        const rScreenCenterY = rScreenY + remotePlayer.height / 2;

        // 동료 그림자
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(rScreenX + remotePlayer.width / 2, groundY, remotePlayer.width * 0.6, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // [시스템 : 아비 에슈흐] 동료 날개 렌더링
        if (remotePlayer.isAbiEshuhActive) {
          drawMechanicalWings(rScreenX, rScreenY, remotePlayer);
        }

        // 동료 플레이어 블록
        ctx.save();
        ctx.fillStyle = remotePlayer.color || (myRole === 'striker' ? '#ef4444' : '#0284c7');
        ctx.fillRect(rScreenX, rScreenY, remotePlayer.width, remotePlayer.height);
        ctx.strokeStyle = remotePlayer.isDashing ? '#38bdf8' : '#ffffff';
        ctx.lineWidth = remotePlayer.isDashing ? 3 : 2;
        ctx.strokeRect(rScreenX, rScreenY, remotePlayer.width, remotePlayer.height);

        // [시스템 : 아비 에슈흐] 동료 머리 위 상태 표시
        if (remotePlayer.isAbiEshuhActive) {
          ctx.save();
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#00ffff';
          if (remotePlayer.abiFinalPhase && remotePlayer.abiFinalPhase !== 'none') {
            ctx.fillText('⚔️ [아비 에슈흐 파이널!]', rScreenX - 35, rScreenY - 34);
          } else {
            ctx.fillText(`💎 [아비 에슈흐]`, rScreenX - 20, rScreenY - 34);
          }
          ctx.restore();
        }

        if (remotePlayer.stunTimer > 0) {
          ctx.save();
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#facc15';
          ctx.fillText(`⚡ STUN [${remotePlayer.stunTimer.toFixed(1)}s]`, rScreenX - 16, rScreenY - 34);
          ctx.restore();
        }

        if (remotePlayer.abiStunTimer > 0) {
          ctx.save();
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#ef4444';
          ctx.fillText(`⚡ 과부하 기절 [${remotePlayer.abiStunTimer.toFixed(1)}s]`, rScreenX - 25, rScreenY - 34);
          ctx.restore();
        }

        // 보조스킬 / 차징 / 아우라 동기화 표시
        if (remotePlayer.isLightBeActive) {
          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 11px monospace';
          ctx.fillText('🌟 빛이여!', rScreenX - 10, rScreenY - 42);
        }
        if (remotePlayer.isChargingSkill) {
          const cPct = Math.min(1, remotePlayer.chargeTimer / (remotePlayer.chargeMax || 2.0));
          const barW = remotePlayer.width + 16;
          ctx.fillStyle = 'rgba(15,23,42,0.8)';
          ctx.fillRect(rScreenX - 8, rScreenY - 26, barW, 6);
          const barColor = remotePlayer.chargeLevel === 3 ? '#ec4899' : (remotePlayer.chargeLevel === 2 ? '#38bdf8' : '#60a5fa');
          ctx.fillStyle = barColor;
          ctx.fillRect(rScreenX - 8, rScreenY - 26, barW * cPct, 6);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.strokeRect(rScreenX - 8, rScreenY - 26, barW, 6);
        }
        if (remotePlayer.sgSkillActive) {
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#ef4444';
          ctx.fillText(`🩸 기괴멸렬 [${remotePlayer.sgSkillShotsLeft || 0}/6회]`, rScreenX - 22, rScreenY - 32);
        }

        // [SG: 격류] 동료 차징 & 난사 표시
        if (remotePlayer.sgTorrentCharging) {
          const cPct = Math.min(1, (remotePlayer.sgTorrentChargeTimer || 0) / 0.5);
          ctx.fillStyle = 'rgba(15,23,42,0.85)';
          ctx.fillRect(rScreenX - 8, rScreenY - 32, remotePlayer.width + 16, 6);
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(rScreenX - 8, rScreenY - 32, (remotePlayer.width + 16) * cPct, 6);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.strokeRect(rScreenX - 8, rScreenY - 32, remotePlayer.width + 16, 6);
          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#38bdf8';
          ctx.fillText('🌊 격류 차징 [0.5s]', rScreenX - 18, rScreenY - 36);
        }
        if (remotePlayer.sgTorrentFiring) {
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#0284c7';
          ctx.fillText(`🌊 격류 난사! [${8 - (remotePlayer.sgTorrentShotsLeft || 0)}/8]`, rScreenX - 24, rScreenY - 32);
        }

        // [RG: 빛의 검/각성] 동료 스택, 차징 & 발사 표시
        if (remotePlayer.rgAwakeStage > 0 && !remotePlayer.rgAwakeCharging && !remotePlayer.rgAwakeFiring) {
          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = remotePlayer.rgAwakeStage === 2 ? '#facc15' : '#38bdf8';
          ctx.fillText(remotePlayer.rgAwakeStage === 2 ? '⚡ [각성: ◆◆ MAX]' : '🌟 [각성: ◆]', rScreenX - 18, rScreenY - 34);
        }
        if (remotePlayer.rgAwakeCharging) {
          const cPct = Math.min(1, (remotePlayer.rgAwakeChargeTimer || 0) / (remotePlayer.rgAwakeChargeMax || 0.5));
          const isFireCharge = remotePlayer.rgAwakeChargeType === 'fire';
          const barCol = isFireCharge ? '#facc15' : '#38bdf8';
          ctx.fillStyle = 'rgba(15,23,42,0.85)';
          ctx.fillRect(rScreenX - 10, rScreenY - 34, remotePlayer.width + 20, 6);
          ctx.fillStyle = barCol;
          ctx.fillRect(rScreenX - 10, rScreenY - 34, (remotePlayer.width + 20) * cPct, 6);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.strokeRect(rScreenX - 10, rScreenY - 34, remotePlayer.width + 20, 6);
          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = barCol;
          ctx.fillText(isFireCharge ? '⚡ 슈퍼노바 차징!' : '✨ 각성 충전 중...', rScreenX - 24, rScreenY - 38);
        }
        if (remotePlayer.rgAwakeFiring) {
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#facc15';
          ctx.fillText('⚡ 각성 슈퍼노바 방출!', rScreenX - 28, rScreenY - 34);
        }

        // [MG: 종막의 이스보셋] 동료 난사 표시
        if (remotePlayer.isFiringSkill) {
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#c084fc';
          ctx.fillText(`⚡ 종막 : 이스보셋 [${remotePlayer.skillBurstCount || 0}/28발]`, rScreenX - 28, rScreenY - 32);
        }

        // [MG: 개연 : 이스보셋] 동료 자세 전환 및 음표 표시
        if (remotePlayer.mgStanceTransitioning) {
          ctx.fillStyle = '#c084fc';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('🎻 자세 전환 중 [2.0s]', rScreenX - 22, rScreenY - 38);
        }
        if (remotePlayer.mgStanceActive) {
          ctx.save();
          const t = Date.now() * 0.003;
          const notes = ['♪', '♫', '♬', '♩'];
          const rStaffColors = ['#f5d0fe', '#e879f9', '#d946ef', '#c084fc', '#a855f7'];
          ctx.font = 'bold 13px sans-serif';
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 8;
          for (let n = 0; n < 4; n++) {
            const noteChar = notes[n % notes.length];
            const noteTime = t + n * 1.5;
            const noteX = rScreenX + (n * 12) % (remotePlayer.width + 20);
            const noteY = rScreenY + remotePlayer.height - ((noteTime * 22 + n * 10) % (remotePlayer.height + 20));
            ctx.fillStyle = rStaffColors[n % rStaffColors.length];
            ctx.fillText(noteChar, noteX, noteY);
          }
          ctx.shadowBlur = 0;
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#c084fc';
          ctx.fillText(`🎼 개연 [${(remotePlayer.mgStanceTimer || 0).toFixed(0)}s]`, rScreenX - 24, rScreenY - 34);
          ctx.restore();
        }

        // 동료 [MG 특수스킬: 선도부장] 아우라 및 머리 위 뱃지
        if (remotePlayer.isFiringSpecial) {
          ctx.save();
          const rPhase = remotePlayer.specialPhase || 1;
          const rBerserk = remotePlayer.specialIsBerserk;
          const rRingColor = rBerserk ? '#a855f7' : (rPhase === 2 ? '#d946ef' : '#c084fc');
          const rAuraRadius = remotePlayer.width * (rBerserk ? 1.6 : (rPhase === 2 ? 1.4 : 1.25));

          const rAura = ctx.createRadialGradient(
            rScreenCenterX, rScreenCenterY, remotePlayer.width * 0.2,
            rScreenCenterX, rScreenCenterY, rAuraRadius
          );
          rAura.addColorStop(0, '#ffffff');
          rAura.addColorStop(0.3, rBerserk ? 'rgba(168, 85, 247, 0.65)' : 'rgba(217, 70, 239, 0.5)');
          rAura.addColorStop(1, 'rgba(147, 51, 234, 0)');
          ctx.fillStyle = rAura;
          ctx.beginPath();
          ctx.arc(rScreenCenterX, rScreenCenterY, rAuraRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = 'bold 12px monospace';
          ctx.fillStyle = rRingColor;
          ctx.shadowColor = rRingColor;
          ctx.shadowBlur = 8;
          const rPhaseText = rBerserk 
            ? `👑 [선도부장: 각성 3단계]`
            : `👑 [선도부장: ${rPhase}단계]`;
          ctx.fillText(rPhaseText, rScreenX - 35, rScreenY - 34);
          ctx.shadowBlur = 0;
          ctx.restore();
        }

        // 동료 [SG 특수스킬: 불사(不死)] 핏빛 오라 및 머리 위 뱃지
        if (remotePlayer.isImmortalActive) {
          ctx.save();
          const rAuraRadius = remotePlayer.width * 1.5;
          const rAura = ctx.createRadialGradient(rScreenCenterX, rScreenCenterY, remotePlayer.width * 0.2, rScreenCenterX, rScreenCenterY, rAuraRadius);
          rAura.addColorStop(0, '#ffffff');
          rAura.addColorStop(0.3, 'rgba(239, 68, 68, 0.7)');
          rAura.addColorStop(1, 'rgba(185, 28, 28, 0)');
          ctx.fillStyle = rAura;
          ctx.beginPath();
          ctx.arc(rScreenCenterX, rScreenCenterY, rAuraRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = 'bold 12px monospace';
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#dc2626';
          ctx.shadowBlur = 8;
          ctx.fillText('🩸 [불사(不死) : 무적]', rScreenX - 30, rScreenY - 34);
          ctx.restore();
        }

        // 동료 [SMG FOX 45식: 전술 방패 전개 & 전술 보호막 배리어]
        if (remotePlayer.isTacticalDefActive) {
          ctx.save();
          const rShieldRadius = remotePlayer.width * 0.85 + 4;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#00ffff';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(rScreenCenterX, rScreenCenterY, rShieldRadius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#38bdf8';
          ctx.fillText('🛡️ [전술 방패 전개]', rScreenX - 25, rScreenY - 34);
          ctx.restore();
        }

        // 동료 [AR: 색채 각성 상태]
        if (remotePlayer.isColorActive) {
          ctx.save();
          const rAuraRadius = remotePlayer.width * 1.4;
          const rAura = ctx.createRadialGradient(rScreenCenterX, rScreenCenterY, remotePlayer.width * 0.2, rScreenCenterX, rScreenCenterY, rAuraRadius);
          rAura.addColorStop(0, '#475569');
          rAura.addColorStop(0.5, 'rgba(30, 41, 59, 0.6)');
          rAura.addColorStop(1, 'rgba(15, 23, 42, 0)');
          ctx.fillStyle = rAura;
          ctx.beginPath();
          ctx.arc(rScreenCenterX, rScreenCenterY, rAuraRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('🌑 [색채 : BLACK FANG]', rScreenX - 35, rScreenY - 34);
          ctx.restore();
        }

        // 동료 무기 외형 렌더링
        drawPlayerWeapon(rScreenX, rScreenY, rWorldCenterX, rWorldCenterY, groundY, remotePlayer);

        // [신규 UI] 동료 머리 위 사선 블록형 체력바 & 퍼센트 렌더링
        drawOverheadSlantedHpBar(rScreenX, rScreenY, remotePlayer, false);

        // 동료 이름 라벨 (체력바 상단 배치)
        ctx.save();
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        if (myRole === 'striker') {
          ctx.fillStyle = '#ef4444';
          ctx.fillText('🛡️ [2P 스트라이커]', rScreenX + remotePlayer.width / 2, rScreenY - 32);
        } else {
          ctx.fillStyle = '#0284c7';
          ctx.fillText('🛡️ [1P 스트라이커]', rScreenX + remotePlayer.width / 2, rScreenY - 32);
        }
        ctx.restore();
        ctx.restore();
      }

      // 6.6. [힐팩 렌더링 제거 완료]

      // [신규 연출] 1페이즈 오프닝 컷신 렌더링
      if (window.phase1Cutscene && window.phase1Cutscene.active) {
        drawPhase1Cutscene(groundY);
      }

      // 7. 카이텐저 5인방 (컷신 비활성 상태일 때만 일반 렌더링)
      if (!window.phase1Cutscene || !window.phase1Cutscene.active) {
        kaitenzers.forEach(k => {
        if (!k.isSpawned) return; // 미등장 적은 화면에 그리지 않음!
        if (isPhase2Active || phase1Defeated) return; // 1페이즈 종료 및 2페이즈에서는 시신 완전 소멸/제거!

        const kScreenX = k.x - camera.x;
        const kScreenY = groundY - (k.jumpY || 0) - k.size;

        if (kScreenX + k.size > -50 && kScreenX < canvas.width + 50) {
          ctx.save();
          if (k.isDead) {
            // [무력화 상태]: 바닥에 쓰러진 다운 자세 및 반투명 그레이 처리
            ctx.globalAlpha = 0.45;
            const downedHeight = k.size * 0.32;
            const downedY = groundY - downedHeight;

            // 그림자
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(kScreenX + k.size / 2, groundY, k.size * 0.6, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            // 쓰러진 몸체 (바닥에 납작하게 누운 직사각형)
            ctx.fillStyle = '#475569';
            ctx.fillRect(kScreenX, downedY, k.size, downedHeight);
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(kScreenX, downedY, k.size, downedHeight);

            // 라벨: [무력화]
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 10px sans-serif';
            ctx.fillText(`${k.name} [무력화]`, kScreenX - 4, downedY - 6);
          } else {
            // [생존 전투 상태]
            // 점프 높이에 따른 지면 그림자 축소
            const jumpScale = Math.max(0.3, 1 - (k.jumpY || 0) / 130);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(kScreenX + k.size / 2, groundY, k.size * 0.6 * jumpScale, 6 * jumpScale, 0, 0, Math.PI * 2);
            ctx.fill();

            // 사각형 몸체 (공중 점프 시 떠오름)
            ctx.fillStyle = k.color;
            ctx.fillRect(kScreenX, kScreenY, k.size, k.size);
            ctx.strokeStyle = k.border || '#000000';
            ctx.lineWidth = 2;
            ctx.strokeRect(kScreenX, kScreenY, k.size, k.size);

            // 스킬 오라
            if (k.isActive) {
              ctx.strokeStyle = '#facc15';
              ctx.lineWidth = 3;
              ctx.strokeRect(kScreenX - 4, kScreenY - 4, k.size + 8, k.size + 8);
            }

            // 후퇴 중 속도감 연출: 뒤쪽 바람/잔상 이펙트 및 라벨
            if (k.isRetreating) {
              ctx.save();
              ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
              ctx.fillRect(kScreenX - 18, kScreenY + 6, 14, k.size - 12);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
              ctx.fillRect(kScreenX - 32, kScreenY + 12, 12, k.size - 24);
              ctx.font = 'bold 11px sans-serif';
              ctx.fillStyle = '#facc15';
              ctx.fillText('💨 [전력 후퇴!]', kScreenX - 10, kScreenY - 14);
              ctx.restore();
            }

            // 적 무기 외형 캔버스 렌더링
            drawKaitenzerWeapon(k, kScreenX, kScreenY, playerCenterX, playerCenterY, groundY);

            // 머리 위 5등분 눈금 개별 체력바 (너비: 카이텐저 크기 + 8px, 높이: 5.5px)
            const barW = k.size + 8;
            const barH = 5.5;
            const barX = kScreenX - 4;
            const barY = kScreenY - 9;

            // 체력바 배경
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(barX, barY, barW, barH);

            // 잔여 체력 채움 (해당 멤버 고유 색상)
            const hpRatio = Math.max(0, Math.min(1, k.hp / k.maxHp));
            ctx.fillStyle = k.color;
            ctx.fillRect(barX, barY, barW * hpRatio, barH);

            // 체력바 외곽선
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barW, barH);

            // 5등분 구분선 (20%, 40%, 60%, 80% 지점에 세로 눈금선 4개)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
            ctx.lineWidth = 1;
            for (let seg = 1; seg < 5; seg++) {
              const segX = Math.round(barX + (barW * (seg / 5)));
              ctx.beginPath();
              ctx.moveTo(segX, barY);
              ctx.lineTo(segX, barY + barH);
              ctx.stroke();
            }

            // 이름 & 역할 라벨 (체력바 위)
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(`${k.name}[${k.role}]`, kScreenX - 4, kScreenY - 13);

            // [라이딩 그레네이드] 공격력 30% 감소 디버프 아이콘/뱃지 렌더링
            if (k.atkDebuffTimer > 0) {
              ctx.save();
              ctx.font = 'bold 10px monospace';
              ctx.fillStyle = '#38bdf8';
              ctx.shadowColor = '#0284c7';
              ctx.shadowBlur = 6;
              ctx.fillText(`🔻 ATK -30% (${k.atkDebuffTimer.toFixed(1)}s)`, kScreenX - 12, kScreenY - 25);
              ctx.shadowBlur = 0;
              ctx.restore();
            }

            // [FOX 45식: 철벽의 방어] 기절 아이콘/뱃지 렌더링
            if (k.stunTimer > 0) {
              ctx.save();
              ctx.font = 'bold 11px monospace';
              ctx.fillStyle = '#facc15';
              ctx.shadowColor = '#eab308';
              ctx.shadowBlur = 8;
              ctx.fillText(`⚡ STUN (${k.stunTimer.toFixed(1)}s)`, kScreenX - 8, kScreenY - 37);
              ctx.shadowBlur = 0;
              ctx.restore();
            }

            // [FOX 45식: 공세 전환] 치명 저항 감소 디버프 렌더링
            if (k.critDmgResistDebuffTimer > 0) {
              ctx.save();
              ctx.font = 'bold 10px monospace';
              ctx.fillStyle = '#fb923c';
              ctx.shadowColor = '#ea580c';
              ctx.shadowBlur = 6;
              ctx.fillText(`🎯 치저 -${k.critDmgResistDebuff || 22}% (${k.critDmgResistDebuffTimer.toFixed(1)}s)`, kScreenX - 14, kScreenY - 49);
              ctx.shadowBlur = 0;
              ctx.restore();
            }

            // [자동 에임 모드]: 현재 타겟팅된 최근접 적 머리 위에 [TARGET / 조준 레티클] 렌더링
            if (player.aimMode === 'auto' && typeof getClosestActiveEnemy === 'function') {
              const currentClosest = getClosestActiveEnemy(player.x + player.width / 2, player.y + player.height * 0.58);
              if (currentClosest && currentClosest.entity === k) {
                ctx.save();
                const pulse = Math.sin(Date.now() * 0.008) * 3;
                const reticleX = kScreenX + k.size / 2;
                const reticleY = kScreenY - 26;

                // 조준 십자선 마커
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.arc(reticleX, reticleY, 8 + pulse, 0, Math.PI * 2);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(reticleX - 12 - pulse, reticleY);
                ctx.lineTo(reticleX - 4, reticleY);
                ctx.moveTo(reticleX + 4, reticleY);
                ctx.lineTo(reticleX + 12 + pulse, reticleY);
                ctx.moveTo(reticleX, reticleY - 12 - pulse);
                ctx.lineTo(reticleX, reticleY - 4);
                ctx.moveTo(reticleX, reticleY + 4);
                ctx.lineTo(reticleX, reticleY + 12 + pulse);
                ctx.stroke();

                ctx.font = 'bold 9px monospace';
                ctx.fillStyle = '#38bdf8';
                ctx.textAlign = 'center';
                ctx.fillText('TARGET', reticleX, reticleY - 12 - pulse);
                ctx.restore();
              }
            }
          }
          ctx.restore();
        }
      });
      }

      // [신규 연출] 2페이즈 합체 컷씬 렌더링
      if (window.phase2Cutscene && window.phase2Cutscene.active) {
        drawPhase2Cutscene(groundY);
      }

      // 7.2. [2페이즈 KAITEN FX Mk.0] 거대 메카 보스 렌더링 (신규 컷신 미진행 시 실전 렌더링)
      if ((!window.phase2Cutscene || !window.phase2Cutscene.active) && typeof kaitenFx !== 'undefined' && kaitenFx.isSpawned && !kaitenFx.isDead) {
        if (typeof drawKaitenFx === 'function') {
          // 실전 전투 중에는 75도 깊은 측면 프로필 뷰로 전투 진행
          drawKaitenFx(kaitenFx, groundY);
          // [신규 UI] 활성화된 파츠 직상단 오버헤드 실시간 체력바 렌더링
          drawKaitenFxActivePartOverheadHpBar(kaitenFx, groundY);
        }
      }

      // 7.3. [시네마틱 레터박스 & 웅장한 보스 등장 배너] (합체 컷씬 중 화면 상/하단 시네마틱 바)
      if ((!window.phase2Cutscene || !window.phase2Cutscene.active) && typeof kaitenFx !== 'undefined' && kaitenFx.introState && kaitenFx.introState !== 'none' && kaitenFx.introState !== 'ready') {
        ctx.save();
        // 상단 / 하단 시네마틱 블랙 레터박스 (높이 42px)
        ctx.fillStyle = '#050811';
        ctx.fillRect(0, 0, canvas.width, 42);
        ctx.fillRect(0, canvas.height - 42, canvas.width, 42);

        // 시네마틱 황금 라인
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 42); ctx.lineTo(canvas.width, 42);
        ctx.moveTo(0, canvas.height - 42); ctx.lineTo(canvas.width, canvas.height - 42);
        ctx.stroke();

        // 중앙 보스 타이틀 오버레이 배너 ('eye_flash' 및 'explosion' 단계에서 점등)
        if (kaitenFx.introState === 'eye_flash' || kaitenFx.introState === 'explosion') {
          ctx.textAlign = 'center';
          ctx.fillStyle = '#ef4444';
          ctx.font = '900 24px sans-serif';
          ctx.shadowColor = '#dc2626';
          ctx.shadowBlur = 16;
          ctx.fillText('⚡ KAITEN FX Mk.0 (카이텐 FX 마크 0) ⚡', canvas.width / 2, 30);
          ctx.font = 'bold 12px monospace';
          ctx.fillStyle = '#fde047';
          ctx.shadowBlur = 8;
          ctx.fillText('무한히 타오르는 회전초밥의 맹세 -- 최종 합체 거대 로봇 강림!', canvas.width / 2, canvas.height - 18);
        }
        ctx.restore();
      }

      // 7.5. [타인의 사슬 렌더링 제거 완료]

      // 7.8. [MG 특수스킬: 선도부장] 전장 시네마틱 암전 & 탄도 스포트라이트 조명
      const specialShooters = [];
      if (player.isFiringSpecial) specialShooters.push(player);
      if (remotePlayer.isActive && remotePlayer.isFiringSpecial) specialShooters.push(remotePlayer);

      if (specialShooters.length > 0) {
        ctx.save();
        const maxPhase = Math.max(...specialShooters.map(s => s.specialPhase || 1));
        const anyBerserk = specialShooters.some(s => s.specialIsBerserk);

        // 1) 전체 화면 암전 베이스 (1단계: 0.44, 2단계: 0.54, 3단계 초광폭: 0.66)
        const darkAlpha = anyBerserk ? 0.66 : (maxPhase === 2 ? 0.54 : 0.44);
        ctx.fillStyle = `rgba(8, 2, 16, ${darkAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2) 외곽 시네마틱 비네팅 (화면 테두리/모서리 깊은 어둠)
        const outerVig = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, canvas.height * 0.35,
          canvas.width / 2, canvas.height / 2, canvas.width * 0.72
        );
        outerVig.addColorStop(0, 'rgba(0, 0, 0, 0)');
        outerVig.addColorStop(0.7, 'rgba(4, 1, 10, 0.35)');
        outerVig.addColorStop(1, 'rgba(2, 0, 6, 0.7)');
        ctx.fillStyle = outerVig;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 3) 총구 및 사격 궤적 고휘도 스포트라이트 조명 (가산 혼합 lighter로 찬란하게 발광)
        ctx.globalCompositeOperation = 'lighter';
        specialShooters.forEach(shooter => {
          const sPhase = shooter.specialPhase || 1;
          const sBerserk = shooter.specialIsBerserk;
          const sFacing = shooter.facing;
          const sMuzzleX = shooter.x - camera.x + (sFacing > 0 ? shooter.width + 45 : -45);
          const sMuzzleY = shooter.y + shooter.height * 0.58;

          // (A) 사격수 및 총구 주변 네온 펄스 광륜 (Muzzle Corona)
          const haloRad = sBerserk ? 240 : 175;
          const halo = ctx.createRadialGradient(sMuzzleX, sMuzzleY, 15, sMuzzleX, sMuzzleY, haloRad);
          halo.addColorStop(0, sBerserk ? 'rgba(255, 255, 255, 0.95)' : 'rgba(250, 232, 255, 0.85)');
          halo.addColorStop(0.25, sBerserk ? 'rgba(217, 70, 239, 0.75)' : 'rgba(192, 132, 252, 0.65)');
          halo.addColorStop(0.65, 'rgba(147, 51, 234, 0.3)');
          halo.addColorStop(1, 'rgba(147, 51, 234, 0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(sMuzzleX, sMuzzleY, haloRad, 0, Math.PI * 2);
          ctx.fill();

          // (B) 총알이 질주하는 전방 탄도 축 집중 조명 빔 (Bullet Trajectory Searchlight Cone)
          const beamEndX = sFacing > 0 ? canvas.width + 160 : -160;
          const beamHeight = sBerserk ? 130 : 95;

          const beamGrad = ctx.createLinearGradient(0, sMuzzleY - beamHeight, 0, sMuzzleY + beamHeight);
          beamGrad.addColorStop(0, 'rgba(147, 51, 234, 0)');
          beamGrad.addColorStop(0.28, sBerserk ? 'rgba(168, 85, 247, 0.45)' : 'rgba(192, 132, 252, 0.32)');
          beamGrad.addColorStop(0.5, sBerserk ? 'rgba(255, 245, 255, 0.95)' : 'rgba(245, 208, 254, 0.8)');
          beamGrad.addColorStop(0.72, sBerserk ? 'rgba(168, 85, 247, 0.45)' : 'rgba(192, 132, 252, 0.32)');
          beamGrad.addColorStop(1, 'rgba(147, 51, 234, 0)');

          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(sMuzzleX, sMuzzleY - 14);
          ctx.lineTo(beamEndX, sMuzzleY - beamHeight);
          ctx.lineTo(beamEndX, sMuzzleY + beamHeight);
          ctx.lineTo(sMuzzleX, sMuzzleY + 14);
          ctx.closePath();
          ctx.fill();

          // (C) 중심 고휘도 레이저 코어 라인 (Center Radiant Core Line)
          ctx.strokeStyle = sBerserk ? '#ffffff' : '#f5d0fe';
          ctx.lineWidth = sBerserk ? 4.5 : 3.0;
          ctx.beginPath();
          ctx.moveTo(sMuzzleX, sMuzzleY);
          ctx.lineTo(beamEndX, sMuzzleY);
          ctx.stroke();
        });

        ctx.restore();
      }

      // 7.9. [RG 특수스킬: 시스템 : 아비 에슈흐] 변환 & 피니셔 시네마틱 연출
      const abiEntities = [];
      if (player.isAbiEshuhActive) abiEntities.push(player);
      if (remotePlayer.isActive && remotePlayer.isAbiEshuhActive) abiEntities.push(remotePlayer);

      abiEntities.forEach(ent => {
        const entScreenX = ent.x - camera.x + ent.width / 2;
        const entScreenY = ent.y + ent.height / 2;

        // 1) [0.5초 형태 변환 연출]: 빛과 홀로그램 데이터 입자 응집
        if (ent.abiTransforming) {
          ctx.save();
          const tProg = Math.max(0, ent.abiTransformTimer / 0.5); // 1.0 -> 0.0
          const ringRad = 40 + (1 - tProg) * 80;

          // (A) 육각 데이터 매트릭스 링
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          for (let a = 0; a < 6; a++) {
            const ang = (a * Math.PI / 3) + Date.now() * 0.006;
            const rx = entScreenX + Math.cos(ang) * ringRad;
            const ry = entScreenY + Math.sin(ang) * ringRad;
            if (a === 0) ctx.moveTo(rx, ry);
            else ctx.lineTo(rx, ry);
          }
          ctx.closePath();
          ctx.stroke();

          // (B) 수직 강림 광기둥
          const pillarGrad = ctx.createLinearGradient(entScreenX - 35, 0, entScreenX + 35, 0);
          pillarGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
          pillarGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.85)');
          pillarGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
          ctx.fillStyle = pillarGrad;
          ctx.fillRect(entScreenX - 35, 0, 70, canvas.height);
          ctx.restore();
        }

        // 2) [빛의 검 : 아비 에슈흐 파이널] 페이즈별 시네마틱 렌더링
        const phase = ent.abiFinalPhase || 'none';
        if (phase === 'charging') {
          // (A) 3초 집중 차징: 하늘을 꿰뚫는 초거대 아쿠아 크리스탈 광기둥 & 공간 왜곡
          ctx.save();
          const cTimer = ent.abiFinalChargeTimer || 0;
          const chargeProg = Math.min(1, (3.0 - cTimer) / 3.0);
          const pillarWidth = 80 + chargeProg * 120;

          // 암전 비네트 (배경 어둡게 강조)
          ctx.fillStyle = 'rgba(8, 15, 30, 0.45)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 수직 광기둥
          const cPillar = ctx.createLinearGradient(entScreenX - pillarWidth / 2, 0, entScreenX + pillarWidth / 2, 0);
          cPillar.addColorStop(0, 'rgba(0, 255, 255, 0)');
          cPillar.addColorStop(0.3, 'rgba(56, 189, 248, 0.4)');
          cPillar.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
          cPillar.addColorStop(0.7, 'rgba(56, 189, 248, 0.4)');
          cPillar.addColorStop(1, 'rgba(0, 255, 255, 0)');
          ctx.fillStyle = cPillar;
          ctx.fillRect(entScreenX - pillarWidth / 2, 0, pillarWidth, canvas.height);

          // 캐릭터 발밑 회전 마법진 / 크리스탈 매트릭스
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(entScreenX, ent.y + ent.height, 60 + chargeProg * 30, 15 + chargeProg * 8, Date.now() * 0.004, 0, Math.PI * 2);
          ctx.stroke();

          // 주변을 공전하는 다이아몬드 크리스탈 조각들
          for (let d = 0; d < 8; d++) {
            const dAng = (Date.now() * 0.005 + d * (Math.PI / 4)) % (Math.PI * 2);
            const dDist = 55 + Math.sin(Date.now() * 0.01 + d) * 12;
            const dx = entScreenX + Math.cos(dAng) * dDist;
            const dy = entScreenY + Math.sin(dAng) * (dDist * 0.4);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(dx, dy - 8);
            ctx.lineTo(dx + 5, dy);
            ctx.lineTo(dx, dy + 8);
            ctx.lineTo(dx - 5, dy);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();

        } else if (phase === 'fly_up') {
          // (B) 0.45초 곡선 초음속 상승: 마하 원추형 충격파 & 광속 잔상 트레일
          ctx.save();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(entScreenX - ent.facing * 120, entScreenY + 140);
          ctx.quadraticCurveTo(entScreenX - ent.facing * 40, entScreenY + 40, entScreenX, entScreenY);
          ctx.stroke();

          // 소닉붐 마하 링
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(entScreenX - ent.facing * 30, entScreenY + 25, 30, 16, Math.PI / 4 * ent.facing, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

        } else if (phase === 'dive_slash') {
          // (C) 0.35초 초음속 급강하 참격: [진짜 빛의 검: 영원한 샛별] 거대 크리스탈 대검 소환! (유저 레퍼런스 이미지 3 완벽 구현)
          ctx.save();
          const target = ent.abiFinalTarget;
          let diveAngle = Math.PI / 4 * ent.facing; // 기본 45도 하강
          if (target && typeof target.x === 'number') {
            const dx = (target.x + (target.size || 60) / 2) - (ent.x + (ent.width || 40) / 2);
            const dy = (target.y || (canvas.height - GROUND_OFFSET)) - (ent.y + (ent.height || 60) / 2);
            diveAngle = Math.atan2(dy, dx);
          }
          if (isNaN(diveAngle) || !isFinite(diveAngle)) {
            diveAngle = Math.PI / 4 * (ent.facing || 1);
          }

          ctx.translate(entScreenX, entScreenY);
          ctx.rotate(diveAngle);

          // 1. 대검 후방 광자 충격파 검기 궤적 (Azure Photon Arc Slash Trail)
          const trailGrad = ctx.createLinearGradient(0, -60, 0, 60);
          trailGrad.addColorStop(0, 'rgba(0, 255, 255, 0)');
          trailGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.45)');
          trailGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
          trailGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.45)');
          trailGrad.addColorStop(1, 'rgba(0, 255, 255, 0)');
          ctx.fillStyle = trailGrad;
          ctx.beginPath();
          ctx.moveTo(-120, 0);
          ctx.lineTo(80, -50);
          ctx.lineTo(160, 0);
          ctx.lineTo(80, 50);
          ctx.closePath();
          ctx.fill();

          // 2. [영원한 샛별] 거대 네온 크리스탈 블레이드 본체 (길이 180px, 폭 45px)
          // (A) 외부 샤프 크리스탈 에지 (Cyan Neon Razor Edge)
          ctx.fillStyle = '#0284c7';
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 2.8;
          ctx.shadowColor = '#00ffff';
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.moveTo(-25, 0);
          ctx.lineTo(20, -22);
          ctx.lineTo(110, -18);
          ctx.lineTo(185, 0); // 날카로운 검끝
          ctx.lineTo(110, 18);
          ctx.lineTo(20, 22);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;

          // (B) 크리스탈 패싯 능선 (Prism Facets)
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(10, 0);
          ctx.lineTo(30, -14);
          ctx.lineTo(115, -12);
          ctx.lineTo(170, 0);
          ctx.lineTo(115, 12);
          ctx.lineTo(30, 14);
          ctx.closePath();
          ctx.fill();

          // (C) 중심 백색 고에너지 코어 스파인 (Pure White Core Radiant Spine)
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(15, 0);
          ctx.lineTo(40, -5);
          ctx.lineTo(155, 0);
          ctx.lineTo(40, 5);
          ctx.closePath();
          ctx.fill();

          // (D) 금색/황금빛 룬 문양 악센트 (Golden Rune Accents)
          ctx.fillStyle = '#facc15';
          for (let r = 0; r < 3; r++) {
            ctx.beginPath();
            ctx.moveTo(50 + r * 30, -4);
            ctx.lineTo(56 + r * 30, 0);
            ctx.lineTo(50 + r * 30, 4);
            ctx.lineTo(44 + r * 30, 0);
            ctx.closePath();
            ctx.fill();
          }

          ctx.restore();

        } else if (phase === 'hitstop') {
          // (D) 0.35초 시공간 정지(히트스톱): 화면 흑백/인버전 틴트 & 공간에 깊게 새겨진 백색 절단선
          ctx.save();
          // 전체 화면 네거티브 시네마틱 틴트
          ctx.fillStyle = 'rgba(15, 23, 42, 0.40)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 공간을 대각선으로 양단하는 거대 백색 일도양단 궤적 (Spatial Slash Scar)
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 6;
          ctx.shadowColor = '#00ffff';
          ctx.shadowBlur = 24;
          ctx.beginPath();
          ctx.moveTo(entScreenX - ent.facing * 400, entScreenY - 300);
          ctx.lineTo(entScreenX + ent.facing * 400, entScreenY + 300);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // 보조 절단선
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(entScreenX - ent.facing * 350, entScreenY - 260);
          ctx.lineTo(entScreenX + ent.facing * 350, entScreenY + 340);
          ctx.stroke();

          // 절단점 중심 정지된 크리스탈 파편들
          for (let k = 0; k < 12; k++) {
            const kx = entScreenX + (Math.sin(k * 1.5) * 80);
            const ky = entScreenY + (Math.cos(k * 1.5) * 80);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(kx, ky, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();

        } else if (phase === 'flash_burst') {
          // (E) 0.28초 섬광 폭발: 다이아몬드 십자 크로스 플래시 & 유리창 깨지듯 터지는 파편 충격파!
          ctx.save();
          const fTimer = ent.abiFinalFlashTimer || 0;
          const fProg = Math.max(0, fTimer / 0.28); // 1.0 -> 0.0

          // 전체 화면 백색 플래시
          ctx.fillStyle = `rgba(255, 255, 255, ${fProg * 0.75})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 중심 거대 다이아몬드 크로스 섬광 (4-pointed Starburst)
          const burstRad = 350 * (1 - fProg * 0.5);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(entScreenX, entScreenY - burstRad);
          ctx.quadraticCurveTo(entScreenX, entScreenY, entScreenX + burstRad * 1.8, entScreenY);
          ctx.quadraticCurveTo(entScreenX, entScreenY, entScreenX, entScreenY + burstRad);
          ctx.quadraticCurveTo(entScreenX, entScreenY, entScreenX - burstRad * 1.8, entScreenY);
          ctx.quadraticCurveTo(entScreenX, entScreenY, entScreenX, entScreenY - burstRad);
          ctx.closePath();
          ctx.fill();

          // 외곽 확장 충격파 링
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 6 * fProg;
          ctx.beginPath();
          ctx.arc(entScreenX, entScreenY, (1 - fProg) * 450, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      });

      // 7-3. [WHITE FANG 465] 화력 지원 드론 렌더링
      drawWhiteFangDrones();

      // 8. 탄환 렌더링 (시인성을 위한 진한 검은색 테두리 및 진행 각도 회전)
      bullets.forEach(b => {
        const bScreenX = b.x - camera.x;
        const inView = (b.type === 'abi_laser')
          ? (bScreenX > -2500 && bScreenX < canvas.width + 2500)
          : (bScreenX > -60 && bScreenX < canvas.width + 60);
        if (inView) {
          ctx.save();
          ctx.translate(bScreenX, b.y);
          if (b.angle !== undefined) {
            ctx.rotate(b.angle);
          }

          ctx.fillStyle = b.color;
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;

          if (b.isPeerBullet) {
            // [2인 멀티플레이]: 동료 스트라이커가 쏜 탄환의 시인성 극대화 (화려한 네온 오라 링 렌더링)
            const peerGlow = b.peerColor || '#f43f5e';
            ctx.save();
            ctx.shadowColor = peerGlow;
            ctx.shadowBlur = 14;
            ctx.strokeStyle = peerGlow;
            ctx.lineWidth = 3.0;
            ctx.beginPath();
            ctx.arc(0, 0, (b.size || 5) * 1.35, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          if (b.type === 'rg_energy_ball') {
            // [RG 밸런스 붕괴] 거대 관통 에너지탄
            const rad = b.size;
            // 외곽 글로우
            const grad = ctx.createRadialGradient(0, 0, rad * 0.2, 0, 0, rad);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.4, b.color);
            grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, rad, 0, Math.PI * 2);
            ctx.fill();

            // 내부 코어
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, rad * 0.45, 0, Math.PI * 2);
            ctx.fill();

            // 회전 에너지 링
            ctx.strokeStyle = '#e0f2fe';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.ellipse(0, 0, rad * 0.9, rad * 0.35, Date.now() * 0.01, 0, Math.PI * 2);
            ctx.stroke();
          } else if (b.type === 'mg_ishbosheth_bullet' || (b.type === 'sr_bullet' && b.isPlayerBullet)) {
            // [MG 1스킬: 종막의 이스보셋] 초고속 관통 보라빛 네온 레이저 탄환
            // 1. 외곽 보라빛 네온 블러 글로우
            const neonGrad = ctx.createLinearGradient(0, -9, 0, 9);
            neonGrad.addColorStop(0, 'rgba(168, 85, 247, 0)');
            neonGrad.addColorStop(0.3, 'rgba(192, 132, 252, 0.75)');
            neonGrad.addColorStop(0.5, '#fae8ff');
            neonGrad.addColorStop(0.7, 'rgba(192, 132, 252, 0.75)');
            neonGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
            ctx.fillStyle = neonGrad;
            ctx.fillRect(-32, -9, 64, 18);

            // 2. 중심 고휘도 백색 관통 코어
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-26, -3, 52, 6);

            // 3. 외곽 보라빛 네온 프레임
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-28, -4, 56, 8);

            // 4. 후방 보라빛 스파크 트레일
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.moveTo(-28, -3);
            ctx.lineTo(-44, 0);
            ctx.lineTo(-28, 3);
            ctx.closePath();
            ctx.fill();
          } else if (b.type === 'sr_bullet') {
            // [카이텐저 옐로우: 저격탄] 고유 황금/노란빛 초고속 레이저 탄환
            const yellowColor = b.color || '#eab308';
            // 1. 외곽 황금빛 네온 글로우
            const yGrad = ctx.createLinearGradient(0, -7, 0, 7);
            yGrad.addColorStop(0, 'rgba(234, 179, 8, 0)');
            yGrad.addColorStop(0.3, 'rgba(250, 204, 21, 0.75)');
            yGrad.addColorStop(0.5, '#fef9c3');
            yGrad.addColorStop(0.7, 'rgba(250, 204, 21, 0.75)');
            yGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');
            ctx.fillStyle = yGrad;
            ctx.fillRect(-28, -7, 56, 14);

            // 2. 중심 고에너지 백색 코어
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-22, -2.5, 44, 5);

            // 3. 외곽 황금빛 테두리 프레임
            ctx.strokeStyle = yellowColor;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-25, -3.5, 50, 7);

            // 4. 후방 황금빛 스파크 트레이서
            ctx.fillStyle = yellowColor;
            ctx.beginPath();
            ctx.moveTo(-25, -3);
            ctx.lineTo(-38, 0);
            ctx.lineTo(-25, 3);
            ctx.closePath();
            ctx.fill();
          } else if (b.type === 'rocket') {
            // 로켓 탄환 (진행 방향으로 머리가 향함)
            ctx.beginPath();
            ctx.arc(0, 0, b.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // 로켓 꼬리 화염 (진행 방향 반대편으로 분사)
            ctx.fillStyle = '#fb923c';
            ctx.beginPath();
            ctx.arc(-b.size * 0.8, 0, b.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (b.type === 'sg_pellet') {
            // [SG: 블러디 앤 건 파우더] 산탄 펠릿 (화염/스파크 트레이서)
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, b.size * 1.6, b.size * 0.85, 0, 0, Math.PI * 2);
            ctx.fill();
            // 백색 고에너지 코어
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(0.5, 0, b.size * 0.8, b.size * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            // 트레이서 꼬리 화염
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.moveTo(-b.size * 1.2, -b.size * 0.6);
            ctx.lineTo(-b.size * 3.0, 0);
            ctx.lineTo(-b.size * 1.2, b.size * 0.6);
            ctx.closePath();
            ctx.fill();
          } else if (b.type === 'sg_torrent_pellet') {
            // [SG: 격류] 푸른 수류 산탄 펠릿
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, b.size * 1.8, b.size * 0.9, 0, 0, Math.PI * 2);
            ctx.fill();
            // 백색 중심 코어
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(0.5, 0, b.size * 0.9, b.size * 0.45, 0, 0, Math.PI * 2);
            ctx.fill();
            // 수류 트레이서
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.moveTo(-b.size * 1.4, -b.size * 0.6);
            ctx.lineTo(-b.size * 3.5, 0);
            ctx.lineTo(-b.size * 1.4, b.size * 0.6);
            ctx.closePath();
            ctx.fill();
          } else if (b.type === 'mg_melody_bullet') {
            // [MG 2스킬: 개연 : 이스보셋] 보라빛 네온 선율 관통 탄환 (1음/2음/종연)
            const rad = b.size;
            const stage = b.stage || 1;
            const noteChar = stage === 1 ? '♪' : (stage === 2 ? '♫' : '🎼');
            const primaryColor = b.color || '#c084fc';

            // 1. 외곽 보라빛 네온 에너지 쇼크웨이브 링
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 2.8;
            ctx.beginPath();
            ctx.ellipse(0, 0, rad * 1.6, rad * 0.8, 0, 0, Math.PI * 2);
            ctx.stroke();

            // 2. 외부 보라빛 네온 플라즈마 후광 그라데이션
            const grad = ctx.createRadialGradient(0, 0, rad * 0.15, 0, 0, rad * 1.4);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.35, primaryColor);
            grad.addColorStop(0.75, 'rgba(168, 85, 247, 0.4)');
            grad.addColorStop(1, 'rgba(147, 51, 234, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, rad * 1.4, 0, Math.PI * 2);
            ctx.fill();

            // 3. 중심 백색 고에너지 코어
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, rad * 0.52, 0, Math.PI * 2);
            ctx.fill();

            // 4. 관통 후방 보라빛 네온 오선지 궤적 (5줄 오선지 트레일)
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 1.6;
            for (let i = -2; i <= 2; i++) {
              ctx.beginPath();
              ctx.moveTo(-rad * 0.5, i * (rad * 0.3));
              ctx.lineTo(-rad * 3.6, i * (rad * 0.22));
              ctx.stroke();
            }

            // 5. 중앙 음표 기호 각인 (짙은 보라색)
            ctx.fillStyle = '#3b0764';
            ctx.font = `bold ${Math.round(rad * 0.95)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(noteChar, 0, 0);
          } else if (b.type === 'mg_special_bullet') {
            // [MG 특수스킬: 선도부장] 초고속 보라빛 네온 관통 에너지 탄환
            const rad = b.size;
            const phase = b.phase || 1;
            const isBerserk = b.isBerserk;
            const mainColor = b.color || (isBerserk ? '#a855f7' : (phase === 2 ? '#d946ef' : '#c084fc'));

            // 1. 전방 초음속 충격파 링 (Shockwave Ring)
            ctx.strokeStyle = mainColor;
            ctx.lineWidth = isBerserk ? 3.2 : (phase === 2 ? 2.6 : 2.0);
            ctx.beginPath();
            ctx.ellipse(rad * 0.4, 0, rad * 1.5, rad * 0.8, 0, 0, Math.PI * 2);
            ctx.stroke();

            // 2. 외부 고에너지 보라빛 플라즈마 후광 그라데이션
            const grad = ctx.createRadialGradient(0, 0, rad * 0.2, 0, 0, rad * 1.6);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, mainColor);
            grad.addColorStop(0.7, 'rgba(168, 85, 247, 0.45)');
            grad.addColorStop(1, 'rgba(147, 51, 234, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, rad * 1.6, 0, Math.PI * 2);
            ctx.fill();

            // 3. 중심 백색 초고에너지 관통 코어 (타원형 침투 탄두)
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(rad * 0.2, 0, rad * 1.1, rad * 0.45, 0, 0, Math.PI * 2);
            ctx.fill();

            // 4. 후방 플라즈마 제트 트레일 (마하 콘 형태)
            ctx.fillStyle = mainColor;
            ctx.beginPath();
            ctx.moveTo(-rad * 0.8, -rad * 0.4);
            ctx.lineTo(-rad * 3.8, 0);
            ctx.lineTo(-rad * 0.8, rad * 0.4);
            ctx.closePath();
            ctx.fill();

            // 5. 3단계 초광폭(HP 30% 이하) 시 추가 번개 방전 스파크 이펙트
            if (isBerserk) {
              ctx.strokeStyle = '#f5d0fe';
              ctx.lineWidth = 1.6;
              ctx.beginPath();
              ctx.moveTo(-rad * 0.5, -rad * 0.8);
              ctx.lineTo(0, -rad * 1.4);
              ctx.lineTo(rad * 0.7, -rad * 0.9);
              ctx.moveTo(-rad * 0.5, rad * 0.8);
              ctx.lineTo(0, rad * 1.4);
              ctx.lineTo(rad * 0.7, rad * 0.9);
              ctx.stroke();
            }
          } else if (b.type === 'abi_laser') {
            // [아비 에슈흐 평타]: 초고밀도 단타 관통 레이저 빔 (각도 지향형 볼트)
            const bLen = b.stage === 3 ? 180 : (b.stage === 2 ? 140 : 100);
            const bThick = b.stage === 3 ? 15 : (b.stage === 2 ? 11 : 7);

            // 1. 외곽 청록빛 플라즈마 후광
            const laserGrad = ctx.createLinearGradient(0, -bThick, 0, bThick);
            laserGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
            laserGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.75)');
            laserGrad.addColorStop(0.5, '#ffffff');
            laserGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.75)');
            laserGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

            ctx.fillStyle = laserGrad;
            ctx.fillRect(-bLen * 0.5, -bThick, bLen, bThick * 2);

            // 2. 중심 초고에너지 화이트 코어 빔
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-bLen * 0.5, -bThick * 0.3, bLen, bThick * 0.6);

            // 3. 레이저 선단 쐐기형 돌파 충격파 링
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.ellipse(bLen * 0.35, 0, bThick * 1.5, bThick * 0.8, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0, 0, bThick * 1.3, bThick * 0.7, 0, 0, Math.PI * 2);
            ctx.stroke();
          } else if (b.type === 'abi_missile') {
            // [아비 에슈흐 1스킬: 용기의 마법]: 날개 사출형 고기동 유도 미사일
            const rad = b.size;

            // 1. 미사일 후방 추진체 분사염 (Cyan & Orange Flame)
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.moveTo(-rad * 1.2, -rad * 0.4);
            ctx.lineTo(-rad * 3.2, 0);
            ctx.lineTo(-rad * 1.2, rad * 0.4);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.moveTo(-rad * 1.0, -rad * 0.25);
            ctx.lineTo(-rad * 2.2, 0);
            ctx.lineTo(-rad * 1.0, rad * 0.25);
            ctx.closePath();
            ctx.fill();

            // 2. 미사일 유선형 바디 (Pure White with Deep Navy Stripe)
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(rad * 1.8, 0);
            ctx.lineTo(rad * 0.6, -rad * 0.65);
            ctx.lineTo(-rad * 1.4, -rad * 0.65);
            ctx.lineTo(-rad * 1.4, rad * 0.65);
            ctx.lineTo(rad * 0.6, rad * 0.65);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // 3. 미사일 네이비 스트라이프 및 유도 센서 (Cyan Eye)
            ctx.fillStyle = '#1e3a8a';
            ctx.fillRect(-rad * 0.3, -rad * 0.65, rad * 0.6, rad * 1.3);

            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(rad * 1.4, 0, rad * 0.3, 0, Math.PI * 2);
            ctx.fill();

            // 4. 후방 십자형 안정익 핀
            ctx.fillStyle = '#334155';
            ctx.fillRect(-rad * 1.5, -rad * 1.2, rad * 0.45, rad * 2.4);
          } else if (b.type === 'abi_enhanced_bullet') {
            // [아비 에슈흐 2스킬: 빛의 난사] 강화 관통 탄환 (9,500 dmg)
            const rad = b.size;

            // 1. 외곽 광자 충격파 링
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.ellipse(rad * 0.3, 0, rad * 1.6, rad * 0.85, 0, 0, Math.PI * 2);
            ctx.stroke();

            // 2. 크리스탈 다이아몬드 관통 탄두
            const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, rad * 1.5);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.4, '#00ffff');
            grad.addColorStop(0.8, '#38bdf8');
            grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, rad * 1.5, 0, Math.PI * 2);
            ctx.fill();

            // 3. 다이아몬드 코어
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(rad * 1.4, 0);
            ctx.lineTo(0, -rad * 0.65);
            ctx.lineTo(-rad * 1.4, 0);
            ctx.lineTo(0, rad * 0.65);
            ctx.closePath();
            ctx.fill();
          } else if (b.type === 'abi_bullet') {
            // [아비 에슈흐 2스킬: 빛의 난사] 일반 탄환 (4,500 dmg)
            const rad = b.size;

            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.moveTo(rad * 1.5, 0);
            ctx.lineTo(-rad * 1.5, -rad * 0.5);
            ctx.lineTo(-rad * 0.8, 0);
            ctx.lineTo(-rad * 1.5, rad * 0.5);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, rad * 0.45, 0, Math.PI * 2);
            ctx.fill();
          } else if (b.type === 'sg_immortal_pellet') {
            // [SG 불사(不死)] 핏빛 네온 고열 산탄 (Blood Neon Fire Pellet)
            const rad = b.size;

            // 1. 외곽 핏빛 충격파 링
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.ellipse(0, 0, rad * 1.4, rad * 0.8, 0, 0, Math.PI * 2);
            ctx.stroke();

            // 2. 핏빛 고에너지 코어
            const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, rad);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.35, '#f87171');
            grad.addColorStop(0.7, '#dc2626');
            grad.addColorStop(1, 'rgba(185, 28, 28, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, rad, 0, Math.PI * 2);
            ctx.fill();

            // 3. 중심 크림슨 레드 코어
            ctx.fillStyle = '#fee2e2';
            ctx.beginPath();
            ctx.arc(0, 0, rad * 0.4, 0, Math.PI * 2);
            ctx.fill();
          } else if (b.type === 'ar_bullet') {
            const bLen = 14;
            const bThick = b.size;
            const isRedEnemy = (b.isEnemyBullet || b.color === '#ef4444');
            const mainCol = isRedEnemy ? '#ef4444' : (b.peerColor || b.color || '#22d3ee');
            const glowCol = isRedEnemy ? 'rgba(239, 68, 68, 0.6)' : 'rgba(34, 211, 238, 0.6)';

            // 외곽 글로우 빔
            const tracerGrad = ctx.createLinearGradient(-bLen, 0, bLen, 0);
            tracerGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
            tracerGrad.addColorStop(0.4, glowCol);
            tracerGrad.addColorStop(0.8, '#ffffff');
            tracerGrad.addColorStop(1, mainCol);
            ctx.fillStyle = tracerGrad;
            ctx.fillRect(-bLen * 0.6, -bThick * 0.5, bLen, bThick);

            // 화이트 코어 탄심
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-bLen * 0.3, -bThick * 0.25, bLen * 0.7, bThick * 0.5);

            // 선단 예광 발광점
            ctx.fillStyle = mainCol;
            ctx.beginPath();
            ctx.arc(bLen * 0.4, 0, bThick * 0.6, 0, Math.PI * 2);
            ctx.fill();
          } else if (b.type === 'white_fang_missile') {
            // [화력 지원 드론] 아비도스 마이크로 미사일
            const rad = b.size;

            // 1. 후방 시안 플라즈마 분사염
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.moveTo(-rad * 1.0, -rad * 0.3);
            ctx.lineTo(-rad * 2.8, 0);
            ctx.lineTo(-rad * 1.0, rad * 0.3);
            ctx.closePath();
            ctx.fill();

            // 2. 미사일 바디 (화이트 & 블랙)
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(rad * 1.6, 0);
            ctx.lineTo(rad * 0.6, -rad * 0.6);
            ctx.lineTo(-rad * 1.2, -rad * 0.6);
            ctx.lineTo(-rad * 1.2, rad * 0.6);
            ctx.lineTo(rad * 0.6, rad * 0.6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // 3. 시안 센서 돔
            ctx.fillStyle = '#06b6d4';
            ctx.fillRect(-rad * 0.2, -rad * 0.6, rad * 0.5, rad * 1.2);

            // 4. 후방 안정익 핀
            ctx.fillStyle = '#1e293b';
          } else if (b.type === 'color_drone_bullet') {
            // [색채: 화력 강화 드론] 250% 지원 사격 암회색 관통 탄환
            const bLen = 16;
            const bThick = b.size || 5;
            const tracerGrad = ctx.createLinearGradient(-bLen, 0, bLen, 0);
            tracerGrad.addColorStop(0, 'rgba(15, 23, 42, 0)');
            tracerGrad.addColorStop(0.4, 'rgba(71, 85, 105, 0.7)');
            tracerGrad.addColorStop(0.8, '#cbd5e1');
            tracerGrad.addColorStop(1, '#94a3b8');
            ctx.fillStyle = tracerGrad;
            ctx.fillRect(-bLen * 0.6, -bThick * 0.5, bLen, bThick);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-bLen * 0.2, -bThick * 0.25, bLen * 0.5, bThick * 0.5);
          } else if (b.type === 'riding_grenade' || b.type === 'color_grenade') {
            // [AR 2스킬] 라이딩 그레네이드 vs 수류탄 투척·개(改) (어두운 회색)
            const isColorG = (b.type === 'color_grenade');
            const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, b.size);
            if (isColorG) {
              grad.addColorStop(0, '#ffffff');
              grad.addColorStop(0.4, '#94a3b8');
              grad.addColorStop(0.8, '#334155');
              grad.addColorStop(1, 'rgba(15, 23, 42, 0.4)');
            } else {
              grad.addColorStop(0, '#ffffff');
              grad.addColorStop(0.4, '#22d3ee');
              grad.addColorStop(0.8, '#06b6d4');
              grad.addColorStop(1, 'rgba(6, 182, 212, 0.2)');
            }
            ctx.fillStyle = grad;
            ctx.shadowColor = isColorG ? '#475569' : '#06b6d4';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(0, 0, b.size, 0, Math.PI * 2);
            ctx.fill();

            // 외곽 발광 테두리 링
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, b.size * 0.75, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
          } else if (b.type === 'fx_mackerel_slash_wave') {
            // [무한회전 파이널 고등어 슬래쉬]: 전방 화면을 찢으며 날아가는 카이텐 FX 크기(높이 360px, 폭 120px) 거대 초승달 푸른빛 참격파!
            const w = b.width || 120;
            const h = b.height || 360;

            ctx.save();
            // 외곽 영롱한 시안/블루 플라즈마 후광 (shadowBlur 없이 초경량 렉 0% 네온 아우라)
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
            ctx.lineWidth = 16;
            ctx.beginPath();
            ctx.ellipse(0, 0, w * 0.5 + 4, h * 0.5 + 4, 0, -Math.PI * 0.5, Math.PI * 0.5);
            ctx.quadraticCurveTo(w * 0.12, 0, 0, -h * 0.5 - 4);
            ctx.closePath();
            ctx.stroke();

            const waveGrad = ctx.createLinearGradient(-w * 0.5, 0, w * 0.5, 0);
            waveGrad.addColorStop(0, 'rgba(0, 229, 255, 0)');
            waveGrad.addColorStop(0.25, 'rgba(56, 189, 248, 0.45)');
            waveGrad.addColorStop(0.65, '#00e5ff');
            waveGrad.addColorStop(0.9, '#ffffff');
            waveGrad.addColorStop(1, '#0284c7');
            ctx.fillStyle = waveGrad;

            // 거대 초승달 / 반달 참격파 아크
            ctx.beginPath();
            ctx.ellipse(0, 0, w * 0.5, h * 0.5, 0, -Math.PI * 0.5, Math.PI * 0.5);
            ctx.quadraticCurveTo(w * 0.12, 0, 0, -h * 0.5);
            ctx.closePath();
            ctx.fill();

            // 백색 예리한 칼날 코어 라인
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.ellipse(w * 0.22, 0, w * 0.35, h * 0.46, 0, -Math.PI * 0.45, Math.PI * 0.45);
            ctx.stroke();

            // 내부 2중 푸른빛 전격 슬래시 에너지 라인
            ctx.strokeStyle = '#67e8f9';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.ellipse(w * 0.05, 0, w * 0.42, h * 0.42, 0, -Math.PI * 0.4, Math.PI * 0.4);
            ctx.stroke();

            ctx.restore();
          } else if (b.type === 'smg_bullet') {
            // [FOX 45식] 고속 기관단총 탄환 (주황빛/호박색 탄도 궤적 트레이서)
            const bLen = 14;
            const bThick = b.size || 4.5;
            const tracerGrad = ctx.createLinearGradient(-bLen, 0, bLen, 0);
            tracerGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
            tracerGrad.addColorStop(0.3, 'rgba(251, 146, 60, 0.6)');
            tracerGrad.addColorStop(0.7, '#fbbf24');
            tracerGrad.addColorStop(1, '#ffffff');
            ctx.fillStyle = tracerGrad;
            ctx.fillRect(-bLen * 0.6, -bThick * 0.5, bLen, bThick);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-bLen * 0.2, -bThick * 0.25, bLen * 0.4, bThick * 0.5);
          } else if (b.type === 'fox_shield_slam') {
            // [FOX 45식: 철벽의 방어] 전방 거대 에너지 충격파 방패강타 (Shockwave Slam)
            const rad = b.size || 18;
            ctx.save();
            ctx.shadowColor = b.color || '#f59e0b';
            ctx.shadowBlur = 16;

            // 1. 방패 호형 에너지 크레센트
            ctx.strokeStyle = b.color || '#f59e0b';
            ctx.lineWidth = 4.0;
            ctx.beginPath();
            ctx.arc(0, 0, rad * 1.5, -Math.PI * 0.45, Math.PI * 0.45);
            ctx.stroke();

            // 2. 내부 플라즈마 그라데이션
            const slamGrad = ctx.createRadialGradient(0, 0, rad * 0.2, 0, 0, rad * 1.5);
            slamGrad.addColorStop(0, '#ffffff');
            slamGrad.addColorStop(0.4, b.color || '#f59e0b');
            slamGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
            ctx.fillStyle = slamGrad;
            ctx.beginPath();
            ctx.arc(0, 0, rad * 1.5, -Math.PI * 0.45, Math.PI * 0.45);
            ctx.lineTo(-rad * 0.5, 0);
            ctx.closePath();
            ctx.fill();

            // 3. 전기 스파크 아크
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.moveTo(rad * 0.5, -rad * 1.0);
            ctx.lineTo(rad * 1.2, 0);
            ctx.lineTo(rad * 0.5, rad * 1.0);
            ctx.stroke();
            ctx.restore();
          } else if (b.type === 'fox_offensive_shift') {
            // [FOX 45식: 공세 전환] 초고속 날카로운 철갑 관통 침상 탄환
            const rad = b.size || 14;
            ctx.save();
            ctx.shadowColor = '#fb923c';
            ctx.shadowBlur = 12;

            // 1. 날카로운 유선형 관통 침
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#ea580c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(rad * 2.2, 0);
            ctx.lineTo(-rad * 1.2, -rad * 0.45);
            ctx.lineTo(-rad * 0.5, 0);
            ctx.lineTo(-rad * 1.2, rad * 0.45);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // 2. 오렌지 잔상 추진 플라즈마
            const thrustGrad = ctx.createLinearGradient(0, 0, -rad * 2.5, 0);
            thrustGrad.addColorStop(0, '#fb923c');
            thrustGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
            ctx.fillStyle = thrustGrad;
            ctx.fillRect(-rad * 2.2, -rad * 0.25, rad * 2.0, rad * 0.5);
            ctx.restore();
          } else {
            // AR, HG, MG 일반 탄환
            if (b.isPeerBullet) {
              ctx.fillStyle = b.peerColor || '#f43f5e';
            } else {
              ctx.fillStyle = b.color;
            }
            ctx.beginPath();
            ctx.arc(0, 0, b.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          ctx.restore();
        }
      });

      // 8-2. [RG: 빛의 검/각성 : 슈퍼노바] 4초 거대 관통 레이저 빔 렌더링
      const activeLaserPlayers = [];
      if (player.rgAwakeFiring) activeLaserPlayers.push(player);
      if (remotePlayer.isActive && remotePlayer.rgAwakeFiring) activeLaserPlayers.push(remotePlayer);

      activeLaserPlayers.forEach(p => {
        const originX = p.x + (p.rgAwakeFacing > 0 ? p.width + 15 : -15);
        const originY = p.y + p.height * 0.58;
        const originScreenX = originX - camera.x;
        const targetScreenX = p.rgAwakeFacing > 0 ? canvas.width + 400 : -400;
        const beamStartX = p.rgAwakeFacing > 0 ? originScreenX : targetScreenX;
        const beamWidth = Math.abs(targetScreenX - originScreenX);

        ctx.save();
        // 1) 외곽 거대 청색/시안 발광 에너지 (두께 52px)
        const outerGlow = ctx.createLinearGradient(0, originY - 26, 0, originY + 26);
        outerGlow.addColorStop(0, 'rgba(56, 189, 248, 0)');
        outerGlow.addColorStop(0.3, 'rgba(56, 189, 248, 0.45)');
        outerGlow.addColorStop(0.5, 'rgba(14, 165, 233, 0.9)');
        outerGlow.addColorStop(0.7, 'rgba(56, 189, 248, 0.45)');
        outerGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = outerGlow;
        ctx.fillRect(beamStartX, originY - 26, beamWidth, 52);

        // 2) 중층 고밀도 네온 레이저 (두께 24px)
        const midGlow = ctx.createLinearGradient(0, originY - 12, 0, originY + 12);
        midGlow.addColorStop(0, 'rgba(224, 242, 254, 0.2)');
        midGlow.addColorStop(0.5, 'rgba(186, 230, 253, 0.95)');
        midGlow.addColorStop(1, 'rgba(224, 242, 254, 0.2)');
        ctx.fillStyle = midGlow;
        ctx.fillRect(beamStartX, originY - 12, beamWidth, 24);

        // 3) 중심부 순백색 플라즈마 초고열 코어 (두께 10px)
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.fillRect(beamStartX, originY - 5, beamWidth, 10);
        ctx.shadowBlur = 0;

        // 4) 빔을 따라 흐르는 플라즈마 펄스 파동 링들
        const pulseTime = Date.now() * 0.02;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 2.5;
        for (let ring = 0; ring < 8; ring++) {
          const ringOffset = ((pulseTime * 120 + ring * 160) % Math.max(100, beamWidth));
          const rx = p.rgAwakeFacing > 0 ? (originScreenX + ringOffset) : (originScreenX - ringOffset);
          if (rx >= -50 && rx <= canvas.width + 50) {
            ctx.beginPath();
            ctx.ellipse(rx, originY, 10, 22 + Math.sin(pulseTime + ring) * 6, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // 5) 총구 집속 플라즈마 버스트 구체
        const muzzleRad = 22 + Math.sin(Date.now() * 0.03) * 5;
        const muzzleGrad = ctx.createRadialGradient(originScreenX, originY, 2, originScreenX, originY, muzzleRad);
        muzzleGrad.addColorStop(0, '#ffffff');
        muzzleGrad.addColorStop(0.5, '#38bdf8');
        muzzleGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
        ctx.fillStyle = muzzleGrad;
        ctx.beginPath();
        ctx.arc(originScreenX, originY, muzzleRad, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // 9. 폭발 효과 (스플래시)
      explosions.forEach(exp => {
        const eScreenX = exp.x - camera.x;
        ctx.save();
        ctx.globalAlpha = Math.max(0, exp.alpha);
        ctx.fillStyle = exp.color;
        ctx.beginPath();
        ctx.arc(eScreenX, exp.y, exp.radius, 0, Math.PI * 2);
        ctx.fill();

        // 폭발 중심 밝은 코어
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(eScreenX, exp.y, exp.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 9.5. [선도부장] 특수 파티클 렌더링 (튀는 탄피, 플라즈마 스파크, 지면 분진 - 렌더링 최적화)
      if (specialParticles.length > 0) {
        ctx.save();
        specialParticles.forEach(p => {
          const pScreenX = p.x - camera.x;
          if (pScreenX < -60 || pScreenX > canvas.width + 60) return;
          ctx.globalAlpha = Math.max(0, p.alpha);

          if (p.type === 'spark') {
            // 고에너지 플라즈마 비산 스파크 (가장 빈번하므로 save/restore 없이 경량 렌더링)
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size;
            ctx.beginPath();
            ctx.moveTo(pScreenX, p.y);
            ctx.lineTo(pScreenX - p.vx * 1.5, p.y - p.vy * 1.5);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(pScreenX, p.y, p.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.type === 'casing') {
            // 달아오른 황금빛/보라빛 배출 탄피 (회전)
            ctx.save();
            ctx.translate(pScreenX, p.y);
            ctx.rotate(p.rot || 0);
            ctx.fillStyle = p.color || '#fde047';
            ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 1;
            ctx.strokeRect(-p.width / 2, -p.height / 2, p.width, p.height);
            ctx.restore();
          } else if (p.type === 'dust') {
            // 지면 반동 분진 & 링
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(pScreenX, p.y, p.size * (1 + (1 - p.alpha) * 0.8), 0, Math.PI * 2);
            ctx.fill();
          }
        });
        ctx.restore();
      }

      // 10. 피격 텍스트 파티클
      textParticles.forEach(p => {
        const tScreenX = p.x - camera.x;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.font = 'bold 14px monospace';
        ctx.fillText(p.text, tScreenX, p.y);
        ctx.globalAlpha = 1.0;
      });

      // 카메라 줌 & 틸트 매트릭스 복구 (UI 오버레이는 정규 화각으로 출력)
      ctx.restore();

      // 10.5. [페이즈 1 후퇴 및 페이즈 2 전환 긴급 배너 연출]
      if (isPhase1Retreating) {
        ctx.save();
        const pulse = Math.sin(Date.now() * 0.008) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(239, 68, 68, ${0.28 * pulse})`;
        ctx.fillRect(0, 0, canvas.width, 46);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, 46);

        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText('🚨 [EMERGENCY RETREAT] 카이텐저 연합 전원 후퇴 중! (20% 도주선 돌파) 🚨', canvas.width / 2, 29);
        ctx.restore();
      }

      // 11. [신규 UI] 화면 외곽 엣지 타겟 핀 레이더 (오프스크린 보스/동료 위치 추적)
      drawOffscreenTargetPins();
    }

    function drawOffscreenTargetPins() {
      const groundY = canvas.height - (typeof GROUND_OFFSET !== 'undefined' ? GROUND_OFFSET : 60);
      const viewLeft = camera.x;
      const viewRight = camera.x + canvas.width;
      const playerCenterX = player.x + player.width / 2;

      // 1. 카이텐저 5인방 (1페이즈 보스들) - 화면 밖으로 나갈 때 색상별 핀 렌더링
      kaitenzers.forEach(k => {
        if (!k.isSpawned || k.isDead) return;

        const kCenterX = k.x + k.size / 2;
        const isOffLeft = (kCenterX < viewLeft);
        const isOffRight = (kCenterX > viewRight);

        // 화면 안에 있으면 핀을 그리지 않음
        if (!isOffLeft && !isOffRight) return;

        const dir = isOffLeft ? -1 : 1;
        const offDist = isOffLeft ? (viewLeft - kCenterX) : (kCenterX - viewRight);
        const worldDist = Math.abs(kCenterX - playerCenterX);

        // 거리 비례 크기 스케일링 (가까우면 1.35배 대형, 멀수록 0.65배로 축소)
        const distFactor = Math.max(0, Math.min(1, offDist / 2000));
        const pinScale = 1.35 - distFactor * 0.7;

        // 화면 가장자리 고정 좌표 (여백 38px)
        const pinX = isOffLeft ? 38 : (canvas.width - 38);
        const kScreenY = groundY - (k.jumpY || 0) - (k.size / 2);
        const pinY = Math.max(85, Math.min(canvas.height - 75, kScreenY));

        ctx.save();

        // (A) 방향 지향 핀 쐐기 화살표
        const r = 12 * pinScale;
        ctx.fillStyle = k.color;
        ctx.beginPath();
        ctx.moveTo(pinX + dir * (r + 7 * pinScale), pinY);
        ctx.lineTo(pinX + dir * (r - 2 * pinScale), pinY - 6 * pinScale);
        ctx.lineTo(pinX + dir * (r - 2 * pinScale), pinY + 6 * pinScale);
        ctx.closePath();
        ctx.fill();

        // (B) 핀 베이스 원형 본체 (글로우 링 + 다크 코어)
        ctx.shadowColor = k.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(pinX, pinY, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
        ctx.fill();
        ctx.lineWidth = 2.2 * pinScale;
        ctx.strokeStyle = k.color;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // (C) 핀 내부 보스 이니셜 심볼
        const initial = (k.id ? k.id[0].toUpperCase() : 'K');
        ctx.font = `bold ${Math.round(11 * pinScale)}px sans-serif`;
        ctx.fillStyle = k.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initial, pinX, pinY + 0.5);

        // (D) 거리 텍스트 배지 (미터 단위)
        const distM = Math.round(worldDist / 10);
        const distText = `${distM}m`;
        ctx.font = 'bold 9px monospace';
        const textW = ctx.measureText(distText).width;
        const badgeY = pinY + r + 8;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = k.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(pinX - textW / 2 - 3, badgeY - 5, textW + 6, 12, 3);
        else ctx.rect(pinX - textW / 2 - 3, badgeY - 5, textW + 6, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(distText, pinX, badgeY + 1);

        ctx.restore();
      });

      // 2. 2페이즈 KAITEN FX Mk.0 거대 보스 - 화면 밖 전용 대형 핀
      if (typeof kaitenFx !== 'undefined' && kaitenFx.isSpawned && !kaitenFx.isDead) {
        const fxCenterX = kaitenFx.x + kaitenFx.width / 2;
        const isOffLeft = (fxCenterX < viewLeft);
        const isOffRight = (fxCenterX > viewRight);

        if (isOffLeft || isOffRight) {
          const dir = isOffLeft ? -1 : 1;
          const offDist = isOffLeft ? (viewLeft - fxCenterX) : (fxCenterX - viewRight);
          const worldDist = Math.abs(fxCenterX - playerCenterX);

          const distFactor = Math.max(0, Math.min(1, offDist / 2500));
          const pinScale = 1.5 - distFactor * 0.65; // 대형 보스 핀

          const pinX = isOffLeft ? 44 : (canvas.width - 44);
          const pinY = Math.max(120, Math.min(canvas.height - 90, groundY - 140));

          ctx.save();
          const r = 16 * pinScale;

          // 화살표
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(pinX + dir * (r + 10 * pinScale), pinY);
          ctx.lineTo(pinX + dir * (r - 3 * pinScale), pinY - 8 * pinScale);
          ctx.lineTo(pinX + dir * (r - 3 * pinScale), pinY + 8 * pinScale);
          ctx.closePath();
          ctx.fill();

          // 핀 본체
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(pinX, pinY, r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
          ctx.fill();
          ctx.lineWidth = 3 * pinScale;
          ctx.strokeStyle = '#facc15';
          ctx.stroke();
          ctx.shadowBlur = 0;

          // 보스 아이콘
          ctx.font = `${Math.round(14 * pinScale)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🤖', pinX, pinY);

          // 거리 라벨 배지
          const distM = Math.round(worldDist / 10);
          const distText = `FX [${distM}m]`;
          ctx.font = 'bold 9.5px monospace';
          const textW = ctx.measureText(distText).width;
          const badgeY = pinY + r + 9;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(pinX - textW / 2 - 4, badgeY - 5, textW + 8, 13, 3);
          else ctx.rect(pinX - textW / 2 - 4, badgeY - 5, textW + 8, 13);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#fde047';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(distText, pinX, badgeY + 1.5);

          ctx.restore();
        }
      }

      // 3. 2인 협동 모드 시 동료 스트라이커 - 화면 밖 핀
      if (currentMode === 'duo' && remotePlayer.isActive) {
        const rCenterX = remotePlayer.x + remotePlayer.width / 2;
        const isOffLeft = (rCenterX < viewLeft);
        const isOffRight = (rCenterX > viewRight);

        if (isOffLeft || isOffRight) {
          const dir = isOffLeft ? -1 : 1;
          const worldDist = Math.abs(rCenterX - playerCenterX);
          const pinScale = 1.15;
          const pinX = isOffLeft ? 38 : (canvas.width - 38);
          const pinY = Math.max(90, Math.min(canvas.height - 80, remotePlayer.y + remotePlayer.height / 2));
          const allyColor = remotePlayer.color || (myRole === 'striker' ? '#ef4444' : '#0284c7');

          ctx.save();
          const r = 12 * pinScale;

          // 화살표
          ctx.fillStyle = allyColor;
          ctx.beginPath();
          ctx.moveTo(pinX + dir * (r + 7 * pinScale), pinY);
          ctx.lineTo(pinX + dir * (r - 2 * pinScale), pinY - 6 * pinScale);
          ctx.lineTo(pinX + dir * (r - 2 * pinScale), pinY + 6 * pinScale);
          ctx.closePath();
          ctx.fill();

          // 핀 본체
          ctx.beginPath();
          ctx.arc(pinX, pinY, r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
          ctx.fill();
          ctx.lineWidth = 2 * pinScale;
          ctx.strokeStyle = allyColor;
          ctx.stroke();

          ctx.font = `${Math.round(11 * pinScale)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🛡️', pinX, pinY);

          // 거리 라벨
          const distM = Math.round(worldDist / 10);
          const distText = `동료 ${distM}m`;
          ctx.font = 'bold 9px monospace';
          const textW = ctx.measureText(distText).width;
          const badgeY = pinY + r + 8;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = allyColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(pinX - textW / 2 - 3, badgeY - 5, textW + 6, 12, 3);
          else ctx.rect(pinX - textW / 2 - 3, badgeY - 5, textW + 6, 12);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(distText, pinX, badgeY + 1);

          ctx.restore();
        }
      }
    }
