// ==========================================
// network.js - 실시간 WebRTC 순수 P2P 클라이언트 엔진 (PeerJS 기반)
// ==========================================
let peer = null;
let peerConn = null;
let isNetworkConnected = false;
const pendingPackets = [];
const PEER_ROOM_PREFIX = 'kaiten-v2-';

// 동료 플레이어의 실시간 장비 세팅 보관
window.peerStrikerLoadout = null;
window.peerSupporterLoadout = null;
window.peerSupporterMode = 'ground';

// STUN 서버 설정 (Google + Twilio 초고속 무료 STUN)
const PEER_CONFIG = {
  debug: 1,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ]
  }
};

// 기존 ui.js 코드와의 하위 호환을 위한 더미 함수
function initNetworkSocket() {}

// 1P 호스트 P2P 룸 생성
function startHostPeerRoom(code) {
  cleanupPeer();
  roomCode = code;
  const peerId = PEER_ROOM_PREFIX + code;
  console.log(`[P2P] 1P 호스트 룸 생성 시도: ${peerId}`);

  try {
    peer = new Peer(peerId, PEER_CONFIG);
  } catch (e) {
    console.error('[P2P] PeerJS 생성 오류:', e);
    alert('P2P 라이브러리 초기화 실패. 인터넷 연결을 확인해주세요.');
    return;
  }

  peer.on('open', (id) => {
    console.log('[P2P] 1P 호스트 룸 개설 성공! ID:', id);
    isNetworkConnected = true;
    if (displayPeerStatus) {
      displayPeerStatus.innerHTML = '<span style="color:#38bdf8; font-weight:bold;">📡 2P 동료 접속 대기 중...</span>';
    }
    handleNetworkMessage({ type: 'ROOM_CREATED', roomCode: code });
  });

  peer.on('connection', (conn) => {
    console.log('[P2P] 2P 게스트가 방에 접속했습니다!');
    peerConn = conn;
    setupDataConnection(conn);
  });

  peer.on('error', (err) => {
    console.error('[P2P] 호스트 에러:', err);
    if (err.type === 'unavailable-id') {
      alert(`방 코드 [${code}]는 현재 이미 사용 중입니다.\n다른 방 코드로 입력해주세요 (예: ${code}1)!`);
      setScreenState('duo_lobby');
    } else {
      alert(`P2P 네트워크 에러 [${err.type}]: ${err.message || ''}`);
    }
  });

  peer.on('close', () => {
    isNetworkConnected = false;
  });
}

// 2P 게스트 P2P 참가 (호스트 연결 지연 시 최대 4회 자동 재시도)
function startGuestPeerRoom(code) {
  cleanupPeer();
  roomCode = code;
  const targetPeerId = PEER_ROOM_PREFIX + code;
  console.log(`[P2P] 2P 게스트 방 참가 시도 -> 타겟 호스트: ${targetPeerId}`);

  const btnJoin = document.getElementById('btn-duo-join');
  if (btnJoin) {
    btnJoin.innerText = '📡 접속 시도 중...';
    btnJoin.style.opacity = '0.7';
  }

  try {
    peer = new Peer(null, PEER_CONFIG);
  } catch (e) {
    console.error('[P2P] PeerJS 생성 오류:', e);
    if (btnJoin) {
      btnJoin.innerText = '작전실 참가하기';
      btnJoin.style.opacity = '1';
    }
    alert('P2P 라이브러리 초기화 실패. 인터넷 연결을 확인해주세요.');
    return;
  }

  let attemptCount = 0;
  const maxAttempts = 4;
  let isConnected = false;

  function tryConnect() {
    if (isConnected || !peer || peer.destroyed) return;
    attemptCount++;
    console.log(`[P2P] 호스트 연결 시도 (${attemptCount}/${maxAttempts})...`);
    
    if (btnJoin) btnJoin.innerText = `📡 방 찾는 중... (${attemptCount}/${maxAttempts})`;

    peerConn = peer.connect(targetPeerId);
    setupDataConnection(peerConn, () => {
      isConnected = true;
      if (btnJoin) {
        btnJoin.innerText = '작전실 참가하기';
        btnJoin.style.opacity = '1';
      }
    });
  }

  peer.on('open', (myId) => {
    console.log('[P2P] 게스트 Peer 준비 완료! ID:', myId);
    tryConnect();
  });

  peer.on('error', (err) => {
    console.error('[P2P] 게스트 에러:', err);

    if (err.type === 'peer-unavailable') {
      if (attemptCount < maxAttempts && !isConnected) {
        console.log('[P2P] 호스트 등록 확인 중... 1.5초 후 자동 재시도');
        setTimeout(tryConnect, 1500);
        return;
      }
      if (btnJoin) {
        btnJoin.innerText = '작전실 참가하기';
        btnJoin.style.opacity = '1';
      }
      alert(`방 [${code}]를 찾을 수 없습니다.\n호스트가 [방 만들기 시작]을 먼저 누르고 정비실에 들어가 있는지 확인해주세요!`);
    } else {
      if (btnJoin) {
        btnJoin.innerText = '작전실 참가하기';
        btnJoin.style.opacity = '1';
      }
      alert(`P2P 연결 에러 [${err.type}]: ${err.message || ''}`);
    }
  });
}

