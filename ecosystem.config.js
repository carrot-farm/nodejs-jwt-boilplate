module.exports = {
  apps: [
    {
      name: 'api-server', // app 이름.
      script: './build/index.js', // 실행 스크립트
      instance: 0, // cpu 갯수 만큼 인스턴스 실행
      exec_mode: 'cluster', // 클러스터 모드
      wait_ready: true, // 프로세스 종료 후 wait 이벤트가 발생하기 까지 기다린다.
      // max_memory_restart : "2G", // 최대 메모리 설정.
      watch: ["build"], // 파일이 변경되면 자동을 재실행.
      ignore_watch: ["node_modules", "static/img", ".git_page", ".vscode"], // 재시작 감시 제외 디렉토리
      watch_potions: {
        followSymlinks: false, // true 시 브라우저에서 링크파일의 경로를 확인가능. 보안상 false.
      },
      listen_timeout: 50000, // wait_ready 시 대기시간.
      kill_timeout: 5000, // SIGKILL 시 대기시간.
      env: { // 개발 환경시 적용될 설정 지정.
        "NODE_ENV" : "development",
      },
      env_production: { // 배포 환경 설정
        "NODE_ENV" : "production",
      }
    }
  ]
};