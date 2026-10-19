// ==========================================
// ui.js - 화면 전환, 로비/정비실/모달 인터랙션, HUD 갱신
// ==========================================
    // [성능 최적화] DOM 캐싱 및 더티 체킹 헬퍼 (불필요한 리플로우/리페인트 방지)
    const _domCache = {};
    function getCachedEl(id) {
      if (!_domCache[id]) _domCache[id] = document.getElementById(id);
      return _domCache[id];
    }
    function setTextIfChanged(el, text) {
      if (el && el.innerText !== text) el.innerText = text;
    }
    function setHtmlIfChanged(el, html) {
      if (el && el.innerHTML !== html) el.innerHTML = html;
    }
    function setWidthIfChanged(el, widthStr) {
      if (el && el.style.width !== widthStr) el.style.width = widthStr;
    }
    function setBgIfChanged(el, bgStr) {
      if (el && el.style.background !== bgStr) el.style.background = bgStr;
    }
    function setColorIfChanged(el, colorStr) {
      if (el && el.style.color !== colorStr) el.style.color = colorStr;
    }
    function setClassIfChanged(el, className) {
      if (el && el.className !== className) el.className = className;
    }

    function updateSupporterModeCardsUI() {
      return;
    }

    function setScreenState(state) {
      currentGameState = state;
      mainScreen.classList.add('hidden');
      duoLobbyModal.classList.add('hidden');
      maintenanceScreen.classList.add('hidden');
      topHud.classList.add('hidden');
      minimap.classList.add('hidden');
      const tacticalDeck = document.getElementById('tactical-deck');
      if (tacticalDeck) tacticalDeck.classList.add('hidden');
      const topRightHud = document.getElementById('top-right-hud');
      if (topRightHud) topRightHud.classList.remove('hidden');
      const helpModal = document.getElementById('controls-help-modal');
      if (helpModal) helpModal.classList.add('hidden');
      supporterModal.classList.add('hidden');
      const aModal = document.getElementById('armor-table-modal');
      if (aModal) aModal.classList.add('hidden');
      const sModal = document.getElementById('stats-guide-modal');
      if (sModal) sModal.classList.add('hidden');
      const selModal = document.getElementById('selection-modal');
      if (selModal) selModal.classList.add('hidden');

      if (state === 'main') {
        mainScreen.classList.remove('hidden');
      } else if (state === 'duo_lobby') {
        duoLobbyModal.classList.remove('hidden');
      } else if (state === 'maintenance') {
        maintenanceScreen.classList.remove('hidden');

        if (myRole === 'guest_striker') {
          // [2P 게스트 스트라이커 출격 정비실]
          maintTitleText.innerText = '⚙️ 출격 정비실 (2P 레드 스트라이커 - 2인 작전)';
          btnSupporterStatus.classList.remove('hidden');
          btnSupporterStatus.innerHTML = '<span>📡 1P 블루 스트라이커 현황</span>';
          if (strikerSpecView) strikerSpecView.classList.remove('hidden');
          
          // 하단 버튼 역할별 전환: 2P는 준비완료 버튼 표시, 출격 버튼 숨김
          if (btnSupporterReady) btnSupporterReady.classList.remove('hidden');
          if (btnDeployBattle) btnDeployBattle.classList.add('hidden');

          // 2인 룸 뱃지 노출
          if (duoRoomBadge) {
            duoRoomBadge.classList.remove('hidden');
            displayRoomCode.innerText = roomCode;
            displayPeerStatus.innerHTML = '<span style="color:#0284c7;">👑 1P 호스트(블루) 방 참가됨</span>';
          }

          if (maintKeyGuide) {
            maintKeyGuide.innerHTML = `
              <div>🎮 <b>2P 스트라이커 조작:</b> 이동: <span style="color:#ef4444; font-weight:bold;">A / D</span> | 점프: <span style="color:#ef4444; font-weight:bold;">Space / W</span> | 대시: <span style="color:#ef4444; font-weight:bold;">A/D 2연타</span></div>
              <div>사격: <span style="color:#facc15; font-weight:bold;">J</span> | 메인1: <span style="color:#f43f5e; font-weight:bold;">K</span> | 메인2: <span style="color:#94a3b8; font-weight:bold;">L</span> | 특수: <span style="color:#94a3b8; font-weight:bold;">S</span> | 장전: <span style="color:#22c55e; font-weight:bold;">R</span> | 무기교체: <span style="color:#a855f7; font-weight:bold;">Shift</span> | 달리기: <span style="color:#fb923c; font-weight:bold;">;</span></div>
            `;
          }
        } else {
          // [1P 호스트 스트라이커 / 솔로 출격 정비실]
          if (strikerSpecView) strikerSpecView.classList.remove('hidden');
          
          // 하단 버튼 역할별 전환: 호스트는 출격 버튼 표시, 준비 버튼 숨김
          if (btnSupporterReady) btnSupporterReady.classList.add('hidden');
          if (btnDeployBattle) btnDeployBattle.classList.remove('hidden');

          if (currentMode === 'duo') {
            btnSupporterStatus.classList.remove('hidden');
            btnSupporterStatus.innerHTML = '<span>📡 2P 레드 스트라이커 현황</span>';
            maintTitleText.innerText = '⚙️ 출격 정비실 (1P 블루 스트라이커 - 2인 작전)';
            
            // 2인 룸 뱃지 노출 및 상태 업데이트
            if (duoRoomBadge) {
              duoRoomBadge.classList.remove('hidden');
              displayRoomCode.innerText = roomCode;
              updateHostRoomStatusUI();
            }
          } else {
            btnSupporterStatus.classList.add('hidden');
            if (duoRoomBadge) duoRoomBadge.classList.add('hidden');
            maintTitleText.innerText = '⚙️ 출격 정비실 (솔로 작전)';
            // 솔로 모드는 언제든 바로 출격 가능
            btnDeployBattle.style.opacity = '1';
            btnDeployBattle.style.cursor = 'pointer';
            btnDeployBattle.innerText = '🚀 작전 출격!';
          }
          if (maintKeyGuide) {
            maintKeyGuide.innerHTML = `
              <div>🎮 <b>1P 스트라이커 조작:</b> 이동: <span style="color:#0284c7; font-weight:bold;">A / D</span> | 점프: <span style="color:#0284c7; font-weight:bold;">Space / W</span> | 대시: <span style="color:#0284c7; font-weight:bold;">A/D 2연타</span></div>
              <div>사격: <span style="color:#facc15; font-weight:bold;">J</span> | 메인1: <span style="color:#f43f5e; font-weight:bold;">K</span> | 메인2: <span style="color:#94a3b8; font-weight:bold;">L</span> | 특수: <span style="color:#94a3b8; font-weight:bold;">S</span> | 장전: <span style="color:#22c55e; font-weight:bold;">R</span> | 무기교체: <span style="color:#a855f7; font-weight:bold;">Shift</span> | 달리기: <span style="color:#fb923c; font-weight:bold;">;</span></div>
            `;
          }
        }
      } else if (state === 'battle') {
        topHud.classList.remove('hidden');
        minimap.classList.remove('hidden');
        const tacticalDeck = document.getElementById('tactical-deck');
        if (tacticalDeck) tacticalDeck.classList.remove('hidden');
        const topRightHud = document.getElementById('top-right-hud');
        if (topRightHud) topRightHud.classList.remove('hidden');
        const peerPanel = document.getElementById('peer-status-panel');
        if (peerPanel) {
          if (currentMode === 'duo') {
            peerPanel.classList.remove('hidden');
            const peerTitle = document.getElementById('peerPlayerTitle');
            const peerBadge = document.getElementById('peerHpBadge');
            if (myRole === 'guest_striker') {
              if (peerTitle) {
                peerTitle.innerText = '🛡️ 1P 스트라이커';
                peerTitle.style.color = '#0284c7';
              }
              if (peerBadge) peerBadge.style.background = '#0284c7';
              peerPanel.style.borderColor = '#0284c7';
            } else {
              if (peerTitle) {
                peerTitle.innerText = '🛡️ 2P 스트라이커';
                peerTitle.style.color = '#ef4444';
              }
              if (peerBadge) peerBadge.style.background = '#ef4444';
              peerPanel.style.borderColor = '#ef4444';
            }
          } else {
            peerPanel.classList.add('hidden');
          }
        }
      }
    }

    // 호스트 화면에서 2P 대원 접속/준비 상태에 따른 출격 버튼 UI 갱신 함수
    function updateHostRoomStatusUI() {
      if (!duoRoomBadge || currentMode !== 'duo' || myRole !== 'striker') return;

      if (!isSupporterConnected) {
        displayPeerStatus.innerHTML = '<span style="color:#f59e0b; font-weight:bold;">⏳ 2P 동료 접속 대기 중... (친구에게 방 코드를 알려주세요)</span>';
        btnDeployBattle.innerText = '⏳ 2P 동료 접속 대기 중...';
        btnDeployBattle.style.background = '#475569';
        btnDeployBattle.style.opacity = '0.6';
        btnDeployBattle.style.cursor = 'not-allowed';
      } else if (!isSupporterReady) {
        displayPeerStatus.innerHTML = '<span style="color:#38bdf8; font-weight:bold;">🟢 2P 동료 접속됨! (장비 정비 중...)</span>';
        btnDeployBattle.innerText = '🚀 2P 정비 완료 대기 중 (강제 출격 가능)';
        btnDeployBattle.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
        btnDeployBattle.style.opacity = '1';
        btnDeployBattle.style.cursor = 'pointer';
      } else {
        displayPeerStatus.innerHTML = '<span style="color:#10b981; font-weight:bold;">🏁 2P 동료 준비 완료! 출격 가능!</span>';
        btnDeployBattle.innerText = '🚀 2인 동시 작전 출격! (클릭 시 개전)';
        btnDeployBattle.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        btnDeployBattle.style.opacity = '1';
        btnDeployBattle.style.cursor = 'pointer';
      }
    }

    // 1인 클 클릭 -> 스트라이커 솔로 정비실 이동
    btnSolo.addEventListener('click', () => {
      currentMode = 'solo';
      myRole = 'striker';
      isSupporterConnected = false;
      isSupporterReady = false;
      setScreenState('maintenance');
    });

    // 2인 클 클릭 -> 2인 로비(호스팅/참여 선택) 모달 표시
    btnDuo.addEventListener('click', () => {
      currentMode = 'duo';
      setScreenState('duo_lobby');
    });

    // 로비: 메인으로 복귀
    btnDuoLobbyBack.addEventListener('click', () => {
      if (typeof cleanupPeer === 'function') cleanupPeer();
      setScreenState('main');
    });

    // 로비: 호스팅 (호스트 = 스트라이커, 원하는 방 코드 직접 지정)
    btnDuoHost.addEventListener('click', (e) => {
      e.stopPropagation();
      const codeVal = (inputHostCode.value || '').trim();
      if (!codeVal) {
        alert('개설할 방 코드를 입력해주세요!');
        inputHostCode.focus();
        return;
      }
      roomCode = codeVal;
      currentMode = 'duo';
      myRole = 'striker';
      isSupporterConnected = false;
      isSupporterReady = false;

      // 1P 호스트 2인 정비실 화면으로 즉시 전환!
      setScreenState('maintenance');

      // P2P 방 생성 패킷 전송
      if (typeof initNetworkSocket === 'function') {
        initNetworkSocket();
        sendNetPacket({
          type: 'CREATE_ROOM',
          roomCode: roomCode
        });
      }
    });

    // 로비: 참여 (참여자 = 서포터, 호스트 방 코드 입력)
    btnDuoJoin.addEventListener('click', (e) => {
      e.stopPropagation();
      const codeVal = (inputJoinCode.value || '').trim();
      if (!codeVal) {
        alert('참여할 방 코드를 입력해주세요!');
        inputJoinCode.focus();
        return;
      }
      roomCode = codeVal;
      currentMode = 'duo';
      myRole = 'guest_striker';
      isSupporterConnected = false;
      isSupporterReady = false;

      const origText = btnDuoJoin.innerText;
      btnDuoJoin.innerText = '📡 접속 시도 중...';
      setTimeout(() => {
        if (currentGameState === 'duo_lobby') {
          btnDuoJoin.innerText = origText;
        }
      }, 3500);

      // 웹소켓 연결 및 방 참가 패킷 전송
      if (typeof initNetworkSocket === 'function') {
        initNetworkSocket();
        sendNetPacket({
          type: 'JOIN_ROOM',
          roomCode: roomCode
        });
      }
    });

    // [서포터 전용]: 준비 완료 (READY) 토글 버튼 클릭 리스너
    if (btnSupporterReady) {
      btnSupporterReady.addEventListener('click', () => {
        isSupporterReady = !isSupporterReady;
        if (isSupporterReady) {
          btnSupporterReady.innerHTML = '<span>✅ 준비 완료됨 (취소하려면 클릭)</span>';
          btnSupporterReady.style.background = 'linear-gradient(135deg, #10b981, #059669)';
          btnSupporterReady.style.borderColor = '#6ee7b7';
        } else {
          btnSupporterReady.innerHTML = '<span>🏁 준비 완료 (READY)</span>';
          btnSupporterReady.style.background = 'linear-gradient(135deg, #059669, #047857)';
          btnSupporterReady.style.borderColor = '#34d399';
        }

        // 호스트에게 내 준비 상태 실시간 전송!
        sendNetPacket({
          type: 'SUPPORTER_READY',
          ready: isSupporterReady
        });

        updateHostRoomStatusUI();
      });
    }

    // [📡 동료 현황] 버튼 클릭 -> 상대방(스트라이커 or 서포터)의 실시간 세팅 팝업 모달 열기
    btnSupporterStatus.addEventListener('click', () => {
      updatePeerStatusModalUI();
      supporterModal.classList.remove('hidden');
    });

    // 동료 정비현황 모달 닫기
    supporterModalCloseBtn.addEventListener('click', () => {
      supporterModal.classList.add('hidden');
    });
    supporterModal.addEventListener('click', (e) => {
      if (e.target === supporterModal) {
        supporterModal.classList.add('hidden');
      }
    });

    // 상대방 세팅 실시간 렌더링 함수
    function updatePeerStatusModalUI() {
      const titleEl = document.getElementById('peer-modal-title-text');
      const bodyEl = document.getElementById('peer-modal-content-body');
      if (!titleEl || !bodyEl) return;

      const isHost = (myRole === 'striker');
      titleEl.innerText = isHost ? '📡 동료 2P 레드 스트라이커 정비 현황 (실시간)' : '📡 동료 1P 블루 스트라이커 정비 현황 (실시간)';
      const peerLoadout = isHost ? (window.peerGuestLoadout || playerLoadout) : (window.peerStrikerLoadout || playerLoadout);

      if (!isSupporterConnected) {
        bodyEl.innerHTML = `
          <div style="text-align: center; padding: 48px 20px; color: #94a3b8;">
            <div style="font-size: 36px; margin-bottom: 12px;">📡</div>
            <div style="font-size: 16px; font-weight: bold; color: #f59e0b; margin-bottom: 8px;">동료 스트라이커 대원 접속 대기 중</div>
            <div style="font-size: 13px; color: #64748b;">동료가 방 코드 [${roomCode}]로 접속하면 실시간 장비 세팅이 표시됩니다.</div>
          </div>
        `;
        return;
      }

      const pLoad = peerLoadout;
      bodyEl.innerHTML = `
        <!-- 1. 주무기 및 보조무기 -->
        <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 14px; margin-bottom: 16px;">
          <!-- 메인 무기 -->
          <div class="supporter-card-item" style="border-color: #facc15; background: rgba(30, 41, 59, 0.85);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="supporter-card-title" style="color: #facc15;">슬롯 1: 메인 무기 (J 공격)</span>
              <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: rgba(250, 204, 21, 0.2); border: 1px solid #facc15; color: #facc15; font-weight: bold;">주력 화기</span>
            </div>
            <span class="supporter-card-val" style="color: #facc15; font-size: 16px; margin-top: 4px;">${pLoad.slot1 ? pLoad.slot1.name : 'MG (종막의 디스트로이어)'}</span>
            <span class="supporter-card-sub" style="margin-top: 4px;">${pLoad.slot1 ? pLoad.slot1.desc : ''}</span>
            ${pLoad.slot1 && pLoad.slot1.skillName ? `<div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed rgba(255,255,255,0.15); font-size: 12px; color: #f43f5e;">⚡ <b>[메인스킬 1 (K키)] ${pLoad.slot1.skillName}</b><br><span style="color:#cbd5e1; font-size:11px;">${pLoad.slot1.skillDesc}</span></div>` : ''}
          </div>

          <!-- 보조 무기 & 메인스킬 2 -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <!-- 보조 무기 -->
            <div class="supporter-card-item">
              <span class="supporter-card-title">슬롯 7: 보조 무기 (Shift 전환)</span>
              <span class="supporter-card-val" style="color: #cbd5e1;">${pLoad.slot7 ? pLoad.slot7.name : '루거 P08'}</span>
              <span class="supporter-card-sub">${pLoad.slot7 ? pLoad.slot7.desc : ''}</span>
            </div>
            <!-- 메인스킬 2 -->
            <div class="supporter-card-item" style="border-color: #38bdf8;">
              <span class="supporter-card-title" style="color: #38bdf8;">슬롯 2: 메인스킬 2 (L키)</span>
              <span class="supporter-card-val" style="color: #38bdf8;">${pLoad.slot2 ? pLoad.slot2.name : '없음'}</span>
              <span class="supporter-card-sub">${pLoad.slot2 ? pLoad.slot2.desc : ''}</span>
            </div>
          </div>
        </div>

        <!-- 2. 보조스킬 (패시브 3종) -->
        <div style="margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 800; color: #94a3b8; margin-bottom: 8px;">🧬 보조스킬 3종 (패시브)</div>
          <div class="supporter-grid-row-3">
            <div class="supporter-card-item">
              <span class="supporter-card-title">패시브 1</span>
              <span class="supporter-card-val" style="color: #38bdf8;">${pLoad.slot3 ? pLoad.slot3.name : '미장착'}</span>
              <span class="supporter-card-sub">${pLoad.slot3 ? pLoad.slot3.desc : ''}</span>
            </div>
            <div class="supporter-card-item">
              <span class="supporter-card-title">패시브 2</span>
              <span class="supporter-card-val" style="color: #38bdf8;">${pLoad.slot4 ? pLoad.slot4.name : '미장착'}</span>
              <span class="supporter-card-sub">${pLoad.slot4 ? pLoad.slot4.desc : ''}</span>
            </div>
            <div class="supporter-card-item">
              <span class="supporter-card-title">패시브 3</span>
              <span class="supporter-card-val" style="color: #38bdf8;">${pLoad.slot5 ? pLoad.slot5.name : '미장착'}</span>
              <span class="supporter-card-sub">${pLoad.slot5 ? pLoad.slot5.desc : ''}</span>
            </div>
          </div>
        </div>

        <!-- 3. 특수스킬 -->
        <div style="margin-bottom: 16px;">
          <div class="supporter-card-item" style="border-color: #a855f7;">
            <span class="supporter-card-title" style="color: #a855f7;">슬롯 6: 특수스킬 (S키)</span>
            <span class="supporter-card-val" style="color: #c084fc;">${pLoad.slot6 ? pLoad.slot6.name : '미장착'}</span>
            <span class="supporter-card-sub">${pLoad.slot6 ? pLoad.slot6.desc : ''}</span>
          </div>
        </div>

        <!-- 4. 난이도 -->
        <div style="margin-bottom: 8px;">
          <div class="supporter-card-item" style="border-color: #facc15;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="supporter-card-title" style="color: #facc15;">총력전 난이도</span>
              <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: rgba(250, 204, 21, 0.2); border: 1px solid #facc15; color: #facc15; font-weight: bold;">${pLoad.difficulty ? pLoad.difficulty.name : 'Extreme'}</span>
            </div>
            <span class="supporter-card-sub" style="margin-top: 4px;">${pLoad.difficulty ? pLoad.difficulty.desc.split('|').join(' • ') : 'KAITEN FX Mk.0 정규 작전'}</span>
          </div>
        </div>
      `;
    }

    // 정비실 -> 메인으로 복귀
    btnBackToMain.addEventListener('click', () => {
      setScreenState('main');
    });

    // 정비실 -> 작전 출격! (인게임 시작)
    btnDeployBattle.addEventListener('click', () => {
      try {
        // 2인 모드에서 호스트인 경우 2P 스트라이커의 접속 및 준비 상태 체크
        if (currentMode === 'duo' && myRole === 'striker') {
          if (!isSupporterConnected) {
            alert(`⚠️ 아직 2P 동료가 방에 접속하지 않았습니다!\n친구가 방 코드 [${roomCode}]로 들어올 때까지 기다려주세요.`);
            return;
          } else if (!isSupporterReady) {
            const forceStart = confirm('⚠️ 2P 동료가 아직 [준비 완료] 상태가 아닙니다.\n호스트 권한으로 작전을 바로 개전하시겠습니까?');
            if (!forceStart) return;
          }
        }

        if (typeof applyMaintenanceLoadoutToPlayer === 'function') {
          applyMaintenanceLoadoutToPlayer(); // 세팅한 장비/스킬 스탯 실전 적용
        }
        if (typeof initBattleEncounter === 'function') {
          initBattleEncounter(); // 카이텐저 단독 개전 및 순차 증원 페이즈 초기화
        }

        // 2인 모드 호스트 출격 시 게스트(2P)에게도 동시 출격 신호 전송!
        if (currentMode === 'duo' && myRole === 'striker' && typeof sendNetPacket === 'function') {
          sendNetPacket({
            type: 'DEPLOY_BATTLE',
            seed: Date.now()
          });
        }

        setScreenState('battle');
        camera.x = Math.max(0, player.x - (canvas.width / 2));
        addDamageText(player.x, canvas.height - 180, currentMode === 'duo' ? '🚨 작전 개시! 2인 협동 카이텐저 레이드 개전!' : '🚨 작전 개시! 카이텐저 레이드 개전!', '#0284c7');
      } catch (err) {
        console.error('[DEPLOY ERROR]', err);
        alert('출격 처리 중 오류가 발생했습니다: ' + err.message);
      }
    });

    // 초기 화면 상태 설정

    modalCloseBtn.addEventListener('click', () => {
      selectionModal.classList.add('hidden');
    });
    selectionModal.addEventListener('click', (e) => {
      if (e.target === selectionModal) selectionModal.classList.add('hidden');
    });

    // 슬롯별 모달 열기 함수 (스트라이커 및 서포터 슬롯 모듈화 & 중복 선택 방지)
    function openSlotSelectionModal(slotId) {
      modalList.innerHTML = '';
      let items = [];
      let currentItem = null;
      let usedItemIdsInOtherSlots = new Set();

      // [1] 스트라이커 슬롯 분기
      if (slotId === 'slot1') {
        modalTitle.innerText = '메인 무기 선택';
        items = EQUIPMENT_DATABASE.slot1;
        currentItem = playerLoadout.slot1;
      } else if (slotId === 'slot7') {
        modalTitle.innerText = '보조 무기 선택';
        items = EQUIPMENT_DATABASE.slot7;
        currentItem = playerLoadout.slot7;
      } else if (slotId === 'slot6') {
        modalTitle.innerText = '소속 선택';
        items = EQUIPMENT_DATABASE.slot6;
        currentItem = playerLoadout.slot6;
      } else if (slotId === 'slot3' || slotId === 'slot4' || slotId === 'slot5') {
        modalTitle.innerText = `서브스킬 선택 (슬롯 ${slotId.replace('slot', '')})`;
        items = EQUIPMENT_DATABASE.subskills;
        currentItem = playerLoadout[slotId];

        // 스트라이커 보조스킬 중복 방지: 다른 슬롯에 이미 장착된 스킬 ID 수집
        ['slot3', 'slot4', 'slot5'].forEach(s => {
          if (s !== slotId && playerLoadout[s]) {
            usedItemIdsInOtherSlots.add(playerLoadout[s].id);
          }
        });
      } else if (slotId === 'slot8') {
        modalTitle.innerText = '작전 제약 선택';
        items = EQUIPMENT_DATABASE.slot8;
        currentItem = playerLoadout.slot8;
      } else if (slotId === 'slot9') {
        modalTitle.innerText = '작전 가호 선택';
        items = EQUIPMENT_DATABASE.slot9;
        currentItem = playerLoadout.slot9;
      } else if (slotId === 'difficulty' || slotId === 'slot_diff') {
        modalTitle.innerText = '난이도 선택';
        items = EQUIPMENT_DATABASE.difficulty;
        currentItem = playerLoadout.difficulty;
      }

      // 카드 목록 렌더링
      items.forEach(item => {
        const card = document.createElement('div');
        const isCurrent = currentItem && currentItem.id === item.id;
        const isUsedInOtherSlot = usedItemIdsInOtherSlots.has(item.id);
        const isDev = !!item.isDev;

        card.className = `modal-item-card ${isCurrent ? 'current' : ''} ${isUsedInOtherSlot ? 'disabled' : ''} ${isDev ? 'dev-card' : ''}`;
        
        let tagText = item.tag || '선택';
        let tagClass = 'modal-item-tag';
        if (isCurrent) {
          tagText = (slotId === 'difficulty' || slotId === 'slot_diff') ? '선택됨' : '장착 중';
        } else if (isDev) {
          tagText = '제작 중';
          tagClass += ' dev-tag';
        } else if (isUsedInOtherSlot) {
          tagText = '다른 슬롯 장착 중';
          tagClass += ' in-use';
        }

        const descFormatted = item.desc ? item.desc.split('|').join('<br>') : '';
        const hpTag = (slotId === 'slot1') ? `<div style="display: inline-block; font-size: 11px; padding: 2px 7px; border-radius: 4px; background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.35); margin-top: 4px; font-weight: bold;">💚 기본 체력: ${(item.hp || (item.stats && item.stats.hp) || 65000).toLocaleString()}</div>` : '';
        card.innerHTML = `
          <div class="modal-item-top">
            <span class="modal-item-name" style="color: ${item.color || '#fff'};">${item.name}</span>
            <span class="${tagClass}">${tagText}</span>
          </div>
          ${hpTag}
          <div class="modal-item-desc" style="margin-top: 4px;">${descFormatted}</div>
          ${item.skillName ? `<div style="font-size: 11px; color: #f43f5e; margin-top: 3px;"><b>[전용스킬] ${item.skillName}</b>: ${item.skillDesc}</div>` : ''}
        `;

        if (isDev) {
          card.addEventListener('click', () => {
            alert(`⚠️ "KAITEN FX MK.0" 보스의 "${item.name}" 난이도는 현재 제작 중입니다.`);
          });
        } else if (!isUsedInOtherSlot) {
          card.addEventListener('click', () => {
            selectItemForSlot(slotId, item);
            selectionModal.classList.add('hidden');
          });
        }

        modalList.appendChild(card);
      });

      selectionModal.classList.remove('hidden');
    }

    // 슬롯에 아이템 적용 및 UI 갱신 함수
    function selectItemForSlot(slotId, item) {
      // [스트라이커 슬롯 적용]
      playerLoadout[slotId] = item;

        if (slotId === 'slot1') {
          try {
            localStorage.setItem('kaiten_slot1_id', item.id);
          } catch (e) {}

          if (player.mainWeapon) {
            player.mainWeapon.id = item.id;
            player.mainWeapon.name = item.name;
          }
          if (typeof applyMaintenanceLoadoutToPlayer === 'function') {
            applyMaintenanceLoadoutToPlayer();
          }

          document.getElementById('slot-1-name').innerText = item.name;
          document.getElementById('slot-1-name').style.color = item.color || '#facc15';
          const formattedDesc = item.desc ? item.desc.split('|').map(s => {
            const trimmed = s.trim();
            if (trimmed.startsWith('• 체력:')) {
              return `<div>• 체력: <b style="color: #22c55e;">${(item.hp || (item.stats && item.stats.hp) || 65000).toLocaleString()}</b></div>`;
            }
            return `<div>${trimmed}</div>`;
          }).join('') : '';
          document.getElementById('slot-1-desc').innerHTML = formattedDesc;
          document.getElementById('slot-2-name').innerText = item.skillName;
          document.getElementById('slot-2-desc').innerHTML = item.skillDesc;

          // 메인스킬 2 동적 갱신
          const main2NameEl = document.getElementById('slot-main2-name');
          const main2DescEl = document.getElementById('slot-main2-desc');
          if (main2NameEl) {
            main2NameEl.innerText = item.skill2Name || '🔒 준비 중';
            main2NameEl.style.color = (item.skill2Name && !item.skill2Name.includes('준비')) ? (item.color || '#38bdf8') : '#94a3b8';
          }
          if (main2DescEl) {
            main2DescEl.innerHTML = item.skill2Desc ? `<div>${item.skill2Desc.split('|').join('</div><div>')}</div>` : '• 준비 중';
          }

          // 특수스킬 카드 동적 갱신
          const specNameEl = document.getElementById('slot-special-name');
          const specDescEl = document.getElementById('slot-special-desc');
          if (specNameEl) {
            specNameEl.innerText = item.specialSkillName || '미지원';
            specNameEl.style.color = item.id === 'melee_red_mist' ? '#f43f5e' : (item.id === 'rg_supernova' ? '#38bdf8' : (item.id === 'mg_destructor' ? '#c084fc' : (item.id === 'sg_bloody_gunpowder' ? '#dc2626' : (item.id === 'ar_white_fang' ? '#06b6d4' : (item.id === 'smg_fox45' ? '#f59e0b' : '#94a3b8')))));
          }
          if (specDescEl) {
            specDescEl.innerHTML = item.specialSkillDesc ? `<div>${item.specialSkillDesc.split('|').join('</div><div>')}</div>` : '• 현재 무기 특수스킬 미지원';
          }

          // [슬롯 7: 역할군 & 포지션 자동 연동]
          if (EQUIPMENT_DATABASE.slot7) {
            const matchedRole = EQUIPMENT_DATABASE.slot7.find(r => r.role === item.role && r.position === item.position) ||
                                EQUIPMENT_DATABASE.slot7.find(r => r.position === item.position) ||
                                EQUIPMENT_DATABASE.slot7[0];
            playerLoadout.slot7 = matchedRole;
            const slot7NameEl = document.getElementById('slot-7-name');
            const slot7DescEl = document.getElementById('slot-7-desc');
            if (slot7NameEl) {
              slot7NameEl.innerText = matchedRole.name;
              slot7NameEl.style.color = matchedRole.color;
            }
            if (slot7DescEl) {
              slot7DescEl.innerHTML = matchedRole.desc;
            }
          }
        } else if (slotId === 'slot7') {
          document.getElementById('slot-7-name').innerText = item.name;
          document.getElementById('slot-7-desc').innerHTML = item.desc;
        } else if (slotId === 'slot6') {
          const slot6El = document.getElementById('slot-6-name');
          slot6El.innerText = item.name;
          if (item.color) slot6El.style.color = item.color;
          document.getElementById('slot-6-desc').innerHTML = item.desc;
        } else if (slotId === 'slot3' || slotId === 'slot4' || slotId === 'slot5') {
          const num = slotId.replace('slot', '');
          document.getElementById(`slot-${num}-name`).innerText = item.name;
          document.getElementById(`slot-${num}-desc`).innerText = item.desc;
        } else if (slotId === 'slot8') {
          document.getElementById('slot-8-name').innerText = item.name;
          document.getElementById('slot-8-desc').innerText = item.desc;
        } else if (slotId === 'slot9') {
          document.getElementById('slot-9-name').innerText = item.name;
          document.getElementById('slot-9-desc').innerText = item.desc;
        } else if (slotId === 'difficulty' || slotId === 'slot_diff') {
          const diffEl = document.getElementById('slot-diff-name');
          if (diffEl) {
            diffEl.innerText = item.name;
            diffEl.style.color = item.color || '#facc15';
          }
          const badgeEl = document.getElementById('slot-diff-badge');
          if (badgeEl) {
            badgeEl.innerText = item.badge || item.name.toUpperCase();
            badgeEl.style.color = item.color || '#facc15';
            badgeEl.style.borderColor = item.color || '#facc15';
          }
          const descEl = document.getElementById('slot-diff-desc');
          if (descEl) {
            descEl.innerHTML = item.desc ? `<div>${item.desc.split('|').join('</div><div>')}</div>` : '총력전 난이도를 설정합니다.';
          }
        }

        if (typeof applyMaintenanceLoadoutToPlayer === 'function') {
          applyMaintenanceLoadoutToPlayer();
        }

        if (currentMode === 'duo' && typeof sendNetPacket === 'function') {
          sendNetPacket({
            type: 'LOADOUT_UPDATE',
            role: (myRole === 'guest_striker' ? 'guest_striker' : 'striker'),
            loadout: playerLoadout
          });
        }
    }

    // 스트라이커 슬롯 클릭 리스너 연결
    document.getElementById('slot-card-1').addEventListener('click', () => openSlotSelectionModal('slot1'));
    // 슬롯 7 (역할군 & 포지션): 상세 확인 팝업
    const slotCard7 = document.getElementById('slot-card-7');
    if (slotCard7) {
      slotCard7.addEventListener('click', () => {
        if (playerLoadout.slot7 && playerLoadout.slot7.skillDetails) {
          openSkillDetailModal(playerLoadout.slot7.skillDetails, playerLoadout.slot7.name, '역할군 & 포지션');
        } else {
          openSkillDetailModal(null, '역할군 & 포지션', '슬롯 7');
        }
      });
    }
    document.getElementById('slot-card-6').addEventListener('click', () => openSlotSelectionModal('slot6'));
    document.getElementById('slot-card-3').addEventListener('click', () => openSlotSelectionModal('slot3'));
    document.getElementById('slot-card-4').addEventListener('click', () => openSlotSelectionModal('slot4'));
    document.getElementById('slot-card-5').addEventListener('click', () => openSlotSelectionModal('slot5'));
    document.getElementById('slot-card-8').addEventListener('click', () => openSlotSelectionModal('slot8'));
    document.getElementById('slot-card-9').addEventListener('click', () => openSlotSelectionModal('slot9'));
    const slotCardDiff = document.getElementById('slot-card-diff');
    if (slotCardDiff) {
      slotCardDiff.addEventListener('click', () => openSlotSelectionModal('difficulty'));
    }

    // 스킬 상세 정보 모달 열기 (인게임 전용 모달, 시스템 alert 대체)
    function openSkillDetailModal(detailData, fallbackWeaponName, fallbackSlotLabel) {
      if (!skillDetailModal) return;

      if (!detailData) {
        skillDetailTitle.innerText = '준비 중인 스킬';
        skillDetailBadge.innerText = fallbackSlotLabel || '스킬 정보';
        skillDetailBadge.style.color = '#94a3b8';
        skillDetailBadge.style.borderColor = '#475569';
        skillDetailWeapon.innerText = fallbackWeaponName || '메인 무기';
        skillDetailBody.innerHTML = `
          <div class="skill-detail-section">
            <div class="skill-detail-section-title" style="color: #94a3b8;">◈ 안내</div>
            <div style="color: #cbd5e1; font-size: 13px;">현재 장착된 무기는 해당 슬롯의 스킬이 아직 구현되지 않았거나 준비 중입니다.</div>
          </div>
        `;
        skillDetailModal.classList.remove('hidden');
        return;
      }

      skillDetailTitle.innerText = detailData.title || '스킬 상세';
      skillDetailBadge.innerText = detailData.keyLabel || fallbackSlotLabel || '스킬 정보';
      const badgeCol = detailData.badgeColor || '#38bdf8';
      skillDetailBadge.style.color = badgeCol;
      skillDetailBadge.style.borderColor = badgeCol;
      skillDetailWeapon.innerText = fallbackWeaponName || (playerLoadout.slot1 ? playerLoadout.slot1.name : '메인 무기');

      let html = '';

      // 핵심 스탯/태그 뱃지
      if (detailData.tags && detailData.tags.length > 0) {
        html += '<div class="skill-detail-tags">';
        detailData.tags.forEach(tag => {
          html += `<span class="skill-detail-stat-tag">${tag}</span>`;
        });
        html += '</div>';
      }

      // 세부 설명 섹션 카드들
      if (detailData.sections && detailData.sections.length > 0) {
        detailData.sections.forEach(sec => {
          const formatted = sec.text.replace(/\n/g, '<br>');
          html += `
            <div class="skill-detail-section">
              <div class="skill-detail-section-title" style="color: ${badgeCol};">◈ ${sec.title}</div>
              <div style="color: #e2e8f0; font-size: 12.5px; line-height: 1.6;">${formatted}</div>
            </div>
          `;
        });
      }

      skillDetailBody.innerHTML = html;
      skillDetailModal.classList.remove('hidden');
    }

    if (skillDetailCloseBtn) {
      skillDetailCloseBtn.addEventListener('click', () => {
        skillDetailModal.classList.add('hidden');
      });
    }
    if (skillDetailConfirmBtn) {
      skillDetailConfirmBtn.addEventListener('click', () => {
        skillDetailModal.classList.add('hidden');
      });
    }
    if (skillDetailModal) {
      skillDetailModal.addEventListener('click', (e) => {
        if (e.target === skillDetailModal) {
          skillDetailModal.classList.add('hidden');
        }
      });
    }

    // [2] 메인스킬 1 클릭 -> 인게임 상세 팝업
    const slotCard2 = document.getElementById('slot-card-2');
    if (slotCard2) {
      slotCard2.addEventListener('click', () => {
        const curMain = playerLoadout.slot1;
        openSkillDetailModal(curMain ? curMain.skillDetails : null, curMain ? curMain.name : '메인 무기', '[K] 메인스킬 1');
      });
    }

    // [L] 메인스킬 2 클릭 -> 인게임 상세 팝업
    const slotCardMain2 = document.getElementById('slot-card-main2');
    if (slotCardMain2) {
      slotCardMain2.addEventListener('click', () => {
        const curMain = playerLoadout.slot1;
        openSkillDetailModal(curMain ? curMain.skill2Details : null, curMain ? curMain.name : '메인 무기', '[L] 메인스킬 2');
      });
    }

    // [S] 특수스킬 클릭 -> 인게임 상세 팝업
    const slotCardSpecial = document.getElementById('slot-card-special');
    if (slotCardSpecial) {
      slotCardSpecial.addEventListener('click', () => {
        const curMain = playerLoadout.slot1;
        openSkillDetailModal(curMain ? curMain.specialSkillDetails : null, curMain ? curMain.name : '메인 무기', '[S] 특수스킬');
      });
    }

    // 서포터 슬롯 클릭 리스너 연결
    const suppSlotMap = {
      'supp-slot-weapon': 'supp_weapon',
      'supp-slot-skill1': 'supp_skill1',
      'supp-slot-skill2': 'supp_skill2',
      'supp-slot-skill3': 'supp_skill3',
      'supp-slot-passive1': 'supp_passive1',
      'supp-slot-passive2': 'supp_passive2',
      'supp-slot-passive3': 'supp_passive3',
      'supp-slot-striking': 'supp_striking'
    };
    Object.keys(suppSlotMap).forEach(elemId => {
      const el = document.getElementById(elemId);
      if (el) {
        el.addEventListener('click', () => openSlotSelectionModal(suppSlotMap[elemId]));
      }
    });


    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      minimap.width = 280;
      minimap.height = 75;
    }
    window.addEventListener('resize', resize);
    resize();


    function updateWeaponHUD() {
      const isMain = player.activeWeaponSlot === 'main';
      const cur = isMain ? player.mainWeapon : player.subWeapon;

      const isRG = (isMain && player.mainWeapon && player.mainWeapon.id === 'rg_supernova');
      const isSG = (isMain && player.mainWeapon && player.mainWeapon.id === 'sg_bloody_gunpowder');
      const isAR = (isMain && player.mainWeapon && player.mainWeapon.id === 'ar_white_fang');
      const isSMG = (isMain && player.mainWeapon && player.mainWeapon.id === 'smg_fox45');
      const isTactical = (!isMain && player.subWeapon && player.subWeapon.id === 'hg_tactical');
      let weaponName = isTactical ? '[일반] HG (상식적 수단)' : '[일반] HG (보조 권총)';
      let weaponColor = isTactical ? '#38bdf8' : '#94a3b8';
      if (isMain) {
        if (isAR) {
          if (player.isColorActive) {
            weaponName = '[신비] AR (BLACK FANG 465)';
            weaponColor = '#64748b';
          } else {
            weaponName = '[폭발] AR (WHITE FANG 465)';
            weaponColor = '#06b6d4';
          }
        } else if (isSG) {
          weaponName = player.sgSkillActive ? `[관통] SG (기괴멸렬 [${player.sgSkillShotsLeft}/6회])` : '[관통] SG (블러디 앤 건 파우더)';
          weaponColor = '#ef4444';
        } else if (isRG) {
          if (player.isAbiEshuhActive) {
            weaponName = '[신비] RG (슈퍼노바 for 아비 에슈흐)';
            weaponColor = '#00ffff';
          } else {
            weaponName = '[신비] RG (빛의검 : 슈퍼노바)';
            weaponColor = '#38bdf8';
          }
        } else if (isSMG) {
          weaponName = player.isTacticalDefActive ? '[폭발] SMG (FOX 45식 기관단총) [🛡️전술 방어]' : '[폭발] SMG (FOX 45식 기관단총)';
          weaponColor = '#f59e0b';
        } else {
          weaponName = '[폭발] MG (종막의 디스트로이어)';
          weaponColor = '#facc15';
        }

        // 포지션 뱃지 추가 ([FRONT], [MIDDLE], [BACK])
        const posBadge = player.position ? ` [${player.position}]` : '';
        weaponName += posBadge;

        // 방어 장갑 뱃지 추가
        const armNames = { light: '경장갑', heavy: '중장갑', composite: '복합장갑', special: '특수장갑', elastic: '탄력장갑', normal: '일반' };
        const armLabel = armNames[player.armorType] || '일반';
        weaponName += ` [방어: ${armLabel}]`;
      } else {
        const armNames = { light: '경장갑', heavy: '중장갑', composite: '복합장갑', special: '특수장갑', elastic: '탄력장갑', normal: '일반' };
        const armLabel = armNames[player.armorType] || '일반';
        weaponName += ` [방어: ${armLabel}]`;
      }

      const curWepNameEl = getCachedEl('currentWeaponName');
      setTextIfChanged(curWepNameEl, weaponName);
      setColorIfChanged(curWepNameEl, weaponColor);

      const statusBadge = getCachedEl('reloadStatusBadge');
      if (statusBadge) {
        if (cur.isMelee) {
          setTextIfChanged(statusBadge, '[근접 무장: 미미크리]');
          setColorIfChanged(statusBadge, '#ef4444');
        } else if (player.isAbiEshuhActive) {
          setTextIfChanged(statusBadge, '[비행 호버링 중]');
          setColorIfChanged(statusBadge, '#38bdf8');
        } else if (player.isColorActive) {
          setTextIfChanged(statusBadge, '[무한 탄창]');
          setColorIfChanged(statusBadge, '#94a3b8');
        } else if (cur.isReloading) {
          setTextIfChanged(statusBadge, `[재장전 중... ${cur.reloadTimer.toFixed(1)}s]`);
          setColorIfChanged(statusBadge, '#ef4444');
        } else {
          setTextIfChanged(statusBadge, '[장전 완료]');
          setColorIfChanged(statusBadge, '#22c55e');
        }
      }

      const ammoCountEl = getCachedEl('ammoCountText');
      const magCountEl = getCachedEl('magCountText');
      if (cur.isMelee) {
        setTextIfChanged(ammoCountEl, '∞');
        setTextIfChanged(magCountEl, '근접 무기');
      } else if (player.isAbiEshuhActive) {
        setTextIfChanged(ammoCountEl, '∞');
        setTextIfChanged(magCountEl, '에너지');
      } else if (player.isColorActive) {
        setTextIfChanged(ammoCountEl, '∞');
        setTextIfChanged(magCountEl, '무한탄창');
      } else {
        setTextIfChanged(ammoCountEl, String(cur.ammo));
        setTextIfChanged(magCountEl, (cur.mags === Infinity || cur.mags >= 999) ? '∞ 탄창' : `${cur.mags}탄창`);
      }

      // 조준 모드 상태 갱신 (자동 / 수동)
      const aimText = getCachedEl('aimModeStatusText');
      if (aimText) {
        if (player.aimMode === 'manual') {
          setHtmlIfChanged(aimText, `조준: <b style="color:#f59e0b;">수동 [Shift]</b>`);
        } else {
          setHtmlIfChanged(aimText, `조준: <b style="color:#38bdf8;">자동 [Shift]</b>`);
        }
      }

      // 대시 상태 갱신
      const dashText = getCachedEl('dashStatusText');
      if (dashText) {
        if (player.dashTimer > 0) {
          setHtmlIfChanged(dashText, `대시: <b style="color:#f59e0b;">쿨 ${player.dashTimer.toFixed(1)}s</b>`);
        } else {
          setHtmlIfChanged(dashText, `대시: <b style="color:#22c55e;">준비완료</b>`);
        }
      }

      // 메인스킬 1 상태 갱신
      const skill1Text = getCachedEl('skill1StatusText');
      if (skill1Text) {
        if (isMain && isAR) {
          if (player.isColorActive) {
            const hasColorDrone = window.whiteFangDrones && window.whiteFangDrones.some(d => d.isColorDrone);
            if (hasColorDrone) {
              setHtmlIfChanged(skill1Text, `화력강화[K]: <b style="color:#06b6d4;">가동 중 (30s)</b>`);
            } else if (player.skillCooldown > 0) {
              setHtmlIfChanged(skill1Text, `화력강화[K]: <b style="color:#f59e0b;">쿨 ${player.skillCooldown.toFixed(1)}s</b>`);
            } else {
              setHtmlIfChanged(skill1Text, `화력강화[K]: <b style="color:#94a3b8;">준비 (HP 20%)</b>`);
            }
          } else if (player.skillCooldown > 0) {
            setHtmlIfChanged(skill1Text, `드론[K]: <b style="color:#f59e0b;">쿨 ${player.skillCooldown.toFixed(1)}s</b>`);
          } else {
            setHtmlIfChanged(skill1Text, `드론[K]: <b style="color:#06b6d4;">준비 (3C)</b>`);
          }
        } else if (isMain && isSG) {
          if (player.sgSkillActive) {
            setHtmlIfChanged(skill1Text, `기괴[K]: <b style="color:#ef4444;">강화 [${player.sgSkillShotsLeft}/6]</b>`);
          } else if (player.skillCooldown > 0) {
            setHtmlIfChanged(skill1Text, `기괴[K]: <b style="color:#f59e0b;">쿨 ${player.skillCooldown.toFixed(1)}s</b>`);
          } else {
            setHtmlIfChanged(skill1Text, `기괴[K]: <b style="color:#22c55e;">준비 (4C)</b>`);
          }
        } else if (isMain && isRG) {
          if (player.isChargingSkill) {
            setHtmlIfChanged(skill1Text, `붕괴[K]: <b style="color:#facc15;">차징 Lv.${player.chargeLevel}</b>`);
          } else if (player.skillCooldown > 0) {
            setHtmlIfChanged(skill1Text, `붕괴[K]: <b style="color:#f59e0b;">쿨 ${player.skillCooldown.toFixed(1)}s</b>`);
          } else {
            setHtmlIfChanged(skill1Text, `붕괴[K]: <b style="color:#38bdf8;">준비 (5C)</b>`);
          }
        } else if (isMain && isSMG) {
          if (player.skillCooldown > 0) {
            setHtmlIfChanged(skill1Text, `철벽[K]: <b style="color:#f59e0b;">쿨 ${player.skillCooldown.toFixed(1)}s</b>`);
          } else if (player.isTacticalDefActive) {
            setHtmlIfChanged(skill1Text, `철벽[K]: <b style="color:#f59e0b;">방패강타 (4C / 기절 4.6s)</b>`);
          } else {
            setHtmlIfChanged(skill1Text, `철벽[K]: <b style="color:#f59e0b;">준비 (3C / 기절 2.5s)</b>`);
          }
        } else if (isMain) {
          if (player.isFiringSkill) {
            setHtmlIfChanged(skill1Text, `개연[K]: <b style="color:#c084fc;">난사 중</b>`);
          } else if (player.skillCooldown > 0) {
            setHtmlIfChanged(skill1Text, `개연[K]: <b style="color:#f59e0b;">쿨 ${player.skillCooldown.toFixed(1)}s</b>`);
          } else {
            setHtmlIfChanged(skill1Text, `개연[K]: <b style="color:#c084fc;">준비 (6C)</b>`);
          }
        } else {
          setHtmlIfChanged(skill1Text, `스킬1[K]: <b style="color:#64748b;">보조무기 미지원</b>`);
        }
      }

      // 메인스킬 2 상태 갱신
      const skill2Text = getCachedEl('skill2StatusText');
      if (skill2Text) {
        if (isMain && isAR) {
          if (player.isColorActive) {
            const isHpUnder50 = (player.hp / player.maxHp) <= 0.50;
            const reqCost = isHpUnder50 ? 2 : 3;
            if (player.arSkill2Cooldown > 0) {
              setHtmlIfChanged(skill2Text, `수류탄·개[L]: <b style="color:#f59e0b;">쿨 ${player.arSkill2Cooldown.toFixed(1)}s</b>`);
            } else {
              setHtmlIfChanged(skill2Text, `수류탄·개[L]: <b style="color:#94a3b8;">준비 (${reqCost}C)</b>`);
            }
          } else if (player.arSkill2Cooldown > 0) {
            setHtmlIfChanged(skill2Text, `그레네이드[L]: <b style="color:#f59e0b;">쿨 ${player.arSkill2Cooldown.toFixed(1)}s</b>`);
          } else {
            setHtmlIfChanged(skill2Text, `그레네이드[L]: <b style="color:#06b6d4;">준비 (3C)</b>`);
          }
        } else if (isMain && isSG) {
          if (player.sgTorrentCharging) {
            setHtmlIfChanged(skill2Text, `격류[L]: <b style="color:#38bdf8;">차징 중 (${player.sgTorrentChargeTimer.toFixed(1)}s)</b>`);
          } else if (player.sgTorrentFiring) {
            setHtmlIfChanged(skill2Text, `격류[L]: <b style="color:#0284c7;">난사 [${8 - player.sgTorrentShotsLeft}/8]</b>`);
          } else if (player.sgSkill2Cooldown > 0) {
            setHtmlIfChanged(skill2Text, `격류[L]: <b style="color:#f59e0b;">쿨 ${player.sgSkill2Cooldown.toFixed(1)}s</b>`);
          } else {
            setHtmlIfChanged(skill2Text, `격류[L]: <b style="color:#22c55e;">준비 (4C)</b>`);
          }
        } else if (isMain && isRG) {
          if (player.rgAwakeCharging) {
            const isFire = player.rgAwakeChargeType === 'fire';
            setHtmlIfChanged(skill2Text, `각성[L]: <b style="color:#facc15;">${isFire ? '슈퍼노바 차징' : '충전 중'}</b>`);
          } else if (player.rgAwakeFiring) {
            setHtmlIfChanged(skill2Text, `각성[L]: <b style="color:#facc15;">레이저 발사 중!</b>`);
          } else if (player.rgAwakeStage === 0) {
            setHtmlIfChanged(skill2Text, `각성[L]: <b style="color:#38bdf8;">1단 충전 (8C)</b>`);
          } else if (player.rgAwakeStage === 1) {
            setHtmlIfChanged(skill2Text, `각성[L]: <b style="color:#38bdf8;">2단 충전 (8C)</b>`);
          } else if (player.rgAwakeStage === 2) {
            setHtmlIfChanged(skill2Text, `각성[L]: <b style="color:#facc15;">슈퍼노바 발사 (10C)</b>`);
          }
        } else if (isMain && isSMG) {
          if (player.foxSkill2Cooldown > 0) {
            setHtmlIfChanged(skill2Text, `공세[L]: <b style="color:#f59e0b;">쿨 ${player.foxSkill2Cooldown.toFixed(1)}s</b>`);
          } else if (player.isTacticalDefActive) {
            setHtmlIfChanged(skill2Text, `공세[L]: <b style="color:#f59e0b;">공세전환 (4C / 치저 -44%)</b>`);
          } else {
            setHtmlIfChanged(skill2Text, `공세[L]: <b style="color:#f59e0b;">준비 (3C / 치저 -22%)</b>`);
          }
        } else if (isMain) {
          // MG (종막의 디스트로이어)
          if (player.mgStanceTransitioning) {
            setHtmlIfChanged(skill2Text, `개연[L]: <b style="color:#c084fc;">자세 전환 중...</b>`);
          } else if (player.mgStanceActive) {
            const nextNoteName = player.mgStanceShotStage === 0 ? '1음' : (player.mgStanceShotStage === 1 ? '2음' : '종연');
            if (player.mgStanceShotDelay > 0) {
              setHtmlIfChanged(skill2Text, `개연[L]: <b style="color:#94a3b8;">딜레이 (${player.mgStanceShotDelay.toFixed(1)}s)</b>`);
            } else {
              setHtmlIfChanged(skill2Text, `개연[L]: <b style="color:#c084fc;">발사 가능 [${nextNoteName}] (${player.mgStanceTimer.toFixed(0)}s)</b>`);
            }
          } else if (player.mgSkill2Cooldown > 0) {
            setHtmlIfChanged(skill2Text, `개연[L]: <b style="color:#f59e0b;">쿨 ${player.mgSkill2Cooldown.toFixed(1)}s</b>`);
          } else {
            setHtmlIfChanged(skill2Text, `개연[L]: <b style="color:#22c55e;">준비 (10C)</b>`);
          }
        } else {
          setHtmlIfChanged(skill2Text, `스킬2[L]: <b style="color:#64748b;">보조무기 미지원</b>`);
        }
      }

      // 특수스킬 [S키] 상태 갱신
      const specialText = getCachedEl('specialStatusText');
      if (specialText) {
        if (isMain && player.mainWeapon && player.mainWeapon.id === 'mg_destructor') {
          if (player.isFiringSpecial) {
            const leftSec = Math.max(0, 7.0 - player.specialTimer);
            const phaseTag = player.specialPhase === 1 ? '1단' : (player.specialPhase === 2 ? '2단' : (player.specialIsBerserk ? '3단(초각성)' : '3단'));
            setHtmlIfChanged(specialText, `특수[S]: <b style="color:#c084fc;">선도부장 ${phaseTag} (${leftSec.toFixed(1)}s)</b>`);
          } else if (player.specialSkillUsed) {
            setHtmlIfChanged(specialText, `특수[S]: <b style="color:#64748b;">사용완료 (1회)</b>`);
          } else if (player.specialSkillUnlocked) {
            setHtmlIfChanged(specialText, `특수[S]: <b style="color:#a855f7;">선도부장 준비! (S키)</b>`);
          } else {
            const hpRatio = (player.hp / player.maxHp) * 100;
            setHtmlIfChanged(specialText, `특수[S]: <b style="color:#94a3b8;">HP 50%↓ 해금 (${hpRatio.toFixed(0)}%)</b>`);
          }
        } else if (isMain && isRG) {
          if (player.isAbiEshuhActive) {
            if (player.abiStunTimer > 0) {
              setHtmlIfChanged(specialText, `특수[S]: <b style="color:#ef4444;">과부하 기절 (${player.abiStunTimer.toFixed(1)}s)</b>`);
            } else if (player.abiFinalPhase !== 'none') {
              setHtmlIfChanged(specialText, `특수[S]: <b style="color:#00ffff;">⚡ 파이널 피니셔!</b>`);
            } else if (player.abiFinalReady) {
              setHtmlIfChanged(specialText, `특수[S]: <b style="color:#38bdf8;">파이널 준비 완료! (임의 키)</b>`);
            } else {
              setHtmlIfChanged(specialText, `특수[S]: <b style="color:#38bdf8;">아비 에슈흐 [${Math.floor(player.cost)}/200]</b>`);
            }
          } else if (player.specialSkillUsed) {
            setHtmlIfChanged(specialText, `특수[S]: <b style="color:#64748b;">사용완료 (1회)</b>`);
          } else if (player.specialSkillUnlocked) {
            setHtmlIfChanged(specialText, `특수[S]: <b style="color:#38bdf8;">아비 에슈흐 준비! (S키)</b>`);
          } else {
            const spent = player.spentCostTotal || 0;
            setHtmlIfChanged(specialText, `특수[S]: <b style="color:#94a3b8;">코스트 소모 10/300 (${spent}/10)</b>`);
          }
        } else if (isMain && isAR) {
          if (player.isColorActive) {
            if (player.calmBreathActive) {
              setHtmlIfChanged(specialText, `특수[S]: <b style="color:#ef4444;">⏳ 침착한 호흡 (${player.calmBreathTimer.toFixed(1)}s)</b>`);
            } else {
              const isHpLow = (player.hp / player.maxHp) <= 0.30;
              setHtmlIfChanged(specialText, `특수[S]: <b style="color:#64748b;">🖤 색채(色彩) 활성${isHpLow ? ' [🔥위기 본능]' : ''}</b>`);
            }
          } else if (player.specialSkillUsed) {
            setHtmlIfChanged(specialText, `특수[S]: <b style="color:#64748b;">색채 소진 (1회 완료)</b>`);
          } else {
            setHtmlIfChanged(specialText, `특수[S]: <b style="color:#475569;">🖤 색채 (사망 시 자동 발동)</b>`);
          }
        } else if (isMain && isSG) {
          if (player.isImmortalActive) {
            setHtmlIfChanged(specialText, `특수[S]: <b style="color:#ef4444;">🩸 불사 (${player.immortalTimer.toFixed(1)}s) [${player.immortalStack}/5스택]</b>`);
          } else if (player.specialSkillUsed) {
            setHtmlIfChanged(specialText, `특수[S]: <b style="color:#64748b;">불사 사용완료 (1회)</b>`);
          } else {
            setHtmlIfChanged(specialText, `특수[S]: <b style="color:#ef4444;">불사(不死) 상시 준비! [S]</b>`);
          }
        } else if (isMain && isSMG) {
          if (player.isTacticalDefActive) {
            const sVal = Math.ceil(player.tacticalShield || 0);
            const sMax = Math.ceil(player.tacticalShieldMax || 1);
            const sTimer = (player.tacticalShieldTimer || 0).toFixed(1);
            setHtmlIfChanged(specialText, `특수[S]: <b style="color:#f59e0b;">🛡️전술방패 [${sVal}/${sMax}] (${sTimer}s)</b>`);
          } else if (player.foxShieldCooldown > 0) {
            setHtmlIfChanged(specialText, `특수[S]: <b style="color:#f59e0b;">방패 쿨 ${(player.foxShieldCooldown || 0).toFixed(1)}s</b>`);
          } else {
            setHtmlIfChanged(specialText, `특수[S]: <b style="color:#f59e0b;">🛡️전술방패 준비! (4C / S키)</b>`);
          }
        } else {
          setHtmlIfChanged(specialText, `특수[S]: <b style="color:#64748b;">미지원</b>`);
        }
      }

      // 코스트 바 갱신
      const costTextEl = getCachedEl('costText');
      const costBarEl = getCachedEl('costBar');
      if (costTextEl) setTextIfChanged(costTextEl, `${Math.floor(player.cost)} / ${player.maxCost}`);
      if (costBarEl) setWidthIfChanged(costBarEl, `${(player.cost / player.maxCost) * 100}%`);
    }

    // [신규 UI] 무기별 스킬 기본 정보 및 코스트 설정 (유저 스케치 반영)
    const WEAPON_SKILL_CONFIG = {
      mg_destructor: {
        skill1: { name: '[폭발] 종막: 이스보셋', cost: 6 },
        skill2: { name: '[폭발] 개연 : 이스보셋', cost: 10 },
        special: { name: '[폭발] 선도부장', cost: 0, isSpecial: true, canUse: p => (p.hp / p.maxHp <= 0.50) && !p.specialSkillUsed }
      },
      rg_supernova: {
        skill1: { name: '[신비] 밸런스 붕괴', cost: 5 },
        skill2: { name: '[신비] 슈퍼노바 방출', cost: 10 },
        special: { name: '[신비] 시스템 : 아비 에슈흐', cost: 0, isSpecial: true, canUse: p => !p.specialSkillUsed && (p.spentCostTotal >= 150) }
      },
      sg_bloody_gunpowder: {
        skill1: { name: '[관통] 기괴멸렬', cost: 4 },
        skill2: { name: '[신비] 격류 난사', cost: 4 },
        special: { name: '[폭발] 불사(不死)', cost: 0, isSpecial: true, canUse: p => !p.specialSkillUsed }
      },
      ar_white_fang: {
        skill1: { name: '[폭발] 드론 소환', cost: 3 },
        skill2: { name: '[신비] 라이딩 그레네이드', cost: 3 },
        special: { name: '[신비] 테러화(恐怖化)', cost: 0, isSpecial: true, canUse: p => p.isColorActive || !p.specialSkillUsed }
      },
      smg_fox45: {
        skill1: { name: '[폭발] 철벽의 방어', cost: 3 },
        skill2: { name: '[폭발] 공세 전환', cost: 2 },
        special: { name: '[폭발] 전술 방패 전개', cost: 4, isSpecial: true, canUse: p => (p.foxShieldCooldown <= 0) && (p.cost >= 4) }
      },
      melee_red_mist: {
        skill1: { name: '[일반] 전환', cost: 1 },
        skill2: { name: '[일반] 기합 / 돌진', cost: 4 },
        special: { name: '[일반] 대절단 - 세로 / E.G.O 개화', cost: 12, isSpecial: true, canUse: p => true }
      }
    };

    // [신규 UI] 좌측 하단 전술 스킬 덱 & 15블록 사선 코스트 바 실시간 업데이트
    function updateTacticalDeck() {
      const deckEl = getCachedEl('tactical-deck');
      if (!deckEl || deckEl.classList.contains('hidden')) return;

      const curW = (player.activeWeaponSlot === 'main' ? player.mainWeapon : player.subWeapon) || player.mainWeapon;
      if (!curW) return;

      // 1. 상단 무기/탄약 칩 갱신
      const nameEl = getCachedEl('deck-weapon-name');
      const curAmmoEl = getCachedEl('deck-ammo-cur');
      const magEl = getCachedEl('deck-ammo-mag');
      const aimBadgeEl = getCachedEl('deck-aim-badge');

      if (nameEl) setTextIfChanged(nameEl, curW.name || '무기');
      if (curAmmoEl) {
        if (curW.isMelee) {
          setTextIfChanged(curAmmoEl, '∞');
          setColorIfChanged(curAmmoEl, '#ef4444');
        } else if (curW.isReloading) {
          setTextIfChanged(curAmmoEl, '장전 중');
          setColorIfChanged(curAmmoEl, '#f59e0b');
        } else {
          setTextIfChanged(curAmmoEl, `${curW.ammo}`);
          setColorIfChanged(curAmmoEl, curW.ammo <= 5 ? '#ef4444' : '#38bdf8');
        }
      }
      if (magEl) {
        if (curW.isMelee) {
          setTextIfChanged(magEl, '근접');
        } else {
          setTextIfChanged(magEl, (curW.mags === Infinity || curW.mags == null) ? '∞' : `${curW.mags}`);
        }
      }
      if (aimBadgeEl) {
        setTextIfChanged(aimBadgeEl, player.aimMode === 'manual' ? '[Shift] 수동' : '[Shift] 자동');
        setColorIfChanged(aimBadgeEl, player.aimMode === 'manual' ? '#f59e0b' : '#38bdf8');
      }

      // 붉은안개(미미크리) 전용 스택/자세/개화 상태 칩 갱신
      const redMistStackEl = getCachedEl('deck-redmist-stack');
      if (redMistStackEl) {
        if (curW.id === 'melee_red_mist') {
          if (redMistStackEl.classList.contains('hidden')) redMistStackEl.classList.remove('hidden');
          const stanceKorean = player.redMistStance === 'vertical' ? '종베기' : (player.redMistStance === 'thrust' ? '찌르기' : '횡베기');
          const streakText = (player.redMistConsecutiveBonusRatio > 0)
            ? ` | 🎯연속+${Math.round(player.redMistConsecutiveBonusRatio * 100)}%(${player.redMistTargetStreak}타)`
            : (player.redMistTargetStreak > 0 ? ` | 🎯연속 ${player.redMistTargetStreak}/3타` : '');

          if (player.egoExhaustTimer > 0) {
            setTextIfChanged(redMistStackEl, `😵 탈진 기절 [${player.egoExhaustTimer.toFixed(1)}s]`);
            redMistStackEl.style.color = '#94a3b8';
            redMistStackEl.style.borderColor = 'rgba(148, 163, 184, 0.4)';
            redMistStackEl.style.boxShadow = 'none';
          } else if (player.isEgoActive) {
            setTextIfChanged(redMistStackEl, `🔴 E.G.O 개화 [${(player.redMistStack || 0).toFixed(1)}] | ${stanceKorean}${streakText}`);
            redMistStackEl.style.color = '#f87171';
            redMistStackEl.style.borderColor = 'rgba(239, 68, 68, 0.8)';
            redMistStackEl.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.5)';
          } else if (player.egoPassiveSpeedBuff) {
            setTextIfChanged(redMistStackEl, `🩸 탈진 패시브 (이속+5%, 코스트10%) | ${stanceKorean}${streakText}`);
            redMistStackEl.style.color = '#fbbf24';
            redMistStackEl.style.borderColor = 'rgba(251, 191, 36, 0.5)';
            redMistStackEl.style.boxShadow = 'none';
          } else {
            setTextIfChanged(redMistStackEl, `🩸 붉은안개 [${(player.redMistStack || 0).toFixed(1)}/100] | ${stanceKorean}${streakText}`);
            redMistStackEl.style.color = '#f87171';
            redMistStackEl.style.borderColor = 'rgba(239, 68, 68, 0.45)';
            redMistStackEl.style.boxShadow = '0 0 6px rgba(220, 38, 38, 0.3)';
          }
        } else {
          if (!redMistStackEl.classList.contains('hidden')) redMistStackEl.classList.add('hidden');
        }
      }

      // 2. 15개 코스트 사선 세그먼트 생성 및 점등
      const segmentsTrack = getCachedEl('deck-cost-segments');
      if (segmentsTrack && segmentsTrack.children.length === 0) {
        for (let i = 0; i < 15; i++) {
          const seg = document.createElement('div');
          seg.className = 'cost-seg';
          segmentsTrack.appendChild(seg);
        }
      }
      if (segmentsTrack) {
        const curCost = Math.floor(player.cost || 0);
        if (window._lastCostSegment !== curCost) {
          window._lastCostSegment = curCost;
          const children = segmentsTrack.children;
          for (let i = 0; i < children.length; i++) {
            if (i < curCost) {
              if (!children[i].classList.contains('filled')) children[i].classList.add('filled');
            } else {
              if (children[i].classList.contains('filled')) children[i].classList.remove('filled');
            }
          }
        }
      }
      const curCostText = getCachedEl('deck-current-cost');
      if (curCostText) {
        setTextIfChanged(curCostText, String(Math.floor(player.cost || 0)));
      }

      // 3. 4개 스킬 카드 슬롯 동적 갱신
      const wCfg = WEAPON_SKILL_CONFIG[curW.id] || {
        skill1: { name: curW.skillName || '메인1', cost: 4 },
        skill2: { name: curW.skill2Name || '메인2', cost: 6 },
        special: { name: curW.specialSkillName || '특수', cost: 0, isSpecial: true, canUse: () => true }
      };

      let s1Name = wCfg.skill1.name;
      let s1Cost = wCfg.skill1.cost;
      let s2Name = wCfg.skill2.name;
      let s2Cost = wCfg.skill2.cost;
      let specName = wCfg.special.name;
      let specCost = wCfg.special.cost;
      let specCan = wCfg.special.canUse ? wCfg.special.canUse(player) : false;

      // 아비 에슈흐 상태 시 전용 스킬명/코스트
      if (player.isAbiEshuhActive) {
        s1Name = '[신비] 용기의 마법';
        s1Cost = 5;
        s2Name = '[신비] 빛의 난사';
        s2Cost = 10;
        specName = player.abiFinalCanTrigger ? '[신비] 피니셔 발동' : '[신비] 아비 에슈흐';
        specCost = 0;
        specCan = player.abiFinalCanTrigger;
      } else if (player.isColorActive) {
        // 테러화 상태 시 전용 스킬명/코스트
        s1Name = '[신비] 화력 강화';
        s1Cost = 0;
        s2Name = '[신비] 수류탄·개(改)';
        s2Cost = (player.hp / player.maxHp <= 0.50) ? 2 : 3;
        specName = '[신비] 테러화(恐怖化)';
        specCost = 0;
        specCan = false;
      } else if (curW.id === 'smg_fox45') {
        // FOX 45식: 전술 보호막 연계 동적 코스트 (1스킬 3/4, 2스킬 2/3)
        const hasShield = player.foxShieldActive && player.tacticalShield > 0;
        s1Cost = hasShield ? 4 : 3;
        s2Cost = hasShield ? 3 : 2;
      } else if (curW.id === 'rg_supernova') {
        // RG 1스킬 차징 단계별 코스트
        if (player.rgChargeStage >= 2) s1Cost = 10;
      } else if (curW.id === 'mg_destructor') {
        if (player.mgStanceActive) {
          s2Name = '[폭발] 이스보셋 사격';
          s2Cost = 0;
        }
      } else if (curW.id === 'melee_red_mist') {
        const stanceKorean = player.redMistStance === 'vertical' ? '종베기' : (player.redMistStance === 'thrust' ? '찌르기' : '횡베기');
        s1Name = `[일반] 전환 (${stanceKorean})`;
        s1Cost = player.isEgoActive ? 0 : 1;

        if (player.redMistStance === 'thrust') {
          s2Name = '[일반] 돌진';
          s2Cost = player.redMistThrustFreeCost ? 0 : (player.isEgoActive ? 7 : 5);
        } else {
          s2Name = '[일반] 기합';
          s2Cost = player.isEgoActive ? 6 : 4;
        }

        if (!player.isEgoActive) {
          if (player.redMistStack >= 100) {
            specName = '[일반] E.G.O 개화';
            specCost = 0;
            specCan = true;
          } else {
            specName = `[일반] 대절단-세로 (${(player.redMistStack || 0).toFixed(1)}/100)`;
            specCost = Math.max(8, 12 - Math.floor((player.redMistStack || 0) / 20));
            specCan = (player.cost >= specCost);
          }
        } else {
          if (player.redMistStance === 'thrust') {
            specName = `[일반] 대절단-세로 (스택 ${(player.redMistStack || 0).toFixed(1)})`;
            specCost = 8;
          } else {
            specName = `[일반] 대절단-가로 (스택 ${(player.redMistStack || 0).toFixed(1)})`;
            specCost = 12;
          }
          specCan = (player.cost >= specCost);
        }
      }

      const isStunned = (player.stunTimer > 0) || (player.abiStunTimer > 0) || (player.egoExhaustTimer > 0) || (player.redMistKihapStunSelfTimer > 0);

      // 카드 1: 메인스킬 1 (K)
      let s1Cooldown = curW.id === 'melee_red_mist' ? 0 : (player.skillCooldown || 0);
      let s1CanUse = !isStunned && (player.cost >= s1Cost);
      if (curW.id === 'ar_white_fang' && player.isColorActive) {
        const hasColorDrone = window.whiteFangDrones && window.whiteFangDrones.some(d => d.isColorDrone);
        if (hasColorDrone) {
          s1CanUse = false;
        }
      }
      updateDeckSkillCard(1, s1Name, s1Cost, {
        cooldown: s1Cooldown,
        canUse: s1CanUse
      });

      // 카드 2: 메인스킬 2 (L)
      let s2Cooldown = player.arSkill2Cooldown || player.foxSkill2Cooldown || 0;
      if (curW.id === 'melee_red_mist') {
        s2Cooldown = player.redMistSkill2Cooldown || 0;
      }
      updateDeckSkillCard(2, s2Name, s2Cost, {
        cooldown: s2Cooldown,
        canUse: !isStunned && (player.cost >= s2Cost)
      });

      // 카드 3: 특수스킬 (S)
      const specCd = curW.id === 'smg_fox45' ? (player.foxShieldCooldown || 0) : 0;
      updateDeckSkillCard(3, specName, specCost, {
        cooldown: specCd,
        canUse: !isStunned && specCan,
        isSpecial: true
      });

      // 카드 4: 대시/달리기 (;)
      updateDeckSkillCard(4, player.isRunning ? '달리기 ON' : '대시 / 달리기', 0, {
        cooldown: 0,
        canUse: !isStunned,
        isZeroCost: true
      });
    }

    function updateDeckSkillCard(slotNum, name, cost, state) {
      const cardEl = getCachedEl(`deck-skill-${slotNum}`);
      const nameEl = getCachedEl(`deck-name-${slotNum}`);
      const badgeEl = getCachedEl(`deck-cost-badge-${slotNum}`);
      const cdOverlay = getCachedEl(`deck-cd-${slotNum}`);

      if (!cardEl) return;
      if (nameEl) setTextIfChanged(nameEl, name);
      if (badgeEl) {
        setTextIfChanged(badgeEl, String(cost));
        const targetBadgeClass = state.isSpecial ? 'deck-cost-badge special-cost' : (cost === 0 ? 'deck-cost-badge zero-cost' : 'deck-cost-badge');
        setClassIfChanged(badgeEl, targetBadgeClass);
      }

      if (state.cooldown && state.cooldown > 0) {
        if (!cardEl.classList.contains('disabled')) {
          cardEl.classList.add('disabled');
          cardEl.classList.remove('ready');
        }
        if (cdOverlay) {
          if (cdOverlay.classList.contains('hidden')) cdOverlay.classList.remove('hidden');
          const cdText = cdOverlay.querySelector('.deck-cd-text');
          if (cdText) setTextIfChanged(cdText, `${state.cooldown.toFixed(1)}s`);
        }
      } else {
        if (cdOverlay && !cdOverlay.classList.contains('hidden')) cdOverlay.classList.add('hidden');
        if (state.canUse) {
          if (!cardEl.classList.contains('ready')) {
            cardEl.classList.remove('disabled');
            cardEl.classList.add('ready');
          }
        } else {
          if (!cardEl.classList.contains('disabled')) {
            cardEl.classList.add('disabled');
            cardEl.classList.remove('ready');
          }
        }
      }
    }

    function updateUI() {
      // [1페이즈 -> 2페이즈 전면 화면 암전 전환 오버레이 동기화] - 컷신 조기 리턴보다 먼저 실행!
      const transOverlay = getCachedEl('phase-transition-overlay');
      if (transOverlay) {
        let alpha = 0;
        if (window.phase2Cutscene && window.phase2Cutscene.active && typeof window.phase2Cutscene.fadeAlpha !== 'undefined') {
          alpha = window.phase2Cutscene.fadeAlpha;
        } else if (typeof window.phaseTransitionAlpha !== 'undefined') {
          alpha = window.phaseTransitionAlpha;
        }
        if (alpha > 0.01) {
          if (transOverlay.classList.contains('hidden')) transOverlay.classList.remove('hidden');
          const alphaStr = alpha.toFixed(2);
          if (transOverlay.style.opacity !== alphaStr) transOverlay.style.opacity = alphaStr;
        } else {
          if (!transOverlay.classList.contains('hidden')) transOverlay.classList.add('hidden');
          if (transOverlay.style.opacity !== '0') transOverlay.style.opacity = '0';
        }
      }

      // [연출 컷씬 재생 중 모든 인게임 UI 완전 숨김 처리]
      const isCutsceneActive = (window.phase1Cutscene && window.phase1Cutscene.active) || 
                               (window.phase2Cutscene && window.phase2Cutscene.active);

      const topHud = getCachedEl('top-hud');
      const tacticalDeck = getCachedEl('tactical-deck');
      const topRightHud = getCachedEl('top-right-hud');
      const minimap = getCachedEl('minimap');
      const bossHud = getCachedEl('ba-boss-hud');

      if (isCutsceneActive) {
        if (topHud && !topHud.classList.contains('hidden')) topHud.classList.add('hidden');
        if (tacticalDeck && !tacticalDeck.classList.contains('hidden')) tacticalDeck.classList.add('hidden');
        if (topRightHud && !topRightHud.classList.contains('hidden')) topRightHud.classList.add('hidden');
        if (minimap && !minimap.classList.contains('hidden')) minimap.classList.add('hidden');
        if (bossHud && !bossHud.classList.contains('hidden')) bossHud.classList.add('hidden');
        return; // 컷신 중에는 세부 DOM 조작 스킵
      } else if (currentGameState === 'battle') {
        if (topHud && topHud.classList.contains('hidden')) topHud.classList.remove('hidden');
        if (tacticalDeck && tacticalDeck.classList.contains('hidden')) tacticalDeck.classList.remove('hidden');
        if (topRightHud && topRightHud.classList.contains('hidden')) topRightHud.classList.remove('hidden');
        if (minimap && minimap.classList.contains('hidden')) minimap.classList.remove('hidden');
        if (bossHud && bossHud.classList.contains('hidden')) bossHud.classList.remove('hidden');
      }

      // 플레이어 무기, 탄약, 코스트(2.5초마다 자연회복) HUD 매 프레임 실시간 동기화
      updateWeaponHUD();
      updateTacticalDeck();

      const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
      if (playerHpBar) {
        setWidthIfChanged(playerHpBar, `${hpPct}%`);
        const hpBg = (hpPct <= 20) ? 'linear-gradient(90deg, #dc2626, #ef4444)' : ((hpPct <= 50) ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #0284c7, #38bdf8)');
        setBgIfChanged(playerHpBar, hpBg);
      }
      setTextIfChanged(playerHpText, `${player.hp.toLocaleString()} / ${player.maxHp.toLocaleString()}`);

      // 로컬 플레이어 타이틀 및 배지 색상 업데이트
      const myTitleEl = getCachedEl('myPlayerTitle');
      const myBadgeEl = getCachedEl('playerHpBadge');
      if (myTitleEl) {
        if (myRole === 'guest_striker') {
          setTextIfChanged(myTitleEl, '🛡️ 2P 스트라이커 (나)');
          setColorIfChanged(myTitleEl, '#ef4444');
          if (myBadgeEl) setBgIfChanged(myBadgeEl, '#ef4444');
        } else {
          setTextIfChanged(myTitleEl, currentMode === 'duo' ? '🛡️ 1P 스트라이커 (나)' : '🛡️ 스트라이커');
          setColorIfChanged(myTitleEl, '#0284c7');
          if (myBadgeEl) setBgIfChanged(myBadgeEl, '#0284c7');
        }
      }
      if (myBadgeEl) {
        setTextIfChanged(myBadgeEl, player.hp <= 0 ? '전투 불능' : `HP: ${player.hp.toLocaleString()}`);
      }

      // ========================================================
      // [블루아카이브 총력전 스타일] 통합 보스 체력바 HUD 갱신
      // ========================================================
      if (bossHud) {
        const isP2 = typeof kaitenFx !== 'undefined' && (kaitenFx.isSpawned || isPhase2Active);

        // 페이즈 전환 감지 시 잔상 게이지 리셋
        if (typeof window._lastBossPhase === 'undefined' || window._lastBossPhase !== isP2) {
          window._lastBossPhase = isP2;
          window._smoothDamagePct = 100;
        }

        const maxHp = isP2 ? (kaitenFx.maxHp || 7500000) : 5000000;
        let totalKaitenHp = 0;
        for (let ki = 0; ki < kaitenzers.length; ki++) {
          const k = kaitenzers[ki];
          if (!k.isDead && k.hp > 0) totalKaitenHp += k.hp;
        }
        const currentHp = isP2 ? Math.max(0, kaitenFx.hp) : totalKaitenHp;
        const totalLines = isP2 ? 50 : 34; // 1페이즈 x34줄, 2페이즈 x50줄

        // 경장갑(Light Armor) 공식 4색 순환 팔레트
        const LIGHT_PALETTE = ['#dc2626', '#f97316', '#ef4444', '#f43f5e'];

        // 1. 좌측 초상화 및 보스 이름/장갑 뱃지 갱신
        const bossIconEl = getCachedEl('ba-boss-icon');
        const bossNameEl = getCachedEl('ba-boss-name');

        if (isP2) {
          if (bossIconEl) setTextIfChanged(bossIconEl, '🤖');
          if (bossNameEl) setTextIfChanged(bossNameEl, 'KAITEN FX Mk.0');
        } else {
          if (bossIconEl) setTextIfChanged(bossIconEl, '🍣');
          if (bossNameEl) setTextIfChanged(bossNameEl, 'KAITENZERS (카이텐저 연합)');
        }

        // 2. 다중 레이어 체력바 연산 (x34 / x50)
        const hpPerLine = maxHp / totalLines;
        let currentLine = Math.ceil(currentHp / hpPerLine);
        if (currentHp <= 0) currentLine = 0;

        let lineHp = currentHp - (currentLine - 1) * hpPerLine;
        if (currentLine <= 0) lineHp = 0;
        const linePct = Math.max(0, Math.min(100, (lineHp / hpPerLine) * 100));

        // 경장갑 레드 4색 순환
        const currentColor = currentLine > 0 ? LIGHT_PALETTE[(currentLine - 1) % 4] : 'transparent';
        const nextColor = currentLine > 1 ? LIGHT_PALETTE[(currentLine - 2) % 4] : '#1e293b';

        // 피격 데미지 잔상 (Damage Trail) 부드러운 감소
        if (typeof window._smoothDamagePct === 'undefined') window._smoothDamagePct = 100;
        if (window._smoothDamagePct < linePct) {
          window._smoothDamagePct = linePct;
        } else {
          window._smoothDamagePct += (linePct - window._smoothDamagePct) * 0.14;
        }

        const hpNumEl = getCachedEl('ba-hp-num');
        const hpLinesEl = getCachedEl('ba-hp-lines');
        const hpFillEl = getCachedEl('ba-hp-fill');
        const hpUnderlayEl = getCachedEl('ba-hp-underlay');
        const hpDamageEl = getCachedEl('ba-hp-damage');

        if (hpNumEl) {
          const numStr = isPhase1Retreating 
            ? `🚨 비상 퇴각 중! ${currentHp.toLocaleString()} / ${maxHp.toLocaleString()}`
            : `${currentHp.toLocaleString()} / ${maxHp.toLocaleString()}`;
          setTextIfChanged(hpNumEl, numStr);
        }
        if (hpLinesEl) {
          setTextIfChanged(hpLinesEl, `x ${currentLine}`);
        }
        if (hpFillEl) {
          setWidthIfChanged(hpFillEl, `${linePct.toFixed(1)}%`);
          setBgIfChanged(hpFillEl, currentColor);
        }
        if (hpUnderlayEl) {
          setBgIfChanged(hpUnderlayEl, nextColor);
        }
        if (hpDamageEl) {
          setWidthIfChanged(hpDamageEl, `${window._smoothDamagePct.toFixed(1)}%`);
        }

        // 3. 우측 하단 3칸 사선 ATG 게이지 블록 (2페이즈에만 실시간 연속 충전)
        const atgVal = isP2 ? (kaitenFx.atg || 0) : 0;
        const fill1 = Math.min(100, Math.max(0, (atgVal / 33.33) * 100));
        const fill2 = Math.min(100, Math.max(0, ((atgVal - 33.33) / 33.33) * 100));
        const fill3 = Math.min(100, Math.max(0, ((atgVal - 66.66) / 33.34) * 100));

        const el1 = getCachedEl('ba-atg-fill-1');
        const el2 = getCachedEl('ba-atg-fill-2');
        const el3 = getCachedEl('ba-atg-fill-3');
        const seg1 = getCachedEl('ba-atg-seg-1');
        const seg2 = getCachedEl('ba-atg-seg-2');
        const seg3 = getCachedEl('ba-atg-seg-3');

        if (el1) setWidthIfChanged(el1, `${fill1.toFixed(1)}%`);
        if (el2) setWidthIfChanged(el2, `${fill2.toFixed(1)}%`);
        if (el3) setWidthIfChanged(el3, `${fill3.toFixed(1)}%`);

        if (seg1) setClassIfChanged(seg1, 'ba-atg-seg' + (fill1 >= 99 ? ' active' : ''));
        if (seg2) setClassIfChanged(seg2, 'ba-atg-seg' + (fill2 >= 99 ? ' active' : ''));
        if (seg3) setClassIfChanged(seg3, 'ba-atg-seg' + (fill3 >= 99 ? ' warning' : (fill3 > 0 ? ' active' : '')));

        // 4. [보스 격파 시 체력바 페이드 아웃 소멸 연출]
        const isDefeated = isP2 && (kaitenFx.hp <= 0 || kaitenFx.isDead);
        if (isDefeated) {
          // 보스 체력이 다한 후 0.4초 동안 0 게이지를 보여준 뒤 스르륵 페이드 아웃
          if (window.victoryTimer && window.victoryTimer >= 0.4) {
            if (!bossHud.classList.contains('defeated')) {
              bossHud.classList.add('defeated');
            }
          }
        } else {
          if (bossHud.classList.contains('defeated')) {
            bossHud.classList.remove('defeated');
          }
        }
      }

      // 동료 스트라이커 종합 상태 패널 실시간 동기화 (2인 모드 시)
      const peerPanel = document.getElementById('peer-status-panel');
      if (peerPanel) {
        if (currentMode === 'duo') {
          peerPanel.classList.remove('hidden');
          const rHp = remotePlayer.hp;
          const rMaxHp = remotePlayer.maxHp || 10000;
          const rHpPct = Math.max(0, (rHp / rMaxHp) * 100);

          const peerHpBar = document.getElementById('peerHpBar');
          const peerHpText = document.getElementById('peerHpText');
          const peerHpBadge = document.getElementById('peerHpBadge');
          const peerCostText = document.getElementById('peerCostText');
          const peerCostBar = document.getElementById('peerCostBar');
          const peerWeaponName = document.getElementById('peerWeaponName');
          const peerAmmoText = document.getElementById('peerAmmoText');

          if (peerHpBar) peerHpBar.style.width = `${rHpPct}%`;
          if (peerHpText) peerHpText.innerText = `${rHp.toLocaleString()} / ${rMaxHp.toLocaleString()}`;
          if (peerHpBadge) {
            peerHpBadge.innerText = rHp <= 0 ? '전투 불능' : `HP: ${rHp.toLocaleString()}`;
          }
          if (peerCostText) {
            peerCostText.innerText = `${Math.floor(remotePlayer.cost || 0)} / ${remotePlayer.maxCost || 15}`;
          }
          if (peerCostBar) {
            peerCostBar.style.width = `${((remotePlayer.cost || 0) / (remotePlayer.maxCost || 15)) * 100}%`;
          }
          if (peerWeaponName) {
            const wName = remotePlayer.activeWeaponSlot === 'sub'
              ? (remotePlayer.subWeapon ? remotePlayer.subWeapon.name : '보조무기')
              : (remotePlayer.mainWeapon ? remotePlayer.mainWeapon.name : '주무기');
            peerWeaponName.innerText = wName;
          }
          if (peerAmmoText) {
            peerAmmoText.innerText = remotePlayer.isActive ? '동기화 완료' : '대기 중';
          }
        } else {
          peerPanel.classList.add('hidden');
        }
      }
    }

    // 로컬 스토리지에 저장된 무기 세팅 복원 및 초기 UI 동기화
    try {
      const savedSlot1Id = localStorage.getItem('kaiten_slot1_id');
      if (savedSlot1Id) {
        const found = EQUIPMENT_DATABASE.slot1.find(w => w.id === savedSlot1Id);
        if (found) {
          selectItemForSlot('slot1', found);
        } else {
          selectItemForSlot('slot1', playerLoadout.slot1);
        }
      } else {
        selectItemForSlot('slot1', playerLoadout.slot1);
      }
    } catch (e) {
      selectItemForSlot('slot1', playerLoadout.slot1);
    }

    // ==========================================
    // [신규 상성표 & 전투 스탯 가이드 모달 이벤트 바인딩]
    // ==========================================
    const armorModal = document.getElementById('armor-table-modal');
    const btnOpenArmor = document.getElementById('btn-open-armor-table');
    const btnCloseArmor = document.getElementById('armor-table-close-btn');
    const btnConfirmArmor = document.getElementById('armor-table-confirm-btn');

    if (btnOpenArmor && armorModal) {
      btnOpenArmor.addEventListener('click', () => {
        armorModal.classList.remove('hidden');
      });
      const closeArmor = () => armorModal.classList.add('hidden');
      if (btnCloseArmor) btnCloseArmor.addEventListener('click', closeArmor);
      if (btnConfirmArmor) btnConfirmArmor.addEventListener('click', closeArmor);
      armorModal.addEventListener('click', (e) => {
        if (e.target === armorModal) closeArmor();
      });
    }

    const statsModal = document.getElementById('stats-guide-modal');
    const btnOpenStats = document.getElementById('btn-open-stats-guide');
    const btnCloseStats = document.getElementById('stats-guide-close-btn');
    const btnConfirmStats = document.getElementById('stats-guide-confirm-btn');
    const tabSimple = document.getElementById('tab-stats-simple');
    const tabComplex = document.getElementById('tab-stats-complex');
    const panelSimple = document.getElementById('panel-stats-simple');
    const panelComplex = document.getElementById('panel-stats-complex');

    if (btnOpenStats && statsModal) {
      btnOpenStats.addEventListener('click', () => {
        statsModal.classList.remove('hidden');
      });
      const closeStats = () => statsModal.classList.add('hidden');
      if (btnCloseStats) btnCloseStats.addEventListener('click', closeStats);
      if (btnConfirmStats) btnConfirmStats.addEventListener('click', closeStats);
      statsModal.addEventListener('click', (e) => {
        if (e.target === statsModal) closeStats();
      });

      // 탭 전환 이벤트 (간단 요약 vs 정밀 공식)
      if (tabSimple && tabComplex && panelSimple && panelComplex) {
        tabSimple.addEventListener('click', () => {
          tabSimple.classList.add('active');
          tabComplex.classList.remove('active');
          panelSimple.classList.remove('hidden');
          panelComplex.classList.add('hidden');
        });

        tabComplex.addEventListener('click', () => {
          tabComplex.classList.add('active');
          tabSimple.classList.remove('active');
          panelComplex.classList.remove('hidden');
          panelSimple.classList.add('hidden');
        });
      }
    }
    // [신규 UI] 조작키 도움말(=/+) 팝업 토글 & 닫기 제어
    const controlsHelpModal = document.getElementById('controls-help-modal');
    const btnOpenControlsHelp = document.getElementById('btn-open-controls-help');
    const btnCloseControlsHelp = document.getElementById('btn-close-controls-help');

    function toggleControlsHelp(forceOpen = null) {
      if (!controlsHelpModal) return;
      if (forceOpen === true) {
        controlsHelpModal.classList.remove('hidden');
      } else if (forceOpen === false) {
        controlsHelpModal.classList.add('hidden');
      } else {
        controlsHelpModal.classList.toggle('hidden');
      }
    }
    window.toggleControlsHelp = toggleControlsHelp;

    if (btnOpenControlsHelp) {
      btnOpenControlsHelp.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleControlsHelp();
      });
    }
    if (btnCloseControlsHelp) {
      btnCloseControlsHelp.addEventListener('click', () => toggleControlsHelp(false));
    }
    if (controlsHelpModal) {
      controlsHelpModal.addEventListener('click', (e) => {
        if (e.target === controlsHelpModal) toggleControlsHelp(false);
      });
    }

    // UI 초기화 완료
    updateWeaponHUD();

    // ==========================================
    // [신규 UI] 블루아카이브 총력전 스타일 승리 결산 모달 (VICTORY) 제어
    // ==========================================
    const victoryModal = document.getElementById('victory-modal');
    const btnVictoryConfirm = document.getElementById('btn-victory-confirm');

    function showVictoryModal() {
      if (!victoryModal) return;

      const stats = window.battleStats || {
        damageDealt: 0,
        damageTaken: 0,
        deaths: 0,
        peerDamageDealt: 0,
        peerDamageTaken: 0,
        peerDeaths: 0,
        startTime: performance.now(),
        clearTimeSeconds: 0
      };

      // 클리어 시간 계산
      const clearTimeSec = Math.floor(stats.clearTimeSeconds || ((performance.now() - (stats.startTime || performance.now())) / 1000));
      const mins = Math.floor(clearTimeSec / 60);
      const secs = clearTimeSec % 60;
      const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      const timeEl = document.getElementById('victory-clear-time');
      if (timeEl) timeEl.innerText = timeStr;

      // EX CLEAR 판정: 아무도 사망하지 않았으면 EX CLEAR, 한 명이라도 사망 시 CLEAR
      const totalDeaths = (stats.deaths || 0) + (stats.peerDeaths || 0);
      const gradeBadge = document.getElementById('victory-grade-badge');
      if (gradeBadge) {
        if (totalDeaths === 0) {
          gradeBadge.className = 'victory-grade-badge ex-clear';
          gradeBadge.innerText = '★ EX CLEAR ★';
        } else {
          gradeBadge.className = 'victory-grade-badge normal-clear';
          gradeBadge.innerText = 'CLEAR';
        }
      }

      // 1P 통계 바인딩
      const p1RoleEl = document.getElementById('victory-p1-role');
      const p1StatusEl = document.getElementById('victory-p1-status');
      const p1DmgDealtEl = document.getElementById('victory-p1-dmg-dealt');
      const p1DmgTakenEl = document.getElementById('victory-p1-dmg-taken');
      const p1DeathsEl = document.getElementById('victory-p1-deaths');

      if (p1RoleEl) p1RoleEl.innerText = (myRole === 'guest_striker') ? '2P 스트라이커 (나)' : '1P 스트라이커 (나)';
      if (p1StatusEl) {
        const isDead = (stats.deaths || 0) > 0;
        p1StatusEl.innerText = isDead ? '전사' : '생존';
        p1StatusEl.className = `player-status-tag ${isDead ? 'dead' : ''}`;
      }
      if (p1DmgDealtEl) p1DmgDealtEl.innerText = Math.round(stats.damageDealt || 0).toLocaleString();
      if (p1DmgTakenEl) p1DmgTakenEl.innerText = Math.round(stats.damageTaken || 0).toLocaleString();
      if (p1DeathsEl) p1DeathsEl.innerText = `${stats.deaths || 0}회`;

      // 2P 통계 바인딩 (멀티플레이 시)
      const p2Card = document.getElementById('victory-p2-card');
      if (currentMode === 'duo' && p2Card) {
        p2Card.classList.remove('hidden');
        const p2RoleEl = document.getElementById('victory-p2-role');
        const p2StatusEl = document.getElementById('victory-p2-status');
        const p2DmgDealtEl = document.getElementById('victory-p2-dmg-dealt');
        const p2DmgTakenEl = document.getElementById('victory-p2-dmg-taken');
        const p2DeathsEl = document.getElementById('victory-p2-deaths');

        if (p2RoleEl) p2RoleEl.innerText = (myRole === 'guest_striker') ? '1P 스트라이커 (동료)' : '2P 스트라이커 (동료)';
        if (p2StatusEl) {
          const isPeerDead = (stats.peerDeaths || 0) > 0;
          p2StatusEl.innerText = isPeerDead ? '전사' : '생존';
          p2StatusEl.className = `player-status-tag ${isPeerDead ? 'dead' : ''}`;
        }
        if (p2DmgDealtEl) p2DmgDealtEl.innerText = Math.round(stats.peerDamageDealt || 0).toLocaleString();
        if (p2DmgTakenEl) p2DmgTakenEl.innerText = Math.round(stats.peerDamageTaken || 0).toLocaleString();
        if (p2DeathsEl) p2DeathsEl.innerText = `${stats.peerDeaths || 0}회`;
      } else if (p2Card) {
        p2Card.classList.add('hidden');
      }

      victoryModal.classList.remove('hidden');
    }
    window.showVictoryModal = showVictoryModal;
    window.updateVictoryModalStats = showVictoryModal;

    if (btnVictoryConfirm) {
      btnVictoryConfirm.addEventListener('click', () => {
        if (victoryModal) victoryModal.classList.add('hidden');
        // 메인 화면으로 복귀
        if (typeof setScreenState === 'function') {
          setScreenState('main');
        } else {
          location.reload();
        }
      });
    }