// 1:1 WebRTC 데이터 채널 이벤트 핸들러 바인딩
function setupDataConnection(conn, onOpenCb) {
  let isHandled = false;
  function handleOpen() {
    if (isHandled) return;
    isHandled = true;
    isNetworkConnected = true;
    if (typeof onOpenCb === 'function') onOpenCb();
    console.log('[P2P] 1:1 직통 WebRTC 데이터 채널 연결 성공!');

    // 대기 큐 패킷 전송
    while (pendingPackets.length > 0) {
      const pkt = pendingPackets.shift();
      try {
        conn.send(pkt);
      } catch (e) {
        console.error('[P2P] 큐 패킷 전송 실패:', e);
      }
    }

    if (myRole === 'striker') {
      // 1P 호스트: 2P 게스트 입장 처리
      handleNetworkMessage({ type: 'PEER_CONNECTED' });
    } else {
      // 2P 게스트: 입장 성공 처리 (정비실 전환)
      handleNetworkMessage({ type: 'JOIN_SUCCESS', roomCode: roomCode });
    }
  }

  if (conn.open) {
    handleOpen();
  } else {
    conn.on('open', handleOpen);
  }

  conn.on('data', (data) => {
    let parsed = data;
    if (typeof data === 'string') {
      try {
        parsed = JSON.parse(data);
      } catch (e) {}
    }
    handleNetworkMessage(parsed);
  });

  conn.on('close', () => {
    isNetworkConnected = false;
    console.log('[P2P] P2P 데이터 채널 연결 종료');
    if (myRole === 'striker') {
      handleNetworkMessage({ type: 'PEER_DISCONNECTED' });
    } else {
      handleNetworkMessage({ type: 'HOST_DISCONNECTED' });
    }
  });

  conn.on('error', (err) => {
    console.error('[P2P] 데이터 채널 오류:', err);
  });
}

// P2P 인스턴스 정리
function cleanupPeer() {
  if (peerConn) {
    try { peerConn.close(); } catch (e) {}
    peerConn = null;
  }
  if (peer) {
    try { peer.destroy(); } catch (e) {}
    peer = null;
  }
  isNetworkConnected = false;
  pendingPackets.length = 0;
}

window.addEventListener('beforeunload', () => {
  cleanupPeer();
});

// 실시간 패킷 전송 래퍼
function sendNetPacket(obj) {
  // 특수 패킷 (방 생성 / 참가) 인터셉트
  if (obj.type === 'CREATE_ROOM') {
    startHostPeerRoom(obj.roomCode);
    return;
  }
  if (obj.type === 'JOIN_ROOM') {
    startGuestPeerRoom(obj.roomCode);
    return;
  }

  if (peerConn && peerConn.open) {
    peerConn.send(obj);
  } else {
    pendingPackets.push(obj);
  }
}

