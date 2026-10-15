const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const WebSocket = require('ws');

const PORT = 8080;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// 1. HTTP 웹서버 (같은 와이파이 파일 전송)
const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(BASE_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + reqPath);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

// 2. 실시간 웹소켓 중계 서버 (방 코드 기반 1:1 매칭 & 60FPS 양방향 동기화)
const wss = new WebSocket.Server({ server });

// 방 관리 맵: roomCode -> { host: ws, guest: ws, supporterReady: false }
const rooms = new Map();

wss.on('connection', (ws) => {
  let myRoomCode = null;
  let myRole = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      // [1] 방 생성 (호스트 - 스트라이커)
      if (data.type === 'CREATE_ROOM') {
        myRoomCode = data.roomCode;
        myRole = 'striker';

        if (rooms.has(myRoomCode)) {
          // 기존 방 덮어쓰기 or 갱신
          const existing = rooms.get(myRoomCode);
          if (existing.host && existing.host !== ws) {
            existing.host.close();
          }
        }

        rooms.set(myRoomCode, {
          host: ws,
          guest: null,
          supporterReady: false
        });

        ws.send(JSON.stringify({
          type: 'ROOM_CREATED',
          roomCode: myRoomCode
        }));
        console.log(`[ROOM CREATED] 방 생성: ${myRoomCode} (호스트 접속)`);
      }

      // [2] 방 참가 (게스트 - 2P 스트라이커)
      else if (data.type === 'JOIN_ROOM') {
        const targetRoom = rooms.get(data.roomCode);
        if (!targetRoom) {
          ws.send(JSON.stringify({
            type: 'JOIN_ERROR',
            message: `방 코드 [${data.roomCode}]를 찾을 수 없습니다! 호스트가 방을 먼저 개설했는지 확인하세요.`
          }));
          return;
        }

        myRoomCode = data.roomCode;
        myRole = 'guest_striker';
        targetRoom.guest = ws;
        targetRoom.supporterReady = false;

        // 2P 게스트에게 참가 성공 통보
        ws.send(JSON.stringify({
          type: 'JOIN_SUCCESS',
          roomCode: myRoomCode,
          role: 'guest_striker'
        }));

        // 1P 호스트에게 2P 접속 알림 전송
        if (targetRoom.host && targetRoom.host.readyState === WebSocket.OPEN) {
          targetRoom.host.send(JSON.stringify({
            type: 'PEER_CONNECTED',
            role: 'guest_striker'
          }));
        }
        console.log(`[PEER JOINED] 방 [${myRoomCode}]에 2P 스트라이커 대원 참가 완료!`);
      }

      // [3] 2P 준비 완료 토글
      else if (data.type === 'SUPPORTER_READY' || data.type === 'GUEST_READY') {
        const r = rooms.get(myRoomCode);
        if (r) {
          r.supporterReady = data.ready;
          // 호스트에게 준비 상태 실시간 브로드캐스트
          if (r.host && r.host.readyState === WebSocket.OPEN) {
            r.host.send(JSON.stringify({
              type: 'SUPPORTER_READY_CHANGED',
              ready: data.ready
            }));
          }
        }
      }

      // [4] 호스트 작전 출격 개전 신호 -> 2P 동시 출격!
      else if (data.type === 'DEPLOY_BATTLE') {
        const r = rooms.get(myRoomCode);
        if (r && r.guest && r.guest.readyState === WebSocket.OPEN) {
          r.guest.send(JSON.stringify({
            type: 'DEPLOY_BATTLE_START',
            seed: data.seed
          }));
        }
        console.log(`[DEPLOY] 방 [${myRoomCode}] 작전 개전!`);
      }

      // [5] 실시간 인게임 동기화 데이터, 적 피격(ENEMY_DAMAGE), 적 탄환(ENEMY_BULLET), 장비 교환, 채팅 등 전송
      else {
        const r = rooms.get(myRoomCode);
        if (r) {
          const target = (myRole === 'striker') ? r.guest : r.host;
          if (target && target.readyState === WebSocket.OPEN) {
            const textMsg = (typeof message === 'string') ? message : message.toString('utf-8');
            target.send(textMsg); // 상대방 브라우저로 텍스트 문자열로 전달 (Blob 파싱 에러 원천 차단)
          }
        }
      }

    } catch (e) {
      console.error('Message error:', e);
    }
  });

  ws.on('close', () => {
    if (myRoomCode && rooms.has(myRoomCode)) {
      const r = rooms.get(myRoomCode);
      if (myRole === 'striker') {
        // 호스트 퇴장 시 게스트에게 방 종료 알림
        if (r.guest && r.guest.readyState === WebSocket.OPEN) {
          r.guest.send(JSON.stringify({ type: 'HOST_DISCONNECTED' }));
        }
        rooms.delete(myRoomCode);
        console.log(`[ROOM CLOSED] 호스트 퇴장으로 방 [${myRoomCode}] 닫힘`);
      } else {
        // 서포터 퇴장 시 호스트에게 대기 상태 알림
        r.guest = null;
        r.supporterReady = false;
        if (r.host && r.host.readyState === WebSocket.OPEN) {
          r.host.send(JSON.stringify({ type: 'PEER_DISCONNECTED' }));
        }
        console.log(`[PEER LEFT] 서포터가 방 [${myRoomCode}]에서 퇴장함`);
      }
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  const mainIp = ips[0] || '10.170.146.122';

  console.log(`===============================================`);
  console.log(`🚀 Kaiten City 실시간 P2P 웹소켓 멀티플레이 서버 가동!`);
  console.log(`내 컴퓨터 접속: http://localhost:${PORT}`);
  console.log(`친구 컴퓨터 접속 (같은 공유기/Wi-Fi): http://${mainIp}:${PORT}`);
  console.log(`===============================================`);
});
