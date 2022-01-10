package task

/*
  @Author : lanyulei
*/

import (
	"ferry/pkg/logger"
	"ferry/pkg/task/worker"
)

func Start() {
	// 1. 啟動服務，連接redis
	worker.StartServer()

	// 2. 啟動異步調度
	taskWorker := worker.NewAsyncTaskWorker(10)
	err := taskWorker.Launch()
	if err != nil {
		logger.Errorf("啟動machinery失敗，%v", err.Error())
	}
}