// 수신된 네트워크 패킷 처리 핸들러
function handleNetworkMessage(data) {
  // [1] 방 생성 완료
  if (data.type === 'ROOM_CREATED') {
    console.log('[NET] 호스트 방 생성 완료:', data.roomCode);
    myRole = 'striker';
    player.color = '#0284c7';
    remotePlayer.color = '#ef4444';
    updateHostRoomStatusUI();
  }

  // [2] 게스트 참가 성공 (2P 스트라이커 입장)
  else if (data.type === 'JOIN_SUCCESS') {
    console.log('[NET] 2P 스트라이커 참가 성공:', data.roomCode);
    myRole = 'guest_striker';
    player.color = '#ef4444'; // 2P는 레드!
    remotePlayer.color = '#0284c7'; // 동료 1P는 블루!
    isSupporterConnected = true;
    isSupporterReady = false;
    setScreenState('maintenance');

    // 입장 즉시 내 스트라이커 장비 세팅을 호스트에게 전송
    sendNetPacket({
      type: 'LOADOUT_UPDATE',
      role: 'guest_striker',
      loadout: playerLoadout
    });
  }

  // [3] 게스트 참가 실패
  else if (data.type === 'JOIN_ERROR') {
    alert(data.message);
  }

  // [4] 호스트 화면: 2P 스트라이커 접속 알림 수신
  else if (data.type === 'PEER_CONNECTED') {
    isSupporterConnected = true;
    isSupporterReady = false;
    updateHostRoomStatusUI();
    addDamageText(canvas.width / 2, 100, '👋 2P 스트라이커 대원이 작전실에 접속했습니다!', '#ef4444');

    // 1P 호스트 장비 세팅을 2P에게 전송
    sendNetPacket({
      type: 'LOADOUT_UPDATE',
      role: 'striker',
      loadout: playerLoadout
    });
  }

  // [5] 호스트 화면: 2P가 [준비 완료] / [취소] 누름
  else if (data.type === 'SUPPORTER_READY_CHANGED') {
    isSupporterReady = data.ready;
    updateHostRoomStatusUI();
    addDamageText(canvas.width / 2, 120, data.ready ? '🏁 2P 스트라이커 준비 완료!' : '⏳ 2P 스트라이커 준비 대기 중', data.ready ? '#10b981' : '#f59e0b');
  }

  // [6] 정비실 장비/스킬 변경 동기화 수신
  else if (data.type === 'LOADOUT_UPDATE') {
    if (data.role === 'striker') {
      window.peerStrikerLoadout = data.loadout;
      console.log('[NET] 1P 스트라이커 세팅 수신:', data.loadout);
    } else {
      window.peerGuestLoadout = data.loadout;
      console.log('[NET] 2P 스트라이커 세팅 수신:', data.loadout);
    }
    if (data.loadout && data.loadout.slot1) {
      remotePlayer.mainWeapon.id = data.loadout.slot1.id;
      remotePlayer.mainWeapon.name = data.loadout.slot1.name;
    }
    if (data.loadout && data.loadout.slot7) {
      remotePlayer.subWeapon.id = data.loadout.slot7.id;
      remotePlayer.subWeapon.name = data.loadout.slot7.name;
    }
    if (typeof updatePeerStatusModalUI === 'function') {
      updatePeerStatusModalUI();
    }
  }

  // [7] 2P 화면: 호스트가 [작전 출격!] 누름 -> 동시 개전!
  else if (data.type === 'DEPLOY_BATTLE_START') {
    applyMaintenanceLoadoutToPlayer();
    initBattleEncounter();
    setScreenState('battle');
    camera.x = Math.max(0, player.x - (canvas.width / 2));
    addDamageText(player.x, player.y - 35, '🚨 [동시 출격!] 작전 개전!', '#38bdf8');
  }

  // [8] 상대방 퇴장
  else if (data.type === 'PEER_DISCONNECTED') {
    isSupporterConnected = false;
    isSupporterReady = false;
    remotePlayer.isActive = false;
    window.peerGuestLoadout = null;
    updateHostRoomStatusUI();
    alert('⚠️ 2P 스트라이커의 연결이 끊어졌습니다.');
  } else if (data.type === 'HOST_DISCONNECTED') {
    remotePlayer.isActive = false;
    window.peerStrikerLoadout = null;
    alert('⚠️ 호스트가 방을 나갔습니다. 메인 화면으로 돌아갑니다.');
    setScreenState('main');
  }

  // [9] 인게임 실시간 동기화 (SYNC)
  else if (data.type === 'SYNC') {
    handleInGameSync(data);
  }

  // [10] 2P 게스트 -> 1P 호스트: 적 피격 대미지 확정 패킷
  else if (data.type === 'ENEMY_DAMAGE') {
    handleEnemyDamageNetPacket(data);
  }

  // [11] 1P 호스트 -> 2P 게스트: 적 탄환 생성 패킷
  else if (data.type === 'ENEMY_BULLET') {
    handleEnemyBulletNetPacket(data);
  }
}

// 2P 게스트가 적 타격 시 1P 호스트가 권위적으로 대미지를 적용하는 함수
function handleEnemyDamageNetPacket(data) {
  if (myRole !== 'striker') return; // 오직 호스트만 적 체력의 최종 권한을 가짐
  const groundY = canvas.height - GROUND_OFFSET;

  if (data.targetType === 'kaiten') {
    const targetK = kaitenzers.find(k => k.id === data.targetId);
    if (targetK && targetK.isSpawned && !targetK.isDead) {
      targetK.hp = Math.max(0, targetK.hp - data.damage);
      const textX = targetK.x + targetK.size / 2;
      const textY = groundY - (targetK.jumpY || 0) - targetK.size;
      if (data.isCrit) {
        addDamageText(textX, textY - 20, `[2P] CRIT! ${data.damage.toLocaleString()}`, '#fbbf24');
      } else {
        addDamageText(textX, textY - 10, `[2P] -${data.damage.toLocaleString()}`, '#f43f5e');
      }
      if (data.stunDuration) {
        targetK.stunTimer = Math.max(targetK.stunTimer || 0, data.stunDuration);
        addDamageText(textX, textY - 35, `⚡ 기절 [${data.stunDuration.toFixed(1)}s]`, '#facc15');
      }
      if (data.critResistDebuff) {
        targetK.critDmgResistDebuff = data.critResistDebuff;
        targetK.critDmgResistDebuffTimer = 10.0;
        addDamageText(textX, textY - 35, `🎯 치저 -${data.critResistDebuff}%!`, '#fb923c');
      }
      if (data.atkDebuffRatio) {
        targetK.atkDebuffTimer = data.atkDebuffTimer || 10.0;
        targetK.atkDebuffRatio = data.atkDebuffRatio;
        addDamageText(textX, textY - 45, `🔻 [ATK -${Math.round(data.atkDebuffRatio * 100)}%]`, '#38bdf8');
      }
      if (targetK.hp <= 0) {
        targetK.hp = 0;
        targetK.isDead = true;
        targetK.isActive = false;
        if (targetK.id === 'yellow') targetK.laserState = 'none';
        addDamageText(textX, textY - 25, `💀 [${targetK.name} 무력화!]`, '#94a3b8');
      }
    }
  } else if (data.targetType === 'kaiten_fx' && typeof kaitenFx !== 'undefined' && kaitenFx.isSpawned && !kaitenFx.isDead) {
    kaitenFx.hp = Math.max(0, kaitenFx.hp - data.damage);
    if (data.part && kaitenFx.parts && kaitenFx.parts[data.part] && !kaitenFx.parts[data.part].isBroken) {
      const curPart = kaitenFx.parts[data.part];
      curPart.hp = Math.max(0, curPart.hp - data.damage);
      if (curPart.hp <= 0) {
        curPart.hp = 0;
        curPart.isBroken = true;
        addDamageText(kaitenFx.x + kaitenFx.width / 2, groundY - 220, `💥 [${curPart.name}] 파괴 완료!`, curPart.color);
      }
    }
    const fxCenterX = kaitenFx.x + kaitenFx.width / 2;
    if (data.isCrit) {
      addDamageText(fxCenterX, groundY - 200, `[2P] CRIT! ${data.damage.toLocaleString()}`, '#fbbf24');
    } else {
      addDamageText(fxCenterX, groundY - 180, `[2P] -${data.damage.toLocaleString()}`, '#f43f5e');
    }
    if (data.stunDuration) {
      kaitenFx.stunTimer = Math.max(kaitenFx.stunTimer || 0, data.stunDuration);
      addDamageText(fxCenterX, groundY - 240, `⚡ 기절 [${data.stunDuration.toFixed(1)}s]`, '#facc15');
    }
    if (data.critResistDebuff) {
      kaitenFx.critDmgResistDebuff = data.critResistDebuff;
      kaitenFx.critDmgResistDebuffTimer = 10.0;
      addDamageText(fxCenterX, groundY - 240, `🎯 치저 -${data.critResistDebuff}%!`, '#fb923c');
    }
    if (data.atkDebuffRatio) {
      kaitenFx.atkDebuffTimer = data.atkDebuffTimer || 10.0;
      kaitenFx.atkDebuffRatio = data.atkDebuffRatio;
      addDamageText(fxCenterX, groundY - 210, `🔻 [ATK -${Math.round(data.atkDebuffRatio * 100)}%]`, '#38bdf8');
    }
    if (kaitenFx.hp <= 0) {
      kaitenFx.hp = 0;
      kaitenFx.isDead = true;
      addDamageText(fxCenterX, groundY - 250, '🎉 KAITEN FX Mk.0 격파 성공! MISSION COMPLETE!', '#10b981');
    }
  }
}

// 1P 호스트가 생성한 적 탄환을 2P 게스트의 bullets 배열에 동기화 복제하는 함수
function handleEnemyBulletNetPacket(data) {
  if (myRole !== 'striker' && data.bullet) {
    data.bullet.isEnemyBullet = true;
    bullets.push(data.bullet);
  }
}

// 실시간 인게임 동기화 데이터 수신 처리 (대칭 2인 스트라이커)
function handleInGameSync(data) {
  if (currentGameState !== 'battle') return;

  // 동료 스트라이커(remotePlayer) 상태 수신 동기화
  if (data.strikerPlayer) {
    const sp = data.strikerPlayer;
    remotePlayer.isActive = true;
    remotePlayer.x = sp.x;
    remotePlayer.y = sp.y;
    remotePlayer.vx = sp.vx;
    remotePlayer.vy = sp.vy;
    remotePlayer.hp = sp.hp;
    remotePlayer.maxHp = sp.maxHp || 10000;
    remotePlayer.cost = sp.cost;
    remotePlayer.maxCost = sp.maxCost || 15;
    remotePlayer.facing = sp.facing;
    remotePlayer.activeWeaponSlot = sp.activeWeaponSlot;
    if (sp.mainWeaponId && remotePlayer.mainWeapon) {
      remotePlayer.mainWeapon.id = sp.mainWeaponId;
    }
    if (sp.subWeaponId && remotePlayer.subWeapon) {
      remotePlayer.subWeapon.id = sp.subWeaponId;
    }
    remotePlayer.isRunning = sp.isRunning;
    remotePlayer.isDashing = sp.isDashing;
    remotePlayer.isChargingSkill = sp.isChargingSkill || false;
    remotePlayer.chargeTimer = sp.chargeTimer || 0;
    remotePlayer.chargeLevel = sp.chargeLevel || 1;
    remotePlayer.sgSkillActive = sp.sgSkillActive || false;
    remotePlayer.sgSkillShotsLeft = sp.sgSkillShotsLeft || 0;
    remotePlayer.isFiringSkill = sp.isFiringSkill || false;
    remotePlayer.sgTorrentCharging = sp.sgTorrentCharging || false;
    remotePlayer.sgTorrentChargeTimer = sp.sgTorrentChargeTimer || 0;
    remotePlayer.sgTorrentFiring = sp.sgTorrentFiring || false;
    remotePlayer.sgTorrentShotsLeft = sp.sgTorrentShotsLeft || 0;
    remotePlayer.rgAwakeStage = sp.rgAwakeStage || 0;
    remotePlayer.rgAwakeCharging = sp.rgAwakeCharging || false;
    remotePlayer.rgAwakeChargeTimer = sp.rgAwakeChargeTimer || 0;
    remotePlayer.rgAwakeChargeMax = sp.rgAwakeChargeMax || 0.5;
    remotePlayer.rgAwakeChargeType = sp.rgAwakeChargeType || 'stage';
    remotePlayer.rgAwakeFiring = sp.rgAwakeFiring || false;
    remotePlayer.rgAwakeLaserTimer = sp.rgAwakeLaserTimer || 0;
    remotePlayer.rgAwakeFacing = sp.rgAwakeFacing || remotePlayer.facing;
    remotePlayer.mgStanceActive = sp.mgStanceActive || false;
    remotePlayer.mgStanceTransitioning = sp.mgStanceTransitioning || false;
    remotePlayer.mgStanceTransitionTimer = sp.mgStanceTransitionTimer || 0;
    remotePlayer.mgStanceTimer = sp.mgStanceTimer || 0;
    remotePlayer.mgStanceShotStage = sp.mgStanceShotStage || 0;
    remotePlayer.mgStanceShotDelay = sp.mgStanceShotDelay || 0;
    remotePlayer.isFiringSpecial = sp.isFiringSpecial || false;
    remotePlayer.specialTimer = sp.specialTimer || 0;
    remotePlayer.specialPhase = sp.specialPhase || 1;
    remotePlayer.specialIsBerserk = sp.specialIsBerserk || false;
    remotePlayer.spentCostTotal = sp.spentCostTotal || 0;
    remotePlayer.isAbiEshuhActive = sp.isAbiEshuhActive || false;
    remotePlayer.abiTransforming = sp.abiTransforming || false;
    remotePlayer.isHovering = sp.isHovering || false;
    remotePlayer.abiBarrageFiring = sp.abiBarrageFiring || false;
    remotePlayer.abiFinalPhase = sp.abiFinalPhase || 'none';
    remotePlayer.abiStunTimer = sp.abiStunTimer || 0;
    remotePlayer.stunTimer = sp.stunTimer || 0;
    remotePlayer.isImmortalActive = sp.isImmortalActive || false;
    remotePlayer.isTacticalDefActive = sp.isTacticalDefActive || false;
    remotePlayer.tacticalShield = sp.tacticalShield || 0;
    remotePlayer.isColorActive = sp.isColorActive || false;
  }

  // 총알 생성 동기화 (상대방이 쏜 총알 내 화면에 복제 생성)
  if (data.bulletEvent) {
    const b = data.bulletEvent;
    b.isPeerBullet = true;
    b.peerColor = (myRole === 'striker') ? '#f43f5e' : '#38bdf8';
    bullets.push(b);
    if (b.type === 'mg_special_bullet' && typeof specialParticles !== 'undefined') {
      specialParticles.push({
        type: 'casing',
        x: b.x,
        y: b.y - 4,
        vx: -(b.vx > 0 ? 1 : -1) * (Math.random() * 4.5 + 3.0),
        vy: -(Math.random() * 5.5 + 4.5),
        gravity: 0.48,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.55,
        width: 7,
        height: 3.5,
        color: b.isBerserk ? '#fde047' : '#facc15',
        life: 42,
        maxLife: 42,
        alpha: 1
      });
      const sCount = b.isBerserk ? 5 : 3;
      for (let s = 0; s < sCount; s++) {
        const sAngle = (b.angle || 0) + (Math.random() - 0.5) * 0.65;
        const sSpeed = Math.random() * 14 + 10;
        specialParticles.push({
          type: 'spark',
          x: b.x + (Math.random() - 0.5) * 6,
          y: b.y + (Math.random() - 0.5) * 6,
          vx: Math.cos(sAngle) * sSpeed,
          vy: Math.sin(sAngle) * sSpeed,
          color: b.isBerserk ? (Math.random() < 0.5 ? '#ffffff' : '#f5d0fe') : (Math.random() < 0.4 ? '#ffffff' : (b.color || '#c084fc')),
          size: Math.random() * 2.5 + 1.5,
          life: Math.floor(Math.random() * 12 + 10),
          maxLife: 22,
          alpha: 1
        });
      }
    }
  }

  // 복수 총알 일괄 동기화 (SG 산탄 등)
  if (data.bulletEvents && Array.isArray(data.bulletEvents)) {
    data.bulletEvents.forEach(b => {
      b.isPeerBullet = true;
      b.peerColor = (myRole === 'striker') ? '#f43f5e' : '#38bdf8';
      bullets.push(b);
    });
  }



  // 보스 카이텐저 동기화 (호스트가 계산하여 게스트에게 전송)
  if (myRole !== 'striker' && data.kaitenzers) {
    if (data.isPhase1Retreating !== undefined) isPhase1Retreating = data.isPhase1Retreating;
    if (data.isPhase2Active !== undefined) isPhase2Active = data.isPhase2Active;
    data.kaitenzers.forEach(kData => {
      const localK = kaitenzers.find(k => k.id === kData.id);
      if (localK) {
        localK.x = kData.x;
        localK.hp = kData.hp;
        localK.isSpawned = kData.isSpawned;
        localK.isDead = kData.isDead;
        localK.isActive = kData.isActive;
        localK.jumpY = kData.jumpY;
        localK.isRetreating = kData.isRetreating || false;
        if (kData.laserState !== undefined) localK.laserState = kData.laserState;
        if (kData.laserTargetX !== undefined) localK.laserTargetX = kData.laserTargetX;
        if (kData.laserTargetY !== undefined) localK.laserTargetY = kData.laserTargetY;
      }
    });
  }

  // 2페이즈 거대 로봇 보스 KAITEN FX 동기화 (호스트 -> 게스트)
  if (myRole !== 'striker' && data.kaitenFxSync && typeof kaitenFx !== 'undefined') {
    const fx = data.kaitenFxSync;
    kaitenFx.hp = fx.hp;
    kaitenFx.maxHp = fx.maxHp;
    kaitenFx.x = fx.x;
    kaitenFx.y = fx.y;
    kaitenFx.facing = fx.facing;
    kaitenFx.isSpawned = fx.isSpawned;
    kaitenFx.isDead = fx.isDead;
    kaitenFx.introState = fx.introState;
    kaitenFx.activePart = fx.activePart;
    kaitenFx.shieldActive = fx.shieldActive;
    kaitenFx.shieldHitCount = fx.shieldHitCount;
    kaitenFx.stunTimer = fx.stunTimer;
    kaitenFx.currentAction = fx.currentAction;
    kaitenFx.actionTimer = fx.actionTimer;
    if (fx.parts && kaitenFx.parts) {
      for (const [pKey, pVal] of Object.entries(fx.parts)) {
        if (kaitenFx.parts[pKey]) {
          kaitenFx.parts[pKey].hp = pVal.hp;
          kaitenFx.parts[pKey].isBroken = pVal.isBroken;
        }
      }
    }
  }
}

// 매 프레임 인게임 상태 송신 (약 40fps 대역폭 최적화 전송)
let lastNetSyncTime = 0;
function sendInGameSync(now) {
  if (currentGameState !== 'battle' || currentMode !== 'duo') return;
  if (now - lastNetSyncTime < 25) return;
  lastNetSyncTime = now;

  const myStrikerPacket = {
    x: player.x,
    y: player.y,
    vx: player.vx,
    vy: player.vy,
    hp: player.hp,
    maxHp: player.maxHp,
    cost: player.cost,
    maxCost: player.maxCost,
    facing: player.facing,
    activeWeaponSlot: player.activeWeaponSlot,
    mainWeaponId: player.mainWeapon ? player.mainWeapon.id : 'mg_destructor',
    subWeaponId: player.subWeapon ? player.subWeapon.id : 'hg_sidearm',
    isRunning: player.isRunning,
    isDashing: player.isDashing,
    isChargingSkill: player.isChargingSkill,
    chargeTimer: player.chargeTimer,
    chargeLevel: player.chargeLevel,
    isLightBeActive: player.isLightBeActive,
    sgSkillActive: player.sgSkillActive || false,
    sgSkillShotsLeft: player.sgSkillShotsLeft || 0,
    isFiringSkill: player.isFiringSkill || false,
    sgTorrentCharging: player.sgTorrentCharging || false,
    sgTorrentChargeTimer: player.sgTorrentChargeTimer || 0,
    sgTorrentFiring: player.sgTorrentFiring || false,
    sgTorrentShotsLeft: player.sgTorrentShotsLeft || 0,
    rgAwakeStage: player.rgAwakeStage || 0,
    rgAwakeCharging: player.rgAwakeCharging || false,
    rgAwakeChargeTimer: player.rgAwakeChargeTimer || 0,
    rgAwakeChargeMax: player.rgAwakeChargeMax || 0.5,
    rgAwakeChargeType: player.rgAwakeChargeType || 'stage',
    rgAwakeFiring: player.rgAwakeFiring || false,
    rgAwakeLaserTimer: player.rgAwakeLaserTimer || 0,
    rgAwakeFacing: player.rgAwakeFacing || player.facing,
    mgStanceActive: player.mgStanceActive || false,
    mgStanceTransitioning: player.mgStanceTransitioning || false,
    mgStanceTransitionTimer: player.mgStanceTransitionTimer || 0,
    mgStanceTimer: player.mgStanceTimer || 0,
    mgStanceShotStage: player.mgStanceShotStage || 0,
    mgStanceShotDelay: player.mgStanceShotDelay || 0,
    isFiringSpecial: player.isFiringSpecial || false,
    specialTimer: player.specialTimer || 0,
    specialPhase: player.specialPhase || 1,
    specialIsBerserk: player.specialIsBerserk || false,
    spentCostTotal: player.spentCostTotal || 0,
    isAbiEshuhActive: player.isAbiEshuhActive || false,
    abiTransforming: player.abiTransforming || false,
    isHovering: player.isHovering || false,
    abiBarrageFiring: player.abiBarrageFiring || false,
    abiFinalPhase: player.abiFinalPhase || 'none',
    abiStunTimer: player.abiStunTimer || 0,
    stunTimer: player.stunTimer || 0,
    isImmortalActive: player.isImmortalActive || false,
    isTacticalDefActive: player.isTacticalDefActive || false,
    tacticalShield: player.tacticalShield || 0,
    isColorActive: player.isColorActive || false
  };

  if (myRole === 'striker') {
    // 1P 호스트: 내 스트라이커 상태 + 보스 카이텐저 5인 상태 + 2페이즈 로봇 보스 상태 전송
    const kSyncData = kaitenzers.map(k => ({
      id: k.id,
      x: k.x,
      hp: k.hp,
      isSpawned: k.isSpawned,
      isDead: k.isDead,
      isActive: k.isActive,
      jumpY: k.jumpY,
      isRetreating: k.isRetreating || false,
      laserState: k.laserState,
      laserTargetX: k.laserTargetX,
      laserTargetY: k.laserTargetY
    }));

    let fxSyncData = null;
    if (typeof kaitenFx !== 'undefined' && kaitenFx.isSpawned) {
      fxSyncData = {
        hp: kaitenFx.hp,
        maxHp: kaitenFx.maxHp,
        x: kaitenFx.x,
        y: kaitenFx.y,
        facing: kaitenFx.facing,
        isSpawned: kaitenFx.isSpawned,
        isDead: kaitenFx.isDead,
        introState: kaitenFx.introState,
        activePart: kaitenFx.activePart,
        shieldActive: kaitenFx.shieldActive,
        shieldHitCount: kaitenFx.shieldHitCount,
        stunTimer: kaitenFx.stunTimer,
        currentAction: kaitenFx.currentAction,
        actionTimer: kaitenFx.actionTimer,
        parts: {}
      };
      if (kaitenFx.parts) {
        for (const [pKey, pVal] of Object.entries(kaitenFx.parts)) {
          fxSyncData.parts[pKey] = {
            hp: pVal.hp,
            maxHp: pVal.maxHp,
            isBroken: pVal.isBroken
          };
        }
      }
    }

    sendNetPacket({
      type: 'SYNC',
      strikerPlayer: myStrikerPacket,
      isPhase1Retreating: isPhase1Retreating,
      isPhase2Active: isPhase2Active,
      kaitenzers: kSyncData,
      kaitenFxSync: fxSyncData
    });
  } else {
    // 2P 게스트: 내 스트라이커 상태 전송
    sendNetPacket({
      type: 'SYNC',
      strikerPlayer: myStrikerPacket
    });
  }
}
